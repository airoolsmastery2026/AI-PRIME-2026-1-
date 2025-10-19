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
        const { channelUrl, language } = req.body;
        if (!channelUrl) {
            return res.status(400).json({ error: 'Missing channelUrl parameter.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a deep, multi-faceted analysis of the YouTube channel at this URL: ${channelUrl}`,
            config: {
                systemInstruction: `You are 'Oracle', a world-class YouTube strategist... Your output MUST be ONLY a valid JSON object.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
        
        if (!jsonMatch) {
            throw new Error("No JSON object found in Gemini response for channel analysis.");
        }

        const jsonText = jsonMatch[0];
        const report = JSON.parse(jsonText);
        return res.status(200).json(report);

    } catch (error: any) {
        console.error("[API_ERROR] /api/analyze-channel:", error);
        let errorMessage = "errors.reconFailed";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to analyze channel.', details: errorMessage });
    }
}