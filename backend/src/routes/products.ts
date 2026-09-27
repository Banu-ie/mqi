import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/products.controller";
import { requireAdmin } from "../middleware/requireAuth";
import { productImageUpload, verifyImageContent } from "../middleware/upload";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const productsRouter = Router();
productsRouter.get(
  "/",
  (req, res, next) =>
    req.query.all === "true" ? requireAdmin(req, res, next) : next(),
  asyncHandler(getProducts),
);
productsRouter.get("/:id", validateUuidParam, asyncHandler(getProductById));
productsRouter.post(
  "/",
  requireAdmin,
  productImageUpload,
  verifyImageContent,
  asyncHandler(createProduct),
);
productsRouter.put(
  "/:id",
  validateUuidParam,
  requireAdmin,
  productImageUpload,
  verifyImageContent,
  asyncHandler(updateProduct),
);
productsRouter.delete(
  "/:id",
  validateUuidParam,
  requireAdmin,
  asyncHandler(deleteProduct),
);
