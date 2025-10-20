import React from 'react';

export const FilmIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 4v16M16 4v16M4 8h16M4 16h16" />
    </svg>
);
