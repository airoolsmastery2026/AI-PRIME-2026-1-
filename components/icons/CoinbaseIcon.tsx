import React from 'react';

export const CoinbaseIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5h-3v-5h3v5zm6 0h-3v-5h3v5zm-3-6.5H8v-3h7v3z"/>
    </svg>
);