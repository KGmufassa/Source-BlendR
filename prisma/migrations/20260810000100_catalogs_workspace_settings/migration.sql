ALTER TABLE "Workspace"
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en-US',
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "measurementSystem" TEXT NOT NULL DEFAULT 'metric',
  ADD COLUMN "logoUrl" TEXT;

ALTER TABLE "CatalogItem"
  ADD COLUMN "vendorPriceCents" INTEGER,
  ADD COLUMN "category" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "imageUrl" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

CREATE TABLE "WorkspaceMember" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'org:member',
  "displayName" TEXT,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Catalog" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "categoryType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogMember" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "catalogId" TEXT NOT NULL,
  "candidateId" TEXT,
  "catalogItemId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
CREATE INDEX "WorkspaceMember_workspaceId_role_idx" ON "WorkspaceMember"("workspaceId", "role");
CREATE UNIQUE INDEX "Catalog_workspaceId_name_key" ON "Catalog"("workspaceId", "name");
CREATE INDEX "Catalog_workspaceId_updatedAt_idx" ON "Catalog"("workspaceId", "updatedAt");
CREATE UNIQUE INDEX "CatalogMember_catalogId_candidateId_key" ON "CatalogMember"("catalogId", "candidateId");
CREATE UNIQUE INDEX "CatalogMember_catalogId_catalogItemId_key" ON "CatalogMember"("catalogId", "catalogItemId");
CREATE INDEX "CatalogMember_workspaceId_catalogId_idx" ON "CatalogMember"("workspaceId", "catalogId");

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogMember" ADD CONSTRAINT "CatalogMember_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "Catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogMember" ADD CONSTRAINT "CatalogMember_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogMember" ADD CONSTRAINT "CatalogMember_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
