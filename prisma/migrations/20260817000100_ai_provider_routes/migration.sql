CREATE TABLE "AIProviderRoute" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "capability" TEXT NOT NULL,
  "providerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AIProviderRoute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AIProviderRoute_workspaceId_capability_key" ON "AIProviderRoute"("workspaceId", "capability");
CREATE INDEX "AIProviderRoute_workspaceId_idx" ON "AIProviderRoute"("workspaceId");
CREATE INDEX "AIProviderRoute_providerId_idx" ON "AIProviderRoute"("providerId");

ALTER TABLE "AIProviderRoute" ADD CONSTRAINT "AIProviderRoute_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIProviderRoute" ADD CONSTRAINT "AIProviderRoute_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProviderCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
