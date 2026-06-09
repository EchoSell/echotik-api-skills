import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const serverPath = path.join(repoRoot, "mcp", "server.mjs");
const defaultClaudeConfigPath = path.join(repoRoot, ".mcp.json");
const defaultCodexConfigPath = path.join(os.homedir(), ".codex", "config.toml");
const managedBlockStart = "# >>> echotik-api-assistant >>>";
const managedBlockEnd = "# <<< echotik-api-assistant <<<";

function parseArgs(argv) {
  const args = {
    client: "both",
    baseUrl: process.env.ECHOTIK_BASE_URL || "https://open.echotik.live",
    claudeConfigPath: defaultClaudeConfigPath,
    codexConfigPath: defaultCodexConfigPath
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.split("=", 2);
    const key = rawKey.slice(2);
    const nextValue = inlineValue ?? argv[index + 1];

    switch (key) {
      case "client":
      case "username":
      case "password":
      case "auth-header":
      case "base-url":
      case "claude-config":
      case "codex-config":
        if (inlineValue === undefined) {
          index += 1;
        }
        if (!nextValue || nextValue.startsWith("--")) {
          throw new Error(`Missing value for --${key}`);
        }
        if (key === "client") args.client = nextValue;
        if (key === "username") args.username = nextValue;
        if (key === "password") args.password = nextValue;
        if (key === "auth-header") args.authHeader = nextValue;
        if (key === "base-url") args.baseUrl = nextValue;
        if (key === "claude-config") args.claudeConfigPath = path.resolve(nextValue);
        if (key === "codex-config") args.codexConfigPath = path.resolve(nextValue);
        break;
      default:
        throw new Error(`Unsupported argument: --${key}`);
    }
  }

  return args;
}

function requireRealValue(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required credential: ${name}`);
  }
  const normalized = String(value).trim();
  const lower = normalized.toLowerCase();
  const placeholders = new Set([
    "your_username",
    "your_password",
    "basic base64(username:password)",
    "changeme",
    "replace_me",
    "todo"
  ]);
  if (placeholders.has(lower)) {
    throw new Error(`Refusing to install with placeholder value for ${name}`);
  }
  return normalized;
}

function resolveCredentials(args) {
  const username = args.username ?? process.env.ECHOTIK_USERNAME;
  const password = args.password ?? process.env.ECHOTIK_PASSWORD;
  const authHeader = args.authHeader ?? process.env.ECHOTIK_AUTH_HEADER;

  if (authHeader) {
    return {
      authHeader: requireRealValue("ECHOTIK_AUTH_HEADER", authHeader)
    };
  }

  return {
    username: requireRealValue("ECHOTIK_USERNAME", username),
    password: requireRealValue("ECHOTIK_PASSWORD", password)
  };
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildJsonServerConfig(credentials, baseUrl) {
  const env = {
    ECHOTIK_BASE_URL: baseUrl
  };
  if (credentials.authHeader) {
    env.ECHOTIK_AUTH_HEADER = credentials.authHeader;
  } else {
    env.ECHOTIK_USERNAME = credentials.username;
    env.ECHOTIK_PASSWORD = credentials.password;
  }

  return {
    mcpServers: {
      "echotik-lite": {
        command: "node",
        args: [serverPath],
        env
      }
    }
  };
}

function writeClaudeConfig(filePath, credentials, baseUrl) {
  ensureParentDir(filePath);
  const payload = buildJsonServerConfig(credentials, baseUrl);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function buildCodexBlock(credentials, baseUrl) {
  const lines = [
    managedBlockStart,
    '[mcp_servers.echotik_lite]',
    `command = ${tomlString("node")}`,
    `args = [${tomlString(serverPath)}]`,
    "",
    "[mcp_servers.echotik_lite.env]",
    `ECHOTIK_BASE_URL = ${tomlString(baseUrl)}`
  ];

  if (credentials.authHeader) {
    lines.push(`ECHOTIK_AUTH_HEADER = ${tomlString(credentials.authHeader)}`);
  } else {
    lines.push(`ECHOTIK_USERNAME = ${tomlString(credentials.username)}`);
    lines.push(`ECHOTIK_PASSWORD = ${tomlString(credentials.password)}`);
  }

  lines.push(managedBlockEnd, "");
  return lines.join("\n");
}

function stripManagedBlock(contents) {
  const pattern = new RegExp(
    `${managedBlockStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${managedBlockEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`,
    "g"
  );
  return contents.replace(pattern, "").trimEnd();
}

function writeCodexConfig(filePath, credentials, baseUrl) {
  ensureParentDir(filePath);
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const cleaned = stripManagedBlock(existing);
  const next = cleaned ? `${cleaned}\n\n${buildCodexBlock(credentials, baseUrl)}` : buildCodexBlock(credentials, baseUrl);
  fs.writeFileSync(filePath, next);
}

function main() {
  const args = parseArgs(process.argv);
  const client = String(args.client).toLowerCase();
  if (!["both", "codex", "claude"].includes(client)) {
    throw new Error("--client must be one of: both, codex, claude");
  }

  const credentials = resolveCredentials(args);
  const baseUrl = requireRealValue("ECHOTIK_BASE_URL", args.baseUrl);

  const tasks = [];
  if (client === "both" || client === "claude") {
    writeClaudeConfig(args.claudeConfigPath, credentials, baseUrl);
    tasks.push(`Claude Code project MCP config written to ${args.claudeConfigPath}`);
  }
  if (client === "both" || client === "codex") {
    writeCodexConfig(args.codexConfigPath, credentials, baseUrl);
    tasks.push(`Codex MCP config updated at ${args.codexConfigPath}`);
  }

  process.stdout.write(
    [
      "EchoTik MCP bootstrap complete.",
      ...tasks.map((line) => `- ${line}`),
      "- Restart Codex or Claude Code before the first live EchoTik request."
    ].join("\n") + "\n"
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
