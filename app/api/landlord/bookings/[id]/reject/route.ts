import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: bookingId } = await params;
        const body = await request.json();
        const { reason } = body;

        const existing = await Booking.findById(bookingId);
        if (!existing) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        if (existing.status !== 'AWAITING_LANDLORD') {
            return NextResponse.json({ error: 'Booking cannot be rejected at this stage' }, { status: 400 });
        }

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
