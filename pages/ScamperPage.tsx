import React, { useState, useCallback } from 'react';
import { generateScamperIdeas } from '../services/geminiService';
import type { ScamperResponse, ScamperSuggestion } from '../types';
import { BrainCircuitIcon, LightbulbIcon } from '../components/Icons';
import { CopyButton } from '../components/CopyButton';

const SCAMPER_MAP: { key: keyof ScamperResponse; letter: string; title: string; color: string }[] = [
    { key: 'substitute', letter: 'S', title: 'استبدال (Substitute)', color: 'border-blue-500' },
    { key: 'combine', letter: 'C', title: 'دمج (Combine)', color: 'border-teal-500' },
    { key: 'adapt', letter: 'A', title: 'تكييف (Adapt)', color: 'border-green-500' },
    { key: 'modify', letter: 'M', title: 'تعديل (Modify)', color: 'border-yellow-500' },
    { key: 'put_to_another_use', letter: 'P', title: 'استخدام آخر (Put)', color: 'border-orange-500' },
    { key: 'eliminate', letter: 'E', title: 'إزالة (Eliminate)', color: 'border-red-500' },
    { key: 'reverse', letter: 'R', title: 'عكس (Reverse)', color: 'border-purple-500' },
];

const ScamperCard: React.FC<{ suggestion: ScamperSuggestion; }> = ({ suggestion }) => {
  const mapping = SCAMPER_MAP.find(m => m.letter === suggestion.letter);
  const borderColor = mapping ? mapping.color : 'border-slate-600';

  return (
    <div
      className={`w-full text-right p-4 bg-slate-800/60 rounded-lg border-2 ${borderColor} transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/80 flex items-center justify-center font-extrabold text-lg ${borderColor.replace('border-', 'text-')}`}>
          {suggestion.letter}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-200">{suggestion.title}</h4>
          <p className="text-slate-300 text-sm mt-1">{suggestion.idea}</p>
        </div>
        <CopyButton textToCopy={suggestion.idea} />
      </div>
    </div>
  );
};

const ScamperPage: React.FC = () => {
    const [originalHook, setOriginalHook] = useState('');
    const [ideas, setIdeas] = useState<ScamperSuggestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!originalHook.trim()) return;
        setIsLoading(true);
        setError(null);
        setIdeas(null);
        try {
            const response = await generateScamperIdeas(originalHook);
            const formattedIdeas = SCAMPER_MAP.map(item => ({
                ...item,
                idea: response[item.key]
            }));
            setIdeas(formattedIdeas);
        } catch (err) {
            setError('حدث خطأ أثناء استلهام الخطافات. الرجاء المحاولة مرة أخرى.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originalHook]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <BrainCircuitIcon className="w-12 h-12 mx-auto text-yellow-300 mb-2" />
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    ورشة سكامبر للخطافات (Hooks)
                </h2>
                <p className="text-slate-400 mt-2">أدخل أي خطاف (Hook)، وشاهد المارد يحوله إلى 7 خطافات جديدة ومبتكرة.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-lg space-y-4">
                <textarea
                    value={originalHook}
                    onChange={(e) => setOriginalHook(e.target.value)}
                    rows={3}
                    className="w-full p-3 glass-input rounded-lg"
                    placeholder="اكتب هنا الخطاف (Hook) الأصلي..."
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !originalHook.trim()}
                    className="w-full flex items-center justify-center gap-3 text-lg font-bold py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg hover:from-yellow-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'المارد يبتكر خطافات...' : (
                        <>
                            <LightbulbIcon className="w-6 h-6" />
                            ولّد 7 خطافات جديدة
                        </>
                    )}
                </button>
            </div>

            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        <BrainCircuitIcon className="w-12 h-12 text-blue-400 animate-pulse mb-3" />
                        <p className="text-lg font-bold text-slate-300">لحظات من الإبداع...</p>
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
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScamperPage;