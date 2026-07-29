import { normalizeCatalogItemInput } from "./catalog.js";
import { requireWorkspaceAccess } from "../../types/src/workspace.js";

export function createCatalogApi({ repository, workspaceContext }) {
  return {
    createItem(input) {
      requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);

      return repository.save(
        normalizeCatalogItemInput({
          ...input,
          workspaceId: workspaceContext.workspaceId,
        }),
      );
    },
    searchItems(query = "") {
      requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);

      const normalizedQuery = query.trim().toLowerCase();
      return repository
        .listByWorkspace(workspaceContext.workspaceId)
        .filter((item) => item.name.toLowerCase().includes(normalizedQuery) || item.sku.toLowerCase().includes(normalizedQuery));
    },
  };
}
