import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getRuntimeInfrastructure } from "@/server/infrastructure/app-runtime";
import { createSupplierSchema } from "@/server/suppliers/api-schemas";
import { SupplierService } from "@/server/suppliers/supplier-service";

function supplierService() {
  const runtime = getRuntimeInfrastructure();
  return new SupplierService(runtime.database, runtime.audit);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    await requireWorkspacePermission(workspaceId, "supplier:read");
    const suppliers = await supplierService().listSuppliers(workspaceId);

    return NextResponse.json({ suppliers });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "supplier:create");
    const input = createSupplierSchema.parse(await request.json());
    const supplier = await supplierService().createSupplier(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      input
    );

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
