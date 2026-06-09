import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { test } from "node:test";

import { getMaxUploadBytes, saveMultipartPointCloudUpload } from "./upload.ts";

function multipartBody(boundary: string, datasetName: string, fileName: string, fileContent: string): Buffer {
  return Buffer.from(
    [
      `--${boundary}`,
      'Content-Disposition: form-data; name="datasetName"',
      "",
      datasetName,
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
      "Content-Type: application/octet-stream",
      "",
      fileContent,
      `--${boundary}--`,
      "",
    ].join("\r\n"),
  );
}

test("getMaxUploadBytes defaults to 1 GB and accepts MAX_UPLOAD_MB override", () => {
  assert.equal(getMaxUploadBytes({}), 1024 * 1024 * 1024);
  assert.equal(getMaxUploadBytes({ MAX_UPLOAD_MB: "750" }), 750 * 1024 * 1024);
});

test("saveMultipartPointCloudUpload streams multipart LAS upload to local storage", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-stream-upload-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const boundary = "stream-boundary";
  const saved = await saveMultipartPointCloudUpload({
    body: Readable.from(multipartBody(boundary, "Stream Upload", "fixture.las", "las bytes")),
    headers: new Headers({ "content-type": `multipart/form-data; boundary=${boundary}` }),
    uploadRoot: join(root, "uploads"),
    outputRoot: join(root, "pointclouds"),
    maxBytes: 1024 * 1024,
  });

  assert.match(saved.dataset, /^stream-upload-\d{8}-\d{6}$/);
  assert.equal(saved.extension, "las");
  assert.equal(await readFile(saved.inputFile, "utf8"), "las bytes");
});

test("saveMultipartPointCloudUpload accepts convertible PLY uploads", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-stream-upload-ply-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const boundary = "ply-boundary";
  const saved = await saveMultipartPointCloudUpload({
    body: Readable.from(multipartBody(boundary, "Ply Upload", "fixture.ply", "ply bytes")),
    headers: new Headers({ "content-type": `multipart/form-data; boundary=${boundary}` }),
    uploadRoot: join(root, "uploads"),
    outputRoot: join(root, "pointclouds"),
    maxBytes: 1024 * 1024,
  });

  assert.equal(saved.extension, "ply");
  assert.equal(await readFile(saved.inputFile, "utf8"), "ply bytes");
});

test("saveMultipartPointCloudUpload rejects files larger than the configured limit", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-stream-upload-limit-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const boundary = "limit-boundary";
  await assert.rejects(
    () =>
      saveMultipartPointCloudUpload({
        body: Readable.from(multipartBody(boundary, "Too Large", "fixture.las", "123456789")),
        headers: new Headers({ "content-type": `multipart/form-data; boundary=${boundary}` }),
        uploadRoot: join(root, "uploads"),
        outputRoot: join(root, "pointclouds"),
        maxBytes: 4,
      }),
    /Ukuran file maksimal/,
  );
});
