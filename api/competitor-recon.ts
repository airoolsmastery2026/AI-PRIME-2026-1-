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
        const { niche, language } = req.body;
        if (!niche) {
            return res.status(400).json({ error: 'Missing niche parameter.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a deep competitive reconnaissance for the YouTube niche: "${niche}".`,
            config: {
                systemInstruction: `You are a world-class counter-intelligence analyst for YouTube. Your mission is to identify top competitors, deconstruct their strategies, and formulate a superior counter-strategy.${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitors: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    channelName: { type: Type.STRING },
                                    channelId: { type: Type.STRING },
                                    contentStrategy: { type: Type.STRING },
                                    viralHitExample: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            reasonForSuccess: { type: Type.STRING },
                                        },
                                    },
                                },
                            },
                        },
                        counterStrategy: { type: Type.STRING },
                    },
                },
            },
        });

        const jsonText = (response.text ?? '{}').trim();
        const result = JSON.parse(jsonText);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("[API_ERROR] /api/competitor-recon:", error);
        let errorMessage = "errors.reconFailed";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to perform recon.', details: errorMessage });
    }
}