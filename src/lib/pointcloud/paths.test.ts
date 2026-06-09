import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveLocalConfig, resolveSafeChildPath } from "./paths.ts";

test("resolveLocalConfig converts env paths to absolute local paths", () => {
  const config = resolveLocalConfig(
    {
      POTREE_CONVERTER_PATH: "./tools/PotreeConverter",
      UPLOAD_DIR: "./storage/uploads",
      POINTCLOUD_OUTPUT_DIR: "./public/pointclouds",
      NEXT_PUBLIC_POINTCLOUD_BASE_URL: "/pointclouds",
    },
    "/repo",
  );

  assert.equal(config.converterPath, "/repo/tools/PotreeConverter");
  assert.equal(config.uploadDir, "/repo/storage/uploads");
  assert.equal(config.outputDir, "/repo/public/pointclouds");
  assert.equal(config.publicBaseUrl, "/pointclouds");
});

test("resolveLocalConfig provides PRD defaults", () => {
  const config = resolveLocalConfig({}, "/repo");

  assert.equal(config.converterPath, "/repo/tools/PotreeConverter");
  assert.equal(config.uploadDir, "/repo/storage/uploads");
  assert.equal(config.outputDir, "/repo/public/pointclouds");
  assert.equal(config.publicBaseUrl, "/pointclouds");
});

test("resolveSafeChildPath rejects path traversal", () => {
  assert.equal(resolveSafeChildPath("/repo/public/pointclouds", "sample"), "/repo/public/pointclouds/sample");
  assert.throws(
    () => resolveSafeChildPath("/repo/public/pointclouds", "../outside"),
    /Invalid path segment/,
  );
});
