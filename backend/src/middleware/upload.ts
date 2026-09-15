import path from "node:path";
import multer from "multer";

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

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!isAllowedImageFile(file)) {
    return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
  }
  callback(null, true);
};

/**
 * Uploads are buffered in memory, never written to disk: this deployment's
 * filesystem is wiped whenever the container is replaced, so a file saved there
 * is lost within hours. The controllers hand the buffer to lib/imageStore,
 * which keeps it in the database instead — the only storage that outlives the
 * container.
 *
 * The 5 MB per-file cap bounds what this holds at once: a full product gallery
 * is at most 11 files, so ~55 MB worst case against the instance's 512 MB.
 */
const storage = multer.memoryStorage();

/** How many pictures one product's gallery may hold. */
export const MAX_PRODUCT_IMAGES = 10;

// Products take a gallery, so they accept a batch under `images` — while still
// accepting the original single `image` field, which the admin panel sent
// before galleries existed and which keeps older clients working.
export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_PRODUCT_IMAGES + 1 },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: MAX_PRODUCT_IMAGES },
]);
export const serviceImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
export const eventImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
