
import mongoose from 'mongoose';

async function createAdmin() {
    const MONGODB_URI = 'mongodb://localhost:27017';

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const UserSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            type: { type: String, enum: ['student', 'landlord', 'admin'], default: 'student' },
            isVerified: { type: Boolean, default: false },
        });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const adminEmail = 'admin@test.com';
        const adminData = {
            name: 'System Admin',
            email: adminEmail,
            password: 'password123',
            type: 'admin',
            isVerified: true
        };

        const result = await User.findOneAndUpdate(
            { email: adminEmail },
            { $set: adminData },
            { upsert: true, new: true }
        );

        console.log('Admin user updated/created successfully:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createAdmin();
