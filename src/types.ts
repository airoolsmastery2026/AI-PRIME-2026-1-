// types.ts

export interface User {
    name: string;
    email?: string;
    avatar?: string;
    provider: 'google' | 'github' | 'x' | 'system';
    token?: string; // Placeholder for OAuth token
}

export interface SocialAccount {
    id: string;
    username: string;
    password: string;
    category: string;
    country: string;
    linkedAffiliatePlatforms?: string[];
}

export const socialPlatforms = ['youtube', 'tiktok', 'instagram', 'x', 'facebook', 'pinterest', 'linkedin'] as const;
export type SocialPlatform = typeof socialPlatforms[number];

export const generalAffiliatePlatforms = ['clickbank', 'amazon', 'cj', 'shareasale', 'rakuten'] as const;
export type GeneralAffiliatePlatform = typeof generalAffiliatePlatforms[number];

export const cryptoAffiliatePlatforms = ['binance', 'coinbase', 'ledger'] as const;
export type CryptoAffiliatePlatform = typeof cryptoAffiliatePlatforms[number];

export type ConnectablePlatform = SocialPlatform | GeneralAffiliatePlatform | CryptoAffiliatePlatform;

export type Credentials = {
    [key in ConnectablePlatform]?: SocialAccount[];
};

export const CREDENTIALS_STORAGE_KEY = 'apiCredentials';

export const initialCredentials: Credentials = {};
// Initialize with empty arrays
[...socialPlatforms, ...generalAffiliatePlatforms, ...cryptoAffiliatePlatforms].forEach(p => {
    (initialCredentials as any)[p] = [];
});

export interface ChannelAgent {
    id: string;
    agentId: string;
    platform: string;
    name: string;
    topic: string;
    country: string;
    agentStatus: 'Active' | 'Idle' | 'Error';
    activeDirective: string;
    intelReport?: CompetitorIntel;
}

export interface AgentBlueprint {
    marketAnalysis: {
        estimatedRPM: string;
        estimatedCPM: string;
        marketSize: string;
        growthPotential: string;
    };
    competitorIntel: {
        archetypes: {
            name: string;
            strategy: string;
        }[];
        keyWeakness: string;
    };
    riskAssessment: {
        copyrightRisk: string;
        demonetizationRisk: string;
        platformPolicyRisk: string;
        summary: string;
    };
    contentStrategy: {
        pillarContentIdeas: string[];
        viralShortsIdeas: string[];
    };
    monetizationStrategy: {
        primaryMethod: string;
        secondaryMethod: string;
        affiliateSuggestions: {
            product: string;
            reason: string;
        }[];
    };
}

export interface TrendingTopic {
    topic: string;
    searchVolume: 'High' | 'Medium' | 'Low';
    competition: 'High' | 'Medium' | 'Low';
    opportunityScore: number;
}

export interface MarketAnalysisResult {
    trendingTopics: TrendingTopic[];
    sentimentAnalysis: {
        positive: number;
        neutral: number;
        negative: number;
    };
    strategicRecommendation: string;
}

export interface CompetitorIntel {
    competitors: {
        channelName: string;
        channelId: string;
        contentStrategy: string;
        viralHitExample: {
            title: string;
            reasonForSuccess: string;
        };
    }[];
    counterStrategy: string;
}

export interface SeoKeyword {
    keyword: string;
    searchVolume: 'High' | 'Medium' | 'Low';
    competition: 'High' | 'Medium' | 'Low';
    viralityScore: number;
}

export interface SeoAnalysisResult {
    keywords: SeoKeyword[];
    strategicAdvice: string;
}

export interface ViralShortScript {
    title: string;
    hook: string;
    script: string;
    cta: string;
}

export interface AssimilatedAsset {
    assetType: 'video_script' | 'product_ad_script' | 'competitor_analysis';
    sourceUrl: string;
    title: string;
    generatedScript?: {
        hook: string;
        script: string;
        cta: string;
    };
    analysisSummary?: string;
    counterStrategy?: string;
}

export interface StrategicDirective {
    directive: string;
    rationale: string;
}

export interface ChannelAnalysisReport {
    channelName: string;
    performanceDna?: {
        subscriberCount: string;
        averageViews: string;
        estimatedEngagementRate: 'High' | 'Medium' | 'Low';
        overallSummary: string;
    };
    contentFormula?: {
        commonVideoFormats: string[];
        coreTopicClusters: string[];
        titlePatterns: string[];
        thumbnailPsychology: string;
    };
    viralVectors?: {
        videoTitle: string;
        reasonForSuccess: string;
    }[];
    strategicDirectives?: StrategicDirective[];
}

export enum JobStatus {
    Queued = 'Queued',
    Generating = 'Generating',
    Published = 'Published',
    Failed = 'Failed',
    Scheduled = 'Scheduled'
}

export interface ProductionJob {
    id: string;
    prompt: string; // User's simple input
    enhancedPrompt?: string; // AI-generated detailed prompt
    aspectRatio: '16:9' | '9:16' | '1:1';
    is8K: boolean;
    language?: 'en' | 'vi';
    status: JobStatus;
    progress: number;
    videoUrl?: string;
    postPackage?: PostPackage;
    scheduledDay?: string;
    platform?: string;
    statusMessageKey?: string;
}

export enum FlowStepType {
    Input = 'Input',
    Processing = 'Processing',
    Output = 'Output',
    Service = 'Service'
}

export interface FlowStep {
    id: number;
    nameKey: string;
    type: FlowStepType;
    service: string;
}

export interface AutomationFlow {
    id: string;
    nameKey: string;
    descriptionKey: string;
    status: 'Active' | 'Inactive';
    steps: FlowStep[];
}

export interface AISuggestion {
    id: string;
    type: 'seo' | 'market' | 'content';
    titleKey: string;
    descriptionKey: string;
}

export interface TopicPipeline {
    topic: string;
    channels: {
        platform: string;
        username: string;
    }[];
}

export interface PostPackage {
    title: string;
    description: string;
    tags: string; // For YouTube: comma-separated keywords. For others: space-separated hashtags starting with #.
}

export interface DualIncomeNiche {
    niche: string;
    reasoning: string;
    affiliatePotential: number; // Score 1-10
    viralPotential: number; // Score 1-10
    suggestedProducts: string[];
}

export interface SystemBackup {
    credentials: Credentials;
    agents: ChannelAgent[];
    videoJobs: ProductionJob[];
    directives: StrategicDirective[];
    automationFlows: AutomationFlow[];
}

export interface AffiliateProgramAnalysis {
    programName: string;
    niche: string;
    commissionRate: string;
    cookieDuration: string;
    brandReputation: number;
    conversionPotential: number;
    supportLevel: number;
    overallScore: number;
    joinUrl: string;
    summary: string;
}

export interface AffiliateAnalysisReport {
    marketOverview: string;
    topPrograms: AffiliateProgramAnalysis[];
    strategicRecommendations: string;
}