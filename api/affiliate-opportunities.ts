import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { Credentials } from '../src/types';

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
        const { topic, credentials, language } = req.body as { topic: string, credentials: Credentials, language?: 'en' | 'vi' };
        
        if (!topic || !credentials) {
            return res.status(400).json({ error: 'Missing topic or credentials.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const activePrograms = Object.entries(credentials)
            .filter(([_, accounts]) => Array.isArray(accounts) && accounts.length > 0 && accounts.some(acc => acc.username))
            .map(([platform, accounts]) => ({
                platform,
                username: accounts![0].username 
            }));

        if (activePrograms.length === 0) {
            return res.status(200).json({ opportunities: [] });
        }

        const programDetails = activePrograms.map(p => `- ${p.platform} (Example User ID: ${p.username})`).join('\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the content topic "${topic}" and identify 2-3 highly relevant products that could be promoted.`,
            config: {
                systemInstruction: `You are an expert affiliate marketer. Use your search capabilities to find relevant products for a given topic and generate structured affiliate link data.
                - For the given topic, suggest 2-3 specific, real products.
                - For each product, create a plausible-looking affiliate link using the provided platform details. For Amazon, use the format 'https://amzn.to/...'. For ClickBank, use a format like 'https://hop.clickbank.net/?affiliate=USER_ID...'. Replace 'USER_ID' with the provided example ID for that platform.
                - For each product, write a short, compelling call-to-action sentence.
                - You have access to the following affiliate programs:\n${programDetails}
                - Your output MUST be ONLY a valid JSON array of objects. Do not include any text, markdown formatting, or "json" specifiers before or after the JSON array.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) {
            console.error("No JSON array found in Gemini response for affiliate opportunities:", rawText);
            return res.status(200).json({ opportunities: [] });
        }
        
        const jsonText = jsonMatch[0];
        const opportunities = JSON.parse(jsonText);
        return res.status(200).json({ opportunities });

    } catch (error: any) {
        console.error("[API_ERROR] /api/affiliate-opportunities:", error);
        return res.status(500).json({ error: 'Failed to find affiliate opportunities.', details: "errors.generic" });
    }
}
