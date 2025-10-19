import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: "API_KEY is not configured." });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hi',
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        if (response.text) {
            return res.status(200).json({ success: true });
        } else {
            throw new Error("No response text from Gemini.");
        }
    } catch (error) {
        console.error("[API_ERROR] /api/test-connection:", error);
        return res.status(500).json({ success: false, error: 'Connection test failed.' });
    }
}