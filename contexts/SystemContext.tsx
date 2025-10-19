import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { ProductionJob, ChannelAgent, StrategicDirective, SocialAccount, User, JobStatus, AutomationFlow, Credentials, initialCredentials, CREDENTIALS_STORAGE_KEY, SocialPlatform, SystemBackup } from '../types';
import { generateVideo } from '../services/geminiService';
import { AUTOMATION_FLOWS } from '../data/automations';
import { useTranslation } from '../i18n/useTranslation';

const AGENTS_STORAGE_KEY = 'channelAgents';
const VIDEO_JOBS_STORAGE_KEY = 'videoProductionJobs';
const DIRECTIVES_QUEUE_KEY = 'directivesQueue';
const USER_STORAGE_KEY = 'authUser';
const AUTOMATION_FLOWS_STORAGE_KEY = 'automationFlows';

type LoginProvider = 'google' | 'github' | 'x' | 'system';

interface SystemState {
    credentials: Credentials;
    agents: ChannelAgent[];
    videoJobs: ProductionJob[];
    directives: StrategicDirective[];
    automationFlows: AutomationFlow[];
    user: User | null;
    setCredentials: (creds: Credentials) => void;
    addSocialAccount: (platform: SocialPlatform, account: Omit<SocialAccount, 'id'>) => void;
    updateSocialAccount: (platform: SocialPlatform, account: SocialAccount) => void;
    updateMultipleSocialAccounts: (accountsToUpdate: (SocialAccount & { platform: SocialPlatform })[]) => void;
    removeSocialAccount: (platform: SocialPlatform, accountId: string) => void;
    addAgent: (agent: ChannelAgent) => void;
    updateAgent: (agent: ChannelAgent) => void;
    addVideoJob: (job: ProductionJob) => void;
    addVideoJobBatch: (jobs: ProductionJob[]) => void;
    updateVideoJob: (job: ProductionJob) => void;
    removeVideoJob: (jobId: string) => void;
    addDirective: (directive: StrategicDirective) => void;
    removeDirective: (directiveText: string) => void;
    toggleAutomationFlowStatus: (flowId: string) => void;
    login: (provider: LoginProvider, remember: boolean) => void;
    logout: () => void;
    restoreBackup: (backup: SystemBackup) => void;
}

