CREATE TABLE "Workspace" (
  "id" TEXT NOT NULL,
  "clerkOrgId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vendor" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogItem" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "vendorId" TEXT,
  "type" TEXT NOT NULL DEFAULT 'product',
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "sku" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "attributes" JSONB NOT NULL DEFAULT '{}',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "sourceCandidateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImportJob" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "vendorId" TEXT,
  "sourceType" TEXT NOT NULL,
  "sourceUri" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "requestedByUserId" TEXT NOT NULL,
  "idempotencyKey" TEXT,
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "errorCode" TEXT,
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImportJobEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "detail" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ImportJobEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NormalizedSourceRecord" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "sourceHash" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceUri" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NormalizedSourceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscoverySession" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "importJobId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiscoverySession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CandidateItem" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "sourceRecordId" TEXT,
  "state" TEXT NOT NULL DEFAULT 'new',
  "name" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CandidateItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIProviderCredential" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "encryptedCredential" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIProviderCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "detail" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Workspace_clerkOrgId_key" ON "Workspace"("clerkOrgId");
CREATE UNIQUE INDEX "Vendor_workspaceId_name_key" ON "Vendor"("workspaceId", "name");
CREATE INDEX "Vendor_workspaceId_idx" ON "Vendor"("workspaceId");
CREATE UNIQUE INDEX "CatalogItem_workspaceId_sku_key" ON "CatalogItem"("workspaceId", "sku");
CREATE INDEX "CatalogItem_workspaceId_idx" ON "CatalogItem"("workspaceId");
CREATE INDEX "CatalogItem_vendorId_idx" ON "CatalogItem"("vendorId");
CREATE UNIQUE INDEX "ImportJob_workspaceId_idempotencyKey_key" ON "ImportJob"("workspaceId", "idempotencyKey");
CREATE INDEX "ImportJob_workspaceId_status_idx" ON "ImportJob"("workspaceId", "status");
CREATE INDEX "ImportJobEvent_workspaceId_jobId_createdAt_idx" ON "ImportJobEvent"("workspaceId", "jobId", "createdAt");
CREATE UNIQUE INDEX "NormalizedSourceRecord_workspaceId_sourceHash_key" ON "NormalizedSourceRecord"("workspaceId", "sourceHash");
CREATE INDEX "NormalizedSourceRecord_workspaceId_jobId_idx" ON "NormalizedSourceRecord"("workspaceId", "jobId");
CREATE UNIQUE INDEX "DiscoverySession_importJobId_key" ON "DiscoverySession"("importJobId");
CREATE INDEX "DiscoverySession_workspaceId_status_idx" ON "DiscoverySession"("workspaceId", "status");
CREATE UNIQUE INDEX "CandidateItem_workspaceId_sessionId_sku_key" ON "CandidateItem"("workspaceId", "sessionId", "sku");
CREATE INDEX "CandidateItem_workspaceId_sessionId_state_idx" ON "CandidateItem"("workspaceId", "sessionId", "state");
CREATE UNIQUE INDEX "AIProviderCredential_workspaceId_provider_key" ON "AIProviderCredential"("workspaceId", "provider");
CREATE INDEX "AIProviderCredential_workspaceId_idx" ON "AIProviderCredential"("workspaceId");
CREATE INDEX "AuditEvent_workspaceId_createdAt_idx" ON "AuditEvent"("workspaceId", "createdAt");

ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImportJobEvent" ADD CONSTRAINT "ImportJobEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NormalizedSourceRecord" ADD CONSTRAINT "NormalizedSourceRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NormalizedSourceRecord" ADD CONSTRAINT "NormalizedSourceRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscoverySession" ADD CONSTRAINT "DiscoverySession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscoverySession" ADD CONSTRAINT "DiscoverySession_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateItem" ADD CONSTRAINT "CandidateItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DiscoverySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateItem" ADD CONSTRAINT "CandidateItem_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "NormalizedSourceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AIProviderCredential" ADD CONSTRAINT "AIProviderCredential_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
