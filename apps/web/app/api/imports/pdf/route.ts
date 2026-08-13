import { getDatabase, storePdfObject } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getImportQueue } from "@/lib/import-queue";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const formSchema = z.object({
  vendorId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const form = await request.formData();
    const input = formSchema.parse({
      vendorId: stringValue(form.get("vendor_id")),
    });
    const file = form.get("pdf_file");
    if (!(file instanceof File)) throw new Error("pdf_file_required");
    if (file.type !== "application/pdf") throw new Error("pdf_file_type_invalid");
    if (file.size > 50 * 1024 * 1024) throw new Error("pdf_file_too_large");

    const database = getDatabase();
    if (input.vendorId) {
      const vendor = await database.vendor.findFirst({ where: { id: input.vendorId, workspaceId: context.workspaceId } });
      if (!vendor) throw new Error("vendor_not_found");
    }

    const storedObject = await storePdfObject({
      workspaceId: context.workspaceId,
      fileName: file.name,
      bytes: Buffer.from(await file.arrayBuffer()),
    });

    const job = await database.importJob.create({
      data: {
        workspaceId: context.workspaceId,
        vendorId: input.vendorId,
        sourceType: "pdf",
        sourceUri: storedObject.sourceUri,
        requestedByUserId: context.userId,
        events: {
          create: {
            workspaceId: context.workspaceId,
            type: "queued",
            detail: {
              fileName: file.name,
              byteSize: storedObject.byteSize,
              sha256: storedObject.sha256,
              storageKey: storedObject.storageKey,
            },
          },
        },
      },
    });

    await getImportQueue().add("pdf_extract", {
      jobId: job.id,
      workspaceId: context.workspaceId,
      sourceType: "pdf",
      sourceUri: storedObject.sourceUri,
    }, { jobId: job.id, attempts: 3, backoff: { type: "exponential", delay: 1_000 } });

    return Response.json({ data: job }, { status: 202 });
  } catch (error) {
    return apiError(error);
  }
}

function stringValue(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
