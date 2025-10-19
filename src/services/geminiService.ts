import { GoogleGenAI, Type } from "@google/genai";
import { ChannelAgent, MarketAnalysisResult, CompetitorIntel, SeoAnalysisResult, ViralShortScript, AgentBlueprint, AssimilatedAsset, ChannelAnalysisReport, PostPackage, DualIncomeNiche, Credentials, AffiliateAnalysisReport } from "../types";

// This file is now fully refactored to use secure, consolidated backend API endpoints.

// ===================================================================================
// NOTE: All functions now call the backend API for security and functionality.
// The actual Gemini API calls are handled by serverless functions in the /api/ directory.
// ===================================================================================


/**
 * Generates a video by calling the backend API.
 * @param prompt The user's prompt for the video.
 * @param aspectRatio The desired aspect ratio.
 * @param is8K Whether to generate in 8K.
 * @param language The target language.
 * @returns A URL for the generated video blob.
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
      const errorData = await response.json();
      throw new Error(errorData.details || "errors.videoGen");
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling /api/generate with action 'video':", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("errors.videoGen");
  }
};

/**
 * Enhanced video prompt generation is now handled by the backend within the /api/generate endpoint.
 * This function is deprecated on the client-side.
 */
export const generateEnhancedVideoPrompt = async (userInput: string, language?: 'en' | 'vi'): Promise<string> => {
    console.warn("generateEnhancedVideoPrompt is now handled by the backend. This function is deprecated on the client-side.");
    return userInput;
};


// This interface defines the structure for a single affiliate marketing opportunity.
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
        const response = await fetch('/api/utility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'affiliateOpportunities', topic, credentials, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error for affiliate opportunities:", errorData);
            return []; // Return empty on error to not break the UI flow
        }

        const data = await response.json();
        return data.opportunities || [];
    } catch (error) {
        console.error("Error calling /api/utility with action 'affiliateOpportunities':", error);
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
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'characterImages', prompt, style, pose, clothing, background }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || "errors.imageGen");
    }

    const data = await response.json();
    if (data.images && Array.isArray(data.images)) {
        return data.images.map((base64: string) => `data:image/jpeg;base64,${base64}`);
    }
    
    throw new Error("Invalid response from server");

  } catch (error) {
    console.error("Error calling /api/generate with action 'characterImages':", error);
    if (error instanceof Error) {
        if (error.message.includes('apiKeyInvalid') || error.message.includes('imageGen')) {
            throw error;
        }
    }
    throw new Error("errors.imageGen");
  }
};

/**
 * Generates an agent blueprint by calling the backend API.
 */
export const generateAgentBlueprint = async (
    niche: string, 
    language?: 'en' | 'vi',
    onProgress?: (step: string) => void // Note: onProgress is now illustrative, as backend steps are opaque.
): Promise<AgentBlueprint> => {
    try {
        onProgress?.('agents.blueprint.thinking.step1'); // Simulate progress
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'agentBlueprint', niche, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.channelGen");
        }
        
        onProgress?.('agents.blueprint.thinking.step3'); // Simulate near-completion
        return await response.json();

    } catch (error) {
        console.error("Error calling /api/generate with action 'agentBlueprint':", error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.channelGen");
    }
};

/**
 * Analyzes market trends by calling the backend API.
 */
export const analyzeMarketTrends = async (topic: string, language?: 'en' | 'vi'): Promise<MarketAnalysisResult> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'marketTrends', topic, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.marketAnalysis");
        }
        return await response.json();

    } catch (error) {
        console.error("Error calling /api/analyze with action 'marketTrends':", error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.marketAnalysis");
    }
};

/**
 * Performs competitor reconnaissance by calling the backend API.
 */
export const performCompetitorRecon = async (niche: string, language?: 'en' | 'vi'): Promise<CompetitorIntel> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'competitorRecon', niche, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.reconFailed");
        }
        return await response.json();

    } catch (error) {
        console.error("Error calling /api/analyze with action 'competitorRecon':", error);
        if (error instanceof Error) {
           if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.reconFailed");
    }
};

