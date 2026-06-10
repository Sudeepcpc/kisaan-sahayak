import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft,
  Filter,
  BarChart3,
  ExternalLink,
  Navigation,
  RefreshCw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_PRICES = [
  { id: 1, crop: 'Rice (Sona Masuri)', price: '₹2,450', unit: 'per quintal', trend: 'up', change: '+₹50', market: 'Haveri Mandi', category: 'Cereals' },
  { id: 2, crop: 'Cotton (Hybrid)', price: '₹7,100', unit: 'per quintal', trend: 'down', change: '-₹120', market: 'Hubli Mandi', category: 'Fiber' },
  { id: 3, crop: 'Maize', price: '₹2,100', unit: 'per quintal', trend: 'up', change: '+₹15', market: 'Ranebennur Mandi', category: 'Cereals' },
  { id: 4, crop: 'Chilli (Byadgi)', price: '₹42,000', unit: 'per quintal', trend: 'up', change: '+₹1,400', market: 'Byadgi Mandi', category: 'Spices' },
  { id: 5, crop: 'Wheat (Sharbati)', price: '₹2,800', unit: 'per quintal', trend: 'up', change: '+₹40', market: 'Yeshwantpur Mandi', category: 'Cereals' },
  { id: 6, crop: 'Onion (Red)', price: '₹1,850', unit: 'per quintal', trend: 'down', change: '-₹300', market: 'Lasalgaon Mandi', category: 'Vegetables' },
  { id: 7, crop: 'Potato (Jyoti)', price: '₹1,200', unit: 'per quintal', trend: 'stable', change: '₹0', market: 'Kolar Mandi', category: 'Vegetables' },
  { id: 8, crop: 'Turmeric (Salem)', price: '₹14,500', unit: 'per quintal', trend: 'stable', change: '₹0', market: 'Erode Mandi', category: 'Spices' },
  { id: 9, crop: 'Grapes (Thompson)', price: '₹4,500', unit: 'per quintal', trend: 'up', change: '+₹200', market: 'Nashik Mandi', category: 'Fruits' },
  { id: 10, crop: 'Pomegranate', price: '₹9,800', unit: 'per quintal', trend: 'down', change: '-₹450', market: 'Solapur Mandi', category: 'Fruits' },
  { id: 11, crop: 'Soybean', price: '₹4,600', unit: 'per quintal', trend: 'up', change: '+₹80', market: 'Indore Mandi', category: 'Oilseeds' },
  { id: 12, crop: 'Arecanut (Rashi)', price: '₹48,500', unit: 'per quintal', trend: 'up', change: '+₹1,200', market: 'Shivamogga Mandi', category: 'Commercial' },
  { id: 13, crop: 'Silk Cocoon', price: '₹550', unit: 'per kg', trend: 'up', change: '+₹40', market: 'Ramanagara Mandi', category: 'Fibers' },
  { id: 14, crop: 'Coffee (Arabica)', price: '₹12,400', unit: 'per 50kg', trend: 'down', change: '-₹150', market: 'Chikmagalur Mandi', category: 'Beverage' },
  { id: 15, crop: 'Tur Dal (Pigeon Pea)', price: '₹10,200', unit: 'per quintal', trend: 'up', change: '+₹300', market: 'Kalaburagi Mandi', category: 'Pulses' },
  { id: 16, crop: 'Groundnut', price: '₹6,400', unit: 'per quintal', trend: 'stable', change: '₹0', market: 'Chitradurga Mandi', category: 'Oilseeds' },
];

const NEARBY_MANDIS = [
  { name: 'Haveri APMC', dist: '2.5 km', crops: ['Cotton', 'Maize', 'Chilli'], status: 'Open' },
  { name: 'Byadgi Mandi', dist: '18 km', crops: ['Dry Chilli', 'Cotton'], status: 'Open' },
  { name: 'Ranebennur APMC', dist: '35 km', crops: ['Seeds', 'Maize', 'Groundnut'], status: 'Closed' },
];

interface MandiPricesProps {
  onBack: () => void;
}

export default function MandiPrices({ onBack }: MandiPricesProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'prices' | 'mandis' | 'trends'>('prices');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = MOCK_PRICES.filter(p => 
    p.crop.toLowerCase().includes(search.toLowerCase()) || 
    p.market.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const openLivePortal = () => {
    window.open('https://agmarknet.gov.in/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-green transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Mandi Rates</h2>
        </div>
        <button 
          onClick={handleRefresh}
          className={`p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-brand-green transition-all ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-[24px] flex gap-1 border border-slate-50 shadow-sm">
        {(['prices', 'mandis', 'trends'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
              : 'text-slate-400 hover:text-brand-green'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hero Banner */}
      <div className="bg-brand-green p-8 rounded-[40px] text-white shadow-[0_10px_0_#1B4332] relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Market Live</div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div className="text-3xl font-black">Market is {activeTab === 'trends' ? 'VOLATILE' : 'UP'}</div>
          </div>
          <p className="text-xs font-bold text-white/70 mt-2">
            Prices for Chilli & Rice rising in Karnataka. Cotton stable today.
          </p>
          <button 
            onClick={openLivePortal}
            className="mt-6 flex items-center gap-2 bg-white text-brand-blue px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/30"
          >
            <Globe className="w-4 h-4" />
            View Official Agmark Portal
          </button>
        </div>
        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      {activeTab === 'prices' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text"
              placeholder="Search crop or market..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-b-4 border-slate-100 rounded-[28px] pl-16 pr-6 py-5 text-sm font-bold focus:outline-none focus:border-brand-green transition-all"
            />
          </div>

          <div className="space-y-4 pb-10">
            {filtered.map((item) => (
              <motion.div 
                layout
                key={item.id}
                className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex items-center justify-between group active:translate-y-1 active:border-b-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    item.trend === 'up' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'
                  }`}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight">{item.crop}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {item.market}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-black text-brand-dark leading-none">{item.price}</div>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 mb-1">{item.unit}</p>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${
                    item.trend === 'up' ? 'text-brand-green' : item.trend === 'stable' ? 'text-slate-400' : 'text-brand-red'
                  }`}>
                    {item.change} {item.trend === 'up' ? '▲' : item.trend === 'stable' ? '=' : '▼'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'mandis' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-10"
        >
          {NEARBY_MANDIS.map((mandi, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">{mandi.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    <Navigation className="w-3 h-3" />
                    {mandi.dist} from your location
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  mandi.status === 'Open' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'
                }`}>
                  {mandi.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {mandi.crops.map(c => (
                  <span key={c} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase">
                    {c}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(mandi.name)}`, '_blank')}
                className="w-full py-4 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'trends' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pb-20"
        >
          <div className="bg-white p-8 rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] space-y-6">
            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-brand-green" />
              Price Analysis
            </h3>
            
            <div className="space-y-4">
              <TrendIndicator label="Spices (Chilli/Turmeric)" status="High Demand" level={85} />
              <TrendIndicator label="Cereals (Rice/Wheat)" status="Steady" level={60} />
              <TrendIndicator label="Vegetables (Onion/Potato)" status="Falling" level={30} color="bg-brand-red" />
              <TrendIndicator label="Oilseeds" status="Stable" level={50} color="bg-brand-blue" />
            </div>

            <div className="p-4 bg-brand-bg rounded-2xl border border-slate-100 italic text-xs text-slate-500 leading-relaxed">
              "Expert Tip: Farmers are advised to wait for 15 days for Onion sales as supply is expected to tighten, potentially raising prices by 10-15%."
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TrendIndicator({ label, status, level, color = 'bg-brand-green' }: { label: string, status: string, level: number, color?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{status}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

