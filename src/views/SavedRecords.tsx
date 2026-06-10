import React, { useState, useEffect } from 'react';
import { 
  History, 
  ChevronLeft, 
  Sprout, 
  Calendar,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface Record {
  id: string;
  image: string;
  diagnosis: string;
  createdAt: any;
}

interface SavedRecordsProps {
  onBack: () => void;
}

export default function SavedRecords({ onBack }: SavedRecordsProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Record[];
      setRecords(recordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    if (confirm("Delete this record?")) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'records', id));
        if (selectedRecord?.id === id) setSelectedRecord(null);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-green transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Diagnosis History</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005]">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <p className="text-slate-400 font-bold">No saved diagnoses yet.</p>
          <button 
            onClick={onBack}
            className="mt-6 text-brand-green font-black uppercase tracking-widest text-xs hover:underline"
          >
            Go back to Crop Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((record) => (
            <motion.div 
              layout
              key={record.id}
              onClick={() => setSelectedRecord(record)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-50 shrink-0">
                <img src={record.image} className="w-full h-full object-cover" alt="Saved crop" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sprout className="w-3 h-3 text-brand-green" />
                  <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Prescription</span>
                </div>
                <h3 className="text-sm font-black text-brand-dark truncate uppercase tracking-tight">
                  {record.diagnosis.split('\n')[0].replace(/^\d+\.\s*/, '') || 'Crop Diagnosis'}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[9px] font-bold">
                      {record.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-2 text-slate-300 hover:text-brand-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Detail View */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-brand-bg w-full max-w-2xl h-[85vh] rounded-[48px] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <button 
                onClick={() => setSelectedRecord(null)}
                className="absolute top-6 right-6 p-4 bg-white/20 backdrop-blur-md rounded-full text-white z-10 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 rotate-90" />
              </button>

              <div className="h-2/5 relative">
                <img src={selectedRecord.image} className="w-full h-full object-cover" alt="Diagnosed crop" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-bg to-transparent" />
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-10 -mt-12 relative z-10 scrollbar-none">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-brand-green space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-none">Saved Diagnosis</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Prescription Record</p>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600 bg-brand-bg/50 p-6 rounded-3xl border border-slate-100 italic">
                    {selectedRecord.diagnosis}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedRecord.diagnosis);
                        alert("Copied!");
                      }}
                      className="flex-1 py-5 bg-brand-green text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_8px_0_#1B4332] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      COPY
                    </button>
                    <button 
                      onClick={(e) => handleDelete(selectedRecord.id, e as any)}
                      className="w-20 bg-brand-red/10 text-brand-red rounded-3xl flex items-center justify-center border border-brand-red/20 active:translate-y-1 transition-all"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
