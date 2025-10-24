import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Chapter } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { FilmIcon } from './icons/FilmIcon';
import { TypeIcon } from './icons/TypeIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

const formatTime = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
};

interface AIVideoEditorProps {
    initialVideoSrc: string | null;
}

export const AIVideoEditor: React.FC<AIVideoEditorProps> = ({ initialVideoSrc }) => {
    const { t } = useTranslation();
    const [videoSrc, setVideoSrc] = useState<string | null>(initialVideoSrc);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [playbackRate, setPlaybackRate] = useState(1);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setVideoSrc(initialVideoSrc);
    }, [initialVideoSrc]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSrc(url);
            setChapters([]); // Reset chapters for new video
        }
    };

    const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rate = parseFloat(e.target.value);
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    const addChapter = () => {
        const title = prompt(t('aiVideo.editor.addChapterPrompt'));
        if (title && videoRef.current) {
            const newChapter: Chapter = { time: videoRef.current.currentTime, title };
            setChapters(prev => [...prev, newChapter].sort((a, b) => a.time - b.time));
        }
    };

    const seekTo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };
    
    const handleDevNotice = () => alert(t('aiVideo.editor.devNotice'));

    return (
        <div className="h-full overflow-hidden flex flex-col">
            {!videoSrc && (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                         <button
                            onClick={() => fileInputRef.current?.click()}
                            className="hud-border p-12 flex flex-col items-center justify-center gap-4 hover:border-cyan-400/50 hover:bg-gray-800/20 transition-all duration-300"
                        >
                            <UploadIcon className="w-16 h-16 text-cyan-300" />
                            <p className="text-xl font-bold">{t('aiVideo.editor.uploadPrompt')}</p>
                            <p className="text-sm text-gray-400">{t('aiVideo.editor.noVideo')}</p>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/*"
                            className="hidden"
                        />
                    </div>
                </div>
            )}
            {videoSrc && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
                    <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                        <div className="aspect-video bg-black rounded-lg">
                           <video ref={videoRef} key={videoSrc} src={videoSrc} controls className="w-full h-full rounded-lg" onRateChange={() => setPlaybackRate(videoRef.current?.playbackRate || 1)} />
                        </div>
                        <div className="hud-border p-3 flex-grow flex flex-col overflow-hidden">
                             <h3 className="text-lg font-bold text-cyan-300 mb-2 flex-shrink-0">{t('aiVideo.editor.chapters')}</h3>
                             <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                                {chapters.length === 0 && <p className="text-sm text-gray-500">No chapters added.</p>}
                                {chapters.map((chap, i) => (
                                    <button key={i} onClick={() => seekTo(chap.time)} className="w-full text-left flex items-center gap-3 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-md text-sm">
                                        <span className="font-mono text-cyan-300">{formatTime(chap.time)}</span>
                                        <span className="font-semibold">{chap.title}</span>
                                    </button>
                                ))}
                             </div>
                             <div className="mt-2 pt-2 border-t border-gray-700/50 flex-shrink-0 flex items-center gap-4">
                                <button onClick={addChapter} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">{t('aiVideo.editor.addChapter')}</button>
                                <div className="flex items-center gap-2">
                                     <label htmlFor="playback-rate" className="text-sm font-medium text-purple-300">{t('aiVideo.editor.playbackSpeed')}:</label>
                                     <select id="playback-rate" value={playbackRate} onChange={handlePlaybackRateChange} className="bg-gray-900/50 border border-gray-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                        <option value="0.5">0.5x</option>
                                        <option value="1">1x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 hud-border p-4 flex flex-col gap-4 overflow-y-auto">
                        <h3 className="text-lg font-bold text-cyan-300">{t('aiVideo.editor.title')}</h3>
                        
                        {/* Placeholder Editor Panels */}
                        <div className="space-y-3">
                            <button onClick={handleDevNotice} className="w-full btn-action"><MagicWandIcon className="w-4 h-4" /> {t('aiVideo.editor.effects')}</button>
                            <button onClick={handleDevNotice} className="w-full btn-action"><FilmIcon className="w-4 h-4" /> {t('aiVideo.editor.transitions')}</button>
                            <button onClick={handleDevNotice} className="w-full btn-action"><MusicNoteIcon className="w-4 h-4" /> {t('aiVideo.editor.music')}</button>
                            <button onClick={handleDevNotice} className="w-full btn-action"><TypeIcon className="w-4 h-4" /> {t('aiVideo.editor.text')}</button>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-700/50">
                             <label className="block text-sm font-medium text-purple-300 mb-1">{t('aiVideo.editor.aiPrompt')}</label>
                              <textarea rows={3} placeholder="e.g., 'Add a vintage film effect and cinematic music'" className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"/>
                             <button onClick={handleDevNotice} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-all text-sm">{t('aiVideo.editor.apply')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
