import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

export type ConvertedDataset = {
  name: string;
  metadataUrl: string;
  viewerUrl: string;
};

async function hasMetadata(outputDir: string, datasetName: string): Promise<boolean> {
  try {
    await access(join(outputDir, datasetName, "metadata.json"));
    return true;
  } catch {
    return false;
  }
}

export async function listConvertedDatasets(
  outputDir: string,
  publicBaseUrl: string,
): Promise<ConvertedDataset[]> {
  let entries;

  try {
    entries = await readdir(outputDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const datasets = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const valid = await hasMetadata(outputDir, entry.name);
        if (!valid) {
          return null;
        }

        return {
          name: entry.name,
          metadataUrl: `${publicBaseUrl}/${entry.name}/metadata.json`,
          viewerUrl: `/viewer/${entry.name}`,
        } satisfies ConvertedDataset;
      }),
  );

  return datasets
    .filter((dataset): dataset is ConvertedDataset => dataset !== null)
    .sort((left, right) => left.name.localeCompare(right.name));
}
