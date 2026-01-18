
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { SearchFilters } from "../../../types";

// Initialize Gemini on server side
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.0-flash-exp'; // Updated to latest available or keep 1.5

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query || query.trim().length === 0) {
            return NextResponse.json({});
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Extract search filters from this student accommodation query: "${query}". 
      Context: The user is an international student looking for housing in the UK.
      Rules:
      - Convert approximate prices to a specific number (e.g. "under 200" -> 200).
      - Identify the UK city if mentioned (London, Manchester, Birmingham, etc.).
      - Extract keywords for amenities (e.g., "gym", "ensuite", "quiet", "studio").`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        city: { type: Type.STRING, description: "The UK city mentioned, or null if none." },
                        maxPrice: { type: Type.NUMBER, description: "Maximum price per week in GBP found in query." },
                        keywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of amenity keywords or room types."
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return NextResponse.json({});

        const filters = JSON.parse(text) as SearchFilters;
        return NextResponse.json(filters);

    } catch (error) {
        console.error("Gemini search parsing failed:", error);
        // Fallback
        return NextResponse.json({ keywords: [] });
    }
}
