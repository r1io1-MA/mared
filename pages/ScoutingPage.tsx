import React, { useState } from 'react';
import { BinocularsIcon, ExternalLinkIcon, TrashIcon, PlusIcon } from '../components/Icons';

type Agency = {
  name: string;
  description: string;
  website: string;
};

const initialAgencies: Agency[] = [
  {
    name: 'UM7',
    description: 'وكالة رائدة في التسويق الرقمي والحلول الإبداعية، متخصصة في بناء وتطوير العلامات التجارية في السعودية.',
    website: 'https://um7.sa',
  },
  {
    name: 'Leo Burnett KSA',
    description: 'جزء من شبكة إعلانية عالمية، تشتهر بحملاتها الإبداعية المؤثرة وقدرتها على بناء علاقات قوية بين العلامات التجارية والجمهور.',
    website: 'https://leoburnett.com/saudi-arabia',
  },
  {
    name: 'Blue',
    description: 'وكالة إبداعية تقدم حلولاً متكاملة في التسويق والإعلان الرقمي وتركز على تحقيق نتائج ملموسة لعملائها.',
    website: 'https://byblue.sa',
  },
  {
    name: '3Points',
    description: 'وكالة متخصصة في الاتصال الإبداعي والاستراتيجي، تقدم خدمات في الإعلان والعلاقات العامة وإدارة الفعاليات.',
    website: 'https://3pts.com',
  },
  {
    name: 'Extend',
    description: 'تقدم حلول تسويقية مبتكرة وتصاميم إبداعية تساعد العلامات التجارية على النمو والتوسع في السوق الرقمي.',
    website: 'https://extend.com.sa',
  },
];

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

const AgencyCard: React.FC<{ agency: Agency, onDelete: (name: string) => void }> = ({ agency, onDelete }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative group">
    <button
      onClick={() => onDelete(agency.name)}
      className="absolute top-3 left-3 p-1.5 bg-slate-700/50 rounded-full text-slate-400 hover:bg-red-800 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      title="حذف الوكالة"
    >
      <TrashIcon className="w-4 h-4" />
    </button>
    <div>
      <h3 className="text-xl font-bold text-teal-300">{agency.name}</h3>
      <p className="text-slate-400 mt-2 text-sm">{agency.description}</p>
    </div>
    <a 
      href={agency.website} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-slate-700/70 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600/70 transition-colors"
    >
      <span>زيارة الموقع الإلكتروني</span>
      <ExternalLinkIcon className="w-4 h-4" />
    </a>
  </div>
);

const ScoutingPage: React.FC = () => {
  const [agencies, setAgencies] = useLocalStorage<Agency[]>('scouting_agencies_websites', initialAgencies);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newAgency, setNewAgency] = useState<Agency>({ name: '', description: '', website: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAgency(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgency.name || !newAgency.website) {
      alert('الرجاء إدخال اسم الوكالة ورابط الموقع على الأقل.');
      return;
    }
    setAgencies(prev => [...prev, newAgency]);
    setNewAgency({ name: '', description: '', website: '' });
    setIsFormVisible(false);
  };

  const handleDeleteAgency = (nameToDelete: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${nameToDelete}" من قائمتك؟`)) {
        setAgencies(prev => prev.filter(agency => agency.name !== nameToDelete));
    }
  };

  const inputStyles = "w-full p-2 glass-input rounded-md";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <BinocularsIcon className="w-16 h-16 mx-auto text-teal-300 mb-3" />
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">الاسكاوتنج</h2>
        <p className="text-slate-400 mt-3 max-w-2xl mx-auto">استلهم من الأفضل في السوق. أضف مواقع الوكالات لتكوّن قائمة الإلهام الخاصة بك.</p>
      </div>

      <div className="mb-8 text-center">
        <button 
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="inline-flex items-center gap-2 px-6 py-2 font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
            <PlusIcon className="w-5 h-5" />
            {isFormVisible ? 'إغلاق النموذج' : 'إضافة موقع وكالة'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-10 glass-panel p-6 rounded-2xl max-w-2xl mx-auto animate-slide-in-up">
            <form onSubmit={handleAddAgency} className="space-y-4">
                <h3 className="text-lg font-bold text-center text-slate-200">إضافة موقع جديد لقائمة الإلهام</h3>
                <input type="text" name="name" value={newAgency.name} onChange={handleInputChange} placeholder="اسم الوكالة" required className={inputStyles} />
                <textarea name="description" value={newAgency.description} onChange={handleInputChange} placeholder="وصف قصير" rows={2} className={inputStyles}></textarea>
                <input type="url" name="website" value={newAgency.website} onChange={handleInputChange} placeholder="رابط الموقع الإلكتروني" required className={inputStyles} />
                <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setIsFormVisible(false)} className="w-full py-2 px-4 rounded-lg bg-slate-700/70 hover:bg-slate-600/70 transition-colors">إلغاء</button>
                    <button type="submit" className="w-full py-2 px-4 font-bold rounded-lg bg-teal-600 hover:bg-teal-500 transition-colors">حفظ الموقع</button>
                </div>
            </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((agency) => (
          <AgencyCard key={agency.name} agency={agency} onDelete={handleDeleteAgency} />
        ))}
      </div>
    </div>
  );
};

export default ScoutingPage;