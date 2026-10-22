import React from 'react';
import { Home, Image as ImageIcon, Video, MessageSquare, Crown, Code2, User as UserIcon } from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'home' | 'gallery' | 'promptLab' | 'aiStudio' | 'chat' | 'founder' | 'developer';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: UserRole;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  unreadCount = 0,
}) => {
  const isFounder = userRole === 'founder';
  const isDeveloper = userRole === 'developer';

  return (
    <nav aria-label="Mobile Navigation" className="absolute bottom-0 left-0 right-0 z-40 bg-[#0d0c15]/95 backdrop-blur-xl border-t border-purple-500/20 px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
          currentTab === 'home'
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Home className={`w-5 h-5 transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`} />
          {currentTab === 'home' && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">Home</span>
      </button>

      {/* 2. Gallery */}
      <button
        onClick={() => onSelectTab('gallery')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
          currentTab === 'gallery'
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ImageIcon className={`w-5 h-5 transition-transform ${currentTab === 'gallery' ? 'scale-110' : ''}`} />
          {currentTab === 'gallery' && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">Archive</span>
      </button>

      {/* 3. AI Studio */}
      <button
        onClick={() => onSelectTab('aiStudio')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
          currentTab === 'aiStudio' || currentTab === 'promptLab'
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            currentTab === 'aiStudio' || currentTab === 'promptLab'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/60 scale-105'
              : 'bg-purple-950/60 text-purple-300 border border-purple-500/20'
          }`}>
            <Video className="w-3.5 h-3.5" />
          </div>
        </div>
        <span className="text-[10px] tracking-tight mt-1">AI Video</span>
      </button>

      {/* 4. Family Chat */}
      <button
        onClick={() => onSelectTab('chat')}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
          currentTab === 'chat'
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <MessageSquare className={`w-5 h-5 transition-transform ${currentTab === 'chat' ? 'scale-110' : ''}`} />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          {currentTab === 'chat' && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">Comms</span>
      </button>

      {/* 5. Role-Specific Command Tab: Founder, Developer, or Driver Profile */}
      {isFounder ? (
        <button
          onClick={() => onSelectTab('founder')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'founder'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <div className="relative">
            <Crown className={`w-5 h-5 transition-transform ${currentTab === 'founder' ? 'scale-110' : ''}`} />
            {currentTab === 'founder' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Founder</span>
        </button>
      ) : isDeveloper ? (
        <button
          onClick={() => onSelectTab('developer')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'developer'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-blue-300'
          }`}
        >
          <div className="relative">
            <Code2 className={`w-5 h-5 transition-transform ${currentTab === 'developer' ? 'scale-110' : ''}`} />
            {currentTab === 'developer' && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Dev Hub</span>
        </button>
      ) : (
        <button
          onClick={() => onSelectTab('home')}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Crew</span>
        </button>
      )}
    </nav>
  );
};
