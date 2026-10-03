# MQİCMA — Mingəçevir Qadın İcması

Public website and admin panel for the Mingachevir Women's Community. Visitors
browse products, services and events and submit contact enquiries; an
authenticated admin manages all of that content and reads the enquiries from a
built-in panel.

The site content is in Azerbaijani.

## Tech stack

| Layer      | Choice                                                       |
| ---------- | ------------------------------------------------------------ |
| Frontend   | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend    | Node.js, Express 4, TypeScript                               |
| Database   | PostgreSQL via `pg` (managed: Neon)                          |
| Auth       | JWT (12 h expiry) + bcrypt password hashing                  |
| Validation | zod                                                          |
| Uploads    | multer + sharp (images resized and stored in Postgres)       |
| API docs   | Swagger UI / OpenAPI 3 (`swagger-jsdoc`)                     |
| Hardening  | helmet, express-rate-limit, CORS allowlist, 100 kB body cap  |
| Tests      | `node:test` via `tsx`, against a throwaway PostgreSQL schema |

## Repository layout

```
.
├── frontend/             # React app (own package.json)
│   └── src/
│       ├── api/          # typed fetch wrappers, one module per resource
│       ├── components/   # layout, branding, cards, loading/empty/error states
│       ├── context/      # AuthContext (token + current admin)
│       └── pages/        # public pages + pages/admin/* panel
├── backend/              # Express API (own package.json)
│   ├── src/db/
│   │   ├── migrations/   # numbered .sql files, applied in order
│   │   ├── index.ts      # pool, query helpers, migration runner
│   │   ├── models.ts     # data access
│   │   └── seed.ts       # demo catalogue + first admin
│   ├── src/routes/       # thin Express routers
│   ├── src/controllers/  # request handling and validation per resource
│   ├── src/lib/          # auth (JWT), OpenAPI spec
│   ├── src/middleware/   # requireAuth, hasValidAdminToken, image upload
│   ├── src/__tests__/    # end-to-end API tests
│   ├── uploads/          # legacy local images; uploads now go to the database
│   └── Dockerfile
├── render.yaml           # Render blueprint: one web service
└── scripts/serve-local.sh
```

## Local development

Needs a PostgreSQL server. Two terminals; the backend must be running before
the frontend can load data.

### 1. Database

```bash
createdb mqicma_dev
createdb mqicma_test   # used by npm test
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Generate a secret — the server refuses to start without one:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# paste it into JWT_SECRET, and set DATABASE_URL, in .env

npm run migrate   # apply migrations (also runs automatically on boot)
npm run seed      # optional demo catalogue + admin user
npm run dev       # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

`VITE_API_URL` defaults to `http://localhost:4000/api` in development, so no
frontend `.env` is needed locally.

### Admin access

The panel lives at `/admin/login`. `npm run seed` creates an admin from
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (required by `npm run seed`; use a
unique password). Never commit or reuse the production password.

## Environment variables

Backend (`backend/.env`; templates in `backend/.env.example` and
`backend/.env.production.example`):

| Variable                                   | Required | Notes                                                                                           |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                             | **yes**  | PostgreSQL connection string. Server exits on boot if unset. Use the _pooled_ endpoint on Neon. |
| `DATABASE_MIGRATION_URL`                   | no       | Privileged PostgreSQL URL used for migrations when split roles are enabled.                  |
| `DATABASE_RUNTIME_ROLE`                    | no       | Limited role name paired with `DATABASE_MIGRATION_URL`; enables grants and migration checks.   |
| `RUN_MIGRATIONS`                            | no       | Defaults to `true`; set `false` only when a privileged release job runs migrations.             |
| `JWT_SECRET`                               | **yes**  | Server exits on boot if unset. Use ≥48 random bytes.                                            |
| `DATABASE_SCHEMA`                          | no       | Schema holding this app's tables. Default `mqicma`.                                             |
| `DATABASE_POOL_MAX`                        | no       | Max pooled connections, default `10`. Keep low on serverless Postgres.                          |
| `PORT`                                     | no       | Default `4000`.                                                                                 |
| `CORS_ORIGIN`                              | no       | Comma-separated allowlist. Unnecessary in a single-origin deployment.                           |
| `TRUST_PROXY`                              | no       | Set `"true"` behind a hosting proxy so rate limiting sees the real client IP.                   |
| `PUBLIC_ORIGIN`                            | production | Canonical `https://` origin used to redirect HTTP requests. Set it to the deployed domain.       |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | no       | Read by `npm run seed` only; password must be unique and at least 16 characters.                 |
| `SEED_RESET_CONFIRM`                      | no       | Required as `RESET_PRODUCTION_DATA` with `SEED_RESET=true` in production.                       |
| `TEST_DATABASE_URL`                        | no       | Used by `npm test`. Defaults to `postgresql://127.0.0.1:5432/mqicma_test`.                      |

