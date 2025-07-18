import { verifyTOTP } from "../utils/totp";
import { createSmsGatewayClient } from "../lib/sms-gateway";
import { isRateLimited, recordSubmission } from "../utils/rate-limiter.js";
import { normalizeAndValidatePhoneNumber } from "../utils/phone-validator.js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const {
    name,
    message: userMessage,
    phoneNumber: rawPhoneNumber,
    code,
  } = await readBody(event);

  let phoneNumber;
  try {
    phoneNumber = normalizeAndValidatePhoneNumber(rawPhoneNumber);
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  // --- Input Validation ---
  if (!name || !userMessage || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "All fields are required.",
    });
  }

  // Prevent abuse by checking rate limit before doing anything
  if (isRateLimited(phoneNumber)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "You have already sent a message within the last week. Please try again later.",
    });
  }

  if (userMessage.length > 140) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message cannot be longer than 140 characters.",
    });
  }

  const printableAsciiRegex = /^[\x20-\x7E\n\r]*$/;
  if (!printableAsciiRegex.test(userMessage)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message contains non-ASCII or non-printable characters.",
    });
  }

  // --- Server Configuration Check ---
  if (!config.myPhoneNumber || !config.superSecretSalt) {
    console.error(
      "Server is not fully configured. MY_PHONE_NUMBER and SUPER_SECRET_SALT are required.",
    );
    throw createError({
      statusCode: 500,
      statusMessage: "A server configuration error occurred.",
    });
  }

  // --- Verification ---
  const isVerified = verifyTOTP(phoneNumber, config.superSecretSalt, code);
  if (!isVerified) {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Your verification code is invalid or has expired. Please try again.",
    });
  }

  // --- Send Message ---
  try {
    const api = createSmsGatewayClient(config);
    const finalMessage = `New message from ${name} ( ${phoneNumber} ) via your portfolio:\n\n"${userMessage}"`;
    const message = {
      phoneNumbers: [config.myPhoneNumber],
      message: finalMessage,
    };

    const state = await api.send(message);

    // On success, record the submission time to start the rate-limiting period.
    recordSubmission(phoneNumber);

    return { success: true, messageId: state.id };
  } catch (error) {
    console.error("Failed to send message:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send message.",
    });
  }
});
