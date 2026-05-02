import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Enquiry from '../../../models/Enquiry';

const TEST_USER_ID = 'demo-user-id';
const TEST_USER_NAME = 'Demo Student';

export async function GET() {
    try {
        await dbConnect();
        const enquiries = await (Enquiry as any).find({ userId: TEST_USER_ID }).sort({ createdAt: -1 });
        return NextResponse.json(enquiries);
    } catch (error: any) {
        console.error('Enquiries GET Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { roomId, roomTitle, question } = await request.json();

        if (!roomId || !question) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const newEnquiry = await (Enquiry as any).create({
            userId: TEST_USER_ID,
            userName: TEST_USER_NAME,
            roomId,
            roomTitle,
            question
        });

        return NextResponse.json(newEnquiry, { status: 201 });
    } catch (error: any) {
        console.error('Enquiries POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
