import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { prepareInputForPotreeConverter, resolvePdalPath } from "./preconvert.ts";

test("resolvePdalPath uses PDAL_PATH override or pdal default", () => {
  assert.equal(resolvePdalPath({}), "pdal");
  assert.equal(resolvePdalPath({ PDAL_PATH: "/opt/bin/pdal" }), "/opt/bin/pdal");
});

test("prepareInputForPotreeConverter returns LAS and LAZ input unchanged", async () => {
  assert.equal(
    await prepareInputForPotreeConverter({
      extension: "las",
      inputFile: "/tmp/original.las",
      uploadDir: "/tmp/upload",
    }),
    "/tmp/original.las",
  );
});

test("prepareInputForPotreeConverter runs PDAL for PLY input and returns prepared LAZ", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-preconvert-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const pdal = join(root, "pdal");
  const inputFile = join(root, "original.ply");
  const uploadDir = join(root, "upload");
  await writeFile(inputFile, "ply fixture");
  await writeFile(
    pdal,
    "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$PWD/pdal-args.txt\"\nprintf 'laz' > \"$3\"\n",
  );
  await chmod(pdal, 0o755);

  const prepared = await prepareInputForPotreeConverter({
    extension: "ply",
    inputFile,
    uploadDir,
    pdalPath: pdal,
  });

  assert.equal(prepared, join(uploadDir, "prepared.laz"));
});
