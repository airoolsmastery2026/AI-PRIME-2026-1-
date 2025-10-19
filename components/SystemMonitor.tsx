import React, { useState, useMemo, useEffect } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useTranslation } from '../i18n/useTranslation';
import { JobStatus, ProductionJob } from '../types';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { CopyIcon } from './icons/CopyIcon';

const JobProgressBar: React.FC<{ status: JobStatus, progress: number }> = ({ status, progress }) => {
    const getStatusColor = () => {
        switch(status) {
            case 'Queued': return 'bg-yellow-500';
            case 'Generating': return 'bg-purple-500 animate-pulse';
            case 'Published': return 'bg-green-500';
            case 'Failed': return 'bg-red-500';
            case 'Scheduled': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    }
    return (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className={`${getStatusColor()} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </div>
    );
};

const StatusIndicator: React.FC<{ label: string; value: string | number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-gray-400">{label}:</span>
        <span className={`${colorClass} font-semibold`}>{value}</span>
    </div>
);

export const SystemMonitor: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { videoJobs } = useSystem();
    const { t } = useTranslation();
    const [selectedPreview, setSelectedPreview] = useState<ProductionJob | null>(null);

    const activeJobs = useMemo(() => 
        videoJobs.filter(j => j.status === JobStatus.Queued || j.status === JobStatus.Generating)
        .sort((a, b) => (a.id > b.id ? -1 : 1)),
    [videoJobs]);

    const completedJobs = useMemo(() => 
        videoJobs.filter(j => j.status === JobStatus.Published || j.status === JobStatus.Failed)
        .sort((a, b) => (a.id > b.id ? -1 : 1)),
    [videoJobs]);
    
    useEffect(() => {
        const isCurrentPreviewValid = selectedPreview && completedJobs.some(j => j.id === selectedPreview.id);
        if (!isCurrentPreviewValid) {
            const firstPublished = completedJobs.find(j => j.status === JobStatus.Published);
            setSelectedPreview(firstPublished || null);
        }
    }, [completedJobs, selectedPreview]);

    const systemStatus = useMemo(() => {
        if (activeJobs.length > 0) return { text: "Processing", color: "text-purple-400 animate-pulse" };
        if (videoJobs.some(j => j.status === JobStatus.Failed)) return { text: "Warning", color: "text-red-400" };
        return { text: "Nominal", color: "text-green-400" };
    }, [activeJobs, videoJobs]);

    const handleCopy = (text: string) => navigator.clipboard.writeText(text);

    const animationClasses = isOpen ? 'animate-[fadeInUp_0.5s_ease-out]' : 'hidden';

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-30 bg-gray-900/90 backdrop-blur-md border-t border-gray-700/50 transition-all duration-500 ease-in-out ${isOpen ? 'h-3/4' : 'h-12'}`}>
            <div className="h-12 flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <StatusIndicator label="System Status" value={systemStatus.text} colorClass={systemStatus.color} />
                    <StatusIndicator label="Active Jobs" value={activeJobs.length} colorClass="text-cyan-300" />
                    <StatusIndicator label="Completed" value={completedJobs.length} colorClass="text-cyan-300" />
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white p-2" aria-expanded={isOpen} aria-controls="system-monitor-panel">
                    {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
                </button>
            </div>

            <div id="system-monitor-panel" className={`h-[calc(100%-3rem)] p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden ${animationClasses}`}>
                <div className="hud-border p-3 flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-cyan-300 mb-3 flex-shrink-0">Active Processes ({activeJobs.length})</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                        {activeJobs.map(job => (
                            <div key={job.id} className="bg-gray-800/50 p-2.5 rounded-md">
                                <p className="font-semibold text-sm truncate" title={job.prompt}>{job.prompt}</p>
                                <p className="text-xs text-purple-300 mt-1 animate-pulse">{t(job.statusMessageKey || `aiVideo.status${job.status}`)}</p>
                                <JobProgressBar status={job.status} progress={job.progress} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 hud-border p-3 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3 flex-shrink-0">Completed Log ({completedJobs.length})</h3>
                        <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
                            {completedJobs.map(job => (
                                <button key={job.id} onClick={() => setSelectedPreview(job)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedPreview?.id === job.id ? 'bg-purple-600/50' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className={`truncate ${job.status === JobStatus.Failed ? 'text-red-400' : ''}`} title={job.prompt}>{job.prompt}</p>
                                        {job.platform && <div className="flex-shrink-0 ml-2">{getPlatformIcon(job.platform)}</div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3 flex-shrink-0">Result Preview</h3>
                        {selectedPreview ? (
                            <div className="flex-grow flex flex-col bg-black/30 rounded-lg overflow-hidden">
                                {selectedPreview.status === JobStatus.Published && selectedPreview.videoUrl ? (
                                    <video src={selectedPreview.videoUrl} controls autoPlay loop muted className="w-full aspect-video bg-black" />
                                ) : (
                                    <div className="w-full aspect-video bg-black flex items-center justify-center text-center p-4">
                                        <p className="text-red-400 font-semibold">Job Failed</p>
                                        <p className="text-xs text-red-300">{t(selectedPreview.statusMessageKey || 'errors.generic')}</p>
                                    </div>
                                )}
                                {selectedPreview.postPackage && (
                                     <div className="p-2 overflow-y-auto text-xs space-y-1">
                                        <p className="font-bold text-purple-300">Title:</p>
                                        <p className="text-gray-300 bg-gray-900/50 p-1 rounded font-mono flex items-center">{selectedPreview.postPackage.title} <button onClick={() => handleCopy(selectedPreview.postPackage!.title)} className="ml-auto p-1"><CopyIcon className="w-3 h-3"/></button></p>
                                        <p className="font-bold text-purple-300">Description:</p>
                                        <p className="text-gray-300 bg-gray-900/50 p-1 rounded font-mono flex items-center">{selectedPreview.postPackage.description} <button onClick={() => handleCopy(selectedPreview.postPackage!.description)} className="ml-auto p-1"><CopyIcon className="w-3 h-3"/></button></p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-gray-500 bg-black/30 rounded-lg">
                                <p>Select a completed job to preview.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};