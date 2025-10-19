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

        // The multi-step process is now consolidated on the backend for efficiency and security.
        const marketAnalysisResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a deep market and trend analysis for the YouTube niche: "${niche}". Identify the primary target audience, 3-5 key sub-trends, and the overall market sentiment.`,
            config: {
                systemInstruction: `You are a market intelligence analyst. Provide a concise but comprehensive summary of the market landscape for the given niche. Your output should be a well-structured text report. ${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        const marketIntel = (marketAnalysisResponse.text ?? '').trim();

        const competitorReconResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Given the following market analysis for the "${niche}" niche, identify the top 3 competitor archetypes, their core strategies, and one key weakness for each.\n\nMarket Analysis:\n${marketIntel}`,
            config: {
                systemInstruction: `You are a competitive intelligence specialist. Analyze the provided market data to identify and deconstruct key competitor archetypes. Return a concise text summary. ${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        const competitorIntel = (competitorReconResponse.text ?? '').trim();

        const finalBlueprintResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Synthesize the following intelligence into a complete strategic blueprint for a new automated YouTube channel in the "${niche}" niche.\n\nMarket Intelligence:\n${marketIntel}\n\nCompetitor Intelligence:\n${competitorIntel}`,
            config: {
                 systemInstruction: `You are an elite, multi-disciplinary AI business strategist known as the "Agent Architect". Your task is to synthesize the provided intelligence into a complete, actionable business plan in a single JSON object. Your output MUST be ONLY a valid JSON object matching the provided schema. Do not include any text before or after the JSON object. ${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        marketAnalysis: { type: Type.OBJECT, properties: { estimatedRPM: { type: Type.STRING }, estimatedCPM: { type: Type.STRING }, marketSize: { type: Type.STRING }, growthPotential: { type: Type.STRING } } },
                        competitorIntel: { type: Type.OBJECT, properties: { archetypes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, strategy: { type: Type.STRING } } } }, keyWeakness: { type: Type.STRING } } },
                        riskAssessment: { type: Type.OBJECT, properties: { copyrightRisk: { type: Type.STRING }, demonetizationRisk: { type: Type.STRING }, platformPolicyRisk: { type: Type.STRING }, summary: { type: Type.STRING } } },
                        contentStrategy: { type: Type.OBJECT, properties: { pillarContentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }, viralShortsIdeas: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                        monetizationStrategy: { type: Type.OBJECT, properties: { primaryMethod: { type: Type.STRING }, secondaryMethod: { type: Type.STRING }, affiliateSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { product: { type: Type.STRING }, reason: { type: Type.STRING } } } } } },
                    },
                },
            },
        });

        const jsonText = (finalBlueprintResponse.text ?? '{}').trim();
        const blueprint = JSON.parse(jsonText);
        return res.status(200).json(blueprint);

    } catch (error: any) {
        console.error("[API_ERROR] /api/generate-agent-blueprint:", error);
        let errorMessage = "errors.channelGen";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Failed to generate blueprint.', details: errorMessage });
    }
}