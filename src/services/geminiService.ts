import { GoogleGenAI, Type } from "@google/genai";
// FIX: Add ChannelAnalysisReport to imports.
import { ChannelAgent, MarketAnalysisResult, CompetitorIntel, SeoAnalysisResult, ViralShortScript, AgentBlueprint, AssimilatedAsset, ChannelAnalysisReport, PostPackage, DualIncomeNiche, Credentials, AffiliateAnalysisReport } from "../types";
import { ApiErrorKeys } from "../utils/errors";

// ===================================================================================
// NOTE: All functions now call the backend API for security and functionality.
// The actual Gemini API calls are handled by serverless functions in the /api/ directory.
// ===================================================================================

/**
 * A centralized API call handler to reduce boilerplate and standardize error handling.
 * @param endpoint The backend API endpoint (e.g., '/api/generate').
 * @param body The request body object.
 * @param defaultErrorKey The translation key for a fallback error.
 * @returns The parsed JSON response.
 */
async function apiCall<T>(endpoint: string, body: object, defaultErrorKey: string): Promise<T> {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                // Use the specific error key from the backend if available
                throw new Error(errorData.details || defaultErrorKey);
            } catch {
                // If parsing JSON fails, handle based on status code
                if (response.status === 503) throw new Error(ApiErrorKeys.ServerUnavailable);
                throw new Error(defaultErrorKey);
            }
        }
        return await response.json() as T;
    } catch (error) {
        // Log the original error
        console.error(`API call to ${endpoint} with action '${(body as any).action}' failed:`, error);
        
        // If it's already an error with one of our keys, re-throw it
        if (error instanceof Error && Object.values(ApiErrorKeys).some(k => k === error.message)) {
            throw error;
        }
        // Otherwise, wrap it in a generic network error
        throw new Error(ApiErrorKeys.NetworkError);
    }
}


/**
 * Generates a video by calling the backend API.
 * This function has custom handling because it expects a blob response.
 */
export const generateVideo = async (
  prompt: string,
  aspectRatio: '9:16' | '16:9' | '1:1',
  is8K: boolean,
  language?: 'en' | 'vi'
): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'video', prompt, aspectRatio, is8K, language }),
    });

    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.details || ApiErrorKeys.VideoGenFailed);
        } catch {
             if (response.status === 503) throw new Error(ApiErrorKeys.ServerUnavailable);
             throw new Error(ApiErrorKeys.VideoGenFailed);
        }
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling /api/generate with action 'video':", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ApiErrorKeys.VideoGenFailed);
  }
};

/**
 * Enhanced video prompt generation is now handled by the backend.
 * This function is deprecated on the client-side.
 */
export const generateEnhancedVideoPrompt = async (userInput: string, language?: 'en' | 'vi'): Promise<string> => {
    console.warn("generateEnhancedVideoPrompt is now handled by the backend. This function is deprecated on the client-side.");
    return userInput;
};

interface AffiliateOpportunity {
    productName: string;
    affiliateLink: string;
    callToAction: string;
}

export type UtilityTask = 'summarizer' | 'metadata' | 'thumbnail' | 'shorts';

/**
 * Finds relevant affiliate products for a given topic by calling the backend.
 */
export const findAffiliateOpportunities = async (
    topic: string,
    credentials: Credentials,
    language?: 'en' | 'vi'
): Promise<AffiliateOpportunity[]> => {
    try {
        const data = await apiCall<{ opportunities?: AffiliateOpportunity[] }>(
            '/api/utility',
            { action: 'affiliateOpportunities', topic, credentials, language },
            ApiErrorKeys.Generic
        );
        return data.opportunities || [];
    } catch (error) {
        // This function is used in non-critical UI flows, so we prevent it from throwing
        // and breaking the parent component by returning an empty array on any failure.
        console.error("findAffiliateOpportunities failed:", error);
        return [];
    }
};

/**
 * Generates character images by calling the backend API.
 */
export const generateCharacterImages = async (
  prompt: string,
  style: string,
  pose: string,
  clothing: string,
  background: string
): Promise<string[]> => {
    const data = await apiCall<{ images?: string[] }>(
        '/api/generate',
        { action: 'characterImages', prompt, style, pose, clothing, background },
        ApiErrorKeys.ImageGenFailed
    );
    if (data.images && Array.isArray(data.images)) {
        return data.images.map((base64: string) => `data:image/jpeg;base64,${base64}`);
    }
    throw new Error(ApiErrorKeys.InvalidResponse);
};

/**
 * Generates an agent blueprint by calling the backend API.
 */
export const generateAgentBlueprint = async (
    niche: string, 
    language?: 'en' | 'vi',
    onProgress?: (step: string) => void
): Promise<AgentBlueprint> => {
    onProgress?.('agents.blueprint.thinking.step1');
    const blueprint = await apiCall<AgentBlueprint>(
        '/api/generate',
        { action: 'agentBlueprint', niche, language },
        ApiErrorKeys.ChannelGenFailed
    );
    onProgress?.('agents.blueprint.thinking.step3');
    return blueprint;
};

