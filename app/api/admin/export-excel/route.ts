import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        await dbConnect();
        const rooms = await (Room as any).find({}).lean();

        // Transform data for excel
        const data = rooms.map((room: any) => ({
            ID: room._id.toString(),
            Title: room.title,
            City: room.city,
            PricePerWeek: room.pricePerWeek,
            Type: room.type,
            Description: room.description,
            AvailableFrom: room.availableFrom,
            LandlordName: room.landlord?.name || 'N/A',
            LandlordVerified: room.landlord?.verified ? 'Yes' : 'No',
            Rating: room.rating,
            ReviewsCount: room.reviews?.length || 0,
            Amenities: room.amenities?.join(', ') || '',
            UniversityProximity: room.universityProximity?.join(', ') || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rooms');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=rooms.xlsx'
            }
        });

    } catch (error) {
        console.error('Export failed:', error);
        return NextResponse.json({ error: 'Failed to export excel' }, { status: 500 });
    }
}
