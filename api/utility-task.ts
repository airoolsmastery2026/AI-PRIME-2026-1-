import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { Credentials } from '../types';

const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

const findAffiliateOpportunities = async (ai: GoogleGenAI, topic: string, credentials: Credentials, language?: 'en' | 'vi'): Promise<any[]> => {
     const activePrograms = Object.entries(credentials)
        .filter(([_, accounts]) => Array.isArray(accounts) && accounts.length > 0 && accounts.some(acc => acc.username))
        .map(([platform, accounts]) => ({ platform, username: accounts![0].username }));

    if (activePrograms.length === 0) return [];

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the content topic "${topic}" and find 2-3 relevant affiliate products.`,
            config: {
                systemInstruction: `You are an expert affiliate marketer... Your output MUST be ONLY a valid JSON array of objects.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("Error finding affiliate opportunities in utility task:", error);
        return [];
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { taskType, input, credentials, language } = req.body;
        if (!taskType || !input || !credentials) {
            return res.status(400).json({ error: 'Missing parameters.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        let systemInstruction = '';
        let contents = '';
        const langInstruction = getLanguageInstruction(language);

        switch (taskType) {
            case 'summarizer':
                systemInstruction = `You are an expert content summarizer...${langInstruction}`;
                contents = `Please summarize the following text:\n\n---\n${input}\n---`;
                break;
            case 'metadata':
                const opportunities = await findAffiliateOpportunities(ai, input, credentials, language);
                let affiliateInstruction = '';
                if (opportunities.length > 0) {
                    const opportunityText = opportunities.map(op => `- Product: "${op.productName}"\n  - Link: ${op.affiliateLink}\n  - CTA: "${op.callToAction}"`).join('\n');
                    affiliateInstruction = ` You must naturally incorporate the following affiliate marketing links...\n\nAffiliate Opportunities:\n${opportunityText}`;
                }
                systemInstruction = `You are a world-class YouTube SEO expert...${affiliateInstruction}${langInstruction}`;
                contents = `Generate metadata for a YouTube video about "${input}"...`;
                break;
            case 'thumbnail':
                systemInstruction = `You are a viral marketing and graphic design expert...${langInstruction}`;
                contents = `Provide actionable suggestions to improve a YouTube thumbnail for a video about "${input}"...`;
                break;
            case 'shorts':
                systemInstruction = `You are a creative director specializing in viral short-form video...${langInstruction}`;
                contents = `Generate 3 unique, high-potential viral video ideas for the topic "${input}"...`;
                break;
            default:
                throw new Error("Invalid utility task type.");
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: { systemInstruction },
        });

        return res.status(200).json({ result: (response.text ?? '').trim() });

    } catch (error: any) {
        console.error(`[API_ERROR] /api/utility-task:`, error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to execute utility task.', details: errorMessage });
    }
}