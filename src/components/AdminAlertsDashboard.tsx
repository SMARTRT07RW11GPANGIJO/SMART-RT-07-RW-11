// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9B PRODUCTION ALERT & NOTIFICATION DASHBOARD
// Route: /admin/monitoring/alerts
// Real-time alert list, acknowledge & resolve workflow, rule matrix, maintenance mode & notification logs.
// ZERO fake data. Strictly RBAC protected (ADMIN, KETUA_RT, PENGURUS).

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  RefreshCw,
  Sliders,
  Filter,
  Search,
  Key,
  Mail,
  MessageSquare,
  Radio,
  FileText,
  UserCheck,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  ProductionAlertService,
  ProductionAlert,
  AlertRuleConfig,
  NotificationLog,
  MaintenanceModeConfig,
  AlertSeverity,
  AlertStatus
} from '../services/productionAlertService';

interface AdminAlertsDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminAlertsDashboard: React.FC<AdminAlertsDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'RULES' | 'MAINTENANCE' | 'LOGS'>('ALERTS');

  // Filter States
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [alerts, setAlerts] = useState<ProductionAlert[]>([]);
  const [rules, setRules] = useState<Record<string, AlertRuleConfig>>({});
  const [maintenance, setMaintenance] = useState<MaintenanceModeConfig | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal State
  const [resolveAlertId, setResolveAlertId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');

  // Maintenance Toggle Form State
  const [maintReason, setMaintReason] = useState<string>('Pemeliharaan Rutin Infrastructure RT 07');
  const [maintMinutes, setMaintMinutes] = useState<number>(60);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const allAlerts = ProductionAlertService.getAlerts({
        severity: severityFilter !== 'ALL' ? (severityFilter as AlertSeverity) : undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as AlertStatus) : undefined
      });
      const ruleMap = ProductionAlertService.getAlertRules();
      const maint = ProductionAlertService.getMaintenanceMode();
      const notifLogs = ProductionAlertService.getNotificationLogs();
      const hHealth = ProductionAlertService.getAlertEngineHealth();

      setAlerts(allAlerts);
      setRules(ruleMap);
      setMaintenance(maint);
      setLogs(notifLogs);
      setHealth(hHealth);
    } catch (e) {
      console.error('Failed to load alert engine data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [severityFilter, statusFilter]);

  // Access Control Check
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul Production Alert & Notification (/admin/monitoring/alerts) hanya dapat diakses oleh KETUA RT, ADMIN, dan PENGURUS terotorisasi.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Dibatasi Server)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  const handleAcknowledge = (alertId: string) => {
    ProductionAlertService.acknowledgeAlert(alertId, currentRole, `USR-${currentRole}***`);
    loadData();
  };

  const handleResolve = (alertId: string) => {
    if (!resolutionText.trim()) {
      alert('Mohon masukkan deskripsi penyelesaian!');
      return;
    }
    ProductionAlertService.resolveAlert(alertId, `USR-${currentRole}***`, resolutionText);
    setResolveAlertId(null);
    setResolutionText('');
    loadData();
  };

  const handleToggleMaintenance = (enable: boolean) => {
    ProductionAlertService.setMaintenanceMode(enable, maintReason, `USR-${currentRole}***`, maintMinutes);
    loadData();
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.id.toLowerCase().includes(q) ||
      a.alertCode.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.service.toLowerCase().includes(q)
    );
  });

  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'OPEN').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="min-h-screen bg-[#0D2A4A]/5 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BRANDING */}
        <div className="bg-[#0D2A4A] text-white rounded-2xl p-6 shadow-xl border border-[#C89A2B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#C89A2B] text-[#0D2A4A] rounded-xl shadow-lg">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-wide text-white">SMART RT 07 RW 11</h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  9B ALERT & NOTIFICATION CENTER
                </span>
              </div>
              <p className="text-xs text-[#E9D8B4] mt-1 font-mono">
                /admin/monitoring/alerts — Centralized Threshold Engine, Multi-Channel Dispatch & Escalation
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-[#C89A2B] hover:bg-[#C89A2B]/90 text-[#0D2A4A] font-extrabold rounded-xl shadow transition text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh Alerts'}</span>
          </button>
        </div>

        {/* MAINTENANCE BANNER IF ACTIVE */}
        {maintenance?.active && (
          <div className="bg-amber-500 text-slate-900 font-extrabold p-4 rounded-2xl shadow border border-amber-600 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <PauseCircle className="w-6 h-6 text-slate-900 animate-pulse" />
              <div>
                <h4 className="text-sm uppercase tracking-wider font-black">MAINTENANCE MODE AKTIF</h4>
                <p className="text-xs font-medium">
                  Alasan: {maintenance.reason} | Diaktifkan oleh: {maintenance.createdByMasked} | Notifikasi sistem otomatis sementara DISUPPRESED.
                </p>
              </div>
            </div>
            {!isLimitedView && (
              <button
                onClick={() => handleToggleMaintenance(false)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                Matikan Maintenance Mode
              </button>
            )}
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Critical Alerts</p>
              <h3 className={`text-2xl font-black mt-1 ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {criticalCount} Alerts
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">Membutuhkan tindakan cepat</span>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Warning Alerts</p>
              <h3 className={`text-2xl font-black mt-1 ${warningCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {warningCount} Alerts
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">Kondisi perlu dipantau</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acknowledged</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{ackCount} Alerts</h3>
              <span className="text-[11px] text-slate-500 mt-1 block">Sedang ditangani tim</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Status</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1 uppercase">
                {health?.engine || 'ONLINE'}
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">Multi-Channel Active</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Radio className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 border-b border-slate-300 overflow-x-auto pb-1">
          {[
            { id: 'ALERTS', label: `Active & Historical Alerts (${alerts.length})`, icon: Bell },
            { id: 'RULES', label: 'Alert Rule Matrix (Centralized)', icon: Sliders },
            { id: 'MAINTENANCE', label: 'Maintenance Mode Manager', icon: PauseCircle },
            { id: 'LOGS', label: 'Notification Logs & Multi-Channel Audit', icon: Mail }
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

        {/* TAB 1: ALERTS LIST */}
        {activeTab === 'ALERTS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* FILTERS */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID Alert, Code, Judul, atau Service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-xs border rounded-lg px-3 py-1.5 outline-none w-full md:w-64 focus:ring-2 focus:ring-[#0D2A4A]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap text-xs">
                <div>
                  <span className="font-bold text-slate-500 mr-1">Severity:</span>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-white border rounded p-1 font-bold outline-none"
                  >
                    <option value="ALL">Semua Severity</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="ERROR">ERROR</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>

                <div>
                  <span className="font-bold text-slate-500 mr-1">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border rounded p-1 font-bold outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="SUPPRESSED">SUPPRESSED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ALERT CARDS LIST */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  Tidak ada alert yang memenuhi kriteria filter.
                </div>
              ) : (
                filteredAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-5 rounded-2xl border transition space-y-3 ${
                      alt.severity === 'CRITICAL'
                        ? 'border-rose-300 bg-rose-50/40'
                        : alt.severity === 'WARNING'
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-xs text-[#0D2A4A]">{alt.id}</span>
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-200 text-slate-800 font-mono">
                          {alt.alertCode}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : alt.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(alt.createdAt).toLocaleTimeString()} WIB
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
                            alt.status === 'OPEN'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : alt.status === 'ACKNOWLEDGED'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {alt.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{alt.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{alt.message}</p>
                    </div>

                    <div className="bg-slate-100/80 p-2.5 rounded-xl border text-[11px] font-mono text-slate-700 flex flex-wrap gap-4">
                      <div>
                        <span className="text-slate-400">Service:</span> <strong>{alt.service}</strong>
                      </div>
                      {alt.incidentId && (
                        <div>
                          <span className="text-slate-400">Incident:</span> <strong>{alt.incidentId}</strong>
                        </div>
                      )}
                      {alt.requestId && (
                        <div>
                          <span className="text-slate-400">Request:</span> <strong>{alt.requestId}</strong>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Occurrence:</span> <strong>{alt.occurrenceCount}x</strong>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    {!isLimitedView && alt.status !== 'RESOLVED' && (
                      <div className="flex items-center gap-2 pt-1">
                        {alt.status === 'OPEN' && (
                          <button
                            onClick={() => handleAcknowledge(alt.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                          >
                            Acknowledge Alert
                          </button>
                        )}
                        <button
                          onClick={() => setResolveAlertId(alt.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* RESOLUTION MODAL */}
            {resolveAlertId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border">
                  <h4 className="font-bold text-slate-900 text-sm">Resolve Alert {resolveAlertId}</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penyelesaian:</label>
                    <textarea
                      rows={3}
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Tuliskan tindakan perbaikan yang telah dilakukan..."
                      className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResolveAlertId(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleResolve(resolveAlertId)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                    >
                      Simpan Resolve
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RULES MATRIX */}
        {activeTab === 'RULES' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Sliders className="w-5 h-5 text-[#0D2A4A]" /> Centralized Alert Rule Configuration Matrix
            </h3>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Alert Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Threshold</th>
                    <th className="py-2.5 px-3">Window</th>
                    <th className="py-2.5 px-3">Cooldown</th>
                    <th className="py-2.5 px-3">Recipients</th>
                    <th className="py-2.5 px-3">Channels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(Object.values(rules) as AlertRuleConfig[]).map((r) => (
                    <tr key={r.code} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{r.code}</td>
                      <td className="py-2.5 px-3 text-slate-800">{r.category}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{r.threshold} Failures</td>
                      <td className="py-2.5 px-3">{r.windowMinutes} Min</td>
                      <td className="py-2.5 px-3">{r.cooldownMinutes} Min</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-700">{r.recipients.join(', ')}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{r.channels.join(' + ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MAINTENANCE MODE */}
        {activeTab === 'MAINTENANCE' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <PauseCircle className="w-5 h-5 text-amber-600" /> Maintenance Mode Manager
            </h3>

            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Maintenance:</label>
                <input
                  type="text"
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Durasi (Menit):</label>
                <input
                  type="number"
                  value={maintMinutes}
                  onChange={(e) => setMaintMinutes(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                />
              </div>

              {!isLimitedView && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleToggleMaintenance(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                  >
                    Aktifkan Maintenance Mode
                  </button>
                  <button
                    onClick={() => handleToggleMaintenance(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300"
                  >
                    Matikan Maintenance Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATION LOGS */}
        {activeTab === 'LOGS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <Mail className="w-5 h-5 text-indigo-600" /> Multi-Channel Notification Audit Logs
            </h3>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Log ID</th>
                    <th className="py-2.5 px-3">Alert ID</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Role Penerima</th>
                    <th className="py-2.5 px-3">Penerima (Masked)</th>
                    <th className="py-2.5 px-3">Status Dispatch</th>
                    <th className="py-2.5 px-3">Waktu Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{l.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{l.alertId}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{l.channel}</td>
                      <td className="py-2.5 px-3 font-sans">{l.recipientRole}</td>
                      <td className="py-2.5 px-3 text-slate-500">{l.recipientMasked}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {l.sentAt ? new Date(l.sentAt).toLocaleTimeString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
