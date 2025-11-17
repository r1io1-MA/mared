
import React, { useState, useCallback } from 'react';
import { generateIdeasFromKeyword } from '../services/geminiService';
import type { IdeasBankResponse } from '../types';
import { LightbulbIcon, BrainCircuitIcon } from '../components/Icons';
import { CopyButton } from '../components/CopyButton';

const keywords = [
  "عقارات", "مطاعم وكافيهات", "تسويق رقمي", "موضة وأزياء", 
  "صحة ولياقة", "سفر وسياحة", "تقنية", "تعليم"
];

const IdeasBank: React.FC = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const handleKeywordClick = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setIdeas([]);
    setSelectedKeyword(keyword);

    try {
      const response: IdeasBankResponse = await generateIdeasFromKeyword(keyword);
      setIdeas(response.ideas);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء توليد الأفكار. جرب مرة ثانية.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <LightbulbIcon className="w-12 h-12 mx-auto text-yellow-300 mb-2" />
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">بنك الأفكار</h2>
        <p className="text-slate-400 mt-2">اختر مجالاً، والمارد يلهمك بأفكار جديدة ومبتكرة.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-lg font-bold text-slate-300 mb-4">اختر كلمة مفتاحية:</h3>
        <div className="flex flex-wrap gap-3">
          {keywords.map(keyword => (
            <button
              key={keyword}
              onClick={() => handleKeywordClick(keyword)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-200
                ${selectedKeyword === keyword ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center bg-slate-800 p-6 rounded-2xl min-h-[200px]">
            <BrainCircuitIcon className="w-12 h-12 text-blue-400 animate-pulse mb-3" />
            <p className="text-lg font-bold text-slate-300">المارد يستلهم الأفكار...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-xl text-center">
            {error}
          </div>
        )}
        {ideas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-200">أفكار مقترحة لـ "{selectedKeyword}":</h3>
            {ideas.map((idea, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center gap-4">
                <p className="text-slate-200">{idea}</p>
                <CopyButton textToCopy={idea} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeasBank;