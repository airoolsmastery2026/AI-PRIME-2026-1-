import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l-8-8 8 8 8-8-8 8zm0 0l-8 8 8-8 8 8-8-8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4m-2.828-7.172L4.636 7.364m14.728 9.272L12 12" />
    </svg>
);
