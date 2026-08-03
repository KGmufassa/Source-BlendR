import { ZodError } from "zod";

export function apiError(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({
      error: {
        code: "validation_failed",
        message: "The request was invalid.",
        field_errors: error.flatten().fieldErrors,
      },
    }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "unknown_error";
  const status = message === "authentication_required" ? 401 : message === "active_organization_required" ? 403 : 500;
  return Response.json({
    error: {
      code: status === 500 ? "internal_error" : message,
      message: status === 500 ? "The request could not be completed." : message,
    },
  }, { status });
}
