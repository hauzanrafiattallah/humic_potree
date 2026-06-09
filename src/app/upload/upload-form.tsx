"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type UploadPhase = "idle" | "selected" | "uploading" | "converting" | "success" | "failed";

type UploadResponse =
  | {
      success: true;
      dataset: string;
      viewerUrl: string;
      metadataUrl: string;
    }
  | {
      success: false;
      message: string;
    };

const phaseText: Record<UploadPhase, string> = {
  idle: "Choose a LAS or LAZ file to begin.",
  selected: "File selected. Ready to upload.",
  uploading: "Uploading file...",
  converting: "Converting point cloud...",
  success: "Conversion success. Opening viewer...",
  failed: "Conversion failed. Please check your file.",
};

function isSupportedFile(file: File | null): boolean {
  return file ? /\.(las|laz|e57|ply|pts|xyz)$/i.test(file.name) : false;
}

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Extract<UploadResponse, { success: true }> | null>(null);

  const canSubmit = useMemo(
    () => isSupportedFile(file) && datasetName.trim().length > 0 && phase !== "uploading" && phase !== "converting",
    [datasetName, file, phase],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setPhase("failed");
      setError("File wajib diunggah.");
      return;
    }

    if (!isSupportedFile(file)) {
      setPhase("failed");
      setError("Gunakan file .las, .laz, .e57, .ply, .pts, atau .xyz.");
      return;
    }

    if (!datasetName.trim()) {
      setPhase("failed");
      setError("Nama dataset wajib diisi.");
      return;
    }

    const body = new FormData();
    body.append("datasetName", datasetName);
    body.append("file", file);

    setPhase("uploading");
    const convertingTimer = window.setTimeout(() => setPhase("converting"), 700);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.success) {
        setPhase("failed");
        setError(data.success ? "Upload atau conversion gagal." : data.message);
        return;
      }

      setPhase("success");
      setResult(data);
      window.setTimeout(() => router.push(data.viewerUrl), 650);
    } catch {
      setPhase("failed");
      setError("Upload atau conversion gagal.");
    } finally {
      window.clearTimeout(convertingTimer);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link className="text-sm font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900 cursor-pointer" href="/">
            Local Point Cloud Viewer
          </Link>
          <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white cursor-pointer" href="/datasets">
            Datasets
          </Link>
        </nav>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Local MVP</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-normal text-slate-900 sm:text-5xl">
              Upload point cloud data for local Potree conversion.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Files stay on this machine. The server saves the original upload, runs PotreeConverter, and opens the
              converted dataset in the browser.
            </p>
          </div>

          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Dataset name</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition-colors duration-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  onChange={(event) => setDatasetName(event.target.value)}
                  placeholder="Living Room Scan"
                  type="text"
                  value={datasetName}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">Point cloud file</span>
                <input
                  accept=".las,.laz,.e57,.ply,.pts,.xyz"
                  className="mt-2 w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm transition-colors duration-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-white"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                    setPhase(nextFile ? "selected" : "idle");
                    setError("");
                    setResult(null);
                  }}
                  type="file"
                />
              </label>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">{phaseText[phase]}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Supported formats: `.las`, `.laz`, `.e57`, `.ply`, `.pts`, and `.xyz`. Default local upload limit:
                  1 GB.
                </p>
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              {result ? (
                <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                  <p className="font-medium">{result.dataset}</p>
                  <p className="mt-1 break-all">{result.metadataUrl}</p>
                  <Link className="mt-3 inline-flex font-semibold text-teal-900 underline transition-colors duration-200 cursor-pointer" href={result.viewerUrl}>
                    Open viewer
                  </Link>
                </div>
              ) : null}

              <button
                className="w-full cursor-pointer rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSubmit}
                type="submit"
              >
                {phase === "uploading" || phase === "converting" ? "Processing..." : "Upload and convert"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
