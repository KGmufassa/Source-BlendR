import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const vendorSchema = z.object({
  name: z.string().trim().min(1).max(200),
  websiteUrl: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only HTTP(S) URLs are allowed.").nullable().optional(),
});
const vendorSelectionSchema = z.object({ vendorIds: z.array(z.string().min(1)).min(1).max(500) });

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    return Response.json({ data: await getDatabase().vendor.findMany({ where: { workspaceId: context.workspaceId }, orderBy: { name: "asc" } }) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = vendorSchema.parse(await request.json());
    const vendor = await getDatabase().vendor.create({ data: { workspaceId: context.workspaceId, ...input } });
    return Response.json({ data: vendor }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { vendorIds: requestedIds } = vendorSelectionSchema.parse(await request.json());
    const vendorIds = [...new Set(requestedIds)];
    const deleted = await getDatabase().$transaction(async (transaction) => {
      const count = await transaction.vendor.count({ where: { id: { in: vendorIds }, workspaceId: context.workspaceId } });
      if (count !== vendorIds.length) throw new Error("vendor_selection_invalid");
      const referencedItems = await transaction.catalogItem.count({ where: { vendorId: { in: vendorIds }, workspaceId: context.workspaceId } });
      if (referencedItems) throw new Error("vendor_in_use");
      const result = await transaction.vendor.deleteMany({ where: { id: { in: vendorIds }, workspaceId: context.workspaceId } });
      if (result.count !== vendorIds.length) throw new Error("vendor_selection_invalid");
      return result;
    });
    return Response.json({ data: { deleted: deleted.count } });
  } catch (error) {
    if (error instanceof Error && error.message === "vendor_in_use") {
      return Response.json({ error: { code: "vendor_in_use", message: "One or more selected vendors are assigned to catalog items. Remove those assignments before deleting the vendors." } }, { status: 409 });
    }
    return apiError(error);
  }
}
