import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { CloseIcon } from './icons/CloseIcon';
import { CHANNEL_TOPICS } from '../data/topics';
import { ConnectablePlatform, cryptoAffiliatePlatforms, generalAffiliatePlatforms, socialPlatforms, SocialPlatform, SocialAccount } from '../types';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

const InputField: React.FC<{
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isSelect?: boolean;
  options?: string[];
}> = ({ id, label, type = 'text', value, placeholder, onChange, isSelect = false, options = [] }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';

    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-purple-300 mb-1">
                {label}
            </label>
            {isSelect ? (
                <select
                    id={id}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-gray-900/80 border border-gray-600 rounded p-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <div className="relative">
                    <input
                        id={id}
                        type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-gray-900/80 border border-gray-600 rounded p-2 pr-10 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        placeholder={placeholder}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

type TestStatus = 'idle' | 'testing' | 'success' | 'failed';

const TestButton: React.FC<{ status: TestStatus, onTest: () => void, isButtonDisabled?: boolean }> = ({ status, onTest, isButtonDisabled = false }) => {
    const { t } = useTranslation();
    const SpinnerIcon: React.FC = () => (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    if (status === 'testing') {
        return (
            <span className="flex items-center justify-center gap-1.5 text-xs text-yellow-300">
                <SpinnerIcon />
                {t('accounts.connector.testingConnection')}
            </span>
        );
    }
    if (status === 'success') {
        return (
            <span className="flex items-center justify-center gap-1.5 text-xs text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t('accounts.connector.statusValid')}
            </span>
        );
    }
    if (status === 'failed') {
        return (
            <span className="flex items-center justify-center gap-1.5 text-xs text-red-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t('accounts.connector.statusInvalid')}
            </span>
        );
    }
    return (
        <button type="button" onClick={onTest} disabled={isButtonDisabled} className="w-full text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {t('accounts.connector.testConnection')}
        </button>
    );
};


export const AccountConnector: React.FC<{
    platform: ConnectablePlatform;
    icon: React.ReactNode;
    account?: SocialAccount | { username: string; password: string };
    onSave: (data: SocialAccount | { username: string; password: string }) => void;
    onClose: () => void;
}> = ({ platform, icon, account, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(account || { username: '', password: '', category: '', country: '' });
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    
    useEffect(() => {
        setFormData(account || { username: '', password: '', category: '', country: '' });
    }, [account, platform]);

    const isSocial = socialPlatforms.includes(platform as SocialPlatform);
    const isAffiliate = generalAffiliatePlatforms.includes(platform as any) || cryptoAffiliatePlatforms.includes(platform as any);

    const getPlatformLabels = () => {
        let usernameLabel = t('accounts.connector.usernameIdLabel');
        let passwordLabel = t('accounts.connector.apiKeyLabel');

        if (isAffiliate) {
            usernameLabel = t('accounts.connector.affiliateIdLabel');
        }

        switch(platform) {
            case 'youtube':
                usernameLabel = 'Channel Name';
                passwordLabel = 'API Key (Optional)';
                break;
            case 'amazon':
                usernameLabel = 'Associates ID / Tracking ID';
                passwordLabel = 'PA-API 5.0 Secret Key';
                break;
            case 'clickbank':
                usernameLabel = 'Nickname (Account ID)';
                passwordLabel = 'Clerk API Key';
                break;
             case 'cj':
                usernameLabel = 'Website ID';
                passwordLabel = 'Personal Access Token';
                break;
            case 'binance':
                usernameLabel = 'Referral ID';
                passwordLabel = 'API Key';
                break;
        }
        return { usernameLabel, passwordLabel };
    };
    
    const { usernameLabel, passwordLabel } = getPlatformLabels();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const field = id.split('-')[1];
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTest = async () => {
        setTestStatus('testing');
        const isSuccess = isAffiliate ? formData.username !== '' : formData.username !== '' && 'password' in formData && formData.password !== '';
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTestStatus(isSuccess ? 'success' : 'failed');
        setTimeout(() => setTestStatus('idle'), 4000);
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="hud-border bg-gray-900/80 p-4 rounded-lg flex flex-col w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {icon}
                    <h4 className="font-bold text-lg capitalize">{platform}</h4>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <CloseIcon />
                </button>
            </div>
            <div className="space-y-3 flex-grow">
                 <InputField
                    id={`${platform}-username`}
                    label={usernameLabel}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t('accounts.connector.usernameIdPlaceholder')}
                />

                {'password' in formData && (
                     <InputField
                        id={`${platform}-password`}
                        label={passwordLabel}
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('accounts.connector.apiKeyPlaceholder')}
                    />
                )}
               
                {isSocial && 'category' in formData && (
                    <>
                        <InputField
                            id={`${platform}-category`}
                            label={t('accounts.connector.topicLabel')}
                            value={formData.category}
                            onChange={handleChange}
                            isSelect={true}
                            options={CHANNEL_TOPICS}
                            placeholder={t('accounts.connector.selectNichePlaceholder')}
                        />
                        <InputField
                            id={`${platform}-country`}
                            label={t('accounts.connector.countryLabel')}
                            value={formData.country}
                            onChange={handleChange}
                            placeholder={t('accounts.connector.countryPlaceholder')}
                        />
                    </>
                )}
            </div>
            
            <div className="mt-4 space-y-2">
                <TestButton status={testStatus} onTest={handleTest} isButtonDisabled={!formData.username} />
                <button onClick={handleSave} className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-md transition-colors">
                    {account ? t('accounts.connector.saveButton') : t('accounts.connector.connectButton')}
                </button>
            </div>
        </div>
    );
};
