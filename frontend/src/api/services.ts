import { apiRequest } from "./client";
import type { Service } from "./types";
export type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt"> & { imageFile?: File };
function toFormData(input: ServiceInput | Partial<ServiceInput>) { const form = new FormData(); Object.entries(input).forEach(([key, value]) => { if (key !== "imageFile" && value !== undefined) form.append(key, Array.isArray(value) ? value.join("\n") : String(value)); }); if (input.imageFile) form.append("image", input.imageFile); return form; }
export const listServices = (all = false) => apiRequest<Service[]>(`/services${all ? "?all=true" : ""}`, { auth: all });
export const getService = (id: string) => apiRequest<Service>(`/services/${id}`);
export const createService = (input: ServiceInput) => apiRequest<Service>("/services", { method: "POST", body: toFormData(input), auth: true });
export const updateService = (id: string, input: Partial<ServiceInput>) => apiRequest<Service>(`/services/${id}`, { method: "PUT", body: toFormData(input), auth: true });
export const deleteService = (id: string) => apiRequest<void>(`/services/${id}`, { method: "DELETE", auth: true });
