import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";

import { NextResponse } from "next/server";

import { runPotreeConverter } from "@/lib/pointcloud/converter";
import { resolveLocalConfig } from "@/lib/pointcloud/paths";
import { prepareInputForPotreeConverter } from "@/lib/pointcloud/preconvert";
import { getMaxUploadBytes, saveMultipartPointCloudUpload } from "@/lib/pointcloud/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return jsonError("File wajib diunggah.");
    }

    const config = resolveLocalConfig();
    const saved = await saveMultipartPointCloudUpload({
      body: Readable.fromWeb(request.body as unknown as NodeReadableStream<Uint8Array>),
      headers: request.headers,
      uploadRoot: config.uploadDir,
      outputRoot: config.outputDir,
      maxBytes: getMaxUploadBytes(),
    });

    const converterInputFile = await prepareInputForPotreeConverter({
      extension: saved.extension,
      inputFile: saved.inputFile,
      uploadDir: saved.uploadDir,
    });

    await runPotreeConverter({
      converterPath: config.converterPath,
      inputFile: converterInputFile,
      outputDir: saved.outputDir,
    });

    return NextResponse.json({
      success: true,
      dataset: saved.dataset,
      viewerUrl: `/viewer/${saved.dataset}`,
      metadataUrl: `${config.publicBaseUrl}/${saved.dataset}/metadata.json`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload atau conversion gagal.";
    const status =
      message.includes("PotreeConverter") || message.includes("Conversion") || message.includes("Pre-conversion")
        ? 500
        : 400;
    return jsonError(message, status);
  }
}
