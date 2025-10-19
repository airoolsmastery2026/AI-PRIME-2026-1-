import React from 'react';

export const CJIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5c-2.49 0-4.5-2.01-4.5-4.5S7.51 7.5 10 7.5c1.16 0 2.2.45 3 1.18V7.5h2v6h-2v-1.68c-.8.73-1.84 1.18-3 1.18zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/>
    </svg>
);