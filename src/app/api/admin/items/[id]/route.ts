import mongoose from "mongoose";
import { z } from "zod";
import { isAdmin, jsonError, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Item } from "@/lib/models";

export const runtime = "nodejs";

const UpdateItem = z.object({
  label: z.string().trim().min(2).max(100).optional(),
  active: z.boolean().optional(),
}).strict().refine((data) => data.label !== undefined || data.active !== undefined);

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  if (!await isAdmin()) return jsonError("Acesso negado.", 401);
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Item inválido.", 400);
  let body: z.infer<typeof UpdateItem>;
  try { body = UpdateItem.parse(await request.json()); }
  catch { return jsonError("Dados inválidos.", 400); }
  try {
    await connectDB();
    const item = await Item.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!item) return jsonError("Item não encontrado.", 404);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha ao atualizar item", error);
    return jsonError("Não foi possível atualizar o item.", 500);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  if (!await isAdmin()) return jsonError("Acesso negado.", 401);
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Item inválido.", 400);
  try {
    await connectDB();
    const item = await Item.findOneAndDelete({ _id: id, reservedBy: null });
    if (!item) return jsonError("Item reservado ou não encontrado. Desative-o para ocultar.", 409);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir item", error);
    return jsonError("Não foi possível excluir o item.", 500);
  }
}
