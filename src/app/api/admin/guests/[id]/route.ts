import mongoose from "mongoose";
import { isAdmin, jsonError, sameOrigin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Guest, Item } from "@/lib/models";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

class GuestNotFound extends Error {}

export async function DELETE(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  if (!await isAdmin()) return jsonError("Acesso negado.", 401);
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Convidado inválido.", 400);

  try {
    await connectDB();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const guest = await Guest.findById(id).session(session);
        if (!guest) throw new GuestNotFound();
        await Item.updateMany(
          { reservedBy: guest._id },
          { $set: { reservedBy: null } },
          { session },
        );
        await Guest.deleteOne({ _id: guest._id }, { session });
      });
    } finally {
      await session.endSession();
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof GuestNotFound) return jsonError("Convidado não encontrado.", 404);
    console.error("Falha ao excluir convidado", error);
    return jsonError("Não foi possível excluir o convidado.", 500);
  }
}