Frontend (`frontend/.env`, template in `frontend/.env.example`):

| Variable       | Required | Notes                                                                                                                                           |
| -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | no       | Full API base URL including `/api`. Baked in at build time. Leave unset for a single-origin deployment — the app then calls same-origin `/api`. |

Everything prefixed `VITE_` ships inside the JS bundle — never put a secret there.

## Database

PostgreSQL. All tables live in a dedicated schema (`DATABASE_SCHEMA`, default
`mqicma`) rather than `public`, so the application can share a database without
colliding with anything else already in it.

- **Migrations** are numbered `.sql` files in `backend/src/db/migrations/`,
  applied in filename order. Each runs once inside a transaction and is recorded
  in a `schema_migrations` table, so re-running is a no-op. A Postgres advisory
  lock stops two booting instances from racing. They run automatically at
  startup before the port opens, and on demand via `npm run migrate`.
- To change the schema, add a new numbered file. Never edit an applied one.
- **Seeding** is non-destructive by default: `npm run seed` tops up empty tables
  and leaves existing rows alone. `SEED_RESET=true npm run seed` replaces the
  demo catalogue inside a transaction. In production, also set
  `SEED_RESET_CONFIRM=RESET_PRODUCTION_DATA` as a second explicit confirmation.
  Never run the reset form against production data unless that destructive
  operation is intentional and approved.
- **Tables**: `admins`, `categories`, `products`, `services`, `events`,
  `site_content`, `contact_messages`, `uploads`, `rate_limit_hits`,
  `admin_sessions`, plus indexes on the columns the API filters and sorts on.

### Database roles

The simplest local setup uses one database login. Production should use a
separate, non-owner runtime login so a web-process compromise cannot create
schemas, alter tables, or access other schemas. Create the runtime login as the
database owner, grant it `CONNECT` on the database and `USAGE` on the `mqicma`
schema, and set its default path:

```sql
CREATE SCHEMA IF NOT EXISTS mqicma;
CREATE ROLE mqicma_app LOGIN PASSWORD 'use-a-generated-secret';
GRANT CONNECT ON DATABASE your_database TO mqicma_app;
GRANT USAGE ON SCHEMA mqicma TO mqicma_app;
ALTER ROLE mqicma_app SET search_path TO mqicma;
```

Set `DATABASE_URL` to the pooled connection for `mqicma_app`,
`DATABASE_RUNTIME_ROLE=mqicma_app`, and `DATABASE_MIGRATION_URL` to the schema
owner connection. The migration runner grants the runtime role CRUD rights only
inside this application's schema, excludes `schema_migrations`, denies
`DELETE` on `admins`, and sets matching default grants for future tables. Keep
the owner URL in a migration job or release environment, not the long-running
web service, where the host supports that split. Never grant the app login database-level `CREATE`, schema
ownership, or superuser privileges. This site is single-tenant: its content is
shared, and row-level access decisions remain at the authenticated API layer;
PostgreSQL RLS cannot distinguish admins when every request uses the same DB
login.

For a strict split, run `npm run migrate:prod` from a release job with both
database URLs, then set `RUN_MIGRATIONS=false` on the web service and omit
`DATABASE_MIGRATION_URL` there. The runtime role must already have the schema
and default `search_path` provisioned as above. The default `RUN_MIGRATIONS=true`
keeps the single-login development setup convenient.

