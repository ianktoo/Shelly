
import React, { useState } from 'react';
import { TeacherReport, DashboardView, Student, ConversationSummary, ClassDocument } from '../types';

interface TeacherDashboardProps {
  reports: TeacherReport[];
  onClear: () => void;
  classDocuments: ClassDocument[];
  onUpdateDocuments: (docs: ClassDocument[]) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  reports, 
  onClear, 
  classDocuments, 
  onUpdateDocuments 
}) => {
  const [activeTab, setActiveTab] = useState<DashboardView>(DashboardView.OVERVIEW);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newDoc: ClassDocument = {
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        content: content
      };
      onUpdateDocuments([...classDocuments, newDoc]);
    };
    reader.readAsText(file);
  };

  const removeDoc = (index: number) => {
    const next = [...classDocuments];
    next.splice(index, 1);
    onUpdateDocuments(next);
  };

  const renderOverview = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-green-50 dark:border-white/5 overflow-hidden">
        <div className="flex justify-between items-start mb-8">
           <h3 className="text-xl font-black text-green-900 dark:text-green-50 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg> 
            Class Pulse
          </h3>
          <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Live Analysis</div>
        </div>
        <div className="flex items-end gap-6 h-48 pt-2">
          {[{ label: 'Positive', color: 'bg-green-400', height: 'h-[85%]' }, { label: 'Neutral', color: 'bg-yellow-400', height: 'h-[55%]' }, { label: 'Social Stress', color: 'bg-orange-400', height: 'h-[25%]' }, { label: 'Urgent', color: 'bg-red-400', height: 'h-[10%]' }].map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-3">
              <div className={`w-full ${bar.color} ${bar.height} rounded-2xl transition-all duration-1000 ease-out animate-in slide-in-from-bottom-10 shadow-lg`} />
              <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-green-50 dark:border-white/5 space-y-4">
          <h3 className="text-xl font-black text-green-900 dark:text-green-50">Behavioral Signals</h3>
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-white/5">
                <div className="text-green-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8 8"/><path d="m19 19-8-8-8 8"/></svg></div>
                <span className="text-sm font-bold text-green-800 dark:text-green-200">Class Anxiety Trend: Down 15%</span>
             </div>
             <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-white/5">
                <div className="text-orange-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></div>
                <span className="text-sm font-bold text-orange-800 dark:text-orange-300">New Signal: Social Exclusion mentioned</span>
             </div>
          </div>
          <button onClick={() => setActiveTab(DashboardView.SAFETY)} className="w-full text-xs bg-green-900 dark:bg-green-600 text-white py-4 rounded-full font-black uppercase tracking-widest hover:scale-[1.02] transition-all">View Safety Reports</button>
        </div>
        <div className="bg-green-900 dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl text-white space-y-4">
          <div className="flex items-center gap-3 opacity-60">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 6h10"/><path d="M8 10h10"/><path d="M8 14h10"/></svg>
             <span className="text-[10px] font-black uppercase tracking-widest">Teacher Insights</span>
          </div>
          <h3 className="text-2xl font-black">Contextual AI</h3>
          <p className="text-green-100/70 text-sm leading-relaxed">
            Shellie is currently using {classDocuments.length} documents. She knows student names and your rainy-day schedule. This reduces hallucinations and improves child trust.
          </p>
          <button onClick={() => setActiveTab(DashboardView.CLASS_DATA)} className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all">Manage Class Data</button>
        </div>
      </div>
    </div>
  );

  const renderClassData = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-green-50 dark:border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-green-900 dark:text-green-50 tracking-tight">Context Repository</h2>
            <p className="text-green-600 dark:text-green-400 font-bold">Upload school documents to refine Shellie's empathy engine.</p>
          </div>
          <label className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-sm cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-3 border-b-4 border-green-800 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> 
            Add Document
            <input type="file" className="hidden" accept=".txt,.csv,.md" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classDocuments.map((doc, i) => (
            <div key={i} className="bg-green-50/50 dark:bg-white/5 p-6 rounded-3xl border border-green-100 dark:border-white/10 flex items-start gap-4 group relative hover:border-green-300 transition-all">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-black text-green-900 dark:text-green-100 text-base truncate pr-8">{doc.name}</p>
                <p className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-widest mt-1">{doc.size} • {doc.type.split('/')[1] || 'TEXT'}</p>
              </div>
              <button 
                onClick={() => removeDoc(i)}
                className="absolute top-4 right-4 p-2 text-green-300 dark:text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
          {classDocuments.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-green-100 dark:border-white/5 rounded-[3rem]">
              <p className="text-green-500 dark:text-green-700 font-black uppercase tracking-widest text-sm">No context docs uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-green-600 p-4 rounded-3xl text-white shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </div>
          <div>
            <h2 className="text-4xl font-black text-green-950 dark:text-green-50 tracking-tight">Teacher Command</h2>
            <p className="text-green-600 dark:text-green-400 font-bold uppercase tracking-widest text-xs mt-1">Class Emotional Health Center</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-white/5 text-green-800 dark:text-green-400 px-8 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all active:scale-95 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> 
            Export Report
          </button>
        </div>
      </div>

      <nav className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 rounded-[2rem] border border-green-100 dark:border-white/10 w-fit flex gap-2 mx-auto md:mx-0 shadow-sm">
        {[
          { id: DashboardView.OVERVIEW, label: 'Pulse', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
          { id: DashboardView.SAFETY, label: 'Alerts', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
          { id: DashboardView.CLASS_DATA, label: 'Context', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardView)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all ${
              activeTab === tab.id 
                ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' 
                : 'text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="pb-24">
        {activeTab === DashboardView.OVERVIEW && renderOverview()}
        {activeTab === DashboardView.CLASS_DATA && renderClassData()}
        {activeTab === DashboardView.SAFETY && (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-sm border border-red-50 dark:border-white/5 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-red-900 dark:text-red-400 flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> Critical Signals
              </h2>
              <button onClick={onClear} className="text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-full border border-red-100 dark:border-white/5 transition-all">Archive Alerts</button>
            </div>
            {reports.length === 0 ? (
              <div className="py-24 text-center opacity-30 flex flex-col items-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-8 rounded-full mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <p className="font-black text-green-950 dark:text-green-50 uppercase tracking-[0.2em] text-sm">All students are clear</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div key={report.id} className="p-8 rounded-[2.5rem] border-l-[12px] border-red-500 bg-red-50/40 dark:bg-red-900/10 flex justify-between items-center group hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{report.severity} Alert</span>
                        <span className="text-red-900/50 dark:text-red-400/50 text-xs font-bold">{new Date(report.timestamp).toLocaleTimeString()} • Elementary Safeguard</span>
                      </div>
                      <p className="text-red-950 dark:text-red-100 font-black text-2xl">"{report.childMessage}"</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-red-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Teacher Action</p>
                       <button className="text-xs font-bold text-slate-900 dark:text-white underline underline-offset-4">Log intervention</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
