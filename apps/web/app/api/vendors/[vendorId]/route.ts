import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const httpUrlOrBlank = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Only HTTP(S) URLs are allowed.");

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  websiteUrl: httpUrlOrBlank.nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  logoUrl: httpUrlOrBlank.nullable().optional(),
  contactName: z.string().trim().max(160).nullable().optional(),
  contactRole: z.string().trim().max(160).nullable().optional(),
  contactEmail: z.union([z.string().trim().email(), z.literal("")]).nullable().optional(),
  contactPhone: z.string().trim().max(80).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  defaultImportMethod: z.enum(["website", "pdf"]).optional(),
  offeringType: z.string().trim().max(80).nullable().optional(),
  offeringCategories: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  offeringDescription: z.string().trim().max(2000).nullable().optional(),
  archived: z.boolean().optional(),
});

function requireEditor(role: string) {
  if (role === "viewer") throw new Error("permission_denied");
}

function emptyToNull(value: string | null | undefined) {
  if (value === undefined) return undefined;
  return value === "" ? null : value;
}

function compactUpdateData(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

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
    requireEditor(context.role);
    const { vendorId } = await params;
    const input = updateSchema.parse(await request.json());
    const offeringCategories = input.offeringCategories ? [...new Set(input.offeringCategories.map((value) => value.trim()).filter(Boolean))] : undefined;
    const result = await getDatabase().vendor.updateMany({
      where: { id: vendorId, workspaceId: context.workspaceId },
      data: compactUpdateData({
        name: input.name,
        websiteUrl: emptyToNull(input.websiteUrl),
        description: emptyToNull(input.description),
        logoUrl: emptyToNull(input.logoUrl),
        contactName: emptyToNull(input.contactName),
        contactRole: emptyToNull(input.contactRole),
        contactEmail: emptyToNull(input.contactEmail),
        contactPhone: emptyToNull(input.contactPhone),
        address: emptyToNull(input.address),
        defaultImportMethod: input.defaultImportMethod,
        offeringType: emptyToNull(input.offeringType),
        offeringCategories,
        offeringDescription: emptyToNull(input.offeringDescription),
        ...(input.archived === undefined ? {} : { archivedAt: input.archived ? new Date() : null }),
      }),
    });
    if (!result.count) throw new Error("vendor_not_found");
    return GET(request, { params: Promise.resolve({ vendorId }) });
  } catch (error) {
    return apiError(error);
  }
}
