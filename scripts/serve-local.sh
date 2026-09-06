#!/usr/bin/env bash
# Run the app locally exactly the way it runs in production: real builds, one
# service, Express serving both the API and the built React app. Ctrl-C stops it.
#
# Usage:  ./scripts/serve-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4000}"

if [ ! -f "$ROOT/backend/.env" ]; then
  echo "error: backend/.env is missing. Copy backend/.env.example and set DATABASE_URL and JWT_SECRET." >&2
  exit 1
fi

# No VITE_API_URL: the bundle then calls same-origin /api, which is exactly what
# it does in production, since the same process serves both.
rm -f "$ROOT/frontend/.env.production"

echo "==> building backend and frontend"
(cd "$ROOT/backend" && npm run build:all >/dev/null)

cat <<INFO

  One service, one origin — Express serves the site and the API together.

  Site       http://localhost:${PORT}
  API        http://localhost:${PORT}/api
  Swagger    http://localhost:${PORT}/api/docs
  Admin      http://localhost:${PORT}/admin/login

  Ctrl-C to stop.
INFO

cd "$ROOT/backend" && NODE_ENV=production PORT="$PORT" exec npm start
