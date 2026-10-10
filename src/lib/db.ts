import mongoose from "mongoose";
import dns from "node:dns";
import { createHash } from "node:crypto";

declare global {
  // eslint-disable-next-line no-var
  var mongoosePromise: Promise<typeof mongoose> | undefined;
  // eslint-disable-next-line no-var
  var mongooseUriFingerprint: string | undefined;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI não configurada");
  const fingerprint = createHash("sha256").update(uri).digest("hex");
  const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  if (global.mongoosePromise && global.mongooseUriFingerprint !== fingerprint) {
    global.mongoosePromise = mongoose.disconnect().then(() => mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 }));
    global.mongooseUriFingerprint = fingerprint;
  }
  if (!global.mongoosePromise) {
    global.mongoosePromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    global.mongooseUriFingerprint = fingerprint;
  }
  try {
    return await global.mongoosePromise;
  } catch (error) {
    global.mongoosePromise = undefined;
    global.mongooseUriFingerprint = undefined;
    throw error;
  }
}
