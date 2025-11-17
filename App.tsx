import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ContentGenerator from './pages/ContentGenerator';
import IdeasBank from './pages/IdeasBank';
import MindMapPage from './pages/MindMapPage';
import History from './pages/History';
import ScoutingPage from './pages/ScoutingPage';
import ScamperPage from './pages/ScamperPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TrendRadarPage from './pages/TrendRadarPage';


type ActiveView = 'generator' | 'bank' | 'mindmap' | 'history' | 'scouting' | 'scamper' | 'analytics' | 'trends';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('generator');
  const [initialIdea, setInitialIdea] = useState<string>('');

  const handleSetActiveView = (view: ActiveView, payload?: any) => {
    if (view === 'generator' && typeof payload === 'string') {
      setInitialIdea(payload);
    }
    setActiveView(view);
     if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  };


  const renderActiveView = () => {
    switch (activeView) {
      case 'generator':
        return <ContentGenerator 
                  setActiveView={handleSetActiveView} 
                  initialIdea={initialIdea}
                  clearInitialIdea={() => setInitialIdea('')}
                />;
      case 'bank':
        return <IdeasBank />;
      case 'mindmap':
        return <MindMapPage />;
      case 'history':
        return <History />;
      case 'scouting':
        return <ScoutingPage />;
      case 'scamper':
        return <ScamperPage />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'trends':
        return <TrendRadarPage setActiveView={handleSetActiveView} />;
      default:
        return <ContentGenerator 
                  setActiveView={handleSetActiveView}
                  initialIdea={initialIdea}
                  clearInitialIdea={() => setInitialIdea('')}
                />;
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeView={activeView}
        setActiveView={handleSetActiveView}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
        <footer className="text-center py-4 text-slate-500 text-sm">
            <p>إهداء من أخيكم إبراهيم محمد</p>
        </footer>
      </div>
    </div>
  );
};

export default App;