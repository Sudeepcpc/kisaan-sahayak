import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  HeartPulse, 
  ShieldCheck, 
  Thermometer, 
  Sun, 
  TrendingUp,
  CloudRain,
  MapPin,
  Stethoscope,
  Trophy,
  Medal,
  Star,
  Users,
  LogOut,
  MessageSquare,
  Search,
  Send,
  X,
  Loader2,
  Languages,
  RotateCcw,
  Map as MapIcon,
  BookOpen,
  Volume2,
  AlertTriangle,
  Dog,
  Book,
  Tractor,
  Newspaper,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { generateResponse } from '../lib/gemini';
import { logActivity } from '../lib/tracking';
import { useLanguage } from '../lib/LanguageContext';

interface HomeProps {
  onModuleSelect: (module: string) => void;
  points: number;
  badges: string[];
  weather: { temp: number, city: string, cond: string } | null;
  weatherLoading: boolean;
}

const LEADERBOARD = [
  { name: 'Shivayya M.', points: 450, rank: 1, avatar: '👴' },
  { name: 'Vijay L.', points: 380, rank: 2, avatar: '🧔' },
  { name: 'Nagamma B.', points: 320, rank: 3, avatar: '👩' },
  { name: 'You', points: 0, rank: 12, avatar: '👤' }
];

