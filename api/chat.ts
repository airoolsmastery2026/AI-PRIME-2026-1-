import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage } from '../src/types';

const getLanguageInstruction = (language?: 'en' | 'vi'): string => {
    if (!language) return '';
    const langName = language === 'vi' ? 'Vietnamese' : 'English';
    return ` Your response must be in ${langName}.`;
};

// Maps our frontend ChatMessage to the format the Gemini API expects
const mapToGoogleContent = (messages: ChatMessage[]): Content[] => {
    return messages.map(message => ({
        role: message.role,
        parts: message.parts.map(part => {
            if (part.text) {
                return { text: part.text };
            }
            if (part.image) {
                return { inlineData: part.image.inlineData };
            }
            return { text: '' }; // Should not happen
        })
    }));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { history, prompt, imageBase64, mimeType, mode, language } = req.body;

        if (!prompt && !imageBase64) {
            return res.status(400).json({ error: 'Missing prompt or image.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API_KEY is not configured on the server.", details: "errors.apiKeyMissing" });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        let modelName: string;
        switch (mode) {
            case 'fast':
                modelName = 'gemini-flash-lite-latest';
                break;
            case 'complex':
                modelName = 'gemini-2.5-pro';
                break;
            case 'default':
            default:
                modelName = 'gemini-2.5-flash';
        }
        
        const systemInstruction = `You are AI PRIME's core AI assistant. Be concise, helpful, and knowledgeable about the application's features (Agents, Video Factory, Analytics, etc.). If asked to perform a task outside your capabilities (like browsing a live website), politely explain your limitations. Respond in Markdown format.${getLanguageInstruction(language)}`;

        // Construct the new message parts
        const newUserParts: ChatMessage['parts'] = [];
        if (imageBase64 && mimeType) {
            newUserParts.push({
                image: {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType
                    }
                }
            });
        }
        if (prompt) {
            newUserParts.push({ text: prompt });
        }

        // Combine history with the new message
        const fullHistory: ChatMessage[] = [
            ...(history || []),
            { role: 'user', parts: newUserParts }
        ];

        const contents = mapToGoogleContent(fullHistory);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const textResponse = (response.text ?? '').trim();
        return res.status(200).json({ response: textResponse });

    } catch (error: any) {
        console.error("[API_ERROR] /api/chat:", error);
        let errorMessage = "errors.generic";
        if (error.message.includes('API key')) {
            errorMessage = "errors.apiKeyInvalid";
        }
        return res.status(500).json({ error: 'Chat request failed.', details: errorMessage });
    }
}