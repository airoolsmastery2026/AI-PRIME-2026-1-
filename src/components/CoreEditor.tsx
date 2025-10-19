import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import serviceCode from '../services/geminiService.ts?raw';

export const CoreEditor: React.FC = () => {
    const { t } = useTranslation();
    const [code, setCode] = useState<string>('// Loading Core Logic...');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        // The raw import is handled by Vite during build, so 'serviceCode' is a string.
        setCode(serviceCode);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        console.log("--- SIMULATING SAVE & RECOMPILE ---");
        console.log(code);
        setTimeout(() => {
            setIsSaving(false);
            // In a real backend scenario, this would trigger a server-side process.
            alert("Core logic saved. In a real backend environment, this would be recompiled and deployed.");
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="text-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold">{t('coreEditor.title')}</h2>
                <p className="text-gray-400 max-w-3xl mx-auto">{t('coreEditor.description')}</p>
            </header>
            <div className="hud-border flex-grow flex flex-col p-1">
                 <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-[#101014] text-gray-300 font-mono text-sm p-4 border-none focus:ring-0 focus:outline-none resize-none rounded-sm"
                 />
            </div>
            <div className="flex-shrink-0 mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-all disabled:opacity-50"
                >
                    {isSaving ? t('coreEditor.savingButton') : t('coreEditor.saveButton')}
                </button>
            </div>
        </div>
    );
};