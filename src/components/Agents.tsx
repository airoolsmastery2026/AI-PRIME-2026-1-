import React, { useState, useEffect } from 'react';
import { ChannelAgent, AgentBlueprint, CompetitorIntel, AISuggestion, StrategicDirective } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { AddChannelModal } from './AddChannelModal';
import { generateAgentBlueprint, performCompetitorRecon } from '../services/geminiService';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { IntelReportModal } from './IntelReportModal';
import { AIUtilityModal } from './AIUtilityModal';
import { UtilityTask } from '../services/geminiService';
import { AISuggestions } from './AISuggestions';
import { IntelIcon } from './icons/IntelIcon';
import { ArchitectIcon } from './icons/ArchitectIcon';
import { EconomistIcon } from './icons/EconomistIcon';
import { DetectiveIcon } from './icons/DetectiveIcon';
import { LawyerIcon } from './icons/LawyerIcon';
import { CreatorIcon } from './icons/CreatorIcon';
import { useSystem } from '../contexts/SystemContext';
import { FolderArrowDownIcon } from './icons/FolderArrowDownIcon';

const AgentCard: React.FC<{ agent: ChannelAgent; onSelect: () => void; isSelected: boolean }> = ({ agent, onSelect, isSelected }) => {
    const { t } = useTranslation();
    const statusColor = {
        Active: 'text-green-400',
        Idle: 'text-yellow-400',
        Error: 'text-red-400',
    };

    return (
        <button
            onClick={onSelect}
            className={`hud-border p-3 text-left w-full transition-all duration-300 ${isSelected ? 'border-cyan-400/80 bg-gray-800/50' : 'hover:border-cyan-400/50'}`}
        >
            <div className="flex items-start gap-3">
                {getPlatformIcon(agent.platform)}
                <div className="flex-grow min-w-0"> {/* Wrapper for truncation context */}
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-cyan-300 truncate" title={agent.name}>{agent.name}</h3>
                        <span className={`text-xs font-semibold ${statusColor[agent.agentStatus]}`}>
                            {agent.agentStatus}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">{agent.topic}</p>
                    <p className="text-xs text-yellow-300/80 mt-1 truncate" title={agent.activeDirective}>
                        {agent.activeDirective}
                    </p>
                </div>
            </div>
        </button>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-3 rounded-md">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <h4 className="font-bold text-sm text-purple-300">{title}</h4>
        </div>
        {children}
    </div>
);

const BlueprintProgressDisplay: React.FC<{ stepKey: string }> = ({ stepKey }) => {
    const { t } = useTranslation();
    const steps = [
        'agents.blueprint.thinking.step1',
        'agents.blueprint.thinking.step2',
        'agents.blueprint.thinking.step3',
    ];
    const currentIndex = steps.indexOf(stepKey);

    return (
        <div className="space-y-3 p-4">
            {steps.map((key, index) => {
                const isComplete = index < currentIndex;
                const isActive = index === currentIndex;
                return (
                    <div key={key} className={`flex items-center gap-3 p-2 rounded-md transition-all duration-500 ${isActive ? 'bg-purple-600/30' : 'bg-gray-800/50'}`}>
                        <div className={`transition-colors ${isComplete || isActive ? 'text-cyan-300' : 'text-gray-500'}`}>
                            {isComplete ? <span className="w-4 h-4 text-center">✓</span> : <div className={`w-4 h-4 border-2 rounded-full ${isActive ? 'border-cyan-300 animate-spin' : 'border-gray-500'}`}></div>}
                        </div>
                        <p className={`font-semibold text-sm transition-colors ${isComplete || isActive ? 'text-white' : 'text-gray-400'}`}>{t(key)}</p>
                    </div>
                );
            })}
        </div>
    );
};

const BlueprintDisplay: React.FC<{ blueprint: AgentBlueprint }> = ({ blueprint }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 text-xs text-gray-300">
            <InfoCard icon={<EconomistIcon className="w-4 h-4" />} title={t('agents.blueprint.market.title')}>
                <p><strong>{t('agents.blueprint.market.rpm')}:</strong> {blueprint.marketAnalysis?.estimatedRPM}</p>
                <p><strong>{t('agents.blueprint.market.cpm')}:</strong> {blueprint.marketAnalysis?.estimatedCPM}</p>
                <p><strong>{t('agents.blueprint.market.potential')}:</strong> {blueprint.marketAnalysis?.growthPotential}</p>
            </InfoCard>
            <InfoCard icon={<DetectiveIcon className="w-4 h-4" />} title={t('agents.blueprint.competitor.title')}>
                {blueprint.competitorIntel?.archetypes.map(a => <p key={a.name}><strong>{a.name}:</strong> {a.strategy}</p>)}
                <p className="mt-1 text-yellow-300"><strong>{t('agents.blueprint.competitor.weakness')}:</strong> {blueprint.competitorIntel?.keyWeakness}</p>
            </InfoCard>
            <InfoCard icon={<LawyerIcon className="w-4 h-4" />} title={t('agents.blueprint.risk.title')}>
                <p>{blueprint.riskAssessment?.summary}</p>
            </InfoCard>
             <InfoCard icon={<CreatorIcon className="w-4 h-4" />} title={t('agents.blueprint.content.title')}>
                <p><strong>{t('agents.blueprint.content.pillar')}:</strong> {blueprint.contentStrategy?.pillarContentIdeas.join(', ')}</p>
                <p><strong>{t('agents.blueprint.content.shorts')}:</strong> {blueprint.contentStrategy?.viralShortsIdeas.join(', ')}</p>
            </InfoCard>
        </div>
    );
};

