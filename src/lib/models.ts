import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ItemSchema = new Schema({
  seedKey: { type: String, unique: true, sparse: true },
  label: { type: String, required: true, trim: true, maxlength: 100 },
  position: { type: Number, required: true },
  active: { type: Boolean, default: true },
  reservedBy: { type: Schema.Types.ObjectId, ref: "Guest", default: null },
}, { timestamps: true });

const GuestSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  attending: { type: Boolean, required: true },
  contributions: [{ type: String, enum: ["Doce", "Salgado", "Refrigerante"] }],
  itemIds: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  otherGift: { type: String, trim: true, maxlength: 120, default: "" },
}, { timestamps: true });

const EventSchema = new Schema({
  key: { type: String, unique: true, default: "main" },
  date: { type: String, default: "" },
  time: { type: String, default: "" },
  address: { type: String, default: "" },
  note: { type: String, default: "" },
}, { timestamps: true });

const LoginAttemptSchema = new Schema({
  key: { type: String, unique: true, required: true },
  failures: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
});
LoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type ItemDoc = InferSchemaType<typeof ItemSchema>;
export type GuestDoc = InferSchemaType<typeof GuestSchema>;
export type EventDoc = InferSchemaType<typeof EventSchema>;
export type LoginAttemptDoc = InferSchemaType<typeof LoginAttemptSchema>;

export const Item = (mongoose.models.Item as Model<ItemDoc> | undefined) ?? mongoose.model<ItemDoc>("Item", ItemSchema);
export const Guest = (mongoose.models.Guest as Model<GuestDoc> | undefined) ?? mongoose.model<GuestDoc>("Guest", GuestSchema);
export const Event = (mongoose.models.Event as Model<EventDoc> | undefined) ?? mongoose.model<EventDoc>("Event", EventSchema);
export const LoginAttempt: Model<LoginAttemptDoc> = (mongoose.models.LoginAttempt as Model<LoginAttemptDoc> | undefined) ?? mongoose.model<LoginAttemptDoc>("LoginAttempt", LoginAttemptSchema);
