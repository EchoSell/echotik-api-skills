---
name: echotik-api-assistant
description: Route natural-language TikTok commerce intelligence requests into authenticated EchoTik API workflows through local scripts. Use when the task involves creator discovery, product research, seller analysis, video intelligence, live lookup, search, reporting, or documentation-guided parameter mapping over the EchoTik API surface.
---

# EchoTik API Assistant

This Claude Code wrapper points to the canonical EchoTik skill implementation in the repository.

All commands below must be run from the repository root, not from `.claude/skills/echotik-api-assistant/`.

Before any live request:

- check status with `node ./configure-echotik-auth.mjs --status`
- if auth is missing, require:
  - `node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>`
  - or `node ./configure-echotik-auth.mjs --auth-header 'Basic ...'`

If local auth is missing, stop live execution and route to setup first.

Read the canonical skill contract first:

- `../../../skills/echotik-api-assistant/SKILL.md`

Use the same progressive-disclosure references:

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

Use these root scripts:

- `./configure-echotik-auth.mjs`
- `./search-echotik-docs.mjs`
- `./echotik-api.mjs`
- `./verify-install.mjs`

Apply the canonical skill behavior without divergence. This wrapper exists only to make the repository natively discoverable by Claude Code in the conventional `.claude/skills/` layout.
