import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Helper to add language instructions to prompts
const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

// Centralized error message key resolver for API errors
const getApiErrorMessageKey = (error: any, defaultKey: string): string => {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('api key not valid')) {
        return "errors.apiKeyInvalid";
    }
    if (message.includes('resource_exhausted') || message.includes('quota')) {
        return "errors.quotaExceeded";
    }
    if (message.includes('safety') || message.includes('blocked')) {
        return "errors.promptRejected";
    }
    return defaultKey;
};


// --- HANDLER for Market Trend Analysis ---
async function handleMarketTrends(req: VercelRequest, res: VercelResponse) {
    try {
        const { topic, language } = req.body;
        if (!topic) return res.status(400).json({ error: 'Missing topic parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
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
                responseSchema: { type: Type.OBJECT, properties: { trendingTopics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, searchVolume: { type: Type.STRING, enum: ["High", "Medium", "Low"] }, competition: { type: Type.STRING, enum: ["High", "Medium", "Low"] }, opportunityScore: { type: Type.NUMBER } } } }, sentimentAnalysis: { type: Type.OBJECT, properties: { positive: { type: Type.NUMBER }, neutral: { type: Type.NUMBER }, negative: { type: Type.NUMBER } } }, strategicRecommendation: { type: Type.STRING } } },
            },
        });

        const jsonText = (response.text ?? '{}').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'marketTrends':", error);
        const details = getApiErrorMessageKey(error, "errors.marketAnalysis");
        return res.status(500).json({ error: 'Failed to analyze market.', details });
    }
}

// --- HANDLER for Competitor Reconnaissance ---
async function handleCompetitorRecon(req: VercelRequest, res: VercelResponse) {
    try {
        const { niche, language } = req.body;
        if (!niche) return res.status(400).json({ error: 'Missing niche parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform competitor recon for the YouTube niche: "${niche}".`,
            config: {
                systemInstruction: `You are a world-class counter-intelligence analyst for YouTube... ${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { competitors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { channelName: { type: Type.STRING }, channelId: { type: Type.STRING }, contentStrategy: { type: Type.STRING }, viralHitExample: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, reasonForSuccess: { type: Type.STRING } } } } } }, counterStrategy: { type: Type.STRING } } },
            },
        });
        const jsonText = (response.text ?? '{}').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'competitorRecon':", error);
        const details = getApiErrorMessageKey(error, "errors.reconFailed");
        return res.status(500).json({ error: 'Failed to perform recon.', details });
    }
}

// --- HANDLER for SEO Analysis ---
async function handleSeo(req: VercelRequest, res: VercelResponse) {
    try {
        const { niche, language } = req.body;
        if (!niche) return res.status(400).json({ error: 'Missing niche parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a deep SEO opportunity analysis for the YouTube niche: "${niche}".`,
            config: {
                systemInstruction: `You are a world-class YouTube SEO strategist... ${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { keywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, searchVolume: { type: Type.STRING, enum: ["High", "Medium", "Low"] }, competition: { type: Type.STRING, enum: ["High", "Medium", "Low"] }, viralityScore: { type: Type.NUMBER } } } }, strategicAdvice: { type: Type.STRING } } },
            },
        });
        const jsonText = (response.text ?? '{}').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'seo':", error);
        const details = getApiErrorMessageKey(error, "errors.seoAnalysisFailed");
        return res.status(500).json({ error: 'Failed to perform SEO analysis.', details });
    }
}

// --- HANDLER for Emerging Niches ---
async function handleEmergingNiches(req: VercelRequest, res: VercelResponse) {
    try {
        const { existingTopics, language } = req.body;
        if (!Array.isArray(existingTopics)) return res.status(400).json({ error: 'Missing existingTopics array.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on [${existingTopics.join(', ')}], find 5 emerging YouTube niches. Return ONLY a valid JSON array of strings. The response must be in ${language === 'vi' ? 'Vietnamese' : 'English'}.`,
            config: { tools: [{ googleSearch: {} }] },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) throw new Error("Parsed JSON is not an array of strings.");
        
        const niches = JSON.parse(jsonMatch[0]);
        if (Array.isArray(niches) && niches.every(item => typeof item === 'string')) {
            return res.status(200).json({ niches });
        } else {
            throw new Error("Parsed JSON is not an array of strings.");
        }
    } catch (error: any) {
        console.error("[API_ERROR] Action 'emergingNiches':", error);
        const details = getApiErrorMessageKey(error, "errors.seoAnalysisFailed");
        return res.status(500).json({ error: 'Failed to find niches.', details });
    }
}

// --- HANDLER for Dual Income Niches ---
async function handleDualIncomeNiches(req: VercelRequest, res: VercelResponse) {
    try {
        const { language } = req.body;
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find 5 emerging 'dual income' niches with high viral and affiliate marketing potential.",
            config: { systemInstruction: `You are 'Money Hunter'... Your output MUST be ONLY a valid JSON array of objects.${getLanguageInstruction(language)}`, tools: [{ googleSearch: {} }] },
        });
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) throw new Error("No JSON array found in Gemini response for dual income niches.");

        return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'dualIncomeNiches':", error);
        const details = getApiErrorMessageKey(error, "errors.marketAnalysis");
        return res.status(500).json({ error: 'Failed to find niches.', details });
    }
}

// --- HANDLER for Affiliate Program Analysis ---
async function handleAffiliatePrograms(req: VercelRequest, res: VercelResponse) {
    try {
        const { niche, language } = req.body;
        if (!niche) return res.status(400).json({ error: 'Missing niche parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze affiliate programs for the niche: "${niche}". Find 5-7 top programs.`,
            config: { systemInstruction: `You are an 'Affiliate Intelligence Agent'... Your output MUST be ONLY a valid JSON object.${getLanguageInstruction(language)}`, tools: [{ googleSearch: {} }] },
        });
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) throw new Error("No JSON object found in Gemini response for affiliate analysis.");

        return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'affiliatePrograms':", error);
        const details = getApiErrorMessageKey(error, "errors.marketAnalysis");
        return res.status(500).json({ error: 'Failed to analyze affiliate programs.', details });
    }
}

// --- MAIN HANDLER ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action } = req.body;

    switch (action) {
        case 'marketTrends':
            return handleMarketTrends(req, res);
        case 'competitorRecon':
            return handleCompetitorRecon(req, res);
        case 'seo':
            return handleSeo(req, res);
        case 'emergingNiches':
            return handleEmergingNiches(req, res);
        case 'dualIncomeNiches':
            return handleDualIncomeNiches(req, res);
        case 'affiliatePrograms':
            return handleAffiliatePrograms(req, res);
        default:
            return res.status(400).json({ error: 'Invalid action specified for /api/analyze' });
    }
}