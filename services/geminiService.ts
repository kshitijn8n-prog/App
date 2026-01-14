import { GoogleGenAI, Type } from "@google/genai";
import { SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 3 Flash for fast extraction of search intent
const MODEL_NAME = 'gemini-3-flash-preview';

export const parseSearchQuery = async (query: string): Promise<SearchFilters> => {
  if (!query || query.trim().length === 0) {
    return {};
  }

  try {
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
    if (!text) return {};
    
    return JSON.parse(text) as SearchFilters;

  } catch (error) {
    console.error("Gemini search parsing failed:", error);
    // Fallback: return basic object, effectively ignoring smart filters if API fails
    return { keywords: [query] }; 
  }
};

export const generateReviewSummary = async (reviews: string[]): Promise<string> => {
  if (reviews.length === 0) return "No reviews yet.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Summarize these tenant reviews for a landlord/property into 2-3 sentences highlighting pros and cons: ${JSON.stringify(reviews)}`
    });
    return response.text || "Summary unavailable.";
  } catch (e) {
    return "Could not generate summary.";
  }
};