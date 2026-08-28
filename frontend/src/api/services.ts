import { apiRequest } from "./client";
import type { Service } from "./types";
export type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt">;
export const listServices = (all = false) => apiRequest<Service[]>(`/services${all ? "?all=true" : ""}`);
export const getService = (id: string) => apiRequest<Service>(`/services/${id}`);
export const createService = (input: ServiceInput) => apiRequest<Service>("/services", { method: "POST", body: input, auth: true });
export const updateService = (id: string, input: Partial<ServiceInput>) => apiRequest<Service>(`/services/${id}`, { method: "PUT", body: input, auth: true });
export const deleteService = (id: string) => apiRequest<void>(`/services/${id}`, { method: "DELETE", auth: true });
