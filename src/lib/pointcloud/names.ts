const POINT_CLOUD_EXTENSION_PATTERN = /\.(las|laz)$/i;
const SUPPORTED_UPLOAD_EXTENSION_PATTERN = /\.(las|laz|e57|ply|pts|xyz)$/i;

export type PotreeConverterInputExtension = "las" | "laz";
export type SupportedUploadExtension = PotreeConverterInputExtension | "e57" | "ply" | "pts" | "xyz";

function formatTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}${second}`;
}

export function sanitizeDatasetBaseName(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "dataset";
}

export function createDatasetSlug(value: string, date = new Date()): string {
  return `${sanitizeDatasetBaseName(value)}-${formatTimestamp(date)}`;
}

export function isPointCloudFileName(fileName: string): boolean {
  if (fileName.includes("/") || fileName.includes("\\")) {
    return false;
  }

  return POINT_CLOUD_EXTENSION_PATTERN.test(fileName);
}

export function getPointCloudExtension(fileName: string): PotreeConverterInputExtension | null {
  if (!isPointCloudFileName(fileName)) {
    return null;
  }

  const extension = fileName.match(POINT_CLOUD_EXTENSION_PATTERN)?.[1]?.toLowerCase();
  return extension === "las" || extension === "laz" ? extension : null;
}

export function isSupportedUploadFileName(fileName: string): boolean {
  if (fileName.includes("/") || fileName.includes("\\")) {
    return false;
  }

  return SUPPORTED_UPLOAD_EXTENSION_PATTERN.test(fileName);
}

export function getSupportedUploadExtension(fileName: string): SupportedUploadExtension | null {
  if (!isSupportedUploadFileName(fileName)) {
    return null;
  }

  const extension = fileName.match(SUPPORTED_UPLOAD_EXTENSION_PATTERN)?.[1]?.toLowerCase();
  switch (extension) {
    case "las":
    case "laz":
    case "e57":
    case "ply":
    case "pts":
    case "xyz":
      return extension;
    default:
      return null;
  }
}

export function getUnsupportedPointCloudMessage(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (/\.(rwp|rwcx|db1|lay|dmt)$/.test(lower)) {
    return "Format Trimble/RealWorks perlu diexport dulu ke .las, .laz, .e57, .ply, .pts, atau .xyz.";
  }

  return "Gunakan file .las, .laz, .e57, .ply, .pts, atau .xyz.";
}
