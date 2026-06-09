const defaultBaseUrl = process.env.ECHOTIK_BASE_URL || "https://open.echotik.live";
const DEFAULT_TIMEOUT_MS = Number(process.env.ECHOTIK_TIMEOUT_MS) || 30000;
const DEFAULT_RETRY_DELAY_MS = Number(process.env.ECHOTIK_RETRY_DELAY_MS) || 500;

function delay(ms) {
  if (!ms || ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getCredentials() {
  const username = process.env.ECHOTIK_USERNAME;
  const password = process.env.ECHOTIK_PASSWORD;
  const authHeader = process.env.ECHOTIK_AUTH_HEADER;
  const isConfigured = Boolean((username && password) || authHeader);
  return {
    username,
    password,
    authHeader,
    isConfigured,
    baseUrl: defaultBaseUrl
  };
}

export function buildAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export async function callEchoTikApi({ path, query = {}, method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS, retryDelayMs = DEFAULT_RETRY_DELAY_MS }) {
  const { username, password, authHeader, isConfigured, baseUrl } = getCredentials();
  if (!isConfigured) {
    throw new Error("Missing EchoTik credentials. Set ECHOTIK_USERNAME and ECHOTIK_PASSWORD, or ECHOTIK_AUTH_HEADER, first.");
  }

  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(","));
    } else if (typeof value === "object") {
      url.searchParams.set(key, JSON.stringify(value));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {
    Authorization: authHeader || buildAuthHeader(username, password),
    Accept: "application/json"
  };

  let payload;
  if (body && method !== "GET") {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const isRealtime = path.includes("/realtime/");
  const maxAttempts = isRealtime ? 2 : 1;
  let lastResponse;
  let lastData;
  let lastText = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      method,
      headers,
      body: payload,
      signal: timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    lastResponse = response;
    lastData = data;
    lastText = text;

    const shouldRetryOnNonZeroCode =
      isRealtime &&
      response.ok &&
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      data.code !== 0 &&
      attempt < maxAttempts;

    if (shouldRetryOnNonZeroCode) {
      // A non-zero realtime code is often transient risk-control/throttling;
      // back off briefly before retrying so the retry is not an instant repeat.
      await delay(retryDelayMs);
      continue;
    }

    if (!response.ok) {
      const message = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      throw new Error(`EchoTik request failed with ${response.status}: ${message}`);
    }

    return {
      status: response.status,
      url: url.toString(),
      attempts: attempt,
      retriedBecauseRealtimeCodeWasNonZero: isRealtime && attempt > 1,
      note:
        isRealtime && attempt > 1
          ? "Realtime endpoint was retried because the prior response returned code != 0. According to project rules, such responses do not consume usage credits."
          : undefined,
      data
    };
  }

  if (!lastResponse.ok) {
    const message = typeof lastData === "string" ? lastData : JSON.stringify(lastData, null, 2);
    throw new Error(`EchoTik request failed with ${lastResponse.status}: ${message}`);
  }

  return {
    status: lastResponse.status,
    url: url.toString(),
    attempts: maxAttempts,
    retriedBecauseRealtimeCodeWasNonZero: isRealtime,
    note: isRealtime ? "Realtime endpoint returned code != 0 after retry. According to project rules, such responses do not consume usage credits." : undefined,
    rawText: lastText,
    data: lastData
  };
}
