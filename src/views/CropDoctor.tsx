import React, { useState, useRef } from 'react';
import { Camera, Send, Info, History, Sprout, Share2, Save, CheckCircle, Loader2, Volume2, Upload, Mountain } from 'lucide-react';
import { motion } from 'motion/react';
import { generateResponse } from '../lib/gemini';
import { logActivity } from '../lib/tracking';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useLanguage } from '../lib/LanguageContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CropDoctorProps {
  onAwardPoints: (points: number) => void;
  onViewHistory: () => void;
}

export default function CropDoctor({ onAwardPoints, onViewHistory }: CropDoctorProps) {
  const { language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'crop' | 'soil'>('crop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) { // Allowed 10MB for source
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
          
          // Max dimensions for compression
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
          
          // Compress to JPEG at 0.6 quality
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setImage(compressed);
          setSaved(false);
          setDiagnosis(null);
          
          setTimeout(() => {
            getDiagnosis(compressed);
          }, 500);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const getDiagnosis = async (imgData?: string) => {
    const targetImage = imgData || image;
    if (!targetImage) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const prompt = mode === 'crop' 
        ? `You are an expert agronomist (Crop Doctor Agent). Analyze this photo of a crop. 
           Please provide the response in ${language === 'kn' ? 'Kannada' : 'English'}.
           1. Identify the crop and the disease/pest. 
           2. Provide a clear, simple remedy in easy language for a farmer. 
           3. Suggest a safe pesticide/fertilizer dosage. 
           4. Mention if this is contagious to other plants. 
           Begin the response with "Dr. Kisaan's Analysis:"`
        : `You are an expert soil scientist. Analyze this photo of soil.
           Please provide the response in ${language === 'kn' ? 'Kannada' : 'English'}.
           1. Estimate the soil texture (e.g., Sandy, Loamy, Clay).
           2. Estimate visual moisture level.
           3. Suggest which crops would grow best in this soil.
           4. Recommend 1-2 organic ways to improve this soil's fertility.
           Begin the response with "Dr. Kisaan's Soil Report:"`;
      
      const result = await generateResponse(prompt, targetImage);
      setDiagnosis(result || "Could not analyze image. Please try again with a clearer photo.");
      if (result) {
        onAwardPoints(20);
        logActivity(mode === 'crop' ? 'CROP_SCAN' : 'SOIL_SCAN', { success: true });
      }
    } catch (err) {
      console.error("Diagnosis Error:", err);
      setDiagnosis("Error connecting to Dr. Kisaan Agent. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = async () => {
    if (!auth.currentUser || !image || !diagnosis || saving) return;
    setSaving(true);
    const path = `users/${auth.currentUser.uid}/records`;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'records'), {
        image,
        diagnosis,
        mode,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setSaved(true);
      alert(language === 'kn' ? "ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ!" : "Saved to your history!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!diagnosis) return;
    const shareData = {
      title: mode === 'crop' ? 'Crop Diagnosis' : 'Soil Analysis',
      text: diagnosis,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(diagnosis);
        alert("Copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center pr-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-green rounded-2xl flex items-center justify-center text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Dr. Kisaan</h2>
        </div>
        <button 
          onClick={onViewHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white border-b-4 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-green transition-all"
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      <div className="flex p-1.5 bg-white rounded-2xl shadow-inner border border-slate-100">
        <button 
          onClick={() => { setMode('crop'); setDiagnosis(null); setImage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'crop' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' : 'text-slate-400'}`}
        >
          <Sprout className="w-4 h-4" />
          {language === 'kn' ? 'ಬೆಳೆ ಪರೀಕ್ಷೆ' : 'Crop Scan'}
        </button>
        <button 
          onClick={() => { setMode('soil'); setDiagnosis(null); setImage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'soil' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' : 'text-slate-400'}`}
        >
          <Mountain className="w-4 h-4" />
          {language === 'kn' ? 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ' : 'Soil Scan'}
        </button>
      </div>

      <div className="bg-brand-green/10 p-5 rounded-2xl border-l-4 border-brand-green flex gap-3">
        <div className="p-2 bg-brand-green text-white rounded-full h-fit">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm text-brand-dark leading-relaxed font-bold">
          {mode === 'crop' 
            ? (language === 'kn' ? 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮಾಡಲು ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ.' : 'Take a clear photo of the leaf or stem to detect diseases.')
            : (language === 'kn' ? 'ಮಣ್ಣಿನ ವಿನ್ಯಾಸ ಮತ್ತು ಫಲವತ್ತತೆಯನ್ನು ತಿಳಿಯಲು ಮಣ್ಣಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ.' : 'Take a clear photo of the soil to analyze texture and fertility.')
          }
        </p>
      </div>

      <div className="relative aspect-square w-full max-w-sm mx-auto bg-white rounded-[32px] overflow-hidden border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex items-center justify-center group">
        {image ? (
          <div className="relative w-full h-full">
            <img src={image} className="w-full h-full object-cover" alt="Crop preview" />
            {loading && (
              <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="text-sm font-black uppercase tracking-widest">{language === 'kn' ? 'ಡಾ. ಕಿಸಾನ್ ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದಾರೆ...' : 'Dr. Kisaan is analyzing...'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Camera className="w-12 h-12" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ' : 'No photo selected'}</span>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden"
        />

        {!loading && (
          <div className="absolute bottom-8 flex gap-3">
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="bg-brand-green text-white px-6 py-4 rounded-2xl font-black shadow-[0_6px_0_#1B4332] flex items-center gap-2 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-[10px]"
            >
              <Camera className="w-5 h-5" />
              {image ? 'Re-take' : 'Camera'}
            </button>
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="bg-white text-brand-green border-2 border-brand-green/20 px-6 py-4 rounded-2xl font-black shadow-[0_6px_0_#F0FDF4] flex items-center gap-2 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-[10px]"
            >
              <Upload className="w-5 h-5" />
              {image ? 'New File' : 'Upload'}
            </button>
          </div>
        )}
      </div>

      {image && !diagnosis && (
        <button
          onClick={getDiagnosis}
          disabled={loading}
          className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-[0_6px_0_#1E3A8A] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Get AI Diagnosis
            </>
          )}
        </button>
      )}

      {diagnosis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] border-b-8 border-brand-green shadow-[0_10px_0_#00000005] space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-brand-green text-2xl flex items-center gap-3 uppercase tracking-tight">
              <Sprout className="w-6 h-6" />
              AI Prescription
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSpeak(diagnosis)}
                className="p-2 bg-brand-green/10 text-brand-green rounded-xl hover:bg-brand-green/20 transition-all"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setDiagnosis(null); setImage(null); }}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <History className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="text-brand-dark leading-relaxed font-medium text-sm whitespace-pre-wrap bg-brand-bg/50 p-5 rounded-2xl border border-slate-100">
            {diagnosis}
          </div>
          <div className="pt-2 flex gap-3">
            <button 
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 border transition-all ${
                saved 
                ? 'bg-brand-green text-white border-brand-green shadow-inner' 
                : 'bg-brand-green/10 text-brand-green border-brand-green/20 active:translate-y-1'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
              {saved ? 'SAVED' : 'SAVE'}
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 active:translate-y-1 transition-all"
            >
              <Share2 className="w-4 h-4" />
              SHARE
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
