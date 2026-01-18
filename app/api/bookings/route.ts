import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { roomId, roomTitle, tenantName, tenantEmail, landlordName, pricePerWeek } = body;

        if (!roomId || !roomTitle || !tenantName || !tenantEmail || !landlordName || !pricePerWeek) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newBooking = await Booking.create({
            roomId,
            roomTitle,
            tenantName,
            tenantEmail,
            landlordName,
            pricePerWeek,
            status: 'PENDING'
        });

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error('Booking failed:', error);
        return NextResponse.json({ error: 'Failed to create booking request' }, { status: 500 });
    }
}
