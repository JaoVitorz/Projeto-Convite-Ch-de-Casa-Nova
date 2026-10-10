import { z } from "zod";
import { isAdmin, jsonError, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Item } from "@/lib/models";

export const runtime = "nodejs";

const NewItem = z.object({ label: z.string().trim().min(2).max(100) }).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  if (!await isAdmin()) return jsonError("Acesso negado.", 401);
  let body: z.infer<typeof NewItem>;
  try { body = NewItem.parse(await request.json()); }
  catch { return jsonError("Informe um item válido.", 400); }
  try {
    await connectDB();
    const last = await Item.findOne().sort({ position: -1 }).lean();
    const item = await Item.create({ label: body.label, position: (last?.position ?? -1) + 1 });
    return Response.json({ id: String(item._id) }, { status: 201 });
  } catch (error) {
    console.error("Falha ao adicionar item", error);
    return jsonError("Não foi possível adicionar o item.", 500);
  }
}
