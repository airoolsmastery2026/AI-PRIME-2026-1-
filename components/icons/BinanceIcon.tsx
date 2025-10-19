import React from 'react';

export const BinanceIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M16.62 12.13l-4.52-4.53-4.53 4.53 4.53 4.52 4.52-4.52zM12.1 2l-4.52 4.52 4.52 4.53 4.52-4.53L12.1 2zM2 12.1l4.52-4.52 4.53 4.52-4.53 4.52L2 12.1zm10.1 10.03l-4.53-4.53 4.53-4.52 4.52 4.52-4.52 4.53zM22.13 12.1l-4.52 4.52-4.52-4.52 4.52-4.52 4.52 4.52z"/>
    </svg>
);