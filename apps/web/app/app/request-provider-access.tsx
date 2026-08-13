"use client";

import { useState } from "react";

const buttonStyle = {
  minHeight: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e7e5e4",
  borderRadius: 5,
  background: "#fff",
  color: "#57534e",
  padding: "0 14px",
  fontSize: 13,
  fontWeight: 800,
} as const;

export function RequestProviderAccess({ initialRequested }: Readonly<{ initialRequested: boolean }>) {
  const [pending, setPending] = useState(false);
  const [requested, setRequested] = useState(initialRequested);
  const [message, setMessage] = useState(initialRequested ? "Access request pending with workspace administrators." : "");

  async function requestAccess() {
    setPending(true);
    setMessage("Sending access request…");
    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ permission: "manage_ai_providers" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Unable to request access.");
      setRequested(true);
      setMessage(result.data.duplicate ? "An access request is already pending." : "Access request recorded for workspace administrators.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request access.");
    } finally {
      setPending(false);
    }
  }

  return <div>
    {requested ? null : <button type="button" disabled={pending} onClick={requestAccess} style={buttonStyle}>{pending ? "Requesting…" : "Request Access"}</button>}
    <p aria-live="polite" role="status" style={{ minHeight: 18, maxWidth: 360, margin: requested ? "0 auto" : "10px auto 0", color: requested ? "#047857" : "#78716c", fontSize: 12 }}>{message}</p>
  </div>;
}
