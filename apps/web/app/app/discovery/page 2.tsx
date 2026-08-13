import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../page-actions";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const context = await getWorkspaceContext();
  const sessions = await getDatabase().discoverySession.findMany({ where: { workspaceId: context.workspaceId }, include: { importJob: { select: { sourceType: true } }, _count: { select: { candidates: true } } }, orderBy: { updatedAt: "desc" } });
  return (
    <>
      <PageHeader title="Discovery sessions" description="Open candidate review sessions created by import jobs." />
      <section className="panel">
        <h2>Open sessions</h2>
        {sessions.length ? <DataTable label="Open discovery sessions">
          <thead><tr><th>Session</th><th>Source</th><th>Status</th><th>Candidates</th><th>Action</th></tr></thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td data-label="Session">{session.id}</td>
                <td data-label="Source">{session.importJob.sourceType}</td>
                <td data-label="Status"><StatusBadge>{session.status}</StatusBadge></td>
                <td data-label="Candidates">{session._count.candidates}</td>
                <td data-label="Action"><ButtonLink href={`/app/discovery/${session.id}`}>Open Discovery Session</ButtonLink></td>
              </tr>
            ))}
          </tbody>
        </DataTable> : <p className="state-card">No discovery sessions yet. Completed imports will appear here.</p>}
      </section>
    </>
  );
}
