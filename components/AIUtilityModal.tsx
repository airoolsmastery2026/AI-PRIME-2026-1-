import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { CloseIcon } from './icons/CloseIcon';
import { UtilityTask, executeUtilityTask } from '../services/geminiService';
import { useSystem } from '../contexts/SystemContext';

interface AIUtilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: UtilityTask | null;
    language: 'en' | 'vi';
}

export const AIUtilityModal: React.FC<AIUtilityModalProps> = ({ isOpen, onClose, task, language }) => {
    const { t } = useTranslation();
    const { credentials } = useSystem();
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setInput('');
            setResult('');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const taskDetails = {
        summarizer: {
            title: t('aiUtilities.summarizerTitle'),
            placeholder: t('aiUtilities.summarizerPlaceholder'),
        },
        metadata: {
            title: t('aiUtilities.metadataTitle'),
            placeholder: t('aiUtilities.metadataPlaceholder'),
        },
        thumbnail: {
            title: t('aiUtilities.thumbnailTitle'),
            placeholder: t('aiUtilities.thumbnailPlaceholder'),
        },
        shorts: {
            title: t('aiUtilities.shortsTitle'),
            placeholder: t('aiUtilities.shortsPlaceholder'),
        },
    };

    const currentTask = taskDetails[task];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input) return;

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const response = await executeUtilityTask(task, input, credentials, language);
            setResult(response);
        } catch (err: any) {
            setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-300">{currentTask.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-300 mb-1">{t('aiUtilities.inputLabel')}</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={5}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                placeholder={currentTask.placeholder}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? t('aiUtilities.generatingButton') : t('aiUtilities.generateButton')}
                        </button>
                    </form>

                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">{t('aiUtilities.resultLabel')}</h3>
                        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md">{error}</div>}
                        {isLoading && <div className="text-center text-gray-400 animate-pulse">{t('aiUtilities.generatingButton')}</div>}
                        {result && (
                            <div className="bg-black/30 p-4 rounded-md h-64 overflow-y-auto border border-gray-700">
                                <pre className="text-gray-300 whitespace-pre-wrap text-sm">{result}</pre>
                            </div>
                        )}
                         {!result && !isLoading && !error && (
                            <div className="bg-black/30 p-4 rounded-md h-64 flex items-center justify-center text-gray-500 border border-gray-700">
                                <p>{t('aiUtilities.resultPlaceholder')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
