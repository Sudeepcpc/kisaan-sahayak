import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  MapPin, 
  ChevronRight,
  Search,
  Plus,
  History,
  Save,
  CheckCircle,
  Loader2,
  ExternalLink,
  Volume2,
  Camera,
  X,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateResponse } from '../lib/gemini';
import { logActivity } from '../lib/tracking';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HealthHelperProps {
  onAwardPoints: (points: number) => void;
  onViewHistory: () => void;
}

export default function HealthHelper({ onAwardPoints, onViewHistory }: HealthHelperProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  const [activeTool, setActiveTool] = useState<'consult' | 'medicine' | 'pesticide'>('consult');

  const handleConsult = async () => {
    if (!query && !image) return;
    setLoading(true);
    setSaved(false);
    try {
      let prompt = '';
      if (activeTool === 'consult') {
        prompt = `You are a village health assistant. A farmer asks: "${query}". 
        ${image ? "An image is provided. If it's a symptom or condition, analyze it." : ""}
        1. Provide a likely condition (with disclaimer it's not a medical doctor).
        2. Give simple first-aid tips.
        3. Recommend when to visit a PHC (Primary Health Center).
        Use very simple, empathetic language.`;
      } else if (activeTool === 'medicine') {
        prompt = `You are a village health assistant helping a farmer read a medicine. 
        The farmer says: "${query}". 
        ${image ? "An image of the medicine/prescription is provided. Analyze the text and details on it." : ""}
        1. Explain what this medicine is usually used for.
        2. Give clear dosage instructions (with disclaimer to follow doctor's advice).
        3. List major side effects or warnings.
        Use very simple language.`;
      } else if (activeTool === 'pesticide') {
        prompt = `You are a village agricultural and health advisor. A farmer asks about a pesticide: "${query}". 
        ${image ? "An image of the pesticide bottle is provided. Analyze the label and warnings." : ""}
        1. Explain how to handle this pesticide safely.
        2. List necessary protective gear (gloves, masks).
        3. Provide first-aid steps if accidentally touched or inhaled.
        4. Suggest organic alternatives if possible.
        Use very simple, cautionary, but helpful language.`;
      }

      const result = await generateResponse(prompt, image || undefined);
        
      setResponse(result || "Could not process request.");
      if (result) {
        onAwardPoints(20);
        logActivity('HEALTH_CHECK', { query, type: activeTool, hasImage: !!image });
      }
    } catch (err) {
      console.error(err);
      setResponse("AI system error. Please call 108 for emergencies.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) {
        alert("Image too large.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setImage(compressed);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = async () => {
    if (!auth.currentUser || !query || !response || saving) return;
    setSaving(true);
    const path = `users/${auth.currentUser.uid}/health_records`;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'health_records'), {
        image,
        query,
        response,
        type: activeTool,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const openNearbyHospitals = () => {
    const q = encodeURIComponent("hospital near me");
    const url = location 
      ? `https://www.google.com/maps/search/${q}/@${location.lat},${location.lon},14z`
      : `https://www.google.com/maps/search/${q}`;
    window.open(url, '_blank');
  };

  const getToolTitle = () => {
    if (activeTool === 'medicine') return 'Medicine Reader';
    if (activeTool === 'pesticide') return 'Pesticide Help';
    return 'Health Consult';
  };

  const getToolPlaceholder = () => {
    if (activeTool === 'medicine') return 'Enter medicine name or describe the bottle...';
    if (activeTool === 'pesticide') return 'Enter pesticide name or ask about safety...';
    return 'Ex: My child has a fever since morning...';
  };

  const getToolIcon = () => {
    if (activeTool === 'medicine') return <Pill className="w-6 h-6 text-brand-blue" />;
    if (activeTool === 'pesticide') return <AlertTriangle className="w-6 h-6 text-brand-orange" />;
    return <Stethoscope className="w-6 h-6 text-brand-red" />;
  };

  const getToolColor = () => {
    if (activeTool === 'medicine') return 'border-brand-blue shadow-[0_6px_0_#1E3A8A] bg-brand-blue';
    if (activeTool === 'pesticide') return 'border-brand-orange shadow-[0_6px_0_#E08500] bg-brand-orange';
    return 'border-brand-red shadow-[0_6px_0_#991B1B] bg-brand-red';
  };

  const getToolBorder = () => {
    if (activeTool === 'medicine') return 'border-brand-blue focus:border-brand-blue';
    if (activeTool === 'pesticide') return 'border-brand-orange focus:border-brand-orange';
    return 'border-brand-red focus:border-brand-red';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pr-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-red rounded-2xl flex items-center justify-center text-white">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Health Helper</h2>
        </div>
        <button 
          onClick={onViewHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white border-b-4 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-red transition-all"
        >
          <History className="w-4 h-4" />
          Records
        </button>
      </div>

      <section className="grid grid-cols-3 gap-3">
        <HealthCard 
          active={activeTool === 'consult'}
          onClick={() => { setActiveTool('consult'); setResponse(null); setQuery(''); }}
          icon={<Stethoscope className="text-brand-red" />}
          title="Consult"
          color="bg-brand-red/10"
        />
        <HealthCard 
          active={activeTool === 'medicine'}
          onClick={() => { setActiveTool('medicine'); setResponse(null); setQuery(''); }}
          icon={<Pill className="text-brand-blue" />}
          title="Medicine"
          color="bg-brand-blue/10"
        />
        <HealthCard 
          active={activeTool === 'pesticide'}
          onClick={() => { setActiveTool('pesticide'); setResponse(null); setQuery(''); }}
          icon={<AlertTriangle className="text-brand-orange" />}
          title="Pesticide"
          color="bg-brand-orange/10"
        />
      </section>

      <section className={`bg-white p-8 rounded-[32px] shadow-[0_10px_0_#00000005] border-b-8 transition-all space-y-6 ${activeTool === 'consult' ? 'border-brand-red' : activeTool === 'medicine' ? 'border-brand-blue' : 'border-brand-orange'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-opacity-10 ${activeTool === 'consult' ? 'bg-brand-red' : activeTool === 'medicine' ? 'bg-brand-blue' : 'bg-brand-orange'}`}>
            {getToolIcon()}
          </div>
          <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">{getToolTitle()}</h3>
        </div>
        
        {!response ? (
          <>
            <div className="space-y-4">
              <div className="relative group">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={getToolPlaceholder()}
                  className={`w-full bg-brand-bg border-4 border-transparent rounded-3xl p-6 text-sm font-bold focus:outline-none transition-all resize-none h-40 placeholder:text-slate-300 ${getToolBorder()}`}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-6 right-6 p-4 rounded-2xl text-white shadow-lg transition-all active:scale-95 ${activeTool === 'consult' ? 'bg-brand-red' : activeTool === 'medicine' ? 'bg-brand-blue' : 'bg-brand-orange'}`}
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {image && (
                <div className="relative rounded-3xl overflow-hidden border-4 border-slate-100 group shadow-sm">
                  <img src={image} alt="Upload" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleConsult}
              disabled={loading || (!query && !image)}
              className={`w-full py-5 text-white rounded-2xl font-black flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest ${getToolColor()}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  PROCEED
                </>
              )}
            </button>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTool === 'consult' ? 'text-brand-red' : activeTool === 'medicine' ? 'text-brand-blue' : 'text-brand-orange'}`}>Advice Received</span>
              <button 
                onClick={() => handleSpeak(response)}
                className={`p-2 rounded-xl transition-all ${activeTool === 'consult' ? 'bg-brand-red/10 text-brand-red hover:bg-brand-red/20' : activeTool === 'medicine' ? 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20' : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'}`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className={`p-6 bg-brand-bg rounded-2xl text-brand-dark text-sm font-medium leading-relaxed whitespace-pre-wrap italic border border-slate-100`}>
              {response}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 border transition-all ${
                  saved 
                  ? 'bg-brand-red text-white border-brand-red shadow-inner' 
                  : (activeTool === 'consult' ? 'bg-brand-red/10 text-brand-red border-brand-red/20' : activeTool === 'medicine' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20') + ' hover:opacity-80 active:translate-y-1'
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                {saved ? 'SAVED' : 'SAVE'}
              </button>
              <button 
                onClick={() => { setResponse(null); setQuery(''); setSaved(false); }}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 active:translate-y-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                NEW
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nearby Facilities</h4>
        <div className="space-y-3">
          <button 
            onClick={openNearbyHospitals}
            className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-[0_6px_0_#00000003] border border-slate-100 transition-all hover:bg-slate-50 active:translate-y-1"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-brand-dark tracking-tight">Search Nearby Hospitals</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  {location ? 'Using your current location' : 'Locating...'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </section>
    </div>
  );
}

function HealthCard({ icon, title, color, active, onClick }: { icon: React.ReactNode; title: string; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] flex flex-col items-center gap-3 text-center transition-all border-b-8 active:translate-y-1 active:shadow-none ${
        active 
          ? (title === 'Consult' ? 'bg-brand-red text-white border-brand-dark' : title === 'Medicine' ? 'bg-brand-blue text-white border-brand-dark' : 'bg-brand-orange text-white border-brand-dark') 
          : 'bg-white text-slate-400 border-slate-100 shadow-[0_10px_0_#00000005]'
      }`}
    >
      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${active ? 'bg-white/20' : color}`}>
        {icon}
      </div>
      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight leading-none ${active ? 'text-white' : 'text-brand-dark'}`}>{title}</span>
    </button>
  );
}
