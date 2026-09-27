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
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const eventsRouter = Router();
eventsRouter.get("/", asyncHandler(getEvents));
eventsRouter.get("/:id", validateUuidParam, asyncHandler(getEventById));
eventsRouter.post(
  "/",
  requireAuth,
  eventImageUpload,
  asyncHandler(createEvent),
);
eventsRouter.put(
  "/:id",
  validateUuidParam,
  requireAuth,
  eventImageUpload,
  asyncHandler(updateEvent),
);
eventsRouter.delete(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(deleteEvent),
);
