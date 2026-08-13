import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const vendorSchema = z.object({
  name: z.string().trim().min(1).max(200),
  websiteUrl: z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Only HTTP(S) URLs are allowed.").nullable().optional(),
});

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
