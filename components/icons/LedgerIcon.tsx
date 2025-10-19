import React from 'react';

export const LedgerIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M20,6H4V4h16V6z M4,14h16v- पॉइंट5H4V14z M20,20H4v-2h16V20z M4,8h16V10H4V8z"/>
    </svg>
);