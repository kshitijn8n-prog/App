
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Room from '../../../models/Room';
import User from '../../../models/User';
import { MOCK_ROOMS } from '../../../constants'; // We need to move constants or adjust import

// Copy of MOCK_ROOMS to avoid Import issues if constants.ts has react stuff (it shouldn't)
// Actually we can try importing. If fails, we'll inline. 
// constants.ts only imports Room type.

import Enquiry from '../../../models/Enquiry';
import Wishlist from '../../../models/Wishlist';

export async function POST() {
    try {
        await dbConnect();

        // Clear existing
        await Room.deleteMany({});
        await User.deleteMany({});
        await (Enquiry as any).deleteMany({});
        await (Wishlist as any).deleteMany({});

        // Seed Rooms
        // We need to drop 'id' from mock rooms as mongo generates _id
        const roomsToInsert = MOCK_ROOMS.map(({ id, ...rest }) => ({ ...rest, status: 'PUBLISHED' }));
        const rooms = await Room.insertMany(roomsToInsert as any);

        // Seed Users
        await User.insertMany([
            {
                name: 'Demo Student',
                email: 'student@test.com',
                password: 'password123',
                type: 'student',
                isVerified: true,
                university: 'University of Manchester'
            },
            {
                name: 'Demo Landlord',
                email: 'landlord@test.com',
                password: 'password123',
                type: 'landlord',
                isVerified: true,
                licenseNumber: 'LN-998877'
            },
            {
                name: 'System Admin',
                email: 'admin@test.com',
                password: 'password123',
                type: 'admin',
                isVerified: true
            }
        ] as any);

        return NextResponse.json({
            message: 'Database seeded successfully',
            roomsCreated: rooms.length,
            usersCreated: 2
        });
    } catch (error) {
        console.error('Seed failed', error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
