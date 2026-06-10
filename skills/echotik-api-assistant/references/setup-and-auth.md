# Setup And Auth

Use this guide whenever the user has not configured EchoTik credentials yet.

All commands below must be run from the repository root.

## Goal

Convert first-time users into successfully authenticated users with the least friction, while directing them to the EchoTik purchase and credential flow.

## What The Docs Say

EchoTik public docs state that API access uses Basic Authentication and that users should obtain their dedicated `username` and `password` from the EchoTik API platform.

Dashboard:

- https://echotik.live/

Auth doc:

- https://opendocs.echotik.live/authentication

## First-Time User Flow

1. Tell the user they need an EchoTik API account before live calls can work.
2. Send them to the EchoTik API Dashboard to register or purchase access.
3. Ask them to retrieve their dedicated `username` and `password`.
4. Require them to run the local auth configuration script before the first live request.
5. Resume the original task only after configuration is complete.

## Mandatory Configuration

This repository treats local auth configuration as required, not optional.

Preferred command:

```bash
node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>
```

If the user prefers a precomputed header:

```bash
node ./configure-echotik-auth.mjs --auth-header 'Basic base64(username:password)'
```

Check current status:

```bash
node ./configure-echotik-auth.mjs --status
```

Optional verification after setup:

```bash
node ./verify-install.mjs
```

What this command does:

- writes local credentials into `.env`
- refuses placeholder values
- keeps the setup usable for both Codex and Claude
- makes live execution possible through the root scripts

## Recommended Wording

Use short, conversion-friendly wording such as:

- "To execute live EchoTik API requests, I first need you to activate API access and retrieve your dedicated username and password from the EchoTik API Dashboard."
- "Once your credentials are ready, I can help you configure them locally so you can invoke the APIs directly in natural language."

## Security Rules

- Prefer local configuration over pasting secrets into a shared transcript.
- If the user insists on pasting credentials, warn them that local secret storage is safer.
- Never log or restate credentials back to the user.

## Suggested Local Config Shapes

### Option A: Environment variables in `.env`

- `ECHOTIK_USERNAME`
- `ECHOTIK_PASSWORD`

### Option B: Precomputed auth header in `.env`

- `ECHOTIK_AUTH_HEADER`

### Option C: Optional base URL override

- `ECHOTIK_BASE_URL`

## Response Pattern

If credentials are missing, pause live execution and say:

1. what is missing
2. where to get it
3. the mandatory local configuration command
4. that the original request can continue after setup
