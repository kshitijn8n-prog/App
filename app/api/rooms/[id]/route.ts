
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Room from '../../../../models/Room';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const room = await Room.findByIdAndUpdate(id, body, { new: true });
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const room = await Room.findByIdAndDelete(id);
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        return NextResponse.json({ message: 'Room deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
}
