import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  ChevronLeft, 
  ExternalLink, 
  AlertCircle,
  Globe,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logActivity } from '../lib/tracking';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: 'National' | 'State' | 'Agriculture' | 'Alert';
  summary: string;
  url: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Monsoon Arrivals: Early Rains Expected in Coastal Karnataka',
    source: 'The Hindu',
    time: '2 hours ago',
    category: 'Agriculture',
    summary: 'IMD forecasts early monsoon arrival in Udupi and Mangalore regions, beneficial for paddy farmers.',
    url: 'https://www.thehindu.com/'
  },
  {
    id: '2',
    title: 'New Subsidy for Drip Irrigation Announced by State Govt',
    source: 'Deccan Herald',
    time: '4 hours ago',
    category: 'State',
    summary: 'Karnataka government announces 90% subsidy for SC/ST farmers and 75% for others on drip kits.',
    url: 'https://www.deccanherald.com/'
  },
  {
    id: '3',
    title: 'Tomato Prices Surge in APMC Markets Across South India',
    source: 'The Indian Express',
    time: '6 hours ago',
    category: 'Agriculture',
    summary: 'Limited supply from rural belts leads to a 40% increase in wholesale tomato prices this week.',
    url: 'https://indianexpress.com/'
  },
  {
    id: '4',
    title: 'Village Alert: Local Power Maintenance Scheduled for Tuesday',
    source: 'Regional News',
    time: '8 hours ago',
    category: 'Alert',
    summary: 'Electricity department informs of power cut from 10 AM to 4 PM in Haveri rural circle.',
    url: '#'
  }
];

interface NewsSectionProps {
  onBack: () => void;
  location?: string;
}

export default function NewsSection({ onBack, location }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Agriculture' | 'State' | 'Alert'>('All');

  const refreshNews = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      logActivity('NEWS_REFRESH', { location });
    }, 1000);
  };

  const filteredNews = news.filter(item => 
    filter === 'All' ? true : item.category === filter
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight leading-none">Rural News</h2>
            <div className="text-[10px] font-black text-brand-blue uppercase tracking-widest mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location || 'Karnataka'}
            </div>
          </div>
        </div>
        <button 
          onClick={refreshNews}
          className={`p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Agriculture', 'State', 'Alert'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 shrink-0 ${
              filter === cat 
                ? 'bg-brand-blue text-white border-brand-dark shadow-lg shadow-brand-blue/20' 
                : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {cat === 'Alert' && <AlertCircle className="w-3 h-3" />}
            {cat}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNews.map((item, i) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] group cursor-pointer hover:bg-slate-50 transition-all ${
                item.category === 'Alert' ? 'ring-2 ring-brand-red/20 border-brand-red/10' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white ${
                    item.category === 'Alert' ? 'bg-brand-red' : 
                    item.category === 'Agriculture' ? 'bg-brand-green' : 
                    'bg-brand-blue'
                  }`}>
                    {item.category}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{item.time}</span>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {item.source}
                </div>
              </div>
              
              <h3 className="text-lg font-black text-brand-dark tracking-tight leading-tight mb-2 group-hover:text-brand-blue transition-colors">
                {item.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                {item.summary}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Live update
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-black text-brand-blue uppercase tracking-widest group-hover:gap-2 transition-all"
                >
                  Read Full <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Region Footer */}
      <div className="bg-brand-dark p-8 rounded-[40px] text-white overflow-hidden relative mt-8">
        <div className="relative z-10">
          <h4 className="text-xl font-black uppercase tracking-tight mb-2">Regional Buzz</h4>
          <p className="text-sm text-white/60 font-medium leading-relaxed">
            Stay updated with local news from The Hindu, Deccan Herald, Vijay Vani, and Vijaylakshmi specifically for your region.
          </p>
        </div>
        <Newspaper className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
      </div>
    </div>
  );
}
