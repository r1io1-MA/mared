import React from 'react';
import type { InstagramAnalysisResult } from '../types';
import { LightbulbIcon } from './Icons';

interface AnalysisResultDisplayProps {
  result: InstagramAnalysisResult;
}

const StatDisplay: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="glass-panel-darker p-4 rounded-lg text-center">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatDisplay label="متابع" value={result.followers.toLocaleString('ar-SA')} />
        <StatDisplay label="متوسط الإعجابات" value={result.avgLikes.toLocaleString('ar-SA')} />
        <StatDisplay label="معدل التفاعل" value={result.engagementRate} />
      </div>
      <div className="glass-panel-darker p-4 rounded-lg border border-yellow-500/30">
        <h4 className="flex items-center gap-2 font-bold text-yellow-300 mb-2">
          <LightbulbIcon className="w-5 h-5" />
          تحليل المارد
        </h4>
        <p className="text-slate-200 whitespace-pre-wrap">{result.aiInsight}</p>
      </div>
    </div>
  );
};

export default AnalysisResultDisplay;