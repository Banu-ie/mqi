import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categories.controller";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const categoriesRouter = Router();
categoriesRouter.get("/", asyncHandler(getCategories));
categoriesRouter.post("/", requireAuth, asyncHandler(createCategory));
categoriesRouter.put(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(updateCategory),
);
categoriesRouter.delete(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(deleteCategory),
);
