import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Room from '../../../../models/Room';

export async function GET() {
    try {
        await dbConnect();

        // Get all landlords
        const landlords = await User.find({ type: 'landlord' });

        // For each landlord, get their listing statistics
        const landlordsWithStats = await Promise.all(
            landlords.map(async (landlord) => {
                const landlordId = landlord._id.toString();
                
                // Since we don't have landlordId in Room model, we'll count all rooms and filter by name
                // In a real app, you'd have a landlordId field in the Room model
                const allRooms = await Room.find({ 'landlord.name': landlord.name });
                
                const totalListings = allRooms.length;
                const pendingListings = allRooms.filter((r: any) => r.status === 'PENDING').length;
                const publishedListings = allRooms.filter((r: any) => r.status === 'PUBLISHED').length;
                const availableRooms = allRooms.filter((r: any) => r.rentalStatus === 'AVAILABLE').length;
                const rentedRooms = allRooms.filter((r: any) => r.rentalStatus === 'RENTED').length;

                return {
                    id: landlord._id.toString(),
                    name: landlord.name,
                    email: landlord.email,
                    phone: landlord.phone || 'N/A',
                    address: landlord.address || 'N/A',
                    licenseNumber: landlord.licenseNumber || 'N/A',
                    isVerified: landlord.isVerified,
                    joinedDate: landlord.createdAt,
                    totalListings,
                    pendingListings,
                    publishedListings,
                    availableRooms,
                    rentedRooms
                };
            })
        );

        return NextResponse.json(landlordsWithStats);
    } catch (error) {
        console.error('Failed to fetch landlords:', error);
        return NextResponse.json({ error: 'Failed to fetch landlords' }, { status: 500 });
    }
}
