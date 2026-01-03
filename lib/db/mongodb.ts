import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: CachedConnection;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDB(): Promise<Connection> {
    // ✅ Reuse healthy connection
    if (cached?.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // ✅ Create connection attempt if none exists
    if (!cached?.promise) {
        cached!.promise = mongoose
        .connect(MONGODB_URI)
        .then((m) => {
            console.log("✅ MongoDB connected");
            return m.connection;
        })
        .catch((error) => {
            console.error("❌ MongoDB connection error:", error);

            // 🔥 CLEAR CACHE so future calls retry
            cached && (cached.promise = null);
            cached && (cached.conn = null);

            throw error;
        });
    }

    // ✅ WAIT for the promise and cache the connection
    cached && (cached.conn = await cached.promise);

    return cached!.conn!;
}
