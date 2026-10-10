import mongoose from "mongoose";
import { z } from "zod";
import { sameOrigin, jsonError } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Guest, Item } from "@/lib/models";

export const runtime = "nodejs";

const RSVP = z.object({
  name: z.string().trim().min(2).max(80),
  attending: z.boolean(),
  itemIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(50),
  contributions: z.array(z.enum(["Doce", "Salgado", "Refrigerante"])).max(3),
  otherGift: z.string().trim().max(120).default(""),
}).strict();

class ReservationConflict extends Error {}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem inválida.", 403);
  let body: z.infer<typeof RSVP>;
  try {
    body = RSVP.parse(await request.json());
  } catch {
    return jsonError("Confira o nome e as escolhas enviadas.", 400);
  }
  if (new Set(body.itemIds).size !== body.itemIds.length || new Set(body.contributions).size !== body.contributions.length) {
    return jsonError("Há escolhas repetidas.", 400);
  }
  if (!body.attending && (body.itemIds.length || body.contributions.length || body.otherGift)) {
    return jsonError("Quem não comparecerá não pode reservar itens.", 400);
  }

  try {
    await connectDB();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const [guest] = await Guest.create([{
          name: body.name, attending: body.attending,
          itemIds: body.itemIds, contributions: body.contributions, otherGift: body.otherGift,
        }], { session });
        for (const id of body.itemIds) {
          const item = await Item.findOneAndUpdate(
            { _id: id, active: true, reservedBy: null },
            { $set: { reservedBy: guest._id } },
            { session, new: true },
          );
          if (!item) throw new ReservationConflict("Um item já foi reservado. Atualize a lista e tente novamente.");
        }
      });
    } finally {
      await session.endSession();
    }
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ReservationConflict || (error instanceof Error && /WriteConflict|TransientTransactionError/.test(error.message))) {
      return jsonError("Um item acabou de ser reservado. Atualize a lista e tente novamente.", 409);
    }
    console.error("Falha ao confirmar RSVP", error);
    return jsonError("Não foi possível salvar agora. Tente novamente.", 500);
  }
}
