import { apiRequest } from "./client";
import type { Event } from "./types";
export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt"> & {
  imageFile?: File;
};
function toFormData(input: EventInput | Partial<EventInput>) {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (key !== "imageFile" && value !== undefined)
      form.append(key, String(value));
  });
  if (input.imageFile) form.append("image", input.imageFile);
  return form;
}
export const listEvents = (status?: "upcoming" | "past") =>
  apiRequest<Event[]>(`/events${status ? `?status=${status}` : ""}`);
export const getEvent = (id: string) => apiRequest<Event>(`/events/${id}`);
export const createEvent = (input: EventInput) =>
  apiRequest<Event>("/events", {
    method: "POST",
    body: toFormData(input),
    auth: true,
  });
export const updateEvent = (id: string, input: Partial<EventInput>) =>
  apiRequest<Event>(`/events/${id}`, {
    method: "PUT",
    body: toFormData(input),
    auth: true,
  });
export const deleteEvent = (id: string) =>
  apiRequest<void>(`/events/${id}`, {
    method: "DELETE",
    body: undefined,
    auth: true,
  });
