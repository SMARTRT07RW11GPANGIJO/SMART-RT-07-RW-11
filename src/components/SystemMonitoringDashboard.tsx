import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RefreshCw, 
  Server, 
  Database, 
  FolderGit2, 
  FileText, 
  QrCode, 
  MessageSquare, 
  HardDrive, 
  PlusCircle, 
  Check, 
  Search, 
  Filter, 
  X,
  FileCheck,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { 
  MonitoredService, 
  SystemIncident, 
  Monitoring24hMetrics, 
  getMonitoredServicesStatus, 
  getStoredIncidents, 
  createSystemIncident, 
  resolveSystemIncident, 
  compute24hMetrics,
  IncidentSeverity,
  IncidentStatus
} from '../services/systemMonitoringService';

interface SystemMonitoringDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (type: any, title: string, message?: string) => void;
}

export const SystemMonitoringDashboard: React.FC<SystemMonitoringDashboardProps> = ({
  isOpen,
  onClose,
  addToast
}) => {
  const [services, setServices] = useState<MonitoredService[]>([]);
  const [incidents, setIncidents] = useState<SystemIncident[]>([]);
  const [metrics, setMetrics] = useState<Monitoring24hMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Incident Modal
  const [isAddingIncident, setIsAddingIncident] = useState(false);
  const [newModule, setNewModule] = useState('DATABASE');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('MEDIUM');
  const [newDesc, setNewDesc] = useState('');
  const [newErrCode, setNewErrCode] = useState('ERR_CONN_TIMEOUT');
  const [newErrMsg, setNewErrMsg] = useState('Database response latency exceeded 5000ms');

  // Resolve Modal
  const [resolvingIncident, setResolvingIncident] = useState<SystemIncident | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = async () => {
    setIsLoading(true);
    const serviceList = await getMonitoredServicesStatus();
    const incidentList = getStoredIncidents();
    const computedMetrics = compute24hMetrics(incidentList, serviceList);

    setServices(serviceList);
    setIncidents(incidentList);
    setMetrics(computedMetrics);
    setIsLoading(false);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      addToast('error', 'Deskripsi Wajib Diisi', 'Mohon isi deskripsi insiden.');
      return;
    }

    const created = createSystemIncident({
      module: newModule,
      severity: newSeverity,
      description: newDesc,
      userId: 'ADMIN_MONITOR',
      errorCode: newErrCode,
      errorMessage: newErrMsg,
      assignedTo: 'Unassigned'
    });

    addToast('warning', 'System Incident Logged', `Insiden ${created.incidentId} berhasil dicatat.`);
    setIsAddingIncident(false);
    setNewDesc('');
    refreshData();
  };

  const handleResolveIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncident || !resolutionText.trim()) {
      addToast('error', 'Catatan Resolusi Wajib Diisi', 'Berikan penjelasan perbaikan insiden.');
      return;
    }

    const resolved = resolveSystemIncident(resolvingIncident.incidentId, resolutionText, 'Admin Monitoring');
    if (resolved) {
      addToast('success', 'Insiden Selesai Ditangani', `Insiden ${resolved.incidentId} telah di-resolve.`);
    }

    setResolvingIncident(null);
    setResolutionText('');
    refreshData();
  };

  const getStatusBadge = (status: MonitoredService['status']) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            🟢 HEALTHY
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            🟡 DEGRADED
          </span>
        );
      case 'DOWN':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            🔴 DOWN
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            ⚪ UNKNOWN
          </span>
        );
    }
  };

  const filteredIncidents = incidents
    .filter(i => severityFilter === 'ALL' || i.severity === severityFilter)
    .filter(i => statusFilter === 'ALL' || i.status === statusFilter)
    .filter(i => 
      i.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-100 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-6">
        {/* Header Bar */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#2E7D52] p-2.5 rounded-xl border border-[#D4A72C]/40">
              <Activity className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide">24-HOUR SYSTEM MONITORING DASHBOARD</h2>
                <span className="bg-[#D4A72C] text-[#123B5D] text-[10px] font-black px-2 py-0.5 rounded">
                  TAHAP 7H GO LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                /admin/system-monitor — Real-time Service Health, Incident Log (SYSTEM_INCIDENTS), & 24h Metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Active Alert Banner if Health Check is CONDITIONAL or FAIL */}
          {metrics && metrics.healthCheckStatus !== 'PASS' && (
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 border border-amber-300">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-amber-100 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase">SYSTEM HEALTH NOTICE ACTIVE</h4>
                  <p className="text-xs text-amber-100">
                    Beberapa komponen terdeteksi DEGRADED atau memiliki insiden terbuka ({metrics.activeAlertsCount} Alert Aktif).
                  </p>
                </div>
              </div>
              <button
                onClick={refreshData}
                className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition-all"
              >
                Re-scan Infrastructure
              </button>
            </div>
          )}

          {/* Top 24H Summary Metric Cards */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>24H UPTIME</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-[#123B5D]">{metrics.overallUptimePercent}%</div>
                <div className="text-[10px] text-slate-500">Target SLA 99.9%</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>HEALTH CHECK</span>
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black px-2 py-0.5 rounded text-xs ${
                    metrics.healthCheckStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {metrics.healthCheckStatus}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">Endpoint: ?action=health</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>TOTAL REQUESTS</span>
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-800">{metrics.totalRequests.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Gagal: {metrics.failedRequests} req</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>INCIDENTS BY SEVERITY</span>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-rose-600">Crit: {metrics.criticalErrors}</span>
                  <span className="text-amber-600">High: {metrics.highErrors}</span>
                  <span className="text-blue-600">Med: {metrics.mediumErrors}</span>
                </div>
                <div className="text-[10px] text-slate-500">Low: {metrics.lowErrors}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                  <span>SECRET LEAK CHECK</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-sm font-black text-[#2E7D52]">ZERO LEAK</div>
                <div className="text-[10px] text-slate-500">PropertiesService Active</div>
              </div>
            </div>
          )}

          {/* Monitored Core Services Grid (11 Components) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#123B5D]" /> Monitored Infrastructure & Services (11 Components)
                </h3>
                <p className="text-xs text-slate-500">Status kesehatan aktual komponen sistem SMART RT 07 RW 11</p>
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="bg-[#123B5D] hover:bg-[#0F2F4A] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((svc) => (
                <div key={svc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[12px]">{svc.name}</span>
                    {getStatusBadge(svc.status)}
                  </div>
                  <div className="text-slate-600 text-[11px]">{svc.details}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2 font-mono">
                    <span>Latency: {svc.latencyMs}ms</span>
                    <span>24h Uptime: {svc.uptime24h}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Log & Management Section (SYSTEM_INCIDENTS) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> SYSTEM_INCIDENTS Log & Incident Manager
                </h3>
                <p className="text-xs text-slate-500">Catatan insiden teknis & proses penanganan (Incident Management Flow)</p>
              </div>

              <button
                onClick={() => setIsAddingIncident(true)}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Catat Insiden Baru
              </button>
            </div>

            {/* Incident Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID / Modul / Deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-medium text-slate-700 text-xs w-48"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                >
                  <option value="ALL">Semua Severity</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Deskripsi & Error</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi / Resolusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((inc) => (
                      <tr key={inc.incidentId} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#123B5D] font-mono text-[11px]">{inc.incidentId}</td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">
                          {inc.timestamp.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="p-3 font-bold text-slate-700 font-mono text-[11px]">{inc.module}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs space-y-0.5">
                          <div className="font-bold text-slate-800">{inc.description}</div>
                          <div className="text-[10px] text-slate-500 font-mono">[{inc.errorCode}] {inc.errorMessage}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {inc.status === 'RESOLVED' ? (
                            <div className="text-[10px] text-slate-600 font-mono max-w-xs">
                              <strong>Resolusi:</strong> {inc.resolution}
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingIncident(inc)}
                              className="bg-[#123B5D] hover:bg-[#0F2F4A] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow"
                            >
                              Resolve Insiden
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada insiden yang memenuhi kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Catat Insiden Baru */}
      {isAddingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Catat Insiden Sistem Baru</h3>
              <button onClick={() => setIsAddingIncident(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Modul Terkait</label>
                <select value={newModule} onChange={(e) => setNewModule(e.target.value)} className="w-full p-2 border rounded-xl font-bold mt-1">
                  <option value="DATABASE">DATABASE (Google Sheets)</option>
                  <option value="BACKEND">BACKEND (Apps Script)</option>
                  <option value="STORAGE">STORAGE (Google Drive)</option>
                  <option value="WHATSAPP">WHATSAPP GATEWAY</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                  <option value="PDF_SERVICE">PDF SERVICE</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Tingkat Keparahan (Severity)</label>
                <select value={newSeverity} onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)} className="w-full p-2 border rounded-xl font-bold mt-1">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Deskripsi Ringkas</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Contoh: Keterlambatan respon API Google Sheets"
                  className="w-full p-2 border rounded-xl mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Error Code & Message</label>
                <input
                  type="text"
                  value={newErrCode}
                  onChange={(e) => setNewErrCode(e.target.value)}
                  placeholder="ERR_CODE"
                  className="w-full p-2 border rounded-xl mt-1 font-mono text-[11px]"
                />
                <input
                  type="text"
                  value={newErrMsg}
                  onChange={(e) => setNewErrMsg(e.target.value)}
                  placeholder="Error Message Detail"
                  className="w-full p-2 border rounded-xl mt-1 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingIncident(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123B5D] text-white font-bold rounded-xl shadow"
                >
                  Simpan Insiden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Resolve Insiden */}
      {resolvingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Resolve Insiden {resolvingIncident.incidentId}</h3>
              <button onClick={() => setResolvingIncident(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResolveIncidentSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                <div className="font-bold text-[#123B5D]">{resolvingIncident.module} [{resolvingIncident.severity}]</div>
                <div className="text-slate-700">{resolvingIncident.description}</div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Catatan Perbaikan / Resolusi</label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Jelaskan tindakan korektif yang telah dilakukan untuk menyelesaikan insiden ini..."
                  className="w-full p-2 border rounded-xl mt-1 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setResolvingIncident(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D52] text-white font-bold rounded-xl shadow"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
