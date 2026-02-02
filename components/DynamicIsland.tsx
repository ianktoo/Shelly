
import React from 'react';

interface DynamicIslandProps {
  isActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  isTerminating: boolean;
  onEnd: () => void;
  onToggleMute: () => void;
  onClear: () => void;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({
  isActive,
  isSpeaking,
  isListening,
  isMuted,
  isTerminating,
  onEnd,
  onToggleMute,
  onClear
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out animate-in slide-in-from-bottom-12">
      <div 
        className={`
          relative flex items-center gap-3 md:gap-4 bg-black/90 dark:bg-slate-900/95 backdrop-blur-2xl px-4 py-2.5 rounded-[2.5rem] 
          shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 transition-all duration-500
          ${isSpeaking ? 'w-[320px] md:w-[380px]' : 'w-[280px] md:w-[330px]'}
        `}
      >
        {/* Visualizer / Icon */}
        <div className="flex items-center gap-2 pl-1">
          <div className="relative">
            <span className={`text-xl transition-transform duration-300 block ${isSpeaking ? 'scale-110 rotate-6' : 'scale-100'}`}>
              🐢
            </span>
            {isMuted && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-[8px] rounded-full p-0.5 border border-black flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 items-center h-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`w-0.5 md:w-1 rounded-full bg-green-400 transition-all duration-300 ${
                  isSpeaking && !isMuted ? 'animate-bounce' : 'h-1 opacity-20'
                }`}
                style={{ 
                  animationDelay: `${i * 0.1}s`, 
                  height: (isSpeaking && !isMuted) ? '100%' : '4px' 
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Text */}
        <div className="flex-grow flex flex-col justify-center overflow-hidden">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-0.5 truncate">
            {isTerminating ? 'Closing' : 'Shellie Active'}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-white leading-none truncate">
            {isTerminating ? 'Goodbye!' : (isMuted ? 'Muted' : (isSpeaking ? 'Shellie speaking...' : 'Listening...'))}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-full transition-all active:scale-90 border flex items-center justify-center ${
              isMuted 
                ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            )}
          </button>
          
          <button
            onClick={onClear}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all active:scale-90 flex items-center justify-center"
            aria-label="Clear session history"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>

          <button
            onClick={onEnd}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ml-1 shadow-lg"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicIsland;
