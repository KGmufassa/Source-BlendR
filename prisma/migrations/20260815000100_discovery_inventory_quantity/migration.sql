ALTER TABLE "CatalogItem"
  ADD COLUMN "inventoryQuantity" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "CatalogItem"
  ADD CONSTRAINT "CatalogItem_inventoryQuantity_nonnegative" CHECK ("inventoryQuantity" >= 0);
