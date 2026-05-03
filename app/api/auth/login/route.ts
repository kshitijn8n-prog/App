import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        const user = await (User as any).findOne({ email: cleanEmail, password: cleanPassword }).lean();
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        return NextResponse.json({
            name: user.name,
            email: user.email,
            type: user.type,
            isVerified: user.isVerified,
            university: user.university,
            licenseNumber: user.licenseNumber
        });
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
