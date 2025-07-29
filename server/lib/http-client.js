import { ProxyAgent } from "undici";

const proxyAgent = new ProxyAgent("http://wireguard:8888");
const REQUEST_TIMEOUT = 5000;

export const httpFetchClient = {
  get: async (url, headers) => {
    const response = await $fetch(url, {
      method: "GET",
      headers,
      agent: proxyAgent,
      timeout: REQUEST_TIMEOUT,
    });
    return response;
  },
  post: async (url, body, headers) => {
    const response = await $fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      agent: proxyAgent,
      timeout: REQUEST_TIMEOUT,
    });
    return response;
  },
};
