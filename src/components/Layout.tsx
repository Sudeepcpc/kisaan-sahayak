import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Sprout, 
  HeartPulse, 
  ShieldCheck, 
  Users,
  Mic, 
  ChevronLeft,
  X,
  History,
  Newspaper
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onVoiceClick: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title: string;
  onHistoryClick: () => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  onTabChange, 
  onVoiceClick,
  showBack,
  onBack,
  title,
  onHistoryClick
}: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-brand-bg font-sans text-brand-dark overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b-3 border-[#E9EDC9] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              id="back-button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-6 h-6 text-brand-green" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-brand-dark tracking-tight leading-none uppercase">
              {title}
            </h1>
            <span className="text-[10px] text-brand-green font-bold uppercase tracking-wider">Village Smart Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onHistoryClick}
            className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-green transition-all active:translate-y-1 shadow-sm"
            title="History"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            id="voice-trigger"
            onClick={onVoiceClick}
            className="p-3 bg-brand-blue text-white rounded-full hover:shadow-[0_4px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all shadow-[0_6px_0_#1E3A8A]"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 px-4 py-3 pb-8 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <TabButton 
          id="nav-home"
          icon={<Home />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')} 
        />
        <TabButton 
          id="nav-crops"
          icon={<Sprout />} 
          label="Crops" 
          active={activeTab === 'crops'} 
          onClick={() => onTabChange('crops')} 
        />
        <TabButton 
          id="nav-health"
          icon={<HeartPulse />} 
          label="Health" 
          active={activeTab === 'health'} 
          onClick={() => onTabChange('health')} 
        />
        <TabButton 
          id="nav-community"
          icon={<Users />} 
          label="Social" 
          active={activeTab === 'community'} 
          onClick={() => onTabChange('community')} 
        />
        <TabButton 
          id="nav-village"
          icon={<ShieldCheck />} 
          label="Village" 
          active={activeTab === 'village'} 
          onClick={() => onTabChange('village')} 
        />
        <TabButton 
          id="nav-news"
          icon={<Newspaper />} 
          label="News" 
          active={activeTab === 'news'} 
          onClick={() => onTabChange('news')} 
        />
      </nav>
    </div>
  );
}

function TabButton({ icon, label, active, onClick, id }: { 
  icon: React.ReactElement, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  id: string 
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-brand-blue scale-110' : 'text-slate-400'
      }`}
    >
      {React.cloneElement(icon, { className: `w-6 h-6 ${active ? 'fill-brand-blue/20' : ''}` })}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
