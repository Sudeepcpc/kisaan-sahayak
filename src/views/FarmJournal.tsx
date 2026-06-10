import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PlusCircle, 
  MinusCircle,
  History,
  Loader2,
  Trash2,
  Mic,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { voiceService } from '../lib/voice';
import { generateResponse } from '../lib/gemini';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../lib/LanguageContext';

interface JournalEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: string;
  createdAt: any;
}

export default function FarmJournal({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Seeds');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'journal_entries'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JournalEntry[]);
      setLoading(false);
    });
  }, []);

  const totalIncome = entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleVoiceEntry = async () => {
    try {
      setIsListening(true);
      voiceService.setLanguage(language === 'kn' ? 'kn-IN' : 'en-IN');
      const text = await voiceService.listen();
      
      setLoading(true);
      const prompt = `You are a smart farm accountant. Extract JSON data from this farmer's voice note: "${text}".
      Return ONLY valid JSON with these fields:
      - type: "income" or "expense"
      - amount: number
      - category: One of [Seeds, Fertilizer, Diesel, Labor, Maintenance, Livestock Feed, Water, Crop Sale, Livestock Sale, Subsidy, Rental Income, Other]
      - note: string (summary of the activity)
      If you can't determine something, use best guess or 'Other'.`;
      
      const res = await generateResponse(prompt);
      const jsonStr = res?.match(/\{[\s\S]*\}/)?.[0];
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        setType(data.type);
        setAmount(data.amount.toString());
        setCategory(data.category);
        setNote(data.note);
        if (!showAdd) setShowAdd(true);
      }
    } catch (err) {
      console.error(err);
      alert(language === 'kn' ? "ಧ್ವನಿ ಕೇಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" : "Could not hear voice correctly.");
    } finally {
      setIsListening(false);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!auth.currentUser || !amount) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'journal_entries'), {
        type,
        amount: parseFloat(amount),
        note,
        category,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setAmount('');
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!auth.currentUser) return;
    if (confirm("Delete this entry?")) {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'journal_entries', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-dark transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Farm Journal</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleVoiceEntry} 
            disabled={isListening}
            className={`p-4 rounded-2xl shadow-xl transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'}`}
          >
            {isListening ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
          </button>
          <button onClick={() => setShowAdd(true)} className="p-4 bg-brand-green text-white rounded-2xl shadow-[0_6px_0_#1B4332] active:translate-y-1 active:shadow-none transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border-b-8 border-brand-green shadow-[0_10px_0_#00000005]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-brand-green" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Income</span>
          </div>
          <div className="text-xl font-black text-brand-green">₹{totalIncome}</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border-b-8 border-brand-red shadow-[0_10px_0_#00000005]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3 h-3 text-brand-red" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses</span>
          </div>
          <div className="text-xl font-black text-brand-red">₹{totalExpense}</div>
        </div>
      </div>

      <div className={`p-8 rounded-[40px] text-white shadow-xl ${netProfit >= 0 ? 'bg-brand-green shadow-brand-green/20' : 'bg-brand-red shadow-brand-red/20'}`}>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Season Profit/Loss</div>
        <div className="text-3xl font-black">₹{netProfit}</div>
        <p className="text-xs font-bold mt-2 opacity-70">
          {netProfit >= 0 ? 'You are in profit this season! Keep it up.' : 'Expenses are higher than income. Check your spending.'}
        </p>
      </div>

      <div className="space-y-4 pb-20">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 font-mono">Recent Transactions</h3>
        {entries.map(entry => (
          <div key={entry.id} className="bg-white p-5 rounded-[28px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'income' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                {entry.type === 'income' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-black text-brand-dark uppercase tracking-tight">{entry.note || entry.category}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{entry.category}</div>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <div className={`text-sm font-black ${entry.type === 'income' ? 'text-brand-green' : 'text-brand-red'}`}>
                  {entry.type === 'income' ? '+' : '-'} ₹{entry.amount}
                </div>
                <div className="text-[8px] font-bold text-slate-300 uppercase">{entry.createdAt?.toDate().toLocaleDateString()}</div>
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="p-2 text-slate-200 hover:text-brand-red transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowAdd(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-brand-dark transition-all">
                <ChevronLeft className="w-6 h-6 rotate-90" />
              </button>
              
              <h3 className="text-2xl font-black text-brand-dark uppercase mb-8">Add Entry</h3>
              
              <div className="space-y-6">
                <div className="flex gap-2 p-1.5 bg-brand-bg rounded-2xl">
                  {(['expense', 'income'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? (t === 'income' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' : 'bg-brand-red text-white shadow-lg shadow-brand-red/30') : 'text-slate-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-brand-bg p-5 rounded-2xl text-lg font-black focus:outline-none border-4 border-transparent focus:border-brand-green transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-brand-bg p-5 rounded-2xl text-sm font-black focus:outline-none appearance-none">
                    {type === 'expense' 
                      ? ['Seeds', 'Fertilizer', 'Diesel', 'Labor', 'Maintenance', 'Livestock Feed', 'Water', 'Other'].map(c => <option key={c}>{c}</option>)
                      : ['Crop Sale', 'Livestock Sale', 'Subsidy', 'Rental Income', 'Other'].map(c => <option key={c}>{c}</option>)
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Description..." className="w-full bg-brand-bg p-5 rounded-2xl text-sm font-bold focus:outline-none" />
                </div>

                <button onClick={handleAdd} disabled={!amount} className={`w-full py-5 rounded-[24px] text-white font-black uppercase tracking-widest transition-all disabled:opacity-50 ${type === 'income' ? 'bg-brand-green shadow-[0_8px_0_#1B4332]' : 'bg-brand-red shadow-[0_8px_0_#991B1B]'}`}>
                  Save Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
