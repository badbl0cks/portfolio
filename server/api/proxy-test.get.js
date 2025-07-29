import { ProxyAgent } from "undici";
import { httpFetchClient } from "../lib/http-client.js";

const proxyAgent = new ProxyAgent("http://wireguard:8888");

async function testEndpoint(url, useProxy = true, options = {}) {
  const startTime = Date.now();
  try {
    const fetchOptions = {
      method: options.method || "GET",
      headers: options.headers || {},
      ...options,
    };

    if (useProxy) {
      fetchOptions.agent = proxyAgent;
    }

    const response = await $fetch(url, fetchOptions);
    const endTime = Date.now();
    
    return {
      success: true,
      url,
      useProxy,
      responseTime: endTime - startTime,
      status: response.status || 200,
      data: response,
      error: null
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      url,
      useProxy,
      responseTime: endTime - startTime,
      status: error.status || null,
      data: null,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    };
  }
}

async function testDNSResolution(hostname) {
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.lookup(hostname);
    return {
      success: true,
      hostname,
      addresses,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      hostname,
      addresses: null,
      error: {
        message: error.message,
        code: error.code
      }
    };
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const testType = query.test || 'all';
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      proxyUrl: "http://wireguard:8888",
      smsGatewayUrl: config.androidSmsGatewayUrl,
      smsGatewayBypass: config.androidSmsGatewayBypass
    },
    tests: {}
  };

  // DNS Resolution Tests
  if (testType === 'all' || testType === 'dns') {
    results.tests.dns = {
      wireguard: await testDNSResolution('wireguard'),
      google: await testDNSResolution('google.com'),
      httpbin: await testDNSResolution('httpbin.org')
    };
  }

  // Basic Connectivity Tests
  if (testType === 'all' || testType === 'connectivity') {
    results.tests.connectivity = {};
    
    // Test known good endpoints
    const testEndpoints = [
      'https://httpbin.org/get',
      'https://google.com',
      'https://api.github.com'
    ];

    for (const endpoint of testEndpoints) {
      const endpointKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
      results.tests.connectivity[`${endpointKey}_direct`] = await testEndpoint(endpoint, false);
      results.tests.connectivity[`${endpointKey}_proxy`] = await testEndpoint(endpoint, true);
    }
  }

  // SMS Gateway Specific Tests
  if (testType === 'all' || testType === 'sms') {
    results.tests.smsGateway = {};
    
    if (config.androidSmsGatewayUrl) {
      // Test basic connectivity to SMS gateway
      const smsUrl = config.androidSmsGatewayUrl;
      results.tests.smsGateway.proxy = await testEndpoint(smsUrl, true);
      
      // Test SMS gateway health endpoint if available
      const healthUrl = `${smsUrl}/health`;
      results.tests.smsGateway.health_proxy = await testEndpoint(healthUrl, true);
      
      // Test with authentication headers
      if (config.androidSmsGatewayLogin && config.androidSmsGatewayPassword) {
        const authHeaders = {
          'Authorization': `Basic ${Buffer.from(`${config.androidSmsGatewayLogin}:${config.androidSmsGatewayPassword}`).toString('base64')}`
        };
        
        results.tests.smsGateway.auth_direct = await testEndpoint(smsUrl, false, { headers: authHeaders });
        results.tests.smsGateway.auth_proxy = await testEndpoint(smsUrl, true, { headers: authHeaders });
      }
    } else {
      results.tests.smsGateway.error = "SMS Gateway URL not configured";
    }
  }

  // HTTP Client Library Test
  if (testType === 'all' || testType === 'httpclient') {
    results.tests.httpClient = {};
    
    try {
      // Test using your existing http client
      const testResult = await httpFetchClient.get('https://httpbin.org/get', {
        'User-Agent': 'Portfolio-Proxy-Test/1.0'
      });
      
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

  // Proxy Agent Direct Test
  if (testType === 'all' || testType === 'proxyagent') {
    results.tests.proxyAgent = {};
    
    try {
      // Test proxy agent directly
      const response = await $fetch('https://httpbin.org/ip', {
        agent: proxyAgent,
        headers: {
          'User-Agent': 'Portfolio-Proxy-Test/1.0'
        }
      });
      
      results.tests.proxyAgent.success = true;
      results.tests.proxyAgent.data = response;
      results.tests.proxyAgent.error = null;
    } catch (error) {
      results.tests.proxyAgent.success = false;
      results.tests.proxyAgent.data = null;
      results.tests.proxyAgent.error = {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
    }
  }

  return results;
});
