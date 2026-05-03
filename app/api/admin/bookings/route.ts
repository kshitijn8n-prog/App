import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Booking from '../../../../models/Booking';

export async function GET() {
    try {
        await dbConnect();
        const bookings = await (Booking as any).find({}).sort({ createdAt: -1 });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect();
        const { id, action } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing ID or action' }, { status: 400 });
        }

        let updateData = {};

        // Admin sends booking to landlord for review
        if (action === 'SEND_TO_LANDLORD') {
            updateData = { status: 'AWAITING_LANDLORD' };
        }
        // Admin confirms approved booking (landlord already approved)
        else if (action === 'CONFIRM') {
            updateData = {
                status: 'ADMIN_CONFIRMED',
                landlordResponse: 'APPROVED'
            };
        }
        // Admin cancels rejected booking
        else if (action === 'CANCEL') {
            updateData = { status: 'CANCELLED' };
        }
        // Mark as successful (final approval)
        else if (action === 'SUCCESSFUL') {
            updateData = { status: 'SUCCESSFUL' };
        }

        const updatedBooking = await (Booking as any).findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: `Booking ${action.toLowerCase()} successfully`,
            booking: updatedBooking
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}
