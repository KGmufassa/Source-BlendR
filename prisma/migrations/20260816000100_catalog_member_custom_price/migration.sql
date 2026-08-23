ALTER TABLE "CatalogMember"
  ADD COLUMN "customPriceCents" INTEGER;

ALTER TABLE "CatalogMember"
  ADD CONSTRAINT "CatalogMember_customPriceCents_nonnegative" CHECK ("customPriceCents" IS NULL OR "customPriceCents" >= 0);
