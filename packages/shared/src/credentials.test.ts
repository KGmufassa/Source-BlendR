import { describe, expect, it } from "vitest";
import { decryptCredential, encryptCredential } from "./credentials.js";

const key = "a".repeat(64);

describe("provider credential encryption", () => {
  it("round-trips without storing plaintext", () => {
    const encrypted = encryptCredential("secret-value", key);
    expect(encrypted).not.toContain("secret-value");
    expect(decryptCredential(encrypted, key)).toBe("secret-value");
  });

  it("rejects invalid encryption keys", () => {
    expect(() => encryptCredential("secret-value", "short")).toThrow("CREDENTIAL_ENCRYPTION_KEY");
  });
});
