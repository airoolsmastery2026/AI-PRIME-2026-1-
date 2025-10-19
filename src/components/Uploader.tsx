

import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface UploaderProps {
  preview: string | null;
  onUpload: (file: File) => void;
  label: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({
  preview,
  onUpload,
  label,
  className = "",
  isSelected = false,
  onClick,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUpload(event.target.files[0]);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    inputRef.current?.click();
  };

  const borderStyle = isSelected
    ? 'border-purple-500 ring-2 ring-purple-500'
    : 'border-gray-600 hover:border-purple-500';

  return (
    <div
      className={`relative aspect-square bg-gray-800 rounded-lg border-2 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer group ${borderStyle} ${className}`}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {preview ? (
        <img src={preview} alt={label} className="w-full h-full object-cover rounded-md" />
      ) : (
        <div className="text-center text-gray-400">
          <UploadIcon className="w-10 h-10 mx-auto text-gray-500 group-hover:text-purple-400 transition-colors" />
          <p className="mt-2 text-sm">{label}</p>
        </div>
      )}
    </div>
  );
};