export default function Home({ onModuleSelect, points, badges, weather, weatherLoading }: HomeProps) {
  const { language, setLanguage, t } = useLanguage();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const TOP_SEARCHES = [
    { label: 'Rice Mandi', query: 'mandi rice' },
    { label: 'Tomato Disease', query: 'pest tomato' },
    { label: 'Govt Subsidy', query: 'scheme' },
    { label: 'Cow Health', query: 'cow' }
  ];

  const MODULES = [
    {
      id: "module-knowledge",
      title: "Video Courses",
      subtitle: "Learn modern techniques with YouTube",
      icon: <BookOpen className="w-8 h-8" />,
      color: "text-brand-orange",
      borderColor: "border-brand-orange",
      key: 'knowledge-hub',
      features: ['YouTube Search', 'Organic Tips', 'Govt Schemes'],
      keywords: ['video', 'course', 'learn', 'youtube', 'training', 'classes', 'watch', 'how to', 'tips', 'guide']
    },
    {
      id: "module-mandi",
      title: "Mandi Rates",
      subtitle: "Live prices & market trends",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "text-brand-green",
      borderColor: "border-brand-green",
      key: 'mandi-prices',
      features: ['Price Trends', 'Nearby APMCs', 'Live Rates'],
      keywords: ['mandi', 'price', 'rate', 'market', 'apmc', 'paisa', 'selling', 'cost', 'profit', 'bhav', 'market yard']
    },
    {
      id: "module-crops",
      title: t('crop_doctor'),
      subtitle: t('scan_crop'),
      icon: <Sprout className="w-8 h-8" />,
      color: "text-brand-green",
      borderColor: "border-brand-green",
      key: 'crops',
      features: language === 'kn' ? ['ರೋಗ ಪತ್ತೆ', 'ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ', 'ಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್'] : ['Photo Diagnosis', 'Soil Analyst', 'Fertilizer Calc'],
      keywords: ['crop', 'pest', 'disease', 'scan', 'plant', 'leaf', 'medicine', 'insect', 'bugs', 'soil', 'seeds', 'fertilizer', 'pesticide', 'dirt', 'mud', 'earth', 'moisture']
    },
    {
      id: "module-health",
      title: t('health_helper'),
      subtitle: t('check_health'),
      icon: <HeartPulse className="w-8 h-8" />,
      color: "text-brand-red",
      borderColor: "border-brand-red",
      key: 'health',
      features: language === 'kn' ? [' ರೋಗ ಲಕ್ಷಣ ಪರೀಕ್ಷಕ', 'ಔಷಧಿ ಓದುಗ'] : ['Symptom Checker', 'Medicine Reader', 'Stress Support'],
      keywords: ['health', 'doctor', 'medicine', 'symptom', 'fever', 'body', 'pain', 'sick', 'illness', 'cough', 'hospital', 'treatment']
    },
    {
      id: "module-village",
      title: t('village_help'),
      subtitle: "Complaint drafter & Legal assistance",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "text-brand-blue",
      borderColor: "border-brand-blue",
      key: 'village',
      features: language === 'kn' ? ['ಸಬ್ಸಿಡಿ ಶೋಧಕ', 'ಕಾನೂನು ನೆರವು'] : ['Scheme Finder', 'AI Legal Aid', 'Draft Letters'],
      keywords: ['govt', 'scheme', 'subsidy', 'complaint', 'legal', 'law', 'village', 'help', 'letter', 'collector', 'official', 'justice', 'rights']
    },
    {
      id: "module-livestock",
      title: "Animal Doctor",
      subtitle: "AI diagnosis for your livestock",
      icon: <Dog className="w-8 h-8" />,
      color: "text-brand-red",
      borderColor: "border-brand-red",
      key: 'livestock-doctor',
      features: ['Cattle Check', 'Sheep Care', 'Poultry Health'],
      keywords: ['animal', 'cow', 'doctor', 'veterinary', 'sheep', 'buffalo', 'goat', 'chicken', 'hen', 'milk', 'livestock', 'vet', 'poultry']
    },
    {
      id: "module-journal",
      title: "Farm Journal",
      subtitle: "Track expenses and seasonal profit",
      icon: <Book className="w-8 h-8" />,
      color: "text-brand-blue",
      borderColor: "border-brand-blue",
      key: 'farm-journal',
      features: ['Profit Tracker', 'Expense Log', 'Season Summary'],
      keywords: ['journal', 'expense', 'profit', 'book', 'hisab', 'money', 'track', 'accounting', 'spending', 'earnings', 'diary', 'reports']
    },
    {
      id: "module-vehicles",
      title: "Buy Vehicles",
      subtitle: "Tractors, Cars & more",
      icon: <Tractor className="w-8 h-8" />,
      color: "text-brand-blue",
      borderColor: "border-brand-blue",
      key: 'vehicle-market',
      features: ['Official Websites', 'Dealership Finder', 'Search Web'],
      keywords: ['tractor', 'car', 'buy', 'vehicle', 'auto', 'jeep', 'mahindra', 'tata', 'truck', 'van', 'maruti', 'purchase']
    },
    {
      id: "module-news",
      title: "Rural News",
      subtitle: "Live alerts for your region",
      icon: <Newspaper className="w-8 h-8" />,
      color: "text-brand-orange",
      borderColor: "border-brand-orange",
      key: 'news',
      features: ['The Hindu', 'Deccan Herald', 'Region Alerts'],
      keywords: ['news', 'update', 'paper', 'current', 'samachar', 'alert', 'headlines', 'daily', 'local', 'karnataka', 'weather news']
    }
  ];

  const filteredModules = MODULES.filter(m => {
    if (!searchQuery.trim()) return true;
    const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    return words.every(word => 
      m.title.toLowerCase().includes(word) || 
      m.subtitle.toLowerCase().includes(word) || 
      m.keywords.some(k => k.toLowerCase().includes(word)) ||
      m.features.some(f => f.toLowerCase().includes(word))
    );
  });
  
  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'Clear';
    if (code < 4) return 'Partly Cloudy';
    if (code < 70) return 'Rainy';
    return 'Cloudy';
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const prompt = `You are Kisaan Sahayak Smart Assistant. Respond in ${language === 'kn' ? 'Kannada' : 'English'}. Help the farmer with their query: "${userMsg}". 
      Keep it very friendly, simple, and practical. 
      If they need health advice, remind them to check the Health Assistant.
      If they need crop advice, remind them of the Crop Doctor.`;
      const response = await generateResponse(prompt);
      setChatHistory(prev => [...prev, { role: 'bot', text: response || "I'm sorry, I could not understand. Please try again." }]);
      logActivity('AI_CHAT', { query: userMsg });
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Technical error. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const userRank = points > 0 ? 4 : 12;
  const displayLeaderboard = [...LEADERBOARD];
  displayLeaderboard[3] = { ...displayLeaderboard[3], points, rank: userRank };

  return (
    <div className="space-y-8 pb-32">
      {/* Premium Alert Card */}
      <section className="px-1">
        <motion.div 
          onClick={() => onModuleSelect('news')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.98 }}
          className="bg-brand-red p-6 rounded-[32px] text-white shadow-xl overflow-hidden relative cursor-pointer"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Megaphone className="w-7 h-7 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight leading-none mb-1">{language === 'kn' ? 'ಜೀವಂತ ಗ್ರಾಮ ಸುದ್ದಿ' : 'Live Village Buzz'}</h4>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">{language === 'kn' ? 'ಹೊಸ ನವೀಕರಣಗಳು ಲಭ್ಯವಿವೆ. ವೀಕ್ಷಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ.' : 'New updates from top sources. Tap to view.'}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-white/50" />
            </div>
          </div>
          {/* Animated Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        </motion.div>
      </section>

      {/* Rewards Header */}
      <section className="bg-brand-orange p-6 rounded-[32px] text-white shadow-[0_10px_0_#E08500] flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
            title="Change Language"
          >
            <Languages className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'en' ? 'KN' : 'EN'}</span>
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{t('points_label')}</div>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div className="text-4xl font-black">{points}</div>
            <div className="text-sm font-bold uppercase tracking-widest mt-2">Pts</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 max-w-[120px] justify-end mt-8">
          {badges.map((b, i) => (
            <div key={i} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30" title={b}>
              <Star className="w-4 h-4 fill-white" />
            </div>
          ))}
          {badges.length === 0 && (
            <div className="text-[10px] font-black uppercase opacity-60 text-right">No badges</div>
          )}
        </div>
        <Star className="absolute -left-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
      </section>

      {/* Global Search */}
      <section className="px-1">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'kn' ? 'ನಮಗೆ ಬೇಕಾದುದನ್ನು ಹುಡುಕಿ (ಉದಾ: ಮಂಡಿ ದರ)' : 'Find what you need (e.g. Mandi rates)'}
            className="w-full bg-white border-b-8 border-slate-100 rounded-[32px] pl-16 pr-6 py-6 text-base font-black text-brand-dark focus:outline-none focus:border-brand-blue shadow-[0_10px_0_#00000005] transition-all placeholder:text-slate-300"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-full text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {!searchQuery && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide px-2">
            {TOP_SEARCHES.map(s => (
              <button 
                key={s.label}
                onClick={() => setSearchQuery(s.query)}
                className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-4 gap-3">
        <QuickLink icon={<Sprout />} label="Crops" color="bg-brand-green" onClick={() => onModuleSelect('crops')} />
        <QuickLink icon={<HeartPulse />} label="Health" color="bg-brand-red" onClick={() => onModuleSelect('health')} />
        <QuickLink icon={<ShieldCheck />} label="Govt" color="bg-brand-blue" onClick={() => onModuleSelect('village')} />
        <QuickLink icon={<Newspaper />} label="News" color="bg-brand-orange" onClick={() => onModuleSelect('news')} />
      </section>

      {/* Weather Summary */}
      <section 
        onClick={() => onModuleSelect('weather-detail')}
        className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex justify-between items-center transition-all cursor-pointer hover:bg-slate-50"
      >
        {weatherLoading ? (
          <div className="flex items-center gap-4 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-bold uppercase tracking-widest">{t('weather_loading')}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{weather?.cond === 'Rainy' ? '🌧️' : '☀️'}</span>
              <div>
                <div className="text-2xl font-extrabold text-brand-dark">{weather?.temp}°C</div>
                <div className="text-[10px] text-brand-green font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {weather?.city}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Forecast</div>
              <div className="font-bold text-brand-dark">{weather?.cond}</div>
            </div>
          </>
        )}
      </section>

      {/* Main Modules */}
      <section className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredModules.map((module) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={module.id}
            >
              <ModuleCard
                id={module.id}
                title={module.title}
                subtitle={module.subtitle}
                icon={module.icon}
                color={module.color}
                borderColor={module.borderColor}
                onClick={() => onModuleSelect(module.key)}
                features={module.features}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredModules.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">No results found</h3>
            <p className="text-sm text-slate-400 mt-2">Try searching for something else like "Tomato prices"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* FAB: Smart Chat */}
      <button 
        onClick={() => setShowChat(true)}
        className="fixed bottom-32 right-6 w-16 h-16 bg-brand-green text-white rounded-full flex items-center justify-center shadow-[0_8px_0_#1B4332] active:translate-y-1 active:shadow-none transition-all z-40"
      >
        <MessageSquare className="w-8 h-8" />
      </button>

      {/* Smart Chat Bottom Sheet */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-brand-bg w-full h-[80vh] rounded-t-[48px] shadow-2xl flex flex-col items-center p-8 relative"
            >
              <button 
                onClick={() => setShowChat(false)}
                className="absolute top-6 right-8 p-3 bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-8" />
              
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center text-white mb-3 shadow-lg">
                  <Sprout className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-none">{t('smart_assistant')}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Village AI</p>
              </div>

              <div className="flex-1 w-full overflow-y-auto space-y-4 px-2 scrollbar-none">
                {chatHistory.length === 0 && (
                  <div className="text-center py-12 space-y-4">
                    <p className="text-sm font-bold text-slate-400 italic">"{language === 'kn' ? 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' : 'How can I help you today, Farmer?'}"</p>
                    <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                      {(language === 'kn' 
                        ? ['ಅಕ್ಕಿ ಬೆಳೆಗೆ ಅತ್ಯುತ್ತಮ ಗೊಬ್ಬರ ಯಾವುದು?', 'ಬೇಸಿಗೆಯ ಜ್ವರದ ಬಗ್ಗೆ ಸಲಹೆಗಳು?', 'ಪಿಎಂ-ಕಿಸಾನ್ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?']
                        : ['Best fertilizer for rice?', 'Monsoon fever tips?', 'How to apply for PM-Kisan?']).map(q => (
                        <button 
                          key={q}
                          onClick={() => setChatMessage(q)}
                          className="p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-brand-dark hover:bg-slate-50 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-bold leading-relaxed relative ${
                      msg.role === 'user' 
                      ? 'bg-brand-green text-white rounded-tr-none shadow-lg' 
                      : 'bg-white text-brand-dark border border-slate-100 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                      {msg.role === 'bot' && (
                        <button 
                          onClick={() => handleSpeak(msg.text)}
                          className="absolute -right-10 top-0 p-2 text-slate-300 hover:text-brand-green transition-all"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm">
                      <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full mt-6 flex gap-3 pb-8">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder={t('ask_anything')}
                  className="flex-1 bg-white border-b-4 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand-green transition-all"
                />
                <button 
                  onClick={handleChat}
                  disabled={isTyping}
                  className="w-14 h-14 bg-brand-green text-white rounded-2xl flex items-center justify-center shadow-[0_6px_0_#1B4332] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleCard({ title, subtitle, icon, color, borderColor, onClick, id, features }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  onClick: () => void;
  id: string;
  features: string[];
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`group flex flex-col items-start p-8 bg-white rounded-[32px] shadow-[0_10px_0_#00000005] border-b-8 ${borderColor} text-left transition-all active:scale-[0.98] w-full`}
    >
      <div className={`mb-6 p-4 rounded-2xl bg-brand-bg ${color}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-black mb-2 flex items-center gap-2 ${color}`}>
          {title}
        </div>
        <div className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
          {subtitle}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-brand-bg px-4 py-3 rounded-xl text-xs font-bold text-brand-dark">
              <div className={`w-2 h-2 rounded-full bg-current ${color}`} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function QuickLink({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-90 group-hover:rotate-3`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </button>
  );
}
