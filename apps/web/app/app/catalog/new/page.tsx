import { blueprintActions } from "../../../workspace-routes";
import { ButtonLink, FormField, PageHeader } from "../../page-actions";

export default function NewCatalogItemPage() {
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-008" title="Catalog Item Form" description="Create a validated workspace catalog record." />
      <section className="panel">
        <form className="form-grid" action="/api/catalog-items" method="post" data-action="ACTION-SAVE-ITEM">
          <FormField label="Item type">
            <select name="type" data-element="EL-FORM-001" defaultValue="product">
              {["product", "service", "rental", "labor", "manufacturing", "installation"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </FormField>
          <FormField label="Name"><input name="name" data-element="EL-FORM-002" required maxLength={200} /></FormField>
          <FormField label="SKU"><input name="sku" data-element="EL-FORM-003" required maxLength={80} /></FormField>
          <FormField label="Price"><input name="price" data-element="EL-FORM-004" required min="0" step="0.01" type="number" /></FormField>
          <FormField label="Currency"><input name="currency" required defaultValue="USD" minLength={3} maxLength={3} /></FormField>
          <div className="wide actions">
            <button type="submit" data-element={blueprintActions.saveItem.elementId} data-action={blueprintActions.saveItem.actionId}>{blueprintActions.saveItem.label}</button>
            <ButtonLink href={blueprintActions.cancelItem.href} elementId={blueprintActions.cancelItem.elementId}>{blueprintActions.cancelItem.label}</ButtonLink>
          </div>
        </form>
      </section>
    </>
  );
}
