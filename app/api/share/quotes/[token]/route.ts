import { NextResponse } from "next/server";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  try {
    const quote = await getQuoteService().resolveShareToken(token);
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
