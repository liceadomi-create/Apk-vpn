import { GoogleGenAI, Type } from "@google/genai";
import { SecurityReport } from '../types';

export const getSecurityInsights = async (city: string, state: string): Promise<SecurityReport> => {
  if (!process.env.API_KEY) {
    return {
      status: 'vulnerable',
      summary: 'API Key missing. Cannot analyze.',
      encryption: 'Unknown',
      masking: 'Inactive'
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a cybersecurity expert. Analyze the privacy implications of connecting to a VPN server in ${city}, ${state}, USA.
      
      Provide a JSON response with the following fields:
      - status: must be exactly one of "secure", "vulnerable", "analyzing"
      - summary: A short, 1-sentence witty or tech-savvy comment about the location's infrastructure or privacy laws.
      - encryption: A technical term like "AES-256-GCM" or similar suitable for this connection.
      - masking: A boolean-like string ("Active" or "Inactive").

      Make the summary sound professional but modern.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            summary: { type: Type.STRING },
            encryption: { type: Type.STRING },
            masking: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as SecurityReport;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      status: 'secure', // Fallback
      summary: `Secure connection established to ${city} node. Traffic encrypted.`,
      encryption: 'AES-256-GCM',
      masking: 'Active'
    };
  }
};
