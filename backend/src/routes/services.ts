import { Router } from "express";
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/services.controller";
import { requireAuth } from "../middleware/requireAuth";
import { serviceImageUpload, verifyImageContent } from "../middleware/upload";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const servicesRouter = Router();
servicesRouter.get(
  "/",
  (req, res, next) =>
    req.query.all === "true" ? requireAuth(req, res, next) : next(),
  asyncHandler(getServices),
);
servicesRouter.get("/:id", validateUuidParam, asyncHandler(getServiceById));
servicesRouter.post(
  "/",
  requireAuth,
  serviceImageUpload,
  verifyImageContent,
  asyncHandler(createService),
);
servicesRouter.put(
  "/:id",
  validateUuidParam,
  requireAuth,
  serviceImageUpload,
  verifyImageContent,
  asyncHandler(updateService),
);
servicesRouter.delete(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(deleteService),
);
