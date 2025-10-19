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
            contents: `Provide a deep SEO opportunity analysis for the YouTube niche: "${niche}".`,
            config: {
                systemInstruction: `You are a world-class YouTube SEO strategist. Your goal is to identify "keyword gems" and formulate a winning strategy.${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    keyword: { type: Type.STRING },
                                    searchVolume: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                    competition: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                    viralityScore: { type: Type.NUMBER },
                                },
                            },
                        },
                        strategicAdvice: { type: Type.STRING },
                    },
                },
            },
        });

        const jsonText = (response.text ?? '{}').trim();
        const result = JSON.parse(jsonText);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("[API_ERROR] /api/seo-analysis:", error);
        let errorMessage = "errors.seoAnalysisFailed";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to perform SEO analysis.', details: errorMessage });
    }
}