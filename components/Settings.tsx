import React, { useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { SystemBackup } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

export const Settings: React.FC = () => {
    const { t } = useTranslation();
    const { credentials, agents, videoJobs, directives, automationFlows, restoreBackup } = useSystem();
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const backupData: SystemBackup = {
            credentials,
            agents,
            videoJobs,
            directives,
            automationFlows,
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(backupData, null, 2)
        )}`;

        const link = document.createElement('a');
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `ai-prime-backup-${date}.json`;
        link.click();
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('File content is not text');
                const backupData: SystemBackup = JSON.parse(text);

                // Basic validation
                if (!backupData.credentials || !backupData.agents || !backupData.videoJobs || !backupData.directives || !backupData.automationFlows) {
                    throw new Error('Invalid backup file structure.');
                }
                
                if (window.confirm(t('settings.dataManagement.import.confirm'))) {
                    restoreBackup(backupData);
                    alert(t('settings.dataManagement.import.success'));
                    window.location.reload(); // Reload to ensure state is fresh everywhere
                }
            } catch (err) {
                console.error("Import Error:", err);
                alert(t('settings.dataManagement.import.error'));
            } finally {
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="text-center mb-8">
                <h2 className="text-4xl font-bold text-cyan-300">{t('settings.title')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mt-2">{t('settings.description')}</p>
            </header>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="max-w-3xl mx-auto">
                    <div className="hud-border p-6">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-4">{t('settings.dataManagement.title')}</h3>
                        
                        {/* Export Section */}
                        <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                            <h4 className="font-bold text-purple-300">{t('settings.dataManagement.export.title')}</h4>
                            <p className="text-sm text-gray-400 my-2">{t('settings.dataManagement.export.description')}</p>
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                {t('settings.dataManagement.export.button')}
                            </button>
                        </div>

                        {/* Import Section */}
                        <div className="mt-6 bg-gray-800/50 p-4 rounded-md border border-gray-700">
                             <h4 className="font-bold text-purple-300">{t('settings.dataManagement.import.title')}</h4>
                             <p className="text-sm text-gray-400 my-2">{t('settings.dataManagement.import.description')}</p>
                             <input
                                type="file"
                                accept=".json"
                                ref={importInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                             />
                             <button
                                onClick={handleImportClick}
                                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition-all"
                            >
                                <UploadIcon className="w-5 h-5" />
                                {t('settings.dataManagement.import.button')}
                            </button>
                             <p className="text-xs text-red-400 mt-3 font-semibold">{t('settings.dataManagement.import.warning')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
