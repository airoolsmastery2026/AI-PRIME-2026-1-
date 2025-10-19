import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { CloseIcon } from './icons/CloseIcon';
import { TopicPipeline } from '../types';

interface GenerateContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, selectedPlatforms: string[]) => void;
    pipeline: TopicPipeline;
}

export const GenerateContentModal: React.FC<GenerateContentModalProps> = ({ isOpen, onClose, onGenerate, pipeline }) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        // Generate for all platforms in the pipeline
        onGenerate(prompt, pipeline.channels.map(c => c.platform));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-300">{t('contentMatrix.generateModal.title')} for "{pipeline.topic}"</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="content-prompt" className="block text-sm font-medium text-purple-300 mb-1">
                            {t('contentMatrix.generateModal.promptLabel')}
                        </label>
                        <textarea
                            id="content-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder={t('contentMatrix.generateModal.promptPlaceholder')}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1">{t('contentMatrix.generateModal.promptHelp')}</p>
                    </div>
                     <div className="pt-4 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={!prompt.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-all disabled:opacity-50"
                        >
                            {t('contentMatrix.generateModal.generateButton', { count: pipeline.channels.length })}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
