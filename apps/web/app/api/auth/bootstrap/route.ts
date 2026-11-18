import { NextRequest, NextResponse } from "next/server";
import { verifyOneTimeToken } from "../../../../lib/auth";
import { authHubUrlForHost } from "../../../../lib/auth-public";
import { safeNextPath } from "../../../../lib/profile-handoff";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ott = request.nextUrl.searchParams.get("ott");
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (!ott) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const verifyResponse = await verifyOneTimeToken(request, ott);

  if (!verifyResponse.ok) {
    const login = new URL(authHubUrlForHost(request.nextUrl.hostname));
    login.searchParams.set("callbackURL", new URL(nextPath, request.url).toString());
    return NextResponse.redirect(login);
  }

  const redirect = NextResponse.redirect(new URL(nextPath, request.url));
  for (const cookie of verifyResponse.headers.getSetCookie()) {
    redirect.headers.append("Set-Cookie", cookie);
  }
  return redirect;
}
