import { connectDB } from "@/lib/db";
import { Event, Guest, Item } from "@/lib/models";
import { releaseOrphanedReservations } from "@/lib/reservations";

export async function publicData() {
  await connectDB();
  await releaseOrphanedReservations();
  const [items, event] = await Promise.all([
    Item.find({ active: true }).sort({ position: 1, _id: 1 }).lean(),
    Event.findOne({ key: "main" }).lean(),
  ]);
  return {
    items: items.map((item) => ({
      id: String(item._id), label: item.label, available: !item.reservedBy,
    })),
    event: {
      date: event?.date ?? "", time: event?.time ?? "",
      address: event?.address ?? "", note: event?.note ?? "",
    },
  };
}

export async function adminData() {
  await connectDB();
  await releaseOrphanedReservations();
  const [items, guests, event] = await Promise.all([
    Item.find().sort({ position: 1, _id: 1 }).lean(),
    Guest.find().sort({ createdAt: -1 }).lean(),
    Event.findOne({ key: "main" }).lean(),
  ]);
  const itemMap = new Map(items.map((item) => [String(item._id), item.label]));
  return {
    items: items.map((item) => ({
      id: String(item._id), label: item.label, active: item.active,
      reserved: !!item.reservedBy, position: item.position,
    })),
    guests: guests.map((guest) => ({
      id: String(guest._id), name: guest.name, attending: guest.attending,
      contributions: guest.contributions,
      items: [
        ...guest.itemIds.map((id) => itemMap.get(String(id)) ?? "Item removido"),
        ...(guest.otherGift ? [`Outro presente: ${guest.otherGift}`] : []),
      ],
      otherGift: guest.otherGift ?? "",
      createdAt: guest.createdAt.toISOString(),
    })),
    event: {
      date: event?.date ?? "", time: event?.time ?? "",
      address: event?.address ?? "", note: event?.note ?? "",
    },
  };
}
