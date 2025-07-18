// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  css: ["assets/css/main.css"],
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
  ],
  runtimeConfig: {
    androidSmsGatewayUrl: process.env.NUXT_ANDROID_SMS_GATEWAY_URL,
    androidSmsGatewayLogin: process.env.NUXT_ANDROID_SMS_GATEWAY_LOGIN,
    androidSmsGatewayPassword: process.env.NUXT_ANDROID_SMS_GATEWAY_PASSWORD,
    myPhoneNumber: process.env.NUXT_MY_PHONE_NUMBER,
    superSecretSalt: process.env.NUXT_SUPER_SECRET_SALT,

    // Keys within public, will be also exposed to the client-side
    public: {},
  },
});
