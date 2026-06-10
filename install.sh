#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIN_NODE_MAJOR=18

cd "${ROOT_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found in PATH."
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt "${MIN_NODE_MAJOR}" ]; then
  echo "Node.js >= ${MIN_NODE_MAJOR} is required. Current version: $(node -p 'process.versions.node')"
  exit 1
fi

echo "EchoTik skill files are ready at: ${ROOT_DIR}"
echo
echo "Repository root:"
echo "  cd ${ROOT_DIR}"
echo
echo "Next step (required before live API use):"
echo "  node ./configure-echotik-auth.mjs --username <ECHOTIK_USERNAME> --password <ECHOTIK_PASSWORD>"
echo
echo "To check local auth status:"
echo "  node ./configure-echotik-auth.mjs --status"
echo
echo "To verify the install:"
echo "  node ./verify-install.mjs"
