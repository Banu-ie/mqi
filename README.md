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
| Database | PostgreSQL via `pg` (managed: Neon) |
| Auth | JWT (12 h expiry) + bcrypt password hashing |
| Validation | zod |
| Uploads | multer (images to `backend/uploads/`) |
| API docs | Swagger UI / OpenAPI 3 (`swagger-jsdoc`) |
| Hardening | helmet, express-rate-limit, CORS allowlist, 100 kB body cap |
| Tests | `node:test` via `tsx`, against a throwaway PostgreSQL schema |

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
│   ├── uploads/          # uploaded images (not in git)
│   └── Dockerfile
├── render.yaml           # Render blueprint: backend + static frontend
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
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@mqicma.az` /
`REDACTED`). **Change the password before deploying.**

## Environment variables

Backend (`backend/.env`; templates in `backend/.env.example` and
`backend/.env.production.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **yes** | PostgreSQL connection string. Server exits on boot if unset. Use the *pooled* endpoint on Neon. |
| `JWT_SECRET` | **yes** | Server exits on boot if unset. Use ≥48 random bytes. |
| `DATABASE_SCHEMA` | no | Schema holding this app's tables. Default `mqicma`. |
| `DATABASE_POOL_MAX` | no | Max pooled connections, default `10`. Keep low on serverless Postgres. |
| `PORT` | no | Default `4000`. |
| `CORS_ORIGIN` | no | Comma-separated allowlist. Unnecessary in a single-origin deployment. |
| `TRUST_PROXY` | no | Set `"true"` behind a hosting proxy so rate limiting sees the real client IP. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | no | Read by `npm run seed` only. |
| `TEST_DATABASE_URL` | no | Used by `npm test`. Defaults to `postgresql://127.0.0.1:5432/mqicma_test`. |

Frontend (`frontend/.env`, template in `frontend/.env.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | no | Full API base URL including `/api`. Baked in at build time. Leave unset for a single-origin deployment — the app then calls same-origin `/api`. |

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
  demo catalogue. Never run the reset form against production.
- **Tables**: `admins`, `categories`, `products`, `services`, `events`,
  `site_content`, `contact_messages`, plus indexes on the columns the API
  filters and sorts on.
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

Requires a bearer token: every `POST`/`PUT`/`DELETE` on products, services,
events and categories, plus `PUT /api/content`, `GET /api/contact`,
`GET /api/auth/me`, and the `?all=true` form of the product and service lists
(which returns unpublished rows).

Product, service and event writes accept either JSON or `multipart/form-data`
with an `image` file (JPG, PNG, WEBP or GIF, max 5 MB). Uploads are stored under
`backend/uploads/` and served from `/uploads/...`.

Rate limits: 300 requests / 15 min across `/api`, 10 failed logins / 15 min on
`/api/auth/login`, 5 submissions / hour on `POST /api/contact`.

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

To exercise the real production path — actual builds, backend serving from
`dist/`, frontend served as static files:

```bash
./scripts/serve-local.sh
```

It builds both halves, starts the backend on `:4000` and the static frontend on
`:4173`, and stops both on Ctrl-C. Override with `BACKEND_PORT` /
`FRONTEND_PORT`. Requires `backend/.env` with `DATABASE_URL` and `JWT_SECRET`.

It builds *without* `VITE_API_URL`, so the bundle calls same-origin `/api` and
Vite's preview server proxies that to the backend — the same single-origin shape
as production, where the static host does the rewrite instead. So everything is
reachable on `http://localhost:4173` alone, and there is no CORS in the picture.

## Deployment

```
                 Internet
                    │
                    ▼
       Static frontend (Vite build → CDN)
                    │  /api/* rewritten to the backend (same origin)
                    ▼
        Backend (Node/Express, stateless)
                    │
                    ▼
          Managed PostgreSQL (Neon)
```

Because all state is in managed Postgres, the backend is stateless: no
persistent disk, and a redeploy cannot lose data.

`render.yaml` is a ready-to-apply Render blueprint for this shape.
`backend/Dockerfile` builds the same thing as a container for any Docker host.

Deployment checklist:

1. Create the managed database and note the pooled connection string.
2. Backend: set `DATABASE_URL`, `JWT_SECRET` and `TRUST_PROXY=true`. Migrations
   run themselves on first boot.
3. Frontend: leave `VITE_API_URL` unset and add a rewrite sending `/api/*` to
   the backend. That keeps everything on one origin, so there is no CORS to
   configure and the backend host never appears in the JS bundle — which also
   means a domain change needs no rebuild.
4. Point the SPA's other unmatched routes at `index.html`, or refreshing
   `/mehsullar` returns a 404.
5. Create the first admin with `npm run seed` and a strong
   `SEED_ADMIN_PASSWORD`.

### Custom domain

With the single-origin setup, only the frontend needs the domain. Point the
domain at the frontend host, let it issue the TLS certificate, and the API stays
reachable at `https://your-domain/api`. Nothing has to be rebuilt or
reconfigured on the backend.

## Live application

Not deployed to a public host yet. Locally, via `./scripts/serve-local.sh`:

```
Frontend URL: http://localhost:4173
Backend URL:  http://localhost:4000/api
Swagger URL:  http://localhost:4000/api/docs
Admin panel:  http://localhost:4173/admin/login
```
