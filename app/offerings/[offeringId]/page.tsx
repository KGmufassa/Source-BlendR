import { PageScaffold } from "@/ui/components/PageScaffold";
import { BundleRecipeBuilder } from "@/ui/components/BundleRecipeBuilder";

export default function OfferingPage() {
  return (
    <PageScaffold
      title="Bundle and recipe builder"
      description="Compose products, services, labor, packaging, and setup fees into reusable offerings."
      actionLabel="Publish offering"
    >
      <BundleRecipeBuilder />
    </PageScaffold>
  );
}
