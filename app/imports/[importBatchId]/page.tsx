import { PageScaffold } from "@/ui/components/PageScaffold";
import { ImportReviewWizard } from "@/ui/components/ImportReviewWizard";

export default function ImportReviewPage() {
  return (
    <PageScaffold
      title="Import review"
      description="Upload, map, validate, and commit supplier products and services."
      actionLabel="Validate rows"
    >
      <ImportReviewWizard />
    </PageScaffold>
  );
}
