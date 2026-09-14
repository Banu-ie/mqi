import { apiRequest } from "./client";
import type { Product } from "./types";

/**
 * `image` is absent on purpose: the cover is whatever sits first in `images`,
 * and the server derives it. Sending both would invite the two to disagree.
 *
 * `images` lists the existing pictures to keep, in order; `imageFiles` carries
 * newly chosen files, which the server appends after them.
 */
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "image"> & {
  imageFiles?: File[];
};

function toFormData(input: Partial<ProductInput>) {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (key === "imageFiles" || value === undefined) return;
    // The gallery goes as JSON so its order survives; String(array) would
    // flatten it to a comma-joined string and lose every URL containing one.
    form.append(key, key === "images" ? JSON.stringify(value) : String(value));
  });
  (input.imageFiles ?? []).forEach((file) => form.append("images", file));
  return form;
}

export const listProducts = (all = false) => apiRequest<Product[]>(`/products${all ? "?all=true" : ""}`, { auth: all });
export const getProduct = (id: string) => apiRequest<Product>(`/products/${id}`);
export const createProduct = (input: ProductInput) => apiRequest<Product>("/products", { method: "POST", body: toFormData(input), auth: true });
export const updateProduct = (id: string, input: Partial<ProductInput>) => apiRequest<Product>(`/products/${id}`, { method: "PUT", body: toFormData(input), auth: true });
export const deleteProduct = (id: string) => apiRequest<void>(`/products/${id}`, { method: "DELETE", auth: true });
