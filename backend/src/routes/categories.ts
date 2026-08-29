import { Router } from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/categories.controller";
import { requireAuth } from "../middleware/requireAuth";
export const categoriesRouter = Router();
categoriesRouter.get("/", getCategories);
categoriesRouter.post("/", requireAuth, createCategory);
categoriesRouter.put("/:id", requireAuth, updateCategory);
categoriesRouter.delete("/:id", requireAuth, deleteCategory);
