---
name: echotik-api-assistant
description: Installable EchoTik API skill entrypoint for Codex and Claude Code. Route natural-language TikTok commerce requests into direct EchoTik HTTP workflows, and require local auth configuration before the first live request.
---

# EchoTik API Assistant

This root entrypoint exists so GitHub installs work cleanly in both Codex and Claude Code.

All commands in this repository must be run from the repository root unless a file explicitly says otherwise.

## Mandatory Setup Gate

Before any live EchoTik request:

1. Check local auth status with `node ./configure-echotik-auth.mjs --status`.
2. If credentials are missing, stop live execution.
3. Require the user to finish local auth setup with one of these commands:
   - `node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>`
   - `node ./configure-echotik-auth.mjs --auth-header 'Basic ...'`
4. Only continue after the configuration script succeeds.

Do not treat this as optional. Missing local auth is a blocking condition.

## Canonical Skill Contract

After setup, follow:

- `skills/echotik-api-assistant/SKILL.md`
- `skills/echotik-api-assistant/references/global-rules.md`
- `skills/echotik-api-assistant/references/setup-and-auth.md`
- `skills/echotik-api-assistant/references/scenarios.md`
- `skills/echotik-api-assistant/references/orchestration-playbooks.md`

## Execution Scripts

Use repository-root scripts:

- `./configure-echotik-auth.mjs`
- `./search-echotik-docs.mjs`
- `./echotik-api.mjs`
- `./verify-install.mjs`

Do not require or mention MCP setup, MCP tools, or MCP services. This repository is intentionally direct-script only.
