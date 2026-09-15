import sharp from "sharp";
import { Uploads, type UploadKind } from "../db/models";

/**
 * Where uploaded pictures are kept.
 *
 * They go into the database rather than onto disk because this deployment's
 * filesystem does not survive the container: every deploy, restart and
 * wake-from-idle resets it to what the build produced, which erased admin
 * uploads within hours while the rows kept pointing at them (see migration
 * 003). Storing them here means an upload is durable as soon as its request
 * commits — nothing to deploy, and nobody has to touch the code afterwards.
 */

/**
 * Longest edge kept for a stored image. Phone photos arrive at 3000-4000 px and
 * several megabytes; the largest this site ever displays one is a full-width
 * detail view, so anything beyond this is weight the database pays for and
 * every visitor downloads for nothing.
 */
const MAX_DIMENSION = 1600;

const extensionByMime = new Map<string, string>([
  ["image/webp", ".webp"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
]);

/**
 * Re-encodes an upload to WebP at a sane size. A 4 MB phone photo typically
 * lands under 300 kB, which is what makes keeping images in a database on a
 * free Postgres tier reasonable rather than reckless.
 *
 * If sharp cannot read the file we keep the original bytes: the upload already
 * passed the type check, and storing it unprocessed is a better outcome for the
 * admin than a failed save.
 */
async function encode(
  file: Pick<Express.Multer.File, "buffer" | "mimetype">,
): Promise<{ mime: string; bytes: Buffer }> {
  try {
    const bytes = await sharp(file.buffer, { animated: file.mimetype === "image/gif" })
      // Applies the EXIF orientation and then drops it, so a photo taken in
      // portrait is stored upright rather than leaving the viewer to rotate it.
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    return { mime: "image/webp", bytes };
  } catch (error) {
    console.warn(`Could not re-encode an upload, storing it as sent: ${(error as Error).message}`);
    return { mime: file.mimetype, bytes: file.buffer };
  }
}

/**
 * Persists one uploaded file and returns the URL that refers to it.
 *
 * The URL keeps the `/uploads/<kind>/<name>` shape the filesystem used, so
 * every existing reader — the stored rows, the validators, the admin panel, the
 * public cards — carries on working unchanged. Only what sits behind the path
 * has moved.
 */
export async function storeUpload(
  kind: UploadKind,
  file: Pick<Express.Multer.File, "buffer" | "mimetype">,
): Promise<string> {
  const { mime, bytes } = await encode(file);
  const id = await Uploads.create({ kind, mime, bytes });
  return `/uploads/${kind}/${id}${extensionByMime.get(mime) ?? ".img"}`;
}
