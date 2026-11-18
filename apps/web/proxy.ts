import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const ott = request.nextUrl.searchParams.get("ott");
  if (!ott || request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const bootstrap = new URL("/api/auth/bootstrap", request.url);
  bootstrap.searchParams.set("ott", ott);
  bootstrap.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(bootstrap);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
