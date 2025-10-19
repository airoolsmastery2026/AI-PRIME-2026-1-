import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

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
        const { topic, language } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Missing topic parameter.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5 foundational, high-value "pillar content" video ideas for a YouTube channel focused on the topic: "${topic}".`,
            config: {
                systemInstruction: `You are a master content strategist. Return only a valid JSON array of strings, for example: ["Idea 1", "Idea 2"].${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        });

        const jsonText = (response.text ?? '[]').trim();
        const ideas = JSON.parse(jsonText);
        return res.status(200).json({ ideas });

    } catch (error: any) {
        console.error(`[API_ERROR] /api/pillar-content-ideas for '${req.body.topic}':`, error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to generate ideas.', details: errorMessage });
    }
}