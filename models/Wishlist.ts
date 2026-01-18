import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
    userId: string;
    roomId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
    userId: {
        type: String,
        required: true,
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent duplicate wishlist items for the same user and room
WishlistSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
