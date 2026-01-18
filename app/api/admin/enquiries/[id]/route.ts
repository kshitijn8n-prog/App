import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/models/Enquiry';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { answer } = await request.json();
        const { id } = await params;

        const enquiry = await Enquiry.findByIdAndUpdate(
            id,
            {
                answer,
                status: 'REPLIED',
                repliedAt: new Date()
            },
            { new: true }
        );

        return NextResponse.json(enquiry);
    } catch (error) {
        console.error('Error replying to enquiry:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
