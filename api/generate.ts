import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { GoogleGenAI, Type } from "@google/genai";
import { Credentials, PostPackage } from '../src/types';

// Helper to add language instructions to prompts
const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return `\nYour entire response, including all text within any JSON output, must be in the ${langName} language.`;
};

// --- HANDLER for Video Generation ---
async function handleGenerateVideo(req: VercelRequest, res: VercelResponse) {
    try {
        const { prompt, aspectRatio, is8K, language } = req.body;
        if (!prompt || !aspectRatio) {
            return res.status(400).json({ error: 'Missing required parameters: prompt, aspectRatio' });
        }
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured on the server." });
        
        const ai = new GoogleGenAI({ apiKey });
        
        const enhancedPromptResponse = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: `User's simple idea: "${prompt}"`,
             config: {
                systemInstruction: `You are an expert prompt engineer for VEO... The final output must be ONLY the generated prompt text. ${language === 'vi' ? 'Respond in Vietnamese.' : 'Respond in English.'}`,
             },
        });
        const enhancedPrompt = (enhancedPromptResponse.text ?? prompt).trim();

        const finalPromptForVideo = is8K 
          ? `8K, Ultra HD, highest fidelity, photorealistic, cinematic. ${enhancedPrompt}` 
          : enhancedPrompt;

        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: finalPromptForVideo,
          config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
            resolution: is8K ? '1080p' : '720p',
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation completed, but no URL was returned.");

        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!videoResponse.ok) throw new Error(`Failed to fetch video from generated link. Status: ${videoResponse.status}`);

        const videoBlob = await videoResponse.blob();
        res.setHeader('Content-Type', videoBlob.type);
        const buffer = Buffer.from(await videoBlob.arrayBuffer());
        
        return res.status(200).send(buffer);
    } catch (error: any) {
        console.error("[API_ERROR] Action 'video':", error);
        let errorMessage = "errors.videoGen";
        if (error.message.includes('API key not valid')) errorMessage = "errors.apiKeyInvalid";
        else if (error.message.includes('RESOURCE_EXHAUSTED')) errorMessage = "errors.quotaExceeded";
        return res.status(500).json({ error: 'Video generation failed.', details: errorMessage });
    }
}

// --- HANDLER for Character Image Generation ---
async function handleGenerateCharacterImages(req: VercelRequest, res: VercelResponse) {
    try {
        const { prompt, style, pose, clothing, background } = req.body;
        if (!prompt || !style || !pose || !clothing || !background) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const fullPrompt = `Create a high-resolution, photorealistic 4K image of a character. Style: ${style}. Pose: ${pose}. Clothing: ${clothing}. Background: ${background}. Character details: ${prompt}. The image should be cinematic and highly detailed.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: { numberOfImages: 4, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });

        if (response.generatedImages?.length > 0) {
            const imagesBase64 = response.generatedImages.map(img => img.image?.imageBytes).filter((bytes): bytes is string => !!bytes);
            return res.status(200).json({ images: imagesBase64 });
        } else {
            throw new Error("No images were generated.");
        }
    } catch (error: any) {
        console.error("[API_ERROR] Action 'characterImages':", error);
        const errorMessage = error.message.includes('API key not valid') ? "errors.apiKeyInvalid" : "errors.imageGen";
        return res.status(500).json({ error: 'Image generation failed.', details: errorMessage });
    }
}

// --- HANDLER for Agent Blueprint Generation ---
async function handleGenerateAgentBlueprint(req: VercelRequest, res: VercelResponse) {
     try {
        const { niche, language } = req.body;
        if (!niche) return res.status(400).json({ error: 'Missing niche parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const langInstruction = getLanguageInstruction(language);

        const marketAnalysisResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `Market analysis for YouTube niche: "${niche}".`, config: { systemInstruction: `You are a market intelligence analyst... ${langInstruction}`, tools: [{ googleSearch: {} }] } });
        const marketIntel = (marketAnalysisResponse.text ?? '').trim();

        const competitorReconResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `Given market analysis for "${niche}", identify competitor archetypes.\n\nAnalysis:\n${marketIntel}`, config: { systemInstruction: `You are a competitive intelligence specialist... ${langInstruction}`, tools: [{ googleSearch: {} }] } });
        const competitorIntel = (competitorReconResponse.text ?? '').trim();

        const finalBlueprintResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Synthesize into a blueprint for a "${niche}" channel.\n\nMarket Intel:\n${marketIntel}\n\nCompetitor Intel:\n${competitorIntel}`,
            config: {
                systemInstruction: `You are an Agent Architect. Synthesize the provided intelligence into a complete business plan. Your output MUST be ONLY a valid JSON object matching the schema. ${langInstruction}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { marketAnalysis: { type: Type.OBJECT, properties: { estimatedRPM: { type: Type.STRING }, estimatedCPM: { type: Type.STRING }, marketSize: { type: Type.STRING }, growthPotential: { type: Type.STRING } } }, competitorIntel: { type: Type.OBJECT, properties: { archetypes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, strategy: { type: Type.STRING } } } }, keyWeakness: { type: Type.STRING } } }, riskAssessment: { type: Type.OBJECT, properties: { copyrightRisk: { type: Type.STRING }, demonetizationRisk: { type: Type.STRING }, platformPolicyRisk: { type: Type.STRING }, summary: { type: Type.STRING } } }, contentStrategy: { type: Type.OBJECT, properties: { pillarContentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }, viralShortsIdeas: { type: Type.ARRAY, items: { type: Type.STRING } } } }, monetizationStrategy: { type: Type.OBJECT, properties: { primaryMethod: { type: Type.STRING }, secondaryMethod: { type: Type.STRING }, affiliateSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { product: { type: Type.STRING }, reason: { type: Type.STRING } } } } } } } },
            },
        });

        const jsonText = (finalBlueprintResponse.text ?? '{}').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'agentBlueprint':", error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.channelGen";
        return res.status(500).json({ error: 'Failed to generate blueprint.', details: errorMessage });
    }
}

// --- HANDLER for Pillar Content Ideas ---
async function handlePillarContent(req: VercelRequest, res: VercelResponse) {
    try {
        const { topic, language } = req.body;
        if (!topic) return res.status(400).json({ error: 'Missing topic parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5 pillar content ideas for a YouTube channel on "${topic}".`,
            config: {
                systemInstruction: `You are a master content strategist. Return only a valid JSON array of strings.${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        });
        const jsonText = (response.text ?? '[]').trim();
        return res.status(200).json({ ideas: JSON.parse(jsonText) });
    } catch (error: any) {
        console.error(`[API_ERROR] Action 'pillarContent' for '${req.body.topic}':`, error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Failed to generate ideas.', details: errorMessage });
    }
}

// --- HANDLER for Viral Shorts Scripts ---
async function handleViralShorts(req: VercelRequest, res: VercelResponse) {
    try {
        const { topic, language } = req.body;
        if (!topic) return res.status(400).json({ error: 'Missing topic parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 viral short video scripts for "${topic}".`,
            config: {
                systemInstruction: `You are a creative director for viral short-form video.${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, hook: { type: Type.STRING }, script: { type: Type.STRING }, cta: { type: Type.STRING } } } },
            },
        });
        const jsonText = (response.text ?? '[]').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error(`[API_ERROR] Action 'viralShorts' for '${req.body.topic}':`, error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Failed to generate scripts.', details: errorMessage });
    }
}

// --- HANDLER for Post Package ---
async function handlePostPackage(req: VercelRequest, res: VercelResponse) {
    try {
        const { videoPrompt, platform, credentials, language } = req.body;
        if (!videoPrompt || !credentials) return res.status(400).json({ error: 'Missing parameters.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });
        const platformInstructions = { youtube: { instruction: `You are a YouTube SEO expert...`, tagsDescription: "A comma-separated string of 15-20 relevant SEO keywords." }, tiktok: { instruction: `You are a TikTok viral marketing expert...`, tagsDescription: "A single string of 5-7 relevant hashtags..." }, default: { instruction: `You are a social media SEO expert...`, tagsDescription: "A single string of 10-15 relevant tags..." } };
        const platformKey = platform?.toLowerCase() as keyof typeof platformInstructions | undefined;
        const instructions = (platformKey && platformInstructions[platformKey]) ? platformInstructions[platformKey] : platformInstructions.default;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a post package for platform: ${platform || 'generic'}.\n\nVideo Concept: "${videoPrompt}"`,
            config: {
                systemInstruction: `${instructions.instruction} ${getLanguageInstruction(language)}`,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, tags: { type: Type.STRING, description: instructions.tagsDescription } } },
            },
        });
        const jsonText = (response.text ?? '{}').trim();
        return res.status(200).json(JSON.parse(jsonText));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'postPackage':", error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Failed to generate post package.', details: errorMessage });
    }
}

