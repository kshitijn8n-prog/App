import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { rentalStatus } = await request.json();
        const roomId = params.id;

        if (!rentalStatus || !['AVAILABLE', 'RENTED'].includes(rentalStatus)) {
            return NextResponse.json({ error: 'Invalid rental status' }, { status: 400 });
        }

        const room = await Room.findByIdAndUpdate(
            roomId,
            { rentalStatus },
            { new: true }
        );

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: `Room marked as ${rentalStatus}`,
            room
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to update rental status:', errorMessage);
        return NextResponse.json({ 
            error: 'Failed to update rental status',
            details: errorMessage 
        }, { status: 500 });
    }
}
