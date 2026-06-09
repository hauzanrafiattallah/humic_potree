import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDatasetSlug,
  getPointCloudExtension,
  getSupportedUploadExtension,
  isPointCloudFileName,
  isSupportedUploadFileName,
} from "./names.ts";

const fixedDate = new Date("2026-06-09T15:30:00.000Z");

test("createDatasetSlug lowercases text, removes unsafe characters, and appends timestamp", () => {
  assert.equal(
    createDatasetSlug("Living Room Scan", fixedDate),
    "living-room-scan-20260609-153000",
  );
});

test("createDatasetSlug blocks traversal-like names and falls back for empty sanitized names", () => {
  assert.equal(
    createDatasetSlug("../Bad Dataset!!", fixedDate),
    "bad-dataset-20260609-153000",
  );
  assert.equal(createDatasetSlug(" ../../ ", fixedDate), "dataset-20260609-153000");
});

test("point cloud file validation accepts only LAS and LAZ filenames", () => {
  assert.equal(isPointCloudFileName("scan.las"), true);
  assert.equal(isPointCloudFileName("scan.LAZ"), true);
  assert.equal(isPointCloudFileName("scan.txt"), false);
  assert.equal(isPointCloudFileName("../scan.las"), false);
  assert.equal(isPointCloudFileName("scan.las.exe"), false);
});

test("getPointCloudExtension returns the normalized extension", () => {
  assert.equal(getPointCloudExtension("SCAN.LAS"), "las");
  assert.equal(getPointCloudExtension("SCAN.laz"), "laz");
  assert.equal(getPointCloudExtension("SCAN.txt"), null);
});

test("supported upload validation accepts convertible point cloud formats", () => {
  assert.equal(isSupportedUploadFileName("scan.las"), true);
  assert.equal(isSupportedUploadFileName("scan.laz"), true);
  assert.equal(isSupportedUploadFileName("scan.e57"), true);
  assert.equal(isSupportedUploadFileName("scan.ply"), true);
  assert.equal(isSupportedUploadFileName("scan.pts"), true);
  assert.equal(isSupportedUploadFileName("scan.xyz"), true);
  assert.equal(isSupportedUploadFileName("scan.rwp"), false);
  assert.equal(isSupportedUploadFileName("../scan.e57"), false);
});

test("getSupportedUploadExtension returns supported raw upload extension", () => {
  assert.equal(getSupportedUploadExtension("SCAN.E57"), "e57");
  assert.equal(getSupportedUploadExtension("SCAN.PLY"), "ply");
  assert.equal(getSupportedUploadExtension("SCAN.rwcx"), null);
});
