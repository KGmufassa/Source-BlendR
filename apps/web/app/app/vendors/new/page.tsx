import { ButtonLink, FormField, PageHeader } from "../../page-actions";

export default function NewVendorPage() {
  return (
    <>
      <PageHeader title="New vendor" description="Create a vendor source for import workflows." />
      <section className="panel">
        <form className="form-grid">
          <FormField label="Name"><input name="name" required /></FormField>
          <FormField label="Website"><input name="website" type="url" /></FormField>
          <div className="wide actions">
            <button type="button">Save vendor</button>
            <ButtonLink href="/app/vendors">Cancel</ButtonLink>
          </div>
        </form>
      </section>
    </>
  );
}
