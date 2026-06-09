# EchoTik API Assistant

EchoTik API Assistant is a lightweight, scenario-driven skill package for Codex and Claude Code. It translates natural-language TikTok commerce intelligence requests into authenticated EchoTik API workflows, with a minimal MCP execution layer and no build step.

## Platform compatibility

This repository is structured to work with both mainstream skill layouts:

- Codex-style canonical skill sources in `skills/echotik-api-assistant/`
- Claude Code project-local skill discovery in `.claude/skills/echotik-api-assistant/`

The Claude wrapper points to the canonical implementation so the business logic remains single-sourced.

Repository-level Claude guidance also lives in [CLAUDE.md](CLAUDE.md).

## What this package does

- routes natural-language requests into EchoTik API scenarios
- supports both English and Chinese natural-language routing
- enforces EchoTik-specific workflow rules, freshness rules, and fallback rules
- supports creator, product, seller, video, live, search, and reporting workflows
- guides credential onboarding before live execution
- calls the real EchoTik APIs through a minimal local MCP server

## Runtime flow

Once installed and authenticated, each natural-language request follows:

1. route the request into the correct scenario and endpoint workflow
2. map plain-language inputs to concrete API parameters
3. execute the selected EchoTik APIs
4. return business-facing results rather than raw parameter-centric output

## Installation

### Codex

1. Clone this repository.
2. Run `npm install`.
3. Register the MCP server with your Codex MCP configuration using [mcp.config.example.json](mcp.config.example.json).
4. Configure local EchoTik credentials.
5. Use the `echotik-api-assistant` skill.

### Claude Code

1. Clone this repository inside the project you want Claude Code to work in, or copy the skill into your Claude skills directory.
2. Run `npm install`.
3. Configure the MCP server so Claude Code can start [mcp/server.mjs](mcp/server.mjs). A typical command is:

```bash
claude mcp add echotik-lite --scope project \
  --env ECHOTIK_USERNAME=your_username \
  --env ECHOTIK_PASSWORD=your_password \
  -- node /absolute/path/to/echotik-api-skills/mcp/server.mjs
```

If you prefer a precomputed header, replace the username/password env vars with:

```bash
claude mcp add echotik-lite --scope project \
  --env ECHOTIK_AUTH_HEADER='Basic base64(username:password)' \
  -- node /absolute/path/to/echotik-api-skills/mcp/server.mjs
```

4. Configure local EchoTik credentials.
5. Claude Code can discover the project-local wrapper skill at [.claude/skills/echotik-api-assistant/SKILL.md](.claude/skills/echotik-api-assistant/SKILL.md).

## Authentication

EchoTik live execution uses Basic Authentication. Configure one of these local credential shapes:

- `ECHOTIK_USERNAME` and `ECHOTIK_PASSWORD`
- `ECHOTIK_AUTH_HEADER`

Optional:

- `ECHOTIK_BASE_URL`

Examples:

- [.env.example](.env.example)
- [mcp.config.example.json](mcp.config.example.json)

Never store credentials in chat transcripts or committed files.

## Skill architecture

### Canonical skill

- [SKILL.md](skills/echotik-api-assistant/SKILL.md)
- [CLAUDE.md](CLAUDE.md)

### Rule modules

- [global-rules.md](skills/echotik-api-assistant/references/global-rules.md)
- [influencer-rules.md](skills/echotik-api-assistant/references/influencer-rules.md)
- [product-rules.md](skills/echotik-api-assistant/references/product-rules.md)
- [seller-rules.md](skills/echotik-api-assistant/references/seller-rules.md)
- [video-rules.md](skills/echotik-api-assistant/references/video-rules.md)
- [live-rules.md](skills/echotik-api-assistant/references/live-rules.md)
- [search-rules.md](skills/echotik-api-assistant/references/search-rules.md)
- [routing-policy.md](skills/echotik-api-assistant/references/routing-policy.md)
- [scenarios.md](skills/echotik-api-assistant/references/scenarios.md)
- [orchestration-playbooks.md](skills/echotik-api-assistant/references/orchestration-playbooks.md)
- [setup-and-auth.md](skills/echotik-api-assistant/references/setup-and-auth.md)

