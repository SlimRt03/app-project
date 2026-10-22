import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  Shield,
  Code2,
  FileText,
  AlertTriangle,
  Search,
  Check,
  X,
  Lock,
  RefreshCw,
  Trash2,
  Sliders,
  ShieldAlert,
  Ban,
  UserCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { User, AuditLog, DeveloperAccess, ChatMessage, AppStats } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface FounderDashboardProps {
  founderUser: User;
  onFounderAuthenticated?: (user: User) => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  founderUser,
  onFounderAuthenticated,
}) => {
  // Founder Lock State: only allows entry with password SBZ 12345
  const isCurrentlyFounder = founderUser.role === 'founder' && founderUser.username === 'SlimRt03';
  const [isUnlocked, setIsUnlocked] = useState<boolean>(isCurrentlyFounder);
  const [founderKeyInput, setFounderKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'developers' | 'reports' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [devAccessList, setDevAccessList] = useState<DeveloperAccess[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Actions Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // In-App Permanent Deletion Modal
  const [userToDeleteCompletely, setUserToDeleteCompletely] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Invite Dev Modal
  const [isInviteDevOpen, setIsInviteDevOpen] = useState(false);
  const [devUsername, setDevUsername] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'view_analytics',
    'test_models',
  ]);

  useEffect(() => {
    if (isUnlocked) {
      loadAllAdminData();
    }
  }, [isUnlocked, activeTab]);

  const handleUnlockWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingKey(true);
    setKeyError(null);

    try {
      const res = await api.verifyFounderKey(founderKeyInput.trim());
      setIsUnlocked(true);
      showToast('Founder Sovereignty granted! Welcome SlimRt03.', 'success');
      if (onFounderAuthenticated) onFounderAuthenticated(res.user);
    } catch (err: any) {
      setKeyError(err.message || 'Invalid Founder Key. Must be SBZ 12345');
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, logRes, devRes, repRes, statRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAuditLogs(),
        api.getDeveloperAccess(),
        api.getReportedMessages(),
        api.getStats(),
      ]);
      setUsers(uRes.users);
      setAuditLogs(logRes.auditLogs);
      setDevAccessList(devRes.developerAccess);
      setReportedMessages(repRes.reported);
      setStats(statRes);
    } catch (err: any) {
      setError(err.message || 'Founder authorization failed');
    } finally {
      setLoading(false);
    }
  };

  // Block / Unblock User
  const handleToggleBlock = async (userId: string) => {
    setIsActionLoading(true);
    try {
      const res = await api.blockUser(userId);
      await loadAllAdminData();
      setSelectedUser(null);
      showToast(`User status updated to ${res.status}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle block status', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete User COMPLETELY from the app (Confirmed via in-app dialog)
  const confirmPermanentDeletion = async () => {
    if (!userToDeleteCompletely) return;
    if (deleteConfirmText.trim() !== userToDeleteCompletely.username) {
      showToast('Deletion aborted: Entered username does not match', 'warning');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await api.deleteUserCompletely(userToDeleteCompletely.id);
      showToast(res.message, 'success');
      await loadAllAdminData();
      setUserToDeleteCompletely(null);
      setSelectedUser(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Promote / Change Role
  const handleChangeRole = async (userId: string, newRole: 'member' | 'moderator' | 'developer') => {
    setIsActionLoading(true);
    try {
      await api.updateAdminUser(userId, { role: newRole });
      await loadAllAdminData();
      setSelectedUser(null);
      showToast(`Role updated to ${newRole}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Grant Dev Access
  const handleGrantDeveloperAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devUsername) return;
    try {
      await api.updateDeveloperAccess(devUsername, selectedPermissions);
      await loadAllAdminData();
      setIsInviteDevOpen(false);
      setDevUsername('');
      showToast(`Developer capabilities updated for @${devUsername}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update developer permissions', 'error');
    }
  };

  // Resolve Reported Message
  const handleResolveReport = async (msgId: string, action: 'dismiss' | 'delete') => {
    try {
      await api.resolveReport(msgId, action);
      setReportedMessages((prev) => prev.filter((m) => m.id !== msgId));
      showToast(`Report ${action === 'delete' ? 'actioned & message deleted' : 'dismissed'}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. LOCKED FOUNDER ROOM SCREEN (Nobody can enter without SBZ 12345)
  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto mb-4 shadow-lg shadow-amber-950/50">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            FOUNDER VAULT PROTECTED
          </span>

          <h2 className="text-lg font-black text-white font-display mt-2 mb-1">
            SlimRt03 Command Room
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            This private room is exclusively reserved for the Founder. Enter the verified Founder password to proceed.
          </p>

          <form onSubmit={handleUnlockWithKey} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={founderKeyInput}
                onChange={(e) => setFounderKeyInput(e.target.value)}
                placeholder="Enter password (SBZ 12345)"
                className="w-full pl-9 pr-3 py-2.5 bg-[#12111c] border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors text-center font-mono tracking-wider"
              />
            </div>

            {keyError && (
              <p className="text-[11px] text-red-400 font-medium">{keyError}</p>
            )}

            <button
              type="submit"
              disabled={isVerifyingKey || !founderKeyInput}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifyingKey ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Unlock Founder Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            STANCE CREW SA · Master Key Verification
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED FOUNDER ROOM DASHBOARD
  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Top Founder Identity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#181324] to-[#0e0d16] border border-amber-500/40 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-amber-200 font-display">
                  Founder Command Room
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono font-bold">
                  MASTER AUTH
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Director: @SlimRt03 · Full Administrative Sovereignty
              </p>
            </div>
          </div>

          <button
            onClick={loadAllAdminData}
            className="p-2 rounded-xl bg-black/50 text-amber-300 hover:text-white border border-amber-500/30 transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick KPI Strip */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-amber-500/20 text-center">
            <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
              <span className="text-xs font-bold text-white font-mono">{stats.totalUsers}</span>
              <p className="text-[9px] text-amber-300/80 uppercase">Members</p>
            </div>
            <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
              <span className="text-xs font-bold text-white font-mono">{stats.totalGalleryItems}</span>
              <p className="text-[9px] text-amber-300/80 uppercase">Archive</p>
            </div>
            <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
              <span className="text-xs font-bold text-white font-mono">{stats.totalChatMessages}</span>
              <p className="text-[9px] text-amber-300/80 uppercase">Comms</p>
            </div>
            <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
              <span className="text-xs font-bold text-white font-mono">{reportedMessages.length}</span>
              <p className="text-[9px] text-amber-300/80 uppercase">Reports</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members & Block/Delete</span>
        </button>

        <button
          onClick={() => setActiveTab('developers')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'developers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Dev Access</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Reports ({reportedMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS DIRECTORY (BLOCK & PERMANENT DELETE) */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by username..."
              className="w-full pl-9 pr-3 py-2 bg-[#141220] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => {
              const isFounder = u.username === 'SlimRt03' || u.role === 'founder';
              const isBlocked = u.status === 'suspended';

              return (
                <div
                  key={u.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                    isBlocked
                      ? 'bg-red-950/20 border-red-500/30'
                      : 'bg-[#141220] border-slate-800/80 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatarUrl}
                      alt={u.username}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white font-display truncate">
                          @{u.username}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          u.role === 'founder'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : u.role === 'moderator'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'developer'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                        {isBlocked && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40 font-bold">
                            BLOCKED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="text-amber-400 font-bold">{u.rpLevel} LVL</span>
                        <span>·</span>
                        <span>Driver Account</span>
                      </div>
                    </div>
                  </div>

                  {!isFounder ? (
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono font-bold px-2 py-1 bg-amber-950/40 rounded-lg shrink-0">
                      Founder
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER PERMISSIONS */}
      {activeTab === 'developers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Authorized Developers
              </h3>
              <p className="text-[10px] text-slate-400">
                Only permissions explicitly granted by Founder SlimRt03
              </p>
            </div>
            <button
              onClick={() => setIsInviteDevOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Assign Developer</span>
            </button>
          </div>

          <div className="space-y-2">
            {devAccessList.map((dev) => (
              <div
                key={dev.developerId}
                className="p-3 rounded-2xl bg-[#141220] border border-blue-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 font-display">
                    @{dev.username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Granted by SlimRt03
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {dev.grantedPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-lg bg-black/60 border border-blue-400/30 text-[10px] text-blue-200 font-mono"
                    >
                      ✓ {perm.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTED MESSAGES */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Community Moderation
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">
              {reportedMessages.length} reports
            </span>
          </div>

          {reportedMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-white">No reported messages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reportedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-[#141220] border border-amber-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">@{msg.username}</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      Reason: {msg.reportReason}
                    </span>
                  </div>
                  <div className="p-2.5 bg-black/50 rounded-xl text-xs text-slate-200 italic border border-slate-800">
                    "{msg.text || '[Media]'}"
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleResolveReport(msg.id, 'dismiss')}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolveReport(msg.id, 'delete')}
                      className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Delete Violation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Founder Administrative Audit Logs
          </h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-[#12111c] border border-slate-800 text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">{log.action}</span>
                  <span className="text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{log.details}</p>
                <div className="text-[9px] text-slate-500">Actor: @{log.actorUsername}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MANAGE USER (BLOCK OR DELETE COMPLETELY) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161424] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
                  Founder Actions for @{selectedUser.username}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-2">
              {/* 1. Block / Unblock User */}
              <button
                onClick={() => handleToggleBlock(selectedUser.id)}
                disabled={isActionLoading}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedUser.status === 'suspended'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>
                  {selectedUser.status === 'suspended'
                    ? 'Unblock & Reactivate User'
                    : 'Block / Suspend User from App'}
                </span>
              </button>

              {/* 2. Role promotion/demotion */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assign Role
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleChangeRole(selectedUser.id, 'member')}
                    className={`py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                      selectedUser.role === 'member'
                        ? 'bg-slate-700 text-white border-white/20'
                        : 'bg-black text-slate-400 border-slate-800'
                    }`}
                  >
                    Member
                  </button>
                  <button
                    onClick={() => handleChangeRole(selectedUser.id, 'moderator')}
                    className={`py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                      selectedUser.role === 'moderator'
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-black text-slate-400 border-slate-800'
                    }`}
                  >
                    Moderator
                  </button>
                  <button
                    onClick={() => handleChangeRole(selectedUser.id, 'developer')}
                    className={`py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                      selectedUser.role === 'developer'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-black text-slate-400 border-slate-800'
                    }`}
                  >
                    Developer
                  </button>
                </div>
              </div>

              {/* 3. Delete Completely from App (Requested) */}
              <button
                onClick={() => {
                  setUserToDeleteCompletely(selectedUser);
                  setDeleteConfirmText('');
                }}
                disabled={isActionLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete Completely From App</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Deleting completely purges this driver's login credentials, message history, and creations permanently.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN DEVELOPER */}
      {isInviteDevOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleGrantDeveloperAccess}
            className="w-full max-w-sm bg-[#161424] border border-blue-500/40 rounded-2xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 font-display">
                Assign Developer Capabilities
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteDevOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Driver Username
              </label>
              <input
                type="text"
                required
                value={devUsername}
                onChange={(e) => setDevUsername(e.target.value)}
                placeholder="Enter member handle..."
                className="w-full px-3 py-2 bg-[#100f1a] border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Granted Privileges
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'view_analytics', label: 'View System Analytics & Logs' },
                  { id: 'test_models', label: 'Test Wan 2.1 AI Models & Parameters' },
                  { id: 'manage_gallery', label: 'Manage & Tag Gallery Archives' },
                ].map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPermissions([...selectedPermissions, p.id]);
                        else setSelectedPermissions(selectedPermissions.filter((id) => id !== p.id));
                      }}
                      className="accent-blue-500 rounded"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteDevOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In-App Permanent Deletion Confirmation Modal */}
      {userToDeleteCompletely && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161424] border border-red-500/50 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white font-display">Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action cannot be undone. To permanently delete <strong className="text-red-400">@{userToDeleteCompletely.username}</strong>, please type their username below to verify:
            </p>
            <div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={`Type "${userToDeleteCompletely.username}"`}
                className="w-full px-3 py-2 bg-[#0e0d16] border border-red-500/40 rounded-xl text-xs text-white placeholder-slate-500 outline-none font-mono"
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDeleteCompletely(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPermanentDeletion}
                disabled={deleteConfirmText.trim() !== userToDeleteCompletely.username || isActionLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                {isActionLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
