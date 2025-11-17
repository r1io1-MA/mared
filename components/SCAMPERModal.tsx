import React, { useState, useEffect } from 'react';
import { generateScamperIdeas } from '../services/geminiService';
import type { ScamperResponse, ScamperSuggestion } from '../types';
import { CloseIcon, LightbulbIcon, BrainCircuitIcon } from './Icons';

interface SCAMPERModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPostText: string;
  onIdeaSelect: (idea: string) => void;
}

const SCAMPER_MAP: { key: keyof ScamperResponse; letter: string; title: string; color: string }[] = [
    { key: 'substitute', letter: 'S', title: 'استبدال (Substitute)', color: 'border-blue-500' },
    { key: 'combine', letter: 'C', title: 'دمج (Combine)', color: 'border-teal-500' },
    { key: 'adapt', letter: 'A', title: 'تكييف (Adapt)', color: 'border-green-500' },
    { key: 'modify', letter: 'M', title: 'تعديل (Modify)', color: 'border-yellow-500' },
    { key: 'put_to_another_use', letter: 'P', title: 'استخدام آخر (Put)', color: 'border-orange-500' },
    { key: 'eliminate', letter: 'E', title: 'إزالة (Eliminate)', color: 'border-red-500' },
    { key: 'reverse', letter: 'R', title: 'عكس (Reverse)', color: 'border-purple-500' },
];

const ScamperCard: React.FC<{ suggestion: ScamperSuggestion; onClick: () => void }> = ({ suggestion, onClick }) => {
  const mapping = SCAMPER_MAP.find(m => m.letter === suggestion.letter);
  const borderColor = mapping ? mapping.color : 'border-slate-600';

  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-4 bg-slate-800/60 rounded-lg border-2 ${borderColor} hover:bg-slate-700/70 transition-all duration-200 transform hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/80 flex items-center justify-center font-extrabold text-lg ${borderColor.replace('border-', 'text-')}`}>
          {suggestion.letter}
        </div>
        <div>
          <h4 className="font-bold text-slate-200">{suggestion.title}</h4>
          <p className="text-slate-300 text-sm mt-1">{suggestion.idea}</p>
        </div>
      </div>
    </button>
  );
};


const SCAMPERModal: React.FC<SCAMPERModalProps> = ({ isOpen, onClose, originalPostText, onIdeaSelect }) => {
  const [ideas, setIdeas] = useState<ScamperSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchIdeas = async () => {
        setIsLoading(true);
        setError(null);
        setIdeas(null);
        try {
          const response = await generateScamperIdeas(originalPostText);
          const formattedIdeas = SCAMPER_MAP.map(item => ({
              ...item,
              idea: response[item.key]
          }));
          setIdeas(formattedIdeas);
        } catch (err) {
          setError('حدث خطأ أثناء استلهام الأفكار. الرجاء المحاولة مرة أخرى.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchIdeas();
    }
  }, [isOpen, originalPostText]);

  if (!isOpen) return null;

  const handleCardClick = (idea: string) => {
    onIdeaSelect(idea);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <LightbulbIcon className="w-8 h-8 text-yellow-300" />
            <div>
                 <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    ورشة سكامبر للخطافات (Hooks)
                 </h2>
                 <p className="text-xs text-slate-400">حوّل فكرتك إلى 7 خطافات جديدة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <CloseIcon className="w-6 h-6 text-slate-400" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <BrainCircuitIcon className="w-12 h-12 text-blue-400 animate-pulse mb-3" />
              <p className="text-lg font-bold text-slate-300">المارد يحلل ويبتكر...</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center min-h-[300px] text-red-400">
              {error}
            </div>
          )}
          {ideas && (
            <div className="space-y-4">
              {ideas.map((suggestion) => (
                <ScamperCard
                  key={suggestion.letter}
                  suggestion={suggestion}
                  onClick={() => handleCardClick(suggestion.idea)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SCAMPERModal;