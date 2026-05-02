import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let MONGODB_URI = '';
for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
        const index = line.indexOf('=');
        MONGODB_URI = line.slice(index + 1).trim();
    }
}

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

console.log('Testing connection (ESM)...');

async function test() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Failed:', err.message);
        process.exit(1);
    }
}

test();
