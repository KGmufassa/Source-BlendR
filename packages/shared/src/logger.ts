export function log(level: "info" | "error", event: string, detail: Record<string, unknown> = {}): void {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...detail });
  (level === "error" ? console.error : console.log)(entry);
}
