import React from 'react';
import { 
  Library, 
  ChevronLeft, 
  BookOpen, 
  Sprout, 
  ShieldCheck, 
  Droplet,
  ExternalLink,
  Search,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

const GUIDES = [
  { id: 1, title: 'Natural Organic Pesticide', desc: 'Make pesticide using Neem and Garlic at home for zero cost.', category: 'Protection', icon: '🌿' },
  { id: 2, title: 'Drip Irrigation Setup', desc: 'Save 60% water with simple drip setup for small farms.', category: 'Water', icon: '💧' },
  { id: 3, title: 'Soil Fertility Secrets', desc: 'Increase yield with crop rotation and green manure.', category: 'Soil', icon: '⛰️' },
  { id: 4, title: 'Winter Crop Planning', desc: 'Best crops to grow in Karnataka winters for maximum profit.', category: 'Planning', icon: '❄️' },
  { id: 5, title: 'Safe Pesticide Use', desc: 'How to use chemicals safely and avoid health hazards.', category: 'Protection', icon: '🥽' },
  { id: 6, title: 'Beekeeping Basics', desc: 'Boost pollination by 30% with an honeybee box.', category: 'Income', icon: '🐝' },
  { id: 7, title: 'Solar Pump Schemes', desc: 'How to apply for 90% subsidy on solar water pumps.', category: 'Govt', icon: '☀️' },
];

const MODERN_VIDEOS = [
  { id: 1, title: 'Organic Pesticide Preparation (Home)', duration: '12:45', thumbnail: '🧪', channel: 'Rural Agri Tech', url: 'https://www.youtube.com/results?search_query=organic+pesticide+preparation+farmer' },
  { id: 2, title: 'Hydroponics for Small Farmers', duration: '15:20', thumbnail: '🥬', channel: 'Modern Kissan', url: 'https://www.youtube.com/results?search_query=hydroponics+small+scale+farming' },
  { id: 3, title: 'How to Prevent Malaria/Dengue', duration: '05:30', thumbnail: '🦟', channel: 'Village Health', url: 'https://www.youtube.com/results?search_query=village+health+malaria+prevention' },
  { id: 4, title: 'Drip Irrigation Maintenance', duration: '08:15', thumbnail: '🚿', channel: 'Village Life', url: 'https://www.youtube.com/results?search_query=drip+irrigation+maintenance+hindi' },
];

const OTHER_WEBSITES = [
  { name: 'ICAR Portal', url: 'https://icar.org.in/', icon: <Globe className="w-4 h-4" /> },
  { name: 'Vikaspedia Agri', url: 'https://vikaspedia.in/agriculture', icon: <Globe className="w-4 h-4" /> },
  { name: 'National Health Portal', url: 'https://www.nhp.gov.in/', icon: <Globe className="w-4 h-4" /> },
];

interface KnowledgeHubProps {
  onBack: () => void;
}

export default function KnowledgeHub({ onBack }: KnowledgeHubProps) {
  const [activeTab, setActiveTab] = React.useState<'guides' | 'videos'>('guides');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' agriculture farming')}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-orange transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Farm Academy</h2>
      </div>

      <div className="bg-white p-1.5 rounded-[24px] flex gap-1 border border-slate-50 shadow-sm">
        <button
          onClick={() => setActiveTab('guides')}
          className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'guides' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-slate-400'
          }`}
        >
          Guides
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'videos' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-400'
          }`}
        >
          Video Courses
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={activeTab === 'guides' ? "Search guides, tips..." : "Search YouTube for Ag-videos..."}
          className={`w-full bg-white border-b-4 border-slate-100 rounded-[28px] pl-16 pr-6 py-5 text-sm font-bold focus:outline-none transition-all ${activeTab === 'guides' ? 'focus:border-brand-orange' : 'focus:border-brand-blue'}`}
        />
        {activeTab === 'videos' && (
          <button 
            onClick={handleSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-blue text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Search
          </button>
        )}
      </div>

      {activeTab === 'guides' ? (
        <div className="grid grid-cols-1 gap-4 pb-20">
          {GUIDES.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).map(guide => (
            <div key={guide.id} className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-bg rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">{guide.category}</span>
                    </div>
                    <h3 className="text-lg font-black text-brand-dark tracking-tight leading-tight group-hover:text-brand-orange transition-colors">{guide.title}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">{guide.desc}</p>
                    
                    <button className="mt-4 flex items-center gap-2 text-[10px] font-black text-brand-orange uppercase tracking-widest group-hover:gap-3 transition-all">
                      Learn More <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-20">
          <div className="bg-brand-blue p-6 rounded-[32px] text-white overflow-hidden relative mb-2">
            <div className="relative z-10">
              <h4 className="text-lg font-black uppercase tracking-tight">Agri-Video Hub</h4>
              <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">Learn from experts world-wide</p>
            </div>
            <Library className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12" />
          </div>

          {MODERN_VIDEOS.map(video => (
            <div key={video.id} className="bg-white p-4 rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex gap-4 items-center group cursor-pointer hover:bg-slate-50 transition-all">
              <div className="w-28 h-28 bg-slate-900 rounded-[28px] flex items-center justify-center text-4xl relative overflow-hidden shrink-0">
                {video.thumbnail}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/0 transition-all">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center pb-0.5 pl-0.5 group-hover:scale-110 transition-transform">
                    ▶️
                  </div>
                </div>
              </div>
              <div className="pr-4">
                <div className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">{video.channel}</div>
                <h3 className="font-black text-brand-dark text-lg leading-tight group-hover:text-brand-blue transition-colors">{video.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{video.duration} minutes</p>
                <a 
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[10px] font-black text-brand-blue border-b-2 border-brand-blue transition-all"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))}

          <div className="bg-white/50 p-6 rounded-[32px] border border-dashed border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Portals</h4>
            <div className="flex flex-wrap gap-2">
              {OTHER_WEBSITES.map(web => (
                <a 
                  key={web.name}
                  href={web.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-brand-dark uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                >
                  {web.icon}
                  {web.name}
                </a>
              ))}
            </div>
          </div>
          <div className="p-8 text-center text-slate-400">
            <Library className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest mb-2">Search to find more on YouTube</p>
            <p className="text-[10px] font-bold opacity-60">Try searching: "Natural farming techniques"</p>
          </div>
        </div>
      )}
    </div>
  );
}

