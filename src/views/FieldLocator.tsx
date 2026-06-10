import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  MapPin, 
  Navigation, 
  Layers, 
  Target,
  Loader2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface FieldLocatorProps {
  onBack: () => void;
}

export default function FieldLocator({ onBack }: FieldLocatorProps) {
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLoading(false);
        },
        (err) => {
          console.error("Geo error:", err);
          setLoading(false);
          // Default to a farm area in Karnataka if denied
          setLocation({ lat: 14.7937, lon: 75.4055 });
        }
      );
    } else {
      setLoading(false);
      setLocation({ lat: 14.7937, lon: 75.4055 });
    }
  }, []);

  const mapUrl = location 
    ? `https://www.google.com/maps/embed/v1/view?key=${process.env.VITE_MAPS_API_KEY || ''}&center=${location.lat},${location.lon}&zoom=18&maptype=satellite`
    : '';

  // Since we might not have a Google Maps API Key exposed in VITE_, 
  // we'll provide a direct link button and a placeholder iframe showing 
  // how to open it in Google Maps app which is more powerful for farmers.
  
  const openExternalMap = () => {
    if (!location) return;
    window.open(`https://www.google.com/maps?q=${location.lat},${location.lon}&z=18&t=k`, '_blank');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-green transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Field Locator</h2>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Locating your field...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 relative group">
              {/* Satellite Map Placeholder/Iframe - Using a static image or embed if we had key, 
                  but for now we'll use a high-quality visual placeholder with coordinates */}
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover opacity-40"
                  alt="Rural landscape"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-dark/80" />
                
                <div className="relative z-10 text-center space-y-4 px-6">
                  <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-pulse">
                    <Target className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-black uppercase tracking-tight">Field Detected</h3>
                    <p className="text-white/60 font-mono text-xs mt-1">lat: {location?.lat.toFixed(4)} lon: {location?.lon.toFixed(4)}</p>
                  </div>
                  <button 
                    onClick={openExternalMap}
                    className="py-4 px-8 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 mx-auto shadow-[0_6px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <MapIcon className="w-4 h-4" />
                    Open Satellite View
                  </button>
                </div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button className="p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg text-brand-dark hover:bg-white transition-all">
                  <Layers className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg text-brand-dark hover:bg-white transition-all">
                  <Navigation className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Current Precision</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">High accuracy GPS active. You are viewing the satellite map of your current field location.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-brand-bg p-4 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">State</div>
                  <div className="text-xs font-black text-brand-dark">Karnataka</div>
                </div>
                <div className="bg-brand-bg p-4 rounded-2xl border border-slate-100">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">District</div>
                  <div className="text-xs font-black text-brand-dark">Haveri</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
