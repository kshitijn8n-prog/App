
import dbConnect from './lib/mongodb';
import User from './models/User';

async function createAdmin() {
    // Force set the URI for local environment if not in .env.local
    if (!process.env.MONGODB_URI) {
        process.env.MONGODB_URI = 'mongodb://localhost:27017';
    }

    try {
        await dbConnect();

        const adminEmail = 'admin@test.com';
        const adminData = {
            name: 'System Admin',
            email: adminEmail,
            password: 'password123',
            type: 'admin',
            isVerified: true
        };

        // Find or update the admin user
        const result = await (User as any).findOneAndUpdate(
            { email: adminEmail },
            { $set: adminData },
            { upsert: true, new: true }
        );

        console.log('Admin user updated/created successfully:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
