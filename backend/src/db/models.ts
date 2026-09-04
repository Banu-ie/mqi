import { execute, query, queryOne, withTransaction } from "./index";

/**
 * Builds the SET clause for a partial update.
 * Returns undefined when the input contains no updatable fields.
 */
function buildUpdate(
  input: Record<string, unknown>,
  columns: Record<string, string>,
): { clause: string; values: unknown[] } | undefined {
  const parts: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(columns)) {
    const value = input[key];
    if (value !== undefined) {
      values.push(value);
      parts.push(`${column} = $${values.length}`);
    }
  }
  if (parts.length === 0) return undefined;
  parts.push("updated_at = now()");
  return { clause: parts.join(", "), values };
}

export interface AdminRow { id: string; name: string; email: string; passwordHash: string; role: string; }
const ADMIN_SELECT = `SELECT id, name, email, password_hash AS "passwordHash", role FROM admins`;
export const Admins = {
  findByEmail(email: string) { return queryOne<AdminRow>(`${ADMIN_SELECT} WHERE email = $1`, [email]); },
  findById(id: string) { return queryOne<AdminRow>(`${ADMIN_SELECT} WHERE id = $1`, [id]); },
  async upsert(input: { name: string; email: string; passwordHash: string; role?: string }): Promise<AdminRow> {
    const existing = await this.findByEmail(input.email);
    if (existing) return existing;
    const rows = await query<AdminRow>(
      `INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, password_hash AS "passwordHash", role`,
      [input.name, input.email, input.passwordHash, input.role || "admin"],
    );
    return rows[0];
  },
};

export interface CategoryRow { id: string; name: string; type: "product" | "service"; }
const CATEGORY_COLUMNS = { name: "name", type: "type" };
export const Categories = {
  get(id: string) { return queryOne<CategoryRow>(`SELECT id, name, type FROM categories WHERE id = $1`, [id]); },
  list(type?: string) {
    return type
      ? query<CategoryRow>(`SELECT id, name, type FROM categories WHERE type = $1 ORDER BY name ASC`, [type])
      : query<CategoryRow>(`SELECT id, name, type FROM categories ORDER BY name ASC`);
  },
  async create(input: { name: string; type: string }): Promise<CategoryRow> {
    const rows = await query<CategoryRow>(
      `INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id, name, type`,
      [input.name, input.type],
    );
    return rows[0];
  },
  async update(id: string, input: Partial<{ name: string; type: string }>): Promise<CategoryRow | null> {
    const update = buildUpdate(input, CATEGORY_COLUMNS);
    if (!update) return (await this.get(id)) ?? null;
    const rows = await query<CategoryRow>(
      `UPDATE categories SET ${update.clause} WHERE id = $${update.values.length + 1} RETURNING id, name, type`,
      [...update.values, id],
    );
    return rows[0] ?? null;
  },
  async remove(id: string): Promise<boolean> {
    return (await execute(`DELETE FROM categories WHERE id = $1`, [id])) > 0;
  },
};

