import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, SESSION_SECONDS, createSession, jsonError, safeEqual, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { LoginAttempt } from "@/lib/models";

export const runtime = "nodejs";

const Credentials = z.object({ username: z.string().max(100), password: z.string().max(200) }).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  let body: z.infer<typeof Credentials>;
  try { body = Credentials.parse(await request.json()); }
  catch { return jsonError("Credenciais inválidas.", 400); }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash || !process.env.SESSION_SECRET) {
    return jsonError("Administrador não configurado.", 503);
  }
  try {
    await connectDB();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const key = createHash("sha256").update(`${ip}:${process.env.SESSION_SECRET}`).digest("hex");
    const now = new Date();
    const attempt = await LoginAttempt.findOne({ key });
    if (attempt?.lockedUntil && attempt.lockedUntil > now) {
      return jsonError("Muitas tentativas. Aguarde 15 minutos.", 429);
    }
    const userOk = safeEqual(body.username, expectedUser);
    const passwordOk = await bcrypt.compare(body.password, expectedHash);
    if (!userOk || !passwordOk) {
      const nextFailures = (attempt?.failures ?? 0) + 1;
      await LoginAttempt.updateOne({ key }, {
        $set: {
          failures: nextFailures,
          lockedUntil: nextFailures >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      }, { upsert: true });
      return jsonError("Credenciais inválidas.", 401);
    }
    await LoginAttempt.deleteOne({ key });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, await createSession(), {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", path: "/", maxAge: SESSION_SECONDS,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Falha no login", error);
    return jsonError("Não foi possível entrar agora.", 500);
  }
}
