"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Potree type declarations (minimal surface for TypeScript)         */
/* ------------------------------------------------------------------ */

type PotreePointCloud = {
  material?: {
    size?: number;
    pointSizeType?: unknown;
  };
};

type PotreeViewerInstance = {
  scene: {
    addPointCloud: (pointCloud: PotreePointCloud) => void;
  };
  setBackground?: (value: string) => void;
  setEDLEnabled?: (value: boolean) => void;
  setFOV?: (value: number) => void;
  setPointBudget?: (value: number) => void;
  setLanguage?: (lang: string) => void;
  fitToScreen?: () => void;
  loadGUI?: (callback?: () => void) => Promise<void>;
  toggleSidebar?: () => void;
};

type PotreeRuntime = {
  Viewer: new (container: HTMLElement) => PotreeViewerInstance;
  PointSizeType?: {
    ADAPTIVE?: unknown;
  };
  loadPointCloud: (
    metadataUrl: string,
    name: string,
    callback: (event: { pointcloud: PotreePointCloud }) => void,
  ) => void;
};

declare global {
  interface Window {
    Potree?: PotreeRuntime;
  }
}

/* ------------------------------------------------------------------ */
/*  Stylesheets & scripts Potree needs loaded before init             */
/* ------------------------------------------------------------------ */

const POTREE_STYLES = [
  "/potree/build/potree/potree.css",
  "/potree/libs/jquery-ui/jquery-ui.min.css",
  "/potree/libs/openlayers3/ol.css",
  "/potree/libs/spectrum/spectrum.css",
  "/potree/libs/jstree/themes/mixed/style.css",
];

const POTREE_SCRIPTS = [
  "/potree/libs/jquery/jquery-3.1.1.min.js",
  "/potree/libs/spectrum/spectrum.js",
  "/potree/libs/jquery-ui/jquery-ui.min.js",
  "/potree/libs/other/BinaryHeap.js",
  "/potree/libs/tween/tween.min.js",
  "/potree/libs/d3/d3.js",
  "/potree/libs/proj4/proj4.js",
  "/potree/libs/openlayers3/ol.js",
  "/potree/libs/i18next/i18next.js",
  "/potree/libs/jstree/jstree.js",
  "/potree/build/potree/potree.js",
];

let potreeRuntimePromise: Promise<void> | null = null;

function loadStyle(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-potree-src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.potreeSrc = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Potree runtime tidak ditemukan: ${src}`));

    if (!existing) {
      document.body.appendChild(script);
    }
  });
}

async function loadPotreeRuntime() {
  if (!potreeRuntimePromise) {
    potreeRuntimePromise = (async () => {
      POTREE_STYLES.forEach(loadStyle);
      for (const script of POTREE_SCRIPTS) {
        await loadScript(script);
      }
      if (!window.Potree) {
        throw new Error("Potree runtime tidak ditemukan di public/potree.");
      }
    })();
  }

  return potreeRuntimePromise;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function PotreeViewer({ dataset, metadataUrl }: { dataset: string; metadataUrl: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PotreeViewerInstance | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const wrapper = wrapperRef.current;

    async function bootViewer() {
      setStatus("loading");
      setError("");

      try {
        const metadataResponse = await fetch(metadataUrl, { cache: "no-store" });
        if (!metadataResponse.ok) {
          throw new Error("metadata.json tidak ditemukan.");
        }

        await loadPotreeRuntime();
        if (cancelled || !wrapper || !window.Potree) {
          return;
        }

        /* ----------------------------------------------------------
         * Build the DOM structure Potree expects:
         *
         *  wrapper (position: relative, fills parent)
         *    ├── #potree_sidebar_container
         *    └── #potree_render_area
         *           └── (Potree creates its canvas here)
         * ---------------------------------------------------------- */
        wrapper.innerHTML = "";

        const sidebarContainer = document.createElement("div");
        sidebarContainer.id = "potree_sidebar_container";
        wrapper.appendChild(sidebarContainer);

        const renderArea = document.createElement("div");
        renderArea.id = "potree_render_area";
        wrapper.appendChild(renderArea);

        /* Create the viewer inside #potree_render_area */
        const viewer = new window.Potree.Viewer(renderArea);
        viewer.setEDLEnabled?.(true);
        viewer.setFOV?.(60);
        viewer.setPointBudget?.(5_000_000);
        viewer.setBackground?.("gradient");
        viewerRef.current = viewer;

        /* Load the full GUI sidebar with all tools */
        if (viewer.loadGUI) {
          await viewer.loadGUI(() => {
            viewer.setLanguage?.("en");
          });
        }

        /* Load point cloud */
        window.Potree.loadPointCloud(metadataUrl, dataset, (event) => {
          if (cancelled) {
            return;
          }

          const pointCloud = event.pointcloud;
          if (pointCloud.material) {
            pointCloud.material.size = 2;
            pointCloud.material.pointSizeType = window.Potree?.PointSizeType?.ADAPTIVE;
          }
          viewer.scene.addPointCloud(pointCloud);
          viewer.fitToScreen?.();
          setStatus("ready");
        });
      } catch (nextError) {
        if (!cancelled) {
          setStatus("failed");
          setError(nextError instanceof Error ? nextError.message : "Viewer gagal memuat dataset.");
        }
      }
    }

    bootViewer();

    return () => {
      cancelled = true;
      viewerRef.current = null;
      if (wrapper) {
        wrapper.innerHTML = "";
      }
    };
  }, [dataset, metadataUrl]);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-white text-slate-900">
      {/* Top header bar */}
      <header className="z-20 flex min-h-14 flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Potree viewer</p>
          <h1 className="truncate text-base font-semibold text-slate-900">{dataset}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            href="/datasets"
          >
            Back
          </Link>
          <button
            className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            disabled={status !== "ready"}
            onClick={() => viewerRef.current?.fitToScreen?.()}
            type="button"
          >
            Reset view
          </button>
        </div>
      </header>

      {/* Potree viewer fills remaining space */}
      <div className="relative min-h-0 flex-1">
        {/*
          This div becomes the Potree "world":
          - #potree_sidebar_container  (sidebar with tools — injected by JS)
          - #potree_render_area        (3D canvas — injected by JS)
        */}
        <div
          className="absolute inset-0"
          ref={wrapperRef}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Loading / error overlay */}
        {status !== "ready" ? (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-white/80 backdrop-blur-sm">
            <div className="pointer-events-auto w-[min(92vw,520px)] rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
              <p className="text-sm font-semibold text-teal-600">
                {status === "loading" ? "Loading point cloud & tools..." : "Viewer error"}
              </p>
              <p className="mt-2 break-all text-sm leading-6 text-slate-600">
                {status === "loading" ? metadataUrl : error}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
