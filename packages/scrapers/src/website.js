const TITLE_PATTERN = /<title>(.*?)<\/title>/is;
const ANCHOR_PATTERN = /<a\b[^>]*>(.*?)<\/a>/gis;

export function normalizeWebsiteSource({ workspaceId, sourceUri, html }) {
  if (!workspaceId) {
    throw new Error("workspace_required");
  }
  if (!/^https?:\/\//.test(sourceUri ?? "")) {
    throw new Error("source_uri_invalid");
  }

  const title = html.match(TITLE_PATTERN)?.[1]?.trim() ?? "";
  const records = [...html.matchAll(ANCHOR_PATTERN)]
    .map((match) => match[1].replaceAll(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  return {
    sourceType: "website",
    workspaceId,
    sourceUri,
    title,
    records,
  };
}