/**
 * Gets SEO opportunity analysis by calling the backend API.
 */
export const getSeoOpportunityAnalysis = async (niche: string, language?: 'en' | 'vi'): Promise<SeoAnalysisResult> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'seo', niche, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.seoAnalysisFailed");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/analyze with action 'seo':", error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.seoAnalysisFailed");
    }
};

/**
 * Finds emerging niches by calling the backend API.
 */
export const findEmergingNiches = async (existingTopics: string[], language?: 'en' | 'vi'): Promise<string[]> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'emergingNiches', existingTopics, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.seoAnalysisFailed");
        }
        const data = await response.json();
        return data.niches || [];
    } catch (error) {
        console.error("Error calling /api/analyze with action 'emergingNiches':", error);
         if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.seoAnalysisFailed");
    }
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
    try {
        const response = await fetch('/api/utility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'utilityTask', taskType, input, credentials, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.generic");
        }
        const data = await response.json();
        return data.result;

    } catch (error) {
        console.error(`Error calling /api/utility with action 'utilityTask' for '${taskType}':`, error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.generic");
    }
};

/**
 * Generates pillar content ideas by calling the backend API.
 */
export const generatePillarContentIdeas = async (topic: string, language?: 'en' | 'vi'): Promise<string[]> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'pillarContent', topic, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.generic");
        }
        const data = await response.json();
        return data.ideas || [];
    } catch (error) {
        console.error(`Error calling /api/generate with action 'pillarContent' for '${topic}':`, error);
        if (error instanceof Error) {
           if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.generic");
    }
};

/**
 * Generates viral shorts scripts by calling the backend API.
 */
export const generateViralShortsScripts = async (topic: string, language?: 'en' | 'vi'): Promise<ViralShortScript[]> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'viralShorts', topic, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.generic");
        }
        return await response.json();
    } catch (error) {
        console.error(`Error calling /api/generate with action 'viralShorts' for '${topic}':`, error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.generic");
    }
};

/**
 * Generates a platform-specific post package by calling the backend API.
 */
export const generatePostPackage = async (
    videoPrompt: string, 
    platform: string | undefined, 
    credentials: Credentials,
    language?: 'en' | 'vi'
): Promise<PostPackage> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'postPackage', videoPrompt, platform, credentials, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.generic");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/generate with action 'postPackage':", error);
         if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.generic");
    }
};

/**
 * Assimilates content from a URL by calling the backend API.
 */
export const assimilateContentFromUrl = async (url: string, language?: 'en' | 'vi'): Promise<AssimilatedAsset> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'assimilateContent', url, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.generic");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/generate with action 'assimilateContent':", error);
        if (error instanceof Error) {
            if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.generic");
    }
};

/**
 * Analyzes channel performance by calling the backend API.
 */
export const analyzeChannelPerformance = async (channelUrl: string, language?: 'en' | 'vi'): Promise<ChannelAnalysisReport> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'channel', channelUrl, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.reconFailed");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/analyze with action 'channel':", error);
        if (error instanceof Error) {
           if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.reconFailed");
    }
};

/**
 * Finds dual-income niches by calling the backend API.
 */
export const findDualIncomeNiches = async (language?: 'en' | 'vi'): Promise<DualIncomeNiche[]> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dualIncomeNiches', language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.marketAnalysis");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/analyze with action 'dualIncomeNiches':", error);
         if (error instanceof Error) {
           if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.marketAnalysis");
    }
};

/**
 * Analyzes affiliate programs by calling the backend API.
 */
export const analyzeAffiliatePrograms = async (niche: string, language?: 'en' | 'vi'): Promise<AffiliateAnalysisReport> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'affiliatePrograms', niche, language }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "errors.marketAnalysis");
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling /api/analyze with action 'affiliatePrograms':", error);
        if (error instanceof Error) {
           if (error.message.includes('apiKeyInvalid')) {
                 throw new Error("errors.apiKeyInvalid");
            }
        }
        throw new Error("errors.marketAnalysis");
    }
};