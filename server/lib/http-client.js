import { ProxyAgent } from "undici";

const proxyAgent = new ProxyAgent("http://wireguard:8888");
const REQUEST_TIMEOUT = 15000;

export const httpFetchClient = {
  get: async (url, headers) => {
    const response = await $fetch(url, {
      method: "GET",
      headers,
      dispatcher: proxyAgent,
      timeout: REQUEST_TIMEOUT,
    });
    return response;
  },
  post: async (url, body, headers) => {
    const response = await $fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      dispatcher: proxyAgent,
      timeout: REQUEST_TIMEOUT,
    });
    return response;
  },
};
