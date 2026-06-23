import { PageScaffold } from "@/ui/components/PageScaffold";
import { QuoteBuilder } from "@/ui/components/QuoteBuilder";

export default function QuotesPage() {
  return (
    <PageScaffold
      title="Quotes"
      description="Create, review, approve, generate, and share customer-ready quotes."
      actionLabel="Create quote"
    >
      <QuoteBuilder />
    </PageScaffold>
  );
}
