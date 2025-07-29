<template>
  <div class="min-h-screen bg-base-200 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-8">
          SMS Gateway Proxy Test
        </h1>

        <!-- Environment Info -->
        <div class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Environment Information</h2>
            <div
              v-if="testData?.environment"
              class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div class="stat bg-base-200 rounded-lg">
                <div class="stat-title">Node Environment</div>
                <div class="stat-value text-lg">
                  {{ testData.environment.nodeEnv || "Unknown" }}
                </div>
              </div>
              <div class="stat bg-base-200 rounded-lg">
                <div class="stat-title">Proxy URL</div>
                <div class="stat-value text-lg">
                  {{ testData.environment.proxyUrl }}
                </div>
              </div>
              <div class="stat bg-base-200 rounded-lg">
                <div class="stat-title">SMS Gateway URL</div>
                <div class="stat-value text-lg">
                  {{ testData.environment.smsGatewayUrl || "Not configured" }}
                </div>
              </div>
              <div class="stat bg-base-200 rounded-lg">
                <div class="stat-title">SMS Bypass Mode</div>
                <div class="stat-value text-lg">
                  {{ testData.environment.smsGatewayBypass || "false" }}
                </div>
              </div>
            </div>
            <div class="text-sm text-base-content/70 mt-4">
              Last Updated:
              {{
                testData?.timestamp
                  ? new Date(testData.timestamp).toLocaleString()
                  : "Never"
              }}
            </div>
          </div>
        </div>

        <!-- Test Controls -->
        <div class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Test Controls</h2>
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                class="btn btn-primary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('all')"
              >
                Run All Tests
              </button>
              <button
                class="btn btn-secondary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('dns')"
              >
                DNS Tests
              </button>
              <button
                class="btn btn-secondary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('connectivity')"
              >
                Connectivity Tests
              </button>
              <button
                class="btn btn-secondary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('sms')"
              >
                SMS Gateway Tests
              </button>
              <button
                class="btn btn-secondary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('httpclient')"
              >
                HTTP Client Tests
              </button>
              <button
                class="btn btn-secondary"
                :class="{ loading: loading }"
                :disabled="loading"
                @click="runTests('proxyagent')"
              >
                Proxy Agent Tests
              </button>
            </div>
            <div v-if="loading" class="text-center">
              <span class="loading loading-spinner loading-lg"></span>
              <p class="mt-2">Running tests...</p>
            </div>
          </div>
        </div>

        <!-- DNS Resolution Tests -->
        <div
          v-if="testData?.tests?.dns"
          class="card bg-base-100 shadow-xl mb-6"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">DNS Resolution Tests</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(test, hostname) in testData.tests.dns"
                :key="hostname"
                class="stat bg-base-200 rounded-lg"
              >
                <div class="stat-title">{{ hostname }}</div>
                <div class="stat-value text-lg flex items-center">
                  <div
                    class="badge mr-2"
                    :class="test.success ? 'badge-success' : 'badge-error'"
                  >
                    {{ test.success ? "✓" : "✗" }}
                  </div>
                  {{ test.success ? "Resolved" : "Failed" }}
                </div>
                <div class="stat-desc">
                  {{
                    test.success ? test.addresses?.address : test.error?.message
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Connectivity Tests -->
        <div
          v-if="testData?.tests?.connectivity"
          class="card bg-base-100 shadow-xl mb-6"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Connectivity Tests</h2>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Via Proxy</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(test, key) in testData.tests.connectivity"
                    :key="key"
                  >
                    <td class="font-mono text-sm">{{ test.url }}</td>
                    <td>
                      <div
                        class="badge"
                        :class="test.useProxy ? 'badge-info' : 'badge-neutral'"
                      >
                        {{ test.useProxy ? "Yes" : "No" }}
                      </div>
                    </td>
                    <td>
                      <div
                        class="badge"
                        :class="test.success ? 'badge-success' : 'badge-error'"
                      >
                        {{ test.success ? "✓" : "✗" }}
                        {{ test.status || "N/A" }}
                      </div>
                    </td>
                    <td>{{ test.responseTime }}ms</td>
                    <td class="text-sm text-error">
                      {{ test.error?.message || "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SMS Gateway Tests -->
        <div
          v-if="testData?.tests?.smsGateway"
          class="card bg-base-100 shadow-xl mb-6"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">SMS Gateway Tests</h2>
            <div
              v-if="testData.tests.smsGateway.error"
              class="alert alert-warning mb-4"
            >
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.664 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{{ testData.tests.smsGateway.error }}</span>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Test Type</th>
                    <th>Via Proxy</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(test, key) in testData.tests.smsGateway"
                    :key="key"
                  >
                    <td class="font-semibold">{{ formatTestName(key) }}</td>
                    <td>
                      <div
                        class="badge"
                        :class="test.useProxy ? 'badge-info' : 'badge-neutral'"
                      >
                        {{ test.useProxy ? "Yes" : "No" }}
                      </div>
                    </td>
                    <td>
                      <div
                        class="badge"
                        :class="test.success ? 'badge-success' : 'badge-error'"
                      >
                        {{ test.success ? "✓" : "✗" }}
                        {{ test.status || "N/A" }}
                      </div>
                    </td>
                    <td>{{ test.responseTime }}ms</td>
                    <td class="text-sm text-error">
                      {{ test.error?.message || "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- HTTP Client Tests -->
        <div
          v-if="testData?.tests?.httpClient"
          class="card bg-base-100 shadow-xl mb-6"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">HTTP Client Library Test</h2>
            <div class="stat bg-base-200 rounded-lg">
              <div class="stat-title">Your HTTP Client</div>
              <div class="stat-value text-lg flex items-center">
                <div
                  class="badge mr-2"
                  :class="
                    testData.tests.httpClient.success
                      ? 'badge-success'
                      : 'badge-error'
                  "
                >
                  {{ testData.tests.httpClient.success ? "✓" : "✗" }}
                </div>
                {{ testData.tests.httpClient.success ? "Working" : "Failed" }}
              </div>
              <div class="stat-desc">
                {{
                  testData.tests.httpClient.success
                    ? "HTTP client successfully made request through proxy"
                    : testData.tests.httpClient.error?.message
                }}
              </div>
            </div>
            <div
              v-if="
                testData.tests.httpClient.success &&
                testData.tests.httpClient.data
              "
              class="mt-4"
            >
              <div class="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium">
                  Response Data
                </div>
                <div class="collapse-content">
                  <pre
                    class="text-sm bg-base-300 p-4 rounded-lg overflow-x-auto"
                    >{{
                      JSON.stringify(testData.tests.httpClient.data, null, 2)
                    }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Proxy Agent Tests -->
        <div
          v-if="testData?.tests?.proxyAgent"
          class="card bg-base-100 shadow-xl mb-6"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Direct Proxy Agent Test</h2>
            <div class="stat bg-base-200 rounded-lg">
              <div class="stat-title">Proxy Agent Direct Test</div>
              <div class="stat-value text-lg flex items-center">
                <div
                  class="badge mr-2"
                  :class="
                    testData.tests.proxyAgent.success
                      ? 'badge-success'
                      : 'badge-error'
                  "
                >
                  {{ testData.tests.proxyAgent.success ? "✓" : "✗" }}
                </div>
                {{ testData.tests.proxyAgent.success ? "Working" : "Failed" }}
              </div>
              <div class="stat-desc">
                {{
                  testData.tests.proxyAgent.success
                    ? "Proxy agent successfully made request"
                    : testData.tests.proxyAgent.error?.message
                }}
              </div>
            </div>
            <div
              v-if="
                testData.tests.proxyAgent.success &&
                testData.tests.proxyAgent.data
              "
              class="mt-4"
            >
              <div class="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium">
                  IP Information (via Proxy)
                </div>
                <div class="collapse-content">
                  <pre
                    class="text-sm bg-base-300 p-4 rounded-lg overflow-x-auto"
                    >{{
                      JSON.stringify(testData.tests.proxyAgent.data, null, 2)
                    }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Summary -->
        <div v-if="hasErrors" class="card bg-base-100 shadow-xl mb-6">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4 text-error">Error Summary</h2>
            <div class="space-y-2">
              <div
                v-for="error in errorSummary"
                :key="error.test"
                class="alert alert-error"
              >
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
                <div>
                  <strong>{{ error.test }}:</strong> {{ error.message }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Data -->
        <div v-if="testData" class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="collapse collapse-arrow">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium">
                Raw Test Data (JSON)
              </div>
              <div class="collapse-content">
                <pre
                  class="text-sm bg-base-300 p-4 rounded-lg overflow-x-auto"
                  >{{ JSON.stringify(testData, null, 2) }}</pre
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const testData = ref(null);
const loading = ref(false);

const hasErrors = computed(() => {
  if (!testData.value?.tests) return false;

  const allTests = [];
  Object.values(testData.value.tests).forEach((testGroup) => {
    if (typeof testGroup === "object" && testGroup !== null) {
      Object.values(testGroup).forEach((test) => {
        if (test && typeof test === "object" && "success" in test) {
          allTests.push(test);
        }
      });
    }
  });

  return allTests.some((test) => !test.success);
});

const errorSummary = computed(() => {
  if (!testData.value?.tests) return [];

  const errors = [];
  Object.entries(testData.value.tests).forEach(([groupName, testGroup]) => {
    if (typeof testGroup === "object" && testGroup !== null) {
      Object.entries(testGroup).forEach(([testName, test]) => {
        if (
          test &&
          typeof test === "object" &&
          "success" in test &&
          !test.success
        ) {
          errors.push({
            test: `${groupName}.${testName}`,
            message: test.error?.message || "Unknown error",
          });
        }
      });
    }
  });

  return errors;
});

const runTests = async (testType = "all") => {
  loading.value = true;
  try {
    const response = await $fetch(`/api/proxy-test?test=${testType}`);
    testData.value = response;
  } catch (error) {
    console.error("Failed to run tests:", error);
    testData.value = {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  } finally {
    loading.value = false;
  }
};

const formatTestName = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
