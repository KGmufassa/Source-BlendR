import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const settingsSchema = z.object({ action: z.literal("settings"), name: z.string().trim().min(1).max(120), locale: z.string().trim().min(2).max(20), timezone: z.string().trim().min(1).max(80), currency: z.string().trim().length(3), measurementSystem: z.enum(["metric", "imperial"]), logoUrl: z.union([z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)), z.literal("")]) });
const memberSchema = z.object({ action: z.literal("member"), memberId: z.string().min(1), role: z.enum(["org:admin", "org:member", "viewer"]) });
const deletionSchema = z.object({ confirmation: z.string() });

function requireAdmin(role: string) {
  if (!["admin", "org:admin"].includes(role)) throw new Error("workspace_settings_forbidden");
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request); const context = await getWorkspaceContext(); requireAdmin(context.role); const input = z.union([settingsSchema, memberSchema]).parse(await request.json()); const database = getDatabase();
    if (input.action === "member") { const result = await database.workspaceMember.updateMany({ where: { id: input.memberId, workspaceId: context.workspaceId, userId: { not: context.userId } }, data: { role: input.role } }); if (!result.count) throw new Error("workspace_member_not_found_or_locked"); return Response.json({ data: { updated: 1 } }); }
    const workspace = await database.workspace.update({ where: { id: context.workspaceId }, data: { name: input.name, locale: input.locale, timezone: input.timezone, currency: input.currency.toUpperCase(), measurementSystem: input.measurementSystem, logoUrl: input.logoUrl || null } });
    return Response.json({ data: workspace });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request); const context = await getWorkspaceContext(); requireAdmin(context.role); const { confirmation } = deletionSchema.parse(await request.json()); const workspace = await getDatabase().workspace.findUnique({ where: { id: context.workspaceId } }); if (!workspace) throw new Error("workspace_not_found"); if (confirmation !== workspace.name) throw new Error("workspace_confirmation_mismatch"); await getDatabase().workspace.delete({ where: { id: workspace.id } }); return Response.json({ data: { deleted: true } });
  } catch (error) { return apiError(error); }
}
