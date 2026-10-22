import React, { useEffect, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFade(true), 1600);
    const timer2 = setTimeout(() => onComplete(), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#07060c] flex flex-col items-center justify-between p-8 transition-opacity duration-500 select-none ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div />

      {/* Center Branding Lockup */}
      <div className="flex flex-col items-center text-center animate-fadeIn">
        {/* App Icon using user's uploaded image with glowing border */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.45)] ring-4 ring-purple-950/60">
            <img
              src="/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp"
              alt="STANCE CREW SA"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-black/90 border border-purple-400 text-[10px] font-mono text-purple-300 font-bold shadow">
            SA RP
          </div>
        </div>

        <h1 className="text-2xl font-black text-white font-display tracking-tight text-glow-purple">
          STANCE CREW SA
        </h1>
        <p className="text-xs text-purple-300 font-medium italic mt-1">
          “Built on the same road.”
        </p>

        <div className="mt-8 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-100" />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce delay-200" />
        </div>
      </div>

      {/* Android Signature Footer */}
      <div className="text-center font-mono text-[10px] text-slate-400">
        <p className="text-purple-400/90 font-semibold">Grand Mobile RP Official App</p>
        <p className="text-slate-400 mt-0.5">com.stancecrewsa.app · v2.4.0-STANCE</p>
      </div>
    </div>
  );
};
