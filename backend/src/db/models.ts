import { randomUUID } from "node:crypto";
import { db } from "./index";

const now = () => new Date().toISOString();

export interface AdminRow { id: string; name: string; email: string; passwordHash: string; role: string; }
export const Admins = {
  findByEmail(email: string): AdminRow | undefined { return db.prepare(`SELECT id, name, email, password_hash as passwordHash, role FROM admins WHERE email = ?`).get(email) as AdminRow | undefined; },
  findById(id: string): AdminRow | undefined { return db.prepare(`SELECT id, name, email, password_hash as passwordHash, role FROM admins WHERE id = ?`).get(id) as AdminRow | undefined; },
  upsert(input: { name: string; email: string; passwordHash: string; role?: string }) { const existing = this.findByEmail(input.email); if (existing) return existing; const id = randomUUID(); db.prepare(`INSERT INTO admins (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, input.name, input.email, input.passwordHash, input.role || "admin", now(), now()); return this.findById(id)!; },
};

export interface CategoryRow { id: string; name: string; type: "product" | "service"; }
export const Categories = {
  list(type?: string): CategoryRow[] { return (type ? db.prepare(`SELECT id, name, type FROM categories WHERE type = ? ORDER BY name ASC`).all(type) : db.prepare(`SELECT id, name, type FROM categories ORDER BY name ASC`).all()) as CategoryRow[]; },
  create(input: { name: string; type: string }) { const id = randomUUID(); db.prepare(`INSERT INTO categories (id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`).run(id, input.name, input.type, now(), now()); return { id, ...input }; },
  update(id: string, input: Partial<{ name: string; type: string }>) { if (!db.prepare(`SELECT id FROM categories WHERE id = ?`).get(id)) return null; const fields: string[] = []; const values: unknown[] = []; if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); } if (input.type !== undefined) { fields.push("type = ?"); values.push(input.type); } fields.push("updated_at = ?"); values.push(now(), id); db.prepare(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`).run(...values); return db.prepare(`SELECT id, name, type FROM categories WHERE id = ?`).get(id) as CategoryRow; },
  remove(id: string): boolean { return db.prepare(`DELETE FROM categories WHERE id = ?`).run(id).changes > 0; },
};

export interface ProductRow { id: string; name: string; price: number; category: string; shortDesc: string; fullDesc: string; image: string; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
const PRODUCT_SELECT = `SELECT id, name, price, category, short_desc as shortDesc, full_desc as fullDesc, image, status, created_at as createdAt, updated_at as updatedAt FROM products`;
export const Products = {
  list(includeInactive = false): ProductRow[] { const sql = includeInactive ? `${PRODUCT_SELECT} ORDER BY created_at DESC` : `${PRODUCT_SELECT} WHERE status = 'active' ORDER BY created_at DESC`; return db.prepare(sql).all() as ProductRow[]; },
  get(id: string): ProductRow | undefined { return db.prepare(`${PRODUCT_SELECT} WHERE id = ?`).get(id) as ProductRow | undefined; },
  create(input: Omit<ProductRow, "id" | "createdAt" | "updatedAt">) { const id = randomUUID(); db.prepare(`INSERT INTO products (id, name, price, category, short_desc, full_desc, image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, input.name, input.price, input.category, input.shortDesc, input.fullDesc, input.image, input.status, now(), now()); return this.get(id)!; },
  update(id: string, input: Partial<Omit<ProductRow, "id" | "createdAt" | "updatedAt">>) { if (!this.get(id)) return null; const map: Record<string, string> = { name: "name", price: "price", category: "category", shortDesc: "short_desc", fullDesc: "full_desc", image: "image", status: "status" }; const fields: string[] = []; const values: unknown[] = []; for (const [key, column] of Object.entries(map)) { const value = (input as Record<string, unknown>)[key]; if (value !== undefined) { fields.push(`${column} = ?`); values.push(value); } } if (!fields.length) return this.get(id)!; fields.push("updated_at = ?"); values.push(now(), id); db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`).run(...values); return this.get(id)!; },
  remove(id: string): boolean { return db.prepare(`DELETE FROM products WHERE id = ?`).run(id).changes > 0; },
};

export interface ServiceRow { id: string; name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
const SERVICE_SELECT = `SELECT id, name, description, full_desc as fullDesc, image, for_whom as forWhom, benefits, status, created_at as createdAt, updated_at as updatedAt FROM services`;
export const Services = {
  list(includeInactive = false): ServiceRow[] { const sql = includeInactive ? `${SERVICE_SELECT} ORDER BY created_at DESC` : `${SERVICE_SELECT} WHERE status = 'active' ORDER BY created_at DESC`; return db.prepare(sql).all() as ServiceRow[]; },
  get(id: string): ServiceRow | undefined { return db.prepare(`${SERVICE_SELECT} WHERE id = ?`).get(id) as ServiceRow | undefined; },
  create(input: { name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string[]; status: string }) { const id = randomUUID(); db.prepare(`INSERT INTO services (id, name, description, full_desc, image, for_whom, benefits, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, input.name, input.description, input.fullDesc, input.image, input.forWhom, JSON.stringify(input.benefits), input.status, now(), now()); return this.get(id)!; },
  update(id: string, input: Partial<{ name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string[]; status: string }>) { if (!this.get(id)) return null; const fields: string[] = []; const values: unknown[] = []; const entries: [string, unknown][] = [["name", input.name], ["description", input.description], ["full_desc", input.fullDesc], ["image", input.image], ["for_whom", input.forWhom], ["benefits", input.benefits === undefined ? undefined : JSON.stringify(input.benefits)], ["status", input.status]]; for (const [field, value] of entries) { if (value !== undefined) { fields.push(`${field} = ?`); values.push(value); } } if (!fields.length) return this.get(id)!; fields.push("updated_at = ?"); values.push(now(), id); db.prepare(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`).run(...values); return this.get(id)!; },
  remove(id: string): boolean { return db.prepare(`DELETE FROM services WHERE id = ?`).run(id).changes > 0; },
};

export interface EventRow { id: string; title: string; date: string; location: string; shortDesc: string; fullDesc: string; image: string; status: "upcoming" | "past"; createdAt: string; updatedAt: string; }
const EVENT_SELECT = `SELECT id, title, date, location, short_desc as shortDesc, full_desc as fullDesc, image, status, created_at as createdAt, updated_at as updatedAt FROM events`;
export const Events = {
  list(status?: string): EventRow[] { const sql = status ? `${EVENT_SELECT} WHERE status = ? ORDER BY date ASC` : `${EVENT_SELECT} ORDER BY date ASC`; return (status ? db.prepare(sql).all(status) : db.prepare(sql).all()) as EventRow[]; },
  get(id: string): EventRow | undefined { return db.prepare(`${EVENT_SELECT} WHERE id = ?`).get(id) as EventRow | undefined; },
  create(input: Omit<EventRow, "id" | "createdAt" | "updatedAt">) { const id = randomUUID(); db.prepare(`INSERT INTO events (id, title, date, location, short_desc, full_desc, image, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, input.title, input.date, input.location, input.shortDesc, input.fullDesc, input.image, input.status, now(), now()); return this.get(id)!; },
  update(id: string, input: Partial<Omit<EventRow, "id" | "createdAt" | "updatedAt">>) { if (!this.get(id)) return null; const map: Record<string, string> = { title: "title", date: "date", location: "location", shortDesc: "short_desc", fullDesc: "full_desc", image: "image", status: "status" }; const fields: string[] = []; const values: unknown[] = []; for (const [key, column] of Object.entries(map)) { const value = (input as Record<string, unknown>)[key]; if (value !== undefined) { fields.push(`${column} = ?`); values.push(value); } } if (!fields.length) return this.get(id)!; fields.push("updated_at = ?"); values.push(now(), id); db.prepare(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`).run(...values); return this.get(id)!; },
  remove(id: string): boolean { return db.prepare(`DELETE FROM events WHERE id = ?`).run(id).changes > 0; },
};

export interface SiteContentRow { heroHeadline: string; heroSubtext: string; aboutIntro: string; mission: string; phone: string; email: string; instagram: string; address: string; }
const CONTENT_SELECT = `SELECT hero_headline as heroHeadline, hero_subtext as heroSubtext, about_intro as aboutIntro, mission, phone, email, instagram, address FROM site_content WHERE id = 'site'`;
export const SiteContent = {
  get(): SiteContentRow | undefined { return db.prepare(CONTENT_SELECT).get() as SiteContentRow | undefined; },
  upsert(input: SiteContentRow) { const existing = db.prepare(`SELECT id FROM site_content WHERE id = 'site'`).get(); if (existing) db.prepare(`UPDATE site_content SET hero_headline=?, hero_subtext=?, about_intro=?, mission=?, phone=?, email=?, instagram=?, address=?, updated_at=? WHERE id = 'site'`).run(input.heroHeadline, input.heroSubtext, input.aboutIntro, input.mission, input.phone, input.email, input.instagram, input.address, now()); else db.prepare(`INSERT INTO site_content (id, hero_headline, hero_subtext, about_intro, mission, phone, email, instagram, address, updated_at) VALUES ('site', ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(input.heroHeadline, input.heroSubtext, input.aboutIntro, input.mission, input.phone, input.email, input.instagram, input.address, now()); return this.get()!; },
  update(input: Partial<SiteContentRow>) { const current = this.get(); return this.upsert({ ...(current || {}) as SiteContentRow, ...input }); },
};

export interface ContactMessageRow { id: string; name: string; phone: string; message: string; createdAt: string; }
export const ContactMessages = {
  list(): ContactMessageRow[] { return db.prepare(`SELECT id, name, phone, message, created_at as createdAt FROM contact_messages ORDER BY created_at DESC`).all() as ContactMessageRow[]; },
  create(input: { name: string; phone: string; message: string }) { const id = randomUUID(); const createdAt = now(); db.prepare(`INSERT INTO contact_messages (id, name, phone, message, created_at) VALUES (?, ?, ?, ?, ?)`).run(id, input.name, input.phone, input.message, createdAt); return { id, ...input, createdAt }; },
};
