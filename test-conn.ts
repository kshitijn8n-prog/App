import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

console.log('Testing connection with URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

async function test() {
    try {
        console.log('Attempting to connect...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Successfully connected!');

        // Try a simple query
        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

test();
