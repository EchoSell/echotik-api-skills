import test from "node:test";
import assert from "node:assert/strict";
import { buildAuthHeader, callEchoTikApi, getCredentials } from "../mcp/client.mjs";

test("buildAuthHeader uses basic auth format", () => {
  assert.equal(buildAuthHeader("demo", "secret"), "Basic ZGVtbzpzZWNyZXQ=");
});

test("realtime requests retry once when code is non-zero", async () => {
  const originalFetch = global.fetch;
  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;
  const originalBaseUrl = process.env.ECHOTIK_BASE_URL;

  process.env.ECHOTIK_USERNAME = "demo";
  process.env.ECHOTIK_PASSWORD = "secret";
  process.env.ECHOTIK_BASE_URL = "https://open.echotik.live";

  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    const payload = attempts === 1 ? { code: 1001, message: "risk control" } : { code: 0, data: { ok: true } };
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify(payload);
      }
    };
  };

  try {
    const result = await callEchoTikApi({
      path: "/api/v3/realtime/influencer/detail",
      query: { unique_id: "demo_creator" }
    });

    assert.equal(attempts, 2);
    assert.equal(result.attempts, 2);
    assert.equal(result.retriedBecauseRealtimeCodeWasNonZero, true);
    assert.match(result.note, /do not consume usage credits/i);
    assert.equal(result.data.code, 0);
  } finally {
    global.fetch = originalFetch;
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
    if (originalBaseUrl === undefined) delete process.env.ECHOTIK_BASE_URL;
    else process.env.ECHOTIK_BASE_URL = originalBaseUrl;
  }
});

test("precomputed auth header is accepted as a valid credential source", () => {  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;
  const originalAuthHeader = process.env.ECHOTIK_AUTH_HEADER;

  delete process.env.ECHOTIK_USERNAME;
  delete process.env.ECHOTIK_PASSWORD;
  process.env.ECHOTIK_AUTH_HEADER = "Basic ZGVtbzpzZWNyZXQ=";

  try {
    const credentials = getCredentials();
    assert.equal(credentials.isConfigured, true);
    assert.equal(credentials.authHeader, "Basic ZGVtbzpzZWNyZXQ=");
  } finally {
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
    if (originalAuthHeader === undefined) delete process.env.ECHOTIK_AUTH_HEADER;
    else process.env.ECHOTIK_AUTH_HEADER = originalAuthHeader;
  }
});

test("realtime retry waits for the configured backoff delay before retrying", async () => {
  const originalFetch = global.fetch;
  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;

  process.env.ECHOTIK_USERNAME = "demo";
  process.env.ECHOTIK_PASSWORD = "secret";

  const callTimes = [];
  global.fetch = async () => {
    callTimes.push(Date.now());
    const payload = callTimes.length === 1 ? { code: 1001 } : { code: 0, data: { ok: true } };
    return { ok: true, status: 200, async text() { return JSON.stringify(payload); } };
  };

  try {
    await callEchoTikApi({
      path: "/api/v3/realtime/influencer/detail",
      query: { unique_id: "demo_creator" },
      retryDelayMs: 40
    });

    assert.equal(callTimes.length, 2);
    assert.ok(callTimes[1] - callTimes[0] >= 35, "second attempt should occur after the backoff delay");
  } finally {
    global.fetch = originalFetch;
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
  }
});

test("fetch is invoked with an abort signal when a timeout is configured", async () => {
  const originalFetch = global.fetch;
  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;

  process.env.ECHOTIK_USERNAME = "demo";
  process.env.ECHOTIK_PASSWORD = "secret";

  let receivedSignal;
  global.fetch = async (_url, options) => {
    receivedSignal = options.signal;
    return { ok: true, status: 200, async text() { return JSON.stringify({ code: 0, data: {} }); } };
  };

  try {
    await callEchoTikApi({ path: "/api/v3/echotik/influencer/detail", query: {}, timeoutMs: 5000 });
    assert.ok(receivedSignal instanceof AbortSignal, "fetch should receive an AbortSignal");
  } finally {
    global.fetch = originalFetch;
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
  }
});

test("missing credentials raise a setup error before any request", async () => {
  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;
  const originalAuthHeader = process.env.ECHOTIK_AUTH_HEADER;

  delete process.env.ECHOTIK_USERNAME;
  delete process.env.ECHOTIK_PASSWORD;
  delete process.env.ECHOTIK_AUTH_HEADER;

  try {
    await assert.rejects(
      () => callEchoTikApi({ path: "/api/v3/echotik/influencer/detail" }),
      /Missing EchoTik credentials/i
    );
  } finally {
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
    if (originalAuthHeader === undefined) delete process.env.ECHOTIK_AUTH_HEADER;
    else process.env.ECHOTIK_AUTH_HEADER = originalAuthHeader;
  }
});
