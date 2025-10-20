import React, { useState, useEffect } from 'react';
import { PowerIcon } from './icons/PowerIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { XIcon } from './icons/XIcon';

type LoginProvider = 'google' | 'github' | 'x' | 'system';

interface QuantumCoreControlProps {
    onLogin: (provider: LoginProvider, remember: boolean) => void;
}

// Utils lưu/đọc từ localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const setToStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
};

export const QuantumCoreControl: React.FC<QuantumCoreControlProps> = ({ onLogin }) => {
    const [isLoggingIn, setIsLoggingIn] = useState<LoginProvider | null>(null);
    const [rememberMe, setRememberMe] = useState(true);
    const [lastUsedProvider, setLastUsedProvider] = useState<LoginProvider | null>(null);

    // Fake translation hook
    const t = (key: string) => {
        const dict: Record<string, string> = {
            'quantumCore.title': 'Quantum Core Access',
            'quantumCore.subtitle': 'Activate your AI system to continue',
            'quantumCore.rememberMe': 'Remember me',
            'quantumCore.activateWith': 'Or activate with',
            'quantumCore.statusActivate': 'Activate',
            'quantumCore.statusActivating': 'Activating...',
        };
        return dict[key] || key;
    };

    useEffect(() => {
        const remembered = getFromStorage<LoginProvider | null>('rememberedProvider', null);
        if (remembered) setLastUsedProvider(remembered);
    }, []);

    const handleLogin = (provider: LoginProvider) => {
        setIsLoggingIn(provider);
        setTimeout(() => {
            if (rememberMe) setToStorage('rememberedProvider', provider);
            onLogin(provider, rememberMe);
            setIsLoggingIn(null);
            setLastUsedProvider(provider);
        }, 1500);
    };

    const SocialButton: React.FC<{
        provider: 'google' | 'github' | 'x';
        title: string;
        children: React.ReactNode;
    }> = ({ provider, title, children }) => {
        const isLoading = isLoggingIn === provider;
        const isRemembered = lastUsedProvider === provider && !isLoggingIn;
        return (
            <button
                title={title}
                onClick={() => handleLogin(provider)}
                disabled={!!isLoggingIn}
                className={`p-3 bg-gray-800 rounded-full hover:bg-purple-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                    isRemembered ? 'ring-2 ring-cyan-400/80' : ''
                }`}
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    children
                )}
            </button>
        );
    };

    const isSystemActivating = isLoggingIn === 'system';
    const isSystemRemembered = lastUsedProvider === 'system' && !isLoggingIn;

    return (
        <div className="fixed inset-0 grid place-items-center bg-gray-900 z-10 p-4">
            <div className="flex flex-col items-center text-center">
                <h2 className="text-4xl font-bold text-cyan-300 mb-2">{t('quantumCore.title')}</h2>
                <p className="text-gray-400 mb-12">{t('quantumCore.subtitle')}</p>

                <button
                    onClick={() => handleLogin('system')}
                    disabled={!!isLoggingIn}
                    className={`relative group w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 disabled:cursor-not-allowed border-2 ${
                        isSystemActivating || isSystemRemembered
                            ? 'animate-pulse-glow border-cyan-400'
                            : 'border-gray-700/50 hover:border-cyan-400/50'
                    }`}
                >
                    <PowerIcon
                        className={`w-20 h-20 z-10 transition-colors duration-500 ${
                            isSystemActivating || isSystemRemembered
                                ? 'text-cyan-300'
                                : 'text-purple-600 group-hover:text-cyan-300'
                        }`}
                    />
                    <span
                        className={`absolute -bottom-10 text-lg font-semibold tracking-widest transition-colors ${
                            isSystemActivating || isSystemRemembered
                                ? 'text-cyan-300'
                                : 'text-purple-400 group-hover:text-cyan-300'
                        }`}
                    >
                        {isSystemActivating ? t('quantumCore.statusActivating') : t('quantumCore.statusActivate')}
                    </span>
                </button>

                <div className="flex items-center justify-center mt-16">
                    <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                        {t('quantumCore.rememberMe')}
                    </label>
                </div>

                <div className="mt-4 w-full max-w-xs">
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">{t('quantumCore.activateWith')}</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <SocialButton provider="google" title="Connect with Google (OAuth)">
                            <GoogleIcon className="w-6 h-6" />
                        </SocialButton>
                        <SocialButton provider="github" title="Connect with GitHub (OAuth)">
                            <GitHubIcon className="w-6 h-6" />
                        </SocialButton>
                        <SocialButton provider="x" title="Connect with X (OAuth)">
                            <XIcon className="w-6 h-6" />
                        </SocialButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantumCoreControl;
