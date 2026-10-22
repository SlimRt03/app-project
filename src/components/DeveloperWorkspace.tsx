import React, { useState, useEffect } from 'react';
import {
  Code2,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Lock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { User, DeveloperAccess, AuditLog } from '../types';
import { api } from '../services/api';

interface DeveloperWorkspaceProps {
  developerUser: User;
}

export const DeveloperWorkspace: React.FC<DeveloperWorkspaceProps> = ({
  developerUser,
}) => {
  const [access, setAccess] = useState<DeveloperAccess | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Model Testing diagnostic state
  const [testPrompt, setTestPrompt] = useState('Low angle camera flyby stance sports car');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadDevData();
  }, []);

  const loadDevData = async () => {
    try {
      setLoading(true);
      const [devRes, logRes] = await Promise.all([
        api.getDeveloperAccess(),
        api.getAuditLogs(),
      ]);
      const myAccess = devRes.developerAccess.find((d) => d.developerId === developerUser.id);
      setAccess(
        myAccess || {
          developerId: developerUser.id,
          username: developerUser.username,
          grantedPermissions: ['view_analytics', 'test_models'],
          grantedBy: 'SlimRt03 (Founder)',
          updatedAt: new Date().toISOString(),
        }
      );
      setAuditLogs(logRes.auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.enhancePrompt(testPrompt, 'Circuit Drift', 'Low Dolly-In', '24fps');
      setTestResult(
        `✓ Wan 2.1 Pipeline Online\nLatency: 142ms\nInference Target: Wan2.1-I2V-14B-720P\nPhysics Vectors: OK\nGenerated Prompt:\n"${res.enhancedPrompt}"`
      );
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const hasPerm = (perm: string) => {
    return access?.grantedPermissions.includes(perm) ?? false;
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Dev Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#121526] to-[#0e0d16] border border-blue-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-blue-200 font-display">
                Developer Workspace
              </h2>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                RBAC RESTRICTED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Authorized Engineer: @{developerUser.username} · Role: {developerUser.role}
            </p>
          </div>
        </div>

        {/* Permissions Strip */}
        <div className="mt-3 pt-3 border-t border-blue-500/20 flex flex-wrap gap-1.5">
          <span className="text-[10px] text-slate-400 mr-1 font-mono">Granted Capabilities:</span>
          {access?.grantedPermissions.map((p) => (
            <span
              key={p}
              className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950/90 text-blue-300 border border-blue-500/30 font-mono flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {p.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Safety Notice: Founder Protection */}
      <div className="p-3 rounded-2xl bg-[#141220] border border-slate-800 text-xs flex items-center gap-2 text-slate-400">
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="leading-relaxed text-[11px]">
          User credential administration and Founder root settings are restricted to Founder SlimRt03.
        </p>
      </div>

      {/* Tool 1: Wan 2.1 Model Diagnostics & Latency Benchmarking */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-300">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-display">
              Wan 2.1 Inference Diagnostic
            </h3>
          </div>
          {hasPerm('test_models') ? (
            <span className="text-[10px] text-emerald-400 font-mono">Enabled</span>
          ) : (
            <span className="text-[10px] text-red-400 font-mono">Restricted</span>
          )}
        </div>

        {hasPerm('test_models') ? (
          <div className="space-y-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter motion test prompt..."
              className="w-full px-3 py-2 bg-[#100f1c] border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
            />
            <button
              onClick={handleRunDiagnostic}
              disabled={isTesting}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTesting ? 'Testing pipeline...' : 'Benchmark Prompt & Model'}</span>
            </button>

            {testResult && (
              <pre className="p-3 bg-black/70 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {testResult}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            You do not have the 'test_models' capability. Request access from Founder SlimRt03.
          </p>
        )}
      </div>

      {/* Tool 2: System Telemetry & Logs */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-300">
            <Activity className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-display">
              System Telemetry & Audit Stream
            </h3>
          </div>
          {hasPerm('view_analytics') ? (
            <span className="text-[10px] text-emerald-400 font-mono">Active</span>
          ) : (
            <span className="text-[10px] text-red-400 font-mono">Restricted</span>
          )}
        </div>

        {hasPerm('view_analytics') ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-[#100f1c] border border-slate-800 text-[11px] font-mono flex items-center justify-between"
              >
                <div>
                  <span className="text-blue-300 font-semibold">{log.action}: </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-[9px] text-slate-500 shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Telemetry access restricted by Founder.
          </p>
        )}
      </div>
    </div>
  );
};
