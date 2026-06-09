import Link from "next/link";

import { listConvertedDatasets } from "@/lib/pointcloud/datasets";
import { resolveLocalConfig } from "@/lib/pointcloud/paths";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Local Datasets",
};

export default async function DatasetsPage() {
  const config = resolveLocalConfig();
  const datasets = await listConvertedDatasets(config.outputDir, config.publicBaseUrl);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Link className="cursor-pointer text-sm font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900" href="/">
            Local Point Cloud Viewer
          </Link>
          <Link className="cursor-pointer rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800" href="/upload">
            Upload
          </Link>
        </nav>

        <section className="py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Local filesystem</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal">Converted datasets</h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Reading folders from `public/pointclouds` and showing only datasets with `metadata.json`.
            </p>
          </div>

          {datasets.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8">
              <h2 className="text-lg font-semibold">No converted datasets found</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Upload a LAS or LAZ file, or place a converted Potree dataset with `metadata.json` in
                `public/pointclouds`.
              </p>
              <Link
                className="mt-5 inline-flex cursor-pointer rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
                href="/upload"
              >
                Upload point cloud
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-3">
              {datasets.map((dataset) => (
                <article
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
                  key={dataset.name}
                >
                  <div>
                    <h2 className="text-lg font-semibold">{dataset.name}</h2>
                    <p className="mt-1 break-all text-sm text-slate-600">{dataset.metadataUrl}</p>
                  </div>
                  <Link
                    className="inline-flex cursor-pointer justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-slate-50"
                    href={dataset.viewerUrl}
                  >
                    Open viewer
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
