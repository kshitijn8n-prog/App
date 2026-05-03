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
        const body = await request.json();
        const { reason } = body;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                landlordResponse: 'REJECTED',
                status: 'LANDLORD_REJECTED',
                landlordRejectReason: reason || 'Application rejected',
                landlordResponseDate: new Date()
            },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Booking rejected by landlord. Student will be notified.',
            booking
        });
    } catch (error) {
        console.error('Failed to reject booking:', error);
        return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 });
    }
}
