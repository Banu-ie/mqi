import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

const uploadRoot = path.join(process.cwd(), "uploads");
const productDir = path.join(uploadRoot, "products");
const serviceDir = path.join(uploadRoot, "services");
const eventDir = path.join(uploadRoot, "events");
fs.mkdirSync(productDir, { recursive: true });
fs.mkdirSync(serviceDir, { recursive: true });
fs.mkdirSync(eventDir, { recursive: true });

const allowedTypes = new Map<string, string[]>([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/gif", [".gif"]],
]);

export function isAllowedImageFile(
  file: Pick<Express.Multer.File, "mimetype" | "originalname">,
) {
  const expectedExtensions = allowedTypes.get(file.mimetype);
  const actualExtension = path.extname(file.originalname).toLowerCase();
  return !!expectedExtensions && expectedExtensions.includes(actualExtension);
}

function createStorage(directory: string) {
  return multer.diskStorage({
    destination: directory,
    filename: (_req, file, callback) => {
      const extension = allowedTypes.get(file.mimetype)?.[0] ?? ".img";
      callback(null, `${randomUUID()}${extension}`);
    },
  });
}

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!isAllowedImageFile(file)) {
    return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
  }
  callback(null, true);
};

export const productImageUpload = multer({
  storage: createStorage(productDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
export const serviceImageUpload = multer({
  storage: createStorage(serviceDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
export const eventImageUpload = multer({
  storage: createStorage(eventDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
