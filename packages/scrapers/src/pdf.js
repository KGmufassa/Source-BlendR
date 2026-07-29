export function normalizePdfSource({ workspaceId, fileName, text }) {
  if (!workspaceId) {
    throw new Error("workspace_required");
  }
  if (!/^[\w.-]+\.pdf$/i.test(fileName ?? "")) {
    throw new Error("file_name_invalid");
  }

  return {
    sourceType: "pdf",
    workspaceId,
    fileName,
    records: String(text ?? "")
      .replaceAll("\\n", "\n")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}
