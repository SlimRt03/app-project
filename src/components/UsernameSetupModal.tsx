import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface UsernameSetupModalProps {
  isOpen: boolean;
  currentUser: User;
  onUsernameVerified: (updatedUser: User) => void;
}

export const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  isOpen,
  currentUser,
  onUsernameVerified,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.setUsername(username.trim());
      onUsernameVerified(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to verify username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0f0e18] border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto shadow-lg shadow-purple-950/50">
          <UserCheck className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
            IDENTITY SETUP
          </span>
          <h2 className="text-base font-bold text-white font-display mt-2">
            Create Your Driver Username
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            Now that you are signed in, set your unique public handle. Your email address remains 100% private and hidden from the crew.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-mono">
              @
            </span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="e.g. StanceRacer_99"
              className="w-full pl-8 pr-3 py-2.5 bg-[#141322] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono"
            />
          </div>

          <p className="text-[10px] text-slate-400 text-left">
            Letters, numbers, and underscores only (3-20 characters).
          </p>

          <button
            type="submit"
            disabled={loading || username.trim().length < 3}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-950/50 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Verify & Enter Stance Crew SA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          STANCE CREW SA · “Built on the same road.”
        </div>
      </div>
    </div>
  );
};
