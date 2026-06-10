# EchoTik API Skills

Zero-dependency EchoTik skill package for both Codex and Claude Code.

Runtime requirement: `Node.js >= 18`.

License: `MIT`

This repository no longer ships any MCP server, MCP config, SDK dependency, or background service. It is now just:

- skill documentation
- scenario and rule references
- root-level scripts that call the EchoTik HTTP API directly

## What Changed

- no `mcp/` service
- no SDK dependency
- no `npm install`
- no client-specific MCP registration
- live requests run through local scripts that use Node's built-in `fetch`

## GitHub Install Goal

This repo is structured so a user can say:

- `帮我安装这个 skills: https://github.com/xxx/xxx`
- `Install this skill: https://github.com/xxx/xxx`

And the AI can discover the root entrypoints immediately.

Important root files:

- `SKILL.md`
- `CLAUDE.md`
- `install.sh`
- `configure-echotik-auth.mjs`
- `search-echotik-docs.mjs`
- `echotik-api.mjs`
- `verify-install.mjs`

The canonical skill content still lives in:

- `skills/echotik-api-assistant/SKILL.md`

Claude-compatible discovery is also included in:

- `.claude/skills/echotik-api-assistant/SKILL.md`

## Mandatory First Step

Live EchoTik usage is blocked until the local auth configuration is completed.

All commands in this README assume the current working directory is the repository root.

Check status:

```bash
node ./configure-echotik-auth.mjs --status
```

Configure with EchoTik username/password:

```bash
node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>
```

Or configure with a precomputed Basic header:

```bash
node ./configure-echotik-auth.mjs --auth-header 'Basic base64(username:password)'
```

Until this step succeeds, the skill must not execute live API requests.

## Why The Scripts Are In The Root

Yes, for GitHub-installed skills, root-level entry scripts are the safest choice.

Reasons:

- the installer or AI usually sees the repository root first
- root-level commands are easier for Codex and Claude to discover and run
- no extra dependency bootstrap is needed
- the required first-run auth step is explicit and hard to miss

The nested `skills/` and `.claude/skills/` folders are still present because they match the two common skill layouts, but the operational scripts live at the root on purpose.

## Runtime Flow

### 1. Install or clone the repository

Any install path is fine as long as the repository files are available locally.

Recommended GitHub install flow:

```bash
git clone <your-repo-url>
cd echotik-api-skills
./install.sh
```

### 2. Run the mandatory auth configuration

```bash
node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>
```

This script:

- refuses placeholders
- writes local credentials into `.env`
- preserves a simple local shape that both Codex and Claude can use
- marks the skill ready for live requests

### 3. Optionally inspect the docs index

```bash
node ./search-echotik-docs.mjs --query "creator detail"
```

### 4. Optionally run install verification

```bash
node ./verify-install.mjs
```

### 5. Execute a live API request

```bash
node ./echotik-api.mjs \
  --path /api/v3/realtime/influencer/detail \
  --query '{"unique_id":"demo_creator"}'
```

## Auth Model

EchoTik uses Basic Authentication. This repo supports:

- `ECHOTIK_USERNAME` + `ECHOTIK_PASSWORD`
- `ECHOTIK_AUTH_HEADER`

Optional:

- `ECHOTIK_BASE_URL`

Example local config:

- `.env.example`

## AI Behavior Contract

When the skill is active:

1. Identify the user's business goal first.
2. Choose the closest scenario from the skill docs.
3. Ask only for missing high-value inputs.
4. Map those inputs to EchoTik API parameters.
5. If parameter certainty is low, consult the official docs first.
6. Execute with `node ./echotik-api.mjs`.
7. Return business-facing output, not raw API jargon.

## Root Scripts

### `install.sh`

Lightweight helper that prints the required next commands and checks whether Node is available.

### `configure-echotik-auth.mjs`

Mandatory local auth setup script.

Supports:

- `--status`
- `--username`
- `--password`
- `--auth-header`
- `--base-url`
- `--force`

### `search-echotik-docs.mjs`

Fetches the EchoTik docs index and returns simple text matches from:

- `https://opendocs.echotik.live/llms.txt`

### `echotik-api.mjs`

Direct HTTP executor for EchoTik endpoints using local credentials from `.env`.

Supports:

- `--path`
- `--method`
- `--query`
- `--body`
- `--timeout-ms`

### `verify-install.mjs`

Runs a lightweight install smoke check for:

- Node availability
- Node version compatibility
- required root files
- current auth setup status
- docs index reachability

Exit behavior:

- exits `0` when the install is structurally healthy, even if auth is not configured yet
- exits `1` only when the repository is incomplete or the runtime is unsupported

### `smoke-test.mjs`

Maintainer-oriented helper that runs a couple of basic local checks and prints their output.

## Repo Layout

- `SKILL.md`: root install entrypoint for GitHub-based skill installs
- `CLAUDE.md`: repository-level Claude guidance
- `LICENSE`: MIT license for open-source reuse
- `CHANGELOG.md`: repository-level change history
- `.claude/skills/echotik-api-assistant/SKILL.md`: Claude discovery wrapper
- `skills/echotik-api-assistant/SKILL.md`: canonical skill instructions
- `skills/echotik-api-assistant/references/`: business rules and scenarios
- `install.sh`: root install helper
- `configure-echotik-auth.mjs`: mandatory auth setup
- `search-echotik-docs.mjs`: docs lookup helper
- `echotik-api.mjs`: direct EchoTik HTTP executor
- `verify-install.mjs`: install smoke-check helper

## Maintenance

When updating the skill:

1. update the relevant rules under `skills/echotik-api-assistant/references/`
2. update the scenario wording in `skills/echotik-api-assistant/SKILL.md` if behavior changes
3. keep root scripts stable so GitHub installs remain easy for Codex and Claude

## Release Notes

- See `CHANGELOG.md` for repository-level change history.

## License

This repository is released under the `MIT` License. See `LICENSE`.

## Security Rules

- never commit real credentials
- never paste secrets into public chat unless the user explicitly accepts that risk
- prefer local `.env` storage created by `configure-echotik-auth.mjs`
