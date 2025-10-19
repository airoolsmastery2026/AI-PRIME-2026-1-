import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { AssimilatedAsset, JobStatus, ProductionJob, StrategicDirective } from '../types';
import { assimilateContentFromUrl } from '../services/geminiService';
import { useSystem } from '../contexts/SystemContext';

interface Message {
    sender: 'user' | 'ai' | 'system';
    text: string;
}

const AssimilationProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const { t } = useTranslation();
    const steps = [
        { name: t('commandNexus.assimilation.step1'), complete: progress >= 25 },
        { name: t('commandNexus.assimilation.step2'), complete: progress >= 50 },
        { name: t('commandNexus.assimilation.step3'), complete: progress >= 75 },
        { name: t('commandNexus.assimilation.step4'), complete: progress >= 100 },
    ];
    return (
        <div className="space-y-2 mt-4">
            {steps.map(step => (
                <div key={step.name} className={`flex items-center gap-3 text-sm transition-colors duration-500 ${step.complete ? 'text-cyan-300' : 'text-gray-500'}`}>
                    {step.complete ? <span className="w-4 h-4 text-center">✓</span> : <div className="w-4 h-4 border-2 border-gray-500 rounded-full animate-spin"></div>}
                    <p>{step.name}</p>
                </div>
            ))}
        </div>
    );
};


