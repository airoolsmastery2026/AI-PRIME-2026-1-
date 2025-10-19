import React, { useMemo } from 'react';
import { ChannelAgent, SocialAccount, socialPlatforms, SocialPlatform } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { getPlatformIcon } from '../utils/getPlatformIcon';

interface AddChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (channelData: Omit<ChannelAgent, 'id' | 'agentId' | 'agentStatus' | 'activeDirective' | 'intelReport'>) => void;
    selectedCategory: string; // These are no longer used for selection logic but kept to not break Agents.tsx state
    setSelectedCategory: (category: string) => void;
    selectedChannelKey: string;
    setSelectedChannelKey: (key: string) => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({ 
    isOpen, 
    onClose, 
    onAdd,
}) => {
    const { t } = useTranslation();
    const { credentials, agents } = useSystem();

    const deployedAccounts = useMemo(() => {
        return new Set(agents.map(agent => `${agent.platform}-${agent.name}`));
    }, [agents]);

    const availableAccountsByPlatform = useMemo(() => {
        const available: Record<string, SocialAccount[]> = {};
        socialPlatforms.forEach(platform => {
            const platformAccounts = credentials[platform];
            if (Array.isArray(platformAccounts)) {
                const undeployed = platformAccounts.filter(acc => 
                    !deployedAccounts.has(`${platform}-${acc.username}`) && acc.category && acc.country
                );
                if (undeployed.length > 0) {
                    available[platform] = undeployed;
                }
            }
        });
        return available;
    }, [credentials, deployedAccounts]);
    
    const hasAvailableAccounts = Object.keys(availableAccountsByPlatform).length > 0;

    const handleDeploy = (platform: SocialPlatform, account: SocialAccount) => {
        if (!account.country) {
            alert(t('addChannelModal.alertNoCountry'));
            return;
        }
        onAdd({
            platform: platform,
            name: account.username,
            topic: account.category,
            country: account.country
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                 <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-300">{t('addChannelModal.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    {!hasAvailableAccounts ? (
                        <div className="text-center text-gray-400 py-10">
                            <p>{t('addChannelModal.noAccountsAvailable')}</p>
                            <p className="text-sm">{t('addChannelModal.noAccountsHint')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(availableAccountsByPlatform).map(([platform, accounts]) => (
                                <div key={platform}>
                                    <h3 className="font-bold text-purple-300 capitalize flex items-center gap-2 mb-2">
                                        {getPlatformIcon(platform)} {platform}
                                    </h3>
                                    <div className="space-y-2">
                                        {Array.isArray(accounts) && accounts.map(account => (
                                            <div key={account.id} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{account.username}</p>
                                                    <p className="text-xs text-gray-400">{account.category} ({account.country})</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeploy(platform as SocialPlatform, account)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded-md transition-all text-sm"
                                                >
                                                    {t('addChannelModal.connectButton')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};