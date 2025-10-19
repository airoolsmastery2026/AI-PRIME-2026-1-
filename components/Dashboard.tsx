
import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { AgentIcon } from './icons/AgentIcon';
import { AutomationIcon } from './icons/AutomationIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MatrixIcon } from './icons/MatrixIcon';
import { CommandIcon } from './icons/CommandIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';

interface DashboardCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="hud-border p-6 text-left h-full flex flex-col hover:border-cyan-400/50 hover:bg-gray-800/20 transition-all duration-300"
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="text-cyan-300">{icon}</div>
            <h3 className="text-xl font-bold text-cyan-300">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm flex-grow">{description}</p>
    </button>
);

interface DashboardProps {
    setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const { t } = useTranslation();

    const cards = [
        {
            id: 'agents',
            icon: <AgentIcon />,
            title: t('dashboard.agents.title'),
            description: t('dashboard.agents.description'),
        },
        {
            id: 'accounts',
            icon: <UsersIcon />,
            title: t('dashboard.accounts.title'),
            description: t('dashboard.accounts.description'),
        },
        {
            id: 'automation',
            icon: <AutomationIcon />,
            title: t('dashboard.automation.title'),
            description: t('dashboard.automation.description'),
        },
        {
            id: 'video',
            icon: <VideoIcon />,
            title: t('dashboard.video.title'),
            description: t('dashboard.video.description'),
        },
        {
            id: 'matrix',
            icon: <MatrixIcon />,
            title: t('dashboard.matrix.title'),
            description: t('dashboard.matrix.description'),
        },
        {
            id: 'nexus',
            icon: <CommandIcon />,
            title: t('dashboard.nexus.title'),
            description: t('dashboard.nexus.description'),
        },
        {
            id: 'analytics',
            icon: <AnalyticsIcon />,
            title: t('dashboard.analytics.title'),
            description: t('dashboard.analytics.description'),
        },
    ];

    return (
        <div className="h-full flex flex-col">
            <header className="text-center mb-8 flex-shrink-0">
                <h2 className="text-4xl font-bold text-cyan-300">{t('dashboard.title')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mt-2">{t('dashboard.description')}</p>
            </header>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cards.map(card => (
                        <DashboardCard
                            key={card.id}
                            icon={card.icon}
                            title={card.title}
                            description={card.description}
                            onClick={() => setActiveView(card.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};