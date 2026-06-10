import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const minNodeMajor = 18;

const requiredFiles = [
  "SKILL.md",
  "CLAUDE.md",
  "README.md",
  ".env.example",
  "install.sh",
  "configure-echotik-auth.mjs",
  "search-echotik-docs.mjs",
  "echotik-api.mjs",
  "verify-install.mjs",
  "skills/echotik-api-assistant/SKILL.md",
  ".claude/skills/echotik-api-assistant/SKILL.md",
  "skills/echotik-api-assistant/references/setup-and-auth.md",
  "skills/echotik-api-assistant/references/global-rules.md"
];

function getNodeVersionStatus() {
  const major = Number(process.versions.node.split(".")[0]);
  return {
    current: process.versions.node,
    minimumMajor: minNodeMajor,
    supported: !Number.isNaN(major) && major >= minNodeMajor
  };
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(__dirname, relativePath));
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

function authStatus() {
  const env = parseEnvFile(path.join(__dirname, ".env"));
  const hasUserPass = !isPlaceholder(env.ECHOTIK_USERNAME) && !isPlaceholder(env.ECHOTIK_PASSWORD);
  const hasAuthHeader = !isPlaceholder(env.ECHOTIK_AUTH_HEADER);

  return {
    configured: hasUserPass || hasAuthHeader,
    credentialMode: hasAuthHeader ? "auth_header" : hasUserPass ? "username_password" : "missing",
    baseUrl: env.ECHOTIK_BASE_URL || "https://open.echotik.live"
  };
}

async function docsStatus() {
  try {
    const response = await fetch("https://opendocs.echotik.live/llms.txt", {
      signal: AbortSignal.timeout(10000)
    });
    return {
      ok: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  const node = getNodeVersionStatus();
  const files = requiredFiles.map((relativePath) => ({
    path: relativePath,
    exists: fileExists(relativePath)
  }));

  const missingFiles = files.filter((entry) => !entry.exists).map((entry) => entry.path);
  const auth = authStatus();
  const docs = await docsStatus();
  const installHealthy = node.supported && missingFiles.length === 0;

  const report = {
    cwd: process.cwd(),
    repoRoot: __dirname,
    node,
    files,
    auth,
    docs,
    installHealthy,
    readyForLiveUse: installHealthy && auth.configured
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (!installHealthy) {
    process.exitCode = 1;
  }
}

await main();
