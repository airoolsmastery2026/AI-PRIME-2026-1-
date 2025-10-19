import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { GoogleGenAI } from "@google/genai";

// Hàm xử lý request từ frontend
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, aspectRatio, is8K, language } = req.body;

        if (!prompt || !aspectRatio) {
            return res.status(400).json({ error: 'Missing required parameters: prompt, aspectRatio' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            // Gửi lỗi rõ ràng nếu API_KEY chưa được cấu hình trên server
            return res.status(500).json({ error: "API_KEY is not configured on the server." });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        // === BƯỚC 1: TỰ ĐỘNG NÂNG CAO PROMPT (Logic từ generateEnhancedVideoPrompt) ===
        const isUrl = /(http|https|ftp|ftps):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/.test(prompt);
        let systemInstruction = `You are an expert prompt engineer for VEO... The final output must be ONLY the generated prompt text.`;
        let contents = `User's simple idea: "${prompt}"`;
        const config: any = {
            systemInstruction: `${systemInstruction} ${language === 'vi' ? 'Respond in Vietnamese.' : 'Respond in English.'}`,
        };
        if (isUrl) {
            systemInstruction = `You are an expert prompt engineer for VEO... analyze the content at the provided URL... The final output must be ONLY the generated prompt text.`;
            contents = `Analyze this product URL and create a video prompt: ${prompt}`;
            config.systemInstruction = `${systemInstruction} ${language === 'vi' ? 'Respond in Vietnamese.' : 'Respond in English.'}`;
            config.tools = [{ googleSearch: {} }];
        }
        const enhancedPromptResponse = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: contents,
             config: config,
        });
        const enhancedPrompt = (enhancedPromptResponse.text ?? prompt).trim();
        
        // === BƯỚC 2: TẠO VIDEO (Logic từ generateVideo) ===
        const finalPromptForVideo = is8K 
          ? `8K, Ultra HD, highest fidelity, photorealistic, cinematic. ${enhancedPrompt}` 
          : enhancedPrompt;

        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: finalPromptForVideo,
          config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
            resolution: is8K ? '1080p' : '720p', // Note: VEO doesn't have 8K, 1080p is the max available.
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no URL was returned.");
        }

        // Quan trọng: Fetch video từ URL được cung cấp (cần có key)
        const videoRedirectUrl = `${downloadLink}&key=${apiKey}`;
        const videoResponse = await fetch(videoRedirectUrl);

        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video from generated link. Status: ${videoResponse.status}`);
        }

        // Lấy video blob và trả về cho client
        const videoBlob = await videoResponse.blob();
        res.setHeader('Content-Type', videoBlob.type);
        const buffer = Buffer.from(await videoBlob.arrayBuffer());
        
        return res.status(200).send(buffer);

    } catch (error: any) {
        console.error("[API_ERROR] /api/generate-video:", error);
        let errorMessage = "errors.videoGen"; // Default error
        if (error.message.includes('API key not valid')) {
            errorMessage = "errors.apiKeyInvalid";
        } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = "errors.quotaExceeded";
        }
        
        return res.status(500).json({ error: 'Video generation failed.', details: errorMessage });
    }
}