export interface ProductRow { id: string; name: string; price: number; category: string; shortDesc: string; fullDesc: string; image: string; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
const PRODUCT_SELECT = `SELECT id, name, price, category, short_desc AS "shortDesc", full_desc AS "fullDesc", image, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM products`;
const PRODUCT_COLUMNS = { name: "name", price: "price", category: "category", shortDesc: "short_desc", fullDesc: "full_desc", image: "image", status: "status" };
export const Products = {
  list(includeInactive = false) {
    return includeInactive
      ? query<ProductRow>(`${PRODUCT_SELECT} ORDER BY created_at DESC`)
      : query<ProductRow>(`${PRODUCT_SELECT} WHERE status = 'active' ORDER BY created_at DESC`);
  },
  get(id: string) { return queryOne<ProductRow>(`${PRODUCT_SELECT} WHERE id = $1`, [id]); },
  async create(input: Omit<ProductRow, "id" | "createdAt" | "updatedAt">): Promise<ProductRow> {
    const rows = await query<ProductRow>(
      `INSERT INTO products (name, price, category, short_desc, full_desc, image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, price, category, short_desc AS "shortDesc", full_desc AS "fullDesc", image, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [input.name, input.price, input.category, input.shortDesc, input.fullDesc, input.image, input.status],
    );
    return rows[0];
  },
  async update(id: string, input: Partial<Omit<ProductRow, "id" | "createdAt" | "updatedAt">>): Promise<ProductRow | null> {
    const update = buildUpdate(input as Record<string, unknown>, PRODUCT_COLUMNS);
    if (!update) return (await this.get(id)) ?? null;
    const rows = await query<ProductRow>(
      `UPDATE products SET ${update.clause} WHERE id = $${update.values.length + 1}
       RETURNING id, name, price, category, short_desc AS "shortDesc", full_desc AS "fullDesc", image, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [...update.values, id],
    );
    return rows[0] ?? null;
  },
  async remove(id: string): Promise<boolean> {
    return (await execute(`DELETE FROM products WHERE id = $1`, [id])) > 0;
  },
  async countByCategory(category: string): Promise<number> {
    const row = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM products WHERE category = $1`,
      [category],
    );
    return row?.count ?? 0;
  },
  renameCategory(from: string, to: string): Promise<number> {
    return execute(`UPDATE products SET category = $1, updated_at = now() WHERE category = $2`, [to, from]);
  },
};

export interface ServiceRow { id: string; name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
const SERVICE_FIELDS = `id, name, description, full_desc AS "fullDesc", image, for_whom AS "forWhom", benefits, status, created_at AS "createdAt", updated_at AS "updatedAt"`;
const SERVICE_SELECT = `SELECT ${SERVICE_FIELDS} FROM services`;
const SERVICE_COLUMNS = { name: "name", description: "description", fullDesc: "full_desc", image: "image", forWhom: "for_whom", benefits: "benefits", status: "status" };
export const Services = {
  list(includeInactive = false) {
    return includeInactive
      ? query<ServiceRow>(`${SERVICE_SELECT} ORDER BY created_at DESC`)
      : query<ServiceRow>(`${SERVICE_SELECT} WHERE status = 'active' ORDER BY created_at DESC`);
  },
  get(id: string) { return queryOne<ServiceRow>(`${SERVICE_SELECT} WHERE id = $1`, [id]); },
  async create(input: { name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string[]; status: string }): Promise<ServiceRow> {
    const rows = await query<ServiceRow>(
      `INSERT INTO services (name, description, full_desc, image, for_whom, benefits, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${SERVICE_FIELDS}`,
      [input.name, input.description, input.fullDesc, input.image, input.forWhom, JSON.stringify(input.benefits), input.status],
    );
    return rows[0];
  },
  async update(id: string, input: Partial<{ name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string[]; status: string }>): Promise<ServiceRow | null> {
    const normalized: Record<string, unknown> = { ...input };
    if (input.benefits !== undefined) normalized.benefits = JSON.stringify(input.benefits);
    const update = buildUpdate(normalized, SERVICE_COLUMNS);
    if (!update) return (await this.get(id)) ?? null;
    const rows = await query<ServiceRow>(
      `UPDATE services SET ${update.clause} WHERE id = $${update.values.length + 1} RETURNING ${SERVICE_FIELDS}`,
      [...update.values, id],
    );
    return rows[0] ?? null;
  },
  async remove(id: string): Promise<boolean> {
    return (await execute(`DELETE FROM services WHERE id = $1`, [id])) > 0;
  },
};

export interface EventRow { id: string; title: string; date: string; location: string; shortDesc: string; fullDesc: string; image: string; status: "upcoming" | "past"; createdAt: string; updatedAt: string; }
const EVENT_FIELDS = `id, title, date, location, short_desc AS "shortDesc", full_desc AS "fullDesc", image, status, created_at AS "createdAt", updated_at AS "updatedAt"`;
const EVENT_SELECT = `SELECT ${EVENT_FIELDS} FROM events`;
const EVENT_COLUMNS = { title: "title", date: "date", location: "location", shortDesc: "short_desc", fullDesc: "full_desc", image: "image", status: "status" };
export const Events = {
  list(status?: string) {
    return status
      ? query<EventRow>(`${EVENT_SELECT} WHERE status = $1 ORDER BY date ASC`, [status])
      : query<EventRow>(`${EVENT_SELECT} ORDER BY date ASC`);
  },
  get(id: string) { return queryOne<EventRow>(`${EVENT_SELECT} WHERE id = $1`, [id]); },
  async create(input: Omit<EventRow, "id" | "createdAt" | "updatedAt">): Promise<EventRow> {
    const rows = await query<EventRow>(
      `INSERT INTO events (title, date, location, short_desc, full_desc, image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${EVENT_FIELDS}`,
      [input.title, input.date, input.location, input.shortDesc, input.fullDesc, input.image, input.status],
    );
    return rows[0];
  },
  async update(id: string, input: Partial<Omit<EventRow, "id" | "createdAt" | "updatedAt">>): Promise<EventRow | null> {
    const update = buildUpdate(input as Record<string, unknown>, EVENT_COLUMNS);
    if (!update) return (await this.get(id)) ?? null;
    const rows = await query<EventRow>(
      `UPDATE events SET ${update.clause} WHERE id = $${update.values.length + 1} RETURNING ${EVENT_FIELDS}`,
      [...update.values, id],
    );
    return rows[0] ?? null;
  },
  async remove(id: string): Promise<boolean> {
    return (await execute(`DELETE FROM events WHERE id = $1`, [id])) > 0;
  },
};

export interface SiteContentRow { heroHeadline: string; heroSubtext: string; aboutIntro: string; mission: string; phone: string; email: string; instagram: string; address: string; }
const CONTENT_FIELDS = `hero_headline AS "heroHeadline", hero_subtext AS "heroSubtext", about_intro AS "aboutIntro", mission, phone, email, instagram, address`;
export const SiteContent = {
  get() { return queryOne<SiteContentRow>(`SELECT ${CONTENT_FIELDS} FROM site_content WHERE id = 'site'`); },
  async upsert(input: SiteContentRow): Promise<SiteContentRow> {
    const rows = await query<SiteContentRow>(
      `INSERT INTO site_content (id, hero_headline, hero_subtext, about_intro, mission, phone, email, instagram, address, updated_at)
       VALUES ('site', $1, $2, $3, $4, $5, $6, $7, $8, now())
       ON CONFLICT (id) DO UPDATE SET
         hero_headline = EXCLUDED.hero_headline,
         hero_subtext  = EXCLUDED.hero_subtext,
         about_intro   = EXCLUDED.about_intro,
         mission       = EXCLUDED.mission,
         phone         = EXCLUDED.phone,
         email         = EXCLUDED.email,
         instagram     = EXCLUDED.instagram,
         address       = EXCLUDED.address,
         updated_at    = now()
       RETURNING ${CONTENT_FIELDS}`,
      [input.heroHeadline, input.heroSubtext, input.aboutIntro, input.mission, input.phone, input.email, input.instagram, input.address],
    );
    return rows[0];
  },
  async update(input: Partial<SiteContentRow>): Promise<SiteContentRow> {
    // Read-modify-write has to be atomic, or two concurrent partial edits can
    // lose one another's fields.
    return withTransaction(async (client) => {
      const current = (
        await client.query<SiteContentRow>(
          `SELECT ${CONTENT_FIELDS} FROM site_content WHERE id = 'site' FOR UPDATE`,
        )
      ).rows[0];
      const merged = { ...((current || {}) as SiteContentRow), ...input };
      const rows = await client.query<SiteContentRow>(
        `INSERT INTO site_content (id, hero_headline, hero_subtext, about_intro, mission, phone, email, instagram, address, updated_at)
         VALUES ('site', $1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (id) DO UPDATE SET
           hero_headline = EXCLUDED.hero_headline,
           hero_subtext  = EXCLUDED.hero_subtext,
           about_intro   = EXCLUDED.about_intro,
           mission       = EXCLUDED.mission,
           phone         = EXCLUDED.phone,
           email         = EXCLUDED.email,
           instagram     = EXCLUDED.instagram,
           address       = EXCLUDED.address,
           updated_at    = now()
         RETURNING ${CONTENT_FIELDS}`,
        [merged.heroHeadline, merged.heroSubtext, merged.aboutIntro, merged.mission, merged.phone, merged.email, merged.instagram, merged.address],
      );
      return rows.rows[0];
    });
  },
};

export interface ContactMessageRow { id: string; name: string; phone: string; message: string; createdAt: string; }
export const ContactMessages = {
  list() {
    return query<ContactMessageRow>(
      `SELECT id, name, phone, message, created_at AS "createdAt" FROM contact_messages ORDER BY created_at DESC`,
    );
  },
  async create(input: { name: string; phone: string; message: string }): Promise<ContactMessageRow> {
    const rows = await query<ContactMessageRow>(
      `INSERT INTO contact_messages (name, phone, message) VALUES ($1, $2, $3)
       RETURNING id, name, phone, message, created_at AS "createdAt"`,
      [input.name, input.phone, input.message],
    );
    return rows[0];
  },
};
