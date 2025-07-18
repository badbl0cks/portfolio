<template>
  <div class="max-w-xl mx-auto">
    <form @submit.prevent="sendTextMessage">
      <!-- Name Input -->
      <div class="form-control mb-4">
        <input
          v-model="userName"
          type="text"
          placeholder="Your Name"
          aria-label="Your Name"
          class="input input-bordered w-full"
          :disabled="isMessageSent"
          required
        />
      </div>

      <!-- Message Textarea -->
      <div class="form-control mb-4">
        <textarea
          v-model="userMessage"
          class="textarea textarea-bordered h-32 w-full"
          placeholder="Your message..."
          aria-label="Your message..."
          :disabled="isMessageSent"
          maxlength="140"
          pattern="^[\x20-\x7E\n\r]*$"
          title="Only printable ASCII characters are allowed."
          required
        ></textarea>
        <div
          class="text-right text-sm mt-1"
          :class="{ 'text-error': userMessage.length > 140 }"
        >
          {{ userMessage.length }} / 140
        </div>
      </div>

      <!-- Phone Number and Verification (conditionally enabled) -->
      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <div class="form-control w-full md:w-1/2">
          <div class="join w-full">
            <input
              v-model="phoneNumber"
              type="tel"
              placeholder="Your Phone Number"
              aria-label="Your Phone Number"
              class="input input-bordered w-full join-item"
              :disabled="!isNameAndMessageEntered || isCodeSent"
              required
            />
            <button
              type="button"
              class="btn btn-secondary join-item"
              :disabled="
                !isNameAndMessageEntered ||
                isPhoneNumberIncomplete ||
                isCodeSent ||
                isSendingCode
              "
              @click="sendCode"
            >
              <span v-if="isSendingCode" class="loading loading-spinner"></span>
              Send Code
            </button>
          </div>
        </div>
        <div class="form-control w-full md:w-1/2">
          <div class="join w-full">
            <input
              v-model="verificationCode"
              type="text"
              placeholder="Verification Code"
              aria-label="Verification Code"
              class="input input-bordered join-item w-full"
              :disabled="!isCodeSent || isVerified"
            />
            <button
              type="button"
              class="btn btn-secondary join-item"
              :disabled="!isCodeSent || isVerified || isVerifying"
              @click="verifyCode"
            >
              <span v-if="isVerifying" class="loading loading-spinner"></span>
              Verify
            </button>
          </div>
        </div>
      </div>

      <!-- Submit and Status Messages -->
      <div class="text-center">
        <div v-if="errorMessage" class="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="isMessageSent" class="alert alert-success mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Text sent successfully! Thanks for reaching out!</span>
        </div>
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="!isVerified || isSendingMessage || isMessageSent"
        >
          <span v-if="isSendingMessage" class="loading loading-spinner"></span>
          Text Me!
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// --- Form State ---
const userName = ref("");
const phoneNumber = ref("");
const verificationCode = ref("");
const userMessage = ref("");

// --- UI State ---
const isSendingCode = ref(false);
const isCodeSent = ref(false);
const isVerifying = ref(false);
const isVerified = ref(false);
const isSendingMessage = ref(false);
const isMessageSent = ref(false);
const errorMessage = ref("");

// --- Computed Properties ---
const isNameAndMessageEntered = computed(() => {
  const printableAsciiRegex = /^[\x20-\x7E\n\r]*$/;
  return (
    userName.value.trim() !== "" &&
    userMessage.value.trim() !== "" &&
    userMessage.value.length <= 140 &&
    printableAsciiRegex.test(userMessage.value)
  );
});

const isPhoneNumberIncomplete = computed(() => {
  // Count only the digits in the phone number
  const digitCount = (phoneNumber.value.match(/\d/g) || []).length;
  return digitCount < 10;
});

// --- Functions ---
const clearError = () => {
  errorMessage.value = "";
};

const sendCode = async () => {
  clearError();
  if (!phoneNumber.value) {
    errorMessage.value = "Please enter a valid phone number.";
    return;
  }
  isSendingCode.value = true;
  try {
    const response = await $fetch("/api/send-otp", {
      method: "POST",
      body: { phoneNumber: phoneNumber.value },
    });
    if (response.success) {
      isCodeSent.value = true;
    } else {
      errorMessage.value = "Failed to send code. Please try again.";
    }
  } catch (error) {
    errorMessage.value =
      error.data?.statusMessage || "An unexpected error occurred.";
  } finally {
    isSendingCode.value = false;
  }
};

const verifyCode = async () => {
  clearError();
  if (!verificationCode.value) {
    errorMessage.value = "Please enter the verification code.";
    return;
  }
  isVerifying.value = true;
  try {
    const response = await $fetch("/api/verify-otp", {
      method: "POST",
      body: {
        code: verificationCode.value,
        phoneNumber: phoneNumber.value,
      },
    });
    if (response.success) {
      isVerified.value = true;
      errorMessage.value = ""; // Clear error on success
    }
  } catch (error) {
    errorMessage.value =
      error.data?.statusMessage || "An unexpected error occurred.";
    isVerified.value = false;
  } finally {
    isVerifying.value = false;
  }
};

const sendTextMessage = async () => {
  clearError();
  if (!isNameAndMessageEntered.value) {
    errorMessage.value =
      "Please fill out your name and a valid message before sending.";
    return;
  }
  isSendingMessage.value = true;

  try {
    const response = await $fetch("/api/send-message", {
      method: "POST",
      body: {
        name: userName.value,
        message: userMessage.value,
        phoneNumber: phoneNumber.value,
        code: verificationCode.value,
      },
    });
    if (response.success) {
      isMessageSent.value = true;
    } else {
      errorMessage.value = "Failed to send message. Please try again later.";
    }
  } catch (error) {
    errorMessage.value =
      error.data?.statusMessage ||
      "An unexpected error occurred while sending your message.";
  } finally {
    isSendingMessage.value = false;
  }
};
</script>
