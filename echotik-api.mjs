import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
const defaultBaseUrl = "https://open.echotik.live";
const defaultTimeoutMs = 30000;
const minNodeMajor = 18;

function requireSupportedNodeVersion() {
  const major = Number(process.versions.node.split(".")[0]);
  if (Number.isNaN(major) || major < minNodeMajor) {
    throw new Error(`Node.js >= ${minNodeMajor} is required. Current version: ${process.versions.node}`);
  }
}

function parseArgs(argv) {
  const args = {
    method: "GET",
    timeoutMs: defaultTimeoutMs
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.split("=", 2);
    const key = rawKey.slice(2);
    const nextValue = inlineValue ?? argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    if (inlineValue === undefined) {
      index += 1;
    }

    if (key === "path") args.path = nextValue;
    else if (key === "method") args.method = nextValue.toUpperCase();
    else if (key === "query") args.query = nextValue;
    else if (key === "body") args.body = nextValue;
    else if (key === "timeout-ms") args.timeoutMs = Number(nextValue);
    else throw new Error(`Unsupported argument: --${key}`);
  }

  return args;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const result = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }
    result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return result;
}

function isPlaceholder(value) {
  if (!value) {
    return true;
  }
  return new Set([
    "",
    "your_username",
    "your_password",
    "basic base64(username:password)",
    "changeme",
    "replace_me",
    "todo"
  ]).has(String(value).trim().toLowerCase());
}

function buildAuthHeader(env) {
  if (!isPlaceholder(env.ECHOTIK_AUTH_HEADER)) {
    return env.ECHOTIK_AUTH_HEADER;
  }
  if (!isPlaceholder(env.ECHOTIK_USERNAME) && !isPlaceholder(env.ECHOTIK_PASSWORD)) {
    return `Basic ${Buffer.from(`${env.ECHOTIK_USERNAME}:${env.ECHOTIK_PASSWORD}`).toString("base64")}`;
  }
  throw new Error(
    "EchoTik auth is not configured. Run node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD> first."
  );
}

function parseJsonFlag(label, value) {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Invalid JSON for ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function appendQuery(url, query) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
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
}

async function main() {
  requireSupportedNodeVersion();
  const args = parseArgs(process.argv);
  if (!args.path) {
    throw new Error("Missing required argument: --path");
  }
  if (!args.path.startsWith("/api/")) {
    throw new Error("--path must start with /api/");
  }

  const env = parseEnvFile(envPath);
  const baseUrl = env.ECHOTIK_BASE_URL || defaultBaseUrl;
  const authHeader = buildAuthHeader(env);
  const query = parseJsonFlag("--query", args.query);
  const body = parseJsonFlag("--body", args.body);

  const url = new URL(args.path, baseUrl);
  appendQuery(url, query);

  const headers = {
    Accept: "application/json",
    Authorization: authHeader
  };

  const options = {
    method: args.method,
    headers,
    signal: args.timeoutMs > 0 ? AbortSignal.timeout(args.timeoutMs) : undefined
  };

  if (body !== undefined && args.method !== "GET") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  const result = {
    ok: response.ok,
    status: response.status,
    url: url.toString(),
    method: args.method,
    data: parsed
  };

  if (!response.ok) {
    process.stderr.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
