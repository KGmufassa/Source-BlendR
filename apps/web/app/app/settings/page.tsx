import { ButtonLink, PageHeader } from "../page-actions";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Workspace-scoped operational controls.">
        <ButtonLink href="/app/settings/ai" primary>AI Provider Settings</ButtonLink>
      </PageHeader>
      <section className="panel">
        <h2>Workspace settings</h2>
        <p className="muted">Workspace-scoped controls stay grouped here; AI routing has its own launch-critical screen.</p>
      </section>
    </>
  );
}
