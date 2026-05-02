const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let MONGODB_URI = '';
for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.split('=')[1].trim();
    }
}

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

console.log('Testing connection with URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

async function test() {
    try {
        console.log('Attempting to connect...');
        // Use a 5 second timeout to avoid hanging forever
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

test();
