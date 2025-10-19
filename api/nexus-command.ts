import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, language } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message parameter.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured on the server.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const langInstruction = language === 'vi' ? 'Respond in Vietnamese.' : 'Respond in English.';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: `You are AI PRIME's core command interface. Be concise, technical, and helpful. Respond in Markdown format. ${langInstruction}`,
            }
        });

        const textResponse = (response.text ?? '').trim();
        return res.status(200).json({ response: textResponse });

    } catch (error: any) {
        console.error("[API_ERROR] /api/nexus-command:", error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Command execution failed.', details: errorMessage });
    }
}