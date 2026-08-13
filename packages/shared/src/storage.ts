import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export type StoredObject = {
  sourceUri: string;
  storageKey: string;
  byteSize: number;
  sha256: string;
};

const DEFAULT_STORAGE_DIR = ".source-blendr-storage";
const MAX_PDF_BYTES = 25 * 1024 * 1024;

export async function storePdfObject(input: {
  workspaceId: string;
  fileName: string;
  bytes: Buffer;
  storageDir?: string;
}): Promise<StoredObject> {
  assertWorkspace(input.workspaceId);
  assertPdfFileName(input.fileName);
  if (input.bytes.length === 0) throw new Error("pdf_file_empty");
  if (input.bytes.length > MAX_PDF_BYTES) throw new Error("pdf_file_too_large");
  if (!input.bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("pdf_file_signature_invalid");

  const hash = createHash("sha256").update(input.bytes).digest("hex");
  const key = `${Date.now()}-${randomUUID()}-${basename(input.fileName)}`;
  const directory = workspaceStorageDirectory(input.workspaceId, input.storageDir);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, key), input.bytes, { flag: "wx" });

  return {
    sourceUri: `storage://${input.workspaceId}/${key}`,
    storageKey: key,
    byteSize: input.bytes.length,
    sha256: hash,
  };
}

export async function readStoredObject(sourceUri: string, workspaceId: string, storageDir?: string): Promise<Buffer> {
  assertWorkspace(workspaceId);
  const { uriWorkspaceId, key } = parseStorageUri(sourceUri);
  if (uriWorkspaceId !== workspaceId) throw new Error("storage_workspace_mismatch");

  const path = join(workspaceStorageDirectory(workspaceId, storageDir), key);
  const fileStat = await stat(path);
  if (!fileStat.isFile()) throw new Error("storage_object_invalid");
  return readFile(path);
}

export function parseStorageUri(sourceUri: string): { uriWorkspaceId: string; key: string } {
  const url = new URL(sourceUri);
  if (url.protocol !== "storage:") throw new Error("storage_uri_invalid");
  const uriWorkspaceId = url.hostname;
  const key = decodeURIComponent(url.pathname.replace(/^\//, ""));
  assertWorkspace(uriWorkspaceId);
  if (!key || key.includes("/") || key.includes("\\")) throw new Error("storage_key_invalid");
  return { uriWorkspaceId, key };
}

export function extractPdfText(bytes: Buffer): string {
  // lazy: readable text extraction is enough for Stage 6 runtime proof; replace with a PDF parser/OCR adapter when launch fixtures require binary-layout extraction.
  return bytes.toString("utf8").replace(/\0/g, "").slice(0, 500_000);
}

function workspaceStorageDirectory(workspaceId: string, storageDir = process.env.SOURCE_BLENDR_STORAGE_DIR ?? DEFAULT_STORAGE_DIR): string {
  assertWorkspace(workspaceId);
  return join(storageDir, workspaceId);
}

function assertWorkspace(workspaceId: string): void {
  if (!/^[\w.-]+$/.test(workspaceId)) throw new Error("workspace_id_invalid");
}

function assertPdfFileName(fileName: string): void {
  if (!/^[\w .-]+\.pdf$/i.test(fileName)) throw new Error("pdf_file_name_invalid");
}