export const CommandNexus: React.FC = () => {
    const { t, language } = useTranslation();
    const { addVideoJob, addDirective } = useSystem();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'system', text: t('commandNexus.welcome') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [urlInput, setUrlInput] = useState('');
    const [isAssimilating, setIsAssimilating] = useState(false);
    const [assimilationProgress, setAssimilationProgress] = useState(0);
    const [assimilatedAsset, setAssimilatedAsset] = useState<AssimilatedAsset | null>(null);
    const [assimilationError, setAssimilationError] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleAssimilate = async () => {
        if (!urlInput.trim() || isAssimilating) return;
        setIsAssimilating(true);
        setAssimilatedAsset(null);
        setAssimilationError(null);
        setAssimilationProgress(0);

        const progressInterval = setInterval(() => {
            setAssimilationProgress(prev => Math.min(prev + 1, 99));
        }, 120);

        try {
            const result = await assimilateContentFromUrl(urlInput, language);
            setAssimilatedAsset(result);
            setAssimilationProgress(100);
            setUrlInput('');
        } catch (error: any) {
            setAssimilationError(t(error.message) || t('errors.generic'));
        } finally {
            clearInterval(progressInterval);
            setIsAssimilating(false);
        }
    };

    const handleSendToVideoFactory = () => {
        if (!assimilatedAsset || !assimilatedAsset.generatedScript) return;
        
        const scriptText = `Title: ${assimilatedAsset.title}\n\nHook: ${assimilatedAsset.generatedScript.hook}\n\nScript: ${assimilatedAsset.generatedScript.script}\n\nCTA: ${assimilatedAsset.generatedScript.cta}`;

        const newJob: ProductionJob = {
            id: `job-${Date.now()}`,
            prompt: scriptText,
            aspectRatio: '9:16',
            is8K: false,
            status: JobStatus.Queued,
            progress: 10,
        };

        addVideoJob(newJob);
        
        setMessages(prev => [...prev, { sender: 'system', text: `"${assimilatedAsset.title}" sent to AI Video Factory queue.`}]);
        setAssimilatedAsset(null);
    };

    const handleDeployCounterAgent = () => {
        if (!assimilatedAsset || !assimilatedAsset.counterStrategy) return;

        const newDirective: StrategicDirective = {
            directive: assimilatedAsset.counterStrategy,
            rationale: `Counter-strategy from assimilated asset: ${assimilatedAsset.sourceUrl}`,
        };
        addDirective(newDirective);

        setMessages(prev => [...prev, { sender: 'system', text: `Counter-strategy directive sent to Agent Control queue.` }]);
        setAssimilatedAsset(null);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/utility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'nexusCommand', message: input, language }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || 'errors.generic');
            }

            const data = await res.json();
            const aiMessage: Message = { sender: 'ai', text: data.response };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error: any) {
            const errorMessage: Message = { sender: 'system', text: t(error.message) || t('errors.generic') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const renderMessage = (msg: Message, index: number) => {
        switch (msg.sender) {
            case 'user':
                return <div key={index} className="flex justify-end"><p className="bg-purple-600/50 p-2 rounded-lg max-w-lg">{msg.text}</p></div>;
            case 'ai':
                return <div key={index} className="flex justify-start"><pre className="bg-gray-800/80 p-2 rounded-lg max-w-lg whitespace-pre-wrap text-sm text-cyan-300">{msg.text}</pre></div>;
            case 'system':
                return <div key={index} className="text-center text-yellow-400 text-xs italic py-2">--- {msg.text} ---</div>;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto pr-2">
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold">{t('commandNexus.title')}</h2>
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">{t('commandNexus.description')}</p>
            </header>

            {/* Content Assimilator */}
            <div className="hud-border p-4 mb-6">
                 <h3 className="text-xl font-bold text-cyan-300 mb-2">{t('commandNexus.assimilatorTitle')}</h3>
                 <p className="text-sm text-gray-400 mb-4">{t('commandNexus.assimilatorDescription')}</p>
                 <div className="flex gap-2">
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t('commandNexus.urlPlaceholder')}
                        className="flex-grow bg-gray-900/50 border border-gray-700 rounded-md py-2 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        disabled={isAssimilating}
                    />
                    <button
                        onClick={handleAssimilate}
                        disabled={isAssimilating || !urlInput.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isAssimilating ? t('commandNexus.assimilatingButton') : t('commandNexus.assimilateButton')}
                    </button>
                </div>
                {isAssimilating && <AssimilationProgress progress={assimilationProgress} />}
                {assimilationError && <p className="text-red-400 text-sm mt-2">{assimilationError}</p>}
                
                {assimilatedAsset && (
                     <div className="mt-4 p-4 bg-black/30 rounded-lg border border-gray-700 animate-[fadeIn_0.5s_ease-in-out]">
                        <h4 className="text-lg font-bold text-purple-300">{t('commandNexus.assimilatedAssetTitle')}</h4>
                        <p className="font-bold text-white mt-1">{assimilatedAsset.title}</p>
                        {assimilatedAsset.generatedScript && (
                             <div className="text-sm mt-2 space-y-1 text-gray-300">
                                <p><strong className="text-cyan-300">Hook:</strong> {assimilatedAsset.generatedScript.hook}</p>
                                <p><strong className="text-cyan-300">Script:</strong> {assimilatedAsset.generatedScript.script}</p>
                                <p><strong className="text-cyan-300">CTA:</strong> {assimilatedAsset.generatedScript.cta}</p>
                            </div>
                        )}
                        {assimilatedAsset.analysisSummary && (
                            <div className="text-sm mt-2 space-y-1 text-gray-300">
                                <p>{assimilatedAsset.analysisSummary}</p>
                                {assimilatedAsset.counterStrategy && <p className="mt-2 text-yellow-300"><strong className="text-yellow-200">Counter-Strategy:</strong> {assimilatedAsset.counterStrategy}</p>}
                            </div>
                        )}
                        <div className="mt-4 flex gap-2">
                            {assimilatedAsset.generatedScript && (
                                <button onClick={handleSendToVideoFactory} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">
                                    {t('commandNexus.sendToVideoFactory')}
                                </button>
                            )}
                             {assimilatedAsset.counterStrategy && (
                                <button onClick={handleDeployCounterAgent} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">
                                     {t('commandNexus.deployCounterAgent')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>


            {/* Terminal Interface */}
            <div className="hud-border flex-grow flex flex-col p-4 min-h-[500px]">
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="flex items-center text-cyan-300 font-mono">
                       <span>&gt;</span>
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isLoading ? t('commandNexus.placeholderLoading') : t('commandNexus.placeholder')}
                        className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none transition-all font-mono"
                        disabled={isLoading}
                    />
                </div>
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