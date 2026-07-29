const REQUIRED_TEXT_FIELDS = ["name", "sku", "vendorId", "workspaceId"];

export function validateCatalogItem(item) {
  const errors = [];

  if (!/^[A-Z]{3}$/.test(item?.currency ?? "")) {
    errors.push({ field: "currency", code: "uppercase_currency_required" });
  }

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!String(item?.[field] ?? "").trim()) {
      errors.push({ field, code: "required" });
    }
  }

  if (!Number.isInteger(item?.priceCents) || item.priceCents < 0) {
    errors.push({ field: "priceCents", code: "non_negative_integer_required" });
  }

  errors.sort((left, right) => left.field.localeCompare(right.field));

  return errors.length === 0 ? { ok: true, errors: [] } : { ok: false, errors };
}
