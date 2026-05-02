import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import Room from '../../../../../../models/Room';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const room = await (Room as any).findByIdAndUpdate(
            id,
            { status: 'PUBLISHED' },
            { new: true }
        );

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to publish room' }, { status: 500 });
    }
}
