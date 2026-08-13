import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  websiteUrl: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only HTTP(S) URLs are allowed.").nullable().optional(),
  archived: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ vendorId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { vendorId } = await params;
    const vendor = await getDatabase().vendor.findFirst({ where: { id: vendorId, workspaceId: context.workspaceId } });
    if (!vendor) throw new Error("vendor_not_found");
    return Response.json({ data: vendor });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ vendorId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { vendorId } = await params;
    const input = updateSchema.parse(await request.json());
    const result = await getDatabase().vendor.updateMany({
      where: { id: vendorId, workspaceId: context.workspaceId },
      data: { name: input.name, websiteUrl: input.websiteUrl, ...(input.archived === undefined ? {} : { archivedAt: input.archived ? new Date() : null }) },
    });
    if (!result.count) throw new Error("vendor_not_found");
    return GET(request, { params: Promise.resolve({ vendorId }) });
  } catch (error) {
    return apiError(error);
  }
}
