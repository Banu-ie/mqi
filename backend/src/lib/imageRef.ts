import { z } from "zod";

const localUpload =
  /^\/uploads\/(products|services|events)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|jpg|png|gif)$/i;
const seedImage = /^https:\/\/images\.unsplash\.com\//i;

/** Accept only our immutable upload paths and the image host used by seed data. */
export const imageRef = z
  .string()
  .max(2048, "Şəkil ünvanı çox uzundur.")
  .refine(
    (value) => value === "" || localUpload.test(value) || seedImage.test(value),
    "Şəkil düzgün deyil.",
  );
