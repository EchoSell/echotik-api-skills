# EchoTik API Skills

This repository packages a lightweight EchoTik API skill for both Codex and Claude Code.

## Primary operating rule

For creator, product, seller, video, live, search, ranking, analysis, or reporting requests, use EchoTik API workflows only.

Do not browse or rely on `echotik.live` product pages for data retrieval.

The website is allowed only for:

- account registration
- API key retrieval
- pricing and billing guidance
- authentication setup

## Skill entrypoints

- Canonical skill: `skills/echotik-api-assistant/SKILL.md`
- Claude wrapper skill: `.claude/skills/echotik-api-assistant/SKILL.md`

## MCP execution layer

- `mcp/server.mjs`
- `mcp/router.mjs`
- `mcp/catalog.mjs`
- `mcp/report-executor.mjs`
- `mcp/client.mjs`

## Runtime expectations

- Authenticate with `ECHOTIK_USERNAME` and `ECHOTIK_PASSWORD`, or `ECHOTIK_AUTH_HEADER`
- Route natural language into the local EchoTik MCP tools
- Prefer the documented EchoTik API surface from `https://opendocs.echotik.live/llms.txt`
- Ask for realtime versus EchoTik offline mode when the workflow is dual-mode
- Ask which sections to include before executing a comprehensive report workflow

## Recommended tool sequence

1. `echotik_status`
2. `echotik_docs_search` or `echotik_route_request`
3. `echotik_execute_report` for structured multi-endpoint reports
4. `echotik_call_api` for direct endpoint execution

## Maintenance

- Keep business rules in `skills/echotik-api-assistant/references/`
- Keep executable endpoint metadata in `mcp/catalog.mjs`
- Keep routing logic in `mcp/router.mjs`
- Use `npm run check:docs` after catalog updates
