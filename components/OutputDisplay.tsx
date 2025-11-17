
import React from 'react';
import type { ApiResponse } from '../types';
import { CopyButton } from './CopyButton';
import { PenIcon, CameraIcon, HashtagIcon, TwitterIcon, LinkedinIcon, LightbulbIcon, ArrowRightIcon, BrainCircuitIcon, SparklesIcon } from './Icons';

interface OutputDisplayProps {
  response: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
  isImageLoading: boolean;
  onRegenerateImage: () => void;
  onScamperClick: (postText: string) => void;
}

const ImageLoadingSkeleton: React.FC = () => (
    <div className="bg-slate-700 animate-pulse w-full aspect-square rounded-lg flex items-center justify-center">
        <CameraIcon className="w-12 h-12 text-slate-500" />
    </div>
);


const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, generatedImage, isImageLoading, onRegenerateImage, onScamperClick }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[400px]">
        <BrainCircuitIcon className="w-16 h-16 text-blue-400 animate-pulse mb-4" />
        <p className="text-xl font-bold text-slate-300">يفكر ويبدع...</p>
        <p className="text-slate-400">المارد بيفكر بس ثواني...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-900/20 border border-red-500 text-red-300 p-6 rounded-2xl min-h-[400px]">
        <p>{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[400px]">
        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <SparklesIcon className="w-12 h-12 text-slate-500" />
        </div>
        <p className="text-xl font-bold text-slate-300">النتائج ستظهر هنا</p>
        <p className="text-slate-400 text-center">املأ النموذج على اليسار لبدء الإبداع.</p>
      </div>
    );
  }

  const { contentCreation, platformAdaptation, strategicInsights } = response;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4 text-blue-300">إبداع المحتوى</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-lg h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-300"><PenIcon className="w-5 h-5" /> نص البوست</h4>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onScamperClick(contentCreation.post_text)}
                                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300"
                                title="ورشة سكامبر الإبداعية"
                            >
                                <LightbulbIcon className="w-5 h-5 text-yellow-300" />
                            </button>
                            <CopyButton textToCopy={contentCreation.post_text} />
                        </div>
                    </div>
                    <p className="text-slate-200 whitespace-pre-wrap flex-1">{contentCreation.post_text}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-300 mb-2"><HashtagIcon className="w-5 h-5" /> الهاشتاقات</h4>
                    <div className="flex flex-wrap gap-2">
                    {contentCreation.hashtags.map((tag, i) => (
                        <span key={i} className="bg-blue-900/50 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                    ))}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-300"><CameraIcon className="w-5 h-5" /> الصورة المولّدة</h4>
                        <button onClick={onRegenerateImage} disabled={isImageLoading} className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md disabled:opacity-50">إعادة توليد</button>
                    </div>
                    {isImageLoading ? <ImageLoadingSkeleton /> : (
                        generatedImage ? <img src={`data:image/jpeg;base64,${generatedImage}`} alt="Generated content" className="w-full h-auto rounded-lg" /> : <div className="w-full aspect-square bg-slate-700 rounded-lg flex items-center justify-center"><p className="text-slate-400">لم يتم توليد صورة</p></div>
                    )}
                </div>
                 <div className="bg-slate-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-300 text-sm">وصف الصورة (Prompt)</h4>
                        <CopyButton textToCopy={contentCreation.image_prompt} />
                    </div>
                    <p className="text-slate-400 italic text-xs">{contentCreation.image_prompt}</p>
                 </div>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4 text-teal-300">تكييف للمنصات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="flex items-center gap-2 font-semibold text-slate-300"><TwitterIcon className="w-5 h-5" /> نسخة منصة X</h4>
              <CopyButton textToCopy={platformAdaptation.twitter_version} />
            </div>
            <p className="text-slate-200 whitespace-pre-wrap">{platformAdaptation.twitter_version}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
             <div className="flex justify-between items-center mb-2">
               <h4 className="flex items-center gap-2 font-semibold text-slate-300"><LinkedinIcon className="w-5 h-5" /> نسخة LinkedIn</h4>
               <CopyButton textToCopy={platformAdaptation.linkedin_version} />
            </div>
            <p className="text-slate-200 whitespace-pre-wrap">{platformAdaptation.linkedin_version}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4 text-purple-300">أفكار استراتيجية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="flex items-center gap-2 font-semibold text-slate-300 mb-2"><LightbulbIcon className="w-5 h-5" /> خطافات (Hooks) مقترحة</h4>
              <ul className="list-disc list-inside space-y-2 text-slate-200">
                {strategicInsights.hook_suggestion.map((hook, i) => <li key={i}>{hook}</li>)}
              </ul>
            </div>
             <div className="bg-slate-900 p-4 rounded-lg">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="flex items-center gap-2 font-semibold text-slate-300"><ArrowRightIcon className="w-5 h-5" /> فكرة للخطوة التالية</h4>
                 <CopyButton textToCopy={strategicInsights.next_step_idea} />
               </div>
               <p className="text-slate-200">{strategicInsights.next_step_idea}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;
