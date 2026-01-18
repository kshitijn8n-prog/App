
import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.0-flash-exp';

export async function POST(request: Request) {
    try {
        const { reviews } = await request.json();

        if (!reviews || reviews.length === 0) {
            return NextResponse.json({ summary: "No reviews to summarize." });
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Summarize these tenant reviews for a landlord/property into 2-3 sentences highlighting pros and cons: ${JSON.stringify(reviews)}`
        });

        return NextResponse.json({ summary: response.text || "Summary unavailable." });

    } catch (error) {
        console.error("Gemini summary failed:", error);
        return NextResponse.json({ summary: "Could not generate summary." }); // Graceful fallback
    }
}
