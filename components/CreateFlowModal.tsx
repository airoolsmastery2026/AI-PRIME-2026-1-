

import React, { useState } from 'react';
import { FlowStepType, FlowStep } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useTranslation } from '../i18n/useTranslation';

interface CreateFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (flowData: { name: string; description: string; steps: FlowStep[] }) => void;
}

type StepFormData = {
    name: string;
    service: string;
    type: FlowStepType;
};

export const CreateFlowModal: React.FC<CreateFlowModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<StepFormData[]>([]);

    if (!isOpen) return null;

    const addStep = () => {
        setSteps([...steps, { name: '', service: '', type: FlowStepType.Processing }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const handleStepChange = (index: number, field: keyof StepFormData, value: string) => {
        const newSteps = [...steps];
        // This is safe because `value` comes from a select with `FlowStepType` values
        if (field === 'type') {
            newSteps[index] = { ...newSteps[index], [field]: value as FlowStepType };
        } else {
            newSteps[index] = { ...newSteps[index], [field]: value };
        }
        setSteps(newSteps);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !description || steps.length === 0 || steps.some(s => !s.name || !s.service)) {
            alert(t('createFlowModal.alert'));
            return;
        }

        const finalSteps = steps.map((step, index) => ({
            id: index + 1,
            nameKey: step.name, // For user-created flows, nameKey holds the actual string
            type: step.type,
            service: step.service
        }));

        onCreate({ name, description, steps: finalSteps });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="hud-border w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                 <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-300">{t('createFlowModal.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-1">{t('createFlowModal.nameLabel')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-purple-300 mb-1">{t('createFlowModal.descriptionLabel')}</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-20 bg-gray-900/50 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">{t('createFlowModal.stepsLabel')}</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-gray-800/50 p-3 rounded-md border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                               <input type="text" placeholder={t('createFlowModal.stepNamePlaceholder')} value={step.name} onChange={e => handleStepChange(index, 'name', e.target.value)} className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"/>
                               <input type="text" placeholder={t('createFlowModal.stepServicePlaceholder')} value={step.service} onChange={e => handleStepChange(index, 'service', e.target.value)} className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"/>
                                <div className="flex items-center gap-2">
                                    <select value={step.type} onChange={e => handleStepChange(index, 'type', e.target.value)} className="w-full bg-gray-900/80 border border-gray-600 rounded p-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none">
                                        {/* FIX: Use a different variable name in map to avoid type inference issues. */}
                                        {Object.values(FlowStepType).map(typeValue => <option key={typeValue} value={typeValue}>{typeValue}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeStep(index)} className="text-red-500 hover:text-red-400 p-1">&times;</button>
                                </div>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addStep} className="mt-3 text-sm bg-purple-600/50 hover:bg-purple-500/50 text-white font-semibold py-1 px-3 rounded-md transition-colors w-full">{t('createFlowModal.addStepButton')}</button>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition-all">{t('createFlowModal.createButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};