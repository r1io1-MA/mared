
import React, { useState } from 'react';
import type { HistoryItem } from '../types';
// FIX: The ChevronDownIcon component is now correctly imported, resolving the module error.
import { HistoryIcon, TrashIcon, ChevronDownIcon } from '../components/Icons';
import { CopyButton } from '../components/CopyButton';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};


const HistoryCard: React.FC<{ item: HistoryItem; onDelete: (id: string) => void; }> = ({ item, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex justify-between items-center text-left bg-slate-800 hover:bg-slate-700/50">
                <div>
                    <p className="font-bold text-blue-300">{item.userInput.user_idea.substring(0, 50)}...</p>
                    <p className="text-xs text-slate-400">{new Date(item.date).toLocaleString('ar-SA')}</p>
                </div>
                 {/* FIX: Replaced inline SVG with the ChevronDownIcon component for consistency. */}
                <ChevronDownIcon className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-slate-700 space-y-4">
                    {item.generatedImage && (
                        <img src={`data:image/jpeg;base64,${item.generatedImage}`} alt="Generated" className="rounded-lg w-full max-w-sm mx-auto" />
                    )}
                     <div>
                        <h4 className="font-semibold text-teal-300 mb-1">نص البوست:</h4>
                        <div className="bg-slate-900 p-3 rounded-md relative">
                            <p className="text-slate-200 whitespace-pre-wrap">{item.apiResponse.contentCreation.post_text}</p>
                            <div className="absolute top-2 left-2"><CopyButton textToCopy={item.apiResponse.contentCreation.post_text} /></div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-purple-300 mb-1">فكرة الخطوة التالية:</h4>
                         <div className="bg-slate-900 p-3 rounded-md relative">
                            <p className="text-slate-200">{item.apiResponse.strategicInsights.next_step_idea}</p>
                            <div className="absolute top-2 left-2"><CopyButton textToCopy={item.apiResponse.strategicInsights.next_step_idea} /></div>
                        </div>
                    </div>
                     <button onClick={() => onDelete(item.id)} className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-md transition-colors">
                        <TrashIcon className="w-4 h-4"/>
                        حذف من السجل
                    </button>
                </div>
            )}
        </div>
    )
}


const History: React.FC = () => {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('generationHistory', []);

  const handleDelete = (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا العنصر من السجل؟')) {
        setHistory(prev => prev.filter(item => item.id !== id));
    }
  };
  
  const handleClearHistory = () => {
    if(window.confirm('تحذير! سيتم حذف جميع سجلاتك بشكل نهائي. هل أنت متأكد؟')) {
        setHistory([]);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <HistoryIcon className="w-12 h-12 mx-auto text-blue-300 mb-2" />
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-400">سجل المحتوى</h2>
        <p className="text-slate-400 mt-2">جميع إبداعاتك مع المارد محفوظة هنا.</p>
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
            <div className="text-center">
                <button onClick={handleClearHistory} className="text-sm text-slate-500 hover:text-red-400 transition-colors">مسح السجل بالكامل</button>
            </div>
            {history.map(item => (
                <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
        </div>
      ) : (
        <div className="text-center bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <p className="text-slate-400">لا يوجد شيء في سجلك حتى الآن.</p>
            <p className="text-slate-500 text-sm mt-1">ابدأ بتوليد محتوى جديد وستجده هنا.</p>
        </div>
      )}
    </div>
  );
};

export default History;
