

import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { useTranslation } from '../i18n/useTranslation';

interface ResultDisplayProps {
  images: string[];
  isLoading: boolean;
  onPreview: (image: string) => void;
}

const SkeletonLoader: React.FC = () => (
  <div className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
);

const ImageCard: React.FC<{ src: string; onPreview: (src: string) => void }> = ({ src, onPreview }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = `character-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative group aspect-square">
            <img src={src} alt="Generated character" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-4">
                <button 
                    onClick={() => onPreview(src)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
                    aria-label="Preview image"
                >
                    <EyeIcon />
                </button>
                <button 
                    onClick={handleDownload}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-colors"
                    aria-label="Download image"
                >
                    <DownloadIcon />
                </button>
            </div>
        </div>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ images, isLoading, onPreview }) => {
  const { t } = useTranslation();
  return (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-center">{t('resultDisplay.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isLoading && Array.from({ length: 4 }).map((_, index) => <SkeletonLoader key={index} />)}
            {!isLoading && images.length === 0 && (
                <div className="sm:col-span-2 text-center py-20 text-gray-400">
                    <p>{t('resultDisplay.placeholder')}</p>
                    <p className="text-sm">{t('resultDisplay.placeholderDesc')}</p>
                </div>
            )}
            {!isLoading && images.map((image, index) => <ImageCard key={index} src={image} onPreview={onPreview} />)}
        </div>
    </div>
  );
};