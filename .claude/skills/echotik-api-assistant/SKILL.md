---
name: echotik-api-assistant
description: Route natural-language TikTok commerce intelligence requests into authenticated EchoTik API workflows. Use when the task involves creator discovery, product research, seller analysis, video intelligence, live-session lookup, search, reporting, or documentation-guided parameter mapping over the EchoTik API surface.
---

# EchoTik API Assistant

This project-local Claude Code wrapper points to the canonical EchoTik skill implementation in the repository.

Read the canonical skill contract first:

- `../../../skills/echotik-api-assistant/SKILL.md`

Use the same progressive-disclosure references from the canonical skill directory:

- `../../../skills/echotik-api-assistant/references/global-rules.md`
- `../../../skills/echotik-api-assistant/references/influencer-rules.md`
- `../../../skills/echotik-api-assistant/references/product-rules.md`
- `../../../skills/echotik-api-assistant/references/seller-rules.md`
- `../../../skills/echotik-api-assistant/references/video-rules.md`
- `../../../skills/echotik-api-assistant/references/live-rules.md`
- `../../../skills/echotik-api-assistant/references/search-rules.md`
- `../../../skills/echotik-api-assistant/references/routing-policy.md`
- `../../../skills/echotik-api-assistant/references/scenarios.md`
- `../../../skills/echotik-api-assistant/references/orchestration-playbooks.md`
- `../../../skills/echotik-api-assistant/references/setup-and-auth.md`

Use the local MCP execution layer from this repository:

- `../../../mcp/catalog.mjs`
- `../../../mcp/router.mjs`
- `../../../mcp/client.mjs`
- `../../../mcp/server.mjs`

Apply the canonical skill behavior without divergence. This wrapper exists only to make the repository natively discoverable by Claude Code in the conventional `.claude/skills/` layout.
