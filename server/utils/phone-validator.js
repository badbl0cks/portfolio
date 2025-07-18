/**
 * Normalizes and validates a phone number string based on specific rules.
 *
 * The normalization process is as follows:
 * 1. All non-digit characters are stripped from the input string.
 * 2. If the resulting number has a leading '1', it is removed.
 *
 * After normalization, the function validates that the resulting number
 * is exactly 10 digits long.
 *
 * @param {string} rawPhoneNumber The raw phone number string provided by the user.
 * @returns {string} The normalized, 10-digit phone number.
 * @throws {Error} Throws an error if the phone number is invalid after normalization,
 *                 allowing API endpoints to catch it and return a proper HTTP status.
 */
export function normalizeAndValidatePhoneNumber(rawPhoneNumber) {
  if (!rawPhoneNumber || typeof rawPhoneNumber !== "string") {
    throw new Error("Phone number is required.");
  }

  // 1. Strip all non-digit characters.
  const digitsOnly = rawPhoneNumber.replace(/\D/g, "");

  // 2. If the number starts with a '1', remove it.
  let numberToValidate = digitsOnly;
  if (numberToValidate.startsWith("1")) {
    numberToValidate = numberToValidate.substring(1);
  }

  // 3. Check if the resulting number is exactly 10 digits long.
  if (numberToValidate.length !== 10) {
    throw new Error("Please provide a valid 10-digit phone number.");
  }

  return numberToValidate;
}
