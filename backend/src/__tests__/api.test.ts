// End-to-end API tests. Each run creates a uniquely named PostgreSQL schema and
// drops it afterwards, so the suite can never touch development or deployed
// data even when pointed at a shared database.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import test, { after, before } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const TEST_SCHEMA = `test_${crypto.randomBytes(6).toString("hex")}`;

// Must be set before the app (and therefore the db module) is imported.
// dotenv does not overwrite variables that are already present.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL_TEST ||
  "postgresql://127.0.0.1:5432/mqicma_test";
process.env.DATABASE_SCHEMA = TEST_SCHEMA;
process.env.JWT_SECRET = "test-only-secret-not-used-anywhere-else";
process.env.CORS_ORIGIN = "http://localhost:5173";

const ADMIN_EMAIL = "test-admin@example.com";
const ADMIN_PASSWORD = "TestPassword123!";

let server: Server;
let baseUrl: string;
let token: string;

async function api(
  routePath: string,
  init: { method?: string; body?: unknown; token?: string } = {},
) {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  const response = await fetch(`${baseUrl}/api${routePath}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: response.status, body };
}

let closeDb: () => Promise<void>;
let dropSchema: () => Promise<void>;

before(async () => {
  const [{ app }, dbModule, { Admins }, bcryptModule] = await Promise.all([
    import("../index.js"),
    import("../db/index.js"),
    import("../db/models.js"),
    import("bcryptjs"),
  ]);
  // bcryptjs is CommonJS: the callables hang off the default export.
  const bcrypt = bcryptModule.default;

  await dbModule.runMigrations();
  closeDb = dbModule.closeDb;
  dropSchema = async () => {
    await dbModule.pool.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`);
  };

  await Admins.upsert({
    name: "Test Admin",
    email: ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: "admin",
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  server?.close();
  await dropSchema?.();
  await closeDb?.();
});

test("health endpoint responds", async () => {
  const res = await api("/health");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: "ok" });
});

test("public list endpoints return arrays on an empty database", async () => {
  for (const route of ["/products", "/services", "/events", "/categories"]) {
    const res = await api(route);
    assert.equal(res.status, 200, `${route} should be public`);
    assert.ok(Array.isArray(res.body), `${route} should return an array`);
  }
});

test("swagger spec documents every mounted route", async () => {
  const res = await api("/docs.json");
  assert.equal(res.status, 200);
  const paths = Object.keys((res.body as { paths: Record<string, unknown> }).paths);
  for (const expected of [
    "/auth/login",
    "/auth/me",
    "/products",
    "/products/{id}",
    "/services",
    "/services/{id}",
    "/events",
    "/events/{id}",
    "/categories",
    "/categories/{id}",
    "/content",
    "/contact",
  ]) {
    assert.ok(paths.includes(expected), `${expected} is missing from Swagger`);
  }
});

test("writes are rejected without a token", async () => {
  for (const route of ["/products", "/services", "/events", "/categories"]) {
    const res = await api(route, { method: "POST", body: { name: "x" } });
    assert.equal(res.status, 401, `${route} must require auth`);
  }
});

test("login rejects a wrong password", async () => {
  const res = await api("/auth/login", {
    method: "POST",
    body: { email: ADMIN_EMAIL, password: "definitely-wrong" },
  });
  assert.equal(res.status, 401);
});

