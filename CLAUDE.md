# EchoTik API Skills

This repository packages a direct-script EchoTik skill for both Codex and Claude Code.

All commands in this repository should be executed from the repository root.

## Primary Operating Rule

For creator, product, seller, video, live, search, ranking, analysis, and reporting requests, use EchoTik API workflows only.

Do not browse or rely on `echotik.live` product pages for analytics retrieval.

The website is allowed only for:

- account registration
- credential retrieval
- pricing and billing guidance
- authentication setup

## Skill Entrypoints

- Canonical skill: `skills/echotik-api-assistant/SKILL.md`
- Claude wrapper skill: `.claude/skills/echotik-api-assistant/SKILL.md`
- GitHub/root install entry: `SKILL.md`

## Runtime Expectation

This repo no longer provides MCP tools.

Instead:

1. verify local auth with `node ./configure-echotik-auth.mjs --status`
2. if needed, force setup with `node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>`
3. consult docs with `node ./search-echotik-docs.mjs --query "..."`
4. optionally verify with `node ./verify-install.mjs`
5. execute live requests with `node ./echotik-api.mjs --path ... --query ...`

## Root-Level Scripts

- `install.sh`
- `configure-echotik-auth.mjs`
- `search-echotik-docs.mjs`
- `echotik-api.mjs`
- `verify-install.mjs`

These files intentionally live at the repository root so GitHub-installed skills are easy for Codex and Claude to discover and operate.

## Maintenance

- Keep business rules in `skills/echotik-api-assistant/references/`
- Keep the canonical skill behavior in `skills/echotik-api-assistant/SKILL.md`
- Keep root scripts stable and dependency-free
