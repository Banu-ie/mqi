import { apiRequest } from "./client";
import type { Service } from "./types";
export type ServiceInput = Omit<Service, "id" | "createdAt" | "updatedAt">;
// `all` also returns inactive (unpublished) rows, which the API only serves to
// an authenticated admin — so the token has to go with it.
export const listServices = (all = false) =>
  apiRequest<Service[]>(`/services${all ? "?all=true" : ""}`, { auth: all });
export const getService = (id: string) => apiRequest<Service>(`/services/${id}`);
export const createService = (input: ServiceInput) => apiRequest<Service>("/services", { method: "POST", body: input, auth: true });
export const updateService = (id: string, input: Partial<ServiceInput>) => apiRequest<Service>(`/services/${id}`, { method: "PUT", body: input, auth: true });
export const deleteService = (id: string) => apiRequest<void>(`/services/${id}`, { method: "DELETE", auth: true });
