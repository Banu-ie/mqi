import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedImageFile } from "./upload";

test("jpeg files are accepted", () => {
  assert.equal(
    isAllowedImageFile({ mimetype: "image/jpeg", originalname: "cover.jpeg" }),
    true,
  );

  assert.equal(
    isAllowedImageFile({ mimetype: "image/jpeg", originalname: "cover.jpg" }),
    true,
  );

  assert.equal(
    isAllowedImageFile({ mimetype: "image/png", originalname: "cover.png" }),
    true,
  );

  assert.equal(
    isAllowedImageFile({ mimetype: "image/png", originalname: "cover.exe" }),
    false,
  );
});
