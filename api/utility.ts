import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { Credentials } from '../src/types';

// Helper to add language instructions to prompts
const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

// --- HANDLER for Test Connection (GET) ---
async function handleTestConnection(req: VercelRequest, res: VercelResponse) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ success: false, error: "API_KEY is not configured." });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hi',
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        
        if (response.text) {
            return res.status(200).json({ success: true });
        } else {
            throw new Error("No response text from Gemini.");
        }
    } catch (error) {
        console.error("[API_ERROR] Action 'testConnection':", error);
        return res.status(500).json({ success: false, error: 'Connection test failed.' });
    }
}

// --- HANDLER for Utility Tasks (POST) ---
async function handleUtilityTask(req: VercelRequest, res: VercelResponse) {
    try {
        const { taskType, input, credentials, language } = req.body;
        if (!taskType || !input || !credentials) return res.status(400).json({ error: 'Missing parameters.' });
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
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
                systemInstruction = `You are a world-class YouTube SEO expert...${langInstruction}`;
                contents = `Generate metadata for a YouTube video about "${input}"...`;
                break;
            case 'thumbnail':
                systemInstruction = `You are a viral marketing and graphic design expert...${langInstruction}`;
                contents = `Provide actionable suggestions to improve a YouTube thumbnail for a video about "${input}"...`;
                break;
            case 'shorts':
                systemInstruction = `You are a creative director specializing in viral short-form video content. For the given topic, generate 3 unique, high-potential viral video ideas. For each idea, provide a catchy title, a strong hook (the first 3 seconds), a brief script, and a call to action (CTA). Format the output as a clean, readable text. Do not use JSON or Markdown code blocks.${langInstruction}`;
                contents = `Generate 3 unique, high-potential viral video ideas for the topic "${input}".`;
                break;
            default:
                throw new Error("Invalid utility task type.");
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: { systemInstruction },
        });

        return res.status(200).json({ result: (response.text ?? '').trim() });
    } catch (error: any) {
        console.error(`[API_ERROR] Action 'utilityTask':`, error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Failed to execute utility task.', details: errorMessage });
    }
}

// --- HANDLER for Affiliate Opportunities (POST) ---
async function handleAffiliateOpportunities(req: VercelRequest, res: VercelResponse) {
    try {
        const { topic, credentials, language } = req.body as { topic: string, credentials: Credentials, language?: 'en' | 'vi' };
        if (!topic || !credentials) return res.status(400).json({ error: 'Missing topic or credentials.' });
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const activePrograms = Object.entries(credentials)
            .filter(([_, accounts]) => Array.isArray(accounts) && accounts.length > 0 && accounts.some(acc => acc.username))
            .map(([platform, accounts]) => ({ platform, username: accounts![0].username }));

        if (activePrograms.length === 0) return res.status(200).json({ opportunities: [] });
        const programDetails = activePrograms.map(p => `- ${p.platform} (User ID: ${p.username})`).join('\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `For topic "${topic}", identify 2-3 relevant affiliate products.`,
            config: {
                systemInstruction: `You are an expert affiliate marketer... You have access to these programs:\n${programDetails}\n- Your output MUST be ONLY a valid JSON array of objects.${getLanguageInstruction(language)}`,
                tools: [{ googleSearch: {} }],
            },
        });
        
        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\[[\s\S]*\])/);
        if (!jsonMatch) return res.status(200).json({ opportunities: [] });
        
        return res.status(200).json({ opportunities: JSON.parse(jsonMatch[0]) });
    } catch (error: any) {
        console.error("[API_ERROR] Action 'affiliateOpportunities':", error);
        return res.status(500).json({ error: 'Failed to find affiliate opportunities.', details: "errors.generic" });
    }
}

// --- HANDLER for Nexus Command (POST) ---
async function handleNexusCommand(req: VercelRequest, res: VercelResponse) {
    try {
        const { message, language } = req.body;
        if (!message) return res.status(400).json({ error: 'Missing message parameter.' });
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const langInstruction = language === 'vi' ? 'Respond in Vietnamese.' : 'Respond in English.';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: { systemInstruction: `You are AI PRIME's core command interface. Be concise, technical, and helpful. Respond in Markdown format. ${langInstruction}` }
        });

        return res.status(200).json({ response: (response.text ?? '').trim() });
    } catch (error: any) {
        console.error("[API_ERROR] Action 'nexusCommand':", error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Command execution failed.', details: errorMessage });
    }
}

// --- HANDLER for Affiliate Link Generation (POST) ---
async function handleGenerateAffiliateLink(req: VercelRequest, res: VercelResponse) {
    try {
        const { nicheOrProduct, selectedPlatforms, credentials, language } = req.body as { nicheOrProduct: string, selectedPlatforms: string[], credentials: Credentials, language?: 'en' | 'vi' };
        if (!nicheOrProduct || !selectedPlatforms || !credentials) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const platformDetails = selectedPlatforms.map(platform => {
            const account = credentials[platform as keyof Credentials]?.[0];
            return account ? `- ${platform} (Affiliate ID: ${account.username})` : null;
        }).filter(Boolean).join('\n');

        if (!platformDetails) {
             return res.status(400).json({ error: 'No valid affiliate platforms selected or configured.' });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate affiliate links for the following niche/product: "${nicheOrProduct}"`,
            config: {
                systemInstruction: `You are an expert affiliate link generator. Your task is to create plausible-looking affiliate links for a given product/niche on specified platforms using their affiliate IDs.
                - Use your search capabilities to find a real, relevant product page for the given niche/product to base the link on.
                - Use the following platform details:\n${platformDetails}
                - For each platform, create a single, correctly formatted affiliate link. For Amazon, use 'amzn.to'. For ClickBank, use 'hop.clickbank.net'. For others, create a realistic link structure.
                - Your output MUST be ONLY a valid JSON array of objects with the structure: \`[{ "platform": "platform_name", "link": "generated_affiliate_link" }]\`. Do not add any other text.
                ${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            platform: { type: Type.STRING },
                            link: { type: Type.STRING },
                        },
                    },
                },
                tools: [{ googleSearch: {} }]
            },
        });
        
        const jsonText = (response.text ?? '[]').trim();
        return res.status(200).json({ links: JSON.parse(jsonText) });
    } catch (error: any) {
        console.error("[API_ERROR] Action 'generateAffiliateLink':", error);
        return res.status(500).json({ error: 'Failed to generate affiliate links.', details: "errors.generic" });
    }
}

// --- MAIN HANDLER ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        const { action } = req.query;
        if (action === 'testConnection') {
            return handleTestConnection(req, res);
        }
    }
    
    if (req.method === 'POST') {
        const { action } = req.body;
        switch (action) {
            case 'utilityTask':
                return handleUtilityTask(req, res);
            case 'affiliateOpportunities':
                return handleAffiliateOpportunities(req, res);
            case 'nexusCommand':
                return handleNexusCommand(req, res);
            case 'generateAffiliateLink':
                return handleGenerateAffiliateLink(req, res);
        }
    }
    
    return res.status(400).json({ error: 'Invalid action or method for /api/utility' });
}