import { NextRequest, NextResponse } from "next/server";
import { issueOneTimeToken, readSession } from "../../../../lib/auth";
import { authHubUrlForHost } from "../../../../lib/auth-public";
import { hubAccountHandoffUrl } from "../../../../lib/profile-handoff";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const hub = authHubUrlForHost(request.nextUrl.hostname).replace(/\/$/, "");
  const session = await readSession(request.headers);
  if (!session) {
    return NextResponse.redirect(hub);
  }

  const issued = await issueOneTimeToken(request.headers).catch(() => null);
  if (!issued?.token) {
    return NextResponse.redirect(`${hub}/account`);
  }

  return NextResponse.redirect(hubAccountHandoffUrl(hub, issued.token));
}
