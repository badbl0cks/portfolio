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
    interactionData,
    website,
  } = await readBody(event);

  let phoneNumber;
  try {
    phoneNumber = normalizeAndValidatePhoneNumber(rawPhoneNumber);
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  if (website) {
    throw createError({
      statusCode: 400,
      statusMessage: "Spam detected.",
    });
  }

  if (interactionData) {
    if (interactionData.timeSpent < 3000) {
      throw createError({
        statusCode: 400,
        statusMessage: "Submission too fast.",
      });
    }

    if (
      interactionData.mouseActivity === 0 &&
      interactionData.keyboardActivity === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "No user interaction detected.",
      });
    }
  }

  if (!name || !userMessage || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "All fields are required.",
    });
  }

  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  if (!nameRegex.test(name.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name contains invalid characters or format.",
    });
  }

  if (isRateLimited(phoneNumber)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "You have reached the maximum of 3 messages per week. Please try again later.",
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

  if (userMessage.trim().length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message is too short.",
    });
  }

  const spamKeywords = [
    "viagra",
    "casino",
    "lottery",
    "winner",
    "click here",
    "free money",
    "urgent",
    "limited time",
  ];
  const hasSpamKeywords = spamKeywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword.toLowerCase()),
  );

  if (hasSpamKeywords) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message contains inappropriate content.",
    });
  }

  if (/([a-zA-Z])\1{4,}/.test(userMessage)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message contains excessive repeated characters.",
    });
  }

  const uppercaseRatio =
    (userMessage.match(/[A-Z]/g) || []).length / userMessage.length;
  if (uppercaseRatio > 0.7 && userMessage.length > 10) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message contains excessive uppercase text.",
    });
  }

  if (!config.myPhoneNumber || !config.superSecretSalt) {
    console.error(
      "Server is not fully configured. MY_PHONE_NUMBER and SUPER_SECRET_SALT are required.",
    );
    throw createError({
      statusCode: 500,
      statusMessage: "A server configuration error occurred.",
    });
  }

  const isVerified = verifyTOTP(phoneNumber, config.superSecretSalt, code);
  if (!isVerified) {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Your verification code is invalid or has expired. Please try again.",
    });
  }

  try {
    const finalMessage = `New message from ${name} ( ${phoneNumber} ) via your portfolio:\n\n"${userMessage}"`;

    if (config.androidSmsGatewayBypass === "true") {
      recordSubmission(phoneNumber);
      return { success: true, messageId: "bypassed" };
    }

    const api = createSmsGatewayClient(config);
    const message = {
      phoneNumbers: [config.myPhoneNumber],
      message: finalMessage,
    };

    const state = await api.send(message);

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
