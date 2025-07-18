import { verifyTOTP } from "../utils/totp";
import { isRateLimited } from "../utils/rate-limiter.js";
import { normalizeAndValidatePhoneNumber } from "../utils/phone-validator.js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { phoneNumber: rawPhoneNumber, code } = await readBody(event);
  let normalizedPhoneNumber;

  try {
    normalizedPhoneNumber = normalizeAndValidatePhoneNumber(rawPhoneNumber);
  } catch (error) {
    // The validator throws an error with a user-friendly message.
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Verification code is required.",
    });
  }

  // Prevent abuse by checking rate limit before doing anything
  if (isRateLimited(normalizedPhoneNumber)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "You have already sent a message within the last week. Please try again later.",
    });
  }

  // Check for necessary server configuration.
  if (!config.superSecretSalt) {
    console.error("SUPER_SECRET_SALT is not configured on the server.");
    // This is an internal server error, so we don't expose details to the client.
    throw createError({
      statusCode: 500,
      statusMessage: "A server configuration error occurred.",
    });
  }

  const isValid = verifyTOTP(
    normalizedPhoneNumber,
    config.superSecretSalt,
    code,
  );

  if (isValid) {
    // In a stateful app, one might set a session cookie here.
    return { success: true };
  } else {
    // The code is incorrect or has expired.
    throw createError({
      statusCode: 401, // Unauthorized
      statusMessage: "Invalid or expired verification code.",
    });
  }
});
