import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/models/Enquiry';

export async function GET() {
    try {
        await dbConnect();
        // Admin sees all enquiries, sorted by pending first
        const enquiries = await Enquiry.find({}).sort({ status: 1, createdAt: -1 });
        return NextResponse.json(enquiries);
    } catch (error) {
        console.error('Error fetch all enquiries:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
