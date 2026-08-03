import { ButtonLink, PageHeader, StatusBadge } from "../../page-actions";

export default async function CatalogItemDetailPage({ params }: Readonly<{ params: Promise<{ itemId: string }> }>) {
  const { itemId } = await params;

  return (
    <>
      <PageHeader title="Catalog item" description="Detail editing uses the same deterministic validation gate as catalog creation." />
      <section className="panel">
        <h2>{itemId}</h2>
        <p>Status: <StatusBadge>editable</StatusBadge></p>
        <ButtonLink href="/app/catalog">Back to catalog</ButtonLink>
      </section>
    </>
  );
}
