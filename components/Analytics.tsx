import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { DataVisualization } from './DataVisualization';
import { MarketSimulation } from './MarketSimulation';
import { SeoNexus } from './SeoNexus';
import { DualIncomeHunter } from './DualIncomeHunter';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { SimulationIcon } from './icons/SimulationIcon';
import { SeoIcon } from './icons/SeoIcon';
import { MoneyIcon } from './icons/MoneyIcon';
import { AffiliateIcon } from './icons/AffiliateIcon';
import { AffiliateIntelligence } from './AffiliateIntelligence';
import { CoachIcon } from './icons/CoachIcon';
import { AIContentCoach } from './AIContentCoach';

const AnalyticsCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = "" }) => (
    <div className={`hud-border p-4 ${className}`}>
        <h3 className="text-lg font-bold text-cyan-300 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const initialVideoData = [
  { name: "AI Gadgets", views: 1200000, revenue: 10230, rpm: 8.53 },
  { name: "Space Travel", views: 850000, revenue: 6545, rpm: 7.70 },
  { name: "Automation", views: 670000, revenue: 7120, rpm: 10.62 },
  { name: "Bio-Hacking", views: 950000, revenue: 8300, rpm: 8.74 },
];

export const Analytics: React.FC = () => {
    const { t } = useTranslation();
    const [videoData, setVideoData] = useState(initialVideoData);
    const [activeTab, setActiveTab] = useState('performance');
    // This state is for triggering analysis from other components, not used for now but good for future-proofing.
    const [initialTopic, setInitialTopic] = useState('');


    useEffect(() => {
        const interval = setInterval(() => {
            setVideoData(prevData =>
                prevData.map(item => ({
                    ...item,
                    views: item.views + Math.floor(Math.random() * 1000),
                    revenue: item.revenue + Math.random() * 10,
                }))
            );
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { id: 'performance', label: t('analytics.tabPerformance'), icon: <AnalyticsIcon /> },
        { id: 'market', label: t('analytics.tabMarket'), icon: <SimulationIcon /> },
        { id: 'seo', label: t('analytics.tabSeo'), icon: <SeoIcon /> },
        { id: 'dual-income', label: t('analytics.tabDualIncome'), icon: <MoneyIcon /> },
        { id: 'affiliate', label: t('analytics.tabAffiliate'), icon: <AffiliateIcon /> },
        { id: 'coach', label: t('analytics.tabCoach'), icon: <CoachIcon /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'market':
                return <MarketSimulation initialTopic={initialTopic} onAnalysisComplete={() => setInitialTopic('')} />;
            case 'seo':
                return <SeoNexus initialTopic={initialTopic} onAnalysisComplete={() => setInitialTopic('')} />;
            case 'dual-income':
                return <DualIncomeHunter />;
            case 'affiliate':
                return <AffiliateIntelligence />;
            case 'coach':
                return <AIContentCoach />;
            case 'performance':
            default:
                return (
                     <div className="space-y-6">
                        <DataVisualization 
                            title={t('analytics.performanceTitle')} 
                            data={videoData}
                            className="lg:col-span-2"
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnalyticsCard title={t('analytics.competitorTitle')}>
                                <p className="text-sm text-gray-400 mb-3">{t('analytics.competitorDesc')}</p>
                                <ul className="text-sm space-y-2">
                                    <li>{t('analytics.competitorA')}</li>
                                    <li>{t('analytics.competitorB')}</li>
                                    <li>{t('analytics.competitorTrend')}</li>
                                </ul>
                            </AnalyticsCard>
                        </div>
                    </div>
                );
        }
    };

  return (
    <div className="h-full flex flex-col">
        <header className="text-center mb-6 flex-shrink-0">
            <h2 className="text-3xl font-bold">{t('sidebar.analytics')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-2">{t('dashboard.analytics.description')}</p>
        </header>
        
        <div className="flex-shrink-0 flex flex-wrap justify-center border-b border-gray-700/50 mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-cyan-300 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
             {renderContent()}
        </div>
    </div>
  );
};