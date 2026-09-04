import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/events.controller";
import { requireAuth } from "../middleware/requireAuth";
import { eventImageUpload } from "../middleware/upload";
export const eventsRouter = Router();
eventsRouter.get("/", getEvents);
eventsRouter.get("/:id", getEventById);
eventsRouter.post("/", requireAuth, eventImageUpload, createEvent);
eventsRouter.put("/:id", requireAuth, eventImageUpload, updateEvent);
eventsRouter.delete("/:id", requireAuth, deleteEvent);
