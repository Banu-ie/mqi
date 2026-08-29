import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

const uploadRoot = path.join(process.cwd(), "uploads");
const productDir = path.join(uploadRoot, "products");
const serviceDir = path.join(uploadRoot, "services");
fs.mkdirSync(productDir, { recursive: true });
fs.mkdirSync(serviceDir, { recursive: true });

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function createStorage(directory: string) {
  return multer.diskStorage({
    destination: directory,
    filename: (_req, file, callback) => callback(null, `${randomUUID()}${allowedTypes.get(file.mimetype) ?? ".img"}`),
  });
}

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const expectedExtension = allowedTypes.get(file.mimetype);
  const actualExtension = path.extname(file.originalname).toLowerCase();
  if (!expectedExtension || actualExtension !== expectedExtension) return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
  callback(null, true);
};

export const productImageUpload = multer({ storage: createStorage(productDir), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single("image");
export const serviceImageUpload = multer({ storage: createStorage(serviceDir), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single("image");
