# EchoTik API Skills

EchoTik API Skills provides a ready-to-install EchoTik API skill for both Codex and Claude Code.

It helps AI assistants turn natural-language TikTok commerce requests into guided EchoTik API workflows for creator discovery, product research, shop analysis, video intelligence, live lookup, search, and reporting.

Runtime requirement: `Node.js >= 18`

## Skill Layouts

This project includes the expected skill locations for both tools:

- Codex: `.agents/skills/echotik-api-assistant/SKILL.md`
- Claude Code: `.claude/skills/echotik-api-assistant/SKILL.md`

The Codex entrypoint is the main skill. The Claude entrypoint points to the same instructions and references.

## Install

Users can install this repository from GitHub with prompts such as:

- `帮我安装这个 skills: [EchoSell/echotik-api-skills](https://github.com/EchoSell/echotik-api-skills)`
- `Install this skill: [EchoSell/echotik-api-skills](https://github.com/EchoSell/echotik-api-skills)`

Manual setup:

```bash
git clone https://github.com/EchoSell/echotik-api-skills.git
cd echotik-api-skills
```

## First-Time Setup

Before any live EchoTik request, configure EchoTik credentials into shell environment variables.

Check current status:

```bash
node ./configure-echotik-auth.mjs --status
```

Run the guided setup:

```bash
node ./configure-echotik-auth.mjs
```

What the setup script does:

- prompts for EchoTik credentials locally
- writes a managed EchoTik export block into the user's shell profile
- stores `ECHOTIK_USERNAME` and `ECHOTIK_PASSWORD` in environment variables for future sessions

After setup, restart Codex or Claude Code, or open a new terminal session.

## Use The Scripts

### Search EchoTik docs

```bash
node ./search-echotik-docs.mjs --query "creator detail"
```

### Execute a live EchoTik API request

```bash
node ./echotik-api.mjs \
  --path /api/v3/realtime/influencer/detail \
  --query '{"unique_id":"demo_creator"}'
```

### Execute a POST request

```bash
node ./echotik-api.mjs \
  --path /api/v3/some/post/endpoint \
  --method POST \
  --body '{"example":"value"}'
```

## What The Skill Covers

The skill is designed for these common business tasks:

- find fast-growing or high-performing creators
- research winning products and product trends
- analyze shops and seller ecosystems
- inspect video performance, comments, captions, and linked products
- search creators, products, videos, hashtags, music, and live sessions
- assemble multi-step business workflows and reports

The main skill behavior lives in:

- `.agents/skills/echotik-api-assistant/SKILL.md`

Core reference modules:

- `.agents/skills/echotik-api-assistant/references/global-rules.md`
- `.agents/skills/echotik-api-assistant/references/scenarios.md`
- `.agents/skills/echotik-api-assistant/references/routing-policy.md`
- `.agents/skills/echotik-api-assistant/references/orchestration-playbooks.md`
- `.agents/skills/echotik-api-assistant/references/setup-and-auth.md`

Domain-specific rule sets are included for:

- creators
- products
- sellers
- videos
- live rooms
- search

## Project Scripts

### `configure-echotik-auth.mjs`

Guided local setup for EchoTik environment variables.

Supported flags:

- `--status`
- `--profile`
- `--username`
- `--password`

### `search-echotik-docs.mjs`

Looks up matching lines from the EchoTik docs index at:

- `https://opendocs.echotik.live/llms.txt`

Supported flags:

- `--query`
- `--limit`

### `echotik-api.mjs`

Executes EchoTik API requests with configured environment variables.

Supported flags:

- `--path`
- `--method`
- `--query`
- `--body`
- `--timeout-ms`

## Authentication

EchoTik uses Basic Authentication.

Supported environment variables:

- `ECHOTIK_USERNAME`
- `ECHOTIK_PASSWORD`

See:

- `.agents/skills/echotik-api-assistant/references/setup-and-auth.md`

## Security

- never commit real credentials
- prefer local environment variables for secrets
- avoid pasting credentials into shared chat unless the user explicitly accepts that risk