// --- HANDLER for Assimilate Content ---
async function handleAssimilateContent(req: VercelRequest, res: VercelResponse) {
     try {
        const { url, language } = req.body;
        if (!url) return res.status(400).json({ error: 'Missing url parameter.' });
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API_KEY is not configured.", details: "errors.apiKeyMissing" });
        
        const ai = new GoogleGenAI({ apiKey });

        let systemInstruction = '';
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) systemInstruction = `You are a 'Content Assimilator' AI... Your output MUST be ONLY a valid JSON object: {"assetType": "video_script", ...}`;
        else if (url.includes('amazon.') || url.includes('clickbank.net') || url.includes('shopify.com')) systemInstruction = `You are a 'Content Assimilator' AI specializing in e-commerce... Your output MUST be ONLY a valid JSON object: {"assetType": "product_ad_script", ...}`;
        else systemInstruction = `You are a 'Content Assimilator' AI and counter-intelligence analyst... Your output MUST be ONLY a valid JSON object: {"assetType": "competitor_analysis", ...}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the content at the URL and generate a new, structured asset: ${url}`,
            config: { systemInstruction: `${systemInstruction}${getLanguageInstruction(language)}`, tools: [{ googleSearch: {} }] },
        });

        const rawText = (response.text ?? '').trim();
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) throw new Error("No JSON object found in Gemini response for assimilation.");

        return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (error: any) {
        console.error("[API_ERROR] Action 'assimilateContent':", error);
        const errorMessage = error.message.includes('API key') ? "errors.apiKeyInvalid" : "errors.generic";
        return res.status(500).json({ error: 'Failed to assimilate content.', details: errorMessage });
    }
}

// --- MAIN HANDLER ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action } = req.body;

    switch (action) {
        case 'video':
            return handleGenerateVideo(req, res);
        case 'characterImages':
            return handleGenerateCharacterImages(req, res);
        case 'agentBlueprint':
            return handleGenerateAgentBlueprint(req, res);
        case 'pillarContent':
            return handlePillarContent(req, res);
        case 'viralShorts':
            return handleViralShorts(req, res);
        case 'postPackage':
            return handlePostPackage(req, res);
        case 'assimilateContent':
            return handleAssimilateContent(req, res);
        default:
            return res.status(400).json({ error: 'Invalid action specified for /api/generate' });
    }
}
