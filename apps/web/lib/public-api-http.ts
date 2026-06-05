import { NextResponse } from "next/server";

const PUBLIC_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withPublicCors(response: NextResponse) {
  for (const [key, value] of Object.entries(PUBLIC_CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function publicOptions() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
}

export function publicJson(data: unknown, init?: ResponseInit) {
  return withPublicCors(NextResponse.json(data, init));
}

export function publicJsonError(message: string, status = 400) {
  return publicJson({ error: message }, { status });
}
