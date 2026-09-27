import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categories.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const categoriesRouter = Router();
categoriesRouter.get("/", asyncHandler(getCategories));
categoriesRouter.post("/", requireAdmin, asyncHandler(createCategory));
categoriesRouter.put(
  "/:id",
  validateUuidParam,
  requireAdmin,
  asyncHandler(updateCategory),
);
categoriesRouter.delete(
  "/:id",
  validateUuidParam,
  requireAdmin,
  asyncHandler(deleteCategory),
);
