# MQİCMA — Mingəçevir Qadın İcması

Public website and admin panel for the Mingachevir Women's Community. Visitors
browse products, services and events and submit contact enquiries; an
authenticated admin manages all of that content and reads the enquiries from a
built-in panel.

The site content is in Azerbaijani.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 4, TypeScript |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| Auth | JWT (12 h expiry) + bcrypt password hashing |
| Validation | zod |
| API docs | Swagger UI / OpenAPI 3 (`swagger-jsdoc`) |
| Hardening | helmet, express-rate-limit, CORS allowlist, 100 kB body cap |
| Tests | `node:test` via `tsx` |

## Repository layout

```
.
├── src/                  # React frontend
│   ├── api/              # typed fetch wrappers, one module per resource
│   ├── components/       # layout, branding, cards, loading/empty/error states
│   ├── context/          # AuthContext (token + current admin)
│   └── pages/            # public pages + pages/admin/* panel
├── backend/
│   ├── src/db/           # schema.sql, migrations, models, seed
│   ├── src/routes/       # Express routers, each carrying its Swagger JSDoc
│   ├── src/lib/          # auth (JWT), swagger spec
│   ├── src/middleware/   # requireAuth
│   ├── src/__tests__/    # end-to-end API tests
│   └── Dockerfile
└── render.yaml           # Render blueprint: backend + frontend + disk
```

## Local development

Two terminals. The backend must be running before the frontend can load data.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Generate a secret — the server refuses to start without one:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# paste it into JWT_SECRET in .env

npm run migrate   # create the schema (also runs automatically on boot)
npm run seed      # optional demo catalogue + admin user
npm run dev       # http://localhost:4000
```

### 2. Frontend

```bash
npm install
npm run dev       # http://localhost:5173
```

`VITE_API_URL` defaults to `http://localhost:4000/api` in development, so no
frontend `.env` is needed locally. Copy `.env.example` to `.env` to override it.

### Admin access

The panel lives at `/admin/login`. `npm run seed` creates an admin from
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@mqicma.az` /
`REDACTED`). **Change the password before deploying.**

## Environment variables

Backend (`backend/.env`, template in `backend/.env.example`, production template
in `backend/.env.production.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `JWT_SECRET` | **yes** | Server exits on boot if unset. Use ≥48 random bytes. |
| `DATABASE_URL` | no | `file:` URL. Relative paths resolve against `backend/`, not the shell's cwd. Default `file:./dev.db`. |
| `PORT` | no | Default `4000`. |
| `CORS_ORIGIN` | no | Comma-separated allowlist. Default is the two local dev origins. |
| `TRUST_PROXY` | no | Set `"true"` behind a hosting proxy so rate limiting sees the real client IP. |
| `SEED_ADMIN_EMAIL` | no | Read by `npm run seed` only. |
| `SEED_ADMIN_PASSWORD` | no | Read by `npm run seed` only. |

Frontend (`.env`, template in `.env.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | in production | Full API base URL including `/api`, no trailing slash. Baked in at build time. Falls back to same-origin `/api` in a production build. |

Everything prefixed `VITE_` ships inside the JS bundle — never put a secret there.

## Database

SQLite, with the schema in `backend/src/db/schema.sql`.

- **Migrations** run automatically when the server boots, and on demand via
  `npm run migrate`. The schema is written as `CREATE TABLE IF NOT EXISTS`, so
  it is safe to re-run — but note there is no version tracking, so adding a
  column to an existing database still needs a manual `ALTER TABLE`.
- **Seeding** is non-destructive by default: `npm run seed` tops up empty tables
  and leaves existing rows alone. Pass `SEED_RESET=true npm run seed` to
  replace the demo catalogue. Never run the reset form against production.
- **Tables**: `admins`, `categories`, `products`, `services`, `events`,
  `site_content`, `contact_messages`, plus indexes on the columns the API filters
  and sorts on.
- Products reference their category **by name**, not by id. Category renames are
  cascaded to products in a transaction, and deleting a category that still holds
  products is rejected with `409`.

## API

All endpoints are under `/api`. Swagger UI documents every one of them:

- Local: http://localhost:4000/api/docs
- Raw spec: http://localhost:4000/api/docs.json

Public: `GET /api/health`, `GET /api/products`, `GET /api/products/:id`,
`GET /api/services`, `GET /api/services/:id`, `GET /api/events`,
`GET /api/events/:id`, `GET /api/categories`, `GET /api/content`,
`POST /api/contact`.

Requires a bearer token: every `POST`/`PUT`/`DELETE` on products, services,
events and categories, plus `PUT /api/content`, `GET /api/contact` and
`GET /api/auth/me`.

Rate limits: 300 requests / 15 min across `/api`, 10 failed logins / 15 min on
`/api/auth/login`, 5 submissions / hour on `POST /api/contact`.

## Tests

```bash
cd backend && npm test
```

13 end-to-end tests covering auth, the CRUD round-trip, authorization on every
write endpoint, validation rejection, category referential integrity, Swagger
coverage and error status codes. Each run uses a throwaway SQLite file, so the
suite never touches `dev.db` or a deployed database.

```bash
npm run build              # frontend production build
cd backend && npm run build   # backend tsc + schema copy
```

## Deployment

```
                 Internet
                    │
                    ▼
       Static frontend (Vite build → CDN)
                    │  HTTPS, VITE_API_URL
                    ▼
        Backend (Node/Express container)
                    │
                    ▼
        SQLite on a persistent volume
```

`render.yaml` is a ready-to-apply Render blueprint for exactly this shape:
backend web service, static frontend, and a 1 GB disk mounted at `/data`.
`backend/Dockerfile` builds the same thing as a container for any Docker host.

Deployment checklist:

1. Backend: set `JWT_SECRET`, `DATABASE_URL=file:/data/mqicma.db`,
   `TRUST_PROXY=true`, and `CORS_ORIGIN` to the frontend origin.
2. Frontend: set `VITE_API_URL` to `https://<backend-host>/api` **before**
   building — it is compiled into the bundle, not read at runtime.
3. Point the SPA's unmatched routes at `index.html`, or refreshing
   `/mehsullar` returns a 404.
4. Create the first admin with `npm run seed` using a strong
   `SEED_ADMIN_PASSWORD`.

> **The database needs a persistent volume.** SQLite stores data in a file; on a
> host with an ephemeral filesystem (including Render's free tier) every deploy
> starts from an empty database. Either attach a disk, as `render.yaml` does, or
> migrate to managed Postgres.

## Running a local production deployment

To exercise the real production path — actual builds, backend serving from
`dist/`, frontend served as static files — without a hosting account:

```bash
./scripts/serve-local.sh
```

It builds both halves, writes `.env.production` with the local API URL (the
value is compiled into the bundle, so it must be set before the build), starts
the backend on `:4000` and the static frontend on `:4173`, and stops both on
Ctrl-C. Override with `BACKEND_PORT` / `FRONTEND_PORT`.

Requires `backend/.env` with a `JWT_SECRET`; the script exits with an error if
it is missing. Add the frontend origin to `CORS_ORIGIN` in `backend/.env`, or
the browser's API calls are blocked:

```
CORS_ORIGIN="http://localhost:5173,http://localhost:4173"
```

## Live application

Not deployed to a public host yet. Locally, via the script above:

```
Frontend URL: http://localhost:4173
Backend URL:  http://localhost:4000/api
Swagger URL:  http://localhost:4000/api/docs
Admin panel:  http://localhost:4173/admin/login
```
