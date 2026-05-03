import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { roomId, roomTitle, tenantName, tenantEmail, pricePerWeek } = body;

        if (!roomId || !roomTitle || !tenantName || !tenantEmail || !pricePerWeek) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch room to get landlord info
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const newBooking = await Booking.create({
            roomId,
            roomTitle,
            tenantName,
            tenantEmail,
            landlordId: room.landlord?.id || 'unknown',
            landlordName: room.landlord?.name || 'Unknown Landlord',
            landlordEmail: room.landlord?.email || 'unknown@example.com',
            pricePerWeek,
            status: 'PENDING',
            landlordResponse: 'PENDING'
        });

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error('Booking failed:', error);
        return NextResponse.json({ error: 'Failed to create booking request' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const tenantEmail = searchParams.get('tenantEmail');

        if (!tenantEmail) {
            return NextResponse.json({ error: 'Tenant email required' }, { status: 400 });
        }

        const bookings = await Booking.find({ tenantEmail });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
