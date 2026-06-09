import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type RunPotreeConverterInput = {
  converterPath: string;
  inputFile: string;
  outputDir: string;
};

export class PotreeConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PotreeConversionError";
  }
}

async function assertReadableFile(path: string, message: string): Promise<void> {
  try {
    await access(path);
  } catch {
    throw new PotreeConversionError(message);
  }
}

export async function runPotreeConverter({
  converterPath,
  inputFile,
  outputDir,
}: RunPotreeConverterInput): Promise<void> {
  await assertReadableFile(converterPath, "PotreeConverter belum dikonfigurasi.");
  await assertReadableFile(inputFile, "File input tidak ditemukan.");
  await mkdir(outputDir, { recursive: true });

  const args = [inputFile, "-o", outputDir];
  const { stdout, stderr, exitCode } = await new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>((resolve, reject) => {
    const child = spawn(converterPath, args, { shell: false });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    child.on("error", (error) => reject(error));
    child.on("close", (code) =>
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf8"),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
        exitCode: code,
      }),
    );
  });

  await writeFile(
    join(outputDir, "log.txt"),
    [`$ ${converterPath} ${args.join(" ")}`, stdout, stderr].filter(Boolean).join("\n"),
  );

  if (exitCode !== 0) {
    throw new PotreeConversionError(stderr.trim() || "Conversion gagal.");
  }

  await assertReadableFile(join(outputDir, "metadata.json"), "metadata.json tidak ditemukan.");
}
