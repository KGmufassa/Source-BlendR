ALTER TABLE "Vendor"
ADD COLUMN "description" TEXT,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "contactName" TEXT,
ADD COLUMN "contactRole" TEXT,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "defaultImportMethod" TEXT NOT NULL DEFAULT 'website',
ADD COLUMN "offeringType" TEXT,
ADD COLUMN "offeringCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "offeringDescription" TEXT;
