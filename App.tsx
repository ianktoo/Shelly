
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import TurtleAvatar from './components/TurtleAvatar';
import TeacherDashboard from './components/TeacherDashboard';
import MarketingSection from './components/MarketingSection';
import DynamicIsland from './components/DynamicIsland';
import { AppRoute, TeacherReport, ClassDocument } from './types';
import { decode, decodeAudioData, createPcmBlob } from './services/audioUtils';
import { checkSafety, shouldTerminateConversation } from './services/safetyService';

const SHELLIE_VOICES = [
  { id: 'Puck', label: 'Playful', icon: '🎈' },
  { id: 'Charon', label: 'Gentle', icon: '☁️' },
  { id: 'Kore', label: 'Kind', icon: '💖' },
  { id: 'Fenrir', label: 'Deep', icon: '🌊' },
  { id: 'Zephyr', label: 'Cheerful', icon: '☀️' }
];

// Tool Declarations
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getCurrentTime',
    parameters: {
      type: Type.OBJECT,
      description: 'Get the current local time, date, and day of the week.',
      properties: {},
    },
  },
  {
    name: 'getCurrentLocation',
    parameters: {
      type: Type.OBJECT,
      description: 'Get the user\'s current geographical location (latitude and longitude).',
      properties: {},
    },
  },
  {
    name: 'getWeather',
    parameters: {
      type: Type.OBJECT,
      description: 'Get the current weather for a specific location.',
      properties: {
        latitude: { type: Type.NUMBER, description: 'Latitude of the location.' },
        longitude: { type: Type.NUMBER, description: 'Longitude of the location.' },
      },
      required: ['latitude', 'longitude'],
    },
  }
];

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [classDocuments, setClassDocuments] = useState<ClassDocument[]>([]);
  const [currentLiveSpeech, setCurrentLiveSpeech] = useState("");
  const [accumulatedTranscript, setAccumulatedTranscript] = useState("");
  const [isTerminatingState, setIsTerminatingState] = useState(false);
  
  const [inputAnalyser, setInputAnalyser] = useState<AnalyserNode | null>(null);
  const [outputAnalyser, setOutputAnalyser] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const isTerminatingRef = useRef(false);
  const isMutedRef = useRef(false);

  const clearCurrentHistory = useCallback(() => {
    setCurrentLiveSpeech("");
    setAccumulatedTranscript("");
  }, []);

  const stopConversation = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch (e) {}
      });
      sessionPromiseRef.current = null;
    }
    setIsSessionActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsMuted(false);
    setIsTerminatingState(false);
    clearCurrentHistory();
    isTerminatingRef.current = false;
    isMutedRef.current = false;
    
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    audioContextRef.current = null;
    outputAudioContextRef.current = null;
    setInputAnalyser(null);
    setOutputAnalyser(null);
  }, [clearCurrentHistory]);

  const toggleMute = useCallback(() => {
    const newState = !isMuted;
    setIsMuted(newState);
    isMutedRef.current = newState;
  }, [isMuted]);

  // Tool Implementations
  const executeTool = async (name: string, args: any) => {
    switch (name) {
      case 'getCurrentTime':
        return { 
          time: new Date().toLocaleTimeString(), 
          date: new Date().toLocaleDateString(),
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };
      
      case 'getCurrentLocation':
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => resolve({ error: "Could not access location: " + err.message }),
            { timeout: 5000 }
          );
        });

      case 'getWeather':
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current_weather=true`);
          const data = await res.json();
          return {
            temperature: data.current_weather.temperature,
            unit: 'Celsius',
            windspeed: data.current_weather.windspeed,
            condition_code: data.current_weather.weathercode,
            description: "The weather is currently being fetched from a real-time meteorological service."
          };
        } catch (e) {
          return { error: "Failed to fetch weather data." };
        }

      default:
        return { error: "Unknown tool requested." };
    }
  };

  const handleSafetyAndTermination = useCallback((text: string) => {
    if (!text.trim()) return;
    
    if (shouldTerminateConversation(text) && !isTerminatingRef.current) {
      isTerminatingRef.current = true;
      setIsTerminatingState(true);
      setTimeout(() => stopConversation(), 1500);
      return;
    }

    const safetyResult = checkSafety(text);
    if (safetyResult.isDangerous) {
      const newReport: TeacherReport = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        childMessage: text,
        severity: safetyResult.severity!
      };
      setReports(prev => [newReport, ...prev]);
    }
  }, [stopConversation]);

  const startConversation = async () => {
    if (isSessionActive) return;
    isTerminatingRef.current = false;
    setIsTerminatingState(false);
    setIsMuted(false);
    isMutedRef.current = false;
    clearCurrentHistory();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await inputCtx.resume();
      await outputCtx.resume();

      const inAnalyser = inputCtx.createAnalyser();
      inAnalyser.fftSize = 256;
      const outAnalyser = outputCtx.createAnalyser();
      outAnalyser.fftSize = 256;
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      setInputAnalyser(inAnalyser);
      setOutputAnalyser(outAnalyser);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const contextString = classDocuments.length > 0 
        ? "CLASS CONTEXT:\n" + classDocuments.map(doc => `[${doc.name}]: ${doc.content}`).join("\n")
        : "No specific class context provided.";
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            setIsListening(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            source.connect(inAnalyser);
            inAnalyser.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isTerminatingRef.current || isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            sessionPromise.then(session => {
              session.sendRealtimeInput({ 
                text: "Hi! I am Shellie the turtle. I'm a good listener and I know lots of things, like the time and the weather. What's on your mind today?"
              });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const result = await executeTool(fc.name, fc.args);
                sessionPromise.then((session) => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result },
                    }
                  });
                });
              }
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setCurrentLiveSpeech(prev => (prev + text).slice(-100));
              setAccumulatedTranscript(prev => prev + text);
              handleSafetyAndTermination(text);
            }
            if (message.serverContent?.turnComplete) {
              setAccumulatedTranscript(final => { 
                handleSafetyAndTermination(final); 
                return ""; 
              });
              setCurrentLiveSpeech("");
            }
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outAnalyser);
              outAnalyser.connect(outCtx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) try { s.stop(); } catch (e) {}
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: () => stopConversation(),
          onclose: () => stopConversation()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
          },
          tools: [{ functionDeclarations: toolDeclarations }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Shellie the Emotional Turtle. Wise, funny, concise, and incredibly patient. Your goal is to support children age 4-10 in an elementary school setting. 

          CORE RULES:
          1. Be Kind, concise, and prioritize listening.
          2. Detect behavioral shifts like loneliness or bullying and offer gentle validation.
          3. Use context: ${contextString}
          4. ANTI-HALLUCINATION: If the user asks for the time, weather, or their location, ALWAYS use the provided tools. Do not guess.
          5. If asked general knowledge questions (e.g. "why is the sky blue?"), answer truthfully and simply for a child to understand.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      alert("Please allow microphone and location access to talk to Shellie!");
      stopConversation();
    }
  };

  const handleTalkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!isSessionActive) setTimeout(() => startConversation(), 500);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center bg-[#f0fdf4] dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden ${isSessionActive ? 'fixed inset-0 h-full overflow-hidden' : ''}`}>
      <DynamicIsland 
        isActive={isSessionActive} 
        isSpeaking={isSpeaking}
        isListening={isListening}
        isMuted={isMuted}
        isTerminating={isTerminatingState}
        onEnd={stopConversation}
        onToggleMute={toggleMute}
        onClear={clearCurrentHistory}
      />

      {/* Conditional Header */}
      {(!isSessionActive || route === AppRoute.TEACHER) && (
        <header className="w-full max-w-6xl flex justify-between items-center p-4 md:p-8 sticky top-0 bg-[#f0fdf4]/90 dark:bg-slate-950/90 backdrop-blur-xl z-[60] border-b border-green-100/20 dark:border-white/5 animate-in fade-in duration-500">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setRoute(AppRoute.HOME); }}
          >
            <div className="bg-green-600 p-2.5 rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black text-green-900 dark:text-green-50 leading-none">Shellie</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-green-600 dark:text-green-400">
                  {isSessionActive ? 'In Session' : 'Safe Guard Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRoute(route === AppRoute.HOME ? AppRoute.TEACHER : AppRoute.HOME)}
              className="text-[10px] md:text-sm font-black text-green-700 dark:text-green-400 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-green-50 dark:hover:bg-slate-800 transition-all active:scale-95 border border-green-100 dark:border-white/10 flex items-center gap-2"
            >
              {route === AppRoute.HOME ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> Dashboard</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Back</>
              )}
            </button>
          </div>
        </header>
      )}

      <main className={`w-full flex-grow flex flex-col transition-all duration-300 ${route === AppRoute.TEACHER ? 'max-w-6xl py-6 md:py-12' : 'max-w-4xl'}`}>
        {route === AppRoute.HOME ? (
          <div className={`flex flex-col items-center justify-center w-full py-8 transition-all ${isSessionActive ? 'h-screen fixed inset-0 z-50 bg-[#f0fdf4] dark:bg-slate-950' : 'min-h-[calc(100vh-120px)]'}`}>
            <div className="w-full text-center space-y-6 flex flex-col items-center">
              <div className="space-y-2 px-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                <h2 className="text-5xl md:text-8xl font-black text-green-950 dark:text-green-50 tracking-tighter">
                  {isSessionActive ? (isTerminatingState ? "Bye Friend!" : "I'm Listening") : "Hi! I'm Shellie."}
                </h2>
                <p className="text-green-800/60 dark:text-green-100/40 font-bold text-lg md:text-2xl max-w-sm md:max-w-xl mx-auto leading-tight">
                  {isSessionActive ? (isTerminatingState ? "Come back anytime!" : "What are your big feelings today?") : "A safe space where every child is heard."}
                </p>
              </div>

              <div className="relative w-full flex items-center justify-center py-4 md:py-8">
                <div className="absolute inset-0 bg-gradient-radial from-green-200/20 dark:from-green-900/10 to-transparent blur-3xl pointer-events-none"></div>
                <TurtleAvatar 
                  isListening={isListening && !isMuted} 
                  isSpeaking={isSpeaking} 
                  inputAnalyser={inputAnalyser}
                  outputAnalyser={outputAnalyser}
                />
                
                {isSessionActive && currentLiveSpeech && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[180%] md:-translate-y-[220%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-6 md:px-10 py-5 md:py-8 rounded-[2rem] md:rounded-[4rem] shadow-2xl border border-green-100/50 dark:border-white/5 min-w-[280px] md:min-w-[440px] max-w-[90vw] md:max-w-2xl z-30 animate-in zoom-in-95 fade-in duration-300">
                    <p className="text-green-950 dark:text-green-50 font-black italic text-xl md:text-4xl leading-relaxed break-words text-center">
                      "{currentLiveSpeech}"
                    </p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 border-r border-b border-green-100/50 dark:border-white/5 rotate-45"></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-8 w-full">
                {!isSessionActive ? (
                  <>
                    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                      <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full w-fit mx-auto">Voice Tone</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {SHELLIE_VOICES.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border-2 ${
                              selectedVoice === v.id 
                                ? 'bg-green-600 border-green-700 text-white scale-105 shadow-xl shadow-green-500/20' 
                                : 'bg-white dark:bg-slate-900 border-green-100 dark:border-white/5 text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{v.icon}</span>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={startConversation}
                      className="group bg-green-600 hover:bg-green-700 text-white text-3xl md:text-5xl font-black py-8 md:py-12 px-12 md:px-24 rounded-[2.5rem] md:rounded-[5rem] shadow-2xl transform transition-all hover:-translate-y-2 active:scale-95 flex items-center gap-6 border-b-[12px] md:border-b-[18px] border-green-800 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
                      <span className="text-4xl md:text-7xl group-hover:animate-bounce">🐚</span>
                      Talk to Shellie
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                     <div className="bg-green-100/50 dark:bg-green-900/20 px-8 py-3 rounded-full border border-green-200 dark:border-white/5 text-green-600 dark:text-green-400 font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3">
                       <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                       </span>
                       Active Empathy Sync
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Only show marketing if session is NOT active */}
            {!isSessionActive && <MarketingSection onTalkClick={handleTalkClick} />}
          </div>
        ) : (
          <TeacherDashboard 
            reports={reports} 
            onClear={() => setReports([])} 
            classDocuments={classDocuments}
            onUpdateDocuments={setClassDocuments}
          />
        )}
      </main>

      {/* Conditional Footer */}
      {!isSessionActive && (
        <footer className="w-full py-12 md:py-20 text-center bg-green-950 dark:bg-black text-green-200/40 dark:text-green-400/20 px-4">
          <p className="text-[9px] md:text-xs uppercase font-black tracking-[0.4em]">
            Empathetic Infrastructure • K-5 SAFEGUARD CERTIFIED • © 2025 Shellie AI
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
