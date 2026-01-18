import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
    userId: string;
    userName: string;
    roomId: mongoose.Types.ObjectId;
    roomTitle: string;
    question: string;
    answer?: string;
    status: 'PENDING' | 'REPLIED';
    createdAt: Date;
    repliedAt?: Date;
}

const EnquirySchema = new Schema<IEnquiry>({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomTitle: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String },
    status: { type: String, enum: ['PENDING', 'REPLIED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    repliedAt: { type: Date }
});

export default mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
