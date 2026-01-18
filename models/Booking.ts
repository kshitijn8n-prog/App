import mongoose, { Schema } from 'mongoose';
import { Booking } from '../types';

const BookingSchema = new Schema<Booking>({
    roomId: {
        type: String,
        required: true
    },
    roomTitle: { type: String, required: true },
    tenantName: { type: String, required: true },
    tenantEmail: { type: String, required: true },
    landlordName: { type: String, required: true },
    pricePerWeek: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESSFUL', 'CANCELLED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
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

export default mongoose.models.Booking || mongoose.model<Booking>('Booking', BookingSchema);
