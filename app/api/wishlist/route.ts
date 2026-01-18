import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Room from '@/models/Room'; // Ensure Room model is registered

const TEST_USER_ID = 'demo-user-id';

export async function GET() {
    try {
        await dbConnect();
        // Ensure Room is registered
        const _ = Room;

        const wishlist = await Wishlist.find({ userId: TEST_USER_ID }).populate('roomId');
        return NextResponse.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { roomId } = await request.json();

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        // Check if already exists
        const existing = await Wishlist.findOne({ userId: TEST_USER_ID, roomId });
        if (existing) {
            return NextResponse.json({ message: 'Already in wishlist' }, { status: 200 });
        }

        const newItem = await Wishlist.create({
            userId: TEST_USER_ID,
            roomId,
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
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

        await Wishlist.deleteOne({ userId: TEST_USER_ID, roomId });

        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
