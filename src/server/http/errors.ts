import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { WorkspaceAccessError } from "@/domain/auth/rbac";
import {
  ImportBatchAlreadyCommittedError,
  ImportBatchNotFoundError,
  ImportCommitConflictError,
  ImportValidationError
} from "@/server/imports/import-service";
import {
  PricingCalculationError,
  PricingNotFoundError,
  PricingSnapshotImmutableError
} from "@/server/pricing/pricing-service";
import {
  QuoteApprovalBlockedError,
  QuoteNotFoundError,
  QuoteShareLinkError,
  QuoteStateError
} from "@/server/quotes/quote-service";
import { SupplierNotFoundError } from "@/server/suppliers/supplier-service";

export function jsonError(error: unknown) {
  if (error instanceof WorkspaceAccessError) {
    return NextResponse.json(
      {
        error: "permission_denied",
        message: error.message,
        permission: error.permission
      },
      { status: 403 }
    );
  }

  if (error instanceof SupplierNotFoundError) {
    return NextResponse.json(
      {
        error: "not_found",
        message: error.message,
        entity: error.entity
      },
      { status: 404 }
    );
  }

  if (error instanceof ImportBatchNotFoundError) {
    return NextResponse.json(
      {
        error: "not_found",
        message: error.message,
        entity: error.entity
      },
      { status: 404 }
    );
  }

  if (error instanceof ImportBatchAlreadyCommittedError) {
    return NextResponse.json(
      {
        error: "already_committed",
        message: error.message,
        importBatchId: error.importBatchId
      },
      { status: 409 }
    );
  }

  if (error instanceof ImportValidationError) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: error.message,
        importBatchId: error.importBatchId,
        rowErrors: error.rowErrors
      },
      { status: 422 }
    );
  }

  if (error instanceof ImportCommitConflictError) {
    return NextResponse.json(
      {
        error: "commit_conflict",
        message: error.message,
        importBatchId: error.importBatchId,
        conflictingSkus: error.conflictingSkus,
        batch: error.batch
      },
      { status: 409 }
    );
  }

  if (error instanceof PricingNotFoundError) {
    return NextResponse.json(
      {
        error: "not_found",
        message: error.message,
        entity: error.entity
      },
      { status: 404 }
    );
  }

  if (error instanceof PricingSnapshotImmutableError) {
    return NextResponse.json(
      {
        error: "snapshot_immutable",
        message: error.message,
        snapshotId: error.snapshotId
      },
      { status: 409 }
    );
  }

  if (error instanceof PricingCalculationError) {
    return NextResponse.json(
      {
        error: "pricing_calculation_error",
        message: error.message
      },
      { status: 422 }
    );
  }

  if (error instanceof QuoteNotFoundError) {
    return NextResponse.json(
      {
        error: "not_found",
        message: error.message,
        entity: error.entity
      },
      { status: 404 }
    );
  }

  if (error instanceof QuoteApprovalBlockedError) {
    return NextResponse.json(
      {
        error: "quote_approval_blocked",
        message: error.message,
        quoteId: error.quoteId,
        blockers: error.blockers
      },
      { status: 422 }
    );
  }

  if (error instanceof QuoteStateError) {
    return NextResponse.json(
      {
        error: "quote_state_error",
        message: error.message,
        quoteId: error.quoteId
      },
      { status: 409 }
    );
  }

  if (error instanceof QuoteShareLinkError) {
    return NextResponse.json(
      {
        error: "share_link_error",
        message: error.message
      },
      { status: 403 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "The request body is invalid.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "internal_error",
      message: "The request could not be completed."
    },
    { status: 500 }
  );
}
