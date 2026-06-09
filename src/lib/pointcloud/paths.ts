import { isAbsolute, resolve, sep } from "node:path";

export type LocalPointCloudConfig = {
  converterPath: string;
  uploadDir: string;
  outputDir: string;
  publicBaseUrl: string;
};

function resolveConfiguredPath(value: string | undefined, fallback: string, cwd: string): string {
  const configured = value?.trim() || fallback;
  return isAbsolute(configured) ? configured : resolve(cwd, configured);
}

export function resolveLocalConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): LocalPointCloudConfig {
  return {
    converterPath: resolveConfiguredPath(env.POTREE_CONVERTER_PATH, "./tools/PotreeConverter", cwd),
    uploadDir: resolveConfiguredPath(env.UPLOAD_DIR, "./storage/uploads", cwd),
    outputDir: resolveConfiguredPath(env.POINTCLOUD_OUTPUT_DIR, "./public/pointclouds", cwd),
    publicBaseUrl: env.NEXT_PUBLIC_POINTCLOUD_BASE_URL?.trim() || "/pointclouds",
  };
}

export function resolveSafeChildPath(baseDir: string, childSegment: string): string {
  if (!childSegment || childSegment.includes("/") || childSegment.includes("\\")) {
    throw new Error("Invalid path segment.");
  }

  const base = resolve(baseDir);
  const child = resolve(base, childSegment);

  if (child !== base && child.startsWith(`${base}${sep}`)) {
    return child;
  }

  throw new Error("Invalid path segment.");
}
