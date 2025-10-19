
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { getSeoOpportunityAnalysis, findEmergingNiches } from '../services/geminiService';
import { SeoAnalysisResult, SeoKeyword } from '../types';

const HudWidget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-300 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const KeywordCard: React.FC<{ keyword: SeoKeyword }> = ({ keyword }) => {
    const { t } = useTranslation();
    const getBadgeColor = (value: 'High' | 'Medium' | 'Low') => {
        if (value === 'High') return 'bg-red-500/50 text-red-300';
        if (value === 'Medium') return 'bg-yellow-500/50 text-yellow-300';
        return 'bg-green-500/50 text-green-300';
    };
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-teal-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gray-800/50 p-3 rounded-md border-l-4 border-purple-500">
            <h4 className="font-bold">{keyword.keyword}</h4>
            <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex gap-2">
                   <span className={`px-2 py-0.5 rounded-full ${getBadgeColor(keyword.searchVolume)}`}>{t('seoNexus.volume')}: {keyword.searchVolume}</span>
                   <span className={`px-2 py-0.5 rounded-full ${getBadgeColor(keyword.competition)}`}>{t('seoNexus.competition')}: {keyword.competition}</span>
                </div>
                 <div>
                    <span className="font-bold">{t('seoNexus.virality')}: </span>
                    <span className={`text-lg font-mono font-extrabold ${getScoreColor(keyword.viralityScore)}`}>{keyword.viralityScore.toFixed(1)}/10</span>
                </div>
            </div>
        </div>
    );
};

interface SeoNexusProps {
    initialTopic: string;
    onAnalysisComplete: () => void;
}

export const SeoNexus: React.FC<SeoNexusProps> = ({ initialTopic, onAnalysisComplete }) => {
    const { t, language } = useTranslation();
    const [niche, setNiche] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<SeoAnalysisResult | null>(null);

    const [isRoverLoading, setIsRoverLoading] = useState(false);
    const [roverError, setRoverError] = useState<string|null>(null);
    const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);

    const handleAnalyze = async (e: React.FormEvent | null, nicheToAnalyze?: string) => {
        e?.preventDefault();
        const currentNiche = nicheToAnalyze || niche;
        if (!currentNiche) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await getSeoOpportunityAnalysis(currentNiche, language);
            setAnalysisResult(result);
        } catch (err: any) {
             setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialTopic) {
            setNiche(initialTopic);
            handleAnalyze(null, initialTopic);
            onAnalysisComplete(); // Clear the topic in parent
        }
    }, [initialTopic, language]);


    const handleDeployRover = async () => {
        setIsRoverLoading(true);
        setRoverError(null);
        setSuggestedNiches([]);
        
        // Simulate "unified goal" by using topics relevant to the app's context
        const existingTopics = ['AI Gadgets', 'Bio-Hacking', 'Automation', 'Decentralized Finance'];

        try {
            const results = await findEmergingNiches(existingTopics, language);
            setSuggestedNiches(results);
        } catch(err: any) {
            setRoverError(t(err.message) || t('errors.generic'));
        } finally {
            setIsRoverLoading(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setNiche(suggestion);
        handleAnalyze(null, suggestion);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-center">{t('seoNexus.title')}</h2>
            <p className="text-gray-400 text-center mb-6 max-w-3xl mx-auto">{t('seoNexus.description')}</p>

            {/* Opportunity Rover Section */}
            <div className="hud-border p-4 mb-6">
                <h3 className="text-xl font-bold text-cyan-300 mb-2">{t('seoNexus.roverTitle')}</h3>
                <p className="text-sm text-gray-400 mb-4">{t('seoNexus.roverDescription')}</p>
                 <button
                    onClick={handleDeployRover}
                    disabled={isRoverLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isRoverLoading ? t('seoNexus.roverButtonLoading') : t('seoNexus.roverButton')}
                </button>
                {roverError && <div className="text-red-400 text-xs mt-2">{roverError}</div>}
                {suggestedNiches.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-bold text-purple-300 mb-2">{t('seoNexus.roverResultsTitle')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestedNiches.map(suggestion => (
                                <button key={suggestion} onClick={() => handleSuggestionClick(suggestion)} className="bg-purple-600/50 hover:bg-purple-500/50 text-white text-xs font-semibold py-1 px-3 rounded-full transition-colors">
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <h3 className="text-xl font-bold text-center mb-4">{t('seoNexus.analysisTitle')}</h3>

            <form onSubmit={(e) => handleAnalyze(e)} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder={t('seoNexus.inputPlaceholder')}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={isLoading || !niche}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {isLoading ? t('seoNexus.buttonLoading') : t('seoNexus.button')}
                </button>
            </form>

            <div className="flex-grow overflow-y-auto pr-2">
                 {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}

                {!analysisResult && !isLoading && (
                    <div className="text-center text-gray-500 pt-10">
                        <p>{!niche ? t('seoNexus.placeholder') : t('seoNexus.noResultsPlaceholder')}</p>
                    </div>
                )}

                 {isLoading && <div className="text-center text-cyan-300 pt-10 animate-pulse">{t('seoNexus.buttonLoading')}</div>}

                {analysisResult && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <HudWidget title={t('seoNexus.keywordsTitle')} className="lg:col-span-2">
                                <div className="space-y-3">
                                   {analysisResult.keywords.map(kw => <KeywordCard key={kw.keyword} keyword={kw} />)}
                                </div>
                            </HudWidget>
                             <HudWidget title={t('seoNexus.adviceTitle')} className="lg:col-span-1">
                                <p className="text-gray-300 whitespace-pre-wrap">{analysisResult.strategicAdvice}</p>
                            </HudWidget>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
