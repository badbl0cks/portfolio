import { httpFetchClient } from "../lib/http-client.js";
import { createSmsGatewayClient } from "../lib/sms-gateway";

async function testEndpoint(url, useProxy = true, options = {}) {
  const startTime = Date.now();
  try {
    let response;

    if (useProxy) {
      if (options.method === "POST") {
        response = await httpFetchClient.post(
          url,
          options.body,
          options.headers,
        );
      } else {
        response = await httpFetchClient.get(url, options.headers);
      }
    } else {
      const fetchOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        timeout: 15000,
        ...options,
      };
      response = await $fetch(url, fetchOptions);
    }

    const endTime = Date.now();

    return {
      success: true,
      url,
      useProxy,
      responseTime: endTime - startTime,
      status: response.status || 200,
      data: response,
      error: null,
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      url,
      useProxy,
      responseTime: endTime - startTime,
      status: error.status || error.statusCode || null,
      data: null,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
  }
}

async function testDNSResolution(hostname) {
  try {
    const dns = await import("dns").then((m) => m.promises);
    const addresses = await dns.lookup(hostname);
    return {
      success: true,
      hostname,
      addresses,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      hostname,
      addresses: null,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const testType = query.test || "all";

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      proxyUrl: "http://wireguard:8888",
      smsGatewayUrl: config.androidSmsGatewayUrl,
      smsGatewayBypass: config.androidSmsGatewayBypass,
    },
    tests: {},
  };

  // DNS Resolution Tests
  if (testType === "all" || testType === "dns") {
    results.tests.dns = {
      wireguard: await testDNSResolution("wireguard"),
      google: await testDNSResolution("google.com"),
      httpbin: await testDNSResolution("httpbin.org"),
    };
  }

  // Basic Connectivity Tests
  if (testType === "all" || testType === "connectivity") {
    results.tests.connectivity = {};

    // Test known good endpoints
    const testEndpoints = [
      "https://httpbin.org/get",
      "https://google.com",
      "https://api.github.com",
    ];

    for (const endpoint of testEndpoints) {
      const endpointKey = endpoint.replace(/[^a-zA-Z0-9]/g, "_");
      results.tests.connectivity[`${endpointKey}_direct`] = await testEndpoint(
        endpoint,
        false,
      );
      results.tests.connectivity[`${endpointKey}_proxy`] = await testEndpoint(
        endpoint,
        true,
      );
    }
  }

  // SMS Gateway Specific Tests
  if (testType === "all" || testType === "sms") {
    results.tests.smsGateway = {};

    if (config.androidSmsGatewayUrl) {
      const smsUrl = config.androidSmsGatewayUrl;

      // Test SMS gateway health endpoint
      const healthUrl = `${smsUrl}/health`;
      results.tests.smsGateway.health_proxy = await testEndpoint(
        healthUrl,
        true,
      );

      // Test with authentication headers
      if (config.androidSmsGatewayLogin && config.androidSmsGatewayPassword) {
        const authHeaders = {
          Authorization: `Basic ${Buffer.from(`${config.androidSmsGatewayLogin}:${config.androidSmsGatewayPassword}`).toString("base64")}`,
        };

        // Test authenticated status endpoint (this simulates real SMS gateway usage)
        results.tests.smsGateway.auth_status_proxy = await testEndpoint(
          smsUrl + "/device",
          true,
          { headers: authHeaders },
        );

        const api = createSmsGatewayClient(config);
        const message = {
          phoneNumbers: ["2067452154"],
          message: `Testing 1 2 3...`,
        };
        const startTime = Date.now();
        try {
          const msg_id = (await api.send(message)).id;
          await new Promise((r) => setTimeout(r, 3000));
          const state = await api.getState(msg_id);
          const endTime = Date.now();

          results.tests.smsGateway.auth_api_send_msg = {
            success: true,
            url: null,
            useProxy: true,
            responseTime: endTime - startTime,
            status: state.state,
            data: "msg_id: " + state.id,
            error: null,
          };
        } catch (error) {
          const endTime = Date.now();
          results.tests.smsGateway.auth_api_send_msg = {
            success: false,
            url: null,
            useProxy: true,
            responseTime: endTime - startTime,
            status: error.status || error.statusCode || null,
            data: null,
            error: {
              message: error.message,
              code: error.code,
              name: error.name,
              stack:
                process.env.NODE_ENV === "development"
                  ? error.stack
                  : undefined,
            },
          };
        }
      } else {
        results.tests.smsGateway.auth_error =
          "SMS Gateway credentials not configured";
      }
    } else {
      results.tests.smsGateway.error = "SMS Gateway URL not configured";
    }
  }

  // HTTP Client Library Test
  if (testType === "all" || testType === "httpclient") {
    results.tests.httpClient = {};

    try {
      // Test using your existing http client
      const testResult = await httpFetchClient.get("https://httpbin.org/get");

      results.tests.httpClient.success = true;
      results.tests.httpClient.data = testResult;
      results.tests.httpClient.error = null;
    } catch (error) {
      results.tests.httpClient.success = false;
      results.tests.httpClient.data = null;
      results.tests.httpClient.error = {
        message: error.message,
        code: error.code,
        stack: error.stack,
      };
    }
  }

  // Proxy Agent Direct Test (using httpFetchClient)
  if (testType === "all" || testType === "proxyagent") {
    results.tests.proxyAgent = {};

    try {
      // Test proxy agent using httpFetchClient (which uses ProxyAgent internally)
      const response = await httpFetchClient.get("https://httpbin.org/ip");

      results.tests.proxyAgent.success = true;
      results.tests.proxyAgent.data = response;
      results.tests.proxyAgent.error = null;
    } catch (error) {
      results.tests.proxyAgent.success = false;
      results.tests.proxyAgent.data = null;
      results.tests.proxyAgent.error = {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      };
    }
  }

  return results;
});
