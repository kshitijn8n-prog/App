import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const bookingId = params.id;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                landlordResponse: 'APPROVED',
                status: 'LANDLORD_APPROVED',
                landlordResponseDate: new Date()
            },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Booking approved by landlord. Awaiting admin confirmation.',
            booking
        });
    } catch (error) {
        console.error('Failed to approve booking:', error);
        return NextResponse.json({ error: 'Failed to approve booking' }, { status: 500 });
    }
}
