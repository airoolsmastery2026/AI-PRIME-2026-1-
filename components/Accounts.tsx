import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useSystem } from '../contexts/SystemContext';
import { testGeminiConnection } from '../services/geminiService';
import { AccountCard } from './AccountCard';
import { AccountConnector } from './AccountConnector';

// Icons
import { YouTubeIcon } from './icons/YouTubeIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { PinterestIcon } from './icons/PinterestIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { ClickBankIcon } from './icons/ClickBankIcon';
import { AmazonIcon } from './icons/AmazonIcon';
import { CJIcon } from './icons/CJIcon';
import { ShareASaleIcon } from './icons/ShareASaleIcon';
import { RakutenIcon } from './icons/RakutenIcon';
import { BinanceIcon } from './icons/BinanceIcon';
import { CoinbaseIcon } from './icons/CoinbaseIcon';
import { LedgerIcon } from './icons/LedgerIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AccountLinkerModal } from './AccountLinkerModal';
import { SocialAccount, socialPlatforms, generalAffiliatePlatforms, cryptoAffiliatePlatforms, ConnectablePlatform, SocialPlatform } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { getPlatformUrl } from '../utils/getPlatformUrl';
import { LinkAffiliatesModal } from './LinkAffiliatesModal';
import { AffiliateIcon } from './icons/AffiliateIcon';

