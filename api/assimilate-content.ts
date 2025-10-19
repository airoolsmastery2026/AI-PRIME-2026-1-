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
        const { url, language } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        let systemInstruction = '';
        const contents = `Analyze the content at the following URL and generate a new, structured asset based on it: ${url}`;

        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            systemInstruction = `You are a 'Content Assimilator' AI... Your output MUST be ONLY a valid JSON object matching this structure: {"assetType": "video_script", ...}`;
        } else if (url.includes('amazon.') || url.includes('clickbank.net') || url.includes('shopify.com')) {
            systemInstruction = `You are a 'Content Assimilator' AI specializing in e-commerce... Your output MUST be ONLY a valid JSON object matching this structure: {"assetType": "product_ad_script", ...}`;
        } else {
            systemInstruction = `You are a 'Content Assimilator' AI and counter-intelligence analyst... Your output MUST be ONLY a valid JSON object matching this structure: {"assetType": "competitor_analysis", ...}`;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction: `${systemInstruction}${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
        
        if (!jsonMatch) {
            throw new Error("No JSON object found in Gemini response for assimilation.");
        }

        const jsonText = jsonMatch[0];
        const asset = JSON.parse(jsonText);
        return res.status(200).json(asset);

    } catch (error: any) {
        console.error("[API_ERROR] /api/assimilate-content:", error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to assimilate content.', details: errorMessage });
    }
}