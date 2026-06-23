import { PageScaffold } from "@/ui/components/PageScaffold";
import { AssetLibrary } from "@/ui/components/AssetLibrary";

export default function AssetsPage() {
  return (
    <PageScaffold
      title="Asset library"
      description="Search, filter, and manage imported products, services, documents, and collections."
      actionLabel="Add to bundle"
    >
      <AssetLibrary />
    </PageScaffold>
  );
}
