import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Credentials, socialPlatforms, TopicPipeline, ProductionJob, JobStatus } from '../types';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { useSystem } from '../contexts/SystemContext';
import { GenerateContentModal } from './GenerateContentModal';

const calculateTopicPipelines = (creds: Credentials): TopicPipeline[] => {
    const pipelines: Record<string, TopicPipeline> = {};

    socialPlatforms.forEach(platform => {
        const accounts = creds[platform];
        if (Array.isArray(accounts)) {
            accounts.forEach(account => {
                if (account && account.username && account.password && account.category) {
                    if (!pipelines[account.category]) {
                        pipelines[account.category] = {
                            topic: account.category,
                            channels: [],
                        };
                    }
                    pipelines[account.category].channels.push({ platform, username: account.username });
                }
            });
        }
    });

    return Object.values(pipelines).sort((a, b) => a.topic.localeCompare(b.topic));
};


export const ContentMatrix: React.FC = () => {
    const { t } = useTranslation();
    const { credentials, addVideoJobBatch } = useSystem();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState<TopicPipeline | null>(null);

    const topicPipelines = useMemo<TopicPipeline[]>(() => calculateTopicPipelines(credentials), [credentials]);

    const getAspectRatioForPlatform = (platform: string): '16:9' | '9:16' | '1:1' => {
        switch (platform.toLowerCase()) {
            case 'youtube':
            case 'linkedin':
            case 'x':
                return '16:9';
            case 'tiktok':
            case 'instagram': // Assumes Reels/Stories
                return '9:16';
            case 'facebook':
            case 'pinterest':
            default:
                return '1:1';
        }
    };

    const handleOpenGenerateModal = (pipeline: TopicPipeline) => {
        setSelectedPipeline(pipeline);
        setIsModalOpen(true);
    };

    const handleGenerateBatch = (prompt: string, _selectedPlatforms: string[]) => {
        if (!selectedPipeline) return;
        setIsLoading(true);
        setError(null);
        try {
            const channelsToProcess = selectedPipeline.channels;

            const newJobs: ProductionJob[] = channelsToProcess.map(channel => ({
                id: `job-${channel.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                prompt: prompt,
                aspectRatio: getAspectRatioForPlatform(channel.platform),
                platform: channel.platform,
                is8K: false,
                status: JobStatus.Queued,
                progress: 10,
            }));

            addVideoJobBatch(newJobs);
        } catch (err: any) {
            setError(t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold">{t('contentMatrix.title')}</h2>
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">{t('contentMatrix.description')}</p>
            </header>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-center">{error}</div>}

            <div className="flex-grow overflow-y-auto pr-2">
                {topicPipelines.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="font-bold">{t('contentMatrix.noPipelines')}</p>
                        <p>{t('contentMatrix.noPipelinesDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {topicPipelines.map(pipeline => (
                            <div key={pipeline.topic} className="hud-border p-4 flex flex-col">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">{pipeline.topic}</h3>
                                
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">{t('contentMatrix.connectedChannels')}</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {pipeline.channels.map(ch => (
                                            <div key={ch.platform} className="flex items-center gap-2 bg-gray-800/50 px-2 py-1 rounded">
                                                {getPlatformIcon(ch.platform)}
                                                <span className="text-xs">{ch.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-700/50">
                                     <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">{t('contentMatrix.pipelineControls')}</h4>
                                     <div className="flex flex-col sm:flex-row gap-2">
                                        <button 
                                            onClick={() => handleOpenGenerateModal(pipeline)}
                                            disabled={isLoading}
                                            className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isLoading ? t('contentMatrix.generating') : t('contentMatrix.generateAndDistribute')}
                                        </button>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && selectedPipeline && (
                <GenerateContentModal 
                    isOpen={isModalOpen}
                    pipeline={selectedPipeline}
                    onClose={() => setIsModalOpen(false)}
                    onGenerate={handleGenerateBatch}
                />
            )}
        </div>
    );
};