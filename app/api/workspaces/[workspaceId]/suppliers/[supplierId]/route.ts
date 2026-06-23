import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { updateSupplierSchema } from "@/server/suppliers/api-schemas";
import { SupplierService } from "@/server/suppliers/supplier-service";

type SupplierRouteContext = {
  params: Promise<{ workspaceId: string; supplierId: string }>;
};

function supplierService() {
  const runtime = getRuntimeInfrastructure();
  return new SupplierService(runtime.database, runtime.audit);
}

export async function GET(_request: NextRequest, context: SupplierRouteContext) {
  try {
    const { workspaceId, supplierId } = await context.params;
    await requireWorkspacePermission(workspaceId, "supplier:read");
    const supplier = await supplierService().getSupplier(workspaceId, supplierId);

    return NextResponse.json({ supplier });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, context: SupplierRouteContext) {
  try {
    const { workspaceId, supplierId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "supplier:update");
    const input = updateSupplierSchema.parse(await request.json());
    const supplier = await supplierService().updateSupplier(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      supplierId,
      input
    );

    return NextResponse.json({ supplier });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, context: SupplierRouteContext) {
  try {
    const { workspaceId, supplierId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "supplier:archive");
    const supplier = await supplierService().archiveSupplier(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      supplierId
    );

    return NextResponse.json({ supplier });
  } catch (error) {
    return jsonError(error);
  }
}
