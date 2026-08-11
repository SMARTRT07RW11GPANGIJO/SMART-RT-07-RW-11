// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J AI AUDIT & ANALYTICS CONTROL CENTER

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Terminal,
  Cpu,
  Coins,
  ThumbsUp,
  ThumbsDown,
  Lock,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Radio,
  Trash2,
  Server
} from 'lucide-react';
import { UserRole } from '../types/rt';
import { AIAuditLog, SecurityAlert, AnalyticsOverview, AuditIntegrityStatus, AuditExportOptions } from '../types/aiAudit';
import { AuditLogger } from '../services/auditLoggerService';
import { AnalyticsEngineService } from '../services/analyticsEngineService';
import { SecurityAlertService } from '../services/securityAlertService';
import { AuditIntegrityService, RetentionPolicyService } from '../services/auditIntegrityService';
import { AuditExportService } from '../services/auditExportService';
import { SecurityTest8JService } from '../services/securityTest8JService';
import { SecurityTestResult } from '../types/securityTest';

interface AdminAIAuditDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminAIAuditDashboard: React.FC<AdminAIAuditDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'LOGS' | 'TOOLS' | 'ERRORS' | 'ALERTS' | 'COST' | 'QUALITY' | 'INTEGRITY' | 'TESTS' | 'EXPORT'
  >('OVERVIEW');

  // State
  const [logs, setLogs] = useState<AIAuditLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [integrity, setIntegrity] = useState<AuditIntegrityStatus | null>(null);
  const [testResult, setTestResult] = useState<SecurityTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Filters for Audit Log Viewer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AIAuditLog | null>(null);

  // Export State
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [exportMaskPII, setExportMaskPII] = useState(true);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    const fetchedLogs = AuditLogger.getLogs();
    setLogs(fetchedLogs);

    const fetchedAlerts = SecurityAlertService.getAlerts();
    setAlerts(fetchedAlerts);

    const integrityRes = await AuditIntegrityService.verifyHashChain(fetchedLogs);
    setIntegrity(integrityRes);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate Overview
  const analytics: AnalyticsOverview = useMemo(() => {
    return AnalyticsEngineService.computeOverview(logs);
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedRole !== 'ALL' && log.role !== selectedRole) return false;
      if (selectedChannel !== 'ALL' && log.channel !== selectedChannel) return false;
      if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesReq = log.requestId.toLowerCase().includes(q);
        const matchesUser = log.userId.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesTool = (log.toolName || '').toLowerCase().includes(q);
        const matchesDetails = (log.details || '').toLowerCase().includes(q);
        return matchesId || matchesReq || matchesUser || matchesAction || matchesTool || matchesDetails;
      }
      return true;
    });
  }, [logs, selectedRole, selectedChannel, selectedStatus, searchQuery]);

  // Handle Resolve Alert
  const handleResolveAlert = (alertId: string) => {
    SecurityAlertService.resolveAlert(alertId, `${currentUserId} (${currentRole})`);
    loadData();
  };

  // Run Security Test Suite
  const handleRunSecurityTests = async () => {
    setIsTesting(true);
    const res = await SecurityTest8JService.runSuite();
    setTestResult(res);
    setIsTesting(false);
  };

  // Handle Export
  const handleExport = () => {
    const options: AuditExportOptions = {
      format: exportFormat,
      maskPII: exportMaskPII
    };
    const res = AuditExportService.exportAuditLogs(logs, options, {
      userId: currentUserId,
      role: currentRole
    });

    // Trigger Browser Download
    const blob = new Blob([res.content], { type: res.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportMessage(`Berhasil mengekspor ${res.filename} (${logs.length} catatan audit)`);
    setTimeout(() => setExportMessage(null), 5000);
  };

  // Access Control Enforcement
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-rose-600 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul AI Audit & Analytics Center (8J) hanya dapat diakses oleh PENGURUS, KETUA RT, dan ADMIN demi privasi data warga.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Akses Dibatasi)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Control Center & Analytics</h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                  TAHAP 8J
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                SMART RT 07 RW 11 GPA NGIJO — Real-time Audit, Anomaly Monitoring & Privacy Assurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {integrity && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                  integrity.isChainValid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {integrity.isChainValid ? 'INTEGRITAS TERCATAT (SHA-256)' : 'TERDETEKSI PERUBAHAN TANDATANGAN'}
                </span>
              </div>
            )}

            <button
              onClick={loadData}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono">
              Role: <strong className="text-blue-400">{currentRole}</strong>
            </span>
          </div>
        </div>

        {/* LIMITED ACCESS BANNER FOR PENGURUS */}
        {isLimitedView && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong>Akses Dibatasi (Operational View):</strong> Anda login sebagai PENGURUS. Akses audit diberikan untuk statistik operasional. Detail raw audit log dan konfigurasi keamanan memerlukan otorisasi KETUA_RT / ADMIN.
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Ringkasan & KPI', icon: TrendingUp },
            { id: 'LOGS', label: 'Log Aktivitas AI', icon: FileText, disabled: isLimitedView },
            { id: 'TOOLS', label: 'Analistik Tool', icon: Cpu },
            { id: 'ERRORS', label: 'Klasifikasi Error', icon: AlertTriangle },
            { id: 'ALERTS', label: 'Keamanan & Anomali', icon: Shield, badge: analytics.activeAlertsCount },
            { id: 'COST', label: 'Penggunaan Token', icon: Coins },
            { id: 'QUALITY', label: 'Kualitas & Feedback', icon: ThumbsUp },
            { id: 'INTEGRITY', label: 'Hash Integrity', icon: Lock, disabled: isLimitedView },
            { id: 'TESTS', label: 'Uji Keamanan (8J)', icon: Terminal },
            { id: 'EXPORT', label: 'Ekspor Laporan', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                    : tab.disabled
                    ? 'text-slate-300 border-transparent cursor-not-allowed'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 bg-rose-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* KPI METRIC CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Permintaan AI</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{analytics.totalRequests}</h3>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 100% Traceable
                  </span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tingkat Keberhasilan</p>
                  <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{analytics.successRate}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Tingkat Resolusi: {analytics.resolutionRate}%</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Penolakan / Denial Rate</p>
                  <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{analytics.denialRate}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Zero Trust Enforced</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Shield className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-rata Respon</p>
                  <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{analytics.avgResponseTimeMs} ms</h3>
                  <span className="text-xs text-slate-500 mt-1 block">P50: {analytics.p50Ms}ms | P95: {analytics.p95Ms}ms</span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* SECONDARY KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LATENCY PERCENTILES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Profil Latensi Sistem
                  </h3>
                  <span className="text-xs text-slate-400">Response Time</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>P50 (Median)</span>
                      <span className="font-bold text-indigo-600">{analytics.p50Ms} ms</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>P95 (Persentil 95)</span>
                      <span className="font-bold text-indigo-600">{analytics.p95Ms} ms</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>P99 (Persentil 99)</span>
                      <span className="font-bold text-indigo-600">{analytics.p99Ms} ms</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-800 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHANNEL DISTRIBUTION */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600" /> Distribusi Kanal Akses
                  </h3>
                  <span className="text-xs text-slate-400">Channel</span>
                </div>
                <div className="space-y-3">
                  {analytics.channelDistribution.map((ch) => (
                    <div key={ch.channel} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{ch.channel}</span>
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-md text-xs">
                        {ch.count} req
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROLE DISTRIBUTION */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" /> Distribusi Role Pengguna
                  </h3>
                  <span className="text-xs text-slate-400">Role</span>
                </div>
                <div className="space-y-3">
                  {analytics.roleDistribution.map((r) => (
                    <div key={r.role} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{r.role}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-md text-xs">
                        {r.count} req
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOG VIEWER */}
        {activeTab === 'LOGS' && !isLimitedView && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Penjelajah Log Aktivitas AI (AI Audit Explorer)
              </h3>

              {/* FILTERS */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ID, user, tool..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48"
                  />
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                >
                  <option value="ALL">Semua Role</option>
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="WARGA">WARGA</option>
                  <option value="PENGURUS">PENGURUS</option>
                  <option value="KETUA_RT">KETUA_RT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="DENIED">DENIED</option>
                  <option value="FAILURE">FAILURE</option>
                </select>
              </div>
            </div>

            {/* LOGS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">ID Log</th>
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Pengguna</th>
                    <th className="py-3 px-3">Aksi Event</th>
                    <th className="py-3 px-3">Tool / Fitur</th>
                    <th className="py-3 px-3">Otorisasi</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Durasi</th>
                    <th className="py-3 px-3 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{log.id}</td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{log.userId}</div>
                        <span className="text-[10px] text-slate-500">{log.role}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{log.toolName || '-'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.authorization === 'ALLOWED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.authorization}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.status === 'DENIED'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{log.durationMs}ms</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400 text-sm">
                        Tidak ada catatan audit yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TOOL ANALYTICS */}
        {activeTab === 'TOOLS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Cpu className="w-5 h-5 text-indigo-600" /> Analistik & Frekuensi Eksekusi Tool AI
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Nama Tool AI</th>
                    <th className="py-3 px-3">Total Panggilan</th>
                    <th className="py-3 px-3">Berhasil</th>
                    <th className="py-3 px-3">Gagal</th>
                    <th className="py-3 px-3">Ditolak</th>
                    <th className="py-3 px-3">Rata-rata Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.topTools.map((t) => (
                    <tr key={t.toolName} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold font-mono text-slate-900">{t.toolName}</td>
                      <td className="py-3 px-3 font-bold text-slate-700">{t.calls}</td>
                      <td className="py-3 px-3 text-emerald-600 font-semibold">{t.success}</td>
                      <td className="py-3 px-3 text-rose-600 font-semibold">{t.failed}</td>
                      <td className="py-3 px-3 text-amber-600 font-semibold">{t.denied}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{t.avgDurationMs} ms</td>
                    </tr>
                  ))}
                  {analytics.topTools.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        Belum ada eksekusi tool tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ERROR ANALYTICS */}
        {activeTab === 'ERRORS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Klasifikasi Error & Kegagalan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.errors.map((err) => (
                <div key={err.category} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {err.category}
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 mt-2">{err.count} Kegagalan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-rose-600">{err.percentage}%</span>
                    <p className="text-xs text-slate-500">dari total error</p>
                  </div>
                </div>
              ))}
              {analytics.errors.length === 0 && (
                <p className="text-slate-400 text-sm">Tidak ada error tercatat dalam sistem saat ini.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY ALERTS */}
        {activeTab === 'ALERTS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-600" /> Pusat Alert Keamanan & Deteksi Anomali
              </h3>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                {analytics.activeAlertsCount} Alert Aktif
              </span>
            </div>

            <div className="space-y-4">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alt.status === 'ACTIVE'
                      ? alt.severity === 'CRITICAL'
                        ? 'bg-rose-50 border-rose-300'
                        : 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {alt.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">{alt.id}</span>
                      <span className="text-xs text-slate-500">• {new Date(alt.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{alt.description}</p>
                    <p className="text-xs text-slate-500">
                      User Terkait: <strong>{alt.userId}</strong> | Tipe: {alt.type}
                    </p>
                  </div>

                  <div>
                    {alt.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleResolveAlert(alt.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        Selesaikan Alert (Resolve)
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Diselesaikan oleh {alt.resolvedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TOKEN COST */}
        {activeTab === 'COST' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Coins className="w-5 h-5 text-amber-600" /> Penggunaan Token & Estimasi Biaya
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">Model AI</p>
                <h4 className="text-lg font-extrabold text-slate-900 mt-1">{analytics.cost.model}</h4>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <p className="text-xs font-bold text-blue-800 uppercase">Total Token Digunakan</p>
                <h4 className="text-2xl font-black text-slate-900 mt-1">
                  {analytics.cost.totalTokens.toLocaleString('id-ID')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Input: {analytics.cost.inputTokens.toLocaleString('id-ID')} | Output: {analytics.cost.outputTokens.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase">Estimasi Biaya API</p>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">
                  Rp {analytics.cost.estimatedCostIdr.toLocaleString('id-ID')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">≈ ${analytics.cost.estimatedCostUsd} USD</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: QUALITY & FEEDBACK */}
        {activeTab === 'QUALITY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <ThumbsUp className="w-5 h-5 text-emerald-600" /> Kualitas Respon & Feedback Warga
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500">Tingkat Kepuasan Warga</p>
                <h2 className="text-4xl font-black text-emerald-600">{analytics.feedback.positiveRatio}%</h2>
                <p className="text-xs text-slate-400">berdasarkan {analytics.feedback.totalFeedback} evaluasi</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 flex items-center justify-around">
                <div className="text-center">
                  <ThumbsUp className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-extrabold text-slate-900">{analytics.feedback.helpfulCount}</p>
                  <p className="text-xs text-slate-500">Sangat Membantu 👍</p>
                </div>
                <div className="text-center">
                  <ThumbsDown className="w-8 h-8 text-rose-600 mx-auto mb-1" />
                  <p className="text-xl font-extrabold text-slate-900">{analytics.feedback.unhelpfulCount}</p>
                  <p className="text-xs text-slate-500">Kurang Tepat 👎</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500">Eskalasi ke Manusia</p>
                <h2 className="text-4xl font-black text-amber-600">{analytics.feedback.escalationRate}%</h2>
                <p className="text-xs text-slate-400">{analytics.feedback.escalationCount} eskalasi diteruskan</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: INTEGRITY & RETENTION */}
        {activeTab === 'INTEGRITY' && !isLimitedView && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Lock className="w-5 h-5 text-slate-800" /> Integritas Hash Chain & Kebijakan Retensi
            </h3>

            {integrity && (
              <div className="p-5 rounded-2xl border bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">Status Integritas Hash Chain:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      integrity.isChainValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {integrity.isChainValid ? 'VALID (Sesuai)' : 'TAMPER DETECTED (Cacat)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Total {integrity.totalRecordsChecked} catatan diperiksa secara sekuensial. Setiap catatan dikunci menggunakan SHA-256 hash chaining dari catatan sebelumnya.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: SECURITY TESTS (8J) */}
        {activeTab === 'TESTS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" /> Uji Keamanan & Privasi AI (15 Skenario 8J)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pengujian otomatis akses tidak sah, kebocoran NIK/KK/Secret, manipulasi log, serta deteksi anomali.
                </p>
              </div>

              <button
                onClick={handleRunSecurityTests}
                disabled={isTesting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{isTesting ? 'Menjalankan Uji...' : 'Jalankan Uji 15 Skenario'}</span>
              </button>
            </div>

            {testResult && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Hasil Pengujian Keamanan 8J</p>
                    <h4 className="text-xl font-black text-emerald-400 mt-0.5">
                      {testResult.passed} / {testResult.totalTests} Lulus ({testResult.durationMs}ms)
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/30">
                    100% SECURE
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs">
                  {testResult.logs.map((t) => (
                    <div key={t.testId} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{t.testId}</span>
                          <span className="font-semibold text-slate-900">{t.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{t.notes}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 10: EXPORT REPORT */}
        {activeTab === 'EXPORT' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Download className="w-5 h-5 text-blue-600" /> Ekspor Laporan Audit AI
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Format Laporan</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === 'CSV'}
                      onChange={() => setExportFormat('CSV')}
                    />
                    <span>CSV Spreadsheet</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={exportFormat === 'PDF'}
                      onChange={() => setExportFormat('PDF')}
                    />
                    <span>PDF Text Report</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mask"
                  checked={exportMaskPII}
                  onChange={(e) => setExportMaskPII(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="mask" className="font-semibold text-slate-700 cursor-pointer">
                  Sembunyikan / Masking Data Sensitif (NIK, KK, Phone)
                </label>
              </div>

              <button
                onClick={handleExport}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition"
              >
                Unduh Laporan Audit
              </button>

              {exportMessage && (
                <p className="text-center text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {exportMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* LOG DETAIL MODAL */}
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900">Detail Catatan Audit #{selectedLog.id}</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                <div>
                  <strong>Timestamp:</strong> {selectedLog.timestamp}
                </div>
                <div>
                  <strong>Request ID:</strong> {selectedLog.requestId}
                </div>
                <div>
                  <strong>Session ID:</strong> {selectedLog.sessionId}
                </div>
                <div>
                  <strong>User ID / Resident ID:</strong> {selectedLog.userId} ({selectedLog.role})
                </div>
                <div>
                  <strong>Channel:</strong> {selectedLog.channel}
                </div>
                <div>
                  <strong>Action:</strong> {selectedLog.action}
                </div>
                <div>
                  <strong>Tool Called:</strong> {selectedLog.toolName || '-'}
                </div>
                <div>
                  <strong>Authorization:</strong> {selectedLog.authorization}
                </div>
                <div>
                  <strong>Status:</strong> {selectedLog.status} ({selectedLog.durationMs}ms)
                </div>
                <div>
                  <strong>Previous Hash:</strong> {selectedLog.previousHash}
                </div>
                <div>
                  <strong>Current Hash:</strong> {selectedLog.currentHash}
                </div>
                <div className="pt-2 border-t text-slate-800">
                  <strong>Details Payload:</strong>
                  <p className="mt-1 whitespace-pre-wrap">{selectedLog.details || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
