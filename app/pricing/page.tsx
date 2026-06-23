import { PageScaffold } from "@/ui/components/PageScaffold";
import { PricingWorkspace } from "@/ui/components/PricingWorkspace";

export default function PricingPage() {
  return (
    <PageScaffold
      title="Pricing workspace"
      description="Preview pricing rules, costs, margins, approval state, and snapshots."
      actionLabel="Create rule"
    >
      <PricingWorkspace />
    </PageScaffold>
  );
}
