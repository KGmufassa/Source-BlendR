import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { PricingService } from "@/server/pricing/pricing-service";

export function createPricingService() {
  const runtime = getRuntimeInfrastructure();
  return new PricingService(runtime.database, runtime.audit);
}
