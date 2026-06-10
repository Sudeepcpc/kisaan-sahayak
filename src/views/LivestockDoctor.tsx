import React, { useState, useRef } from 'react';
import { 
  Dog, 
  Search, 
  Camera, 
  Stethoscope, 
  History, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Volume2,
  Upload,
  CheckCircle,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateResponse } from '../lib/gemini';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LivestockDoctorProps {
  onAwardPoints: (pts: number) => void;
  onBack: () => void;
}

export default function LivestockDoctor({ onAwardPoints, onBack }: LivestockDoctorProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) {
        alert("Image too large. Please take a closer, simpler photo.");
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
          setResponse(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConsult = async () => {
    if (!query && !image) return;
    setLoading(true);
    try {
      const prompt = `You are a village livestock doctor. A farmer asks about their animal: "${query}". 
      ${image ? "An image of the animal is provided. Analyze it for visible symptoms (skin, posture, eyes)." : ""}
      1. Provide a likely health condition or advice.
      2. Suggest immediate first aid or home care.
      3. Recommend when to call a professional vet.
      4. List common symptoms to watch for.
      Keep it simple, empathetic, and tailored to rural Indian farmers.`;
      
      const res = await generateResponse(prompt, image || undefined);
      setResponse(res);
      onAwardPoints(20);
    } catch (err) {
      console.error(err);
      setResponse("Sorry, I could not connect to the animal doctor service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !response || saving) return;
    setSaving(true);
    const path = `users/${auth.currentUser.uid}/livestock_records`;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'livestock_records'), {
        image,
        query,
        response,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-dark transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight leading-none">Livestock Doctor</h2>
      </div>

      <div className="bg-brand-red p-8 rounded-[40px] text-white shadow-[0_10px_0_#991B1B] relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Animal Health</div>
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8" />
            <div className="text-3xl font-black">Cattle Care</div>
          </div>
          <p className="text-sm font-bold text-white/70 mt-2">Get instant advice for your cows, sheep, and poultry.</p>
        </div>
        <Dog className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      {!response ? (
        <section className="space-y-6">
          <div className="relative aspect-video w-full bg-white rounded-[32px] overflow-hidden border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex items-center justify-center group">
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} className="w-full h-full object-cover" alt="Animal preview" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <Camera className="w-12 h-12" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Take photo of symptoms<br/>or injury</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
                className="bg-white text-brand-dark p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform"
              >
                <Camera className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="bg-white text-brand-dark p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform"
              >
                <Upload className="w-6 h-6" />
              </button>
            </div>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe symptoms (e.g. My cow is not eating and has a fever...)"
            className="w-full bg-white border-b-8 border-slate-100 rounded-[32px] p-8 text-base font-black text-brand-dark focus:outline-none focus:border-brand-red transition-all resize-none h-40 placeholder:text-slate-300 shadow-[0_10px_0_#00000005]"
          />

          <button 
            onClick={handleConsult}
            disabled={loading || (!query && !image)}
            className="w-full py-6 bg-brand-blue text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-[0_10px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Stethoscope className="w-6 h-6" />}
            Get Advice Now
          </button>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleCapture}
            className="hidden"
          />
        </section>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-[0_10px_0_#00000005] border-b-8 border-brand-blue space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em]">Dr. Kisaan's Advice</span>
              <button 
                onClick={() => handleSpeak(response)}
                className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl hover:bg-brand-blue/20 transition-all"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-brand-dark text-base font-bold leading-relaxed whitespace-pre-wrap italic opacity-80">
              {response}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${
                  saved 
                    ? 'bg-brand-green text-white shadow-[0_6px_0_#1B4332]' 
                    : 'bg-brand-blue text-white shadow-[0_6px_0_#1E3A8A] active:translate-y-1 active:shadow-none'
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                {saved ? 'Saved' : 'Save Report'}
              </button>
              <button 
                onClick={() => { setResponse(null); setQuery(''); setImage(null); setSaved(false); }}
                className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_6px_0_#00000010] active:translate-y-1 active:shadow-none transition-all"
              >
                <Plus className="w-4 h-4" />
                New Advice
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
