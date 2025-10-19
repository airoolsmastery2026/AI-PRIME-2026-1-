import React from 'react';

export const LawyerIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.884 4.078A9 9 0 1016.116 19.922M12 21a9.004 9.004 0 008.06-4.932M3.94 16.068A9.004 9.004 0 0012 21m0-18a9.008 9.008 0 00-8.06 4.932m16.12 0A9.008 9.008 0 0012 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
    </svg>
);