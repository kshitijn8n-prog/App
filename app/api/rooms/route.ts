
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Room from '../../../models/Room';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const maxPrice = searchParams.get('maxPrice');
        const includePending = searchParams.get('includePending') === 'true';

        let query: any = {};
        if (!includePending) {
            query.status = 'PUBLISHED';
        }

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }
        if (maxPrice) {
            query.pricePerWeek = { $lte: Number(maxPrice) };
        }

        const rooms = await Room.find(query);
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const room = await Room.create({
            ...body,
            status: 'PENDING'
        });
        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}
