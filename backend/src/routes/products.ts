import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/products.controller";
import { requireAuth } from "../middleware/requireAuth";
import { productImageUpload } from "../middleware/upload";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateUuidParam } from "../middleware/validateUuidParam";
export const productsRouter = Router();
productsRouter.get(
  "/",
  (req, res, next) =>
    req.query.all === "true" ? requireAuth(req, res, next) : next(),
  asyncHandler(getProducts),
);
productsRouter.get("/:id", validateUuidParam, asyncHandler(getProductById));
productsRouter.post(
  "/",
  requireAuth,
  productImageUpload,
  asyncHandler(createProduct),
);
productsRouter.put(
  "/:id",
  validateUuidParam,
  requireAuth,
  productImageUpload,
  asyncHandler(updateProduct),
);
productsRouter.delete(
  "/:id",
  validateUuidParam,
  requireAuth,
  asyncHandler(deleteProduct),
);
