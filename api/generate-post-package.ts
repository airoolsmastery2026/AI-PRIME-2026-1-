import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { Credentials } from '../src/types';

const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

const findAffiliateOpportunities = async (ai: GoogleGenAI, topic: string, language?: 'en' | 'vi'): Promise<any[]> => {
    // This is a simplified version for backend use.
    // In a real app, this could be a shared utility.
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `For the topic "${topic}", find 2-3 affiliate products.`,
            config: {
                systemInstruction: `You are an affiliate marketer. Return a JSON array of objects with "productName", "affiliateLink", and "callToAction".${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
        return [];
    }
};

const platformInstructions = {
    youtube: { instruction: `You are a YouTube SEO expert...`, tagsDescription: "A comma-separated string of 15-20 relevant SEO keywords." },
    tiktok: { instruction: `You are a TikTok viral marketing expert...`, tagsDescription: "A single string of 5-7 relevant hashtags..." },
    // Add other platforms as needed
    default: { instruction: `You are a social media SEO expert...`, tagsDescription: "A single string of 10-15 relevant tags..." }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { videoPrompt, platform, credentials, language } = req.body;
        if (!videoPrompt || !credentials) {
            return res.status(400).json({ error: 'Missing parameters.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const platformKey = platform?.toLowerCase() as keyof typeof platformInstructions | undefined;
        const instructions = (platformKey && platformInstructions[platformKey]) ? platformInstructions[platformKey] : platformInstructions.default;

        const opportunities = await findAffiliateOpportunities(ai, videoPrompt, language);
        let affiliateInstruction = '';
        if (opportunities.length > 0) {
            const opportunityText = opportunities.map(op => `- Product: "${op.productName}"\n  - Link: ${op.affiliateLink}\n  - CTA: "${op.callToAction}"`).join('\n');
            affiliateInstruction = `\n\nIMPORTANT: You must naturally incorporate these affiliate links...\n\n${opportunityText}`;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a post package for platform: ${platform || 'generic'}.\n\nVideo Concept: "${videoPrompt}"`,
            config: {
                systemInstruction: `${instructions.instruction}${affiliateInstruction}${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tags: { type: Type.STRING, description: instructions.tagsDescription },
                    },
                },
            },
        });

        const jsonText = (response.text ?? '{}').trim();
        const postPackage = JSON.parse(jsonText);
        return res.status(200).json(postPackage);

    } catch (error: any) {
        console.error("[API_ERROR] /api/generate-post-package:", error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to generate post package.', details: errorMessage });
    }
}
