import React from 'react';

export const RakutenIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-red-600" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="12" />
        <path
            fill="#fff"
            d="M15.4,17.28h-2.2l-2.43-4.1h-0.08v4.1H8.67V6.72h3.69c1.8,0,2.95,0.47,3.61,1.4c0.66,0.92,0.99,2.15,0.99,3.69 C16.96,14.44,16.48,16.14,15.4,17.28z M12.06,8.21h-1.37v2.85h1.37c0.8,0,1.2-0.19,1.46-0.57c0.26-0.38,0.39-0.89,0.39-1.52 C13.91,8.51,13.29,8.21,12.06,8.21z"
        />
    </svg>
);