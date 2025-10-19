import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { existingTopics, language } = req.body;
        if (!Array.isArray(existingTopics)) {
            return res.status(400).json({ error: 'Missing existingTopics array.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const langName = language === 'vi' ? 'Vietnamese' : 'English';
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following established market topics [${existingTopics.join(', ')}], use your search capabilities to find 5 emerging, high-potential, or underserved YouTube niches. Return ONLY a valid JSON array of strings with the niche names. Do not include any other text or formatting. The response must be in ${langName}.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) {
            throw new Error("Parsed JSON is not an array of strings.");
        }
        
        const jsonText = jsonMatch[0];
        const niches = JSON.parse(jsonText);

        if (Array.isArray(niches) && niches.every(item => typeof item === 'string')) {
            return res.status(200).json({ niches });
        } else {
            throw new Error("Parsed JSON is not an array of strings.");
        }

    } catch (error: any) {
        console.error("[API_ERROR] /api/find-emerging-niches:", error);
        let errorMessage = "errors.seoAnalysisFailed";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to find niches.', details: errorMessage });
    }
}