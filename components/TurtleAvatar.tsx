
import React, { useEffect, useRef } from 'react';

interface TurtleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  inputAnalyser?: AnalyserNode | null;
  outputAnalyser?: AnalyserNode | null;
}

const TurtleAvatar: React.FC<TurtleAvatarProps> = ({ 
  isListening, 
  isSpeaking, 
  inputAnalyser, 
  outputAnalyser 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const activeAnalyser = isSpeaking ? outputAnalyser : (isListening ? inputAnalyser : null);
      if (activeAnalyser) {
        activeAnalyser.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width * 0.22; // Scaled radius

      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const baseColor = isSpeaking 
        ? (isDarkMode ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)')
        : (isDarkMode ? 'rgba(20, 184, 166, 0.4)' : 'rgba(20, 184, 166, 0.3)');

      // Draw primary ripple
      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 3;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255.0;
        const angle = (i / bufferLength) * Math.PI * 2;
        const offset = value * (canvas.width * 0.15);
        const x = centerX + Math.cos(angle) * (radius + offset);
        const y = centerY + Math.sin(angle) * (radius + offset);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw outer glow
      ctx.beginPath();
      ctx.strokeStyle = baseColor.replace('0.4', '0.1').replace('0.3', '0.1');
      ctx.lineWidth = 1;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[(i + 32) % bufferLength] / 255.0;
        const angle = (i / bufferLength) * Math.PI * 2;
        const offset = value * (canvas.width * 0.1);
        const x = centerX + Math.cos(angle) * (radius + (canvas.width * 0.1) + offset);
        const y = centerY + Math.sin(angle) * (radius + (canvas.width * 0.1) + offset);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isListening, isSpeaking, inputAnalyser, outputAnalyser]);

  return (
    <div className="relative w-full aspect-square max-w-[320px] md:max-w-[480px] flex items-center justify-center">
      {/* Dynamic Canvas Sizing to Container */}
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={500} 
        className="absolute inset-0 w-full h-full z-0"
      />

      {isListening && !isSpeaking && (
        <div className="absolute w-[60%] h-[60%] bg-green-400/10 dark:bg-green-400/5 rounded-full animate-ping z-0" />
      )}

      <div className="relative z-10 w-[55%] h-[55%] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_50px_rgba(34,197,94,0.1)]">
          {/* Legs */}
          <ellipse cx="60" cy="150" rx="15" ry="10" fill="#4ade80" />
          <ellipse cx="140" cy="150" rx="15" ry="10" fill="#4ade80" />
          <ellipse cx="60" cy="80" rx="15" ry="10" fill="#4ade80" />
          <ellipse cx="140" cy="80" rx="15" ry="10" fill="#4ade80" />
          
          {/* Shell */}
          <path 
            d="M40 120 Q100 20 160 120 Z" 
            fill="#166534" 
            className={isSpeaking ? "animate-bounce" : ""}
            style={{ animationDuration: '0.8s', transformOrigin: 'center bottom' }}
          />
          <path 
            d="M50 115 Q100 35 150 115 Z" 
            fill="#15803d" 
          />
          <path d="M70 60 Q100 45 130 60" stroke="#166534" strokeWidth="2" fill="none" opacity="0.3" />
          
          {/* Head */}
          <g className={isListening ? "animate-pulse" : ""}>
            <circle cx="175" cy="110" r="22" fill="#4ade80" />
            <circle cx="184" cy="105" r="3.5" fill="black" />
            <circle cx="185" cy="104" r="1.2" fill="white" />
            <path 
              d={isSpeaking ? "M175 120 Q182 135 188 120" : "M175 122 Q182 126 188 122"} 
              stroke="#052e16" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default TurtleAvatar;
