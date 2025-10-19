import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { testGeminiConnection } from '../services/geminiService';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

type ApiStatus = 'testing' | 'valid' | 'invalid';

export const APISettings: React.FC = () => {
    const { t } = useTranslation();
    const [geminiStatus, setGeminiStatus] = useState<ApiStatus>('testing');

    useEffect(() => {
        const checkConnection = async () => {
            const isValid = await testGeminiConnection();
            setGeminiStatus(isValid ? 'valid' : 'invalid');
        };
        checkConnection();
    }, []);

    const StatusIndicator: React.FC<{ status: ApiStatus }> = ({ status }) => {
        const statusConfig = {
            testing: { text: t('accounts.statusTesting'), color: 'text-yellow-400' },
            valid: { text: t('accounts.statusValid'), color: 'text-green-400' },
            invalid: { text: t('accounts.statusInvalid'), color: 'text-red-400' },
        };
        const config = statusConfig[status];

        return (
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'valid' ? 'bg-green-400 animate-pulse' : status === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm font-semibold ${config.color}`}>{config.text}</span>
            </div>
        );
    };

    return (
        <div className="hud-border p-6 mt-8">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">{t('settings.apiManagement.title')}</h3>
            <div className="bg-gray-800/50 p-4 rounded-md border border-gray-700">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-purple-300">Google Gemini API</h4>
                    <StatusIndicator status={geminiStatus} />
                </div>
                <p className="text-sm text-gray-400 my-2">{t('settings.apiManagement.description')}</p>
                <a
                    href="https://vercel.com/docs/projects/environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-all text-sm"
                >
                    {t('settings.apiManagement.button')}
                    <ExternalLinkIcon className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};
