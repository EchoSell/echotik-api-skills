import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
const defaultBaseUrl = "https://open.echotik.live";
const minNodeMajor = 18;

function requireSupportedNodeVersion() {
  const major = Number(process.versions.node.split(".")[0]);
  if (Number.isNaN(major) || major < minNodeMajor) {
    throw new Error(`Node.js >= ${minNodeMajor} is required. Current version: ${process.versions.node}`);
  }
}

function parseArgs(argv) {
  const args = {
    baseUrl: defaultBaseUrl,
    force: false,
    status: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.split("=", 2);
    const key = rawKey.slice(2);

    if (key === "force" || key === "status") {
      args[key] = true;
      continue;
    }

    const nextValue = inlineValue ?? argv[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    if (inlineValue === undefined) {
      index += 1;
    }

    if (key === "username") args.username = nextValue;
    else if (key === "password") args.password = nextValue;
    else if (key === "auth-header") args.authHeader = nextValue;
    else if (key === "base-url") args.baseUrl = nextValue;
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
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    result[key] = value;
  }
  return result;
}

function isPlaceholder(value) {
  if (!value) {
    return true;
  }

  const normalized = String(value).trim().toLowerCase();
  return new Set([
    "",
    "your_username",
    "your_password",
    "basic base64(username:password)",
    "changeme",
    "replace_me",
    "todo"
  ]).has(normalized);
}

function requireRealValue(name, value) {
  if (isPlaceholder(value)) {
    throw new Error(`Missing or placeholder value for ${name}`);
  }
  return String(value).trim();
}

function getStatus(env) {
  const hasUserPass = !isPlaceholder(env.ECHOTIK_USERNAME) && !isPlaceholder(env.ECHOTIK_PASSWORD);
  const hasAuthHeader = !isPlaceholder(env.ECHOTIK_AUTH_HEADER);

  return {
    configured: hasUserPass || hasAuthHeader,
    credentialMode: hasAuthHeader ? "auth_header" : hasUserPass ? "username_password" : "missing",
    envPath,
    baseUrl: env.ECHOTIK_BASE_URL || defaultBaseUrl
  };
}

function printStatus(status) {
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
}

function buildEnvContent(next) {
  const lines = [
    `ECHOTIK_USERNAME=${next.ECHOTIK_USERNAME || ""}`,
    `ECHOTIK_PASSWORD=${next.ECHOTIK_PASSWORD || ""}`,
    "# Optional alternative to username/password:",
    `ECHOTIK_AUTH_HEADER=${next.ECHOTIK_AUTH_HEADER || ""}`,
    `ECHOTIK_BASE_URL=${next.ECHOTIK_BASE_URL || defaultBaseUrl}`
  ];
  return `${lines.join("\n")}\n`;
}

function main() {
  requireSupportedNodeVersion();
  const args = parseArgs(process.argv);
  const currentEnv = parseEnvFile(envPath);

  if (args.status) {
    printStatus(getStatus(currentEnv));
    return;
  }

  const next = {
    ECHOTIK_BASE_URL: requireRealValue("ECHOTIK_BASE_URL", args.baseUrl || currentEnv.ECHOTIK_BASE_URL || defaultBaseUrl)
  };

  if (args.authHeader) {
    next.ECHOTIK_AUTH_HEADER = requireRealValue("ECHOTIK_AUTH_HEADER", args.authHeader);
    next.ECHOTIK_USERNAME = "";
    next.ECHOTIK_PASSWORD = "";
  } else {
    next.ECHOTIK_USERNAME = requireRealValue("ECHOTIK_USERNAME", args.username);
    next.ECHOTIK_PASSWORD = requireRealValue("ECHOTIK_PASSWORD", args.password);
    next.ECHOTIK_AUTH_HEADER = "";
  }

  if (fs.existsSync(envPath) && !args.force) {
    const status = getStatus(currentEnv);
    if (status.configured) {
      throw new Error(
        "Local auth is already configured. Re-run with --force if you want to overwrite the existing .env."
      );
    }
  }

  fs.writeFileSync(envPath, buildEnvContent(next));

  process.stdout.write(
    [
      "EchoTik local auth configuration complete.",
      `- env file: ${envPath}`,
      `- mode: ${next.ECHOTIK_AUTH_HEADER ? "auth_header" : "username_password"}`,
      `- baseUrl: ${next.ECHOTIK_BASE_URL}`,
      "- You can now execute live EchoTik API requests with node ./echotik-api.mjs"
    ].join("\n") + "\n"
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
