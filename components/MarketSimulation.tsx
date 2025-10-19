import React, { useState, useEffect } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Legend, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';
import { useTranslation } from '../i18n/useTranslation';
import { analyzeMarketTrends } from '../services/geminiService';
import { MarketAnalysisResult, TrendingTopic } from '../types';

const HudWidget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-300 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const SentimentChart: React.FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
    const COLORS = ['#2dd4bf', '#60a5fa', '#f87171'];
    return (
        <div className="w-full h-48">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            background: 'rgba(31, 41, 55, 0.8)', 
                            borderColor: '#4b5563',
                            backdropFilter: 'blur(2px)'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

const MarketCustomBarTooltip = ({ active, payload, label }: any) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-md text-sm">
                <p className="font-bold text-cyan-300 mb-2">{data.originalData.topic}</p>
                <p style={{ color: '#2dd4bf' }}>{`${t('marketSimulation.opportunity')}: ${data.originalData.opportunityScore.toFixed(1)}/10`}</p>
                <p style={{ color: '#60a5fa' }}>{`${t('marketSimulation.volume')}: ${data.originalData.searchVolume}`}</p>
                <p style={{ color: '#f87171' }}>{`${t('marketSimulation.competition')}: ${data.originalData.competition}`}</p>
            </div>
        );
    }
    return null;
};

const TopicCard: React.FC<{ topic: TrendingTopic }> = ({ topic }) => {
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
            <h4 className="font-bold">{topic.topic}</h4>
            <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex gap-2">
                   <span className={`px-2 py-0.5 rounded-full ${getBadgeColor(topic.searchVolume)}`}>{t('marketSimulation.volume')}: {topic.searchVolume}</span>
                   <span className={`px-2 py-0.5 rounded-full ${getBadgeColor(topic.competition)}`}>{t('marketSimulation.competition')}: {topic.competition}</span>
                </div>
                 <div>
                    <span className="font-bold">{t('marketSimulation.opportunity')}: </span>
                    <span className={`text-lg font-mono font-extrabold ${getScoreColor(topic.opportunityScore)}`}>{topic.opportunityScore.toFixed(1)}/10</span>
                </div>
            </div>
        </div>
    )
};

interface MarketSimulationProps {
    initialTopic: string;
    onAnalysisComplete: () => void;
}

export const MarketSimulation: React.FC<MarketSimulationProps> = ({ initialTopic, onAnalysisComplete }) => {
    const { t, language } = useTranslation();
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<MarketAnalysisResult | null>(null);

    const handleAnalyze = async (e: React.FormEvent | null, nicheToAnalyze?: string) => {
        e?.preventDefault();
        const currentNiche = nicheToAnalyze || topic;
        if (!currentNiche) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeMarketTrends(currentNiche, language);
            setAnalysisResult(result);
        } catch (err: any) {
             setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
            handleAnalyze(null, initialTopic);
            onAnalysisComplete(); // Clear the topic in parent to prevent re-triggering
        }
    }, [initialTopic, language]);


    const sentimentData = analysisResult ? [
        { name: 'Positive', value: analysisResult.sentimentAnalysis.positive },
        { name: 'Neutral', value: analysisResult.sentimentAnalysis.neutral },
        { name: 'Negative', value: analysisResult.sentimentAnalysis.negative },
    ] : [];

    const chartData = analysisResult?.trendingTopics.map(topic => {
        const valueMap: { [key in 'High' | 'Medium' | 'Low']: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return {
            name: topic.topic.length > 25 ? `${topic.topic.substring(0, 25)}...` : topic.topic,
            opportunity: topic.opportunityScore,
            volume: valueMap[topic.searchVolume],
            competition: valueMap[topic.competition],
            originalData: topic
        };
    });


    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-center">{t('marketSimulation.title')}</h2>
            <p className="text-gray-400 text-center mb-6 max-w-3xl mx-auto">{t('marketSimulation.description')}</p>

            <form onSubmit={handleAnalyze} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('marketSimulation.inputPlaceholder')}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={isLoading || !topic}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {isLoading ? t('marketSimulation.buttonLoading') : t('marketSimulation.button')}
                </button>
            </form>

            <div className="flex-grow overflow-y-auto pr-2">
                 {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}

                {!analysisResult && !isLoading && (
                    <div className="text-center text-gray-500 pt-20">
                        <p>{t('marketSimulation.placeholder')}</p>
                    </div>
                )}

                 {isLoading && <div className="text-center text-cyan-300 pt-20 animate-pulse">{t('marketSimulation.buttonLoading')}</div>}

                {analysisResult && (
                    <div className="space-y-6">
                        <HudWidget title={t('marketSimulation.trendingTitle')}>
                            <div className="w-full h-80 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 10]} />
                                        <Tooltip content={<MarketCustomBarTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                                        <Bar dataKey="opportunity" fill="#2dd4bf" name={t('marketSimulation.opportunity')} />
                                        <Bar dataKey="volume" fill="#60a5fa" name={t('marketSimulation.volume')} />
                                        <Bar dataKey="competition" fill="#f87171" name={t('marketSimulation.competition')} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                               {analysisResult.trendingTopics.map(topic => <TopicCard key={topic.topic} topic={topic} />)}
                            </div>
                        </HudWidget>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <HudWidget title={t('marketSimulation.sentimentTitle')}>
                                <SentimentChart data={sentimentData} />
                            </HudWidget>
                             <HudWidget title={t('marketSimulation.recommendationTitle')}>
                                <p className="text-gray-300 whitespace-pre-wrap">{analysisResult.strategicRecommendation}</p>
                            </HudWidget>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};