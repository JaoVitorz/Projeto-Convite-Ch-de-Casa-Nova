import { NextResponse } from "next/server";
import { COOKIE_NAME, jsonError, sameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
