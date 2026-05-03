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
    landlordId: { type: String, required: true },
    landlordName: { type: String, required: true },
    landlordEmail: { type: String, required: true },
    pricePerWeek: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'AWAITING_LANDLORD', 'LANDLORD_APPROVED', 'ADMIN_CONFIRMED', 'SUCCESSFUL', 'LANDLORD_REJECTED', 'CANCELLED'],
        default: 'PENDING'
    },
    landlordResponse: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    landlordRejectReason: String,
    landlordResponseDate: Date,
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
