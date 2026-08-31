import test from "node:test";
import assert from "node:assert/strict";
import { swaggerSpec } from "./swagger";

test("events endpoints document multipart uploads for create and update", () => {
  const spec = swaggerSpec as any;
  const createBody =
    spec.paths["/events"].post.requestBody.content["multipart/form-data"];
  const updateBody =
    spec.paths["/events/{id}"].put.requestBody.content["multipart/form-data"];
  const createSchema = spec.components.schemas.EventInput;
  const updateSchema = spec.components.schemas.EventUpdateInput;

  assert.ok(createBody, "POST /events should document multipart/form-data");
  assert.ok(updateBody, "PUT /events/{id} should document multipart/form-data");
  assert.equal(createBody.schema.$ref, "#/components/schemas/EventInput");
  assert.equal(updateBody.schema.$ref, "#/components/schemas/EventUpdateInput");

  const createImage = createSchema.properties.image;
  const updateImage = updateSchema.properties.image;

  assert.equal(createImage.type, "string");
  assert.equal(createImage.format, "binary");
  assert.equal(updateImage.type, "string");
  assert.equal(updateImage.format, "binary");
});
