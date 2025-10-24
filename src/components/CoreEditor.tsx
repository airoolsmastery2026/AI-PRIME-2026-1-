import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import serviceCode from '../services/geminiService?raw';

declare const monaco: any;

export const CoreEditor: React.FC = () => {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const [code, setCode] = useState<string>(serviceCode);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const editorInstance = useRef<any>(null);

    useEffect(() => {
        if (editorRef.current && typeof monaco !== 'undefined' && !editorInstance.current) {
            (window as any).require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' }});
            (window as any).require(['vs/editor/editor.main'], () => {
                 editorInstance.current = monaco.editor.create(editorRef.current!, {
                    value: code,
                    language: 'typescript',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollbar: {
                       verticalScrollbarSize: 8,
                       horizontalScrollbarSize: 8,
                    },
                    background: '#101014'
                });

                editorInstance.current.getModel().onDidChangeContent(() => {
                    const editorValue = editorInstance.current.getModel().getValue();
                    if (editorValue !== code) {
                       setCode(editorValue);
                    }
                });
            });
        }
        
        return () => {
            if(editorInstance.current) {
                editorInstance.current.dispose();
                editorInstance.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleSave = () => {
        setIsSaving(true);
        console.log("--- SIMULATING SAVE & RECOMPILE ---");
        console.log(code);
        setTimeout(() => {
            setIsSaving(false);
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
                 <div ref={editorRef} className="w-full h-full"></div>
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
