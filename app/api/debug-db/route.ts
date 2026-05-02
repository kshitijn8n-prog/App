import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const uri = process.env.MONGODB_URI;
        const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'MISSING';

        console.log("Debug API: URI Length", uri?.length);

        // Simple internal connect test
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri!);
        }

        const state = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        return NextResponse.json({
            status: 'ok',
            mongooseState: states[state],
            uriLength: uri?.length,
            maskedUri: maskedUri,
            nodeVersion: process.version,
            envKeys: Object.keys(process.env).filter(k => k.includes('MONGO'))
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            message: err.message,
            stack: err.stack,
            envFound: !!process.env.MONGODB_URI
        }, { status: 500 });
    }
}
