import React from 'react';
import { X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CREW_WALLPAPERS } from './AndroidFrame';

interface WallpaperSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallpaper: string;
  onSelectWallpaper: (url: string) => void;
  onSetAsProfilePhoto?: (url: string) => void;
}

export const WallpaperSelector: React.FC<WallpaperSelectorProps> = ({
  isOpen,
  onClose,
  activeWallpaper,
  onSelectWallpaper,
  onSetAsProfilePhoto,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0e0e14] border border-purple-500/20 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Grand Mobile RP Wallpapers</h3>
              <p className="text-[11px] text-slate-400">Select authentic STANCE CREW SA photography</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 overflow-y-auto pr-1">
          {CREW_WALLPAPERS.map((item) => {
            const isCurrent = activeWallpaper === item.url;
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden border transition-all ${
                  isCurrent
                    ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-900/30'
                    : 'border-slate-800 hover:border-purple-400/50'
                }`}
              >
                <div className="h-32 w-full overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {isCurrent && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-300 truncate">{item.desc}</p>
                  </div>
                </div>

                <div className="p-2 bg-[#12121a] flex gap-1.5">
                  <button
                    onClick={() => onSelectWallpaper(item.url)}
                    className="flex-1 py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Set App Background</span>
                  </button>
                  {onSetAsProfilePhoto && (
                    <button
                      onClick={() => onSetAsProfilePhoto(item.url)}
                      title="Set as avatar"
                      className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official Grand Mobile RP Stance Crew SA Archive</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium text-xs hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
