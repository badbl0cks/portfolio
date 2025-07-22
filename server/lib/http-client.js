import { ProxyAgent } from "undici";

const proxyAgent = new ProxyAgent("http://wireguard:8888");

export const httpFetchClient = {
  get: async (url, headers) => {
    const response = await $fetch(url, {
      method: "GET",
      headers,
      agent: proxyAgent,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gateway GET error:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  post: async (url, body, headers) => {
    const response = await $fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      agent: proxyAgent,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gateway POST error:", errorBody);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }
    return response.json();
  },
};
