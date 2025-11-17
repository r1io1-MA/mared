
import React, { useState, useEffect } from 'react';
import type { UserInput, BrandVoice } from '../types';
import { PenIcon, BrandIcon, BrainCircuitIcon, SparklesIcon, SaveIcon, TrashIcon } from './Icons';

interface InputFormProps {
  userInput: UserInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserInput>>;
  onGenerate: () => void;
  isLoading: boolean;
  savedVoices: BrandVoice[];
  onSaveVoice: (name: string) => void;
  onDeleteVoice: (id: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ userInput, setUserInput, onGenerate, isLoading, savedVoices, onSaveVoice, onDeleteVoice }) => {
  const [newVoiceName, setNewVoiceName] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandVoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({
      ...prev,
      brand_voice: {
        ...prev.brand_voice,
        [name]: value,
      },
    }));
    setSelectedVoiceId(''); // Reset dropdown if user manually changes a field
  };

  const handleSaveClick = () => {
    if (newVoiceName.trim()) {
        onSaveVoice(newVoiceName);
        setNewVoiceName('');
    }
  };

  const handleLoadVoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const voiceId = e.target.value;
      setSelectedVoiceId(voiceId);
      const voiceToLoad = savedVoices.find(v => v.id === voiceId);
      if(voiceToLoad) {
          setUserInput(prev => ({
              ...prev,
              brand_voice: voiceToLoad
          }))
      }
  };
  
  const isFormValid = userInput.user_idea.trim() !== '' && userInput.brand_voice.tone.trim() !== '' && userInput.brand_voice.audience.trim() !== '' && userInput.brand_voice.goals.trim() !== '';

  const selectStyles = "w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500";
  const inputStyles = "w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500";

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 space-y-6">
      <div>
        <label htmlFor="user_idea" className="flex items-center gap-2 text-lg font-bold mb-2 text-blue-300">
          <PenIcon className="w-6 h-6" />
          الفكرة الأساسية للمحتوى
        </label>
        <textarea
          id="user_idea"
          name="user_idea"
          value={userInput.user_idea}
          onChange={handleInputChange}
          rows={4}
          className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="مثال: إطلاق منتج جديد، نصائح للعناية بالبشرة، إعلان عن خصومات..."
        />
      </div>

      <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-900/50">
        <div className="flex justify-between items-center">
             <h3 className="flex items-center gap-2 text-lg font-bold text-teal-300">
                <BrandIcon className="w-6 h-6" />
                هوية العلامة التجارية
            </h3>
        </div>
        {/* Load/Delete Saved Voices */}
        {savedVoices.length > 0 && (
             <div className="flex gap-2">
                <select value={selectedVoiceId} onChange={handleLoadVoice} className={`${selectStyles} flex-grow`}>
                    <option value="" disabled>تحميل هوية محفوظة...</option>
                    {savedVoices.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                </select>
                {selectedVoiceId && (
                     <button onClick={() => onDeleteVoice(selectedVoiceId)} title="حذف الهوية المحددة" className="p-2 bg-red-800 hover:bg-red-700 rounded-md transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="tone" value={userInput.brand_voice.tone} onChange={handleBrandVoiceChange} className={selectStyles}>
            <option value="" disabled>اختر النبرة...</option>
            <option value="احترافي">احترافي</option>
            <option value="ودي ومرح">ودي ومرح</option>
            <option value="شبابي وعصري">شبابي وعصري</option>
            <option value="رسمي وجاد">رسمي وجاد</option>
            <option value="حماسي وملهم">حماسي وملهم</option>
            <option value="فاخر وراقي">فاخر وراقي</option>
          </select>
          <input type="text" name="audience" value={userInput.brand_voice.audience} onChange={handleBrandVoiceChange} placeholder="الجمهور المستهدف" className={inputStyles} />
          <input type="text" name="keywords" value={userInput.brand_voice.keywords} onChange={handleBrandVoiceChange} placeholder="كلمات مفتاحية (اختياري)" className={inputStyles} />
          <select name="goals" value={userInput.brand_voice.goals} onChange={handleBrandVoiceChange} className={selectStyles}>
            <option value="" disabled>اختر الهدف...</option>
            <option value="زيادة الوعي بالعلامة التجارية">زيادة الوعي</option>
            <option value="زيادة المبيعات بشكل مباشر">زيادة المبيعات</option>
            <option value="جذب عملاء محتملين">جذب عملاء محتملين</option>
            <option value="تعزيز التفاعل والمشاركة">تعزيز التفاعل</option>
            <option value="بناء مجتمع حول العلامة التجارية">بناء مجتمع</option>
            <option value="تثقيف الجمهور">تثقيف الجمهور</option>
          </select>
        </div>
        
         {/* Save new voice */}
        <div className="flex gap-2 pt-2">
            <input 
                type="text" 
                value={newVoiceName}
                onChange={(e) => setNewVoiceName(e.target.value)}
                placeholder="اسم لحفظ الهوية الحالية" 
                className={`${inputStyles} flex-grow`}
            />
            <button 
                onClick={handleSaveClick} 
                disabled={!newVoiceName.trim()}
                className="flex items-center gap-2 p-2 bg-teal-800 hover:bg-teal-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SaveIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
      
      <div>
        <label htmlFor="context_vectors" className="flex items-center gap-2 text-lg font-bold mb-2 text-purple-300">
          <BrainCircuitIcon className="w-6 h-6" />
          أمثلة من محتوى سابق (اختياري)
        </label>
        <textarea
          id="context_vectors"
          name="context_vectors"
          value={userInput.context_vectors}
          onChange={handleInputChange}
          rows={5}
          className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="ألصق هنا 1-3 أمثلة من أفضل منشوراتك السابقة لمساعدة المارد على محاكاة أسلوبك."
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !isFormValid}
        className="w-full flex items-center justify-center gap-3 text-lg font-bold py-3 px-6 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            المارد يبدع...
          </>
        ) : (
          <>
            <SparklesIcon className="w-6 h-6" />
            ولّد المحتوى والصورة
          </>
        )}
      </button>
      {!isFormValid && <p className="text-center text-xs text-slate-400 mt-2">الرجاء ملء الحقول المطلوبة: الفكرة، النبرة، الجمهور، والهدف.</p>}
    </div>
  );
};

export default InputForm;