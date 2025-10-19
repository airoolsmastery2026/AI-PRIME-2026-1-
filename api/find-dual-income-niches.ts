import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { language } = req.body;
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find 5 emerging 'dual income' niches. These are topics with high viral potential for short-form video and strong affiliate marketing potential.",
            config: {
                systemInstruction: `You are 'Money Hunter', an AI strategist... Your output MUST be ONLY a valid JSON array of objects.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) {
            throw new Error("No JSON array found in Gemini response for dual income niches.");
        }

        const jsonText = jsonMatch[0];
        const niches = JSON.parse(jsonText);
        return res.status(200).json(niches);
        
    } catch (error: any) {
        console.error("[API_ERROR] /api/find-dual-income-niches:", error);
        let errorMessage = "errors.marketAnalysis";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to find niches.', details: errorMessage });
    }
}