const submissionTimestamps = new Map();

const otpRequestTimestamps = new Map();

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const MAX_OTP_REQUESTS_PER_HOUR = 3;

const MAX_MESSAGES_PER_WEEK = 3;

/**
 * Checks if a given phone number is currently rate-limited for message submissions.
 * A phone number is considered rate-limited if it has made 3 or more message submissions
 * within the last week.
 *
 * @param {string} phoneNumber The phone number to check.
 * @returns {boolean} True if the number is rate-limited, false otherwise.
 */
export function isRateLimited(phoneNumber) {
  const submissionTimestampsArray = submissionTimestamps.get(phoneNumber);
  if (!submissionTimestampsArray || submissionTimestampsArray.length === 0) {
    return false;
  }

  const now = Date.now();
  const recentSubmissions = submissionTimestampsArray.filter(
    (timestamp) => now - timestamp < ONE_WEEK_IN_MS,
  );

  if (recentSubmissions.length !== submissionTimestampsArray.length) {
    submissionTimestamps.set(phoneNumber, recentSubmissions);
  }

  return recentSubmissions.length >= MAX_MESSAGES_PER_WEEK;
}

/**
 * Records a successful submission for a given phone number by adding
 * the current timestamp to the submission history.
 *
 * @param {string} phoneNumber The phone number to record the submission for.
 */
export function recordSubmission(phoneNumber) {
  const now = Date.now();
  const existingSubmissions = submissionTimestamps.get(phoneNumber) || [];

  const recentSubmissions = existingSubmissions.filter(
    (timestamp) => now - timestamp < ONE_WEEK_IN_MS,
  );
  recentSubmissions.push(now);

  submissionTimestamps.set(phoneNumber, recentSubmissions);
}

/**
 * Checks if a given phone number is currently rate-limited for OTP requests.
 * A phone number is considered rate-limited if it has made 3 or more OTP requests
 * within the last hour.
 *
 * @param {string} phoneNumber The phone number to check.
 * @returns {boolean} True if the number is rate-limited for OTP, false otherwise.
 */
export function isOtpRateLimited(phoneNumber) {
  const requestTimestamps = otpRequestTimestamps.get(phoneNumber);
  if (!requestTimestamps || requestTimestamps.length === 0) {
    return false;
  }

  const now = Date.now();
  const recentRequests = requestTimestamps.filter(
    (timestamp) => now - timestamp < ONE_HOUR_IN_MS,
  );

  if (recentRequests.length !== requestTimestamps.length) {
    otpRequestTimestamps.set(phoneNumber, recentRequests);
  }

  return recentRequests.length >= MAX_OTP_REQUESTS_PER_HOUR;
}

/**
 * Records an OTP request for a given phone number by adding
 * the current timestamp to the request history.
 *
 * @param {string} phoneNumber The phone number to record the OTP request for.
 */
export function recordOtpRequest(phoneNumber) {
  const now = Date.now();
  const existingRequests = otpRequestTimestamps.get(phoneNumber) || [];

  const recentRequests = existingRequests.filter(
    (timestamp) => now - timestamp < ONE_HOUR_IN_MS,
  );
  recentRequests.push(now);

  otpRequestTimestamps.set(phoneNumber, recentRequests);
}
