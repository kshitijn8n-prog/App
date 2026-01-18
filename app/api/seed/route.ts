
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Room from '../../../models/Room';
import { MOCK_ROOMS } from '../../../constants'; // We need to move constants or adjust import

// Copy of MOCK_ROOMS to avoid Import issues if constants.ts has react stuff (it shouldn't)
// Actually we can try importing. If fails, we'll inline. 
// constants.ts only imports Room type.

export async function POST() {
    try {
        await dbConnect();
        await Room.deleteMany({}); // Clear existing
        // We need to drop 'id' from mock rooms as mongo generates _id
        const roomsToInsert = MOCK_ROOMS.map(({ id, ...rest }) => rest);
        await Room.insertMany(roomsToInsert);
        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
    }
}
