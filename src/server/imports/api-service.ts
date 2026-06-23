import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { ImportService } from "@/server/imports/import-service";
import { SupplierService } from "@/server/suppliers/supplier-service";

export function createImportService() {
  const runtime = getRuntimeInfrastructure();
  const supplierService = new SupplierService(runtime.database, runtime.audit);

  return new ImportService(runtime.database, runtime.audit, runtime.queue, supplierService);
}
