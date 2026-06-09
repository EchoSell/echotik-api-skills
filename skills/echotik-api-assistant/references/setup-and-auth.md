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
4. Help them configure credentials locally in the MCP client or wrapper server.
5. Resume the original task after setup.

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

## Response Pattern

If credentials are missing, pause live execution and say:

1. what is missing
2. where to get it
3. the safest next step
4. that the original request can continue after setup
