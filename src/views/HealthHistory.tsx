import React, { useState, useEffect } from 'react';
import { 
  History, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope, 
  Calendar,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface HealthRecord {
  id: string;
  query: string;
  response: string;
  createdAt: any;
}

interface HealthHistoryProps {
  onBack: () => void;
}

export default function HealthHistory({ onBack }: HealthHistoryProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'health_records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      setRecords(recordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    if (confirm("Delete this consultation record?")) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'health_records', id));
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
          className="p-3 bg-white border-b-4 border-slate-100 rounded-2xl text-slate-400 hover:text-brand-red transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Health History</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005]">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <p className="text-slate-400 font-bold">No saved consultations yet.</p>
          <button 
            onClick={onBack}
            className="mt-6 text-brand-red font-black uppercase tracking-widest text-xs hover:underline"
          >
            Go back to Health Helper
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
              className="bg-white p-6 rounded-[32px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-brand-red" />
                  <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Consultation</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-bold">
                    {record.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-black text-brand-dark mb-2 line-clamp-2 uppercase tracking-tight">
                {record.query}
              </h3>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-end gap-2">
                View Details <ChevronRight className="w-3 h-3" />
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

              <div className="p-8 bg-brand-red text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Consultation Details</div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{selectedRecord.query}</h3>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-10 mt-4 relative z-10 scrollbar-none">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-brand-red space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-none">AI Response</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Village Health Record</p>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600 bg-brand-bg/50 p-6 rounded-3xl border border-slate-100 italic">
                    {selectedRecord.response}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`Query: ${selectedRecord.query}\n\nResponse: ${selectedRecord.response}`);
                        alert("Copied!");
                      }}
                      className="flex-1 py-5 bg-brand-red text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_8px_0_#991B1B] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
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
