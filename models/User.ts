import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Simple for demo
    type: { type: String, enum: ['student', 'landlord', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    university: String,
    licenseNumber: String,
    phone: String,
    address: String,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
