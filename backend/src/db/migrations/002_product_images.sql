-- A product carries an ordered gallery rather than a single picture.
--
-- Stored as a JSON array in a TEXT column, the way services already store
-- `benefits`. The list is short, always read together with its product, and
-- never searched by element, so a child table would buy nothing here and cost
-- a join on every read.
--
-- `image` stays the cover. The API keeps it equal to the first gallery entry,
-- so every existing reader — the product cards, the admin table, the home page
-- — keeps working without knowing this column exists.
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT NOT NULL DEFAULT '[]';

-- Backfill: an existing single image becomes a one-entry gallery. Guarded on
-- '[]' so re-running over already-migrated rows cannot duplicate anything.
UPDATE products
   SET images = json_build_array(image)::text
 WHERE images = '[]'
   AND image <> '';
