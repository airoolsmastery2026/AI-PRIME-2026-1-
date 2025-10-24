import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { JobStatus, ProductionJob, PostPackage } from '../types';
import { generatePostPackage } from '../services/geminiService';
import { VideoIcon } from './icons/VideoIcon';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';
import { getPlatformIcon } from '../utils/getPlatformIcon';

const PostPackageDisplay: React.FC<{ postPackage: PostPackage }> = ({ postPackage }) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1500);
    };

    return (
        <div className="space-y-2 text-xs pt-2 mt-2 border-t border-gray-700/50">
            {(['title', 'description', 'tags'] as const).map(field => (
                <div key={field}>
                    <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-purple-300 capitalize">{field}</label>
                        {copiedField === field && <span className="text-cyan-300 text-xs">Copied!</span>}
                    </div>
                    <div className="flex items-start gap-2">
                        <textarea
                            readOnly
                            value={postPackage[field]}
                            rows={field === 'description' ? 4 : 2}
                            className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 font-mono text-gray-300 text-xs"
                        />
                        <button onClick={() => handleCopy(postPackage[field], field)} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md">
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const VideoCard: React.FC<{ job: ProductionJob, onSchedule: (jobId: string, day: string) => void }> = ({ job, onSchedule }) => {
    const { t, language } = useTranslation();
    const { updateVideoJob, removeVideoJob, credentials } = useSystem();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Monday');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleGeneratePackage = async () => {
        setIsLoading(true);
        try {
            const newPackage = await generatePostPackage(job.enhancedPrompt || job.prompt, job.platform, credentials, language);
            updateVideoJob({ ...job, postPackage: newPackage });
        } catch (error) {
            console.error("Failed to generate post package:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleScheduleClick = () => {
        onSchedule(job.id, selectedDay);
    };

    return (
        <div className={`hud-border p-3 relative transition-all duration-300 ${job.postPackage ? 'border-cyan-400/50' : ''}`}>
            <button 
                onClick={() => removeVideoJob(job.id)}
                aria-label="Delete job"
                className="absolute top-1 right-1 p-1 bg-red-800/50 hover:bg-red-700/80 rounded-full text-white z-10"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
            <div className="aspect-video bg-black rounded-md mb-2 flex items-center justify-center">
                {job.videoUrl ? (
                    <video src={job.videoUrl} controls loop className="w-full h-full rounded-md" />
                ) : (
                    <VideoIcon />
                )}
            </div>
            <div className="flex items-center justify-between">
                <p className="font-semibold text-sm truncate" title={job.prompt}>{job.prompt}</p>
                {job.platform && <div className="flex-shrink-0 ml-2">{getPlatformIcon(job.platform)}</div>}
            </div>
            
            {job.postPackage ? (
                <>
                    <PostPackageDisplay postPackage={job.postPackage} />
                    <div className="flex gap-2 mt-2">
                        <select 
                            value={selectedDay} 
                            onChange={(e) => setSelectedDay(e.target.value)} 
                            className="flex-grow w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                           {days.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                         <button onClick={handleScheduleClick} className="flex-shrink-0 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold py-2 px-3 rounded-md transition-colors text-xs">
                            {t('pilot.schedule')}
                        </button>
                    </div>
                </>
            ) : (
                <button onClick={handleGeneratePackage} disabled={isLoading} className="w-full mt-2 bg-purple-600/80 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-md transition-colors text-xs disabled:opacity-50">
                    {isLoading ? t('pilot.generatingPackage') : t('pilot.generatePackage')}
                </button>
            )}
        </div>
    );
};


export const Pilot: React.FC = () => {
    const { t } = useTranslation();
    const { videoJobs, updateVideoJob, removeVideoJob } = useSystem();
    
    const readyJobs = useMemo(() => videoJobs.filter(job => job.status === JobStatus.Published), [videoJobs]);
    const scheduledJobs = useMemo(() => videoJobs.filter(job => job.status === JobStatus.Scheduled), [videoJobs]);

    const handleSchedule = (jobId: string, day: string) => {
        const job = videoJobs.find(j => j.id === jobId);
        if (job) {
            updateVideoJob({ ...job, status: JobStatus.Scheduled, scheduledDay: day });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold">{t('pilot.title')}</h2>
                <p className="text-gray-400 text-sm max-w-2xl mx-auto">{t('pilot.description')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
                <div className="lg:col-span-1 hud-border p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-300 mb-3">{t('pilot.readyTitle')} ({readyJobs.length})</h3>
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                        {readyJobs.length > 0 ? (
                            readyJobs.map(job => <VideoCard key={job.id} job={job} onSchedule={handleSchedule} />)
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>{t('pilot.noReadyJobs')}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 hud-border p-4 flex flex-col">
                    <h3 className="text-lg font-bold text-cyan-300 mb-3">{t('pilot.scheduleTitle')}</h3>
                     <div className="flex-grow overflow-y-auto pr-2">
                        {scheduledJobs.length > 0 ? (
                             <div className="space-y-4">
                                {scheduledJobs.map(job => (
                                    <div key={job.id} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center gap-2">
                                         <div className="flex items-center gap-3 min-w-0">
                                            {job.platform && <div className="flex-shrink-0">{getPlatformIcon(job.platform)}</div>}
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{job.prompt}</p>
                                                <p className="text-xs text-green-400 font-bold uppercase">{t('pilot.statusScheduled')} for {job.scheduledDay}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeVideoJob(job.id)} aria-label="Delete scheduled job" className="p-2 bg-red-800/50 hover:bg-red-700/80 rounded-md text-white flex-shrink-0">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>{t('pilot.noScheduledJobs')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};