import { Guest, Item } from "@/lib/models";

// Direct deletions in Atlas bypass the admin API. Repair their dangling reservations
// when the invitation or admin panel loads.
export async function releaseOrphanedReservations() {
  const reservedBy = await Item.distinct("reservedBy", { reservedBy: { $ne: null } });
  if (!reservedBy.length) return;

  const guests = await Guest.find({ _id: { $in: reservedBy } }).select("_id").lean();
  const existing = new Set(guests.map((guest) => String(guest._id)));
  const orphaned = reservedBy.filter((id) => !existing.has(String(id)));
  if (orphaned.length) {
    await Item.updateMany(
      { reservedBy: { $in: orphaned } },
      { $set: { reservedBy: null } },
    );
  }
}
