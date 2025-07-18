// A shared, in-memory store for tracking submission timestamps.
const submissionTimestamps = new Map();

// The rate-limiting period (1 week in milliseconds).
const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks if a given phone number is currently rate-limited.
 * A phone number is considered rate-limited if a successful submission
 * was recorded within the last week.
 *
 * @param {string} phoneNumber The phone number to check.
 * @returns {boolean} True if the number is rate-limited, false otherwise.
 */
export function isRateLimited(phoneNumber) {
  const lastSubmissionTime = submissionTimestamps.get(phoneNumber);
  if (!lastSubmissionTime) {
    return false; // Not in the map, so not rate-limited.
  }

  // Check if the time elapsed since the last submission is less than one week.
  return Date.now() - lastSubmissionTime < ONE_WEEK_IN_MS;
}

/**
 * Records a successful submission for a given phone number by setting
 * the current timestamp. This will start the 1-week rate-limiting period.
 *
 * @param {string} phoneNumber The phone number to record the submission for.
 */
export function recordSubmission(phoneNumber) {
  submissionTimestamps.set(phoneNumber, Date.now());
}