test("login succeeds and returns a usable token", async () => {
  const res = await api("/auth/login", {
    method: "POST",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  assert.equal(res.status, 200);
  const payload = res.body as { token: string; admin: { email: string } };
  assert.ok(payload.token);
  assert.equal(payload.admin.email, ADMIN_EMAIL);
  token = payload.token;

  const me = await api("/auth/me", { token });
  assert.equal(me.status, 200);
});

test("a tampered token is rejected", async () => {
  const res = await api("/auth/me", { token: `${token}tampered` });
  assert.equal(res.status, 401);
});

test("product create/read/update/delete round-trips", async () => {
  const created = await api("/products", {
    method: "POST",
    token,
    body: {
      name: "Test məhsul",
      price: 12.5,
      category: "Test kateqoriya",
      shortDesc: "Qısa təsvir",
      image: "",
    },
  });
  assert.equal(created.status, 201);
  const product = created.body as { id: string; name: string };

  const read = await api(`/products/${product.id}`);
  assert.equal(read.status, 200);
  assert.equal((read.body as { name: string }).name, "Test məhsul");

  const updated = await api(`/products/${product.id}`, {
    method: "PUT",
    token,
    body: { name: "Yenilənmiş məhsul" },
  });
  assert.equal(updated.status, 200);
  assert.equal((updated.body as { name: string }).name, "Yenilənmiş məhsul");

  const removed = await api(`/products/${product.id}`, { method: "DELETE", token });
  assert.equal(removed.status, 204);

  const gone = await api(`/products/${product.id}`);
  assert.equal(gone.status, 404);
});

test("invalid input is rejected with 400 and creates nothing", async () => {
  const before = await api("/products?all=true", { token });
  const beforeCount = (before.body as unknown[]).length;

  const res = await api("/products", {
    method: "POST",
    token,
    body: { name: "", price: -5, category: "", shortDesc: "" },
  });
  assert.equal(res.status, 400);
  assert.ok((res.body as { error: string }).error);

  const after = await api("/products?all=true", { token });
  assert.equal((after.body as unknown[]).length, beforeCount);
});

test("a category still holding products cannot be deleted", async () => {
  const category = await api("/categories", {
    method: "POST",
    token,
    body: { name: "Silinməyən", type: "product" },
  });
  assert.equal(category.status, 201);
  const { id } = category.body as { id: string };

  const product = await api("/products", {
    method: "POST",
    token,
    body: {
      name: "Kateqoriyalı məhsul",
      price: 5,
      category: "Silinməyən",
      shortDesc: "desc",
      image: "",
    },
  });
  assert.equal(product.status, 201);

  const blocked = await api(`/categories/${id}`, { method: "DELETE", token });
  assert.equal(blocked.status, 409);

  // Renaming must carry the products across, not orphan them.
  const renamed = await api(`/categories/${id}`, {
    method: "PUT",
    token,
    body: { name: "Adı dəyişdi" },
  });
  assert.equal(renamed.status, 200);

  const products = await api("/products?all=true", { token });
  const rows = products.body as { category: string }[];
  assert.equal(rows.filter((p) => p.category === "Adı dəyişdi").length, 1);
  assert.equal(rows.filter((p) => p.category === "Silinməyən").length, 0);
});

test("contact messages are public to submit and private to read", async () => {
  const sent = await api("/contact", {
    method: "POST",
    body: { name: "Ayşə", phone: "+994501234567", message: "Salam" },
  });
  assert.equal(sent.status, 201);

  const unauthorized = await api("/contact");
  assert.equal(unauthorized.status, 401);

  const authorized = await api("/contact", { token });
  assert.equal(authorized.status, 200);
  assert.equal((authorized.body as unknown[]).length, 1);
});

test("unknown api routes return a json 404", async () => {
  const res = await api("/this-route-does-not-exist");
  assert.equal(res.status, 404);
  assert.ok((res.body as { error: string }).error);
});

test("oversized bodies are rejected with 413, not 500", async () => {
  const res = await api("/contact", {
    method: "POST",
    body: { name: "x".repeat(200_000), phone: "+994501234567", message: "m" },
  });
  assert.equal(res.status, 413);
});

test("?all=true does not leak unpublished drafts to anonymous callers", async () => {
  const draft = await api("/products", {
    method: "POST",
    token,
    body: {
      name: "Gizli qaralama",
      price: 1,
      category: "Test kateqoriya",
      shortDesc: "unpublished",
      image: "",
      status: "inactive",
    },
  });
  assert.equal(draft.status, 201);

  // Public list must hide it.
  const publicList = await api("/products");
  assert.equal(publicList.status, 200);
  const publicNames = (publicList.body as { name: string }[]).map((p) => p.name);
  assert.ok(!publicNames.includes("Gizli qaralama"), "draft leaked into the public list");

  // Asking for everything without a token must be refused, not served.
  const anonymousAll = await api("/products?all=true");
  assert.equal(anonymousAll.status, 401);

  // With a token it is visible.
  const adminAll = await api("/products?all=true", { token });
  assert.equal(adminAll.status, 200);
  assert.ok((adminAll.body as { name: string }[]).some((p) => p.name === "Gizli qaralama"));

  // Same rule on services.
  assert.equal((await api("/services?all=true")).status, 401);
  assert.equal((await api("/services?all=true", { token })).status, 200);
});
