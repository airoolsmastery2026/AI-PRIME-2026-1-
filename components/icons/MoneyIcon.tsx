import React from 'react';

export const MoneyIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0 1v.01M12 12h.01M12 12a2 2 0 012 2m-2 2a2 2 0 00-2-2m2 2a2 2 0 01-2-2m0 0a2 2 0 002-2m-2 2a2 2 0 012-2m0 0a2 2 0 00-2 2m2-2a2 2 0 01-2-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5A6.5 6.5 0 1012 5.5a6.5 6.5 0 000 13z" />
    </svg>
);