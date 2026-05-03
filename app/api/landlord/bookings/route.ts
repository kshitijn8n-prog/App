import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const landlordId = searchParams.get('landlordId');

        if (!landlordId) {
            return NextResponse.json({ error: 'Landlord ID required' }, { status: 400 });
        }

        // Get all bookings for this landlord's properties
        const bookings = await Booking.find({ landlordId });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Failed to fetch landlord bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