### Backups, recovery targets, and restore procedure

Backup retention and point-in-time recovery are controlled by the database
provider and plan; this repository cannot verify that they are enabled. In the
Neon project console, enable the longest backup/PITR retention available for the
chosen plan, confirm the database is covered, and make sure provider alerts go
to an actively monitored address. Recovery objectives for this service are
**RPO ≤ 24 hours** and **RTO ≤ 4 hours**. Confirm the selected plan can meet
those targets; if it cannot, record the actual achievable targets and get the
service owner to accept them.

Restore runbook:

1. Record the incident time and select the latest known-good recovery point
   before the incident. Do not overwrite or delete the original database.
2. Restore to a new database/branch using the provider console. Keep the
   original available while recovery is validated.
3. Point a staging deployment at the restored database. Check startup/migrations,
   `/api/health`, admin login, catalogue pages, contact messages, and uploaded
   images.
4. Once checks pass, update production `DATABASE_URL` to the restored database,
   redeploy, and repeat the smoke checks. Record the recovery point and elapsed
   time to measure RPO/RTO.
5. Schedule a restore drill at least quarterly and after changing backup
   settings. Record the date, result, measured data loss window, and recovery
   time in the operations log.

### Usage and quota alerts

The scheduled keep-warm workflow is only a best-effort availability measure;
GitHub cron delivery is not guaranteed and it does not control provider spend.
In the Render and Neon project consoles, add billing/usage notifications at
**50%, 90%, and 100%** of each applicable monthly resource quota or spend
budget. Send them to at least two monitored maintainers. Include database
compute, storage, egress, and web-service usage where the provider exposes
those meters. Verify the alert recipients and thresholds quarterly. The
repository cannot confirm console-side alert delivery, so track that check in
the provider account.
- Products reference their category **by name**, not by id. Category renames
  cascade to products in a transaction, and deleting a category that still holds
  products is rejected with `409`.

> **"permission denied for database" on first run.** Creating the schema needs
> `CREATE` on the database, which managed providers do not always grant to an
> application role. Run this once as the database owner:
>
> ```sql
> GRANT CREATE ON DATABASE your_database TO your_app_role;
> ```
>
> Alternatively point `DATABASE_URL` at a database the role owns, or set
> `DATABASE_SCHEMA=public` if nothing else uses that schema.

## API

All endpoints are under `/api`. Swagger UI documents every one of them:

- Local: http://localhost:4000/api/docs
- Raw spec: http://localhost:4000/api/docs.json

Public: `GET /api/health`, `GET /api/products`, `GET /api/products/:id`,
`GET /api/services`, `GET /api/services/:id`, `GET /api/events`,
`GET /api/events/:id`, `GET /api/categories`, `GET /api/content`,
`POST /api/contact`.

Requires the admin session cookie: every `POST`/`PUT`/`DELETE` on products, services,
events and categories, plus `PUT /api/content`, `GET /api/contact`,
`GET /api/auth/me`, and the `?all=true` form of the product and service lists
(which returns unpublished rows).

Product, service and event writes accept either JSON or `multipart/form-data`
with an `image` file (JPG, PNG, WEBP or GIF, max 5 MB). Uploads are resized to
fit 1600 px, re-encoded to WebP and stored in the database, then served from
`/uploads/...`. Nothing is written to the filesystem, so an upload survives a
restart without anything being deployed.

Rate limits live in PostgreSQL and are shared across restarts and instances:
300 requests / 15 min across `/api`, 10 failed logins / 15 min per IP and 5 per
account on `/api/auth/login`, and 5 submissions / hour on `POST /api/contact`.
The admin JWT is issued only in an HttpOnly, Secure-in-production, SameSite
cookie; frontend JavaScript cannot read it. It expires after 15 minutes without
activity on both the client and API (with a 12-hour absolute limit). The API
tracks each login session in PostgreSQL, so a copied token also stops working
after the idle window. The legacy localStorage token key is deleted on load.

## Tests

```bash
cd backend && npm test
```

