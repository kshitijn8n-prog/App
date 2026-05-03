
import mongoose, { Schema } from 'mongoose';
import { Room } from '../types';

// We reuse the interface, but we need to create a schema that matches it.
// Note: 'id' in frontend usually maps to '_id' in MongoDB.

const ReviewSchema = new Schema({
    author: String,
    rating: Number,
    date: String,
    comment: String,
    university: String,
});

const LandlordSchema = new Schema({
    name: String,
    verified: Boolean,
    joinedDate: String,
    responseRate: Number,
});

const RoomSchema = new Schema<Room>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    universityProximity: [String],
    pricePerWeek: { type: Number, required: true },
    type: {
        type: String,
        enum: ['Private Studio', 'En-suite', 'Shared Room', 'Apartment'],
        required: true
    },
    amenities: [String],
    images: [String],
    rating: { type: Number, default: 0 },
    reviews: [ReviewSchema],
    landlord: LandlordSchema,
    availableFrom: String,
    status: {
        type: String,
        enum: ['PENDING', 'PUBLISHED'],
        default: 'PENDING'
    },
    rentalStatus: {
        type: String,
        enum: ['AVAILABLE', 'RENTED'],
        default: 'AVAILABLE'
    },
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

export default mongoose.models.Room || mongoose.model<Room>('Room', RoomSchema);
