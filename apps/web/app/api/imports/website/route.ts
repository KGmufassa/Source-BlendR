import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getImportQueue } from "@/lib/import-queue";
import { getWorkspaceContext } from "@/lib/workspace-context";

const requestSchema = z.object({
  url: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only HTTP(S) URLs are allowed."),
  vendorId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const context = await getWorkspaceContext();
    const input = requestSchema.parse(await request.json());
    const idempotencyKey = request.headers.get("idempotency-key");
    const database = getDatabase();

    if (idempotencyKey) {
      const existing = await database.importJob.findUnique({
        where: { workspaceId_idempotencyKey: { workspaceId: context.workspaceId, idempotencyKey } },
      });
      if (existing) return Response.json({ data: existing });
    }

    const job = await database.importJob.create({
      data: {
        workspaceId: context.workspaceId,
        vendorId: input.vendorId,
        sourceType: "website",
        sourceUri: input.url,
        requestedByUserId: context.userId,
        idempotencyKey,
        events: { create: { workspaceId: context.workspaceId, type: "queued" } },
      },
    });
    await getImportQueue().add("website_scrape", {
      jobId: job.id,
      workspaceId: context.workspaceId,
      sourceUri: input.url,
    }, { jobId: job.id, attempts: 3, backoff: { type: "exponential", delay: 1_000 } });
    return Response.json({ data: job }, { status: 202 });
  } catch (error) {
    return apiError(error);
  }
}
