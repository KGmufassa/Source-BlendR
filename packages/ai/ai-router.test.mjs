import assert from "node:assert/strict";
import test from "node:test";

import { createCapabilityRouter } from "./src/router.js";

test("capability router executes the first healthy provider for a capability", async () => {
  const router = createCapabilityRouter([
    {
      id: "offline",
      capabilities: ["normalize_item"],
      health: async () => ({ ok: false }),
      execute: async () => {
        throw new Error("should_not_execute");
      },
    },
    {
      id: "local",
      capabilities: ["normalize_item"],
      health: async () => ({ ok: true }),
      execute: async ({ input }) => ({ name: input.name.trim() }),
    },
  ]);

  assert.deepEqual(await router.executeCapability("normalize_item", { input: { name: " Tea " } }), {
    providerId: "local",
    mode: "provider",
    output: { name: "Tea" },
  });
});

test("capability router returns manual fallback when no provider is available", async () => {
  const router = createCapabilityRouter([]);

  assert.deepEqual(await router.executeCapability("normalize_item", { input: { name: "Tea" } }), {
    providerId: null,
    mode: "manual_fallback",
    output: null,
    reason: "no_provider_available",
  });
});
