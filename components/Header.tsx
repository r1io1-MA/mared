
import React from 'react';
import { MenuIcon, SparklesIcon } from './Icons';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center p-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 md:hidden">
      <button onClick={onMenuClick} className="text-slate-300 hover:text-white p-2">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex-1 text-center">
        <div className="inline-flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              المارد
            </h1>
        </div>
        <p className="text-xs text-slate-500 tracking-widest">
            فقط لفريق أزرق
        </p>
      </div>
      <div className="w-8"></div>
    </header>
  );
};

export default Header;
