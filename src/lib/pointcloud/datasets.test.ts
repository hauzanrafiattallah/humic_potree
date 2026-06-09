import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { listConvertedDatasets } from "./datasets.ts";

test("listConvertedDatasets returns only folders that contain metadata.json", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-datasets-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await mkdir(join(root, "valid-b"), { recursive: true });
  await mkdir(join(root, "valid-a"), { recursive: true });
  await mkdir(join(root, "invalid"), { recursive: true });
  await writeFile(join(root, "valid-b", "metadata.json"), "{}");
  await writeFile(join(root, "valid-a", "metadata.json"), "{}");

  const datasets = await listConvertedDatasets(root, "/pointclouds");

  assert.deepEqual(datasets, [
    {
      name: "valid-a",
      metadataUrl: "/pointclouds/valid-a/metadata.json",
      viewerUrl: "/viewer/valid-a",
    },
    {
      name: "valid-b",
      metadataUrl: "/pointclouds/valid-b/metadata.json",
      viewerUrl: "/viewer/valid-b",
    },
  ]);
});
