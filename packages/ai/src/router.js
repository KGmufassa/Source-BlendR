export function createCapabilityRouter(providers = []) {
  return {
    async health() {
      return Promise.all(
        providers.map(async (provider) => ({
          providerId: provider.id,
          ...(await provider.health()),
        })),
      );
    },
    async executeCapability(capability, request) {
      for (const provider of providers) {
        if (!provider.capabilities.includes(capability)) {
          continue;
        }

        const health = await provider.health();
        if (!health.ok) {
          continue;
        }

        return {
          providerId: provider.id,
          mode: "provider",
          output: await provider.execute({ capability, ...request }),
        };
      }

      return {
        providerId: null,
        mode: "manual_fallback",
        output: null,
        reason: "no_provider_available",
      };
    },
  };
}
