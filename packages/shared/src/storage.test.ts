import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { extractPdfText, readStoredObject, storePdfObject } from "./storage.js";

describe("PDF object storage", () => {
  it("stores and reads PDFs workspace-scoped", async () => {
    const storageDir = await mkdtemp(join(tmpdir(), "source-blendr-storage-"));
    try {
      const stored = await storePdfObject({
        workspaceId: "workspace-1",
        fileName: "vendor catalog.pdf",
        bytes: Buffer.from("%PDF-1.4\nSKU-1\\nWidget"),
        storageDir,
      });

      expect(stored.sourceUri).toMatch(/^storage:\/\/workspace-1\//);
      expect(extractPdfText(await readStoredObject(stored.sourceUri, "workspace-1", storageDir))).toContain("Widget");
      await expect(readStoredObject(stored.sourceUri, "workspace-2", storageDir)).rejects.toThrow("storage_workspace_mismatch");
    } finally {
      await rm(storageDir, { recursive: true, force: true });
    }
  });

  it("rejects unsafe PDF file names", async () => {
    await expect(storePdfObject({
      workspaceId: "workspace-1",
      fileName: "../secret.pdf",
      bytes: Buffer.from("secret"),
      storageDir: "unused",
    })).rejects.toThrow("pdf_file_name_invalid");
  });

  it("rejects files without a PDF signature", async () => {
    await expect(storePdfObject({
      workspaceId: "workspace-1",
      fileName: "catalog.pdf",
      bytes: Buffer.from("not a pdf"),
      storageDir: "unused",
    })).rejects.toThrow("pdf_file_signature_invalid");
  });
});
