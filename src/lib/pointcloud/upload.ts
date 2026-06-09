import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import Busboy from "busboy";
import type { FileInfo } from "busboy";

import {
  createDatasetSlug,
  getSupportedUploadExtension,
  getUnsupportedPointCloudMessage,
  type SupportedUploadExtension,
} from "./names.ts";
import { resolveSafeChildPath } from "./paths.ts";

export type SavedUpload = {
  dataset: string;
  inputFile: string;
  uploadDir: string;
  outputDir: string;
  extension: SupportedUploadExtension;
};

export const DEFAULT_MAX_UPLOAD_MB = 1024;
export const MAX_UPLOAD_BYTES = DEFAULT_MAX_UPLOAD_MB * 1024 * 1024;

type UploadStream = Readable & {
  truncated?: boolean;
};

export function getMaxUploadBytes(env: NodeJS.ProcessEnv = process.env): number {
  const configuredBytes = Number(env.MAX_UPLOAD_BYTES);
  if (Number.isFinite(configuredBytes) && configuredBytes > 0) {
    return Math.floor(configuredBytes);
  }

  const configuredMb = Number(env.MAX_UPLOAD_MB);
  const mb = Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : DEFAULT_MAX_UPLOAD_MB;
  return Math.floor(mb * 1024 * 1024);
}

function formatUploadLimit(maxBytes: number): string {
  const mb = Math.ceil(maxBytes / (1024 * 1024));
  return `${mb} MB`;
}

export async function createUniqueDatasetName(
  rawName: string,
  outputRoot: string,
  date = new Date(),
): Promise<string> {
  await mkdir(outputRoot, { recursive: true });

  const base = createDatasetSlug(rawName, date);
  let candidate = base;
  let suffix = 2;

  while (true) {
    try {
      resolveSafeChildPath(outputRoot, candidate);
      await mkdir(resolveSafeChildPath(outputRoot, candidate), { recursive: false });
      return candidate;
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid path segment.") {
        throw error;
      }

      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }
}

export async function saveUploadedPointCloud({
  file,
  datasetName,
  uploadRoot,
  outputRoot,
}: {
  file: File;
  datasetName: string;
  uploadRoot: string;
  outputRoot: string;
}): Promise<SavedUpload> {
  const extension = getSupportedUploadExtension(file.name);
  if (!extension) {
    throw new Error(getUnsupportedPointCloudMessage(file.name));
  }

  if (file.size <= 0) {
    throw new Error("File wajib diunggah.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Ukuran file maksimal ${formatUploadLimit(MAX_UPLOAD_BYTES)} untuk upload lokal.`);
  }

  const dataset = await createUniqueDatasetName(datasetName, outputRoot);
  const datasetUploadDir = resolveSafeChildPath(uploadRoot, dataset);
  await mkdir(datasetUploadDir, { recursive: true });

  const inputFile = join(datasetUploadDir, `original.${extension}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inputFile, buffer);

  return {
    dataset,
    inputFile,
    uploadDir: datasetUploadDir,
    outputDir: resolveSafeChildPath(outputRoot, dataset),
    extension,
  };
}

function getHeadersObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function getFileName(info: FileInfo): string {
  return typeof info.filename === "string" ? info.filename : "";
}

export async function saveMultipartPointCloudUpload({
  body,
  headers,
  uploadRoot,
  outputRoot,
  maxBytes = getMaxUploadBytes(),
}: {
  body: Readable;
  headers: Headers;
  uploadRoot: string;
  outputRoot: string;
  maxBytes?: number;
}): Promise<SavedUpload> {
  const contentType = headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("Content-Type multipart/form-data wajib digunakan.");
  }

  await mkdir(uploadRoot, { recursive: true });
  await mkdir(outputRoot, { recursive: true });

  const tempRoot = join(uploadRoot, ".tmp");
  await mkdir(tempRoot, { recursive: true });
  const tempDir = join(tempRoot, randomUUID());
  await mkdir(tempDir, { recursive: true });

  let datasetName = "";
  let originalFileName = "";
  let extension: SupportedUploadExtension | null = null;
  let tempFilePath = "";
  let uploadError: Error | null = null;
  const fileWrites: Promise<void>[] = [];

  try {
    const parser = Busboy({
      headers: getHeadersObject(headers),
      limits: {
        fields: 8,
        files: 1,
        fileSize: maxBytes,
      },
    });

    parser.on("field", (name, value) => {
      if (name === "datasetName") {
        datasetName = value;
      }
    });

    parser.on("file", (name, file: UploadStream, info) => {
      if (name !== "file" || tempFilePath) {
        file.resume();
        uploadError = new Error("Hanya satu file point cloud yang dapat diunggah.");
        return;
      }

      originalFileName = getFileName(info);
      extension = getSupportedUploadExtension(originalFileName);
      if (!extension) {
        file.resume();
        uploadError = new Error(getUnsupportedPointCloudMessage(originalFileName));
        return;
      }

      tempFilePath = join(tempDir, `original.${extension}`);
      file.on("limit", () => {
        uploadError = new Error(`Ukuran file maksimal ${formatUploadLimit(maxBytes)} untuk upload lokal.`);
      });
      fileWrites.push(pipeline(file, createWriteStream(tempFilePath)));
    });

    await pipeline(body, parser);
    await Promise.all(fileWrites);

    if (uploadError) {
      throw uploadError;
    }

    if (!tempFilePath || !extension) {
      throw new Error("File wajib diunggah.");
    }

    if (!datasetName.trim()) {
      throw new Error("Nama dataset wajib diisi.");
    }

    const fileSize = (await stat(tempFilePath)).size;
    if (fileSize <= 0) {
      throw new Error("File wajib diunggah.");
    }

    if (fileSize > maxBytes) {
      throw new Error(`Ukuran file maksimal ${formatUploadLimit(maxBytes)} untuk upload lokal.`);
    }

    const dataset = await createUniqueDatasetName(datasetName, outputRoot);
    const datasetUploadDir = resolveSafeChildPath(uploadRoot, dataset);
    await mkdir(datasetUploadDir, { recursive: true });
    const inputFile = join(datasetUploadDir, `original.${extension}`);
    await rename(tempFilePath, inputFile);

    return {
      dataset,
      inputFile,
      uploadDir: datasetUploadDir,
      outputDir: resolveSafeChildPath(outputRoot, dataset),
      extension,
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}
