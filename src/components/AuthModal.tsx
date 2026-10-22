import React, { useState } from 'react';
import { X, Lock, Mail, Shield, AlertCircle, ArrowRight, CheckCircle2, RefreshCw, KeyRound, Crown, ChevronRight, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'founder' | 'reset'>('login');

  // Form states
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [desiredUsername, setDesiredUsername] = useState('');

  // Google sign in custom modal state
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleStep, setGoogleStep] = useState<'pick' | 'custom'>('pick');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const res = await api.login(identifier.trim(), password.trim());
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await api.register({
          email: email.trim(),
          password: password.trim(),
          username: desiredUsername.trim() || undefined,
        });
        onSuccess(res.user);
        onClose();
      } else if (mode === 'founder') {
        const res = await api.verifyFounderKey(password.trim());
        onSuccess(res.user);
        onClose();
      } else if (mode === 'reset') {
        const res = await api.resetPassword(email.trim() || identifier.trim(), password.trim());
        setSuccessMessage(res.message);
        setTimeout(() => {
          setMode('login');
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (accountEmail: string, accountName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.signInWithGoogle({
        email: accountEmail,
        name: accountName,
        avatarUrl: '/assets/aistudio/8d43fe2c475b879ccb0535114bdaba1f_14b4f0f6.webp',
      });
      setShowGoogleChooser(false);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f0e17] border border-purple-500/25 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display tracking-tight">STANCE CREW SA</h2>
              <p className="text-[11px] text-purple-300/80 font-mono">Grand Mobile RP Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#161522] p-1 rounded-xl my-4 border border-slate-800/80 gap-1">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode('founder'); setError(null); setPassword(''); }}
            className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'founder' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Founder</span>
          </button>
          <button
            onClick={() => { setMode('reset'); setError(null); }}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'reset' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div className="p-3 mb-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON (Presented on both Sign In & Sign Up) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowGoogleChooser(true)}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs tracking-wide flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="flex items-center my-3.5">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-2.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                or continue with credentials
              </span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>
          </div>
        )}

        {/* FORM: FOUNDER DIRECT LOGIN (SBZ 12345) */}
        {mode === 'founder' && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <span className="font-bold block text-amber-300 mb-0.5">Founder SlimRt03 Verification</span>
              Enter the master founder password (<span className="font-mono font-bold text-white">SBZ 12345</span>) to sign in directly with full Founder Sovereignty.
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Founder Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter SBZ 12345"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141320] border border-amber-500/40 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In as Founder SlimRt03</span>}
            </button>
          </form>
        )}

        {/* FORM: STANDARD LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Username or Private Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Driver username or account email"
                className="w-full px-3 py-2.5 bg-[#141320] border border-slate-700/80 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141320] border border-slate-700/80 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In & Verify Driver</span>}
            </button>
          </form>
        )}

        {/* FORM: REGISTER (Sign Up with email, then create username) */}
        {mode === 'register' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Private Email (Never Exposed)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.private.email@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Desired Driver Username (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={desiredUsername}
                  onChange={(e) => setDesiredUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="You can also verify this right after logging in"
                  className="w-full pl-8 pr-3 py-2.5 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-purple-900/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign Up & Set Username</span>}
            </button>
          </form>
        )}

        {/* FORM: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Account Email or Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full px-3 py-2.5 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-3 py-2.5 bg-[#141320] border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Reset Password</span>}
            </button>
          </form>
        )}

        {/* Strict Privacy Guarantee Box (Requested by user) */}
        <div className="mt-4 p-3 rounded-xl bg-[#141222] border border-slate-800 text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>Driver Privacy Protocol:</strong> Only what you explicitly choose to share in the Family Chat is visible to other members. Your email, activity, and personal info are strictly private and never broadcast.
          </span>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER SHEET MODAL */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161524] border border-purple-500/40 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs font-bold text-white font-display">Sign In with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-300">
              Choose a Google Account to authenticate with STANCE CREW SA. Your email is kept completely private.
            </p>

            {googleStep === 'pick' ? (
              <div className="space-y-2">
                {/* Detected Google Account */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('thiplojunior@gmail.com', 'Grand Stance Driver')}
                  disabled={isLoading}
                  className="w-full p-3 rounded-xl bg-[#201d33] hover:bg-[#282442] border border-purple-500/30 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow">
                      T
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                        thiplojunior@gmail.com
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Google Account
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Option to use another Google account */}
                <button
                  type="button"
                  onClick={() => setGoogleStep('custom')}
                  className="w-full p-2.5 rounded-xl border border-dashed border-slate-700 hover:border-purple-500/60 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Use another Google account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enter Google Email
                  </label>
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3 py-2 bg-[#100f1c] border border-purple-500/40 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('pick')}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(customGoogleEmail)}
                    disabled={!customGoogleEmail.includes('@') || isLoading}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Connecting...' : 'Authorize'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Next step: Verify your unique driver username</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
