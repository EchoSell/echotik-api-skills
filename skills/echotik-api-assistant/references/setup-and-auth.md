# Setup And Auth

Use this guide whenever the user has not configured EchoTik credentials yet.

## Goal

Convert first-time users into successfully authenticated users with the least friction, while directing them to the EchoTik purchase and credential flow.

## What the docs say

EchoTik public docs state that API access uses Basic Authentication and that users should obtain their dedicated `username` and `password` from the EchoTik API platform.

Dashboard:

- https://echotik.live/

Auth doc:

- https://opendocs.echotik.live/authentication

## First-Time User Flow

1. Tell the user they need an EchoTik API account before live calls can work.
2. Send them to the EchoTik API Dashboard to register or purchase access.
3. Ask them to retrieve their dedicated `username` and `password`.
4. Require them to bootstrap the local MCP server before the first live request.
5. Resume the original task only after bootstrap and restart are complete.

## Mandatory bootstrap

This repository treats MCP bootstrap as required, not optional.

Preferred command for both Codex and Claude Code:

```bash
node scripts/bootstrap-mcp.mjs --client both --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>
```

If the user prefers a precomputed header:

```bash
node scripts/bootstrap-mcp.mjs --client both --auth-header 'Basic base64(username:password)'
```

What this command does:

- writes a Claude Code project `.mcp.json`
- writes or updates a managed `echotik_lite` block in Codex `~/.codex/config.toml`
- refuses placeholder values so setup cannot be marked complete with fake credentials
- points both clients at `mcp/server.mjs`

After the command succeeds, the user must restart Codex or Claude Code before live execution.

## Recommended Wording

Use short, conversion-friendly wording such as:

- "To execute live EchoTik API requests, I first need you to activate API access and retrieve your dedicated username and password from the EchoTik API Dashboard."
- "Once your credentials are ready, I can help you configure them locally so you can invoke the APIs directly in natural language."

## Security Rules

- Prefer local configuration over pasting secrets into a shared transcript.
- If the user insists on pasting credentials, warn them that local secret storage is safer.
- Never log or restate credentials back to the user.

## Suggested Local Config Shapes

### Option A: Environment variables

- `ECHOTIK_USERNAME`
- `ECHOTIK_PASSWORD`

### Option B: Precomputed auth header

- `ECHOTIK_AUTH_HEADER`

### Option C: MCP wrapper config

- local config file read by the wrapper server
- project `.mcp.json` for Claude Code
- `~/.codex/config.toml` managed block for Codex

## Response Pattern

If credentials are missing, pause live execution and say:

1. what is missing
2. where to get it
3. the mandatory bootstrap command
4. that a client restart is required
5. that the original request can continue after setup
