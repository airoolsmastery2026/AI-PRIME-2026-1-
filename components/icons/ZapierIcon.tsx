import React from 'react';

export const ZapierIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-orange-500" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M0 16h8v8H0v-8zm9 0h15v8H9v-8zm0-9h15v8H9V7zm0-7h15v6H9V0z" />
    </svg>
);