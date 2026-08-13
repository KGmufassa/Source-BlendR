import { describe, expect, it } from "vitest";
import { requireSameOrigin } from "./request-security.js";

describe("mutation request security", () => {
  it("rejects a cross-origin browser mutation", () => {
    const request = new Request("https://app.example/api/vendors", { method: "POST", headers: { origin: "https://evil.example" } });
    expect(() => requireSameOrigin(request)).toThrow("cross_origin_request_forbidden");
  });

  it("allows same-origin and non-browser requests", () => {
    expect(() => requireSameOrigin(new Request("https://app.example/api/vendors", { headers: { origin: "https://app.example" } }))).not.toThrow();
    expect(() => requireSameOrigin(new Request("https://app.example/api/vendors"))).not.toThrow();
  });

  it("uses the forwarded browser host behind a local proxy", () => {
    const request = new Request("http://localhost:3001/api/vendors", { headers: { host: "127.0.0.1:3001", origin: "http://127.0.0.1:3001" } });
    expect(() => requireSameOrigin(request)).not.toThrow();
  });
});
