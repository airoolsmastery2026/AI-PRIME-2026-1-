import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { analyzeAffiliatePrograms } from '../services/geminiService';
import { AffiliateAnalysisReport, AffiliateProgramAnalysis } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const HudWidget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-300 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

type SortKey = keyof AffiliateProgramAnalysis;
type SortDirection = 'asc' | 'desc';

export const AffiliateIntelligence: React.FC = () => {
    const { t, language } = useTranslation();
    const [niche, setNiche] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<AffiliateAnalysisReport | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'overallScore', direction: 'desc' });

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!niche) return;

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await analyzeAffiliatePrograms(niche, language);
            setReport(result);
        } catch (err: any) {
            setError(t(err.message) || t('errors.marketAnalysis'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const sortedPrograms = useMemo(() => {
        if (!report?.topPrograms || !sortConfig) return report?.topPrograms || [];
        
        const sorted = [...report.topPrograms].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [report, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey, label: string }> = ({ sortKey, label }) => {
        const isSorted = sortConfig?.key === sortKey;
        const Icon = sortConfig?.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon;
        return (
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1">
                    {label}
                    {isSorted && <Icon className="w-3 h-3" />}
                </button>
            </th>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-center">{t('affiliateIntelligence.title')}</h2>
            <p className="text-gray-400 text-center mb-6 max-w-3xl mx-auto">{t('affiliateIntelligence.description')}</p>

            <form onSubmit={handleAnalyze} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder={t('affiliateIntelligence.inputPlaceholder')}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={isLoading || !niche}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {isLoading ? t('affiliateIntelligence.buttonLoading') : t('affiliateIntelligence.button')}
                </button>
            </form>

            <div className="flex-grow overflow-y-auto pr-2">
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}
                {!report && !isLoading && (
                    <div className="text-center text-gray-500 pt-20"><p>{t('affiliateIntelligence.placeholder')}</p></div>
                )}
                {isLoading && <div className="text-center text-cyan-300 pt-20 animate-pulse">{t('affiliateIntelligence.buttonLoading')}</div>}
                {report && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <HudWidget title={t('affiliateIntelligence.marketOverview')}><p className="text-gray-300 whitespace-pre-wrap">{report.marketOverview}</p></HudWidget>
                            <HudWidget title={t('affiliateIntelligence.strategicRecommendations')}><p className="text-gray-300 whitespace-pre-wrap">{report.strategicRecommendations}</p></HudWidget>
                        </div>
                        <HudWidget title={t('affiliateIntelligence.topPrograms')}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-800/50">
                                        <tr>
                                            <SortableHeader sortKey="programName" label={t('affiliateIntelligence.table.program')} />
                                            <SortableHeader sortKey="overallScore" label={t('affiliateIntelligence.table.score')} />
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('affiliateIntelligence.table.commission')}</th>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('affiliateIntelligence.table.cookie')}</th>
                                            <SortableHeader sortKey="brandReputation" label={t('affiliateIntelligence.table.reputation')} />
                                            <SortableHeader sortKey="conversionPotential" label={t('affiliateIntelligence.table.conversion')} />
                                            <SortableHeader sortKey="supportLevel" label={t('affiliateIntelligence.table.support')} />
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('affiliateIntelligence.table.action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {sortedPrograms.map((p) => (
                                            <tr key={p.programName} className="hover:bg-gray-800/30">
                                                <td className="px-3 py-4 whitespace-nowrap"><div className="text-sm font-medium text-white">{p.programName}</div><div className="text-xs text-gray-400">{p.summary}</div></td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center"><span className="text-lg font-bold font-mono text-cyan-300">{p.overallScore.toFixed(1)}</span></td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">{p.commissionRate}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">{p.cookieDuration}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center"><div className="text-sm text-gray-300">{p.brandReputation}/10</div></td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center"><div className="text-sm text-gray-300">{p.conversionPotential}/10</div></td>
                                                <td className="px-3 py-4 whitespace-nowrap text-center"><div className="text-sm text-gray-300">{p.supportLevel}/10</div></td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href={p.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600/80 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-md transition-all text-xs">
                                                        {t('affiliateIntelligence.join')} <ExternalLinkIcon className="w-3 h-3" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </HudWidget>
                    </div>
                )}
            </div>
        </div>
    );
};