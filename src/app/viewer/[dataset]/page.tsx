import { PotreeViewer } from "./potree-viewer";

export const dynamic = "force-dynamic";

export default async function ViewerPage({ params }: PageProps<"/viewer/[dataset]">) {
  const { dataset } = await params;
  const metadataUrl = `/pointclouds/${encodeURIComponent(dataset)}/metadata.json`;

  return <PotreeViewer dataset={dataset} metadataUrl={metadataUrl} />;
}
