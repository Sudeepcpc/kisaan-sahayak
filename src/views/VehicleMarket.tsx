import React, { useState } from 'react';
import { 
  Tractor, 
  Car, 
  ChevronLeft, 
  Search, 
  ExternalLink, 
  Globe,
  TrendingUp,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleBrand {
  id: string;
  name: string;
  type: 'Tractor' | 'Car';
  logo: string;
  website: string;
  popularModels: string[];
}

const BRANDS: VehicleBrand[] = [
  {
    id: '1',
    name: 'Mahindra Tractors',
    type: 'Tractor',
    logo: '🚜',
    website: 'https://www.mahindratractor.com/',
    popularModels: ['Mahindra JIVO', 'Mahindra YUVO']
  },
  {
    id: '2',
    name: 'Sonalika',
    type: 'Tractor',
    logo: '🚜',
    website: 'https://www.sonalika.com/',
    popularModels: ['Sonalika Tiger', 'Sonalika Sikander']
  },
  {
    id: '3',
    name: 'Maruti Suzuki',
    type: 'Car',
    logo: '🚗',
    website: 'https://www.marutisuzuki.com/',
    popularModels: ['Swift', 'Dzire', 'Ertiga']
  },
  {
    id: '4',
    name: 'Tata Motors',
    type: 'Car',
    logo: '🚙',
    website: 'https://www.tatamotors.com/',
    popularModels: ['Punch', 'Nexon', 'Tiago']
  },
  {
    id: '5',
    name: 'John Deere',
    type: 'Tractor',
    logo: '🚜',
    website: 'https://www.deere.co.in/en/tractors/',
    popularModels: ['5050 D', '3028 EN']
  }
];

export default function VehicleMarket({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Tractor' | 'Car'>('All');

  const filteredBrands = BRANDS.filter(b => 
    (filter === 'All' || b.type === filter) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) || b.popularModels.some(m => m.toLowerCase().includes(search.toLowerCase())))
  );

  const handleDeepSearch = () => {
    if (!search.trim()) return;
    window.open(`https://www.google.com/search?q=buy+${encodeURIComponent(search)}+online+india`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-blue transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight leading-none">Vehicle Market</h2>
          <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mt-1">Official Purchase Portal</p>
        </div>
      </div>

      <div className="bg-brand-blue p-8 rounded-[40px] text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Upgrade Your Farm</h3>
          <p className="text-xs text-white/70 font-medium leading-relaxed max-w-[200px]">
            Direct links to official manufacturers for tractors and cars.
          </p>
          <div className="mt-4 flex gap-2">
            <div className="px-3 py-1 bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest">No Commission</div>
            <div className="px-3 py-1 bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest">Official Pricing</div>
          </div>
        </div>
        <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
        <Tractor className="absolute right-4 top-4 w-12 h-12 text-white/20 -rotate-12" />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search brand or model..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleDeepSearch()}
            className="w-full bg-white border-b-4 border-slate-100 rounded-[28px] pl-16 pr-6 py-5 text-sm font-bold focus:outline-none focus:border-brand-blue transition-all" 
          />
        </div>
      </div>

      <div className="flex gap-2">
        {['All', 'Tractor', 'Car'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${
              filter === type 
                ? 'bg-brand-blue text-white border-brand-dark shadow-lg shadow-brand-blue/20' 
                : 'bg-white text-slate-400 border-slate-100'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredBrands.map((brand, i) => (
            <motion.div
              layout
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center text-3xl">
                    {brand.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">{brand.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-black text-brand-blue uppercase tracking-widest">
                      <Globe className="w-3 h-3" />
                      Official Website
                    </div>
                  </div>
                </div>
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-110 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Popular Models</div>
                <div className="flex flex-wrap gap-2">
                  {brand.popularModels.map(model => (
                    <div key={model} className="px-3 py-1.5 bg-brand-bg rounded-lg text-[10px] font-bold text-slate-500">
                      {model}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(brand.name + ' dealership near me')}`, '_blank')}
                className="w-full mt-6 py-4 bg-slate-50 hover:bg-brand-blue/5 text-slate-600 hover:text-brand-blue rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-dashed border-slate-200"
              >
                <MapPin className="w-4 h-4" />
                Find Near Me Dealership
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-black text-brand-dark uppercase">No brands found</h4>
            <p className="text-sm text-slate-400 mt-2">Try searching for generic terms like "SUV" or "Small Tractor"</p>
            <button 
              onClick={handleDeepSearch}
              className="mt-6 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"
            >
              Search Web for "{search}"
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[180px]">
            <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-2">Used Market?</h4>
            <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-widest">
              Check OLX or Facebook Marketplace for used vehicles.
            </p>
          </div>
          <button 
            onClick={() => window.open('https://www.olx.in/cars_c84', '_blank')}
            className="px-5 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:translate-y-1 transition-all"
          >
            Go to OLX
          </button>
        </div>
      </div>
    </div>
  );
}