End-to-end tests covering auth, the CRUD round-trip, authorization on every
write endpoint, validation rejection, category referential integrity, draft
visibility, Swagger coverage and error status codes. Each run creates a
uniquely named PostgreSQL schema and drops it afterwards, so the suite cannot
touch development or deployed data.

```bash
cd frontend && npm run build   # frontend production build
cd backend  && npm run build   # backend tsc + copy migrations
```

## Running a local production deployment

To exercise the real production path — actual builds, one process serving the
API and the built React app together, exactly as deployed:

```bash
./scripts/serve-local.sh
```

It builds both halves and starts the server on `:4000` (override with `PORT`).
Requires `backend/.env` with `DATABASE_URL` and `JWT_SECRET`.

It builds _without_ `VITE_API_URL`, so the bundle calls same-origin `/api` —
and since the same process answers both, everything is reachable on
`http://localhost:4000` alone and there is no CORS in the picture.

## Deployment

```
                 Internet
                    │
                    ▼
   One web service (Node/Express)
     ├── /api/*      the JSON API
     ├── /uploads/*  uploaded images
     └── /*          the built React app (SPA fallback)
                    │
                    ▼
          Managed PostgreSQL (Neon)
```

The build copies the frontend's `dist/` to `backend/public/`, and the server
serves it when present. One service means one origin, so **there is no CORS to
configure and no backend hostname anywhere** — not in the JS bundle, not in
`render.yaml`. Whatever URL the host assigns, the site works, and adding a
custom domain needs no rebuild.

Because all durable state is in managed Postgres — uploaded images included —
the service is stateless and a redeploy cannot lose data.

`render.yaml` is a ready-to-apply Render blueprint for this shape.
`backend/Dockerfile` builds the same thing as a container (from the repo root:
`docker build -f backend/Dockerfile -t mqicma .`).

Deployment checklist:

1. Create the managed database and note the _pooled_ connection string.
2. Set `DATABASE_URL`, `JWT_SECRET`, `TRUST_PROXY=true` and `PUBLIC_ORIGIN` to
   the canonical HTTPS site URL. Migrations run
   themselves on first boot; nothing else needs preparing.
3. Build with `npm run build:all` and start with `npm start`. Leave
   `VITE_API_URL` unset so the bundle calls same-origin `/api`.
4. Create the first admin with `npm run seed:prod` and a strong
   `SEED_ADMIN_PASSWORD`. Use `seed:prod` rather than `seed` in a deployed
   environment: `seed` runs through `tsx`, a dev dependency that is absent when
   `NODE_ENV=production`, while `seed:prod` runs the compiled `dist/db/seed.js`.

> **Uploaded images need no disk.** Images posted through the admin panel go
> into Postgres (table `uploads`), not onto the filesystem, so no volume is
> required and an upload is durable the moment its request commits. This was not
> always true: they were written to `backend/uploads/` until admin uploads
> started vanishing within hours on Render's free tier, where every deploy,
> restart and wake-from-idle replaces the container and resets its filesystem
> while the rows kept pointing at `/uploads/...`. Keeping the bytes in the one
> store that actually persists also means nobody has to redeploy — or have
> access to this repository — for the site's own images to keep working.

### Custom domain

There is only one service, so point the domain at it and let the host issue the
TLS certificate. The API is then reachable at `https://your-domain/api` and the
admin panel at `https://your-domain/admin/login`. Because the bundle uses a
relative `/api` path, nothing has to be rebuilt or reconfigured.

## Live application

Deployed on Render's free tier as a single web service:

```
Site:         https://mqicma.onrender.com
API:          https://mqicma.onrender.com/api
Admin panel:  https://mqicma.onrender.com/admin/login
```

Swagger is available locally at `/api/docs` while running in development; it
is disabled on the production deployment.

The free instance spins down after roughly 15 minutes without traffic, so the
first request after an idle period takes 30-60 seconds while it wakes up.

Locally, via `./scripts/serve-local.sh`, everything is on one origin too:

```
Site:         http://localhost:4000
API:          http://localhost:4000/api
Swagger:      http://localhost:4000/api/docs
Admin panel:  http://localhost:4000/admin/login
```
