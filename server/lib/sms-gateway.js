import Client from "android-sms-gateway";
import { httpFetchClient } from "./http-client";

/**
 * Creates and configures an instance of the android-sms-gateway client.
 * It centralizes the client instantiation and ensures that all necessary
 * configuration for the gateway is present.
 *
 * @param {object} config The runtime configuration object from `useRuntimeConfig`.
 * It should contain `androidSmsGatewayLogin`, `androidSmsGatewayPassword`,
 * and `androidSmsGatewayUrl`.
 * @returns {Client} A configured instance of the SMS gateway client.
 * @throws {Error} If the required gateway configuration is missing, prompting
 * a 500-level error in the calling API endpoint.
 */
export function createSmsGatewayClient(config) {
  const {
    androidSmsGatewayLogin,
    androidSmsGatewayPassword,
    androidSmsGatewayUrl,
  } = config;

  if (
    !androidSmsGatewayLogin ||
    !androidSmsGatewayPassword ||
    !androidSmsGatewayUrl
  ) {
    console.error(
      "SMS Gateway service is not configured. Missing required environment variables for the gateway.",
    );
    throw new Error("Server is not configured for sending SMS.");
  }

  return new Client(
    androidSmsGatewayLogin,
    androidSmsGatewayPassword,
    httpFetchClient,
    androidSmsGatewayUrl,
  );
}
