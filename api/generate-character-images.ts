import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, style, pose, clothing, background } = req.body;
        
        if (!prompt || !style || !pose || !clothing || !background) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured on the server.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const fullPrompt = `Create a high-resolution, photorealistic 4K image of a character. 
        Style: ${style}.
        Pose: ${pose}.
        Clothing: ${clothing}.
        Background: ${background}.
        Character details: ${prompt}.
        The image should be cinematic and highly detailed.`;

        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: fullPrompt,
          config: {
            numberOfImages: 4,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
          },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const imagesBase64 = response.generatedImages.map(img => img.image?.imageBytes).filter((bytes): bytes is string => !!bytes);
            return res.status(200).json({ images: imagesBase64 });
        } else {
            throw new Error("No images were generated.");
        }

    } catch (error: any) {
        console.error("[API_ERROR] /api/generate-character-images:", error);
        let errorMessage = "errors.imageGen";
        if (error.message.includes('API key not valid')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Image generation failed.', details: errorMessage });
    }
}