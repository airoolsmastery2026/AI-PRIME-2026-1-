import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface AccountCardProps {
    platform: string;
    icon: React.ReactNode;
    isConnected: boolean;
    username?: string;
    onManage: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ platform, icon, isConnected, username, onManage }) => {
    const { t } = useTranslation();
    
    return (
        <div className="hud-border p-4 flex flex-col justify-between transition-all hover:border-cyan-400/50">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    {icon}
                    <h4 className="font-bold text-lg capitalize">{platform}</h4>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-gray-900 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-semibold ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                        {isConnected ? t('accounts.statusConnected') : t('accounts.statusNotConnected')}
                    </span>
                </div>
                {isConnected && username && (
                    <p className="text-xs text-gray-400 bg-black/30 py-1 px-2 rounded-md inline-block">
                        {username}
                    </p>
                )}
            </div>
            <button 
                onClick={onManage} 
                className="w-full mt-4 bg-purple-600/80 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
            >
                {t('accounts.manageButton')}
            </button>
        </div>
    );
};
