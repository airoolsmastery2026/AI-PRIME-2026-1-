import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';

declare const monaco: any;

export const CoreEditor: React.FC = () => {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const [code, setCode] = useState<string>('// Loading Core Logic...');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const editorInstance = useRef<any>(null);

    useEffect(() => {
        // Fetch the content of geminiService.ts to display in the editor
        fetch('/services/geminiService.ts')
            .then(response => response.text())
            .then(text => setCode(text))
            .catch(err => {
                console.error("Failed to fetch geminiService.ts", err);
                setCode('// Error loading core logic file. Please check the console.');
            });
    }, []);

    useEffect(() => {
        if (editorRef.current && typeof monaco !== 'undefined') {
            // Ensure monaco is loaded
            if (!editorInstance.current) {
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

                    // Update state when editor content changes
                    editorInstance.current.getModel().onDidChangeContent(() => {
                        setCode(editorInstance.current.getModel().getValue());
                    });
                });
            } else {
                 // If editor already exists, just update its value
                 if(editorInstance.current.getModel().getValue() !== code) {
                    editorInstance.current.getModel().setValue(code);
                 }
            }
        }
        
        return () => {
            // Dispose editor instance on component unmount
            if(editorInstance.current) {
                editorInstance.current.dispose();
                editorInstance.current = null;
            }
        };
    }, [code]); // Re-run effect if initial code changes

    const handleSave = () => {
        setIsSaving(true);
        console.log("--- SIMULATING SAVE & RECOMPILE ---");
        console.log(code);
        setTimeout(() => {
            setIsSaving(false);
            // In a real backend scenario, this would trigger a server-side process.
            // For now, it's a simulation to show functionality.
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