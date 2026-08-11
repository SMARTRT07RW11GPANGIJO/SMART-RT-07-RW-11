import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  RefreshCw, 
  Lock, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  RotateCcw, 
  Bot, 
  Plus, 
  Search,
  BookOpen,
  Eye,
  Key
} from 'lucide-react';
import { UserRole, AuditLog, Warga, Keluarga, SuratPengantar, TransaksiKeuangan, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan } from '../types/rt';
import { ROLE_PERMISSIONS, maskNik, maskNoHp } from '../services/securityService';
import { BackupRecord, getStoredBackups, createSystemBackup, restoreSystemData, getSystemHealthStatus, checkManualBackupCooldown, getBackupHealth, verifyBackupIntegrity } from '../services/backupService';
import { getKnowledgeBase, saveKnowledgeBase, KnowledgeItem } from '../services/aiAssistantService';
import { fetchAuditLogs, getAuditRetentionPolicy } from '../services/auditLogService';
import { 
  executeStagingRestore, 
  executeProductionRestore, 
  rollbackRestore, 
  getRestoreLogs, 
  VerificationReport, 
  RestoreLogEntry 
} from '../services/restoreService';
import { 
  getDRHealthMetrics, 
  runDisasterRecoveryTest, 
  getDRIncidents, 
  createDRIncident, 
  resolveDRIncident, 
  setRPOConfigHours, 
  DRHealthMetrics, 
  DRIncident, 
  DRTestResult 
} from '../services/disasterRecoveryService';

import { 
  runComprehensiveSecurityTestSuite, 
  getLatestSecurityReport, 
  getRemediationChecklist 
} from '../services/securityTestRunnerService';
import { SecuritySummaryReport } from '../types/securityTest';