/**
 * Analyzes market trends by calling the backend API.
 */
export const analyzeMarketTrends = (topic: string, language?: 'en' | 'vi'): Promise<MarketAnalysisResult> => {
    return apiCall<MarketAnalysisResult>(
        '/api/analyze',
        { action: 'marketTrends', topic, language },
        ApiErrorKeys.MarketAnalysisFailed
    );
};

/**
 * Performs competitor reconnaissance by calling the backend API.
 */
export const performCompetitorRecon = (niche: string, language?: 'en' | 'vi'): Promise<CompetitorIntel> => {
    return apiCall<CompetitorIntel>(
        '/api/analyze',
        { action: 'competitorRecon', niche, language },
        ApiErrorKeys.ReconFailed
    );
};

/**
 * Gets SEO opportunity analysis by calling the backend API.
 */
export const getSeoOpportunityAnalysis = (niche: string, language?: 'en' | 'vi'): Promise<SeoAnalysisResult> => {
    return apiCall<SeoAnalysisResult>(
        '/api/analyze',
        { action: 'seo', niche, language },
        ApiErrorKeys.SeoAnalysisFailed
    );
};

/**
 * Finds emerging niches by calling the backend API.
 */
export const findEmergingNiches = async (existingTopics: string[], language?: 'en' | 'vi'): Promise<string[]> => {
    const data = await apiCall<{ niches?: string[] }>(
        '/api/analyze',
        { action: 'emergingNiches', existingTopics, language },
        ApiErrorKeys.SeoAnalysisFailed
    );
    return data.niches || [];
};

/**
 * Performs a lightweight check to validate the Gemini API key via the backend.
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/utility?action=testConnection', { method: 'GET' });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
};

/**
 * Executes a utility task by calling the backend API.
 */
export const executeUtilityTask = async (taskType: UtilityTask, input: string, credentials: Credentials, language?: 'en' | 'vi'): Promise<string> => {
    const data = await apiCall<{ result: string }>(
        '/api/utility',
        { action: 'utilityTask', taskType, input, credentials, language },
        ApiErrorKeys.Generic
    );
    return data.result;
};

/**
 * Generates pillar content ideas by calling the backend API.
 */
export const generatePillarContentIdeas = async (topic: string, language?: 'en' | 'vi'): Promise<string[]> => {
    const data = await apiCall<{ ideas?: string[] }>(
        '/api/generate',
        { action: 'pillarContent', topic, language },
        ApiErrorKeys.Generic
    );
    return data.ideas || [];
};

/**
 * Generates viral shorts scripts by calling the backend API.
 */
export const generateViralShortsScripts = (topic: string, language?: 'en' | 'vi'): Promise<ViralShortScript[]> => {
    return apiCall<ViralShortScript[]>(
        '/api/generate',
        { action: 'viralShorts', topic, language },
        ApiErrorKeys.Generic
    );
};

/**
 * Generates a platform-specific post package by calling the backend API.
 */
export const generatePostPackage = (
    videoPrompt: string, 
    platform: string | undefined, 
    credentials: Credentials,
    language?: 'en' | 'vi'
): Promise<PostPackage> => {
    return apiCall<PostPackage>(
        '/api/generate',
        { action: 'postPackage', videoPrompt, platform, credentials, language },
        ApiErrorKeys.Generic
    );
};

/**
 * Assimilates content from a URL by calling the backend API.
 */
export const assimilateContentFromUrl = (url: string, language?: 'en' | 'vi'): Promise<AssimilatedAsset> => {
    return apiCall<AssimilatedAsset>(
        '/api/generate',
        { action: 'assimilateContent', url, language },
        ApiErrorKeys.Generic
    );
};

// FIX: Add missing analyzeChannelPerformance function.
/**
 * Analyzes channel performance by calling the backend API.
 */
export const analyzeChannelPerformance = (channelUrl: string, language?: 'en' | 'vi'): Promise<ChannelAnalysisReport> => {
    return apiCall<ChannelAnalysisReport>(
        '/api/analyze',
        { action: 'channel', channelUrl, language },
        ApiErrorKeys.ReconFailed
    );
};

/**
 * Finds dual-income niches by calling the backend API.
 */
export const findDualIncomeNiches = (language?: 'en' | 'vi'): Promise<DualIncomeNiche[]> => {
    return apiCall<DualIncomeNiche[]>(
        '/api/analyze',
        { action: 'dualIncomeNiches', language },
        ApiErrorKeys.MarketAnalysisFailed
    );
};

/**
 * Analyzes affiliate programs by calling the backend API.
 */
export const analyzeAffiliatePrograms = (niche: string, language?: 'en' | 'vi'): Promise<AffiliateAnalysisReport> => {
    return apiCall<AffiliateAnalysisReport>(
        '/api/analyze',
        { action: 'affiliatePrograms', niche, language },
        ApiErrorKeys.MarketAnalysisFailed
    );
};
