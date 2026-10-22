import React from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Video,
  MessageSquare,
  Crown,
  Code2,
  ChevronRight,
  Shield,
  Volume2,
  Users,
  Flame,
  Radio,
  Zap,
  LogIn,
} from 'lucide-react';
import { User, AppStats } from '../types';
import { CREW_WALLPAPERS } from './AndroidFrame';

interface HomeDashboardProps {
  user: User;
  onNavigate: (tab: 'home' | 'gallery' | 'promptLab' | 'aiStudio' | 'chat' | 'founder' | 'developer') => void;
  onOpenProfile: () => void;
  onOpenWallpaperSelector: () => void;
  onOpenAuth?: () => void;
  stats?: AppStats;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  onNavigate,
  onOpenProfile,
  onOpenWallpaperSelector,
  onOpenAuth,
  stats,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 animate-fadeIn">
      {/* 1. Grand Mobile RP HUD Card (Inspired directly by the game UI in the screenshots) */}
      <div className="glass-panel-purple rounded-2xl p-3.5 relative overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-950/30">
        <div className="flex items-center justify-between">
          {/* User profile & RP Level lockup */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-13 h-13 rounded-xl object-cover border-2 border-purple-400 group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white font-display tracking-tight">
                  {user.username}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  user.role === 'founder'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : user.role === 'moderator'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : user.role === 'developer'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {user.role}
                </span>
              </div>

              <p className="text-[10px] text-purple-300 font-mono font-semibold tracking-wide">
                {user.crewTag || 'STANCE CREW S.A'}
              </p>

              {/* Exact Level & Health Indicators as in the user's game screenshot */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                  <span className="text-[10px] font-mono text-slate-300 font-bold">637</span>
                  <span className="text-[10px] font-mono font-extrabold text-amber-400">
                    {user.rpLevel} LVL
                  </span>
                </div>
                <div className="w-20 h-1.5 rounded-full bg-black/60 overflow-hidden flex">
                  <div className="w-[85%] h-full rp-health-bar" />
                  <div className="w-[15%] h-full bg-slate-800" />
                </div>
              </div>
            </div>
          </button>

          {/* Quick HUD controls */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-[10px] text-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Sign In with Google or Switch Account"
                >
                  <LogIn className="w-3 h-3 text-purple-300" />
                  <span>Account</span>
                </button>
              )}
              <button
                onClick={onOpenWallpaperSelector}
                className="px-2 py-1 rounded-lg bg-black/50 hover:bg-purple-900/60 border border-purple-500/30 text-[10px] text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Change wallpaper"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Theme</span>
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>ZA-SERVER 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Cinematic Tagline Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl group">
        <img
          src={CREW_WALLPAPERS[0].url}
          alt="Stance Crew Lineup"
          className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090812] via-[#090812]/70 to-transparent" />
        
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>Grand Mobile RP Syndicate</span>
            </div>
            <h1 className="text-xl font-black text-white font-display tracking-tight">
              STANCE CREW SA
            </h1>
            <p className="text-xs text-purple-200/90 italic font-medium">
              “Built on the same road.”
            </p>
          </div>

          <button
            onClick={() => onNavigate('chat')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-purple-950/50 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Radio</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Hub Navigation Grid (As required: Gallery, Prompt Lab, AI Studio, Family Chat, Founder) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Command Modules
          </span>
          <span className="text-[10px] text-purple-400 font-mono">
            {stats ? `${stats.totalUsers} Crew Members` : 'Live'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Gallery & Archive */}
          <button
            onClick={() => onNavigate('gallery')}
            className="p-3.5 rounded-2xl bg-[#13121e]/90 hover:bg-[#1a182b] border border-purple-500/20 hover:border-purple-500/50 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {stats?.totalGalleryItems ?? 8} Shots
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                Gallery & Archive
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Car stance, meets & stories
              </p>
            </div>
          </button>

          {/* Prompt Lab */}
          <button
            onClick={() => onNavigate('promptLab')}
            className="p-3.5 rounded-2xl bg-[#13121e]/90 hover:bg-[#1a182b] border border-purple-500/20 hover:border-purple-500/50 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-purple-400 font-mono font-semibold">
                Wan 2.1
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                Prompt Lab
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                AI camera & motion director
              </p>
            </div>
          </button>

          {/* AI Studio */}
          <button
            onClick={() => onNavigate('aiStudio')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1a122e]/90 to-[#12111c]/90 hover:from-[#23173e] border border-purple-500/30 hover:border-purple-400 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-400/30 font-mono">
                Real I2V
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                AI Video Studio
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Turn photos to motion videos
              </p>
            </div>
          </button>

          {/* Family Chat */}
          <button
            onClick={() => onNavigate('chat')}
            className="p-3.5 rounded-2xl bg-[#13121e]/90 hover:bg-[#1a182b] border border-purple-500/20 hover:border-purple-500/50 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                Family Chat
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Voice notes & convoy comms
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Founder Room Access (Secured: requires Founder login / key) */}
      <button
        onClick={() => onNavigate('founder')}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg flex items-center justify-between ${
          user.role === 'founder'
            ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/80 border-amber-500/40 hover:border-amber-400'
            : 'bg-[#12111d] border-slate-800 hover:border-amber-500/30 opacity-90'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-amber-200 font-display">Founder Room</p>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono">
                {user.role === 'founder' ? 'UNLOCKED' : 'LOCKED (SBZ 12345)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {user.role === 'founder'
                ? 'Manage members, block/delete users, & moderation logs'
                : 'Restricted to Founder SlimRt03 · Passcode required'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
      </button>

      {user.role === 'developer' && (
        <button
          onClick={() => onNavigate('developer')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/80 border border-blue-500/40 hover:border-blue-400 text-left transition-all cursor-pointer group shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-blue-200 font-display">Developer Workspace</p>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  AUTHORIZED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                System telemetry, Wan 2.1 inference diagnostics & gallery tools
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* 5. Crew Directive / Dispatch Notice */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
            Crew Dispatch
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Convoy rules in effect: Low clearance, tight formation, and black apparel on official rollouts. Check Family Chat for the next checkpoint coordinate.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Signed: @SlimRt03 (Founder)</span>
          <span>Grand Mobile RP · South Africa</span>
        </div>
      </div>
    </div>
  );
};
