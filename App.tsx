
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Automation } from './components/Automation';
import { AIVideo } from './components/AIVideo';
import { Analytics } from './components/Analytics';
import { Agents } from './components/Agents';
import { ContentMatrix } from './components/ContentMatrix';
import { CommandNexus } from './components/CommandNexus';
import { QuantumCoreControl } from './components/QuantumCoreControl';
import { Accounts } from './components/Accounts';
import { Pilot } from './components/Pilot';
import { SystemMonitor } from './components/SystemMonitor';
import { Settings } from './components/Settings';
import { CoreEditor } from './components/CoreEditor';
import { MenuIcon } from './components/icons/MenuIcon';
import { useSystem } from './contexts/SystemContext';

const App: React.FC = () => {
    const { user, login, logout } = useSystem();
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const views: { [key: string]: React.ReactNode } = {
        dashboard: <Dashboard setActiveView={setActiveView} />,
        agents: <Agents />,
        accounts: <Accounts />,
        automation: <Automation />,
        video: <AIVideo />,
        matrix: <ContentMatrix />,
        nexus: <CommandNexus />,
        pilot: <Pilot />,
        analytics: <Analytics />,
        settings: <Settings />,
        editor: <CoreEditor />,
    };

    if (!user) {
        return <QuantumCoreControl onLogin={login} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    user={user}
                    onLogout={logout}
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setIsSidebarOpen} 
                />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
                     <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-gray-800/50 text-gray-300 hover:bg-gray-700 backdrop-blur-sm"
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </button>
                    {Object.entries(views).map(([key, view]) => (
                        <div key={key} style={{ display: activeView === key ? 'block' : 'none' }} className="h-full">
                            {view}
                        </div>
                    ))}
                </main>
            </div>
            <SystemMonitor />
        </div>
    );
};

export default App;