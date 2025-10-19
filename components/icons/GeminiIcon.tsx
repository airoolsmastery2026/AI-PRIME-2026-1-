
import React from 'react';

export const GeminiIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M12.508 1.012a5.49 5.49 0 00-5.483 5.495v.005h5.483V1.012zM6.91 17.607a5.49 5.49 0 005.483-5.495V6.607H6.91v11.000zM12.508 23.11a5.49 5.49 0 005.483-5.495v-5.508h-5.483v11.003z"/>
    </svg>
);
