import React from 'react';
import { 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherDetailProps {
  onBack: () => void;
  city: string;
}

export default function WeatherDetail({ onBack, city }: WeatherDetailProps) {
  const forecast = [
    { day: 'MON', temp: 32, cond: 'Sunny', rain: 0 },
    { day: 'TUE', temp: 34, cond: 'Hot', rain: 0 },
    { day: 'WED', temp: 29, cond: 'Rainy', rain: 80 },
    { day: 'THU', temp: 28, cond: 'Showers', rain: 45 },
    { day: 'FRI', temp: 30, cond: 'Cloudy', rain: 10 },
    { day: 'SAT', temp: 31, cond: 'Sunny', rain: 0 },
    { day: 'SUN', temp: 33, cond: 'Sunny', rain: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-green transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Weather: {city}</h2>
      </div>

      <div className="bg-brand-blue p-8 rounded-[40px] text-white shadow-[0_10px_0_#1E3A8A] relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Rain Alert</div>
            <div className="flex items-center gap-3">
              <CloudRain className="w-8 h-8" />
              <div className="text-3xl font-black">80% on WED</div>
            </div>
            <p className="text-xs font-bold text-white/70 mt-2">Strong rain expected. Avoid spraying pesticides on Wednesday.</p>
          </div>
          <div className="text-center bg-white/20 p-4 rounded-3xl border border-white/30">
            <div className="text-3xl font-black leading-none">32°</div>
            <div className="text-[8px] font-black uppercase mt-1">RealFeel</div>
          </div>
        </div>
        <CloudRain className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005]">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-5 h-5 text-brand-blue" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</span>
          </div>
          <div className="text-2xl font-black text-brand-dark">65%</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005]">
          <div className="flex items-center gap-3 mb-2">
            <Wind className="w-5 h-5 text-brand-blue" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wind Speed</span>
          </div>
          <div className="text-2xl font-black text-brand-dark">12 km/h</div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-green" />
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">7-Day Outlook</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {forecast.map((f, i) => (
            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <span className="text-xs font-black text-slate-400 w-12">{f.day}</span>
              <span className="text-2xl">{f.rain > 50 ? '🌧️' : f.rain > 0 ? '⛅' : '☀️'}</span>
              <div className="flex-1 px-6">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue" style={{ width: `${f.rain}%` }} />
                </div>
                <div className="text-[8px] font-black text-brand-blue uppercase tracking-widest mt-1">{f.rain}% Rain Chance</div>
              </div>
              <span className="text-sm font-black text-brand-dark">{f.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-bg p-8 rounded-[40px] border-4 border-dashed border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-brand-orange" />
          <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Irrigation Advisory</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 shrink-0" />
            <p className="text-sm font-medium text-slate-600">Avoid irrigation today as high moisture is detected from early drizzle.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 shrink-0" />
            <p className="text-sm font-medium text-slate-600">Expect high heat on Tuesday. Recommended watering at 5:00 AM.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
