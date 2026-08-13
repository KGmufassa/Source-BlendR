import { getDatabase } from "@source-blendr/shared";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { DiscoveryClient } from "./discovery-client";

export const dynamic = "force-dynamic";

export default async function DiscoverySessionPage({ params }: Readonly<{ params: Promise<{ sessionId: string }> }>) {
  const { sessionId } = await params;
  const context = await getWorkspaceContext();
  const session = await getDatabase().discoverySession.findFirst({ where: { id: sessionId, workspaceId: context.workspaceId }, include: { candidates: { orderBy: { updatedAt: "desc" } } } });
  if (!session) notFound();

  return (
    <DiscoveryClient
      sessionId={sessionId}
      candidates={session.candidates.map((candidate) => ({ id: candidate.id, name: candidate.name, sku: candidate.sku, status: candidate.state, priceCents: candidate.priceCents, currency: candidate.currency, payload: candidate.payload }))}
    />
  );
}
