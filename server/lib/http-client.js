/**
 * A simple HTTP client wrapper around the global fetch function.
 * This is used by the android-sms-gateway client.
 */
export const httpFetchClient = {
  get: async (url, headers) => {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gateway GET error:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  post: async (url, body, headers) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
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
  delete: async (url, headers) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gateway DELETE error:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
