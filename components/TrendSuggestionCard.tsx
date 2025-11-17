import React from 'react';
import type { TrendSuggestion } from '../types';

interface TrendSuggestionCardProps {
  suggestion: TrendSuggestion;
  onUse: (draft: string) => void;
  onDiscard: (id: string) => void;
}

const TrendSuggestionCard: React.FC<TrendSuggestionCardProps> = ({ suggestion, onUse, onDiscard }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 transition-all hover:border-teal-500/50">
      <h3 className="text-lg font-bold text-teal-300">{suggestion.trendTitle}</h3>
      <div className="glass-panel-darker p-4 rounded-lg">
        <p className="text-slate-200 whitespace-pre-wrap">{suggestion.draftPost}</p>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button 
          onClick={() => onDiscard(suggestion.id)}
          className="text-sm font-semibold text-slate-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
        >
          ❌ تجاهل
        </button>
        <button 
          onClick={() => onUse(suggestion.draftPost)}
          className="text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition-colors"
        >
          ✅ استخدام وتعديل
        </button>
      </div>
    </div>
  );
};

export default TrendSuggestionCard;