import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

let cachedPromise: Promise<typeof mongoose> | null = null;

async function dbConnect() {
    console.log("DB: URI found length:", MONGODB_URI?.length);
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!cachedPromise) {
        console.log("DB: Connecting...");
        cachedPromise = mongoose.connect(MONGODB_URI);
    }

    try {
        await cachedPromise;
        console.log("DB: Connected");
        return mongoose.connection;
    } catch (e) {
        cachedPromise = null;
        console.error("DB: Connection Error", e);
        throw e;
    }
}

export default dbConnect;
