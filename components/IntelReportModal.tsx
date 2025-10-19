import React from 'react';
import { CompetitorIntel } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useTranslation } from '../i18n/useTranslation';

interface IntelReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    intel: CompetitorIntel;
    onExecute: (strategy: string) => void;
}

const CompetitorCard: React.FC<{ competitor: CompetitorIntel['competitors'][0] }> = ({ competitor }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-lg font-bold text-cyan-300">{competitor.channelName}</h4>
            <p className="text-xs font-mono text-gray-500 mb-2">{competitor.channelId}</p>

            <div className="mt-3">
                <h5 className="font-semibold text-purple-300 text-sm mb-1">{t('intelReportModal.strategyTitle')}</h5>
                <p className="text-xs text-gray-400">{competitor.contentStrategy}</p>
            </div>
            <div className="mt-3">
                <h5 className="font-semibold text-purple-300 text-sm mb-1">{t('intelReportModal.viralTitle')}</h5>
                <div className="bg-black/30 p-2 rounded-md">
                    <p className="text-xs font-semibold text-gray-200">"{competitor.viralHitExample.title}"</p>
                    <p className="text-xs text-gray-400 mt-1"><span className="font-bold">{t('intelReportModal.reason')}:</span> {competitor.viralHitExample.reasonForSuccess}</p>
                </div>
            </div>
        </div>
    );
};

export const IntelReportModal: React.FC<IntelReportModalProps> = ({ isOpen, intel, onClose, onExecute }) => {
    const { t } = useTranslation();

    if (!isOpen || !intel) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-red-400">{t('intelReportModal.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-cyan-300 mb-3">{t('intelReportModal.competitorsTitle')}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {intel.competitors.map(comp => <CompetitorCard key={comp.channelId} competitor={comp} />)}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">{t('intelReportModal.counterStrategyTitle')}</h3>
                         <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-yellow-200">{intel.counterStrategy}</p>
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end">
                    <button 
                        onClick={() => onExecute(intel.counterStrategy)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                    >
                        {t('intelReportModal.executeButton')}
                    </button>
                </footer>
            </div>
        </div>
    );
};