const DirectivesQueue: React.FC<{ onAssign: (directive: StrategicDirective) => void }> = ({ onAssign }) => {
    const { directives } = useSystem();

    if (directives.length === 0) {
        return null;
    }

    return (
        <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded-md animate-[fadeIn_0.5s_ease-in-out] mb-4">
            <h4 className="text-xs font-bold uppercase text-yellow-300 mb-2">Pending Directives</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {directives.map((dir, i) => (
                    <div key={i} className="bg-gray-800/50 p-2 rounded-md">
                        <p className="text-xs text-yellow-200">{dir.directive}</p>
                        <button 
                            onClick={() => onAssign(dir)}
                            className="w-full text-xs mt-2 bg-yellow-500/50 hover:bg-yellow-400/50 text-white font-semibold py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-2">
                            <FolderArrowDownIcon className="w-4 h-4" />
                            Assign to Current Agent
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Agents: React.FC = () => {
    const { t, language } = useTranslation();
    const { agents, addAgent, updateAgent, addDirective, directives, removeDirective } = useSystem();
    const [selectedAgent, setSelectedAgent] = useState<ChannelAgent | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<AgentBlueprint | null>(null);
    const [blueprintStep, setBlueprintStep] = useState<string | null>(null);
    const [intel, setIntel] = useState<CompetitorIntel | null>(null);
    const [isIntelModalOpen, setIsIntelModalOpen] = useState(false);
    const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
    const [activeUtility, setActiveUtility] = useState<UtilityTask | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedChannelKey, setSelectedChannelKey] = useState('');

    const suggestions: AISuggestion[] = [
        { id: 'sug1', type: 'seo', titleKey: 'agents.suggestions.seo.title', descriptionKey: 'agents.suggestions.seo.desc'},
        { id: 'sug2', type: 'market', titleKey: 'agents.suggestions.market.title', descriptionKey: 'agents.suggestions.market.desc'},
        { id: 'sug3', type: 'content', titleKey: 'agents.suggestions.content.title', descriptionKey: 'agents.suggestions.content.desc'},
    ];

    useEffect(() => {
        if (selectedAgent) {
            setSelectedAgent(agents.find(a => a.id === selectedAgent.id) || null);
        } else if (agents.length > 0) {
            setSelectedAgent(agents[0]);
        } else {
            setSelectedAgent(null);
        }
    }, [agents]);

    const handleAddAgent = (channelData: Omit<ChannelAgent, 'id' | 'agentId' | 'agentStatus' | 'activeDirective' | 'intelReport'>) => {
        const newAgent: ChannelAgent = {
            id: `agent-${Date.now()}`,
            agentId: `AID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            agentStatus: 'Idle',
            activeDirective: 'Awaiting commands.',
            ...channelData,
        };
        addAgent(newAgent);
        setIsAddModalOpen(false);
        setSelectedCategory('');
        setSelectedChannelKey('');
    };

    const handleGenerateBlueprint = async () => {
        if (!selectedAgent) return;
        setIsLoading(true);
        setError(null);
        setBlueprint(null);
        setBlueprintStep(null);
        try {
            const bp = await generateAgentBlueprint(selectedAgent.topic, language, setBlueprintStep);
            setBlueprint(bp);
        } catch (err: any) {
            setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
            setBlueprintStep(null);
        }
    };

    const handleRecon = async () => {
        if (!selectedAgent) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await performCompetitorRecon(selectedAgent.topic, language);
            setIntel(result);
            setIsIntelModalOpen(true);
        } catch (err: any) {
            setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const openUtility = (task: UtilityTask) => {
        setActiveUtility(task);
        setIsUtilityModalOpen(true);
    };

    const handleExecuteSuggestion = (title: string) => {
        if (selectedAgent) {
            updateAgent({ ...selectedAgent, activeDirective: `Executing: ${title}` });
        }
    };

    const handleAssignDirective = (directive: StrategicDirective) => {
        if (!selectedAgent) {
            alert('Please select an agent first.');
            return;
        }
        const updatedAgent = { ...selectedAgent, agentStatus: 'Active' as const, activeDirective: directive.directive };
        updateAgent(updatedAgent);
        removeDirective(directive.directive);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{t('agents.title')}</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all"
                >
                    {t('agents.deployButton')}
                </button>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden">
                <div className="lg:col-span-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-3">{t('agents.roster')}</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                        {agents.length === 0 ? (
                             <div className="text-center text-gray-500 pt-10">
                                <p>No agents deployed.</p>
                            </div>
                        ) : (
                            agents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onSelect={() => setSelectedAgent(agent)}
                                    isSelected={selectedAgent?.id === agent.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 hud-border p-4 flex flex-col">
                    {selectedAgent ? (
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                            {/* Left: Agent Info & Controls */}
                            <div className="md:col-span-1 flex flex-col gap-4">
                               <div className="bg-black/30 p-3 rounded-md">
                                    <h3 className="text-xl font-bold text-cyan-300">{selectedAgent.name}</h3>
                                    <p className="text-xs font-mono text-gray-500">{selectedAgent.agentId}</p>
                                    <p className="text-sm mt-2">{t('agents.status')}: <span className="font-semibold">{selectedAgent.agentStatus}</span></p>
                                    <p className="text-sm">{t('agents.directive')}: <span className="text-yellow-300">{selectedAgent.activeDirective}</span></p>
                               </div>
                               <div className="bg-black/30 p-3 rounded-md flex-grow">
                                     <DirectivesQueue onAssign={handleAssignDirective} />
                                     <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">{t('agents.actions')}</h4>
                                     <div className="space-y-2">
                                         <button onClick={handleGenerateBlueprint} disabled={isLoading} className="w-full btn-action"><ArchitectIcon className="w-4 h-4"/>{t('agents.blueprintButton')}</button>
                                         <button onClick={handleRecon} disabled={isLoading} className="w-full btn-action"><IntelIcon className="w-4 h-4" />{t('agents.reconButton')}</button>
                                     </div>
                                      <h4 className="text-xs font-bold uppercase text-gray-400 mt-4 mb-2">{t('agents.utilities')}</h4>
                                      <div className="space-y-2">
                                          <button onClick={() => openUtility('summarizer')} className="w-full btn-utility">{t('agents.utilitySummarizer')}</button>
                                          <button onClick={() => openUtility('metadata')} className="w-full btn-utility">{t('agents.utilityMetadata')}</button>
                                          <button onClick={() => openUtility('thumbnail')} className="w-full btn-utility">{t('agents.utilityThumbnail')}</button>
                                          <button onClick={() => openUtility('shorts')} className="w-full btn-utility">{t('agents.utilityShorts')}</button>
                                      </div>
                               </div>
                            </div>
                            {/* Middle: Blueprint/Results */}
                            <div className="md:col-span-1 flex flex-col">
                                <h3 className="text-lg font-bold mb-3">{t('agents.intel')}</h3>
                                <div className="bg-black/30 p-3 rounded-md flex-grow overflow-y-auto">
                                    {isLoading && blueprintStep && <BlueprintProgressDisplay stepKey={blueprintStep} />}
                                    {error && <p className="text-red-400">{error}</p>}
                                    {blueprint && <BlueprintDisplay blueprint={blueprint} />}
                                    {!isLoading && !error && !blueprint && <p className="text-gray-500">{t('agents.noIntel')}</p>}
                                </div>
                            </div>
                            {/* Right: AI Suggestions */}
                            <div className="md:col-span-1 flex flex-col">
                                <AISuggestions suggestions={suggestions} onExecute={handleExecuteSuggestion} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>{t('agents.noAgentSelected')}</p>
                        </div>
                    )}
                </div>
            </div>

            <AddChannelModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddAgent}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedChannelKey={selectedChannelKey}
                setSelectedChannelKey={setSelectedChannelKey}
            />

            {intel && <IntelReportModal
                isOpen={isIntelModalOpen}
                onClose={() => setIsIntelModalOpen(false)}
                intel={intel}
                onExecute={(strategy) => {
                    addDirective({ directive: strategy, rationale: "From competitor counter-intelligence" });
                    setIsIntelModalOpen(false);
                }}
            />}
            
            <AIUtilityModal
                isOpen={isUtilityModalOpen}
                onClose={() => setIsUtilityModalOpen(false)}
                task={activeUtility}
                language={language}
            />

        </div>
    );
};