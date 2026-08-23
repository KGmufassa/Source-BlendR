ALTER TABLE "AIProviderCredential"
ADD COLUMN "lastConnectionStatus" TEXT,
ADD COLUMN "lastConnectionCheckedAt" TIMESTAMP(3);
