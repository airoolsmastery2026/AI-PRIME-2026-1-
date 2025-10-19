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
            contents: `Perform a deep analysis of affiliate programs for the niche: "${niche}". Find at least 5-7 top programs.`,
            config: {
                systemInstruction: `You are an 'Affiliate Intelligence Agent'... Your output MUST be ONLY a valid JSON object that matches this structure: { "marketOverview": "...", "topPrograms": [ ... ], "strategicRecommendations": "..." }.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
        
        if (!jsonMatch) {
            throw new Error("No JSON object found in Gemini response for affiliate analysis.");
        }

        const jsonText = jsonMatch[0];
        const report = JSON.parse(jsonText);
        return res.status(200).json(report);

    } catch (error: any) {
        console.error("[API_ERROR] /api/analyze-affiliate-programs:", error);
        let errorMessage = "errors.marketAnalysis";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to analyze affiliate programs.', details: errorMessage });
    }
}