import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ChatMessage, ChatRole } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { fileToBase64 } from '../utils/fileUtils';
import { GeminiIcon } from './icons/GeminiIcon';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type AiModel = 'fast' | 'default' | 'complex';

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<AiModel>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{ role: 'model', parts: [{ text: "Hello! I'm your AI assistant. How can I help you today? You can ask me questions, or upload an image to analyze." }] }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      setImage({ base64, mimeType: file.type, preview });
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    const userParts: ChatMessage['parts'] = [];
    if (image) {
        userParts.push({ image: { inlineData: { data: image.base64, mimeType: image.mimeType } } });
    }
    if (input.trim()) {
        userParts.push({ text: input });
    }
    
    const userMessage: ChatMessage = { role: 'user', parts: userParts };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setImage(null);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages, // Send previous messages for context
          prompt: input,
          imageBase64: image?.base64,
          mimeType: image?.mimeType,
          mode: model
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'errors.generic');
      }

      const data = await res.json();
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: data.response }] };
      setMessages([...newMessages, modelMessage]);

    } catch (err: any) {
      setError(t(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 ai-chat-window-bg" onClick={onClose} />
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] max-w-lg h-3/4 max-h-[700px] flex flex-col hud-border rounded-lg z-50 ai-chat-window">
        <header className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2"><GeminiIcon className="w-5 h-5" /> AI Assistant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm lg:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-600/50' : 'bg-gray-800/80'}`}>
                {msg.parts.map((part, partIndex) => {
                    if (part.text) {
                        return <p key={partIndex} className="text-sm whitespace-pre-wrap">{part.text}</p>;
                    }
                    if (part.image?.inlineData) {
                        return <img key={partIndex} src={`data:${part.image.inlineData.mimeType};base64,${part.image.inlineData.data}`} alt="User upload" className="rounded-md max-w-full h-auto mt-2" />;
                    }
                    return null;
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                <div className="max-w-sm lg:max-w-md p-3 rounded-lg bg-gray-800/80">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                </div>
            </div>
          )}
          {error && (
            <div className="flex items-end gap-2 justify-start">
              <div className="max-w-sm lg:max-w-md p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300 text-sm">
                <p>{error}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-3 border-t border-gray-700 flex-shrink-0 space-y-2">
            {image && (
                 <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-md">
                    <img src={image.preview} alt="Preview" className="w-10 h-10 rounded-md object-cover" />
                    <p className="text-xs text-gray-400 flex-grow truncate">{image.mimeType}</p>
                    <button onClick={() => setImage(null)} className="text-gray-400 hover:text-red-400"><CloseIcon className="w-4 h-4" /></button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"><PaperClipIcon /></button>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-grow bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                />
                <button onClick={handleSend} disabled={(!input.trim() && !image) || isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-50">Send</button>
            </div>
            <div className="flex justify-end items-center gap-2 pt-1">
                <label className="text-xs text-gray-400">Model:</label>
                <select value={model} onChange={(e) => setModel(e.target.value as AiModel)} className="text-xs bg-gray-900 border border-gray-600 rounded-md p-1 focus:ring-1 focus:ring-purple-500 focus:outline-none">
                    <option value="fast">Fast</option>
                    <option value="default">Balanced</option>
                    <option value="complex">Complex</option>
                </select>
            </div>
        </footer>
      </div>
    </>
  );
};