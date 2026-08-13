"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { blueprintActions } from "../../../../workspace-routes";

const styles = {
  root: { display: "grid", justifyItems: "end", gap: 6 },
  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  retry: { minHeight: 34, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 13, fontWeight: 900 },
  cancel: { minHeight: 34, border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", color: "#dc2626", padding: "0 14px", fontSize: 13, fontWeight: 900 },
  status: { minHeight: 16, margin: 0, color: "#78716c", fontSize: 12 },
} satisfies Record<string, CSSProperties>;

export function JobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function mutate(action: "retry" | "cancel") {
    setPending(true);
    setMessage(action === "retry" ? "Retrying job…" : "Canceling job…");
    const response = await fetch(`/api/imports/jobs/${jobId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to update the job.");
      setPending(false);
      return;
    }
    setMessage(action === "retry" ? "Job queued for retry." : "Job canceled.");
    setPending(false);
    router.refresh();
  }

  return <div style={styles.root}>
    <div style={styles.actions}>
      <button disabled={pending || !["failed", "canceled"].includes(status)} type="button" style={styles.retry} onClick={() => mutate("retry")} data-element={blueprintActions.retryJob.elementId} data-action={blueprintActions.retryJob.actionId}>{blueprintActions.retryJob.label}</button>
      <button disabled={pending || !["queued", "processing"].includes(status)} type="button" style={styles.cancel} onClick={() => mutate("cancel")} data-element={blueprintActions.cancelJob.elementId} data-action={blueprintActions.cancelJob.actionId}>{blueprintActions.cancelJob.label}</button>
    </div>
    <p style={styles.status} aria-live="polite">{message}</p>
  </div>;
}
