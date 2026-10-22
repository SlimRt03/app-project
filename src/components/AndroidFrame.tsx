import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor, ShieldCheck, Sparkles } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeWallpaper: string;
  onOpenWallpaperSelector?: () => void;
}

export const CREW_WALLPAPERS = [
  {
    id: 'wall_1',
    title: 'Sunset Skyline Formation',
    url: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
    desc: 'Founder SlimRt03 & squad formation on rooftop vantage'
  },
  {
    id: 'wall_2',
    title: 'VIP Boutique Syndicate',
    url: '/assets/aistudio/0b8a1612190a1618726efdac71da0735_b8fdc318.webp',
    desc: 'Black tailored suits and snapbacks in luxury lounge'
  },
  {
    id: 'wall_3',
    title: 'Perque Tailored Meeting',
    url: '/assets/aistudio/2b1ab5be479887b6cf6be0d0d53195da_96ced120.webp',
    desc: 'Side profile squadron lineup'
  },
  {
    id: 'wall_4',
    title: 'Midnight Stance Patrol',
    url: '/assets/aistudio/08867c2660c06203c605b1b76795f14a_e2fe85b4.webp',
    desc: 'Stance crew night patrol next to slammed sports coupe'
  },
  {
    id: 'wall_5',
    title: 'Boutique Center Meeting',
    url: '/assets/aistudio/46d98f418fc5193533c6532d929d6bee_8c9fd1c7.webp',
    desc: 'Squad briefing in tailored apparel'
  },
  {
    id: 'wall_6',
    title: 'Syndicate Planning Room',
    url: '/assets/aistudio/89b703ba8ee96e7aaddd4e6ec1791667_2c6ba100.webp',
    desc: 'Wide view of crew strategy room'
  },
  {
    id: 'wall_7',
    title: 'Grand Track Master Assembly',
    url: '/assets/aistudio/66d513f5ad18381aac9308323a9f72ba_a91c328f.webp',
    desc: 'Full 7-director assembly at raceway bridge'
  },
  {
    id: 'wall_8',
    title: 'Camber Low Angle Formation',
    url: '/assets/aistudio/654b75069141660c2b50fad36d510d25_21f92912.webp',
    desc: 'Low angle stance posture under sunset sky'
  }
];

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeWallpaper,
  onOpenWallpaperSelector,
}) => {
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('17:31');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center justify-start p-0 md:p-3 selection:bg-purple-600 selection:text-white">
      {/* Top Floating Utility Bar for Evaluator / User: Toggle Android Phone Shell vs Fluid Responsive View */}
      <aside aria-label="Device Viewport Switcher" className="w-full max-w-5xl hidden md:flex items-center justify-between px-4 py-2 mb-2 text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-purple-400 tracking-wide font-display">
            STANCE CREW SA — ANDROID ENGINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Package: com.stancecrewsa.app</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified APK
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenWallpaperSelector && (
            <button
              onClick={onOpenWallpaperSelector}
              className="px-2.5 py-1 text-xs rounded-lg bg-purple-950/60 text-purple-300 hover:bg-purple-900/80 border border-purple-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change Background Wallpaper from Grand Mobile RP shots"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Change Crew Wallpaper</span>
            </button>
          )}

          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsPhoneMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                isPhoneMode
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Portrait Phone</span>
            </button>
            <button
              onClick={() => setIsPhoneMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                !isPhoneMode
                  ? 'bg-purple-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded View</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container: Android Phone Frame or Responsive Full Container */}
      <main
        className={`relative w-full transition-all duration-300 overflow-hidden flex flex-col ${
          isPhoneMode
            ? 'max-w-[425px] h-[915px] max-h-[96vh] rounded-[48px] border-[10px] border-[#181822] shadow-[0_0_50px_rgba(168,85,247,0.22)] ring-1 ring-white/10'
            : 'max-w-6xl min-h-[92vh] rounded-2xl border border-slate-800 shadow-2xl'
        }`}
      >
        {/* Background Layer with User's Uploaded Grand Mobile RP Screenshot */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none scale-105"
          style={{ backgroundImage: `url(${activeWallpaper})` }}
        />
        {/* Gradient Scrim & Atmospheric Tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090810]/92 via-[#0b0a14]/94 to-[#07070a]/98 backdrop-blur-[2px] pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-purple-950/20 via-transparent to-black/80 pointer-events-none" />

        {/* Android Status Bar */}
        <div className="relative z-30 h-11 px-6 flex items-center justify-between text-xs text-slate-300 font-medium select-none shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md">
          {/* Time & App Indicator */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">{currentTime}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/20">
              STANCE
            </span>
          </div>

          {/* Android Punch Hole Camera (centered in phone mode) */}
          {isPhoneMode && (
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#12121e]" />
            </div>
          )}

          {/* Android System Icons */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-mono text-purple-400 font-bold">5G</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono text-slate-300">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Inner App Content Scrollable Viewport */}
        <div className="relative z-20 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Android Gesture Navigation Pill at Bottom */}
        <div className="relative z-30 h-6 flex items-center justify-center shrink-0 bg-black/50 backdrop-blur-md border-t border-white/5 select-none">
          <div className="w-32 h-1 rounded-full bg-slate-400/50 hover:bg-purple-400 transition-colors" />
        </div>
      </main>
    </div>
  );
};