const platformIcons: Record<ConnectablePlatform, React.ReactNode> = {
    youtube: <YouTubeIcon />,
    tiktok: <TikTokIcon />,
    instagram: <InstagramIcon />,
    x: <XIcon />,
    facebook: <FacebookIcon />,
    pinterest: <PinterestIcon />,
    linkedin: <LinkedInIcon />,
    clickbank: <ClickBankIcon />,
    amazon: <AmazonIcon />,
    cj: <CJIcon />,
    shareasale: <ShareASaleIcon />,
    rakuten: <RakutenIcon />,
    binance: <BinanceIcon />,
    coinbase: <CoinbaseIcon />,
    ledger: <LedgerIcon />,
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-cyan-300 mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

const AccountManagerModal: React.FC<{
    platform: ConnectablePlatform;
    onClose: () => void;
}> = ({ platform, onClose }) => {
    const { t } = useTranslation();
    const { credentials, addSocialAccount, updateSocialAccount, removeSocialAccount } = useSystem();
    const [editingAccount, setEditingAccount] = useState<SocialAccount | 'new' | null>(null);
    const [linkingAccount, setLinkingAccount] = useState<SocialAccount | null>(null);

    const accounts = credentials[platform] || [];
    const platformIcon = platformIcons[platform];

    const handleSave = (data: SocialAccount | Omit<SocialAccount, 'id'>) => {
        if ('id' in data) { // Update
            updateSocialAccount(platform as SocialPlatform, data);
        } else { // Add
            addSocialAccount(platform as SocialPlatform, data);
        }
        setEditingAccount(null);
    };

    if (editingAccount) {
        return (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <AccountConnector
                    platform={platform}
                    icon={platformIcon}
                    account={editingAccount === 'new' ? undefined : editingAccount}
                    onSave={handleSave as any} // The types are a bit messy here but should work
                    onClose={() => setEditingAccount(null)}
                />
            </div>
        )
    }

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                     <div className="flex items-center gap-3">
                        {platformIcon}
                        <h2 className="text-xl font-bold text-cyan-300 capitalize">{platform} {t('accounts.title')}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {accounts.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">{t('accounts.noAccounts')}</p>
                    ) : (
                        accounts.map(acc => (
                            <div key={acc.id} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{acc.username}</p>
                                    {acc.category && <p className="text-xs text-gray-400">{acc.category}</p>}
                                </div>
                                <div className="flex gap-2">
                                     <a 
                                        href={getPlatformUrl(platform, acc.username)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title={`Go to ${acc.username} on ${platform}`}
                                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white flex items-center justify-center"
                                    >
                                        <ExternalLinkIcon />
                                    </a>
                                     <button
                                        onClick={() => setLinkingAccount(acc)}
                                        title="Link Affiliate Platforms"
                                        className="p-2 bg-green-800/50 hover:bg-green-700/80 rounded-md text-white"
                                    >
                                        <AffiliateIcon className="w-4 h-4" />
                                    </button>
                                     <button onClick={() => setEditingAccount(acc)} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">{t('accounts.edit')}</button>
                                     <button onClick={() => removeSocialAccount(platform as SocialPlatform, acc.id)} className="p-2 bg-red-800/50 hover:bg-red-700/80 rounded-md text-white"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <footer className="p-4 border-t border-gray-700">
                    <button onClick={() => setEditingAccount('new')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all">
                        {t('accounts.addAccount')}
                    </button>
                </footer>
            </div>
            {linkingAccount && (
                <LinkAffiliatesModal
                    isOpen={!!linkingAccount}
                    onClose={() => setLinkingAccount(null)}
                    account={{ ...linkingAccount, platform: platform as SocialPlatform }}
                    onSave={(newLinks) => {
                        if (linkingAccount) {
                           updateSocialAccount(platform as SocialPlatform, { ...linkingAccount, linkedAffiliatePlatforms: newLinks });
                        }
                        setLinkingAccount(null);
                    }}
                />
            )}
        </div>
    )
};


export const Accounts: React.FC = () => {
    const { t } = useTranslation();
    const { credentials } = useSystem();
    const [selectedPlatform, setSelectedPlatform] = useState<ConnectablePlatform | null>(null);
    const [geminiStatus, setGeminiStatus] = useState<'testing' | 'valid' | 'invalid'>('testing');
    const [isLinkerOpen, setIsLinkerOpen] = useState(false);

    useEffect(() => {
        const checkGemini = async () => {
            setGeminiStatus('testing');
            const isValid = await testGeminiConnection();
            setGeminiStatus(isValid ? 'valid' : 'invalid');
        };
        checkGemini();
    }, []);

    const handleManage = (platform: ConnectablePlatform) => {
        setSelectedPlatform(platform);
    };

    const getIsConnected = (platform: ConnectablePlatform): boolean => {
        const accounts = credentials[platform];
        return Array.isArray(accounts) && accounts.length > 0;
    };

    const getUsernameSummary = (platform: ConnectablePlatform): string | undefined => {
        const accounts = credentials[platform];
        if (getIsConnected(platform) && accounts) {
            if (accounts.length === 1) return accounts[0].username;
            return `${accounts.length} ${t('accounts.accountsConnected')}`;
        }
        return undefined;
    };

    return (
        <div className="h-full flex flex-col">
             <header className="text-center mb-8">
                <h2 className="text-4xl font-bold text-cyan-300">{t('accounts.title')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mt-2">{t('accounts.description')}</p>
            </header>
            <div className="flex-grow overflow-y-auto pr-2">
                 <Section title={t('accounts.sectionCore')}>
                    <div className="hud-border p-4 flex flex-col justify-between">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                                <GeminiIcon className="h-6 w-6" />
                                <h4 className="font-bold text-lg">Google Gemini</h4>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-gray-900 ${geminiStatus === 'valid' ? 'bg-green-400 animate-pulse' : geminiStatus === 'invalid' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                <span className={`text-sm font-semibold ${geminiStatus === 'valid' ? 'text-green-400' : geminiStatus === 'invalid' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {geminiStatus === 'valid' && t('accounts.statusValid')}
                                    {geminiStatus === 'invalid' && t('accounts.statusInvalid')}
                                    {geminiStatus === 'testing' && t('accounts.statusTesting')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">{t('accounts.geminiDescription')}</p>
                        </div>
                    </div>
                     <div className="hud-border p-4 flex flex-col justify-between">
                         <div>
                            <h4 className="font-bold text-lg">{t('accounts.linkerTitle')}</h4>
                            <p className="text-xs text-gray-400 mt-2 mb-4 flex-grow">{t('accounts.linkerDescription')}</p>
                         </div>
                         <button
                            onClick={() => setIsLinkerOpen(true)}
                            className="w-full text-center mt-4 bg-green-600/80 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            {t('accounts.linkerButton')}
                         </button>
                    </div>
                </Section>
                <Section title={t('accounts.sectionSocial')}>
                    {socialPlatforms.map(p => (
                        <AccountCard
                            key={p}
                            platform={p}
                            icon={platformIcons[p]}
                            isConnected={getIsConnected(p)}
                            username={getUsernameSummary(p)}
                            onManage={() => handleManage(p)}
                        />
                    ))}
                </Section>
                 <Section title={t('accounts.sectionAffiliateGeneral')}>
                    {generalAffiliatePlatforms.map(p => (
                        <AccountCard
                            key={p}
                            platform={p}
                            icon={platformIcons[p]}
                            isConnected={getIsConnected(p)}
                            username={getUsernameSummary(p)}
                            onManage={() => handleManage(p)}
                        />
                    ))}
                </Section>
                 <Section title={t('accounts.sectionAffiliateCrypto')}>
                    {cryptoAffiliatePlatforms.map(p => (
                        <AccountCard
                            key={p}
                            platform={p}
                            icon={platformIcons[p]}
                            isConnected={getIsConnected(p)}
                            username={getUsernameSummary(p)}
                            onManage={() => handleManage(p)}
                        />
                    ))}
                </Section>
            </div>
            {selectedPlatform && <AccountManagerModal platform={selectedPlatform} onClose={() => setSelectedPlatform(null)} />}
            <AccountLinkerModal isOpen={isLinkerOpen} onClose={() => setIsLinkerOpen(false)} />
        </div>
    )
}