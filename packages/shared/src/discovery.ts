import { getDatabase } from "./db.ts";

export async function promoteCandidates(workspaceId: string, sessionId: string, candidateIds: string[]) {
  const database = getDatabase();
  const candidates = await database.candidateItem.findMany({
    where: { workspaceId, sessionId, id: { in: [...new Set(candidateIds)] }, state: { in: ["new", "updated"] } },
  });
  if (candidates.length !== new Set(candidateIds).size) throw new Error("candidate_selection_invalid");

  return database.$transaction(async (transaction) => {
    const items = [];
    for (const candidate of candidates) {
      items.push(await transaction.catalogItem.upsert({
        where: { workspaceId_sku: { workspaceId, sku: candidate.sku } },
        update: {
          name: candidate.name,
          priceCents: candidate.priceCents,
          currency: candidate.currency,
          sourceCandidateId: candidate.id,
        },
        create: {
          workspaceId,
          name: candidate.name,
          sku: candidate.sku,
          priceCents: candidate.priceCents,
          currency: candidate.currency,
          sourceCandidateId: candidate.id,
        },
      }));
      await transaction.candidateItem.update({
        where: { id: candidate.id },
        data: { state: "imported" },
      });
    }
    return items;
  });
}
