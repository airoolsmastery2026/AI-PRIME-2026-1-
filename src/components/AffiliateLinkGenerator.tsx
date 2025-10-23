import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { generateAffiliateLinks } from '../services/geminiService';
import { generalAffiliatePlatforms, cryptoAffiliatePlatforms } from '../types';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { CopyIcon } from './icons/CopyIcon';

interface GeneratedLink {
    platform: string;
    link: string;
}

export const AffiliateLinkGenerator: React.FC = () => {
    const { t, language } = useTranslation();
    const { credentials } = useSystem();
    const [nicheOrProduct, setNicheOrProduct] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const availableAffiliatePlatforms = useMemo(() => {
        const allAffiliates = [...generalAffiliatePlatforms, ...cryptoAffiliatePlatforms];
        return allAffiliates.filter(p => credentials[p] && credentials[p]!.length > 0);
    }, [credentials]);

    const handleTogglePlatform = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleGenerate = async () => {
        if (!nicheOrProduct.trim() || selectedPlatforms.length === 0) return;

        setIsLoading(true);
        setError(null);
        setGeneratedLinks([]);

        try {
            const response = await generateAffiliateLinks(nicheOrProduct, selectedPlatforms, credentials, language);
            setGeneratedLinks(response.links);
        } catch (err: any) {
            setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
    };


    return (
        <div className="hud-border p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-2">{t('accounts.affiliateLinkGenerator.title')}</h3>
            <p className="text-sm text-gray-400 mb-4">{t('accounts.affiliateLinkGenerator.description')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-1">{t('accounts.affiliateLinkGenerator.inputLabel')}</label>
                        <textarea
                            value={nicheOrProduct}
                            onChange={(e) => setNicheOrProduct(e.target.value)}
                            rows={3}
                            placeholder={t('accounts.affiliateLinkGenerator.inputPlaceholder')}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">{t('accounts.affiliateLinkGenerator.platformsLabel')}</label>
                        {availableAffiliatePlatforms.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {availableAffiliatePlatforms.map(platform => (
                                    <label key={platform} htmlFor={`platform-${platform}`} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md cursor-pointer hover:bg-gray-700/50">
                                        <input
                                            type="checkbox"
                                            id={`platform-${platform}`}
                                            checked={selectedPlatforms.includes(platform)}
                                            onChange={() => handleTogglePlatform(platform)}
                                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            {getPlatformIcon(platform, "w-4 h-4")}
                                            <span className="text-xs font-semibold capitalize">{platform}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 bg-black/30 p-3 rounded-md">{t('accounts.affiliateLinkGenerator.noPlatforms')}</p>
                        )}
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !nicheOrProduct.trim() || selectedPlatforms.length === 0}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('accounts.affiliateLinkGenerator.generatingButton') : t('accounts.affiliateLinkGenerator.generateButton')}
                    </button>
                </div>
                {/* Results */}
                <div>
                    <h4 className="text-lg font-bold text-cyan-300 mb-2">{t('accounts.affiliateLinkGenerator.resultsTitle')}</h4>
                     <div className="bg-black/30 p-3 rounded-md min-h-[200px] border border-gray-700 space-y-3">
                        {isLoading && <p className="text-center text-gray-400 animate-pulse">{t('accounts.affiliateLinkGenerator.generatingButton')}</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {!isLoading && !error && generatedLinks.length === 0 && <p className="text-center text-gray-500 text-sm p-8">Generated links will appear here.</p>}
                        {generatedLinks.map(item => (
                            <div key={item.platform} className="bg-gray-800/50 p-2 rounded-md">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        {getPlatformIcon(item.platform)}
                                        <span className="font-semibold capitalize">{item.platform}</span>
                                    </div>
                                    <span className="text-cyan-300 text-xs">{copiedLink === item.link ? t('accounts.affiliateLinkGenerator.copied') : ''}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={item.link}
                                        className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 font-mono text-gray-300 text-xs"
                                    />
                                    <button onClick={() => handleCopy(item.link)} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md flex-shrink-0">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
