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

# VITE_API_URL is compiled into the bundle, so it has to be set before building.
cat > "$ROOT/.env.production" <<ENV
VITE_API_URL="http://localhost:${BACKEND_PORT}/api"
ENV

echo "==> building frontend"
(cd "$ROOT" && npm run build >/dev/null)
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

echo "==> starting frontend on :${FRONTEND_PORT}"
(cd "$ROOT" && npx vite preview --port "$FRONTEND_PORT" --host 127.0.0.1) &
pids+=($!)

sleep 4
cat <<INFO

  Frontend   http://localhost:${FRONTEND_PORT}
  Backend    http://localhost:${BACKEND_PORT}/api
  Swagger    http://localhost:${BACKEND_PORT}/api/docs
  Admin      http://localhost:${FRONTEND_PORT}/admin/login

  Ctrl-C to stop both.
INFO

wait
