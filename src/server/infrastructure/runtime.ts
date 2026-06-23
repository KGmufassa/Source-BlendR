import path from "node:path";
import { DatabaseAuditSink } from "@/server/audit/database-audit-sink";
import { MemoryDatabaseAdapter } from "@/server/persistence/memory-database";
import { MemoryJobQueueAdapter } from "@/server/queue/job-queue";
import { LocalObjectStorageAdapter } from "@/server/storage/local-object-storage";

export type RuntimeInfrastructure = ReturnType<typeof createRuntimeInfrastructure>;

export function createRuntimeInfrastructure(options: { storageRoot?: string } = {}) {
  const database = new MemoryDatabaseAdapter();
  const storage = new LocalObjectStorageAdapter(options.storageRoot ?? path.join(process.cwd(), ".source-blendr", "storage"));
  const queue = new MemoryJobQueueAdapter();
  const audit = new DatabaseAuditSink(database);

  return {
    database,
    storage,
    queue,
    audit
  };
}
