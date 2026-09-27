import { Router } from "express";
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/services.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { serviceImageUpload, verifyImageContent } from "../middleware/upload";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const servicesRouter = Router();
servicesRouter.get(
  "/",
  (req, res, next) =>
    req.query.all === "true" ? requireAdmin(req, res, next) : next(),
  asyncHandler(getServices),
);
servicesRouter.get("/:id", validateUuidParam, asyncHandler(getServiceById));
servicesRouter.post(
  "/",
  requireAdmin,
  serviceImageUpload,
  verifyImageContent,
  asyncHandler(createService),
);
servicesRouter.put(
  "/:id",
  validateUuidParam,
  requireAdmin,
  serviceImageUpload,
  verifyImageContent,
  asyncHandler(updateService),
);
servicesRouter.delete(
  "/:id",
  validateUuidParam,
  requireAdmin,
  asyncHandler(deleteService),
);
