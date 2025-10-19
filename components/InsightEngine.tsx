import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ChannelAnalysisReport, StrategicDirective } from '../types';
import { analyzeChannelPerformance } from '../services/geminiService';
import { useSystem } from '../contexts/SystemContext';

const ThinkingProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const { t } = useTranslation();
    const steps = [
        { name: t('insightEngine.thinking.step1'), threshold: 1 },
        { name: t('insightEngine.thinking.step2'), threshold: 20 },
        { name: t('insightEngine.thinking.step3'), threshold: 40 },
        { name: t('insightEngine.thinking.step4'), threshold: 60 },
        { name: t('insightEngine.thinking.step5'), threshold: 80 },
    ];
    return (
        <div className="space-y-3 mt-4 max-w-md mx-auto">
            {steps.map(step => (
                <div key={step.name} className={`flex items-center gap-3 p-3 rounded-md transition-all duration-500 ${progress >= step.threshold ? 'bg-purple-600/30' : 'bg-gray-800/50'}`}>
                    <div className={`transition-colors ${progress >= step.threshold ? 'text-cyan-300' : 'text-gray-500'}`}>
                         {progress >= step.threshold ? <span className="w-4 h-4 text-center">✓</span> : <div className="w-4 h-4 border-2 border-gray-500 rounded-full animate-spin"></div>}
                    </div>
                    <p className={`font-semibold transition-colors ${progress >= step.threshold ? 'text-white' : 'text-gray-400'}`}>{step.name}</p>
                </div>
            ))}
        </div>
    );
};

