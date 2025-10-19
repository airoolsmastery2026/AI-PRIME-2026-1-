import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { DashboardIcon } from './icons/DashboardIcon';
import { AutomationIcon } from './icons/AutomationIcon';
import { VideoIcon } from './icons/VideoIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { AgentIcon } from './icons/AgentIcon';
import { MatrixIcon } from './icons/MatrixIcon';
import { CommandIcon } from './icons/CommandIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PilotIcon } from './PilotIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CodeIcon } from './icons/CodeIcon';
import { CloseIcon } from './icons/CloseIcon';
import { User } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';


interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
    const activeClasses = isActive
        ? 'bg-cyan-400/10 text-cyan-300 border-l-4 border-cyan-300 shadow-[inset_3px_0_10px_0_rgba(56,189,248,0.3),0_0_15px_rgba(56,189,248,0.2)]'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white';

    return (
        <button 
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ${activeClasses}`}
        >
            <div className="mr-4">{icon}</div>
            <span className="font-semibold">{label}</span>
        </button>
    );
};


interface SidebarProps {
    user: User;
    onLogout: () => void;
    activeView: string;
    setActiveView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, activeView, setActiveView, isOpen, setIsOpen }) => {
    const { t, language, changeLanguage } = useTranslation();

    const mainNavItems = [
        { id: 'dashboard', icon: <DashboardIcon />, label: t('sidebar.dashboard') },
        { id: 'agents', icon: <AgentIcon />, label: t('sidebar.agents') },
        { id: 'accounts', icon: <UsersIcon />, label: t('sidebar.accounts') },
        { id: 'automation', icon: <AutomationIcon />, label: t('sidebar.automation') },
        { id: 'video', icon: <VideoIcon />, label: t('sidebar.video') },
        { id: 'matrix', icon: <MatrixIcon />, label: t('sidebar.matrix') },
        { id: 'nexus', icon: <CommandIcon />, label: t('sidebar.nexus') },
        { id: 'pilot', icon: <PilotIcon />, label: t('sidebar.pilot') },
        { id: 'analytics', icon: <AnalyticsIcon />, label: t('sidebar.analytics') },
    ];

     const systemNavItems = [
        { id: 'editor', icon: <CodeIcon />, label: t('sidebar.editor') },
        { id: 'settings', icon: <SettingsIcon />, label: t('sidebar.settings') },
    ];

    const handleNavItemClick = (view: string) => {
        setActiveView(view);
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    const LanguageSwitcher = () => (
        <div className="flex flex-col gap-2 px-4 py-4">
            <button 
                onClick={() => changeLanguage('en')}
                className={`w-full font-semibold transition-colors py-2 text-sm rounded-md ${language === 'en' ? 'bg-purple-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
            >
                English
            </button>
            <button 
                onClick={() => changeLanguage('vi')}
                className={`w-full font-semibold transition-colors py-2 text-sm rounded-md ${language === 'vi' ? 'bg-purple-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
            >
                Tiếng Việt
            </button>
        </div>
    );
    
    const UserProfile: React.FC = () => (
        <div className="p-4 border-y border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
                <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{t('sidebar.accountType', { provider: user.provider })}</p>
                </div>
            </div>
            <button onClick={onLogout} title={t('sidebar.logout')} className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                <LogoutIcon />
            </button>
        </div>
    );

    const sidebarClasses = `
        bg-gray-800/80 backdrop-blur-md border-r border-gray-700/50 flex flex-col
        fixed lg:relative lg:translate-x-0
        h-full lg:h-auto z-40
        w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/60 z-30"
                    aria-hidden="true"
                ></div>
            )}
            <aside className={sidebarClasses}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-cyan-300 tracking-widest">AI PRIME</h1>
                     <button 
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                        aria-label="Close menu"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex-grow pt-4 overflow-y-auto">
                    {mainNavItems.map(item => (
                        <NavItem 
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeView === item.id}
                            onClick={() => handleNavItemClick(item.id)}
                        />
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        {systemNavItems.map(item => (
                            <NavItem 
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => handleNavItemClick(item.id)}
                            />
                        ))}
                    </div>
                </nav>
                <UserProfile />
                <LanguageSwitcher />
                <div className="p-4 pt-2 text-center text-xs text-gray-500">
                    <p>v1.0.0 - Affiliate Autopilot</p>
                    <p>&copy; {new Date().getFullYear()} Prime Industries</p>
                </div>
            </aside>
        </>
    );
};