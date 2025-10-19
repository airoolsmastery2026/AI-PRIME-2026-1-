import React, { useState, useMemo } from 'react';
import { AUTOMATION_FLOWS } from '../data/automations';
import { AutomationFlow, FlowStep, FlowStepType } from '../types';
import { CreateFlowModal } from './CreateFlowModal';
import { ServiceIcon } from './icons/ServiceIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { GoogleSheetsIcon } from './icons/GoogleSheetsIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';
import { APIIcon } from './icons/APIIcon';
import { LogicIcon } from './icons/LogicIcon';
import { SystemCommandIcon } from './icons/SystemCommandIcon';
import { GoogleTrendsIcon } from './icons/GoogleTrendsIcon';
import { SelfCorrectionIcon } from './icons/SelfCorrectionIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { SearchIcon } from './icons/SearchIcon';
import { useTranslation } from '../i18n/useTranslation';
import { XIcon } from './icons/XIcon';
import { PinterestIcon } from './icons/PinterestIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { TradingBotIcon } from './icons/TradingBotIcon';
import { useSystem } from '../contexts/SystemContext';
import { PlusIcon } from './icons/PlusIcon';

const getServiceIcon = (service: string): React.ReactNode => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('gemini')) return <GeminiIcon />;
    if (serviceLower.includes('youtube')) return <YouTubeIcon />;
    if (serviceLower.includes('tiktok')) return <TikTokIcon />;
    if (serviceLower.includes('instagram')) return <InstagramIcon />;
    if (serviceLower.includes('x')) return <XIcon className="h-5 w-5" />;
    if (serviceLower.includes('pinterest')) return <PinterestIcon className="h-5 w-5" />;
    if (serviceLower.includes('linkedin')) return <LinkedInIcon className="h-5 w-5" />;
    if (serviceLower.includes('google sheets')) return <GoogleSheetsIcon />;
    if (serviceLower.includes('google drive')) return <GoogleDriveIcon />;
    if (serviceLower.includes('google trends')) return <GoogleTrendsIcon />;
    if (serviceLower.includes('market data')) return <GoogleTrendsIcon />;
    if (serviceLower.includes('trading bot')) return <TradingBotIcon />;
    if (serviceLower.includes('api')) return <APIIcon />;
    if (serviceLower.includes('logic')) return <LogicIcon />;
    if (serviceLower.includes('system command')) return <SystemCommandIcon />;
    if (serviceLower.includes('self-correction')) return <SelfCorrectionIcon />;
    return <ServiceIcon />;
};

const FlowStepCard: React.FC<{ step: FlowStep }> = ({ step }) => {
    const { t } = useTranslation();
    const typeColor = {
        [FlowStepType.Input]: 'border-l-blue-400',
        [FlowStepType.Processing]: 'border-l-purple-400',
        [FlowStepType.Output]: 'border-l-green-400',
        [FlowStepType.Service]: 'border-l-yellow-400',
    };

    return (
        <div className={`bg-gray-800/50 p-2.5 rounded-md border-l-4 ${typeColor[step.type]} flex items-center gap-3`}>
            <div className="flex-shrink-0 text-gray-400">{getServiceIcon(step.service)}</div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">{t(step.nameKey)}</p>
                <p className="text-xs text-gray-400">{step.service} ({step.type})</p>
            </div>
        </div>
    );
};

const AutomationFlowCard: React.FC<{ flow: AutomationFlow }> = ({ flow }) => {
    const { t } = useTranslation();
    const { toggleAutomationFlowStatus } = useSystem();
    const isUserCreated = !flow.nameKey.startsWith('automations.');

    const statusText = flow.status === 'Active' ? t('automation.statusActive') : t('automation.statusInactive');
    const statusColor = flow.status === 'Active' ? 'text-green-400' : 'text-yellow-400';
    const flowName = isUserCreated ? flow.nameKey : t(flow.nameKey);
    const flowDescription = isUserCreated ? flow.descriptionKey : t(flow.descriptionKey);


    return (
        <div className="hud-border p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-cyan-300">{flowName}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${statusColor}`}>{statusText}</p>
                </div>
                {/* Toggle Switch */}
                <label htmlFor={`toggle-${flow.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id={`toggle-${flow.id}`} 
                            className="sr-only" 
                            checked={flow.status === 'Active'}
                            onChange={() => toggleAutomationFlowStatus(flow.id)}
                            // User-created flows are not part of the global state, so their toggle is disabled
                            disabled={isUserCreated} 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${flow.status === 'Active' ? 'bg-purple-600' : 'bg-gray-600'} ${isUserCreated ? 'opacity-50' : ''}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${flow.status === 'Active' ? 'translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{flowDescription}</p>
            <div className="space-y-2">
                {flow.steps.map(step => <FlowStepCard key={step.id} step={step} />)}
            </div>
        </div>
    );
};


export const Automation: React.FC = () => {
    const { t } = useTranslation();
    const { automationFlows } = useSystem();
    const [userFlows, setUserFlows] = useState<AutomationFlow[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreateFlow = (flowData: { name: string; description: string; steps: FlowStep[] }) => {
        const newFlow: AutomationFlow = {
            id: `flow-${Date.now()}`,
            status: 'Inactive',
            nameKey: flowData.name,
            descriptionKey: flowData.description,
            steps: flowData.steps
        };
        setUserFlows(prevFlows => [newFlow, ...prevFlows]);
        setIsModalOpen(false);
    };

    const allFlows = useMemo(() => [...userFlows, ...automationFlows], [userFlows, automationFlows]);

    const filteredFlows = useMemo(() => {
        if (!searchTerm) return allFlows;
        const lowercasedFilter = searchTerm.toLowerCase();
        return allFlows.filter(flow =>
            (flow.nameKey.startsWith('automations.') ? t(flow.nameKey) : flow.nameKey).toLowerCase().includes(lowercasedFilter) ||
            (flow.descriptionKey.startsWith('automations.') ? t(flow.descriptionKey) : flow.descriptionKey).toLowerCase().includes(lowercasedFilter)
        );
    }, [allFlows, searchTerm, t]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold">{t('automation.title')}</h2>
                <div className="w-full md:w-auto flex items-center gap-4">
                     <div className="relative w-full md:w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-500" />
                        </span>
                        <input
                            type="text"
                            placeholder={t('automation.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all flex-shrink-0"
                    >
                        {t('automation.createButton')}
                    </button>
                </div>
            </header>
            <div className="flex-grow overflow-y-auto pr-2">
                 {filteredFlows.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {filteredFlows.map(flow => <AutomationFlowCard key={flow.id} flow={flow} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-semibold mb-4">{t('automation.noFlows')}</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all flex items-center gap-2 animate-pulse-glow"
                        >
                            <PlusIcon />
                            {t('automation.createButton')}
                        </button>
                    </div>
                )}
            </div>
            <CreateFlowModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateFlow}
            />
        </div>
    );
};