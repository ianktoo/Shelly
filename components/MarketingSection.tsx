
import React from 'react';

interface MarketingSectionProps {
  onTalkClick: () => void;
}

const MarketingSection: React.FC<MarketingSectionProps> = ({ onTalkClick }) => {
  return (
    <section className="w-full max-w-5xl mt-12 md:mt-24 space-y-16 md:space-y-32 px-4 md:px-6 pb-24">
      {/* Primary Value Prop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="space-y-4 md:space-y-8 text-center md:text-left">
          <div className="inline-block bg-green-100 dark:bg-green-900/30 px-4 py-1.5 rounded-full text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-widest">
            🛡️ Elementary Grade Safety
          </div>
          <h3 className="text-4xl md:text-6xl font-black text-green-950 dark:text-green-50 leading-[1.1]">
            Where Every Child <span className="text-green-600">is Heard.</span>
          </h3>
          <p className="text-lg md:text-xl text-green-800/70 dark:text-green-100/60 leading-relaxed font-medium">
            Shellie is more than an AI—she's a silent guardian for your classroom's emotional health. Purpose-built for K-5 students to bridge the gap between feelings and feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onTalkClick}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 border-b-8 border-green-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              Talk to Shellie
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-green-500/20 rounded-[4rem] blur-3xl group-hover:bg-green-500/30 transition-all"></div>
          <div className="relative bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-green-100 dark:border-white/5 aspect-square flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-3xl flex items-center justify-center text-green-600 mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h4 className="text-2xl font-black text-green-900 dark:text-green-50">Signal Detection</h4>
            <p className="text-green-700 dark:text-green-400 font-bold mt-2">Pattern recognition for behavioral shifts and social warning signs.</p>
          </div>
        </div>
      </div>

      {/* Behavioral Signals / RAG Marketing */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-20 rounded-[4rem] border border-green-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5">
           <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div className="max-w-3xl space-y-8 relative z-10">
          <h3 className="text-4xl md:text-5xl font-black text-green-950 dark:text-green-50">Early Intervention Engine</h3>
          <p className="text-xl text-green-800/70 dark:text-green-100/60 font-medium leading-relaxed">
            Every interaction is processed through a specialized safety layer that identifies not just words, but <strong>behavioral patterns</strong>. If a student mentions home loneliness, bullying, or social friction three times in one week, you'll know instantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-white/5">
                <div className="text-green-600 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                <p className="font-black text-xs uppercase tracking-widest text-green-900 dark:text-green-400">Trend Analysis</p>
             </div>
             <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-white/5">
                <div className="text-green-600 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <p className="font-black text-xs uppercase tracking-widest text-green-900 dark:text-green-400">Class Context</p>
             </div>
             <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-white/5">
                <div className="text-green-600 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <p className="font-black text-xs uppercase tracking-widest text-green-900 dark:text-green-400">Instant Alerts</p>
             </div>
          </div>
        </div>
      </div>

      {/* Trust & Ethics Section */}
      <div className="text-center space-y-12">
        <h2 className="text-3xl md:text-4xl font-black text-green-900 dark:text-green-50">Safe, Ethical, and Private.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { title: "K-5 Optimized", icon: "🏫", text: "Curated vocabulary and simple feedback loops." },
             { title: "Pattern Watch", icon: "🔍", text: "AI that looks for shifts in social behavior over time." },
             { title: "Teacher Control", icon: "👩‍🏫", text: "You define the context; you receive the reports." },
             { title: "Encrypted", icon: "🔐", text: "Audio data is ephemeral and never sold." }
           ].map((card, i) => (
             <div key={i} className="space-y-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-green-50 dark:border-white/5">
               <div className="text-4xl">{card.icon}</div>
               <h5 className="font-black text-green-900 dark:text-green-100">{card.title}</h5>
               <p className="text-sm text-green-700/70 dark:text-green-400/70">{card.text}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;
