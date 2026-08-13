export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const url = new URL(request.url);
  const host = firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host") ?? url.host;
  const protocol = firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");
  if (origin !== `${protocol}://${host}`) throw new Error("cross_origin_request_forbidden");
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",", 1)[0]?.trim() || null;
}