### MCP execution layer

- [server.mjs](mcp/server.mjs)
- [client.mjs](mcp/client.mjs)
- [catalog.mjs](mcp/catalog.mjs)
- [router.mjs](mcp/router.mjs)
- [report-executor.mjs](mcp/report-executor.mjs)

### Tests

- [router.test.mjs](tests/router.test.mjs)
- [client.test.mjs](tests/client.test.mjs)
- [report-executor.test.mjs](tests/report-executor.test.mjs)

## Source of truth

This repository uses a three-layer authority model:

1. Global execution rules
   - `references/global-rules.md`
2. Module-specific business rules
   - `references/*-rules.md`
   - `references/orchestration-playbooks.md`
3. Runtime execution metadata and routing
   - `mcp/catalog.mjs`
   - `mcp/router.mjs`

The MCP layer is the source of truth for executable endpoint metadata and route output. The reference files are the source of truth for business interpretation, orchestration policy, and usage constraints.

## Exposed MCP tools

- `echotik_status`
- `echotik_docs_search`
- `echotik_route_request`
- `echotik_execute_report`
- `echotik_call_api`

## Capability matrix

| User goal | Primary workflow | Preferred endpoints |
| --- | --- | --- |
| discover fast-growing creators | scenario routing | `influencer-ranklist`, `influencer-list`, `influencer-trend` |
| inspect a creator deeply | dual-mode detail + report workflow | `influencer-detail`, `realtime-influencer-detail`, `influencer-video-list`, `realtime-influencer-follower-list`, `influencer-product-list` |
| find winning products | discovery workflow | `product-list`, `product-ranklist`, `product-trend`, category endpoints |
| produce a product report | multi-endpoint report workflow | `product-detail`, `product-comment`, `realtime-product-comment`, `product-influencer-list`, `product-video-list`, `product-live-list` |
| benchmark shops | shop analysis workflow | `seller-list`, `seller-detail`, `seller-trend`, `seller-product-list`, `seller-influencer-list` |
| analyze a video | mixed realtime/offline workflow | `video-detail`, `realtime-video-detail`, `realtime-video-trend-insight`, `realtime-video-comment-insight`, `video-product-list` |
| search by keyword or image | search workflow | `realtime-influencer-search`, `realtime-product-search`, `realtime-video-search`, `realtime-product-photo-search`, `universal-search` |
| generate structured reports | deterministic report executor | `echotik_execute_report` with creator, product, seller, or video report sections |

## Recommended business workflows

The skill already includes structured orchestration guidance for:

- creator health reports
- creator discovery shortlists
- product opportunity reports
- product discovery workflows
- seller performance reports
- seller discovery workflows
- video performance analysis
- video discovery workflows
- search workflows
- image-based product search
- hashtag video exploration
- live-room monitoring

See [orchestration-playbooks.md](skills/echotik-api-assistant/references/orchestration-playbooks.md).

## Why this repository is intentionally lightweight

- no build step
- only `@modelcontextprotocol/sdk` and `zod`
- no heavy framework wrapper
- native `fetch`
- explicit tests for routing and authentication behavior
- one optional doc-audit script for catalog drift detection

## Maintenance

When adding new EchoTik API knowledge:

1. update or add the relevant rule module under `references/`
2. update [catalog.mjs](mcp/catalog.mjs)
3. update [router.mjs](mcp/router.mjs) only when routing behavior truly changes
4. run `npm run check:docs`
5. extend the tests

Avoid maintaining duplicate endpoint catalogs or duplicate parameter-mapping documents.

## Key EchoTik references

- [Public docs](https://opendocs.echotik.live/)
- [LLM index](https://opendocs.echotik.live/llms.txt)
- [Authentication](https://opendocs.echotik.live/authentication.md)
- [API keys](https://echotik.live/platform/api-keys)
- [Pricing](https://echotik.live/platform/pricing)
