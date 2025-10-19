import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { generateCharacterImages } from '../services/geminiService';
import { ResultDisplay } from './ResultDisplay';
import { CloseIcon } from './icons/CloseIcon';

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-purple-300 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
        />
    </div>
);

const PreviewModal: React.FC<{ image: string; onClose: () => void }> = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={image} alt="Character preview" className="object-contain w-full h-full rounded-lg" />
            <button onClick={onClose} className="absolute -top-4 -right-4 bg-gray-800 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                <CloseIcon />
            </button>
        </div>
    </div>
);


export const AIVideoCharacterCreator: React.FC = () => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Photorealistic, 4K');
    const [pose, setPose] = useState('Standing, facing forward');
    const [clothing, setClothing] = useState('Modern casual wear');
    const [background, setBackground] = useState('Neutral studio background');
    
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const result = await generateCharacterImages(prompt, style, pose, clothing, background);
            setImages(result);
        } catch (err: any) {
            setError(t(err.message) || t('errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full overflow-hidden flex flex-col">
            <div className="hud-border p-6 flex-grow overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
                    {/* Form */}
                    <div className="flex flex-col">
                         <h3 className="text-xl font-bold text-cyan-300 mb-4">{t('aiVideo.characterCreator.formTitle')}</h3>
                         <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow">
                            <InputField 
                                label={t('aiVideo.characterCreator.promptLabel')}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t('aiVideo.characterCreator.promptPlaceholder')}
                            />
                             <InputField 
                                label={t('aiVideo.characterCreator.styleLabel')}
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            />
                             <InputField 
                                label={t('aiVideo.characterCreator.poseLabel')}
                                value={pose}
                                onChange={(e) => setPose(e.target.value)}
                            />
                             <InputField 
                                label={t('aiVideo.characterCreator.clothingLabel')}
                                value={clothing}
                                onChange={(e) => setClothing(e.target.value)}
                            />
                             <InputField 
                                label={t('aiVideo.characterCreator.backgroundLabel')}
                                value={background}
                                onChange={(e) => setBackground(e.target.value)}
                            />
                             <button type="submit" disabled={isLoading || !prompt} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all disabled:bg-gray-600">
                                {isLoading ? t('aiVideo.characterCreator.generatingButton') : t('aiVideo.characterCreator.generateButton')}
                            </button>
                         </form>
                    </div>
                    {/* Results */}
                    <div className="flex flex-col">
                        <div className="overflow-y-auto pr-2 flex-grow">
                             {error && <p className="text-red-400 text-center p-4">{error}</p>}
                             <ResultDisplay images={images} isLoading={isLoading} onPreview={setPreviewImage} />
                        </div>
                    </div>
                </div>
            </div>
             {previewImage && <PreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />}
        </div>
    );
};