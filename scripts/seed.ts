import { connectDB } from "../src/lib/db";
import { Event, Item } from "../src/lib/models";
import { checklist } from "../src/lib/seed-data";
import mongoose from "mongoose";

async function main() {
  await connectDB();
  for (const [index, label] of checklist.entries()) {
    await Item.updateOne(
      { seedKey: `foto-${String(index + 1).padStart(2, "0")}` },
      { $setOnInsert: { seedKey: `foto-${String(index + 1).padStart(2, "0")}`, label, position: index, active: true } },
      { upsert: true },
    );
  }
  await Event.updateOne({ key: "main" }, { $setOnInsert: { key: "main", date: "", time: "", address: "", note: "" } }, { upsert: true });
  console.log(`${checklist.length} itens conferidos; seed idempotente concluído.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());
