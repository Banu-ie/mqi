import { apiRequest } from "./client";
import type { Product } from "./types";
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & { imageFile?: File };
function toFormData(input: ProductInput) { const form = new FormData(); Object.entries(input).forEach(([key, value]) => { if (key !== "imageFile" && value !== undefined) form.append(key, String(value)); }); if (input.imageFile) form.append("image", input.imageFile); return form; }
export const listProducts = (all = false) => apiRequest<Product[]>(`/products${all ? "?all=true" : ""}`, { auth: all });
export const getProduct = (id: string) => apiRequest<Product>(`/products/${id}`);
export const createProduct = (input: ProductInput) => apiRequest<Product>("/products", { method: "POST", body: toFormData(input), auth: true });
export const updateProduct = (id: string, input: Partial<ProductInput>) => apiRequest<Product>(`/products/${id}`, { method: "PUT", body: toFormData(input), auth: true });
export const deleteProduct = (id: string) => apiRequest<void>(`/products/${id}`, { method: "DELETE", auth: true });
