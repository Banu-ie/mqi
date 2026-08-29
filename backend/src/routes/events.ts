import { Router } from "express";
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../controllers/events.controller";
import { requireAuth } from "../middleware/requireAuth";
export const eventsRouter = Router();
eventsRouter.get("/", getEvents);
eventsRouter.get("/:id", getEventById);
eventsRouter.post("/", requireAuth, createEvent);
eventsRouter.put("/:id", requireAuth, updateEvent);
eventsRouter.delete("/:id", requireAuth, deleteEvent);
