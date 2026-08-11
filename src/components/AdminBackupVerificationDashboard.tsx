// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9C BACKUP VERIFICATION AUTOMATION DASHBOARD
// Route: /admin/backup/verification
// Complete multi-stage automated verification engine: File -> Size -> SHA-256 -> Metadata -> Age -> Isolated Test Restore -> Restored Data Validation.
// ZERO fake PASS data. Strictly RBAC protected (ADMIN, KETUA_RT, PENGURUS).

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  FileCheck2,
  HardDrive,
  KeyRound,
  FileText,
  Clock,
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Shield,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Sliders,
  Bell,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  BackupVerificationService,
  BackupVerificationRecord,
  BackupHealthSummary,
  BackupVerificationSettings,
  FinalVerificationStatus,
  VerificationStageStatus
} from '../services/backupVerificationService';

interface AdminBackupVerificationDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminBackupVerificationDashboard: React.FC<AdminBackupVerificationDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'HISTORY' | 'RETENTION' | 'SETTINGS'>('PIPELINE');

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [healthSummary, setHealthSummary] = useState<BackupHealthSummary | null>(null);
  const [verifications, setVerifications] = useState<BackupVerificationRecord[]>([]);
  const [settings, setSettings] = useState<BackupVerificationSettings | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<BackupVerificationRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRunningVerification, setIsRunningVerification] = useState<boolean>(false);

  // Settings Form State
  const [formSettings, setFormSettings] = useState<BackupVerificationSettings | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const summary = BackupVerificationService.getBackupHealthSummary();
      const history = BackupVerificationService.getVerificationHistory();
      const currentSettings = BackupVerificationService.getSettings();

      setHealthSummary(summary);
      setVerifications(history);
      setSettings(currentSettings);
      setFormSettings(currentSettings);

      if (history.length > 0 && !selectedVerification) {
        setSelectedVerification(history[0]);
      }
    } catch (e) {
      console.error('Failed to load backup verification data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s refresh
    return () => clearInterval(interval);
  }, []);

  // Access Control Check
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul Backup Verification Automation (/admin/backup/verification) hanya dapat diakses oleh KETUA RT, ADMIN, dan PENGURUS terotorisasi.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Dibatasi Server)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  const handleRunManualVerification = async () => {
    setIsRunningVerification(true);
    try {
      const record = await BackupVerificationService.runVerificationPipeline(
        undefined,
        `USR-${currentRole}***`
      );
      setSelectedVerification(record);
      await loadData();
      alert(`Verifikasi Backup ${record.verificationId} Selesai dengan status: ${record.finalStatus}`);
    } catch (e: any) {
      alert(`Gagal menjalankan verifikasi pipeline: ${e.message}`);
    } finally {
      setIsRunningVerification(false);
    }
  };

  const handleSaveSettings = () => {
    if (!formSettings) return;
    try {
      BackupVerificationService.updateSettings(formSettings, `USR-${currentRole}***`);
      loadData();
      alert('Pengaturan Pipeline Verification berhasil disimpan.');
    } catch (e: any) {
      alert(`Gagal menyimpan pengaturan: ${e.message}`);
    }
  };

  const filteredVerifications = verifications.filter((v) => {
    if (statusFilter !== 'ALL' && v.finalStatus !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.verificationId.toLowerCase().includes(q) ||
      v.backupId.toLowerCase().includes(q) ||
      v.triggeredByMasked.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: FinalVerificationStatus | VerificationStageStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PASS</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WARNING</span>
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAIL</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0D2A4A]/5 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BRANDING */}
        <div className="bg-[#0D2A4A] text-white rounded-2xl p-6 shadow-xl border border-[#C89A2B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#C89A2B] text-[#0D2A4A] rounded-xl shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-wide text-white">SMART RT 07 RW 11</h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  9C BACKUP VERIFICATION AUTOMATION
                </span>
              </div>
              <p className="text-xs text-[#E9D8B4] mt-1 font-mono">
                /admin/backup/verification — Multi-Stage Integrity Engine, Cryptographic Checksums & Isolated Test Restore
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isLimitedView && (
              <button
                onClick={handleRunManualVerification}
                disabled={isRunningVerification}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition text-xs"
              >
                <PlayCircle className={`w-4 h-4 ${isRunningVerification ? 'animate-spin' : ''}`} />
                <span>{isRunningVerification ? 'Memverifikasi...' : 'Jalankan Verification Now'}</span>
              </button>
            )}

            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-[#C89A2B] hover:bg-[#C89A2B]/90 text-[#0D2A4A] font-extrabold rounded-xl shadow transition text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* HEALTH OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Health</p>
              <div className="mt-1">
                {getStatusBadge(healthSummary?.overallHealthStatus || 'UNKNOWN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block font-mono">
                Score: {healthSummary?.recoveryHealthScore !== null ? `${healthSummary?.recoveryHealthScore}/100` : 'N/A'}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SHA-256 Checksum</p>
              <div className="mt-1">
                {getStatusBadge(healthSummary?.checksumStatus || 'UNKNOWN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block font-mono">Cryptographic Hash Match</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <KeyRound className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Restore Engine</p>
              <div className="mt-1">
                {getStatusBadge(healthSummary?.restoreTestStatus || 'UNKNOWN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block font-mono">Isolated Environment</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Backup Age Status</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {healthSummary?.backupAgeHours !== null ? `${healthSummary?.backupAgeHours} Jam` : 'N/A'}
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {healthSummary?.backupAgeHours && healthSummary.backupAgeHours < 24
                  ? 'HEALTHY (< 24 Jam)'
                  : 'WARNING (> 24 Jam)'}
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 border-b border-slate-300 overflow-x-auto pb-1">
          {[
            { id: 'PIPELINE', label: 'Verification Pipeline Tracker', icon: Layers },
            { id: 'HISTORY', label: `Verification Audit History (${verifications.length})`, icon: FileText },
            { id: 'RETENTION', label: 'Retention Policy & Safeguards', icon: Lock },
            { id: 'SETTINGS', label: 'Pipeline Configuration', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-[#0D2A4A] text-[#0D2A4A] bg-white shadow-sm font-black'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PIPELINE TRACKER */}
        {activeTab === 'PIPELINE' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0D2A4A]" /> Automated Multi-Stage Verification Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspeksi mendalam dari keberadaan berkas hingga uji restore terisolasi. ZERO fake PASS.
                </p>
              </div>

              {selectedVerification && (
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    ID: {selectedVerification.verificationId}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1 font-mono">
                    Target: {selectedVerification.backupId}
                  </span>
                </div>
              )}
            </div>

            {selectedVerification ? (
              <div className="space-y-6">
                {/* PIPELINE VISUAL FLOW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* STAGE 1: FILE EXISTENCE */}
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                        Stage 1 — File Exists
                      </span>
                      {getStatusBadge(selectedVerification.fileVerification.status)}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Keberadaan & Akses Berkas</h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {selectedVerification.fileVerification.details}
                    </p>
                  </div>

                  {/* STAGE 2: SIZE & FILE COUNT */}
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                        Stage 2 — Size & Count
                      </span>
                      {getStatusBadge(selectedVerification.sizeVerification.status)}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Deteksi Anomali Ukuran</h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {selectedVerification.sizeVerification.details}
                    </p>
                  </div>

                  {/* STAGE 3: CHECKSUM (SHA-256) */}
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                        Stage 3 — SHA-256 Hash
                      </span>
                      {getStatusBadge(selectedVerification.checksumVerification.status)}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Cryptographic Integrity</h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {selectedVerification.checksumVerification.details}
                    </p>
                  </div>

                  {/* STAGE 4: ISOLATED TEST RESTORE */}
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                        Stage 4 — Isolated Restore
                      </span>
                      {getStatusBadge(selectedVerification.restoreTestVerification.status)}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Test Restore & Data Integrity</h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {selectedVerification.restoreTestVerification.details}
                    </p>
                  </div>
                </div>

                {/* DETAILED VERIFICATION BREAKDOWN TABLE */}
                <div className="bg-slate-50 p-5 rounded-2xl border space-y-4">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Rincian Hasil Verifikasi Terperinci
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-white p-3 rounded-xl border space-y-1">
                      <span className="text-slate-400 block text-[10px]">Expected Cryptographic SHA-256:</span>
                      <p className="text-slate-800 font-bold break-all">
                        {selectedVerification.checksumVerification.expectedHash}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border space-y-1">
                      <span className="text-slate-400 block text-[10px]">Computed Cryptographic SHA-256:</span>
                      <p className="text-slate-800 font-bold break-all">
                        {selectedVerification.checksumVerification.actualHash}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border space-y-1">
                      <span className="text-slate-400 block text-[10px]">Tabel/Sheet Terverifikasi:</span>
                      <p className="text-slate-800 font-bold">
                        {selectedVerification.restoredDataValidation.tablesChecked.join(', ')}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border space-y-1">
                      <span className="text-slate-400 block text-[10px]">Total Records Teruji:</span>
                      <p className="text-slate-800 font-bold">
                        {selectedVerification.restoreTestVerification.recordsChecked.toLocaleString()} Records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                Belum ada data verifikasi backup.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VERIFICATION HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Verification ID, Backup ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-xs border rounded-lg px-3 py-1.5 outline-none w-full md:w-64 focus:ring-2 focus:ring-[#0D2A4A]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Status Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border rounded p-1 font-bold outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PASS">PASS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="FAIL">FAIL</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Verification ID</th>
                    <th className="py-2.5 px-3">Target Backup ID</th>
                    <th className="py-2.5 px-3">Status Pipeline</th>
                    <th className="py-2.5 px-3">Checksum</th>
                    <th className="py-2.5 px-3">Restore Test</th>
                    <th className="py-2.5 px-3">Pemicu</th>
                    <th className="py-2.5 px-3">Waktu Selesai</th>
                    <th className="py-2.5 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredVerifications.map((v) => (
                    <tr key={v.verificationId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{v.verificationId}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{v.backupId}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(v.finalStatus)}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(v.checksumVerification.status)}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(v.restoreTestVerification.status)}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{v.triggeredByMasked}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {v.completedAt ? new Date(v.completedAt).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => {
                            setSelectedVerification(v);
                            setActiveTab('PIPELINE');
                          }}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition text-[10px]"
                        >
                          Inspeksi Pipeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RETENTION POLICY */}
        {activeTab === 'RETENTION' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Lock className="w-5 h-5 text-indigo-600" /> Retention Safety & Safeguard Policy
            </h3>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <h4 className="font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> PRINSIP RETENSI KETAT: VERIFY FIRST, DELETE LATER
              </h4>
              <p>
                Sistem SMART RT 07 RW 11 menerapkan prinsip keamanan data berlapis. Hapus arsip backup lama HANYA
                diizinkan apabila backup pengganti terbaru telah berhasil melewati seluruh tahap verifikasi pipeline (STATUS: PASS).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border bg-slate-50 space-y-1">
                <span className="text-slate-500 font-bold block">Daily Retention:</span>
                <p className="text-lg font-black text-slate-800">
                  {settings?.retentionDailyDays || 7} Hari (7 Arsip)
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 space-y-1">
                <span className="text-slate-500 font-bold block">Weekly Retention:</span>
                <p className="text-lg font-black text-slate-800">
                  {settings?.retentionWeeklyWeeks || 4} Minggu (4 Arsip)
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 space-y-1">
                <span className="text-slate-500 font-bold block">Monthly Retention:</span>
                <p className="text-lg font-black text-slate-800">
                  {settings?.retentionMonthlyMonths || 12} Bulan (12 Arsip)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Sliders className="w-5 h-5 text-[#0D2A4A]" /> Pipeline Configuration & Alert Thresholds
            </h3>

            {formSettings && (
              <div className="max-w-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Algoritma Checksum:</label>
                  <input
                    type="text"
                    disabled
                    value={formSettings.checksumAlgorithm}
                    className="w-full p-2.5 bg-slate-100 border rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Uji Restore Terisolasi:</label>
                  <select
                    value={formSettings.restoreTestEnabled ? 'TRUE' : 'FALSE'}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, restoreTestEnabled: e.target.value === 'TRUE' })
                    }
                    className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                  >
                    <option value="TRUE">Aktif (Rekomendasi Production)</option>
                    <option value="FALSE">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Retry Count:</label>
                  <input
                    type="number"
                    value={formSettings.maxRetries}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, maxRetries: Number(e.target.value) })
                    }
                    className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                  />
                </div>

                {!isLimitedView && (
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-[#0D2A4A] text-white rounded-xl text-xs font-bold hover:bg-[#0D2A4A]/90 transition"
                  >
                    Simpan Pengaturan
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
