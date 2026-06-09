---
name: echotik-api-assistant
description: Installable EchoTik API skill entrypoint for Codex and Claude Code. Route natural-language TikTok commerce intelligence requests into authenticated EchoTik API workflows, and force local MCP bootstrap before the first live request.
---

# EchoTik API Assistant

This repository-level entrypoint exists so GitHub root installs work in both Codex and Claude Code.

Before any live EchoTik task, enforce local setup in this order:

1. Check whether the local EchoTik MCP tools are already available.
2. If they are missing, do not attempt live execution.
3. Require the user to configure real EchoTik credentials first.
4. Then bootstrap the local MCP server by running:
   - `node scripts/bootstrap-mcp.mjs --client both --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>`
   - or `node scripts/bootstrap-mcp.mjs --client both --auth-header 'Basic ...'`
5. Tell the user to restart Codex or Claude Code after bootstrap completes.
6. Only after restart, continue with the original EchoTik task.

Do not treat setup as optional. Missing credentials or missing MCP registration are blocking conditions.

After bootstrap, follow the canonical skill contract:

- `skills/echotik-api-assistant/SKILL.md`
- `skills/echotik-api-assistant/references/global-rules.md`
- `skills/echotik-api-assistant/references/setup-and-auth.md`
- `skills/echotik-api-assistant/references/scenarios.md`
- `skills/echotik-api-assistant/references/orchestration-playbooks.md`

Use the execution layer in this repository:

- `mcp/server.mjs`
- `mcp/router.mjs`
- `mcp/catalog.mjs`
- `mcp/client.mjs`
