import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { createSupplierSourceSchema } from "@/server/suppliers/api-schemas";
import { SupplierService } from "@/server/suppliers/supplier-service";

type SupplierSourcesRouteContext = {
  params: Promise<{ workspaceId: string; supplierId: string }>;
};

function supplierService() {
  const runtime = getRuntimeInfrastructure();
  return new SupplierService(runtime.database, runtime.audit);
}

export async function GET(_request: NextRequest, context: SupplierSourcesRouteContext) {
  try {
    const { workspaceId, supplierId } = await context.params;
    await requireWorkspacePermission(workspaceId, "supplier:read");
    const sources = await supplierService().listSources(workspaceId, supplierId);

    return NextResponse.json({ sources });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: SupplierSourcesRouteContext) {
  try {
    const { workspaceId, supplierId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "supplier:update");
    const input = createSupplierSourceSchema.parse(await request.json());
    const source = await supplierService().createSource(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      supplierId,
      input
    );

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
