import { z } from "zod";
import { isAdmin, jsonError, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";

export const runtime = "nodejs";

const EventUpdate = z.object({
  date: z.string().trim().max(80),
  time: z.string().trim().max(80),
  address: z.string().trim().max(200),
  note: z.string().trim().max(300),
}).strict();

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  if (!await isAdmin()) return jsonError("Acesso negado.", 401);
  let body: z.infer<typeof EventUpdate>;
  try { body = EventUpdate.parse(await request.json()); }
  catch { return jsonError("Dados do convite inválidos.", 400); }
  try {
    await connectDB();
    await Event.updateOne({ key: "main" }, { $set: body }, { upsert: true });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha ao atualizar convite", error);
    return jsonError("Não foi possível salvar o convite.", 500);
  }
}
