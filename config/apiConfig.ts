import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

/**
 * Returns a singleton instance of the GoogleGenAI client.
 * Assumes process.env.API_KEY is available in the execution environment.
 */
export const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            // This case should ideally not happen based on project setup assumptions.
            // Throw a clear error to aid in debugging if the key is missing.
            throw new Error("API_KEY environment variable not set. This is required for the Command Nexus feature.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};
