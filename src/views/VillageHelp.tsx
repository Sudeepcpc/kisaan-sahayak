import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Gavel, 
  ScrollText, 
  ChevronRight,
  Search,
  MessageSquare,
  HelpingHand,
  X,
  ExternalLink,
  ChevronLeft,
  Send,
  Loader2,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logActivity } from '../lib/tracking';
import { generateResponse } from '../lib/gemini';
import { useLanguage } from '../lib/LanguageContext';

const SCHEMES = [
// ...
  {
    id: 'pm-kisan',
    title: 'PM-Kisan Samman Nidhi',
    desc: '₹6000 annual support for farmers',
    category: 'Subsidy',
    url: 'https://pmkisan.gov.in/',
    details: 'Get direct income support of ₹6000 per year in three installments.'
  },
  {
    id: 'kusum',
    title: 'PM-Kusum Solar Scheme',
    desc: '60% subsidy for solar pumps',
    category: 'Infrastructure',
    url: 'https://pmkusum.mnre.gov.in/',
    details: 'Install solar water pumps with high subsidy to save electricity costs.'
  },
  {
    id: 'fasal-bima',
    title: 'Pradhan Mantri Fasal Bima',
    desc: 'Crop insurance against natural disasters',
    category: 'Insurance',
    url: 'https://pmfby.gov.in/',
    details: 'Secure your crops against floods, droughts, and pests with low premium.'
  }
];

