import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { SupportedUploadExtension } from "./names.ts";

export class PointCloudPreConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PointCloudPreConversionError";
  }
}

export function resolvePdalPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.PDAL_PATH?.trim() || "pdal";
}

function buildPdalTranslateArgs(inputFile: string, outputFile: string): string[] {
  return ["translate", inputFile, outputFile];
}

async function runPdalTranslate({
  pdalPath,
  inputFile,
  outputFile,
  logFile,
}: {
  pdalPath: string;
  inputFile: string;
  outputFile: string;
  logFile: string;
}) {
  const args = buildPdalTranslateArgs(inputFile, outputFile);
  const { stdout, stderr, exitCode } = await new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>((resolve, reject) => {
    const child = spawn(pdalPath, args, { shell: false });
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
  }).catch((error) => {
    throw new PointCloudPreConversionError(
      error instanceof Error && error.message.includes("ENOENT")
        ? "PDAL belum dikonfigurasi. Install PDAL atau set PDAL_PATH."
        : "Pre-conversion point cloud gagal.",
    );
  });

  await writeFile(logFile, [`$ ${pdalPath} ${args.join(" ")}`, stdout, stderr].filter(Boolean).join("\n"));

  if (exitCode !== 0) {
    throw new PointCloudPreConversionError(stderr.trim() || "Pre-conversion point cloud gagal.");
  }

  try {
    await access(outputFile);
  } catch {
    throw new PointCloudPreConversionError("Output LAZ dari PDAL tidak ditemukan.");
  }
}

export async function prepareInputForPotreeConverter({
  extension,
  inputFile,
  uploadDir,
  pdalPath = resolvePdalPath(),
}: {
  extension: SupportedUploadExtension;
  inputFile: string;
  uploadDir: string;
  pdalPath?: string;
}): Promise<string> {
  if (extension === "las" || extension === "laz") {
    return inputFile;
  }

  await mkdir(uploadDir, { recursive: true });
  const outputFile = join(uploadDir, "prepared.laz");
  const logFile = join(uploadDir, "preconvert.log");

  await runPdalTranslate({
    pdalPath,
    inputFile,
    outputFile,
    logFile,
  });

  return outputFile;
}
