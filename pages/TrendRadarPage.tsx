import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TrendSuggestion } from '../types';
import { generateTrendDraftPost } from '../services/geminiService';
import { RadarIcon, LinkIcon, UploadIcon, SparklesIcon } from '../components/Icons';
import TrendSuggestionCard from '../components/TrendSuggestionCard';

const mockTrendSuggestions: TrendSuggestion[] = [
  {
    id: '1',
    trendTitle: 'ترند اليوم: اليوم العالمي للقهوة ☕',
    draftPost: 'بمناسبة اليوم العالمي للقهوة، كيف تحبون قهوتكم؟ شاركونا في التعليقات! السعودية كلها تحتفل اليوم. #اليوم_العالمي_للقهوة #قهوة_سعودية',
  },
  {
    id: '2',
    trendTitle: 'منافس يطلق منتج جديد',
    draftPost: 'لاحظنا إطلاق منتج جديد في السوق اليوم. هذا يذكرنا بأهمية [الميزة الفريدة لمنتجك] التي تضمن لكم [الفائدة الرئيسية]. الجودة دائمًا تتحدث عن نفسها. #الجودة_أولاً',
  },
];

interface TrendRadarPageProps {
  setActiveView: (view: 'generator', payload: string) => void;
}


const TrendRadarPage: React.FC<TrendRadarPageProps> = ({ setActiveView }) => {
  const [suggestions, setSuggestions] = useState<TrendSuggestion[]>(mockTrendSuggestions);
  const [trendDescription, setTrendDescription] = useState('');
  const [trendLink, setTrendLink] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUse = (draft: string) => {
    setActiveView('generator', draft);
  };

  const handleDiscard = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendDescription.trim()) {
        setError('الرجاء إدخال وصف للترند.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
        const draftPost = await generateTrendDraftPost({
            description: trendDescription,
            link: trendLink,
            image: !!attachedImage
        });
        
        const newSuggestion: TrendSuggestion = {
            id: uuidv4(),
            trendTitle: `ترند جديد: ${trendDescription.substring(0, 30)}...`,
            draftPost: draftPost
        };
        
        setSuggestions(prev => [newSuggestion, ...prev]);
        // Clear form
        setTrendDescription('');
        setTrendLink('');
        setAttachedImage(null);
        // Reset file input visually
        const fileInput = document.getElementById('trendImage') as HTMLInputElement;
        if(fileInput) fileInput.value = '';

    } catch (err) {
        setError("فشل توليد المسودة. الرجاء المحاولة مرة أخرى.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <RadarIcon className="w-12 h-12 mx-auto text-teal-300 mb-2" />
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">رادار الترند</h2>
        <p className="text-slate-400 mt-2">مسودات جاهزة من المارد لأبرز الترندات في مجالك. كن سبّاقًا دائمًا.</p>
      </div>
      
       <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
        <h3 className="text-xl font-bold mb-4 text-slate-200">إضافة ترند يدويًا</h3>
        <form onSubmit={handleAddTrend} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="trendDescription" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <SparklesIcon className="w-4 h-4" />
              وصف الترند (مطلوب)
            </label>
             <textarea
                id="trendDescription"
                rows={2}
                value={trendDescription}
                onChange={(e) => {setTrendDescription(e.target.value); setError(null);}}
                placeholder="مثال: نقاش دائر حول مستقبل العمل عن بعد في السعودية"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
              />
          </div>
          <div className="space-y-2">
            <label htmlFor="trendLink" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <LinkIcon className="w-4 h-4" />
              رابط الترند (اختياري)
            </label>
             <input 
                id="trendLink"
                type="url" 
                value={trendLink}
                onChange={(e) => setTrendLink(e.target.value)}
                placeholder="ألصق رابط خبر، مقال، أو منشور هنا..."
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
              />
          </div>
           <div className="space-y-2">
            <label htmlFor="trendImage" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <UploadIcon className="w-4 h-4" />
              إرفاق صورة (اختياري)
            </label>
             <input 
                id="trendImage"
                type="file" 
                accept="image/*"
                onChange={(e) => setAttachedImage(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-teal-300 hover:file:bg-slate-600"
              />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
            {isLoading ? 'المارد يكتب المسودة...' : 'توليد مسودة للترند'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-6">
            {suggestions.map((suggestion) => (
                <TrendSuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onUse={handleUse}
                    onDiscard={handleDiscard}
                />
            ))}
        </div>
      ) : (
        <div className="text-center bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <p className="text-slate-400">لا توجد اقتراحات جديدة في الوقت الحالي.</p>
            <p className="text-slate-500 text-sm mt-1">المارد يراقب السوق وسيعلمك بأي جديد.</p>
        </div>
      )}
    </div>
  );
};

export default TrendRadarPage;