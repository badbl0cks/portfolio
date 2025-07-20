import { generateTOTP } from "../utils/totp";
import { createSmsGatewayClient } from "../lib/sms-gateway";
import {
  isRateLimited,
  isOtpRateLimited,
  recordOtpRequest,
} from "../utils/rate-limiter.js";
import { normalizeAndValidatePhoneNumber } from "../utils/phone-validator.js";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { phoneNumber: rawPhoneNumber } = await readBody(event);
  let normalizedPhoneNumber;

  try {
    normalizedPhoneNumber = normalizeAndValidatePhoneNumber(rawPhoneNumber);
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  if (isOtpRateLimited(normalizedPhoneNumber)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "You have reached the maximum of 3 verification code requests per hour. Please try again later.",
    });
  }

  if (isRateLimited(normalizedPhoneNumber)) {
    throw createError({
      statusCode: 429,
      statusMessage:
        "You have reached the maximum of 3 messages per week. Please try again later.",
    });
  }

  if (!config.superSecretSalt) {
    console.error("SUPER_SECRET_SALT is not configured on the server.");
    throw createError({
      statusCode: 500,
      statusMessage: "A server configuration error occurred.",
    });
  }

  try {
    const api = createSmsGatewayClient(config);
    const otp = generateTOTP(normalizedPhoneNumber, config.superSecretSalt);
    const step_min = Math.floor(getTOTPstep() / 60);
    const step_sec = getTOTPstep() % 60;

    const message = {
      phoneNumbers: [normalizedPhoneNumber],
      message: `${otp} is your verification code. This code is valid for ${step_min}m${step_sec}s.`,
    };

    const state = await api.send(message);

    recordOtpRequest(normalizedPhoneNumber);

    return { success: true, messageId: state.id };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "An error occurred while trying to send the verification code.",
    });
  }
});
