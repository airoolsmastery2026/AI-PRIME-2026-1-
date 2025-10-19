import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ProductionJob, JobStatus } from '../types';
import { useSystem } from '../contexts/SystemContext';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { AIVideoCharacterCreator } from './AIVideoCharacterCreator';
import { VideoIcon } from './icons/VideoIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CogIcon } from './icons/CogIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { CalendarIcon } from './icons/CalendarIcon';

const JobProgressBar: React.FC<{ status: JobStatus; progress: number; statusMessageKey?: string }> = ({ status, progress, statusMessageKey }) => {
    const { t } = useTranslation();
    const getStatusColor = () => {
        switch(status) {
            case 'Queued': return 'bg-yellow-500';
            case 'Generating': return 'bg-purple-500 animate-pulse';
            case 'Published': return 'bg-green-500';
            case 'Failed': return 'bg-red-500';
            case 'Scheduled': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    if (status !== JobStatus.Generating) {
        return (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div className={`${getStatusColor()} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
            </div>
        );
    }
    
    // Visually represents the backend steps for a better user experience.
    const steps = [
        { key: 'aiVideo.generating.enhancing', progress: 50, labelKey: 'aiVideo.generating.enhancing' },
        { key: 'aiVideo.generating.rendering', progress: 100, labelKey: 'aiVideo.generating.rendering' }
    ];
    const currentStepIndex = steps.findIndex(s => s.key === statusMessageKey);
    const activeStep = currentStepIndex !== -1 ? currentStepIndex : 0;

    return (
        <div>
            {statusMessageKey && (
                <p className="text-xs text-purple-300 animate-pulse mt-1">{t(statusMessageKey)}</p>
            )}
            <div className="flex w-full gap-1 h-1.5 mt-1" role="progressbar" aria-valuenow={progress}>
                {steps.map((step, index) => {
                    let width = '0%';
                    const prevStepProgress = index > 0 ? steps[index - 1].progress : 0;
                    
                    if (index < activeStep) {
                        width = '100%';
                    } else if (index === activeStep) {
                        const currentStepMaxProgress = step.progress - prevStepProgress;
                        const progressInStep = progress - prevStepProgress;
                        width = `${Math.max(0, (progressInStep / currentStepMaxProgress) * 100)}%`;
                    }

                    return (
                        <div key={index} className="flex-1 bg-gray-700 rounded-full overflow-hidden">
                             <div className="bg-purple-500 h-full rounded-full" style={{ width }}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const getStatusIcon = (status: JobStatus) => {
    const className = "w-4 h-4 mr-1.5";
    switch(status) {
        case JobStatus.Queued: return <ClockIcon className={className} />;
        case JobStatus.Generating: return <CogIcon className={`${className} animate-spin`} />;
        case JobStatus.Published: return <CheckCircleIcon className={`${className} text-green-400`} />;
        case JobStatus.Failed: return <XCircleIcon className={`${className} text-red-400`} />;
        case JobStatus.Scheduled: return <CalendarIcon className={className} />;
        default: return null;
    }
};

const VideoGeneratorForm: React.FC = () => {
    const { t } = useTranslation();
    const { addVideoJob } = useSystem();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
    const [language, setLanguage] = useState<'en' | 'vi'>('en');
    const [is8K, setIs8K] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);

        const newJob: ProductionJob = {
            id: `job-direct-${Date.now()}`,
            prompt,
            aspectRatio,
            is8K,
            language,
            status: JobStatus.Queued,
            progress: 10,
        };

        addVideoJob(newJob);

        setPrompt('');
        setTimeout(() => setIsLoading(false), 500);
    };

    return (
        <div className="hud-border p-4 mb-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Generate Single Video</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-purple-300 mb-1">Video Prompt</label>
                    <textarea
                        id="video-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        placeholder="e.g., A cinematic shot of a robot exploring a futuristic city"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-purple-300 mb-1">Aspect Ratio</label>
                        <select
                            id="aspect-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        >
                            <option value="16:9">16:9 (YouTube)</option>
                            <option value="9:16">9:16 (Shorts/TikTok)</option>
                            <option value="1:1">1:1 (Social Post)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-purple-300 mb-1">Language</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        >
                            <option value="en">English</option>
                            <option value="vi">Vietnamese</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-center pt-6">
                        <label htmlFor="8k-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="8k-toggle" 
                                    className="sr-only" 
                                    checked={is8K}
                                    onChange={(e) => setIs8K(e.target.checked)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${is8K ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${is8K ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-medium">8K Quality</span>
                        </label>
                    </div>
                </div>
                 <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all disabled:bg-gray-600">
                    {isLoading ? "Queuing..." : "Add to Production Queue"}
                </button>
            </form>
        </div>
    );
}

const ProductionQueue: React.FC = () => {
    const { t } = useTranslation();
    const { videoJobs } = useSystem();
    const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);
    
    useEffect(() => {
        if (selectedJob) {
            const updatedSelectedJob = videoJobs.find(j => j.id === selectedJob.id);
            setSelectedJob(updatedSelectedJob || null);
        } else if (videoJobs.length > 0) {
            setSelectedJob(videoJobs[0]);
        } else {
            setSelectedJob(null);
        }
    }, [videoJobs, selectedJob?.id]);

    const handleDownload = () => {
        if (!selectedJob || !selectedJob.videoUrl) return;

        const link = document.createElement('a');
        link.href = selectedJob.videoUrl;
        const promptSnippet = selectedJob.prompt.slice(0, 20).replace(/\s+/g, '_').toLowerCase();
        link.download = `aiprime-video-${promptSnippet}-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col">
            <VideoGeneratorForm />
            <div className="hud-border p-6 flex-grow overflow-hidden mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
                    {/* Queue */}
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-cyan-300 mb-4 flex-shrink-0">{t('aiVideo.productionQueue')}</h3>
                         <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                            {videoJobs.length === 0 ? (
                                <div className="text-center text-gray-500 pt-10">
                                    {t('aiVideo.noJobsPlaceholder')}
                                </div>
                            ) : (
                                videoJobs.map(job => (
                                    <button
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`w-full text-left p-3 rounded-md transition-colors ${selectedJob?.id === job.id ? 'bg-purple-600/50' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold truncate flex-grow" title={job.prompt}>{job.prompt}</p>
                                            {job.platform && <div className="flex-shrink-0 ml-2">{getPlatformIcon(job.platform)}</div>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                                            {getStatusIcon(job.status)}
                                            {t(`aiVideo.status${job.status.replace(' ', '')}`)}
                                        </p>
                                        <JobProgressBar status={job.status} progress={job.progress} statusMessageKey={job.statusMessageKey} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Viewer */}
                    <div className="flex flex-col">
                         <h3 className="text-xl font-bold text-cyan-300 mb-4 flex-shrink-0">{t('aiVideo.jobDetails')}</h3>
                         {selectedJob ? (
                             <div className="flex-grow flex flex-col bg-black/30 rounded-lg overflow-hidden">
                                <div className="flex-shrink-0 aspect-video bg-black flex items-center justify-center">
                                     {selectedJob.status === 'Published' && selectedJob.videoUrl ? (
                                         <video src={selectedJob.videoUrl} controls autoPlay loop className="w-full h-full" />
                                     ) : (
                                         <div className="text-center text-gray-400 p-4">
                                             <div className={`w-16 h-16 border-4 border-dashed rounded-full mx-auto mb-4 ${selectedJob.status === 'Generating' ? 'border-purple-500 animate-spin' : 'border-gray-600'}`}></div>
                                             <p className="font-bold text-lg">{t(`aiVideo.status${selectedJob.status.replace(' ', '')}`)}</p>
                                             {(selectedJob.status === JobStatus.Generating || selectedJob.status === JobStatus.Failed) && selectedJob.statusMessageKey && (
                                                <p className={`text-sm mt-2 ${selectedJob.status === 'Generating' ? 'text-purple-300 animate-pulse' : 'text-red-400'}`}>
                                                    {t(selectedJob.statusMessageKey)}
                                                </p>
                                            )}
                                         </div>
                                     )}
                                 </div>
                                  <div className="p-3 overflow-y-auto text-xs space-y-2">
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 bg-gray-900/50 rounded mb-2">
                                        <div><p className="font-bold text-gray-400">Aspect</p><p className="font-mono">{selectedJob.aspectRatio}</p></div>
                                        <div><p className="font-bold text-gray-400">Quality</p><p className="font-mono">{selectedJob.is8K ? '8K' : 'HD'}</p></div>
                                        <div><p className="font-bold text-gray-400">Language</p><p className="font-mono uppercase">{selectedJob.language || 'en'}</p></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-purple-300">{t('aiVideo.originalInput')}</p>
                                        <p className="text-gray-300 bg-gray-900/50 p-1.5 rounded mt-1 font-mono">{selectedJob.prompt}</p>
                                    </div>
                                    {selectedJob.enhancedPrompt && (
                                        <div>
                                            <p className="font-bold text-cyan-300">{t('aiVideo.aiGeneratedPrompt')}</p>
                                            <p className="text-gray-300 bg-gray-900/50 p-1.5 rounded mt-1 font-mono">{selectedJob.enhancedPrompt}</p>
                                        </div>
                                    )}
                                    {selectedJob.statusMessageKey && (selectedJob.status === JobStatus.Generating || selectedJob.status === JobStatus.Failed) && (
                                        <div>
                                            <p className={`font-bold ${selectedJob.status === JobStatus.Failed ? 'text-red-300' : 'text-yellow-300'}`}>Status Message</p>
                                            <p className="text-gray-300 bg-gray-900/50 p-1.5 rounded mt-1 font-mono">{t(selectedJob.statusMessageKey)}</p>
                                        </div>
                                    )}
                                    {selectedJob.status === 'Published' && selectedJob.videoUrl && (
                                        <div className="mt-4">
                                            <button 
                                                onClick={handleDownload}
                                                className="w-full flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-all text-sm"
                                            >
                                                <DownloadIcon className="w-4 h-4" />
                                                {t('aiVideo.downloadVideo')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                             </div>
                         ) : (
                            <div className="flex-grow flex items-center justify-center text-gray-500 aspect-video bg-black/30 rounded-lg">
                                 <p>{t('aiVideo.noJobSelected')}</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AIVideo: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('queue');

    const tabs = [
        { id: 'queue', label: t('aiVideo.tabs.queue'), icon: <VideoIcon /> },
        { id: 'character', label: t('aiVideo.tabs.character'), icon: <UserCircleIcon /> }
    ];

    return (
        <div className="h-full overflow-hidden flex flex-col">
            <header className="text-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold">{t('aiVideo.title')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('aiVideo.description')}</p>
            </header>
            
            <div className="flex-shrink-0 flex justify-center border-b border-gray-700/50 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-cyan-300 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                    >
                        {/* FIX: Explicitly cast the icon to React.ReactElement<any> to satisfy TypeScript's strict checks for React.cloneElement, resolving the overload error. */}
                        {React.cloneElement(tab.icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'queue' && <ProductionQueue />}
            {activeTab === 'character' && <AIVideoCharacterCreator />}
        </div>
    );
};
