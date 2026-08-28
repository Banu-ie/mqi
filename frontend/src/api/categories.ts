import { apiRequest } from "./client";
import type { Category } from "./types";
export type CategoryInput = Omit<Category, "id">;
export const listCategories = (type?: "product" | "service") => apiRequest<Category[]>(`/categories${type ? `?type=${type}` : ""}`);
export const createCategory = (input: CategoryInput) => apiRequest<Category>("/categories", { method: "POST", body: input, auth: true });
export const updateCategory = (id: string, input: Partial<CategoryInput>) => apiRequest<Category>(`/categories/${id}`, { method: "PUT", body: input, auth: true });
export const deleteCategory = (id: string) => apiRequest<void>(`/categories/${id}`, { method: "DELETE", auth: true });
