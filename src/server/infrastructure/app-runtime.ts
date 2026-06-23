import { createRuntimeInfrastructure } from "@/server/infrastructure/runtime";
import { PricingService } from "@/server/pricing/pricing-service";
import { QuoteService } from "@/server/quotes/quote-service";

const globalRuntime = globalThis as typeof globalThis & {
  __sourceBlendrRuntime?: ReturnType<typeof createRuntimeInfrastructure>;
};

export function getRuntimeInfrastructure() {
  globalRuntime.__sourceBlendrRuntime ??= createRuntimeInfrastructure();
  return globalRuntime.__sourceBlendrRuntime;
}

export function getPricingService() {
  const runtime = getRuntimeInfrastructure();
  return new PricingService(runtime.database, runtime.audit);
}

export function getQuoteService() {
  const runtime = getRuntimeInfrastructure();
  return new QuoteService(runtime.database, runtime.audit, runtime.queue, getPricingService());
}
