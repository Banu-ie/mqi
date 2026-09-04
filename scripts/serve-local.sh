#!/usr/bin/env bash
# Run the app locally the way it runs in production: real builds, the backend
# serving from dist/, the frontend served as static files. Ctrl-C stops both.
#
# Usage:  ./scripts/serve-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"

if [ ! -f "$ROOT/backend/.env" ]; then
  echo "error: backend/.env is missing. Copy backend/.env.example and set JWT_SECRET." >&2
  exit 1
fi

# Deliberately no VITE_API_URL: the bundle then calls same-origin /api, and the
# preview server proxies that to the backend — the same shape as production,
# where the static host rewrites /api/* instead.
rm -f "$ROOT/frontend/.env.production"

echo "==> building frontend"
(cd "$ROOT/frontend" && npm run build >/dev/null)
echo "==> building backend"
(cd "$ROOT/backend" && npm run build >/dev/null)

pids=()
cleanup() {
  echo
  echo "==> stopping"
  for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; done
}
trap cleanup EXIT INT TERM

echo "==> starting backend on :${BACKEND_PORT}"
(cd "$ROOT/backend" && NODE_ENV=production PORT="$BACKEND_PORT" npm start) &
pids+=($!)

echo "==> starting frontend on :${FRONTEND_PORT} (proxying /api to :${BACKEND_PORT})"
(cd "$ROOT/frontend" && BACKEND_PORT="$BACKEND_PORT" npx vite preview --port "$FRONTEND_PORT" --host 127.0.0.1) &
pids+=($!)

sleep 4
cat <<INFO

  Everything is on one origin — /api is proxied to the backend.

  Site       http://localhost:${FRONTEND_PORT}
  API        http://localhost:${FRONTEND_PORT}/api
  Swagger    http://localhost:${FRONTEND_PORT}/api/docs
  Admin      http://localhost:${FRONTEND_PORT}/admin/login

  (the backend also answers directly on :${BACKEND_PORT})

  Ctrl-C to stop both.
INFO

wait
