import React, { useState } from 'react';
import type { InstagramAnalysisResult } from '../types';
import { analyzeInstagramProfile } from '../services/geminiService';
import { ChartBarIcon, LightbulbIcon, CloseIcon, LinkIcon, BrainCircuitIcon } from '../components/Icons';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';

// Mock Data for the table - this remains as static historical example
const mockPerformanceData = [
  {
    id: '1',
    postSnippet: 'هل فكرت كيف يغير الذكاء الاصطناعي مستقبل التسويق؟ 🤔...',
    likes: 580,
    comments: 45,
    aiInsight: 'نجاح هذا البوست يرجع لاستخدام سؤال مباشر في البداية، مما أثار فضول الجمهور وحفزهم على التفاعل لمعرفة الإجابة.',
  },
  {
    id: '2',
    postSnippet: 'نقدم لكم منتجنا الجديد "X" الذي سيحل جميع مشاكلكم...',
    likes: 120,
    comments: 8,
    aiInsight: 'الأداء كان متوسطًا. يُنصح في المرة القادمة بالتركيز على فائدة واحدة ومحددة للمنتج بدلاً من العبارات العامة، مع استخدام صورة أكثر جاذبية.',
  },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
    <div className="bg-slate-700/50 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const InsightModal: React.FC<{ insight: string; onClose: () => void }> = ({ insight, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="glass-panel w-full max-w-lg p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-300"><LightbulbIcon className="w-6 h-6"/> تحليل المارد</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><CloseIcon className="w-5 h-5"/></button>
            </div>
            <p className="text-slate-200">{insight}</p>
        </div>
    </div>
)


const AnalyticsDashboard: React.FC = () => {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [pageLink, setPageLink] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<InstagramAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!pageLink || !pageLink.includes('instagram.com')) {
        setError("الرجاء إدخال رابط صفحة انستجرام صالح.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
        const result = await analyzeInstagramProfile(pageLink);
        setAnalysisResult(result);
    } catch (err) {
        setError("فشل تحليل الصفحة. الرجاء المحاولة مرة أخرى.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {selectedInsight && <InsightModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />}
      <div className="text-center">
        <ChartBarIcon className="w-12 h-12 mx-auto text-blue-300 mb-2" />
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-400">المحلل الذكي</h2>
        <p className="text-slate-400 mt-2">افهم أداء محتواك واعرف "لماذا" نجح أو فشل.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="إجمالي الوصول" value="15,7K" icon={<span className="text-2xl">🚀</span>} />
        <StatCard title="متوسط التفاعل" value="8.2%" icon={<span className="text-2xl">❤️</span>} />
        <StatCard title="أفضل وقت للنشر" value="8 مساءً" icon={<span className="text-2xl">⏰</span>} />
      </div>

      {/* Live Analysis */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-4 text-slate-200">تحليل مباشر لصفحة انستجرام</h3>
        <div className="space-y-2">
            <label htmlFor="pageLink" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <LinkIcon className="w-4 h-4" />
              أدخل رابط الصفحة
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                id="pageLink"
                type="url" 
                value={pageLink}
                onChange={(e) => { setPageLink(e.target.value); setError(null); }}
                placeholder="https://www.instagram.com/username"
                className="w-full p-2 glass-input rounded-md"
              />
              <button 
                onClick={handleAnalyze} 
                disabled={isLoading}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-md font-bold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                 {isLoading && <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                 {isLoading ? 'يتم التحليل...' : 'تحليل'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        
        {isLoading && (
             <div className="flex flex-col items-center justify-center pt-8 text-center">
                <BrainCircuitIcon className="w-10 h-10 text-blue-400 animate-pulse mb-3" />
                <p className="text-md font-bold text-slate-300">المارد يجمع البيانات ويحللها...</p>
                <p className="text-sm text-slate-400">قد يستغرق هذا بضع ثوانٍ.</p>
            </div>
        )}

        {analysisResult && (
            <div className="mt-6 animate-slide-in-up">
                <AnalysisResultDisplay result={analysisResult} />
            </div>
        )}
      </div>


      {/* Posts Analysis Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <h3 className="text-xl font-bold p-6 text-slate-200">تحليل آخر البوستات (أمثلة)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4 font-semibold text-slate-400">البوست</th>
                <th className="p-4 font-semibold text-slate-400">الأداء</th>
                <th className="p-4 font-semibold text-slate-400">تحليل المارد</th>
              </tr>
            </thead>
            <tbody>
              {mockPerformanceData.map((post) => (
                <tr key={post.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-300 max-w-md truncate">{post.postSnippet}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span title="لايكات">📈 {post.likes}</span>
                      <span title="تعليقات">💬 {post.comments}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                        onClick={() => setSelectedInsight(post.aiInsight)}
                        className="flex items-center gap-1 text-sm bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full hover:bg-yellow-900/70 transition-colors"
                    >
                      <LightbulbIcon className="w-4 h-4" />
                      <span>عرض التحليل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;