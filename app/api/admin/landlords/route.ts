import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Room from '../../../../models/Room';

export async function GET() {
    try {
        await dbConnect();

        const landlords = await User.find({ type: 'landlord' });

        const landlordsWithStats = await Promise.all(
            landlords.map(async (landlord) => {
                const allRooms = await Room.find({ 'landlord.email': landlord.email });

                return {
                    id: landlord._id.toString(),
                    name: landlord.name,
                    email: landlord.email,
                    phone: landlord.phone || null,
                    licenseNumber: landlord.licenseNumber || null,
                    isVerified: landlord.isVerified,
                    joinedDate: landlord.createdAt,
                    totalListings: allRooms.length,
                    pendingListings: allRooms.filter((r: any) => r.status === 'PENDING').length,
                    publishedListings: allRooms.filter((r: any) => r.status === 'PUBLISHED').length,
                    availableRooms: allRooms.filter((r: any) => r.rentalStatus === 'AVAILABLE').length,
                    rentedRooms: allRooms.filter((r: any) => r.rentalStatus === 'RENTED').length,
                };
            })
        );

        return NextResponse.json(landlordsWithStats);
    } catch (error) {
        console.error('Failed to fetch landlords:', error);
        return NextResponse.json({ error: 'Failed to fetch landlords' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, email, password, licenseNumber, phone } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
        }

        const landlord = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            type: 'landlord',
            isVerified: true,
            licenseNumber: licenseNumber?.trim() || undefined,
            phone: phone?.trim() || undefined,
        });

        return NextResponse.json({
            message: 'Landlord created successfully',
            landlord: {
                id: landlord._id.toString(),
                name: landlord.name,
                email: landlord.email,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create landlord:', error);
        return NextResponse.json({ error: 'Failed to create landlord' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Landlord ID required' }, { status: 400 });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Landlord not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Landlord removed successfully' });
    } catch (error) {
        console.error('Failed to delete landlord:', error);
        return NextResponse.json({ error: 'Failed to delete landlord' }, { status: 500 });
    }
}
