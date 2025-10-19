import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { AISuggestion } from '../types';
import { SeoIcon } from './icons/SeoIcon';
import { GoogleTrendsIcon } from './icons/GoogleTrendsIcon';
import { CreatorIcon } from './icons/CreatorIcon';

interface AISuggestionsProps {
    suggestions: AISuggestion[];
    onExecute: (title: string) => void;
}

const getSuggestionIcon = (type: AISuggestion['type']) => {
    const className = "w-5 h-5 text-cyan-300";
    switch (type) {
        case 'seo':
            return <SeoIcon className={className} />;
        case 'market':
            return <GoogleTrendsIcon className={className} />;
        case 'content':
            return <CreatorIcon className={className} />;
        default:
            return null;
    }
};

const SuggestionCard: React.FC<{ suggestion: AISuggestion; onExecute: (title: string) => void }> = ({ suggestion, onExecute }) => {
    const { t } = useTranslation();
    const title = t(suggestion.titleKey);
    const description = t(suggestion.descriptionKey);

    return (
         <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50 animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getSuggestionIcon(suggestion.type)}</div>
                <div className="flex-grow">
                    <h5 className="font-bold text-sm text-cyan-300">{title}</h5>
                    <p className="text-xs text-gray-400 mt-1">{description}</p>
                </div>
            </div>
            <button
                onClick={() => onExecute(title)}
                className="w-full mt-3 text-xs bg-purple-600/80 hover:bg-purple-600 text-white font-bold py-1.5 px-3 rounded-md transition-colors"
            >
                {t('agents.execute')}
            </button>
        </div>
    );
};

export const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, onExecute }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-black/50 p-3 rounded-md h-full flex flex-col">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 flex-shrink-0">{t('agents.opportunities')}</h4>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {suggestions.length > 0 ? (
                    suggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onExecute={onExecute} />)
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                        <p>Awaiting strategic analysis...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Add keyframes to index.html or a global CSS file for the animation
const animationStyle = document.createElement('style');
animationStyle.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(animationStyle);