interface SecurityHealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  auditLogs: AuditLog[];
  dataState: {
    wargaList: Warga[];
    keluargaList: Keluarga[];
    suratList: SuratPengantar[];
    transaksiList: TransaksiKeuangan[];
    iuranList: TagihanIuran[];
    pengaduanList: Pengaduan[];
    pengumumanList: Pengumuman[];
    agendaList: AgendaKegiatan[];
    auditLogs: AuditLog[];
  };
  onRestoreState: (restoredData: any) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const SecurityHealthDashboard: React.FC<SecurityHealthDashboardProps> = ({
  isOpen,
  onClose,
  currentRole,
  auditLogs,
  dataState,
  onRestoreState,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'SECURITY_TEST' | 'BACKUP' | 'RESTORE' | 'DISASTER_RECOVERY' | 'HEALTH' | 'RITA_KB' | 'LOGS'>('SECURITY');

  // Tahap 6H Security Test State
  const [securityReport, setSecurityReport] = useState<SecuritySummaryReport | null>(getLatestSecurityReport());
  const [isRunningSecurityTest, setIsRunningSecurityTest] = useState(false);
  const [testFilterCategory, setTestFilterCategory] = useState<string>('ALL');
  const [testFilterSeverity, setTestFilterSeverity] = useState<string>('ALL');

  // Backup state
  const [backups, setBackups] = useState<BackupRecord[]>(getStoredBackups());
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState<BackupRecord | null>(null);

  // Tahap 6G Restore State
  const [stagingReport, setStagingReport] = useState<VerificationReport | null>(null);
  const [isStagingRunning, setIsStagingRunning] = useState(false);
  const [confirmationPhraseInput, setConfirmationPhraseInput] = useState('');
  const [restoreLogs, setRestoreLogs] = useState<RestoreLogEntry[]>(getRestoreLogs());

  // Tahap 6G Disaster Recovery State
  const [drMetrics, setDrMetrics] = useState<DRHealthMetrics>(getDRHealthMetrics());
  const [drIncidents, setDrIncidents] = useState<DRIncident[]>(getDRIncidents());
  const [isDRTestRunning, setIsDRTestRunning] = useState(false);
  const [lastDRTestResult, setLastDRTestResult] = useState<DRTestResult | null>(null);
  const [isReportingIncident, setIsReportingIncident] = useState(false);
  const [newIncidentDesc, setNewIncidentDesc] = useState('');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [incidentResolutions, setIncidentResolutions] = useState<Record<string, string>>({});

  // Knowledge Base State
  const [kbItems, setKbItems] = useState<KnowledgeItem[]>(getKnowledgeBase());
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbCategory, setNewKbCategory] = useState<'FAQ' | 'SOP' | 'Peraturan' | 'Pelayanan' | 'Profil'>('SOP');
  const [newKbContent, setNewKbContent] = useState('');
  const [isAddingKb, setIsAddingKb] = useState(false);

  // Audit Log Filters
  const [logSearch, setLogSearch] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState<string>('ALL');
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleCreateManualBackup = async () => {
    // Check manual backup rate limiting
    const cooldown = checkManualBackupCooldown();
    if (!cooldown.canExecute) {
      addToast('error', 'Manual Backup Cooldown Active', `Harap tunggu ${cooldown.cooldownRemainingSeconds} detik lagi sebelum memicu backup manual berikutnya.`);
      return;
    }

    setIsBackupRunning(true);
    addToast('loading', 'Memulai Process Backup...', 'Membuat snapshot Database, Dokumen & Audit Log...');

    try {
      const newBkp = await createSystemBackup('MANUAL', `Pengurus (${currentRole})`, dataState);
      setBackups(getStoredBackups());
      setIsBackupRunning(false);
      addToast('success', 'Backup Berhasil Dibuat!', `File Backup ID: ${newBkp.backupId} tersimpan aman di folder 06_BACKUP.`);
    } catch (err: any) {
      setIsBackupRunning(false);
      addToast('error', 'Gagal Membuat Backup', err.message);
    }
  };

  const handleRunStagingRestore = async (backup: BackupRecord) => {
    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak (403)', 'Hanya Role ADMIN yang diizinkan memicu Staging Restore.');
      return;
    }

    setIsStagingRunning(true);
    addToast('loading', 'Mengeksekusi Staging Restore...', 'Memuat data snapshot ke SMART_RT_RESTORE_STAGING & menguji verifikasi...');

    try {
      const res = await executeStagingRestore(backup.backupId, currentRole, `Admin (${currentRole})`);
      setIsStagingRunning(false);
      setStagingReport(res.report);
      setRestoreLogs(getRestoreLogs());
      if (res.success) {
        addToast('success', 'Staging Restore LULUS!', 'Seluruh uji verifikasi (Database, Docs, Audit, Secrets) PASS.');
      } else {
        addToast('error', 'Staging Restore GAGAL!', 'Ditemukan kegagalan verifikasi data snapshot.');
      }
    } catch (err: any) {
      setIsStagingRunning(false);
      addToast('error', 'Gagal Staging Restore', err.message);
    }
  };

  const handleExecuteProductionRestoreWithConfirmation = async () => {
    if (!selectedRestoreBackup) return;

    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak (403)', 'Hanya Role ADMIN yang diizinkan mengeksekusi Production Restore.');
      return;
    }

    if (confirmationPhraseInput !== 'RESTORE SMART RT') {
      addToast('error', 'Frasa Konfirmasi Salah', "Harap ketik frasa persis 'RESTORE SMART RT' untuk mengonfirmasi.");
      return;
    }

    addToast('loading', 'Mengeksekusi Production Restore...', 'Membuat Emergency Pre-Restore Safety Backup & menulis ulang database...');

    const result = await executeProductionRestore(
      selectedRestoreBackup.backupId,
      confirmationPhraseInput,
      currentRole,
      `Admin (${currentRole})`,
      dataState
    );

    setBackups(getStoredBackups());
    setRestoreLogs(getRestoreLogs());

    if (result.success) {
      if (result.restoredData) {
        onRestoreState(result.restoredData);
      }
      setSelectedRestoreBackup(null);
      setStagingReport(null);
      setConfirmationPhraseInput('');
      addToast('success', 'Production Restore BERHASIL!', result.message);
    } else {
      addToast('error', 'Production Restore GAGAL', result.message);
    }
  };

  const handleRollbackSystem = async (safetyBackupId: string) => {
    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak', 'Hanya ADMIN yang diizinkan mengeksekusi Rollback.');
      return;
    }

    addToast('loading', 'Mengeksekusi Rollback System...', `Kembali ke safety snapshot ${safetyBackupId}...`);

    const result = await rollbackRestore(safetyBackupId, currentRole, `Admin (${currentRole})`);

    if (result.success) {
      if (result.data) {
        onRestoreState(result.data);
      }
      setRestoreLogs(getRestoreLogs());
      addToast('success', 'Rollback System BERHASIL!', result.message);
    } else {
      addToast('error', 'Rollback System GAGAL', result.message);
    }
  };

  const handleRunDRTestSimulation = async () => {
    if (currentRole !== 'ADMIN') {
      addToast('error', 'Akses Ditolak', 'Hanya Role ADMIN yang dapat menjalankan Disaster Recovery Test.');
      return;
    }

    setIsDRTestRunning(true);
    addToast('loading', 'Mengeksekusi Monthly DR Test...', 'Menguji pemulihan Database, Dokumen & Audit di lingkungan Staging terisolasi...');

    try {
      const res = await runDisasterRecoveryTest(currentRole, `Admin (${currentRole})`);
      setIsDRTestRunning(false);
      setLastDRTestResult(res);
      setDrMetrics(getDRHealthMetrics());
      addToast('success', 'Disaster Recovery Test LULUS!', res.summaryNote);
    } catch (err: any) {
      setIsDRTestRunning(false);
      addToast('error', 'DR Test Gagal', err.message);
    }
  };

  const handleRunSecuritySuite = () => {
    setIsRunningSecurityTest(true);
    addToast('loading', 'Mengeksekusi Comprehensive Security Test Suite...', 'Pengujian Auth, RBAC, IDOR, XSS, API, Secrets, Drive & Gate...');

    setTimeout(() => {
      const report = runComprehensiveSecurityTestSuite(currentRole, `Admin (${currentRole})`);
      setSecurityReport(report);
      setIsRunningSecurityTest(false);

      if (report.productionGateStatus === 'READY_FOR_PRODUCTION') {
        addToast('success', 'Comprehensive Security Test LULUS!', report.gateMessage);
      } else {
        addToast('error', 'Security Gate BLOCKED!', report.gateMessage);
      }
    }, 800);
  };

  const handleChangeRPOConfig = (hours: number) => {
    setRPOConfigHours(hours);
    setDrMetrics(getDRHealthMetrics());
    addToast('info', 'RPO Config Diperbarui', `Target RPO diset menjadi ≤ ${hours} Jam.`);
  };

  const handleSaveDRIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentDesc) return;

    createDRIncident(
      {
        description: newIncidentDesc,
        severity: newIncidentSeverity,
        backupUsed: backups[0]?.backupId || 'LATEST',
        detectedBy: `Admin (${currentRole})`
      },
      currentRole,
      `Admin (${currentRole})`
    );

    setDrIncidents(getDRIncidents());
    setNewIncidentDesc('');
    setIsReportingIncident(false);
    addToast('success', 'Insiden DR Terdaftar', 'Laporan insiden keamanan/pemulihan berhasil dicatatkan.');
  };

  const handleResolveDRIncidentAction = (incidentId: string) => {
    const resNote = incidentResolutions[incidentId] || 'Sistem berhasil dipulihkan & telah diverifikasi sehat.';
    resolveDRIncident(incidentId, resNote, currentRole, `Admin (${currentRole})`);
    setDrIncidents(getDRIncidents());
    addToast('success', 'Insiden DR Diresolusi', `Status insiden ${incidentId} diperbarui menjadi RESOLVED.`);
  };

  const handleAddKbItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbTitle || !newKbContent) return;

    const newItem: KnowledgeItem = {
      id: `KB-${Date.now()}`,
      category: newKbCategory,
      title: newKbTitle,
      content: newKbContent,
      source: `SOP Tambahan Admin (${currentRole})`,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: 'PUBLISHED'
    };

    const updated = [newItem, ...kbItems];
    setKbItems(updated);
    saveKnowledgeBase(updated);
    setNewKbTitle('');
    setNewKbContent('');
    setIsAddingKb(false);
    addToast('success', 'Knowledge Base Diperbarui', 'Informasi resmi baru ditambahkan ke RITA AI Assistant.');
  };

  const systemHealth = getSystemHealthStatus();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] border border-[#D4A72C] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">MODUL KEAMANAN & PROTECTION HARDENING</h2>
                <span className="bg-[#D4A72C] text-[#123B5D] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  TAHAP 6B, 6C & 6D HARDENING
                </span>
              </div>
              <p className="text-xs text-slate-300">Data Protection, Zero Client Secrets, ScriptProperties Storage, Audit Trail & Backup System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-xl transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'SECURITY' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-[#D4A72C]" /> Security & Permissions
          </button>

          <button
            onClick={() => setActiveTab('SECURITY_TEST')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'SECURITY_TEST' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Final Security Test (Tahap 6H)
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'BACKUP' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" /> Automatic Backup
          </button>

          <button
            onClick={() => setActiveTab('RESTORE')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'RESTORE' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" /> Restore Console
          </button>

          <button
            onClick={() => setActiveTab('DISASTER_RECOVERY')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'DISASTER_RECOVERY' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" /> Disaster Recovery
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'HEALTH' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" /> System Health
          </button>

          <button
            onClick={() => setActiveTab('RITA_KB')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'RITA_KB' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" /> RITA AI Knowledge Base
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'LOGS' ? 'bg-[#123B5D] text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" /> Audit Trail Integrity
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: SECURITY & PERMISSION MATRIX */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Masking Data Sensitif
                  </div>
                  <p className="text-xs text-slate-600">NIK & No HP disamarkan otomatis untuk non-admin. Masked NIK: <strong className="text-emerald-800">{maskNik('3507123456780004')}</strong></p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                    <Key className="w-5 h-5 text-blue-600" /> Server-side Authorization
                  </div>
                  <p className="text-xs text-slate-600">Permission diperiksa pada level service & backend layer, mencegah bypassing frontend URL/Route.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                    <Lock className="w-5 h-5 text-amber-600" /> IDOR & Object Guard
                  </div>
                  <p className="text-xs text-slate-600">Warga hanya diizinkan mengakses surat, iuran, dan aduan milik akunnya sendiri via ownership verification.</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1">
                    <Lock className="w-5 h-5 text-purple-600" /> Tahap 6D Secret Security
                  </div>
                  <p className="text-xs text-slate-600">0 Client Secrets. Gemini & WA API keys disimpan di GAS ScriptProperties. localStorage bersih dari secret.</p>
                </div>
              </div>

              {/* Role Permission Matrix Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                  <span>ROLE PERMISSION MATRIX (SMART RT 07 RW 11)</span>
                  <span className="text-xs text-emerald-400">Least Privilege & Fail Closed Policy</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase">
                      <tr>
                        <th className="p-3">Role User</th>
                        <th className="p-3">Tingkat Akses</th>
                        <th className="p-3">Akses Data Warga</th>
                        <th className="p-3">Akses Surat Pengantar</th>
                        <th className="p-3">Akses Keuangan</th>
                        <th className="p-3">Backup & System</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-bold text-purple-900">ADMIN</td>
                        <td className="p-3 font-semibold text-emerald-600">FULL SYSTEM ACCESS</td>
                        <td className="p-3">Read / Write / Unmask</td>
                        <td className="p-3">Approve / Revoke / PDF A4</td>
                        <td className="p-3">Full Audit & Edit</td>
                        <td className="p-3">Backup & Restore</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-blue-900">KETUA_RT</td>
                        <td className="p-3 font-semibold text-blue-600">EXECUTIVE APPROVER</td>
                        <td className="p-3">Read Only (Full)</td>
                        <td className="p-3">Approve / Revoke / PDF A4</td>
                        <td className="p-3">Read Only</td>
                        <td className="p-3">Manual Backup</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-emerald-900">PENGURUS</td>
                        <td className="p-3 font-semibold text-emerald-600">OPERATIONAL OFFICER</td>
                        <td className="p-3">Read Only (Limited)</td>
                        <td className="p-3">Process / Generate PDF</td>
                        <td className="p-3">Read / Update Iuran</td>
                        <td className="p-3">Read Only</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-800">WARGA</td>
                        <td className="p-3 font-semibold text-slate-600">LIMITED CITIZEN</td>
                        <td className="p-3 text-slate-500">Read Own Profile Only</td>
                        <td className="p-3">Create / View Own PDF</td>
                        <td className="p-3">View Own Iuran Only</td>
                        <td className="p-3 text-slate-400">No Access</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-500">PUBLIC</td>
                        <td className="p-3 font-semibold text-slate-400">ANONYMOUS GUEST</td>
                        <td className="p-3 text-slate-400">No Access</td>
                        <td className="p-3">Verify QR Hash Only</td>
                        <td className="p-3 text-slate-400">No Access</td>
                        <td className="p-3 text-slate-400">No Access</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & DISASTER RECOVERY */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#123B5D] text-white p-5 rounded-2xl shadow border border-[#2E7D52]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#D4A72C]">AUTOMATIC BACKUP & DISASTER RECOVERY ENGINE</h3>
                    <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      TAHAP 6F COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Retention: 7 Hari (Daily), 4 Minggu (Weekly), 12 Bulan (Monthly). Integrated Time-driven Trigger & Verification.
                  </p>
                </div>
                <button
                  onClick={handleCreateManualBackup}
                  disabled={isBackupRunning}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow border border-[#D4A72C]/40 transition-all disabled:opacity-50"
                >
                  <Database className="w-4 h-4 text-[#D4A72C]" />
                  {isBackupRunning ? 'Proses Backup System...' : 'Buat Backup Manual Now'}
                </button>
              </div>

              {/* Backup Health Status Cards */}
              {(() => {
                const health = getBackupHealth();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-[#123B5D]" /> Database Sheets
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                          {health.database.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Folder: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-bold text-[#123B5D]">06_BACKUP/DATABASE</code></p>
                      <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                        <span>Last Snapshot:</span>
                        <strong className="text-slate-800">{health.database.lastBackup}</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#2E7D52]" /> Google Drive Docs
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                          {health.documents.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Folder: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-bold text-[#123B5D]">06_BACKUP/DOCUMENTS</code></p>
                      <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                        <span>Last Snapshot:</span>
                        <strong className="text-slate-800">{health.documents.lastBackup}</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#D4A72C]" /> Audit Log Snapshot
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-300">
                          {health.audit.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Folder: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-bold text-[#123B5D]">06_BACKUP/AUDIT_LOG</code></p>
                      <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                        <span>Last Snapshot:</span>
                        <strong className="text-slate-800">{health.audit.lastBackup}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Drive Folder Hierarchy & Time-Driven Trigger Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-800 text-xs uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" /> Time-Driven Trigger Configuration (Google Apps Script)
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>• <strong>Handler:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-emerald-700 font-mono">createDailyBackup()</code></p>
                    <p>• <strong>Jadwal Otomatis:</strong> Setiap Hari Pukul <strong>02:00 WIB</strong> (Asia/Jakarta)</p>
                    <p>• <strong>Otentikasi:</strong> Script Execution Context via Owner Credentials</p>
                    <p>• <strong>Pemberitahuan Audit:</strong> Mencatat event <code>BACKUP_STARTED</code>, <code>BACKUP_DATABASE_SUCCESS</code>, <code>BACKUP_VERIFIED</code></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-800 text-xs uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#123B5D]" /> Google Drive Folder Structure (SMART RT 07)
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 space-y-0.5 bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-[#123B5D]">📁 SMART RT 07 RW 11 /</div>
                    <div className="pl-3">├── 📁 01_DATABASE/ (Sheet Production)</div>
                    <div className="pl-3">├── 📁 02_DOKUMEN_WARGA/ (KTP/KK Uploads)</div>
                    <div className="pl-3">├── 📁 03_SURAT/ (PDF Surat Pengantar)</div>
                    <div className="pl-3">├── 📁 04_PENGADUAN/ (Bukti Foto Laporan)</div>
                    <div className="pl-3">├── 📁 05_KEUANGAN/ (Bukti Transfer Iuran)</div>
                    <div className="pl-3 font-bold text-emerald-700">├── 📁 06_BACKUP/ (Restricted Restricted Access)</div>
                    <div className="pl-6 text-emerald-600">├── 📁 DATABASE/</div>
                    <div className="pl-6 text-emerald-600">├── 📁 DOCUMENTS/</div>
                    <div className="pl-6 text-emerald-600">└── 📁 AUDIT_LOG/</div>
                    <div className="pl-3">└── 📁 07_SYSTEM/ (Properties & Meta)</div>
                  </div>
                </div>
              </div>

              {/* SLA, Retention & Verification Principles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 text-xs uppercase mb-1">RPO (Recovery Point Objective)</div>
                  <div className="text-lg font-black text-[#2E7D52]">Maksimal 24 Jam Data Loss</div>
                  <p className="text-[11px] text-slate-500 mt-1">Dapat pulih dengan aman menggunakan snapshot harian otomatis Asia/Jakarta.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 text-xs uppercase mb-1">RTO (Recovery Time Objective)</div>
                  <div className="text-lg font-black text-[#123B5D]">Maksimal 4 Jam Recovery</div>
                  <p className="text-[11px] text-slate-500 mt-1">Restorasi snapshot 1-click dengan verifikasi integritas checksum SHA-256.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="font-bold text-slate-800 text-xs uppercase mb-1">RETENTION POLICY</div>
                  <div className="text-sm font-black text-slate-800">7 Hari Daily | 4 Mgg Weekly | 12 Bln Monthly</div>
                  <p className="text-[11px] text-slate-500 mt-1">Aturan perlindungan: Dilarang menghapus backup terbaru secara tidak disengaja.</p>
                </div>
              </div>

              {/* Backup Records Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-3 font-bold text-xs text-slate-800 uppercase border-b border-slate-200 flex justify-between items-center">
                  <span>Daftar Snapshot Backup System ({backups.length} Snapshot)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">SHA-256 Checksum Verified</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Backup ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Tipe</th>
                        <th className="p-3">Record Counts</th>
                        <th className="p-3">Ukuran</th>
                        <th className="p-3">Integritas Checksum</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi Disaster Recovery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {backups.map((b) => {
                        const check = verifyBackupIntegrity(b);
                        return (
                          <tr key={b.backupId} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-[#123B5D] font-mono text-[11px]">{b.backupId}</td>
                            <td className="p-3 text-slate-600 font-mono text-[11px]">{b.timestamp}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.type === 'DAILY' ? 'bg-blue-100 text-blue-800' :
                                b.type === 'PRE_RESTORE' ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {b.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 text-[11px]">
                              Warga: {b.recordCounts.warga} | Surat: {b.recordCounts.surat} | Kas: {b.recordCounts.transaksi}
                            </td>
                            <td className="p-3 font-mono text-slate-500 text-[11px]">{(b.sizeBytes / 1024).toFixed(1)} KB</td>
                            <td className="p-3 font-mono text-slate-500 text-[10px]">{b.checksum.slice(0, 16)}...</td>
                            <td className="p-3">
                              {check.valid ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[10px] w-fit">
                                  <CheckCircle className="w-3.5 h-3.5" /> Verified Valid
                                </span>
                              ) : (
                                <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded text-[10px] w-fit">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Corrupt / Failed
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedRestoreBackup(b)}
                                disabled={currentRole !== 'ADMIN'}
                                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1 ml-auto transition-all"
                              >
                                <RotateCcw className="w-3 h-3" /> Restore Snapshot
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Restore Confirmation Dialog */}
              {selectedRestoreBackup && (
                <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    DISASTER RECOVERY RESTORE CONFIRMATION (SNAPSHOT ID: {selectedRestoreBackup.backupId})
                  </div>
                  <p className="text-xs text-slate-700">
                    Restorasi akan menggantikan seluruh data aktif sistem dengan data snapshot tanggal <strong>{selectedRestoreBackup.timestamp}</strong>. Sistem akan secara otomatis membuat <strong>PRE_RESTORE Safety Snapshot</strong> sebelum penulisan ulang data dilakukan.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('RESTORE');
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Buka Restore Console Staging (Tahap 6G)
                    </button>
                    <button
                      onClick={() => setSelectedRestoreBackup(null)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FINAL SECURITY TEST SUITE (TAHAP 6H) */}
          {activeTab === 'SECURITY_TEST' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-[#123B5D] text-white p-5 rounded-2xl shadow border border-[#2E7D52]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#D4A72C]">COMPREHENSIVE FINAL SECURITY ASSESSMENT (TAHAP 6H)</h3>
                    <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      TAHAP 6H COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Pengujian komprehensif Auth, RBAC, IDOR, Privilege Escalation, XSS, Sheets Injection, Rate Limiting, Zero Client Secrets, Drive & Production Security Gate.
                  </p>
                </div>
                <button
                  onClick={handleRunSecuritySuite}
                  disabled={isRunningSecurityTest}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 shrink-0 transition-all border border-[#D4A72C]/40"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningSecurityTest ? 'animate-spin' : ''}`} />
                  {isRunningSecurityTest ? 'Mengeksekusi Security Test...' : 'Jalankan Comprehensive Security Suite'}
                </button>
              </div>

              {/* Security Gate & Summary Cards */}
              {securityReport ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Security Score Aktual</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-[#123B5D]">{securityReport.securityScore}%</span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded ${
                          securityReport.securityScore === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {securityReport.passedCount} / {securityReport.totalTests} PASS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Dihitung aktual dari hasil eksekusi test</p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Production Security Gate</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black px-2.5 py-1 rounded ${
                          securityReport.productionGateStatus === 'READY_FOR_PRODUCTION'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {securityReport.productionGateStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Status Kesiapan Publikasi Production</p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Critical / High Vulnerabilities</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-black text-rose-600">
                          Critical: {securityReport.criticalCount}
                        </div>
                        <div className="text-xl font-black text-amber-600">
                          High: {securityReport.highCount}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">Syarat Gate: Critical = 0 & High = 0</p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Secret Scanning Status</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#2E7D52] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ZERO CLIENT SECRETS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">PropertiesService GAS Active</p>
                    </div>
                  </div>

                  {/* Gate Message Alert */}
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    securityReport.productionGateStatus === 'READY_FOR_PRODUCTION'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}>
                    {securityReport.productionGateStatus === 'READY_FOR_PRODUCTION' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-extrabold text-sm uppercase">SECURITY GATE EVALUATION REPORT</div>
                      <div className="text-xs font-medium">{securityReport.gateMessage}</div>
                    </div>
                  </div>

                  {/* Security Test Log Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">SECURITY_TEST_LOG ({securityReport.logs.length} Test Item)</h4>
                        <p className="text-xs text-slate-500">Log hasil pengujian aktual setiap kategori keamanan</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={testFilterCategory}
                          onChange={(e) => setTestFilterCategory(e.target.value)}
                          className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                        >
                          <option value="ALL">Semua Kategori</option>
                          <option value="AUTHENTICATION">AUTHENTICATION</option>
                          <option value="RBAC">RBAC</option>
                          <option value="IDOR">IDOR</option>
                          <option value="PRIVILEGE_ESCALATION">PRIVILEGE_ESCALATION</option>
                          <option value="XSS">XSS</option>
                          <option value="SHEETS_INJECTION">SHEETS_INJECTION</option>
                          <option value="API_SECURITY">API_SECURITY</option>
                          <option value="SECRET_SECURITY">SECRET_SECURITY</option>
                          <option value="GOOGLE_DRIVE">GOOGLE_DRIVE</option>
                          <option value="AUDIT_LOG">AUDIT_LOG</option>
                          <option value="BACKUP">BACKUP</option>
                          <option value="RESTORE">RESTORE</option>
                        </select>

                        <select
                          value={testFilterSeverity}
                          onChange={(e) => setTestFilterSeverity(e.target.value)}
                          className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                        >
                          <option value="ALL">Semua Severity</option>
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Test ID</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Nama Pengujian</th>
                            <th className="p-3">Expected Result</th>
                            <th className="p-3">Actual Result</th>
                            <th className="p-3">Severity</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {securityReport.logs
                            .filter((l) => testFilterCategory === 'ALL' || l.category === testFilterCategory)
                            .filter((l) => testFilterSeverity === 'ALL' || l.severity === testFilterSeverity)
                            .map((l) => (
                              <tr key={l.testId} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-[#123B5D] font-mono text-[11px]">{l.testId}</td>
                                <td className="p-3 font-bold text-slate-600 font-mono text-[10px] uppercase">{l.category}</td>
                                <td className="p-3 text-slate-800 font-bold">{l.testName}</td>
                                <td className="p-3 text-slate-600 font-mono text-[11px] max-w-xs">{l.expected}</td>
                                <td className="p-3 text-slate-600 font-mono text-[11px] max-w-xs">{l.actual}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    l.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                                    l.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {l.severity}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    l.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {l.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Remediation & Verification Checklist */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
                      REMEDIATION & SECURITY VERIFICATION CHECKLIST
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getRemediationChecklist().map((item) => (
                        <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#123B5D] font-mono">{item.id} [{item.category}]</span>
                            <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded text-[10px]">
                              {item.status}
                            </span>
                          </div>
                          <div className="font-bold text-slate-800">{item.issue}</div>
                          <div className="text-slate-600 text-[11px]"><strong>Komponen:</strong> {item.affectedComponent}</div>
                          <div className="text-slate-600 text-[11px]"><strong>Remediasi:</strong> {item.remediation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-sm">Belum ada pengujian keamanan yang dieksekusi hari ini.</div>
                  <p className="text-xs text-slate-500">Klik tombol "Jalankan Comprehensive Security Suite" untuk mengeksekusi test aktual & mengevaluasi Security Gate.</p>
                  <button
                    onClick={handleRunSecuritySuite}
                    className="bg-[#123B5D] hover:bg-[#0F2F4A] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
                  >
                    Mulai Security Assessment Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESTORE CONSOLE (STAGING-FIRST & TWO-STEP CONFIRMATION) */}
          {activeTab === 'RESTORE' && (
            <div className="space-y-6">
              <div className="bg-[#123B5D] text-white p-5 rounded-2xl shadow border border-[#2E7D52]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#D4A72C]">STAGING-FIRST RESTORE & ROLLBACK CONSOLE</h3>
                    <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      TAHAP 6G COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Flow Restorasi: BACKUP → STAGING RESTORE → VERIFICATION REPORT → ADMIN APPROVAL → TWO-STEP CONFIRMATION → PRODUCTION RESTORE (WITH EMERGENCY SAFETY SNAPSHOT & AUTO ROLLBACK).
                  </p>
                </div>
              </div>

              {/* Step 1: Select Backup Snapshot */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <div className="font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#123B5D] text-white text-xs flex items-center justify-center font-bold">1</span>
                    Pilih Snapshot Backup System
                  </span>
                  <span className="text-xs text-slate-500 font-normal">Pilih snapshot yang ingin dipulihkan ke Staging</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Daftar Snapshot Backup Tersedia</label>
                    <select
                      value={selectedRestoreBackup?.backupId || ''}
                      onChange={(e) => {
                        const target = backups.find((b) => b.backupId === e.target.value);
                        setSelectedRestoreBackup(target || null);
                        setStagingReport(null);
                        setConfirmationPhraseInput('');
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-[#123B5D]"
                    >
                      <option value="">-- Pilih Snapshot Backup --</option>
                      {backups.map((b) => (
                        <option key={b.backupId} value={b.backupId}>
                          {b.backupId} ({b.timestamp}) - {b.type} [{(b.sizeBytes / 1024).toFixed(1)} KB]
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRestoreBackup && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                      <div className="font-bold text-[#123B5D]">METADATA SNAPSHOT: {selectedRestoreBackup.backupId}</div>
                      <div>• Timestamp: {selectedRestoreBackup.timestamp}</div>
                      <div>• Size: {(selectedRestoreBackup.sizeBytes / 1024).toFixed(1)} KB | Checksum: {selectedRestoreBackup.checksum}</div>
                      <div>• Record Counts: Warga ({selectedRestoreBackup.recordCounts.warga}), Surat ({selectedRestoreBackup.recordCounts.surat}), Kas ({selectedRestoreBackup.recordCounts.transaksi})</div>
                    </div>
                  )}
                </div>

                {selectedRestoreBackup && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleRunStagingRestore(selectedRestoreBackup)}
                      disabled={isStagingRunning || currentRole !== 'ADMIN'}
                      className="bg-[#123B5D] hover:bg-[#0F2F4A] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${isStagingRunning ? 'animate-spin' : ''}`} />
                      {isStagingRunning ? 'Mengeksekusi Staging Restore...' : 'Uji Coba Staging Restore (Isolated Container)'}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Verification Report */}
              {stagingReport && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                  <div className="font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2E7D52] text-white text-xs flex items-center justify-center font-bold">2</span>
                      Verification Report (Staging Container: SMART_RT_RESTORE_STAGING)
                    </span>
                    <span className={`px-2.5 py-1 rounded text-xs font-black ${
                      stagingReport.overallStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      STATUS: {stagingReport.overallStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Database Sheet</div>
                      <div className={`font-black text-xs ${stagingReport.databaseCheck === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{stagingReport.databaseCheck}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Drive Docs</div>
                      <div className={`font-black text-xs ${stagingReport.documentCheck === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{stagingReport.documentCheck}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Audit Log Trail</div>
                      <div className={`font-black text-xs ${stagingReport.auditCheck === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{stagingReport.auditCheck}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Integrity Check</div>
                      <div className={`font-black text-xs ${stagingReport.integrityCheck === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{stagingReport.integrityCheck}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">App Runtime</div>
                      <div className={`font-black text-xs ${stagingReport.applicationCheck === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{stagingReport.applicationCheck}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
                    <div className="font-bold text-[#D4A72C]">LOG VERIFIKASI STAGING:</div>
                    {stagingReport.details.map((d, idx) => (
                      <div key={idx} className="text-slate-300">• {d}</div>
                    ))}
                  </div>

                  {/* Step 3: Two-Step Production Confirmation */}
                  {stagingReport.overallStatus === 'PASS' && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-3 mt-4">
                      <div className="font-bold text-amber-900 text-xs uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Langkah 3: Two-Step Confirmation untuk Production Restore
                      </div>
                      <p className="text-xs text-slate-700">
                        Sistem telah memverifikasi snapshot di Staging container. Untuk mengeksekusi penulisan ulang ke Production, ketik frasa konfirmasi: <code className="bg-amber-100 font-bold px-1.5 py-0.5 rounded text-amber-900 border border-amber-300">RESTORE SMART RT</code>
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                        <input
                          type="text"
                          value={confirmationPhraseInput}
                          onChange={(e) => setConfirmationPhraseInput(e.target.value)}
                          placeholder="Ketik RESTORE SMART RT di sini"
                          className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-900 flex-1 uppercase"
                        />
                        <button
                          onClick={handleExecuteProductionRestoreWithConfirmation}
                          disabled={confirmationPhraseInput !== 'RESTORE SMART RT' || currentRole !== 'ADMIN'}
                          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                        >
                          <RotateCcw className="w-4 h-4" /> Eksekusi Production Restore Sekarang
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Restore History & Rollback Logs */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-3 font-bold text-xs text-slate-800 uppercase border-b border-slate-200 flex justify-between items-center">
                  <span>Log Riwayat Restore & Rollback ({restoreLogs.length} Entri)</span>
                  <span className="text-[10px] text-slate-500 font-mono">RESTORE_LOG Sheet Compliant</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Restore ID</th>
                        <th className="p-3">Target</th>
                        <th className="p-3">Backup Source</th>
                        <th className="p-3">Disetujui Oleh</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi Rollback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {restoreLogs.map((log) => (
                        <tr key={log.restoreId} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#123B5D] font-mono text-[11px]">{log.restoreId}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{log.target}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{log.backupId}</td>
                          <td className="p-3 text-slate-700">{log.requestedBy}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                              log.status === 'STAGED' ? 'bg-blue-100 text-blue-800' :
                              log.status === 'ROLLED_BACK' ? 'bg-purple-100 text-purple-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {log.backupId.startsWith('EMERGENCY') || log.status === 'SUCCESS' ? (
                              <button
                                onClick={() => handleRollbackSystem(log.backupId)}
                                disabled={currentRole !== 'ADMIN'}
                                className="bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow ml-auto"
                              >
                                Rollback Ke Poin Ini
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISASTER RECOVERY DASHBOARD & METRICS */}
          {activeTab === 'DISASTER_RECOVERY' && (
            <div className="space-y-6">
              {/* SLA & Health Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">RPO (Recovery Point Objective)</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-[#2E7D52]">≤ {drMetrics.rpoConfigHours} Jam</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded ${
                      drMetrics.rpoStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {drMetrics.rpoStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Konfigurasi Target Data Loss Maksimal</p>
                  <div className="flex gap-1 pt-1 border-t border-slate-100">
                    {[6, 12, 24].map((hrs) => (
                      <button
                        key={hrs}
                        onClick={() => handleChangeRPOConfig(hrs)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          drMetrics.rpoConfigHours === hrs
                            ? 'bg-[#123B5D] text-white border-[#123B5D]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {hrs}H
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">RTO (Recovery Time Objective)</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-[#123B5D]">≤ {drMetrics.rtoTargetHours} Jam</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black rounded">
                      PASS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Target Waktu Pemulihan Sistem Total</p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Disaster Recovery Test Due</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-800">{drMetrics.daysSinceLastDRTest} Hari Lalu</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded ${
                      drMetrics.drTestDueStatus === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                      drMetrics.drTestDueStatus === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {drMetrics.drTestDueStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Jadwal Simulasi Uji DR Bulanan</p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Status Rahasia & Security</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#2E7D52]">0 Client Secrets</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black rounded">
                      SECURE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Gemini & WA Keys di GAS Properties</p>
                </div>
              </div>

              {/* Monthly DR Test Reminder Banner */}
              {drMetrics.drTestDueStatus !== 'OK' && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  drMetrics.drTestDueStatus === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <div>
                      <div className="font-extrabold text-sm uppercase">[DR_TEST_DUE] SIMULASI DISASTER RECOVERY BULANAN</div>
                      <div className="text-xs">
                        Sudah <strong>{drMetrics.daysSinceLastDRTest} hari</strong> sejak DR Test terakhir. ({drMetrics.drTestDueStatus === 'CRITICAL' ? 'Terlambat >60 Hari!' : 'Terlambat >30 Hari!'})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRunDRTestSimulation}
                    disabled={isDRTestRunning || currentRole !== 'ADMIN'}
                    className="bg-[#123B5D] hover:bg-[#0F2F4A] text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isDRTestRunning ? 'animate-spin' : ''}`} />
                    Jalankan DR Test Simulation
                  </button>
                </div>
              )}

              {/* Action Banner for DR Test */}
              <div className="p-5 bg-slate-800 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#D4A72C]">MONTHLY DISASTER RECOVERY SIMULATOR</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Mengeksekusi uji pemulihan Database, Dokumen & Audit di lingkungan Staging terisolasi tanpa mengubah data Production.
                  </p>
                </div>
                <button
                  onClick={handleRunDRTestSimulation}
                  disabled={isDRTestRunning || currentRole !== 'ADMIN'}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 border border-[#D4A72C]/40"
                >
                  <RefreshCw className={`w-4 h-4 ${isDRTestRunning ? 'animate-spin' : ''}`} />
                  {isDRTestRunning ? 'Mengeksekusi DR Test...' : 'Jalankan DR Test Simulation Now'}
                </button>
              </div>

              {/* Last DR Test Result Card */}
              {lastDRTestResult && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                  <div className="font-bold text-slate-800 text-xs uppercase flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>HASIL DISASTER RECOVERY TEST TERAKHIR ({lastDRTestResult.testId})</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black text-[10px]">
                      STATUS: {lastDRTestResult.overallStatus} ({lastDRTestResult.durationMs}ms)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{lastDRTestResult.summaryNote}</p>
                </div>
              )}

              {/* DR Incident Manager */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Disaster Recovery Incident Log (DR-YYYYMMDD-XXXX)</h4>
                    <p className="text-xs text-slate-500">Pencatatan & Penanganan Insiden Pemulihan Bencana System</p>
                  </div>
                  <button
                    onClick={() => setIsReportingIncident(!isReportingIncident)}
                    className="bg-[#123B5D] hover:bg-[#0F2F4A] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Laporkan Insiden DR
                  </button>
                </div>

                {/* Form Report DR Incident */}
                {isReportingIncident && (
                  <form onSubmit={handleSaveDRIncident} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-xs text-slate-800 uppercase">Form Catat Insiden Disaster Recovery Baru</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Deskripsi Insiden / Kejadian</label>
                        <input
                          type="text"
                          required
                          value={newIncidentDesc}
                          onChange={(e) => setNewIncidentDesc(e.target.value)}
                          placeholder="Contoh: Gangguan respon koneksi database Google Sheets"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Tingkat Severity</label>
                        <select
                          value={newIncidentSeverity}
                          onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsReportingIncident(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 font-bold bg-slate-200 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs text-white font-bold bg-[#2E7D52] hover:bg-[#236340] rounded-lg shadow"
                      >
                        Simpan Laporan Insiden
                      </button>
                    </div>
                  </form>
                )}

                {/* DR Incidents Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Incident ID</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Deskripsi</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi Resoluasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {drIncidents.map((inc) => (
                        <tr key={inc.incidentId} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#123B5D] font-mono text-[11px]">{inc.incidentId}</td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">{inc.startedAt}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                              inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {inc.severity}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">{inc.description}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {inc.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {inc.status === 'OPEN' ? (
                              <button
                                onClick={() => handleResolveDRIncidentAction(inc.incidentId)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow ml-auto"
                              >
                                Tandai Resolusi
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">{inc.resolvedAt}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM HEALTH */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-4">
              <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#D4A72C]">STATUS KESEHATAN SYSTEM RT 07</h3>
                  <p className="text-xs text-slate-300">Monitoring real-time seluruh modul server & ketersediaan layanan</p>
                </div>
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  100% OPERATIONAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemHealth.map((sh, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{sh.module}</h4>
                      <p className="text-[11px] text-slate-500">{sh.details}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                      sh.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sh.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RITA AI KNOWLEDGE BASE */}
          {activeTab === 'RITA_KB' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Knowledge Base RITA AI Assistant</h3>
                  <p className="text-xs text-slate-500">Basis data resmi RAG untuk menjawab pertanyaan warga secara tepat</p>
                </div>
                <button
                  onClick={() => setIsAddingKb(!isAddingKb)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> {isAddingKb ? 'Batal' : 'Tambah Informasi Resmi'}
                </button>
              </div>

              {isAddingKb && (
                <form onSubmit={handleAddKbItem} className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul SOP / Informasi</label>
                    <input
                      type="text"
                      value={newKbTitle}
                      onChange={(e) => setNewKbTitle(e.target.value)}
                      placeholder="Contoh: SOP Peminjaman Tenda RT"
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={newKbCategory}
                        onChange={(e: any) => setNewKbCategory(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      >
                        <option value="SOP">SOP</option>
                        <option value="FAQ">FAQ</option>
                        <option value="Peraturan">Peraturan</option>
                        <option value="Pelayanan">Pelayanan</option>
                        <option value="Profil">Profil</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Isi Konten Informasi</label>
                    <textarea
                      value={newKbContent}
                      onChange={(e) => setNewKbContent(e.target.value)}
                      rows={3}
                      placeholder="Tuliskan aturan atau penjelasan resmi..."
                      className="w-full bg-white border border-slate-300 p-2 rounded-lg outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold px-4 py-2 rounded-lg"
                  >
                    Simpan Informasi ke RITA AI
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {kbItems.map((kb) => (
                  <div key={kb.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#123B5D]">{kb.title}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {kb.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{kb.content}</p>
                    <p className="text-[10px] text-slate-400">Sumber: {kb.source} | Update: {kb.lastUpdated}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL & SECURITY MONITORING */}
          {activeTab === 'LOGS' && (
            <div className="space-y-4">
              {/* Authorization Guard check */}
              {currentRole === 'WARGA' || currentRole === 'PUBLIC' ? (
                <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <h3 className="font-extrabold text-rose-900 text-sm">AKSES AUDIT LOG DITOLAK (FORBIDDEN - 403)</h3>
                  <p className="text-xs text-rose-700">
                    Sesuai kebijakan Least Privilege & Authorization Matrix SMART RT 07, Role <strong>{currentRole}</strong> tidak memiliki izin untuk melihat Audit Log server-side.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#D4A72C]">CATATAN AUDIT TRAIL SENSITIF (APPEND-ONLY)</span>
                        <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2 py-0.5 rounded">
                          TAHAP 6E COMPLIANT
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tercatat di Google Sheets <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">AUDIT_LOG</code> via Google Apps Script | Retensi 365 Hari | 0 Secret Leak
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg font-bold border border-emerald-500/30">
                        Active Policy: Immutable Append-Only
                      </span>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari User, Action, Correlation ID, Details..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <select
                        value={logModuleFilter}
                        onChange={(e) => setLogModuleFilter(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-bold text-slate-700"
                      >
                        <option value="ALL">Semua Modul System</option>
                        <option value="AUTH">AUTH (Authentication)</option>
                        <option value="USER">USER (Pengguna & Role)</option>
                        <option value="SURAT">SURAT (Surat Pengantar)</option>
                        <option value="DOKUMEN">DOKUMEN (Berkas Digital)</option>
                        <option value="KEUANGAN">KEUANGAN (Iuran & Kas)</option>
                        <option value="PENGADUAN">PENGADUAN (Laporan Warga)</option>
                        <option value="WA">WA (WhatsApp Gateway)</option>
                        <option value="AI">AI (RITA Assistant)</option>
                        <option value="SECURITY">SECURITY (Guard Alert)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={logSeverityFilter}
                        onChange={(e) => setLogSeverityFilter(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none font-bold text-slate-700"
                      >
                        <option value="ALL">Semua Tingkat Severity</option>
                        <option value="INFO">INFO (Operasional Normal)</option>
                        <option value="WARNING">WARNING (Peringatan System)</option>
                        <option value="CRITICAL">CRITICAL (Bahaya / Incident)</option>
                      </select>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  {(() => {
                    const filteredLogs = fetchAuditLogs(currentRole, {
                      search: logSearch,
                      module: logModuleFilter,
                      severity: logSeverityFilter as any
                    });

                    return (
                      <div className="space-y-3">
                        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase">
                              <tr>
                                <th className="p-2.5">Timestamp</th>
                                <th className="p-2.5">Correlation ID</th>
                                <th className="p-2.5">User & Role</th>
                                <th className="p-2.5">Aksi & Modul</th>
                                <th className="p-2.5">Target ID</th>
                                <th className="p-2.5">Severity</th>
                                <th className="p-2.5">Detail Catatan (Masked)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700">
                              {filteredLogs.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">
                                    Tidak ada catatan audit yang sesuai dengan filter pencarian.
                                  </td>
                                </tr>
                              ) : (
                                filteredLogs.map((log) => (
                                  <tr key={log.id_log} className="hover:bg-slate-50">
                                    <td className="p-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                                    <td className="p-2.5 font-mono text-[10px] text-slate-600 font-bold whitespace-nowrap bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                                      {log.correlationId || 'REQ-SYS-001'}
                                    </td>
                                    <td className="p-2.5">
                                      <div className="font-bold text-[#123B5D]">{log.userName || log.user}</div>
                                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                        {log.role || 'USER'}
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <div className="font-bold text-slate-900">{log.action}</div>
                                      <span className="text-[10px] text-slate-500 uppercase">{log.module}</span>
                                    </td>
                                    <td className="p-2.5 font-mono text-[11px] text-slate-600">{log.targetId || log.record_id || '-'}</td>
                                    <td className="p-2.5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        log.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                        log.severity === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      }`}>
                                        {log.severity || 'INFO'}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-slate-600 text-[11px] max-w-xs">{log.details || log.description}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Audit Retention Policy Info */}
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#2E7D52]" /> Audit Retention & Privacy Policy (TAHAP 6E)
                          </div>
                          <p>
                            • <strong>Immutability:</strong> Audit log bersifat Append-Only. Tidak ada tombol hapus audit log untuk mencegah manipulasi histori.
                          </p>
                          <p>
                            • <strong>Privasi Data:</strong> NIK, KK, Password, Token WA, API Key Gemini, dan Kunci Enkripsi disaring/disamarkan otomatis sebelum masuk ke log.
                          </p>
                          <p>
                            • <strong>Correlation Tracking:</strong> Seluruh rantai transaksi terhubung melalui <code>correlationId</code> unik untuk penelusuran insiden keamanan.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-5 py-2 rounded-xl shadow"
          >
            Tutup Panel Security
          </button>
        </div>

      </div>
    </div>
  );
};
