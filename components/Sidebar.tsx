import React from 'react';
import { SparklesIcon, HomeIcon, LightbulbIcon, GitBranchIcon, HistoryIcon, CloseIcon, ChevronRightIcon, ChevronLeftIcon, BinocularsIcon, BrainCircuitIcon, ChartBarIcon, RadarIcon } from './Icons';

type ActiveView = 'generator' | 'bank' | 'mindmap' | 'history' | 'scouting' | 'scamper' | 'analytics' | 'trends';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, activeView, setActiveView }) => {
  const navItems = [
    { id: 'generator', label: 'مولّد المحتوى', icon: HomeIcon },
    { id: 'bank', label: 'بنك الأفكار', icon: LightbulbIcon },
    { id: 'mindmap', label: 'خريطة الأفكار', icon: GitBranchIcon },
    { id: 'scamper', label: 'ورشة سكامبر', icon: BrainCircuitIcon },
    { id: 'analytics', label: 'المحلل الذكي', icon: ChartBarIcon },
    { id: 'trends', label: 'رادار الترند', icon: RadarIcon },
    { id: 'scouting', label: 'الاسكاوتنج', icon: BinocularsIcon },
    { id: 'history', label: 'سجل المحتوى', icon: HistoryIcon },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
        setIsOpen(false);
    }
  };

  const activeClass = "bg-blue-500/30 text-white";
  const inactiveClass = "text-slate-400 hover:bg-white/10 hover:text-white";

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside className={`fixed top-0 right-0 h-full glass-panel z-40 flex flex-col
        transform transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:w-auto`}>
        <div className={`flex items-center p-4 border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 ${isCollapsed ? 'w-full justify-center' : ''}`}>
                <SparklesIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                {!isCollapsed && <h1 className="text-xl font-bold text-white">المارد</h1>}
            </div>
            <button onClick={() => setIsOpen(false)} className={`md:hidden ${isCollapsed ? 'hidden' : ''} text-slate-400 hover:text-white`}>
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        <nav className="p-2 flex-1">
          <ul>
            {navItems.map(item => (
              <li key={item.id} title={isCollapsed ? item.label : undefined}>
                <button
                  onClick={() => handleNavClick(item.id as ActiveView)}
                  className={`w-full flex items-center gap-3 px-3 py-3 my-1 rounded-lg text-right font-semibold transition-colors ${isCollapsed ? 'justify-center' : ''} ${
                    activeView === item.id ? activeClass : inactiveClass
                  }`}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-2 border-t border-white/10">
             <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full hidden md:flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white justify-center"
                title={isCollapsed ? "توسيع الشريط" : "طي الشريط"}
            >
                {isCollapsed ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;