const SystemContext = createContext<SystemState | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = useTranslation();
    const [credentials, setCredentialsState] = useState<Credentials>(() => getFromStorage(CREDENTIALS_STORAGE_KEY, initialCredentials));
    const [agents, setAgentsState] = useState<ChannelAgent[]>(() => getFromStorage(AGENTS_STORAGE_KEY, []));
    const [videoJobs, setVideoJobsState] = useState<ProductionJob[]>(() => getFromStorage(VIDEO_JOBS_STORAGE_KEY, []));
    const [directives, setDirectivesState] = useState<StrategicDirective[]>(() => getFromStorage(DIRECTIVES_QUEUE_KEY, []));
    const [user, setUserState] = useState<User | null>(() => getFromStorage(USER_STORAGE_KEY, null));
    const [automationFlows, setAutomationFlowsState] = useState<AutomationFlow[]>(() => getFromStorage(AUTOMATION_FLOWS_STORAGE_KEY, AUTOMATION_FLOWS));

    useEffect(() => saveToStorage(CREDENTIALS_STORAGE_KEY, credentials), [credentials]);
    useEffect(() => saveToStorage(AGENTS_STORAGE_KEY, agents), [agents]);
    useEffect(() => saveToStorage(VIDEO_JOBS_STORAGE_KEY, videoJobs), [videoJobs]);
    useEffect(() => saveToStorage(DIRECTIVES_QUEUE_KEY, directives), [directives]);
    useEffect(() => saveToStorage(USER_STORAGE_KEY, user), [user]);
    useEffect(() => saveToStorage(AUTOMATION_FLOWS_STORAGE_KEY, automationFlows), [automationFlows]);

    const setCredentials = (creds: Credentials) => setCredentialsState(creds);

    const addSocialAccount = (platform: SocialPlatform, account: Omit<SocialAccount, 'id'>) => {
        setCredentialsState(prev => {
            const newAccount = { ...account, password: account.password || '', id: `acc-${Date.now()}` };
            const platformAccounts = prev[platform] || [];
            return {
                ...prev,
                [platform]: [...platformAccounts, newAccount]
            };
        });
    };

    const updateSocialAccount = (platform: SocialPlatform, updatedAccount: SocialAccount) => {
        setCredentialsState(prev => {
            const platformAccounts = prev[platform] || [];
            const updatedAccounts = platformAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc);
            return {
                ...prev,
                [platform]: updatedAccounts
            };
        });
    };
    
    const updateMultipleSocialAccounts = (accountsToUpdate: (SocialAccount & { platform: SocialPlatform })[]) => {
        setCredentialsState(prev => {
            const newCreds = JSON.parse(JSON.stringify(prev)); // Deep copy to ensure nested arrays are new
            accountsToUpdate.forEach(updatedAccWithPlatform => {
                const { platform, ...accountData } = updatedAccWithPlatform;
                if (newCreds[platform]) {
                    const accountIndex = newCreds[platform]!.findIndex((acc: SocialAccount) => acc.id === accountData.id);
                    if (accountIndex !== -1) {
                        newCreds[platform]![accountIndex] = accountData;
                    }
                }
            });
            return newCreds;
        });
    };

    const removeSocialAccount = (platform: SocialPlatform, accountId: string) => {
        setCredentialsState(prev => {
            const platformAccounts = prev[platform] || [];
            const filteredAccounts = platformAccounts.filter(acc => acc.id !== accountId);
            return {
                ...prev,
                [platform]: filteredAccounts
            };
        });
    };

    const addAgent = (agent: ChannelAgent) => setAgentsState(prev => [agent, ...prev]);
    const updateAgent = (updatedAgent: ChannelAgent) => setAgentsState(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    
    const updateVideoJob = useCallback((updatedJob: ProductionJob) => {
        setVideoJobsState(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    }, []);

    const addVideoJob = (job: ProductionJob) => setVideoJobsState(prev => [job, ...prev]);
    const addVideoJobBatch = (jobs: ProductionJob[]) => setVideoJobsState(prev => [...jobs, ...prev]);
    const removeVideoJob = (jobId: string) => setVideoJobsState(prev => prev.filter(j => j.id !== jobId));
    
    const addDirective = (directive: StrategicDirective) => {
        // Prevent duplicate directives
        if (!directives.some(d => d.directive === directive.directive)) {
            setDirectivesState(prev => [directive, ...prev]);
        }
    };
    const removeDirective = (directiveText: string) => setDirectivesState(prev => prev.filter(d => d.directive !== directiveText));
    
    const toggleAutomationFlowStatus = (flowId: string) => {
        setAutomationFlowsState(prev => 
            prev.map(flow => 
                flow.id === flowId 
                ? { ...flow, status: flow.status === 'Active' ? 'Inactive' : 'Active' } 
                : flow
            )
        );
    };

    const login = (provider: LoginProvider, remember: boolean) => {
        let mockUser: User;
        switch (provider) {
            case 'google':
                mockUser = { name: 'AI Prime User', email: 'aiprime.user@google.com', avatar: 'https://i.pravatar.cc/150?u=google', provider: 'google', token: 'mock_google_oauth_token_12345' };
                break;
            case 'github':
                mockUser = { name: 'aiprime-dev', email: 'dev@users.noreply.github.com', avatar: 'https://i.pravatar.cc/150?u=github', provider: 'github', token: 'mock_github_oauth_token_12345' };
                break;
            case 'x':
                mockUser = { name: 'aiprime_social', avatar: 'https://i.pravatar.cc/150?u=x', provider: 'x', token: 'mock_x_oauth_token_12345' };
                break;
            case 'system':
                mockUser = { name: 'System Operator', avatar: 'https://i.pravatar.cc/150?u=system', provider: 'system', token: 'mock_system_token_12345'};
                break;
        }
        
        if (remember) {
            saveToStorage('rememberedProvider', provider);
        } else {
            saveToStorage('rememberedProvider', null);
        }

        setUserState(mockUser);
    };

    const logout = () => {
        setUserState(null);
    };

    const restoreBackup = (backup: SystemBackup) => {
        if (
            backup.credentials &&
            backup.agents &&
            backup.videoJobs &&
            backup.directives &&
            backup.automationFlows
        ) {
            setCredentialsState(backup.credentials);
            setAgentsState(backup.agents);
            setVideoJobsState(backup.videoJobs);
            setDirectivesState(backup.directives);
            setAutomationFlowsState(backup.automationFlows);
        } else {
            throw new Error("Invalid backup data structure.");
        }
    };

    const processVideoJob = useCallback(async (jobId: string) => {
        const job = videoJobs.find(j => j.id === jobId);
        if (!job || job.status !== JobStatus.Queued) return;

        let currentJobState: ProductionJob = { ...job, status: JobStatus.Generating, progress: 25, statusMessageKey: 'aiVideo.generating.enhancing' };
        updateVideoJob(currentJobState);

        try {
            // The logic for enhancing prompt is now on the backend.
            // We pass the simple prompt and language.
            currentJobState = { ...currentJobState, progress: 50, statusMessageKey: 'aiVideo.generating.rendering' };
            updateVideoJob(currentJobState);
            
            const videoUrl = await generateVideo(job.prompt, job.aspectRatio, job.is8K, job.language);
            
            // The enhanced prompt can be retrieved if the backend sends it back, but it's not crucial for the flow.
            // For now, we'll assume it's handled backend-only.
            currentJobState = { ...currentJobState, status: JobStatus.Published, progress: 100, videoUrl, statusMessageKey: 'aiVideo.generating.success' };
            updateVideoJob(currentJobState);
        } catch (err: any) {
            console.error(`Failed to process job ${jobId}:`, err);
            // The backend should return a specific error key.
            const errorMessageKey = err.message.startsWith('errors.') ? err.message : 'errors.videoGen';
            currentJobState = { ...currentJobState, status: JobStatus.Failed, progress: 100, statusMessageKey: errorMessageKey };
            updateVideoJob(currentJobState);
        }
    }, [videoJobs, updateVideoJob]);

    useEffect(() => {
        const jobToProcess = videoJobs.find(job => job.status === JobStatus.Queued);
        if (jobToProcess) {
            processVideoJob(jobToProcess.id);
        }
    }, [videoJobs, processVideoJob]);


    const value = {
        credentials,
        agents,
        videoJobs,
        directives,
        automationFlows,
        user,
        setCredentials,
        addSocialAccount,
        updateSocialAccount,
        updateMultipleSocialAccounts,
        removeSocialAccount,
        addAgent,
        updateAgent,
        addVideoJob,
        addVideoJobBatch,
        updateVideoJob,
        removeVideoJob,
        addDirective,
        removeDirective,
        toggleAutomationFlowStatus,
        login,
        logout,
        restoreBackup,
    };

    return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};

export const useSystem = (): SystemState => {
    const context = useContext(SystemContext);
    if (!context) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
};