const ReportDisplay: React.FC<{ report: ChannelAnalysisReport }> = ({ report }) => {
    const { t } = useTranslation();
    const { addDirective } = useSystem();
    const [activeTab, setActiveTab] = useState('dna');
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    const handleSendToAgent = (directive: StrategicDirective) => {
        addDirective(directive);
        setFeedback(prev => ({...prev, [directive.directive]: 'Sent to Queue!'}));
        setTimeout(() => {
             setFeedback(prev => ({...prev, [directive.directive]: ''}));
        }, 2000);
    };

    const tabs = [
        { id: 'dna', label: t('insightEngine.tabDna') },
        { id: 'formula', label: t('insightEngine.tabFormula') },
        { id: 'vectors', label: t('insightEngine.tabVectors') },
        { id: 'directives', label: t('insightEngine.tabDirectives') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dna':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="hud-border p-4"><p className="text-sm text-gray-400">{t('insightEngine.dna.subs')}</p><p className="text-2xl font-bold">{report.performanceDna?.subscriberCount || 'N/A'}</p></div>
                            <div className="hud-border p-4"><p className="text-sm text-gray-400">{t('insightEngine.dna.views')}</p><p className="text-2xl font-bold">{report.performanceDna?.averageViews || 'N/A'}</p></div>
                            <div className="hud-border p-4"><p className="text-sm text-gray-400">{t('insightEngine.dna.engagement')}</p><p className="text-2xl font-bold">{report.performanceDna?.estimatedEngagementRate || 'N/A'}</p></div>
                        </div>
                        <p className="text-gray-300 p-4 bg-black/30 rounded-md">{report.performanceDna?.overallSummary || 'Overall summary not available.'}</p>
                    </div>
                );
            case 'formula':
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div><h4 className="font-bold text-purple-300 mb-2">{t('insightEngine.formula.formats')}</h4><ul className="list-disc list-inside text-sm space-y-1">{report.contentFormula?.commonVideoFormats?.map(item => <li key={item}>{item}</li>) || <li>Data not available.</li>}</ul></div>
                        <div><h4 className="font-bold text-purple-300 mb-2">{t('insightEngine.formula.topics')}</h4><ul className="list-disc list-inside text-sm space-y-1">{report.contentFormula?.coreTopicClusters?.map(item => <li key={item}>{item}</li>) || <li>Data not available.</li>}</ul></div>
                        <div><h4 className="font-bold text-purple-300 mb-2">{t('insightEngine.formula.titles')}</h4><ul className="list-disc list-inside text-sm space-y-1">{report.contentFormula?.titlePatterns?.map(item => <li key={item}>{item}</li>) || <li>Data not available.</li>}</ul></div>
                        <div><h4 className="font-bold text-purple-300 mb-2">{t('insightEngine.formula.thumbnails')}</h4><p className="text-sm">{report.contentFormula?.thumbnailPsychology || 'Data not available.'}</p></div>
                    </div>
                );
            case 'vectors':
                return (
                    <div className="space-y-3">
                        {report.viralVectors && report.viralVectors.length > 0 ? (
                            report.viralVectors.map((vector, i) => (
                                <div key={i} className="bg-gray-800/50 p-3 rounded-md">
                                    <p className="font-bold text-cyan-300">"{vector.videoTitle}"</p>
                                    <p className="text-xs text-gray-400 mt-1"><strong className="text-yellow-300">{t('insightEngine.vectors.reason')}:</strong> {vector.reasonForSuccess}</p>
                                </div>
                            ))
                        ) : (
                             <p className="text-gray-500 text-center">No viral vectors identified.</p>
                        )}
                    </div>
                );
            case 'directives':
                 return (
                    <div className="space-y-3">
                        {report.strategicDirectives && report.strategicDirectives.length > 0 ? (
                             report.strategicDirectives.map((dir, i) => (
                                <div key={i} className="bg-gray-800/50 p-3 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div className="flex-grow">
                                        <p className="font-bold text-cyan-300">{dir.directive}</p>
                                        <p className="text-xs text-gray-400 mt-1"><strong className="text-yellow-300">{t('insightEngine.directives.rationale')}:</strong> {dir.rationale}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSendToAgent(dir)}
                                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded-md transition-all text-xs flex-shrink-0"
                                    >
                                        {feedback[dir.directive] || t('insightEngine.directives.sendToAgent')}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No strategic directives generated.</p>
                        )}
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <div className="hud-border p-6">
            <h3 className="text-2xl font-bold text-center">{t('insightEngine.reportTitle')}: <span className="text-cyan-300">{report.channelName}</span></h3>
            <div className="flex justify-center border-b border-gray-700 my-4">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-cyan-300 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-4 animate-[fadeIn_0.5s_ease-in-out]">
                {renderContent()}
            </div>
        </div>
    );
};


export const InsightEngine: React.FC = () => {
    const { t, language } = useTranslation();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [report, setReport] = useState<ChannelAnalysisReport | null>(null);
    const [progress, setProgress] = useState(0);

    const handleAnalyze = async () => {
        if (!url.trim()) return;
        setIsLoading(true);
        setError(null);
        setReport(null);
        setProgress(1);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 1, 99));
        }, 200);

        try {
            const result = await analyzeChannelPerformance(url, language);
            setReport(result);
        } catch (err: any) {
            setError(t(err.message) || t('errors.reconFailed'));
        } finally {
            clearInterval(progressInterval);
            setProgress(100);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold">{t('insightEngine.title')}</h2>
                <p className="text-gray-400 text-sm max-w-3xl mx-auto">{t('insightEngine.description')}</p>
            </header>

            <div className="flex gap-2 max-w-2xl mx-auto">
                 <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t('insightEngine.placeholder')}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !url.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {isLoading ? t('insightEngine.buttonLoading') : t('insightEngine.button')}
                </button>
            </div>
            
            <div className="mt-6">
                {error && <div className="text-center bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 max-w-2xl mx-auto">{error}</div>}
                
                {isLoading && <ThinkingProgress progress={progress} />}
                
                {!isLoading && !report && !error && (
                    <div className="text-center text-gray-500 pt-10">
                        <p>{t('insightEngine.placeholderPrompt')}</p>
                    </div>
                )}
                
                {report && <ReportDisplay report={report} />}
            </div>
        </div>
    );
};


const animationStyle = document.createElement('style');
animationStyle.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(animationStyle);
