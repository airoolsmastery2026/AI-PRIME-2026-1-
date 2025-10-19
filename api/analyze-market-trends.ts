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
            contents: `Analyze the YouTube market for the topic: "${topic}".`,
            config: {
                systemInstruction: `You are a YouTube market intelligence analyst. Your task is to provide a detailed, data-driven analysis of a given niche.
                - Identify 3-5 related trending topics.
                - For each topic, estimate search volume and competition level (High, Medium, or Low).
                - Calculate an "Opportunity Score" from 1-10 for each topic, where 10 is a golden opportunity.
                - Provide a general audience sentiment analysis (percentage positive, neutral, negative).
                - Give a concise, actionable strategic recommendation for a content creator entering this niche.${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trendingTopics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    topic: { type: Type.STRING },
                                    searchVolume: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                    competition: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                    opportunityScore: { type: Type.NUMBER },
                                },
                            },
                        },
                        sentimentAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                positive: { type: Type.NUMBER },
                                neutral: { type: Type.NUMBER },
                                negative: { type: Type.NUMBER },
                            },
                        },
                        strategicRecommendation: { type: Type.STRING },
                    },
                },
            },
        });

        const jsonText = (response.text ?? '{}').trim();
        const result = JSON.parse(jsonText);
        return res.status(200).json(result);

    } catch (error: any) {
        console.error("[API_ERROR] /api/analyze-market-trends:", error);
        let errorMessage = "errors.marketAnalysis";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to analyze market.', details: errorMessage });
    }
}