import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { updateSupplierSourceSchema } from "@/server/suppliers/api-schemas";
import { SupplierService } from "@/server/suppliers/supplier-service";

type SupplierSourceRouteContext = {
  params: Promise<{ workspaceId: string; supplierId: string; sourceId: string }>;
};

function supplierService() {
  const runtime = getRuntimeInfrastructure();
  return new SupplierService(runtime.database, runtime.audit);
}

export async function PATCH(request: NextRequest, context: SupplierSourceRouteContext) {
  try {
    const { workspaceId, supplierId, sourceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "supplier:update");
    const input = updateSupplierSourceSchema.parse(await request.json());
    const source = await supplierService().updateSource(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      supplierId,
      sourceId,
      input
    );

    return NextResponse.json({ source });
  } catch (error) {
    return jsonError(error);
  }
}
