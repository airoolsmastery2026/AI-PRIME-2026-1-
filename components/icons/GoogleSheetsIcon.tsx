
import React from 'react';

export const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-green-500" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M15 2H9C7.9 2 7 2.9 7 4V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V4C17 2.9 16.1 2 15 2M15 20H9V18H15V20M15 17H9V15H15V17M15 14H9V12H15V14M15 11H9V9H15V11M15 8H9V6H15V8Z" />
    </svg>
);
