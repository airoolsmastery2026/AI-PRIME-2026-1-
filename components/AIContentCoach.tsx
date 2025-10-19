import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { CopyIcon } from './icons/CopyIcon';

const CoachSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="hud-border p-6 mb-6 animate-[fadeInUp_0.5s_ease-out]">
        <h3 className="text-2xl font-bold text-cyan-300 mb-4">{title}</h3>
        <div className="space-y-4 text-gray-300">{children}</div>
    </div>
);

const TrainingCommandBlock: React.FC<{ command: string; title: string }> = ({ command, title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div>
            <h4 className="text-xl font-semibold text-purple-300 mb-3">{title}</h4>
            <div className="bg-black/50 p-4 rounded-md relative border border-gray-700">
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 py-1 px-3 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors text-xs flex items-center gap-1"
                    aria-label="Copy command"
                >
                    <CopyIcon className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="text-sm whitespace-pre-wrap font-mono text-yellow-200 pr-16">
                    <code>{command}</code>
                </pre>
            </div>
        </div>
    );
};

export const AIContentCoach: React.FC = () => {
    const { t } = useTranslation();
    const [configFileMessage, setConfigFileMessage] = useState('');

    const handleGenerateConfig = () => {
        setConfigFileMessage(t('aiContentCoach.cta.response'));
    };
    
    // Arrays to map over for tables, assuming a fixed number of items from translations
    const workflowStagesIndices = [0, 1, 2, 3, 4, 5];
    const agentModelsIndices = [0, 1, 2, 3, 4];

    return (
        <div className="h-full flex flex-col">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <header className="text-center mb-8">
                <h2 className="text-4xl font-bold text-cyan-300">{t('aiContentCoach.title')}</h2>
                <p className="text-gray-400 max-w-3xl mx-auto mt-2">{t('aiContentCoach.description')}</p>
            </header>
            <div className="flex-grow overflow-y-auto pr-2">
                
                <CoachSection title={t('aiContentCoach.vision.title')}>
                    <p className="font-semibold text-lg">{t('aiContentCoach.vision.subtitle')}</p>
                    <p>{t('aiContentCoach.vision.description')}</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>{t('aiContentCoach.vision.point1')}</li>
                        <li>{t('aiContentCoach.vision.point2')}</li>
                        <li>{t('aiContentCoach.vision.point3')}</li>
                        <li>{t('aiContentCoach.vision.point4')}</li>
                    </ul>
                </CoachSection>

                <CoachSection title={t('aiContentCoach.strategy.title')}>
                    <div>
                        <h4 className="text-xl font-semibold text-purple-300 mb-3">{t('aiContentCoach.strategy.niche.title')}</h4>
                        <p>{t('aiContentCoach.strategy.niche.description')}</p>
                        <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                           <li><strong>{t('aiContentCoach.strategy.niche.contentNicheLabel')}:</strong> {t('aiContentCoach.strategy.niche.contentNicheValue')}</li>
                           <li><strong>{t('aiContentCoach.strategy.niche.revenueSourcesLabel')}:</strong> {t('aiContentCoach.strategy.niche.revenueSourcesValue')}</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-purple-300 mb-3">{t('aiContentCoach.strategy.workflow.title')}</h4>
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-purple-300 uppercase bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">{t('aiContentCoach.strategy.workflow.headers.stage')}</th>
                                        <th scope="col" className="px-4 py-2">{t('aiContentCoach.strategy.workflow.headers.tools')}</th>
                                        <th scope="col" className="px-4 py-2">{t('aiContentCoach.strategy.workflow.headers.task')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workflowStagesIndices.map(i => (
                                        <tr key={i} className="border-b border-gray-700 hover:bg-gray-800/50">
                                            <td className="px-4 py-2 font-medium">{t(`aiContentCoach.strategy.workflow.stages.${i}.stage`)}</td>
                                            <td className="px-4 py-2">{t(`aiContentCoach.strategy.workflow.stages.${i}.tools`)}</td>
                                            <td className="px-4 py-2">{t(`aiContentCoach.strategy.workflow.stages.${i}.task`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CoachSection>

                <CoachSection title={t('aiContentCoach.training.title')}>
                    <TrainingCommandBlock
                        title={t('aiContentCoach.training.subtitle')}
                        command={t('aiContentCoach.training.command')}
                    />
                </CoachSection>

                 <CoachSection title={t('aiContentCoach.agentModels.title')}>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left">
                            <thead className="text-xs text-purple-300 uppercase bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-4 py-2">{t('aiContentCoach.agentModels.headers.name')}</th>
                                    <th scope="col" className="px-4 py-2">{t('aiContentCoach.agentModels.headers.role')}</th>
                                    <th scope="col" className="px-4 py-2">{t('aiContentCoach.agentModels.headers.tools')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentModelsIndices.map(i => (
                                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-800/50">
                                        <td className="px-4 py-2 font-medium">{t(`aiContentCoach.agentModels.agents.${i}.name`)}</td>
                                        <td className="px-4 py-2">{t(`aiContentCoach.agentModels.agents.${i}.role`)}</td>
                                        <td className="px-4 py-2">{t(`aiContentCoach.agentModels.agents.${i}.tools`)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CoachSection>

                <CoachSection title={t('aiContentCoach.cta.title')}>
                    <p>{t('aiContentCoach.cta.prompt')}</p>
                    <button
                        onClick={handleGenerateConfig}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                    >
                       {t('aiContentCoach.cta.button')}
                    </button>
                    {configFileMessage && (
                        <p className="mt-4 text-cyan-300 bg-black/30 p-3 rounded-md animate-[fadeInUp_0.5s_ease-out]">{configFileMessage}</p>
                    )}
                </CoachSection>
            </div>
        </div>
    );
};