import { authenticator } from "otplib";
import { createHash } from "crypto";

authenticator.options = {
  step: 60,
  window: [5, 1],
  digits: 6,
};

/**
 * Derives a stable, stateless secret for a user from their phone number
 * and a global salt.
 * @param {string} phoneNumber The user's phone number.
 * @param {string} salt The global super secret salt.
 * @returns {string} A hex-encoded secret string.
 */
function getUserSecret(phoneNumber, salt) {
  if (!phoneNumber || !salt) {
    throw new Error(
      "Phone number and salt are required to generate a user secret.",
    );
  }
  return createHash("sha256")
    .update(phoneNumber + salt)
    .digest("hex");
}

/**
 * Generates a Time-based One-Time Password (TOTP) for a given phone number.
 * @param {string} phoneNumber The user's phone number.
 * @param {string} salt The global super secret salt.
 * @returns {string} The generated 6-digit OTP.
 */
export function generateTOTP(phoneNumber, salt) {
  const userSecret = getUserSecret(phoneNumber, salt);
  return authenticator.generate(userSecret);
}

/**
 * Verifies a TOTP token submitted by a user.
 * @param {string} phoneNumber The user's phone number.
 * @param {string} salt The global super secret salt.
 * @param {string} token The 6-digit OTP token submitted by the user.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
export function verifyTOTP(phoneNumber, salt, token) {
  const userSecret = getUserSecret(phoneNumber, salt);
  return authenticator.verify({ token, secret: userSecret });
}

/**
 * Get the current TOTP step in seconds.
 * @returns {number} The current TOTP step in seconds.
 */
export function getTOTPstep() {
  return authenticator.options.step;
}
