import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { SocialAccount, socialPlatforms, SocialPlatform } from '../types';
import { getPlatformIcon } from '../utils/getPlatformIcon';
import { CHANNEL_TOPICS } from '../data/topics';
import { CloseIcon } from './icons/CloseIcon';
import { COUNTRIES } from '../data/countries';
import { LinkAffiliatesModal } from './LinkAffiliatesModal';

type EditableAccount = SocialAccount & { platform: SocialPlatform };

interface AccountLinkerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AccountLinkerModal: React.FC<AccountLinkerModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { credentials, updateMultipleSocialAccounts } = useSystem();
    const [editableAccounts, setEditableAccounts] = useState<EditableAccount[]>([]);
    const [linkingAccount, setLinkingAccount] = useState<EditableAccount | null>(null);

    useEffect(() => {
        if (isOpen) {
            const allAccounts: EditableAccount[] = [];
            socialPlatforms.forEach(platform => {
                const platformAccounts = credentials[platform] || [];
                platformAccounts.forEach(acc => {
                    allAccounts.push({ ...acc, platform });
                });
            });
            setEditableAccounts(allAccounts);
        }
    }, [isOpen, credentials]);

    const handleFieldChange = (accountId: string, field: 'category' | 'country' | 'linkedAffiliatePlatforms', value: string | string[]) => {
        setEditableAccounts(prev => 
            prev.map(acc => 
                acc.id === accountId ? { ...acc, [field]: value } : acc
            )
        );
    };

    const handleSaveAndSync = () => {
        updateMultipleSocialAccounts(editableAccounts);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
                <div className="hud-border w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-cyan-300">{t('accounts.linkerTitle')}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <CloseIcon />
                        </button>
                    </header>

                    <div className="p-6 overflow-y-auto flex-grow">
                        <p className="text-sm text-gray-400 mb-4">{t('accounts.linkerDescription')}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-purple-300 uppercase bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">{t('accounts.linker.platformHeader')}</th>
                                        <th scope="col" className="px-4 py-2">{t('accounts.linker.usernameHeader')}</th>
                                        <th scope="col" className="px-4 py-2">{t('accounts.connector.topicLabel')}</th>
                                        <th scope="col" className="px-4 py-2">{t('accounts.connector.countryLabel')}</th>
                                        <th scope="col" className="px-4 py-2">{t('accounts.linker.linkedAffiliatesHeader')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableAccounts.length > 0 ? editableAccounts.map(acc => (
                                        <tr key={acc.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                            <td className="px-4 py-2 font-medium capitalize flex items-center gap-2">
                                                {getPlatformIcon(acc.platform)}
                                                {acc.platform}
                                            </td>
                                            <td className="px-4 py-2">{acc.username}</td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={acc.category}
                                                    onChange={(e) => handleFieldChange(acc.id, 'category', e.target.value)}
                                                    className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                                >
                                                    <option value="" disabled>{t('accounts.connector.selectNichePlaceholder')}</option>
                                                    {CHANNEL_TOPICS.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    list="country-suggestions"
                                                    value={acc.country}
                                                    onChange={(e) => handleFieldChange(acc.id, 'country', e.target.value)}
                                                    placeholder={t('accounts.connector.countryPlaceholder')}
                                                    className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        {(acc.linkedAffiliatePlatforms || []).map(p => (
                                                            <span key={p} title={p} className="flex items-center justify-center w-6 h-6 bg-gray-900 rounded-full">
                                                                {getPlatformIcon(p, "w-4 h-4")}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setLinkingAccount(acc)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                                        {t('accounts.linker.manageLinks')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500">
                                                {t('addChannelModal.noAccountsHint')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <datalist id="country-suggestions">
                                {COUNTRIES.map(country => <option key={country} value={country} />)}
                            </datalist>
                        </div>
                    </div>

                    <footer className="p-4 border-t border-gray-700 flex justify-end flex-shrink-0">
                        <button 
                            onClick={handleSaveAndSync}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                        >
                            {t('accounts.linker.saveAndSync')}
                        </button>
                    </footer>
                </div>
            </div>
            {linkingAccount && (
                <LinkAffiliatesModal
                    isOpen={!!linkingAccount}
                    onClose={() => setLinkingAccount(null)}
                    account={linkingAccount}
                    onSave={(newLinks) => {
                        handleFieldChange(linkingAccount.id, 'linkedAffiliatePlatforms', newLinks);
                        setLinkingAccount(null);
                    }}
                />
            )}
        </>
    );
};
