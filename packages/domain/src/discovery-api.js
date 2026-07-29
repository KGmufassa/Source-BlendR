import { normalizeCatalogItemInput } from "./catalog.js";
import { requireWorkspaceAccess } from "../../types/src/workspace.js";

export function createDiscoveryApi({ catalogRepository, workspaceContext }) {
  const candidates = [];

  return {
    addCandidate(input) {
      requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);
      const candidate = {
        candidateId: `candidate_${candidates.length + 1}`,
        sessionId: input.sessionId,
        workspaceId: workspaceContext.workspaceId,
        name: input.name,
        sku: input.sku,
        priceCents: input.priceCents,
        currency: input.currency,
        vendorId: input.vendorId,
        state: "ready",
      };

      try {
        normalizeCatalogItemInput(candidate);
      } catch {
        candidate.state = "needs_review";
      }

      candidates.push(candidate);
      return candidate;
    },
    promoteCandidate(candidateId) {
      requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);
      const candidate = candidates.find(
        (item) => item.candidateId === candidateId && item.workspaceId === workspaceContext.workspaceId,
      );
      if (!candidate) {
        throw new Error("candidate_not_found");
      }
      if (candidate.state !== "ready") {
        throw new Error("candidate_invalid");
      }

      const item = catalogRepository.save(normalizeCatalogItemInput(candidate));
      candidate.state = "promoted";
      return item;
    },
  };
}
