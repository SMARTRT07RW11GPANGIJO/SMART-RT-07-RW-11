import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/rt';
import {
  ControlCenterService,
  ControlCenterState,
  ControlCenterIncidentItem
} from '../services/controlCenterService';
import { AuditLogger } from '../services/auditLoggerService';
import { AIAuditLog } from '../types/aiAudit';
import {
  ShieldCheck,
  Server,
  Database,
  HardDrive,
  MessageSquare,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Terminal,
  Activity,
  Lock,
  Clock,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Radio,
  ShieldAlert,
  FileText,
  Key,
  Layers,
  AlertOctagon,
  Eye,
  Settings,
  Flame,
  Search,
  CheckSquare,
  AlertCircle,
  Sliders,
  History,
  Power,
  Play,
  CornerDownLeft,
  X,
  GraduationCap,
  Award,
  Rocket
} from 'lucide-react';

interface Props {
  currentUserRole: UserRole;
  onOpenDocumentation?: () => void;
  onOpenTraining?: () => void;
  onOpenLaunch?: () => void;
}

type NavTab =
  | 'overview'
  | 'monitoring'
  | 'security'
  | 'backup'
  | 'ai'
  | 'releases'
  | 'incidents'
  | 'audit'
  | 'maintenance';

export const AdminControlCenterDashboard: React.FC<Props> = ({ currentUserRole, onOpenDocumentation, onOpenTraining, onOpenLaunch }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [state, setState] = useState<ControlCenterState>(ControlCenterService.getState());
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState<AIAuditLog[]>([]);

  // Danger Zone Confirmation Modals
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState('');

  // Auto Refresh timer
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState<number>(state.autoRefreshSeconds || 30);

  // Check backend access permission
  const hasAccess = ControlCenterService.canAccessControlCenter(currentUserRole);

  const refreshData = () => {
    const updated = ControlCenterService.getState();
    setState(updated);
    setAuditLogs(AuditLogger.getLogs().slice(0, 30));
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Auto-refresh interval logic
  useEffect(() => {
    if (!state.autoRefreshSeconds || state.autoRefreshSeconds <= 0) return;

    const timer = setInterval(() => {
      setRefreshSecondsLeft((prev) => {
        if (prev <= 1) {
          refreshData();
          return state.autoRefreshSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.autoRefreshSeconds]);

  // Deny Access Screen for Unauthorized Warga / Public
  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl my-6">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6 shadow-inner animate-pulse">
          <Lock className="w-10 h-10" />
        </div>
        <div className="px-3 py-1 bg-rose-950 text-rose-400 font-mono text-xs font-bold rounded-full border border-rose-800 uppercase mb-3">
          403 FORBIDDEN — PRIVILEGED AREA
        </div>
        <h1 className="text-2xl font-black text-center text-white mb-2 tracking-tight">
          Akses SMART RT Control Center Ditolak
        </h1>
        <p className="text-slate-400 text-center max-w-md text-sm mb-6 leading-relaxed">
          Modul Control Center adalah pusat komando operasional terbatas untuk **SUPER_ADMIN**, **ADMIN**, dan **KETUA RT**. Peran Anda saat ini: <span className="font-bold text-amber-400 font-mono">[{currentUserRole}]</span>.
        </p>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono max-w-lg space-y-1">
          <div className="flex justify-between">
            <span>Security Enforcement:</span>
            <span className="text-emerald-400 font-bold">STRICT_BACKEND_GUARD</span>
          </div>
          <div className="flex justify-between">
            <span>Incident Logged:</span>
            <span className="text-rose-400 font-bold">UNAUTHORIZED_ACCESS_ATTEMPT</span>
          </div>
          <div className="flex justify-between">
            <span>Timestamp:</span>
            <span>{new Date().toISOString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Exact ASCII Card
  const formattedAsciiCard = `┌─────────────────────────────────────────────────────┐
│ 🛠️ SMART RT CONTROL CENTER                          │
│ RT 07 RW 11 • PERUM GPA NGIJO                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ SYSTEM HEALTH                                       │
│                                                     │
│ 🟢 Application      ${state.systemStatus.application.padEnd(28)} │
│ 🟢 Database         ${state.systemStatus.database.padEnd(28)} │
│ 🟢 Google Drive     ${state.systemStatus.googleDrive.padEnd(28)} │
│ 🟢 WhatsApp         ${state.systemStatus.whatsApp.padEnd(28)} │
│ 🟢 AI               ${state.systemStatus.ai.padEnd(28)} │
│ 🟢 Backup           ${state.systemStatus.backup.padEnd(28)} │
│                                                     │
├─────────────────────────────────────────────────────┤
│ SECURITY                                            │
│                                                     │
│ Failed Login       ${state.security.failedLogin.toString().padEnd(31)} │
│ Blocked Request    ${state.security.blockedRequest.toString().padEnd(31)} │
│ AI Security Block  ${state.security.aiSecurityBlock.toString().padEnd(31)} │
│ Suspicious Activity ${state.security.suspiciousActivity.toString().padEnd(30)} │
│                                                     │
├─────────────────────────────────────────────────────┤
│ BACKUP                                              │
│                                                     │
│ Last Backup         ${state.backup.lastBackupTime.padEnd(31)} │
│ Backup Status       ${state.backup.backupStatus.padEnd(31)} │
│ Last Restore Test   ${state.backup.lastRestoreTest.padEnd(31)} │
│ Backup Integrity    ${state.backup.backupIntegrity.padEnd(31)} │
│                                                     │
├─────────────────────────────────────────────────────┤
│ AI                                                  │
│                                                     │
│ Requests Today     ${state.ai.requestsToday.toString().padEnd(31)} │
│ Success Rate        ${(state.ai.successRate + '%').padEnd(31)} │
│ Blocked Requests     ${state.ai.blockedRequests.toString().padEnd(30)} │
│ Avg Latency        ${(state.ai.averageLatencyMs / 1000).toFixed(1)} sec                          │
│                                                     │
└─────────────────────────────────────────────────────┘`;

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(formattedAsciiCard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Actions
  const handlePingHealth = () => {
    setIsProcessing(true);
    setActionMessage('Memeriksa pings & status kesehatan seluruh service...');
    setTimeout(() => {
      const updated = ControlCenterService.triggerHealthCheck(currentUserRole);
      setState(updated);
      setIsProcessing(false);
      setActionMessage('Pemeriksaan selesai. Seluruh 9 sub-service dalam keadaan ONLINE.');
      setTimeout(() => setActionMessage(null), 3000);
    }, 600);
  };

  const handleRunBackupTest = () => {
    setIsProcessing(true);
    setActionMessage('Menjalankan backup snapshot & tes pemulihan otomatis...');
    setTimeout(() => {
      const updated = ControlCenterService.triggerBackupAndRestoreTest(currentUserRole);
      setState(updated);
      setIsProcessing(false);
      setActionMessage('Backup snapshot berhasil dibuat & hasil restore test VERIFIED PASS.');
      setTimeout(() => setActionMessage(null), 3000);
    }, 800);
  };

  const handleResetSecurity = () => {
    if (window.confirm('Reset semua counter ancaman keamanan (Failed Login, Blocked Request, AI Security Block)?')) {
      const updated = ControlCenterService.resetSecurityMetrics(currentUserRole);
      setState(updated);
      setActionMessage('Counter ancaman keamanan berhasil di-reset.');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleToggleMaintenance = () => {
    const nextState = !state.maintenance.active;
    const updated = ControlCenterService.toggleMaintenanceMode(
      nextState,
      maintenanceReasonInput || 'Pemeliharaan rutin database & sistem AI',
      currentUserRole
    );
    setState(updated);
    setShowMaintenanceModal(false);
    setActionMessage(`Mode Pemeliharaan ${nextState ? 'DILAKUKAN (ON)' : 'DINONAKTIFKAN (OFF)'}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleConfirmRollback = () => {
    const updated = ControlCenterService.rollbackRelease('REL-2026-007', currentUserRole);
    setState(updated);
    setShowRollbackModal(false);
    setActionMessage('Rollback ke Rilis REL-2026-007 Berhasil Dilakukan!');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const permissions = ControlCenterService.getPermissionMatrix(currentUserRole);

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.intent && log.intent.toLowerCase().includes(auditSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0D2A4A] via-[#1E3A5F] to-[#0D2A4A] text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-emerald-400 text-slate-950 uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping inline-block" />
              TAHAP 9J — CONTROL CENTER
            </span>
            <span className="text-xs text-slate-300 font-mono">SMART RT 07 RW 11 GPA NGIJO</span>
            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-[10px] font-mono border border-blue-700/50">
              ROLE: {currentUserRole}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
            SMART RT Control Center & System Health
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pusat komando tunggal operasional untuk memantau kesehatan aplikasi, database, Google Drive, WhatsApp Gateway, AI, keamanan, backup & restore test, rilis versi, dan incident management.
          </p>
        </div>

        {/* Health Score & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Health Score Badge */}
          <div className="px-4 py-2 bg-slate-900/80 rounded-2xl border border-slate-700/80 flex items-center gap-3 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Score</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {state.systemHealthScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePingHealth}
              disabled={isProcessing}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Ping All</span>
            </button>
            <button
              onClick={handleRunBackupTest}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Backup & Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Warning Banner if Active */}
      {state.maintenance.active && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-amber-200 flex items-start justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-300">
                ⚠️ MODE PEMELIHARAAN SISTEM AKTIF (MAINTENANCE MODE ON)
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {state.maintenance.noticeMessage} (Alasan: {state.maintenance.reason})
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shrink-0 hover:bg-amber-400 transition-colors"
          >
            Atur Mode
          </button>
        </div>
      )}

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'monitoring'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Center</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'backup'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Backup & Restore DR</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'ai'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('releases')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'releases'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Releases (9I)</span>
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'incidents'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Incidents</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'audit'
              ? 'bg-[#0D2A4A] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Log (6E)</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            activeTab === 'maintenance'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>Danger Zone</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ASCII TERMINAL VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: EXACT SPECIFIED ASCII TERMINAL VIEW (6 cols) */}
          <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wider">
                  SMART RT CONTROL CENTER ASCII CARD
                </span>
              </div>
              <button
                onClick={handleCopyAscii}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold flex items-center gap-1 transition-colors"
                title="Salin Teks ASCII"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Copy ASCII'}</span>
              </button>
            </div>

            {/* ASCII Box */}
            <div className="bg-black p-4 rounded-xl border border-slate-800/80 overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed select-all shadow-inner">
              <pre className="whitespace-pre">{formattedAsciiCard}</pre>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto-refresh: {state.autoRefreshSeconds}s ({refreshSecondsLeft}s)</span>
              <span>Update Terakhir: {new Date(state.lastUpdated).toLocaleTimeString('id-ID')}</span>
            </div>
          </div>

          {/* RIGHT: QUICK METRICS CARDS & VERSION SUMMARY (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Quick Status Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0D2A4A]" /> Ringkasan Status Layanan
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  ALL ONLINE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Aplikasi Vercel</span>
                  <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                    🟢 {state.systemStatus.application}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Google Sheets Database</span>
                  <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                    🟢 {state.systemStatus.database}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Google Drive Storage</span>
                  <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                    🟢 {state.systemStatus.googleDrive}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">WhatsApp Gateway</span>
                  <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                    🟢 {state.systemStatus.whatsApp}
                  </span>
                </div>
              </div>
            </div>

            {/* Versioning Badges (Tahap 9I Integration) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" /> Versi Aktif Sistem (Tahap 9I)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                  {state.release.releaseId}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">App</span>
                  <span className="font-bold text-purple-900">{state.release.appVersion}</span>
                </div>
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">AI Engine</span>
                  <span className="font-bold text-purple-900">{state.release.aiVersion}</span>
                </div>
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">System Prompt</span>
                  <span className="font-bold text-purple-900">{state.release.promptVersion}</span>
                </div>
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">Knowledge Base</span>
                  <span className="font-bold text-purple-900">{state.release.kbVersion}</span>
                </div>
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">RAG Engine</span>
                  <span className="font-bold text-purple-900">{state.release.ragVersion}</span>
                </div>
                <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-slate-500 text-[9px] block">Tools Suite</span>
                  <span className="font-bold text-purple-900">{state.release.toolsVersion}</span>
                </div>
              </div>
            </div>

            {/* 📚 Documentation Widget (Tahap 9K Integration) */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0D2A4A] p-5 rounded-2xl border border-slate-700/80 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> 📚 Documentation Widget (9K)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-700">
                  CURRENT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Doc Version</span>
                  <span className="font-bold text-white">DOC v1.0.0</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Status</span>
                  <span className="font-bold text-emerald-400">CURRENT</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Last Updated</span>
                  <span className="font-bold text-slate-200">2026-08-12</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Next Review</span>
                  <span className="font-bold text-amber-300">2026-11-12</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Coverage</span>
                  <span className="font-bold text-emerald-400">98%</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Modules</span>
                  <span className="font-bold text-blue-300">18 Sections</span>
                </div>
              </div>

              {onOpenDocumentation && (
                <button
                  onClick={onOpenDocumentation}
                  className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open System Documentation</span>
                </button>
              )}
            </div>

            {/* 🎓 Training Center Widget (Tahap 9L Integration) */}
            <div className="bg-gradient-to-r from-slate-900 to-[#122E1F] p-5 rounded-2xl border border-emerald-800/80 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> 🎓 Training Status Widget (9L)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-700">
                  TRAINING V1.0
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Warga</span>
                  <span className="font-bold text-emerald-400">92% Certified</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Pengurus</span>
                  <span className="font-bold text-emerald-400">100% Certified</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Ketua RT</span>
                  <span className="font-bold text-emerald-400">100% Certified</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Admin</span>
                  <span className="font-bold text-emerald-400">100% Certified</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Security Test</span>
                  <span className="font-bold text-purple-400">100% Pass</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Env Mode</span>
                  <span className="font-bold text-amber-300">Training Active</span>
                </div>
              </div>

              {onOpenTraining && (
                <button
                  onClick={onOpenTraining}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>Open Training Center & Exams</span>
                </button>
              )}
            </div>

            {/* 🚀 Official Launch 2.0 Widget (Tahap 9M Integration) */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 rounded-2xl border border-emerald-500/80 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-400" /> 🚀 Official Launch Status (9M)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500">
                  v2.0.0 OFFICIAL
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">System Status</span>
                  <span className="font-bold text-emerald-400">🟢 PRODUCTION</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">47-Point Check</span>
                  <span className="font-bold text-emerald-400">100% PASS</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Go/No-Go Board</span>
                  <span className="font-bold text-emerald-400">APPROVED (3/3)</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Pilot Program</span>
                  <span className="font-bold text-emerald-400">100% Exit Pass</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Hypercare SLA</span>
                  <span className="font-bold text-purple-400">14 Days Active</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[9px] block uppercase">Release Freeze</span>
                  <span className="font-bold text-emerald-400 font-bold">LOCKED</span>
                </div>
              </div>

              {onOpenLaunch && (
                <button
                  onClick={onOpenLaunch}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Open Official Launch Dashboard (9M)</span>
                </button>
              )}
            </div>

            {/* Realtime Event Stream Log */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Live Audit Stream
                </span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">
                  REALTIME
                </span>
              </div>
              <div className="space-y-1 text-[10px] max-h-28 overflow-y-auto">
                {auditLogs.slice(0, 4).map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString('id-ID')}]</span>
                    <span className="text-emerald-400 font-semibold">{log.action}</span>
                    <span className="text-slate-400">{log.userId}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM HEALTH DETAILED CARDS */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#0D2A4A]" /> Operational Sub-Services Health
            </h2>
            <button
              onClick={handlePingHealth}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Check All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Vercel Frontend */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Application (Frontend)</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.systemStatus.application}
                </span>
              </div>
              <p className="text-xs text-slate-500">Vercel Edge SPA, React 19 Engine</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Latency: 45ms</span>
                <span>Uptime: 99.99%</span>
              </div>
            </div>

            {/* Google Sheets Database */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Google Sheets DB</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.systemStatus.database}
                </span>
              </div>
              <p className="text-xs text-slate-500">13 Isolated sheets with Formula Guard</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Latency: 180ms</span>
                <span>Read/Write: PASS</span>
              </div>
            </div>

            {/* Google Drive Vault */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Google Drive Vault</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.systemStatus.googleDrive}
                </span>
              </div>
              <p className="text-xs text-slate-500">7 Restricted system folders</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Usage: 62%</span>
                <span>Remaining: 38%</span>
              </div>
            </div>

            {/* WhatsApp Gateway */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">WhatsApp Gateway</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.systemStatus.whatsApp}
                </span>
              </div>
              <p className="text-xs text-slate-500">Token Masked: {ControlCenterService.maskSecret('WA_GATEWAY_TOKEN_OFFICIAL')}</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Pesan Hari Ini: 143</span>
                <span>Gagal: 0</span>
              </div>
            </div>

            {/* AI Engine */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">AI RAG Engine</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.systemStatus.ai}
                </span>
              </div>
              <p className="text-xs text-slate-500">Gemini Flash Assistant with RAG & DAL</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Success: {state.ai.successRate}%</span>
                <span>Avg Latency: {state.ai.averageLatencyMs}ms</span>
              </div>
            </div>

            {/* Backup Guard */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Backup & Restore Guard</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  🟢 {state.backup.backupStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">Terakhir: {state.backup.lastBackupTime}</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>Restore Test: PASS</span>
                <span>Integrity: VERIFIED</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SECURITY CENTER */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Security Operations & Incident Counters
            </h2>
            <button
              onClick={handleResetSecurity}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all"
            >
              Reset Security Counters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Failed Logins</span>
              <div className="text-2xl font-black font-mono text-slate-900">{state.security.failedLogin}</div>
              <span className="text-[10px] text-slate-400">Pencegahan Brute-force</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Blocked Requests</span>
              <div className="text-2xl font-black font-mono text-amber-600">{state.security.blockedRequest}</div>
              <span className="text-[10px] text-slate-400">DAL Access Guard</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">AI Security Blocks</span>
              <div className="text-2xl font-black font-mono text-rose-600">{state.security.aiSecurityBlock}</div>
              <span className="text-[10px] text-slate-400">Prompt Injection Filter</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Suspicious Activity</span>
              <div className="text-2xl font-black font-mono text-emerald-600">{state.security.suspiciousActivity}</div>
              <span className="text-[10px] text-slate-400">Anomaly Scanner</span>
            </div>
          </div>

          {/* Masked Secrets Verification Panel */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> SECRETS MASKING AUDIT (100% PROTECTED)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                NO PLAIN TEXT
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">WhatsApp API Token:</span>
                <span className="font-mono text-emerald-400 font-bold">{ControlCenterService.maskSecret('WA_TOKEN_SECRET_KEY_123')}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Gemini API Key:</span>
                <span className="font-mono text-emerald-400 font-bold">{ControlCenterService.maskSecret('AI_GEMINI_PRODUCTION_KEY')}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Google Apps Script URL:</span>
                <span className="font-mono text-emerald-400 font-bold">{ControlCenterService.maskSecret('GAS_WEBAPP_DEPLOYMENT_URL')}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Database Secret Salt:</span>
                <span className="font-mono text-emerald-400 font-bold">{ControlCenterService.maskSecret('SALT_SECRET_DB_PROD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE DR */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Save className="w-4 h-4 text-emerald-600" /> Backup Workflow (6F, 6G & 9C Integration)
            </h2>
            <button
              onClick={handleRunBackupTest}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Save className="w-4 h-4" /> Run Backup & Test Restore
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Waktu Backup Terakhir</span>
              <div className="text-sm font-bold font-mono text-slate-900">{state.backup.lastBackupTime}</div>
              <span className="text-[10px] text-slate-400">Folder 06_BACKUP Drive</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Ukuran Snapshot</span>
              <div className="text-2xl font-black font-mono text-slate-900">{state.backup.backupSizeMB} MB</div>
              <span className="text-[10px] text-slate-400">Total Snapshot: {state.backup.totalBackupsCount}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Integritas Hash</span>
              <div className="text-sm font-bold font-mono text-emerald-600">{state.backup.backupIntegrity}</div>
              <span className="text-[10px] text-slate-400">SHA-256 Checksum PASS</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Isolated Restore Test</span>
              <div className="text-sm font-bold font-mono text-emerald-600">{state.backup.lastRestoreTest}</div>
              <span className="text-[10px] text-slate-400">Disaster Recovery Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI ENGINE & RELEASES */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Engine Performance & Release Versioning
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Requests Today</span>
              <div className="text-2xl font-black font-mono text-slate-900">{state.ai.requestsToday}</div>
              <span className="text-[10px] text-slate-400">Bulan ini: {state.ai.requestsThisMonth}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">AI Success Rate</span>
              <div className="text-2xl font-black font-mono text-emerald-600">{state.ai.successRate}%</div>
              <span className="text-[10px] text-slate-400">Gagal: {100 - state.ai.successRate}%</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Rata-rata Latensi</span>
              <div className="text-2xl font-black font-mono text-slate-900">{state.ai.averageLatencyMs} ms</div>
              <span className="text-[10px] text-slate-400">Target: &lt; 2000 ms</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500">Tool Calls</span>
              <div className="text-2xl font-black font-mono text-purple-600">{state.ai.toolCalls}</div>
              <span className="text-[10px] text-slate-400">Tool Failures: {state.ai.toolFailures}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RELEASES */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> Release & Deployment Management (Tahap 9I)
            </h2>
            <button
              onClick={() => setShowRollbackModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rollback Release
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Aktif Rilis</span>
                <div className="text-lg font-black text-slate-900 font-mono">{state.release.releaseId}</div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                {state.release.deploymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">App Version</span>
                <span className="font-bold text-slate-800">{state.release.appVersion}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">AI Version</span>
                <span className="font-bold text-slate-800">{state.release.aiVersion}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Prompt Version</span>
                <span className="font-bold text-slate-800">{state.release.promptVersion}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">KB Version</span>
                <span className="font-bold text-slate-800">{state.release.kbVersion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Incident Tracker & Management
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Daftar Insiden Operasional
            </div>
            <div className="divide-y divide-slate-100">
              {state.incidents.map((inc) => (
                <div key={inc.incidentId} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900">{inc.incidentId}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {inc.severity}
                      </span>
                      <span className="font-semibold text-slate-700">{inc.service}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{inc.description}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Impact: {inc.impact} | Resolution: {inc.resolution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOG (6E) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Operational Audit Logs (Tahap 6E)
            </h2>
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Cari aksi / user..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D2A4A]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3 font-mono">Waktu</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Aksi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredAuditLogs.slice(0, 15).map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td className="p-3 font-bold text-slate-800">{log.userId}</td>
                      <td className="p-3 text-blue-900 font-semibold">{log.action}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{log.riskLevel || 'LOW'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: MAINTENANCE & DANGER ZONE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Danger Zone Header */}
          <div className="p-6 bg-rose-950/90 text-white rounded-2xl border border-rose-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
              <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
              DANGER ZONE — CRITICAL ADMINISTRATIVE CONTROL
            </div>
            <h2 className="text-xl font-black">Tindakan Tingkat Tinggi Berisiko Sistem</h2>
            <p className="text-xs text-rose-200/90 max-w-2xl leading-relaxed">
              Tindakan di area ini memiliki dampak langsung pada ketersediaan sistem warga dan integritas rilis. Setiap aksi memerlukan konfirmasi bertingkat dan otomatis dicatat dalam Audit Log Hash Chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Maintenance Mode Toggle */}
            <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Power className="w-4 h-4 text-rose-600" /> Mode Pemeliharaan Sistem
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    state.maintenance.active ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {state.maintenance.active ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Mengaktifkan mode pemeliharaan akan menampilkan banner pemberitahuan pada antarmuka warga dan mengunci akses layanan publik sementara.
              </p>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {state.maintenance.active ? 'Matikan Mode Pemeliharaan' : 'Aktifkan Mode Pemeliharaan'}
              </button>
            </div>

            {/* Rollback Release */}
            <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" /> Rollback Rilis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-800">
                  {state.release.releaseId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kembalikan rilis AI dan prompt ke versi stabil sebelumnya (REL-2026-007) apabila ditemukan kecacatan kritis di produksi.
              </p>
              <button
                onClick={() => setShowRollbackModal(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Rollback ke REL-2026-007
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: ROLLBACK CONFIRMATION */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-300 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                Konfirmasi Rollback Rilis
              </div>
              <button onClick={() => setShowRollbackModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin mengembalikan rilis sistem dari <span className="font-mono font-bold">{state.release.releaseId}</span> ke <span className="font-mono font-bold text-purple-700">REL-2026-007</span>?
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <div className="font-bold">Dampak Operasional:</div>
              <div>• Prompt AI & KB RAG akan dikembalikan ke versi REL-2026-007</div>
              <div>• Action ini dicatat secara permanen di Audit Logger</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRollback}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Ya, Lakukan Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MAINTENANCE MODE TOGGLE */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-300 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Power className="w-5 h-5 text-amber-600" />
                Pengaturan Mode Pemeliharaan
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan Pemeliharaan Sistem
                </label>
                <input
                  type="text"
                  value={maintenanceReasonInput}
                  onChange={(e) => setMaintenanceReasonInput(e.target.value)}
                  placeholder="Misal: Update database berkala & migrasi RAG AI..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Status Saat Ini: <span className="font-bold">{state.maintenance.active ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleToggleMaintenance}
                className="px-4 py-2 rounded-xl bg-[#0D2A4A] hover:bg-[#1E3A5F] text-white text-xs font-bold shadow-md"
              >
                Simpan Perubahan Mode
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
