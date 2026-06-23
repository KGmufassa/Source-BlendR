import { PageScaffold } from "@/ui/components/PageScaffold";
import { StatusCenter } from "@/ui/components/StatusCenter";

export default function StatusPage() {
  return (
    <PageScaffold
      title="Status center"
      description="Review async job progress, failures, retries, and support details."
      actionLabel="Retry selected"
    >
      <StatusCenter />
    </PageScaffold>
  );
}