export default function VillageHelp() {
  const { language } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState<typeof SCHEMES[0] | null>(null);
  const [selectedSection, setSelectedSection] = useState<'schemes' | 'complaints' | 'legal'>('schemes');
  const [search, setSearch] = useState('');
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');

  const filteredSchemes = SCHEMES.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleAIDraft = async (type: 'complaint' | 'legal') => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const prompt = type === 'complaint' 
        ? `You are an expert rural advocate. Draft a formal complaint letter in ${language === 'kn' ? 'Kannada' : 'English'} for a farmer based on this issue: "${aiQuery}". 
           The letter should be addressed to the District Collector. 
           Include: 1. Subject, 2. Formal Salutation, 3. Detailed body explaining the issue, 4. Requested action, 5. Space for signature. 
           Keep the language professional but easy to understand.`
        : `You are an expert legal advisor for farmers. Provide free legal advice in ${language === 'kn' ? 'Kannada' : 'English'} for this situation: "${aiQuery}". 
           1. Explain relevant Indian laws (e.g., Land Revenue Act, Consumer Protection). 
           2. Suggest immediate legal steps. 
           3. Mention free legal aid resources like NALSA. 
           Keep it practical and supportive.`;
      
      const result = await generateResponse(prompt);
      setAiResponse(result || "Could not generate response.");
      logActivity(type === 'complaint' ? 'VILLAGE_COMPLAINT' : 'VILLAGE_LEGAL', { query: aiQuery });
    } catch (err) {
      setAiResponse("System error. Please try later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Schemes */}
      <div className="relative">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search PM-Kisan, Soil Health, etc..." 
          className="w-full bg-white border-b-8 border-slate-100 rounded-3xl py-5 flex items-center pl-14 pr-6 shadow-[0_10px_0_#00000005] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all placeholder:text-slate-300"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
      </div>

      {/* Main Services Grid */}
      <div className="grid grid-cols-1 gap-4">
        <ServiceBadge 
          icon={<ScrollText className="text-brand-orange" />}
          title="Government Schemes"
          desc="Find PM-Kisan & State subsidies"
          color="bg-brand-orange/10"
          borderColor="border-brand-orange"
          active={selectedSection === 'schemes'}
          onClick={() => { setSelectedSection('schemes'); setAiResponse(null); }}
        />
        <ServiceBadge 
          icon={<MessageSquare className="text-brand-blue" />}
          title="AI Complaint Drafter"
          desc="Draft letters to District Collector"
          color="bg-brand-blue/10"
          borderColor="border-brand-blue"
          active={selectedSection === 'complaints'}
          onClick={() => { setSelectedSection('complaints'); setAiResponse(null); setAiQuery(''); }}
        />
        <ServiceBadge 
          icon={<Scale className="text-brand-red" />}
          title="AI Legal Aid"
          desc="Free Legal Advice for Farmers"
          color="bg-brand-red/10"
          borderColor="border-brand-red"
          active={selectedSection === 'legal'}
          onClick={() => { setSelectedSection('legal'); setAiResponse(null); setAiQuery(''); }}
        />
      </div>

      {/* Dynamic Section Content */}
      <AnimatePresence mode="wait">
        {selectedSection === 'schemes' && (
          <motion.section 
            key="schemes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Active Schemes</h4>
            <div className="grid grid-cols-1 gap-3">
              {filteredSchemes.map(scheme => (
                <SchemeItem key={scheme.id} scheme={scheme} onClick={() => setSelectedScheme(scheme)} />
              ))}
            </div>
          </motion.section>
        )}

        {(selectedSection === 'complaints' || selectedSection === 'legal') && (
          <motion.section 
            key={selectedSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[40px] border-b-8 border-slate-100 shadow-[0_10px_0_#00000005] space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-4 rounded-2xl ${selectedSection === 'complaints' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-red/10 text-brand-red'}`}>
                  {selectedSection === 'complaints' ? <MessageSquare className="w-6 h-6" /> : <Scale className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-none">
                    {selectedSection === 'complaints' ? 'Letter Drafter' : 'Free Legal Aid'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Village AI Assistant</p>
                </div>
              </div>

              {!aiResponse ? (
                <>
                  <textarea 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={selectedSection === 'complaints' ? "Describe your issue (e.g. Village road repair needed, Water supply problem...)" : "Describe your legal situation (e.g. Land boundary dispute, Loan fraud...)"}
                    className="w-full bg-brand-bg rounded-3xl p-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all h-40 resize-none placeholder:text-slate-300"
                  />
                  <button 
                    onClick={() => handleAIDraft(selectedSection === 'complaints' ? 'complaint' : 'legal')}
                    disabled={aiLoading || !aiQuery.trim()}
                    className={`w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 ${
                      selectedSection === 'complaints' ? 'bg-brand-blue shadow-brand-blue/30' : 'bg-brand-red shadow-brand-red/30'
                    }`}
                  >
                    {aiLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (selectedSection === 'complaints' ? <FileText className="w-5 h-5" /> : <Gavel className="w-5 h-5" />)}
                    {selectedSection === 'complaints' ? 'GENERATE LETTER' : 'GET LEGAL ADVICE'}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-brand-bg p-6 rounded-3xl text-sm font-medium text-brand-dark leading-relaxed whitespace-pre-wrap border border-slate-100 italic">
                    {aiResponse}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setAiResponse(null)}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Draft New
                    </button>
                    <button 
                      className="flex-1 py-4 bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Copy Text
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Disclaimer */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center leading-relaxed">
                This AI tool provides drafts and information only. Always consult a government official or a qualified lawyer for actual legal matters.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-1">Emergency Help</h4>
            <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-widest italic">Always call official numbers for immediate help</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:108" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group">
              <div className="text-left">
                <div className="text-lg font-black leading-none">108</div>
                <div className="text-[8px] font-black uppercase text-white/50 tracking-widest mt-1">Ambulance</div>
              </div>
              <HelpingHand className="w-5 h-5 text-brand-red animate-pulse" />
            </a>
            <a href="tel:112" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group">
              <div className="text-left">
                <div className="text-lg font-black leading-none">112</div>
                <div className="text-[8px] font-black uppercase text-white/50 tracking-widest mt-1">All Help</div>
              </div>
              <HelpingHand className="w-5 h-5 text-brand-blue" />
            </a>
          </div>
        </div>
      </section>

      {/* Scheme Detail Modal */}

      <AnimatePresence>
        {selectedScheme && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative border-b-8 border-brand-blue"
            >
              <button 
                onClick={() => setSelectedScheme(null)}
                className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🏛️</div>
                <div>
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight leading-none">{selectedScheme.title}</h2>
                  <div className="text-xs font-black text-brand-blue uppercase tracking-widest mt-1">{selectedScheme.category}</div>
                </div>
              </div>

              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {selectedScheme.details}
              </p>

              <div className="space-y-4">
                <a 
                  href={selectedScheme.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => logActivity('SCHEME_CLICK', { schemeId: selectedScheme.id, title: selectedScheme.title })}
                  className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-[0_8px_0_#1E40AF] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-6 h-6" />
                  Apply Official Website
                </a>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  Redirects to Government Portal
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SchemeItem({ scheme, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-100 border-b-8 rounded-[32px] p-6 shadow-[0_10px_0_#00000005] flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-bg rounded-2xl flex items-center justify-center text-2xl">
          {scheme.id === 'pm-kisan' ? '🌾' : scheme.id === 'kusum' ? '☀️' : '🛡️'}
        </div>
        <div>
          <div className="text-lg font-black text-brand-dark tracking-tight leading-none mb-1">{scheme.title}</div>
          <div className="text-[10px] text-brand-green font-black uppercase tracking-widest">{scheme.desc}</div>
        </div>
      </div>
      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
    </div>
  );
}

function PortalItem({ title, desc, url, icon }: { title: string, desc: string, url: string, icon: string }) {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white border border-slate-100 border-b-8 rounded-[32px] p-6 shadow-[0_10px_0_#00000005] flex items-center justify-between group hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-bg rounded-2xl flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <div className="text-lg font-black text-brand-dark tracking-tight leading-none mb-1">{title}</div>
          <div className="text-[10px] text-brand-blue font-black uppercase tracking-widest">{desc}</div>
        </div>
      </div>
      <ExternalLink className="w-6 h-6 text-slate-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
    </a>
  );
}

function ServiceBadge({ icon, title, desc, color, borderColor, active, onClick }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  borderColor: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-5 p-6 rounded-[32px] bg-white border-b-8 transition-all active:translate-y-1 active:shadow-none hover:shadow-lg ${
        active ? `border-brand-dark shadow-xl bg-slate-50` : 'border-slate-100 shadow-[0_10px_0_#00000005]'
      }`}
    >
      <div className={`p-4 rounded-2xl ${active ? 'bg-brand-dark text-white' : color}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' })}
      </div>
      <div className="flex-1">
        <div className={`font-black text-lg tracking-tight leading-none mb-1 ${active ? 'text-brand-dark' : 'text-brand-dark'}`}>{title}</div>
        <div className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-tight">{desc}</div>
      </div>
      <ChevronRight className={`w-6 h-6 transition-transform ${active ? 'text-brand-dark translate-x-1' : 'text-slate-200'}`} />
    </button>
  );
}
