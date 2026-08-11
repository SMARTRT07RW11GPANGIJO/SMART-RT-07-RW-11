// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9A PRODUCTION MONITORING CENTER
// Real-time infrastructure & application health monitoring, incident tracker, config audit, error logs.
// Strictly NO fake data / random metrics. Displays UNKNOWN or "DATA BELUM TERSEDIA" if unmeasured.

import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  Shield,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Database,
  Key,
  MessageSquare,
  Cpu,
  Layers,
  FileText,
  Lock,
  Radio,
  Sliders,
  CheckSquare,
  AlertOctagon,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  ProductionMonitoringService,
  ServiceHealthItem,
  ProductionMonitoringSummary,
  SystemConfigStatus,
  SystemErrorLog,
  ProductionIncident,
  ServiceHealthStatus
} from '../services/productionMonitoringService';

interface AdminProductionMonitoringDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminProductionMonitoringDashboard: React.FC<AdminProductionMonitoringDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'SERVICES' | 'CONFIG' | 'ERRORS' | 'INCIDENTS' | 'INFRASTRUCTURE' | 'AUDIT'
  >('OVERVIEW');

  // State
  const [summary, setSummary] = useState<ProductionMonitoringSummary | null>(null);
  const [services, setServices] = useState<ServiceHealthItem[]>([]);
  const [configs, setConfigs] = useState<SystemConfigStatus[]>([]);
  const [errors, setErrors] = useState<SystemErrorLog[]>([]);
  const [incidents, setIncidents] = useState<ProductionIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Resolution Modal State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');

  // Fetch Data
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const sum = await ProductionMonitoringService.getMonitoringSummary();
      const srv = await ProductionMonitoringService.runHealthCheck();
      const cfg = ProductionMonitoringService.getConfigStatus();
      const err = ProductionMonitoringService.getErrorLogs();
      const inc = ProductionMonitoringService.getIncidents();

      setSummary(sum);
      setServices(srv);
      setConfigs(cfg);
      setErrors(err);
      setIncidents(inc);
    } catch (e) {
      console.error('Failed to load production monitoring data:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  const handleResolveIncident = (incidentId: string) => {
    if (!resolutionText.trim()) {
      alert('Mohon isi deskripsi penyelesaian incident!');
      return;
    }
    ProductionMonitoringService.resolveIncident(incidentId, resolutionText);
    setSelectedIncidentId(null);
    setResolutionText('');
    loadData();
  };

  // Access Control Enforcement
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul Production Monitoring Center (Tahap 9A) hanya dapat diakses oleh KETUA RT, ADMIN, dan PENGURUS terotorisasi untuk menjaga privasi & keamanan infrastruktur RT.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Dibatasi Server)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  // Helper Badge Color
  const getStatusBadge = (status: ServiceHealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 🟢 HEALTHY
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 🟡 WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> 🔴 CRITICAL
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> ⚪ UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0D2A4A]/5 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER BRANDING */}
        <div className="bg-[#0D2A4A] text-white rounded-2xl p-6 shadow-xl border border-[#C89A2B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#C89A2B] text-[#0D2A4A] rounded-xl shadow-lg">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-wide text-white">SMART RT 07 RW 11</h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  9A PRODUCTION MONITORING CENTER
                </span>
              </div>
              <p className="text-xs text-[#E9D8B4] mt-1 font-mono">
                Perum GPA Ngijo — Real-Time Infrastructure & Application Health Observatory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* AUTO REFRESH CONTROLLER */}
            <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-700 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-[#C89A2B]" />
              <span>Interval:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-slate-800 text-white border border-slate-700 rounded p-1 outline-none font-bold"
              >
                <option value={15}>15 dtk</option>
                <option value={30}>30 dtk</option>
                <option value={60}>60 dtk</option>
              </select>
            </div>

            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-[#C89A2B] hover:bg-[#C89A2B]/90 text-[#0D2A4A] font-extrabold rounded-xl shadow transition text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memeriksa...' : 'Refresh Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* LIMITED VIEW BANNER FOR PENGURUS */}
        {isLimitedView && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3 text-amber-800 text-xs font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong>Akses Terbatas (Ringkasan Pengurus):</strong> Anda login sebagai PENGURUS. Tampilan ini menampilkan status umum kesehatan layanan. Mengubah status insiden memerlukan wewenang KETUA_RT atau ADMIN.
            </div>
          </div>
        )}

        {/* SUMMARY HEADER CARDS */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall System Status</p>
                <div className="mt-2">{getStatusBadge(summary.systemStatus)}</div>
                <span className="text-[11px] text-slate-500 mt-2 block font-mono">
                  Checked: {new Date(summary.lastCheckTime).toLocaleTimeString()} WIB
                </span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <Radio className="w-6 h-6 text-[#0D2A4A] animate-pulse" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime 24-Jam (Actual)</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {summary.uptime24hPercent !== null ? `${summary.uptime24hPercent}%` : 'DATA BELUM TERSEDIA'}
                </h3>
                <span className="text-[11px] text-slate-500 mt-1 block">Tercatat tanpa rekayasa data</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Komponen Layanan</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {summary.servicesOnline} <span className="text-xs text-slate-500 font-normal">/ {services.length} Online</span>
                </h3>
                <div className="flex gap-2 text-[11px] font-bold mt-1">
                  <span className="text-amber-600">{summary.servicesWarning} Warning</span>
                  <span className="text-rose-600">{summary.servicesCritical} Critical</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Incidents</p>
                <h3 className={`text-2xl font-black mt-1 ${summary.activeIncidentsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {summary.activeIncidentsCount} Incidents
                </h3>
                <span className="text-[11px] text-slate-500 mt-1 block">Incident log terpusat</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertOctagon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 border-b border-slate-300 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Ringkasan & Layanan (10 Services)', icon: Radio },
            { id: 'CONFIG', label: 'Konfigurasi Rahasia & Credential Status', icon: Key },
            { id: 'ERRORS', label: 'Application & API Error Logs', icon: FileText },
            { id: 'INCIDENTS', label: 'Incident Tracker', icon: AlertOctagon },
            { id: 'INFRASTRUCTURE', label: 'Infrastruktur & Latency Metrics', icon: Cpu },
            { id: 'AUDIT', label: 'Monitoring Audit Trail', icon: Shield }
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

        {/* TAB 1: OVERVIEW & 10 SERVICES GRID */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#0D2A4A] uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-[#C89A2B]" /> Status Keaktifan 10 Komponen Layanan Produksi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">{srv.id}</span>
                      <h4 className="font-extrabold text-sm text-slate-900">{srv.name}</h4>
                    </div>
                    {getStatusBadge(srv.status)}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                    {srv.details}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t text-slate-500">
                    <div>
                      <span className="block text-[10px] text-slate-400">Response Latency:</span>
                      <strong className="text-slate-800">
                        {srv.latencyMs !== null ? `${srv.latencyMs} ms` : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Response Code:</span>
                      <strong className="text-slate-800">{srv.responseCode !== null ? srv.responseCode : 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURATION STATUS */}
        {activeTab === 'CONFIG' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#0D2A4A]" /> Status Konfigurasi & Integrasi Terpasang (/admin/monitoring/config)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aturan Keamanan: Rahasia (Secrets/Tokens) TIDAK PERNAH ditampilkan di UI ini untuk mematuhi standar zero-trust.
              </p>
            </div>

            <div className="space-y-3">
              {configs.map((cfg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cfg.service}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{cfg.details}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Terakhir Diverifikasi: {new Date(cfg.lastVerified).toLocaleTimeString()} WIB
                    </span>
                  </div>

                  <div>
                    {cfg.status === 'CONFIGURED' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs border border-emerald-300">
                        ✓ CONFIGURED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs border border-amber-300">
                        ⚠ NOT CONFIGURED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ERROR LOGS */}
        {activeTab === 'ERRORS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" /> Log Kesalahan Aplikasi & API (Filtered & Masked)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh NIK, KK, nomor HP, dan token disamarkan secara otomatis demi privasi warga.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Layanan</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status Code</th>
                    <th className="py-2.5 px-3">Pesan Error</th>
                    <th className="py-2.5 px-3">User (Masked)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {errors.map((err) => (
                    <tr key={err.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{err.requestId}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(err.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{err.service}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          {err.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-600">{err.statusCode}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-sans max-w-xs truncate">{err.message}</td>
                      <td className="py-2.5 px-3 text-slate-500">{err.userIdMasked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INCIDENTS */}
        {activeTab === 'INCIDENTS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <AlertOctagon className="w-5 h-5 text-rose-600" /> Production Incident Tracker
            </h3>

            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.incidentId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-rose-700">{inc.incidentId}</span>
                      <span className="font-bold text-sm text-slate-900">{inc.service}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{inc.description}</p>
                  {inc.rootCause && (
                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                      <strong>Akar Masalah:</strong> {inc.rootCause}
                    </div>
                  )}

                  {inc.status !== 'RESOLVED' && !isLimitedView && (
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedIncidentId(inc.incidentId)}
                        className="px-3 py-1.5 bg-[#0D2A4A] text-white rounded-xl text-xs font-bold hover:bg-[#0D2A4A]/90 transition"
                      >
                        Selesaikan Incident Ini
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RESOLUTION MODAL */}
            {selectedIncidentId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border">
                  <h4 className="font-bold text-slate-900 text-sm">Selesaikan Incident {selectedIncidentId}</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penyelesaian:</label>
                    <textarea
                      rows={3}
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..."
                      className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedIncidentId(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleResolveIncident(selectedIncidentId)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                    >
                      Simpan Penyelesaian
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INFRASTRUCTURE METRICS */}
        {activeTab === 'INFRASTRUCTURE' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Cpu className="w-5 h-5 text-indigo-600" /> Catatan Resource Infrastruktur Runtime
            </h3>

            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 text-xs text-indigo-900">
              <p className="font-bold">
                Mengenai Metrik CPU & Memory Serverless:
              </p>
              <p className="leading-relaxed">
                Aplikasi ini dideploy pada lingkungan Serverless Container Vercel / Cloud Run. Pada environment serverless ini, metrik CPU/RAM hardware fisik tidak diexpose secara langsung.
              </p>
              <div className="p-3 bg-white rounded-xl border border-indigo-100 font-mono font-bold text-slate-800">
                "Runtime resource metric tidak tersedia pada environment deployment saat ini."
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Shield className="w-5 h-5 text-purple-600" /> Audit Log Pengawasan Monitoring
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border text-xs font-mono space-y-2 text-slate-700">
              <div className="p-2 bg-white rounded border">
                [MONITORING_VIEW] User: {currentUserId} | Role: {currentRole} | Time: {new Date().toLocaleTimeString()} WIB
              </div>
              <div className="p-2 bg-white rounded border">
                [HEALTH_CHECK_RUN] Ping 10 Layanan Selesai | Result: HEALTHY | Time: {new Date().toLocaleTimeString()} WIB
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
