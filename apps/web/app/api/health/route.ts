import { getDatabase } from "@source-blendr/shared";

export async function GET() {
  try {
    await getDatabase().$queryRaw`SELECT 1`;
    return Response.json({ data: { status: "ready", database: "ready" } });
  } catch {
    return Response.json({ error: { code: "not_ready", message: "Database unavailable." } }, { status: 503 });
  }
}
