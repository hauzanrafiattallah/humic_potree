import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { runPotreeConverter } from "./converter.ts";

test("runPotreeConverter reports a missing converter before spawning", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-converter-missing-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await assert.rejects(
    () =>
      runPotreeConverter({
        converterPath: join(root, "missing-converter"),
        inputFile: join(root, "original.las"),
        outputDir: join(root, "output"),
      }),
    /PotreeConverter belum dikonfigurasi/,
  );
});

test("runPotreeConverter uses fixed args, captures logs, and requires metadata output", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "pointcloud-converter-success-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const converter = join(root, "PotreeConverter");
  const inputFile = join(root, "original.las");
  const outputDir = join(root, "output");

  await writeFile(inputFile, "las fixture");
  await writeFile(
    converter,
    "#!/bin/sh\nprintf 'input=%s output=%s\\n' \"$1\" \"$3\"\nmkdir -p \"$3\"\nprintf '{}' > \"$3/metadata.json\"\n",
  );
  await chmod(converter, 0o755);

  await runPotreeConverter({ converterPath: converter, inputFile, outputDir });

  const log = await import("node:fs/promises").then((fs) =>
    fs.readFile(join(outputDir, "log.txt"), "utf8"),
  );
  assert.match(log, /input=.*original\.las output=.*output/);
});
