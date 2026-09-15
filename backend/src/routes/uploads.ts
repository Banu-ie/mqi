import { Router } from "express";
import { Uploads } from "../db/models";

/**
 * Serves images stored in the database, at the same `/uploads/...` paths the
 * filesystem used to serve. The filename carries the row id; the extension is
 * cosmetic, so that saving a picture from the site gives a sensibly named file
 * and the URL still looks like an image to anything that sniffs it.
 */
const ID_IN_FILENAME = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export const uploadsRouter = Router();

uploadsRouter.get("/:kind/:file", async (req, res, next) => {
  const id = ID_IN_FILENAME.exec(req.params.file)?.[1];
  // Not one of ours — fall through to the 404 the old filesystem path gave.
  if (!id) return next();
  try {
    const upload = await Uploads.get(id);
    if (!upload) return next();
    res.type(upload.mime);
    // The id names these exact bytes and nothing ever rewrites them, so a
    // browser never needs to ask twice. res.send() adds the ETag, which keeps
    // the database out of the request once a visitor has the picture.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(upload.bytes);
  } catch (error) {
    return next(error);
  }
});
