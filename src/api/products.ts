import { apiRequest } from "./client";
import type { Product } from "./types";
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
// `all` also returns inactive (unpublished) rows, which the API only serves to
// an authenticated admin — so the token has to go with it.
export const listProducts = (all = false) =>
  apiRequest<Product[]>(`/products${all ? "?all=true" : ""}`, { auth: all });
export const getProduct = (id: string) => apiRequest<Product>(`/products/${id}`);
export const createProduct = (input: ProductInput) => apiRequest<Product>("/products", { method: "POST", body: input, auth: true });
export const updateProduct = (id: string, input: Partial<ProductInput>) => apiRequest<Product>(`/products/${id}`, { method: "PUT", body: input, auth: true });
export const deleteProduct = (id: string) => apiRequest<void>(`/products/${id}`, { method: "DELETE", auth: true });
