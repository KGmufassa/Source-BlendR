import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default process.env.SOURCE_BLENDR_DEV_AUTH === "1" && (process.env.NODE_ENV !== "production" || process.env.SOURCE_BLENDR_ALLOW_DEV_AUTH_IN_PRODUCTION === "1")
  ? () => NextResponse.next()
  : clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|woff2?)).*)", "/(api)(.*)"],
};
