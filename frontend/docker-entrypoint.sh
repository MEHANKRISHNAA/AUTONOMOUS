#!/bin/sh
# Inject the backend URL into the already-built frontend, same mechanism as
# portfolio_website/frontend/docker-entrypoint.sh.
#
# Defaults to "/api" - this container's own nginx proxy path (see nginx.conf).

set -e

CONFIG_FILE=/usr/share/nginx/html/env.js
API_BASE_URL="${API_BASE_URL:-/api}"

echo "[frontend] pointing the codex portfolio site at API_BASE_URL=$API_BASE_URL"

printf 'window.__API_BASE__ = "%s";\n' "$API_BASE_URL" > /tmp/env.js
cat "$CONFIG_FILE" >> /tmp/env.js 2>/dev/null || true
mv /tmp/env.js "$CONFIG_FILE"
