import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Wishlist from '../../../models/Wishlist';
import Room from '../../../models/Room';

const TEST_USER_ID = 'demo-user-id';

export async function GET() {
    try {
        await dbConnect();
        // Ensure Room is registered for populate
        const _room = Room;
        const wishlist = await (Wishlist as any).find({ userId: TEST_USER_ID }).populate('roomId');
        return NextResponse.json(wishlist);
    } catch (error: any) {
        console.error('Wishlist GET Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { roomId } = await request.json();

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const existing = await (Wishlist as any).findOne({ userId: TEST_USER_ID, roomId });
        if (existing) {
            return NextResponse.json({ message: 'Already in wishlist' });
        }

        const newItem = await (Wishlist as any).create({
            userId: TEST_USER_ID,
            roomId,
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        console.error('Wishlist POST Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        await (Wishlist as any).deleteOne({ userId: TEST_USER_ID, roomId });

        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error: any) {
        console.error('Wishlist DELETE Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
