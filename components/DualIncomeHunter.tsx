import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { findDualIncomeNiches } from '../services/geminiService';
import { DualIncomeNiche } from '../types';
import { NicheScatterPlot } from './NicheScatterPlot';

const HudWidget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-300 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const NicheCard: React.FC<{ niche: DualIncomeNiche }> = ({ niche }) => {
    const { t } = useTranslation();
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-teal-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gray-800/50 p-3 rounded-md border-l-4 border-purple-500">
            <h4 className="font-bold text-base">{niche.niche}</h4>
            <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex gap-4">
                   <p><span className="font-bold">{t('dualIncomeHunter.viralPotential')}: </span><span className={`text-lg font-mono font-extrabold ${getScoreColor(niche.viralPotential)}`}>{niche.viralPotential.toFixed(1)}/10</span></p>
                   <p><span className="font-bold">{t('dualIncomeHunter.affiliatePotential')}: </span><span className={`text-lg font-mono font-extrabold ${getScoreColor(niche.affiliatePotential)}`}>{niche.affiliatePotential.toFixed(1)}/10</span></p>
                </div>
            </div>
            <p className="text-sm text-gray-300 mt-2">{niche.reasoning}</p>
            <div className="mt-3 pt-2 border-t border-gray-700/50">
                <h5 className="text-xs font-bold text-purple-300 mb-1">{t('dualIncomeHunter.suggestedProducts')}</h5>
                <ul className="list-disc list-inside text-xs space-y-1">
                    {niche.suggestedProducts.map(p => <li key={p}>{p}</li>)}
                </ul>
            </div>
        </div>
    );
};

export const DualIncomeHunter: React.FC = () => {
    const { t, language } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [niches, setNiches] = useState<DualIncomeNiche[]>([]);

    const handleHunt = async () => {
        setIsLoading(true);
        setError(null);
        setNiches([]);

        try {
            const result = await findDualIncomeNiches(language);
            setNiches(result);
        } catch (err: any) {
            setError(t(err.message) || t('errors.marketAnalysis'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-center">{t('dualIncomeHunter.title')}</h2>
            <p className="text-gray-400 text-center mb-6 max-w-3xl mx-auto">{t('dualIncomeHunter.description')}</p>
            
            <div className="mb-6 text-center">
                 <button
                    onClick={handleHunt}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? t('dualIncomeHunter.buttonLoading') : t('dualIncomeHunter.button')}
                </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md">{error}</div>}

                {!isLoading && niches.length === 0 && !error && (
                    <div className="text-center text-gray-500 pt-20">
                        <p>{t('dualIncomeHunter.placeholder')}</p>
                    </div>
                )}

                {isLoading && <div className="text-center text-cyan-300 pt-20 animate-pulse">{t('dualIncomeHunter.buttonLoading')}</div>}

                {niches.length > 0 && (
                    <>
                        <HudWidget title={t('dualIncomeHunter.visualizationTitle')}>
                            <NicheScatterPlot data={niches} />
                        </HudWidget>
                         <HudWidget title={t('dualIncomeHunter.nichesTitle')}>
                            <div className="space-y-4">
                                {niches.map(niche => <NicheCard key={niche.niche} niche={niche} />)}
                            </div>
                        </HudWidget>
                    </>
                )}
            </div>
        </div>
    );
};
