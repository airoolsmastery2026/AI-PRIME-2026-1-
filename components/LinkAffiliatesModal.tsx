import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { SocialAccount, generalAffiliatePlatforms, cryptoAffiliatePlatforms, SocialPlatform } from '../types';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { CloseIcon } from './icons/CloseIcon';

type EditableAccount = SocialAccount & { platform: SocialPlatform };

interface LinkAffiliatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: EditableAccount;
    onSave: (linkedPlatforms: string[]) => void;
}

export const LinkAffiliatesModal: React.FC<LinkAffiliatesModalProps> = ({ isOpen, onClose, account, onSave }) => {
    const { t } = useTranslation();
    const { credentials } = useSystem();
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(account.linkedAffiliatePlatforms || []);

    const availableAffiliatePlatforms = useMemo(() => {
        const available: string[] = [];
        const allAffiliatePlatforms = [...generalAffiliatePlatforms, ...cryptoAffiliatePlatforms];
        allAffiliatePlatforms.forEach(platform => {
            if (credentials[platform] && credentials[platform]!.length > 0) {
                available.push(platform);
            }
        });
        return available;
    }, [credentials]);

    const handleTogglePlatform = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSave = () => {
        onSave(selectedPlatforms);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={onClose}>
            <div className="hud-border w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-300">{t('accounts.linker.linkAffiliatesTitle', { username: account.username })}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {availableAffiliatePlatforms.length > 0 ? (
                        availableAffiliatePlatforms.map(platform => (
                            <label key={platform} htmlFor={`link-${platform}`} className="flex items-center p-3 bg-gray-800/50 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    id={`link-${platform}`}
                                    checked={selectedPlatforms.includes(platform)}
                                    onChange={() => handleTogglePlatform(platform)}
                                    className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                />
                                <div className="ml-4 flex items-center gap-2">
                                    {getPlatformIcon(platform)}
                                    <span className="font-semibold capitalize">{platform}</span>
                                </div>
                            </label>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-8">{t('accounts.linker.noAffiliates')}</p>
                    )}
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-all">
                        {t('accounts.linker.saveLinks')}
                    </button>
                </footer>
            </div>
        </div>
    );
};