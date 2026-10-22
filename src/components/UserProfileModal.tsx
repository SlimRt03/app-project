import React, { useState } from 'react';
import { X, Shield, Camera, LogOut, Check, Sparkles, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { CREW_WALLPAPERS } from './AndroidFrame';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [rpLevel, setRpLevel] = useState(user.rpLevel || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateProfile({ bio, avatarUrl, rpLevel: Number(rpLevel) });
      onUpdateUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f0e17] border border-purple-500/25 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold font-display">
              Driver Dossier & Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card with Grand Mobile RP Styling */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#1a1528] to-[#0e0e18] border border-purple-500/30 flex items-center gap-4 relative overflow-hidden">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-md shadow-purple-900/50"
            />
            <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
              <Camera className="w-5 h-5 text-purple-300" />
              <input type="file" accept="image/*" className="hidden" onChange={handleCustomAvatarUpload} />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate font-display">@{user.username}</h3>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                user.role === 'founder'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                  : user.role === 'moderator'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                  : user.role === 'developer'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 font-mono mt-0.5">{user.crewTag}</p>

            {/* Health / RP Level Tag in Grand Mobile RP style */}
            <div className="mt-2 flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                {rpLevel} LVL
              </div>
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full rp-health-bar w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Change Avatar from Uploaded Images */}
        <div className="mt-4">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Select Crew Photo as Avatar</span>
            <span className="text-[10px] text-purple-400">8 Official Photos</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CREW_WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => setAvatarUrl(wp.url)}
                className={`relative h-14 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                  avatarUrl === wp.url ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={wp.url} alt={wp.title} className="w-full h-full object-cover" />
                {avatarUrl === wp.url && (
                  <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              RP Level (1 - 100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={rpLevel}
              onChange={(e) => setRpLevel(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#141320] border border-slate-700/80 rounded-xl text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Personal RP Story & Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your Stance Crew road story..."
              className="w-full px-3 py-2 bg-[#141320] border border-slate-700/80 rounded-xl text-xs text-white outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Privacy Notice */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-[10px] text-purple-300/90 leading-relaxed flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
            <span>
              Your private recovery email (<span className="text-white font-mono">{user.email || 'private'}</span>) is encrypted and protected. Only your username is shared in chat and gallery.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-purple-900/40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
