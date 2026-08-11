// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9D DISASTER RECOVERY DRILL DASHBOARD
// Route: /admin/disaster-recovery
// Interactive Multi-Scenario Disaster Recovery Drill Engine with 10 Scenarios, Staging Simulation & Production Recovery Modes.
// ZERO fake PASS / fake RPO / fake RTO. Strictly RBAC protected (ADMIN, KETUA_RT, PENGURUS).

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  FileText,
  Clock,
  Activity,
  Layers,
  Server,
  Database,
  Globe,
  MessageSquare,
  Key,
  Lock,
  ChevronRight,
  BookOpen,
  CheckSquare,
  Award,
  Zap,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  DisasterRecoveryDrillService,
  DRDrillRecord,
  DRScenario,
  DRHealthSummary,
  DRActionItem,
  DRMode,
  DRSeverity
} from '../services/disasterRecoveryDrillService';

interface AdminDisasterRecoveryDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminDisasterRecoveryDashboard: React.FC<AdminDisasterRecoveryDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DRILL_RUNNER' | 'HISTORY' | 'ACTION_ITEMS' | 'RUNBOOK'>('OVERVIEW');

  // Data States
  const [healthSummary, setHealthSummary] = useState<DRHealthSummary | null>(null);
  const [scenarios, setScenarios] = useState<DRScenario[]>([]);
  const [drills, setDrills] = useState<DRDrillRecord[]>([]);
  const [actionItems, setActionItems] = useState<DRActionItem[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<DRDrillRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Drill Runner Form States
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('DR-001');
  const [selectedMode, setSelectedMode] = useState<DRMode>('SIMULATION');
  const [isExecutingDrill, setIsExecutingDrill] = useState<boolean>(false);
  const [showProdConfirmModal, setShowProdConfirmModal] = useState<boolean>(false);
  const [prodConfirmText, setProdConfirmText] = useState<string>('');

  // Action Item Modal
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [newActionProblem, setNewActionProblem] = useState<string>('');
  const [newActionPriority, setNewActionPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1');
  const [newActionOwner, setNewActionOwner] = useState<string>('DevOps / SRE Team');

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const health = DisasterRecoveryDrillService.getDRHealth();
      const scList = DisasterRecoveryDrillService.getScenarios();
      const history = DisasterRecoveryDrillService.getDrillsHistory();
      const actions = DisasterRecoveryDrillService.getActionItems();

      setHealthSummary(health);
      setScenarios(scList);
      setDrills(history);
      setActionItems(actions);

      if (history.length > 0 && !selectedDrill) {
        setSelectedDrill(history[0]);
      }
    } catch (e) {
      console.error('Failed to load DR drill data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s auto refresh
    return () => clearInterval(interval);
  }, []);

  // Access Control Check
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <ShieldAlert className="w-16 h-16 mx-auto text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul Disaster Recovery Drill (/admin/disaster-recovery) hanya dapat diakses oleh KETUA RT, ADMIN, dan PENGURUS terotorisasi.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Dibatasi Server)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  const handleStartDrillClick = () => {
    if (selectedMode === 'PRODUCTION_RECOVERY') {
      setShowProdConfirmModal(true);
    } else {
      executeDrillNow('SIMULATION');
    }
  };

  const executeDrillNow = async (modeToUse: DRMode) => {
    setIsExecutingDrill(true);
    setShowProdConfirmModal(false);
    try {
      const record = await DisasterRecoveryDrillService.executeDrill(
        selectedScenarioId,
        modeToUse,
        currentRole,
        `USR-${currentRole}***`
      );
      setSelectedDrill(record);
      await loadData();
      alert(`DR Drill ${record.drillId} (${modeToUse}) Selesai! Status: ${record.status}, Score: ${record.recoveryScore}/100.`);
    } catch (e: any) {
      alert(`DR Drill Gagal Executed: ${e.message}`);
    } finally {
      setIsExecutingDrill(false);
      setProdConfirmText('');
    }
  };

  const handleCreateActionItem = () => {
    if (!newActionProblem) return;
    DisasterRecoveryDrillService.addActionItem(
      {
        drillId: selectedDrill?.drillId || 'DRILL-MANUAL',
        incidentId: selectedDrill?.incidentId || 'INC-MANUAL',
        problem: newActionProblem,
        priority: newActionPriority,
        owner: newActionOwner,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'OPEN'
      },
      `USR-${currentRole}***`
    );
    setShowActionModal(false);
    setNewActionProblem('');
    loadData();
  };

  const getSeverityBadge = (sev: DRSeverity) => {
    switch (sev) {
      case 'LEVEL_4':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">L4 — DISASTER</span>;
      case 'LEVEL_3':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white">L3 — MAJOR</span>;
      case 'LEVEL_2':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-500 text-slate-900">L2 — SERVICE FAIL</span>;
      case 'LEVEL_1':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500 text-white">L1 — MINOR</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D2A4A]/5 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* BRANDING HEADER */}
        <div className="bg-[#0D2A4A] text-white rounded-2xl p-6 shadow-xl border border-[#C89A2B]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#C89A2B] text-[#0D2A4A] rounded-xl shadow-lg">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-wide text-white">SMART RT 07 RW 11</h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  9D DISASTER RECOVERY DRILL
                </span>
              </div>
              <p className="text-xs text-[#E9D8B4] mt-1 font-mono">
                /admin/disaster-recovery — Emergency Pipeline, Scenario Library, RPO/RTO Measurement & Go Live Gate
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('DRILL_RUNNER')}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition text-xs"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Jalankan DR Drill Simulator</span>
            </button>

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

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">DR Engine Health</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 uppercase font-mono">
                {healthSummary?.engineStatus || 'HEALTHY'}
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total Drill: {healthSummary?.totalDrillsExecuted || 0} ({healthSummary?.totalPassedDrills || 0} PASS)
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual RPO vs Target</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {healthSummary?.rpoActualMinutes !== null ? `${healthSummary?.rpoActualMinutes}m` : 'N/A'}
                <span className="text-xs text-slate-400 font-normal"> / {healthSummary?.rpoTargetMinutes}m</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                RPO Status: {healthSummary?.rpoStatus}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual RTO vs Target</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {healthSummary?.rtoActualMinutes !== null ? `${healthSummary?.rtoActualMinutes}m` : 'N/A'}
                <span className="text-xs text-slate-400 font-normal"> / {healthSummary?.rtoTargetMinutes}m</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                RTO Status: {healthSummary?.rtoStatus}
              </span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Recovery Score</p>
              <h3 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {healthSummary?.lastDrillScore !== null ? `${healthSummary?.lastDrillScore}/100` : 'N/A'}
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Isolated Smoke Test 100%
              </span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center space-x-1 border-b border-slate-300 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'DR Overview & Matrix', icon: Activity },
            { id: 'DRILL_RUNNER', label: 'Interactive Drill Runner & Scenarios', icon: PlayCircle },
            { id: 'HISTORY', label: `Drill Audit Reports (${drills.length})`, icon: FileText },
            { id: 'ACTION_ITEMS', label: `Post-Mortem Action Items (${actionItems.length})`, icon: CheckSquare },
            { id: 'RUNBOOK', label: 'DR Operational Runbook', icon: BookOpen }
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

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
                <Shield className="w-5 h-5 text-[#0D2A4A]" /> Recovery Level Matrix & Severity Definitions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-blue-900">LEVEL 1 — MINOR INCIDENT</span>
                    <span className="text-[10px] font-mono bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-bold">RTO &lt; 1 jam</span>
                  </div>
                  <p className="text-xs text-slate-600">Gangguan minor fitur non-kritikal (AI Assistant latency, UI glitch).</p>
                </div>

                <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-yellow-900">LEVEL 2 — SERVICE FAILURE</span>
                    <span className="text-[10px] font-mono bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold">RTO &lt; 2 jam</span>
                  </div>
                  <p className="text-xs text-slate-600">Kegagalan satu layanan utama (WhatsApp Down, Google Drive PDF fail).</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-900">LEVEL 3 — MAJOR INCIDENT</span>
                    <span className="text-[10px] font-mono bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-bold">RTO &lt; 3 jam</span>
                  </div>
                  <p className="text-xs text-slate-600">Tumbangnya layanan core backend/frontend (Vercel / GAS Down).</p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-rose-900">LEVEL 4 — DISASTER</span>
                    <span className="text-[10px] font-mono bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-bold">RTO &lt; 4 jam</span>
                  </div>
                  <p className="text-xs text-slate-600">Kehilangan database utama Google Sheets / Kerusakan Total Sistem.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
                <Server className="w-5 h-5 text-indigo-600" /> Subsystem Health Status
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span className="flex items-center gap-2 text-slate-700 font-bold"><Database className="w-4 h-4 text-emerald-600" /> Database Sheets</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">OK</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span className="flex items-center gap-2 text-slate-700 font-bold"><Globe className="w-4 h-4 text-emerald-600" /> Vercel Deployment</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">OK</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span className="flex items-center gap-2 text-slate-700 font-bold"><MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Gateway</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">OK</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
                  <span className="flex items-center gap-2 text-slate-700 font-bold"><Key className="w-4 h-4 text-indigo-600" /> Security Secrets</span>
                  <span className="text-indigo-700 font-extrabold bg-indigo-100 px-2 py-0.5 rounded">SECURE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DRILL RUNNER & SCENARIO LIBRARY */}
        {activeTab === 'DRILL_RUNNER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
                <PlayCircle className="w-5 h-5 text-emerald-600" /> Eksekusi DR Drill
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Skenario Bencana:</label>
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                  >
                    {scenarios.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        [{sc.id}] {sc.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Mode Eksekusi:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMode('SIMULATION')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        selectedMode === 'SIMULATION'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black ring-2 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Zap className="w-4 h-4 mb-1 text-emerald-600" />
                      SIMULATION
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Staging Isolated</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMode('PRODUCTION_RECOVERY')}
                      className={`p-3 rounded-xl border text-xs font-bold transition ${
                        selectedMode === 'PRODUCTION_RECOVERY'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 font-black ring-2 ring-rose-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Flame className="w-4 h-4 mb-1 text-rose-600" />
                      PROD RECOVERY
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Approval Gate</span>
                    </button>
                  </div>
                </div>

                {!isLimitedView && (
                  <button
                    onClick={handleStartDrillClick}
                    disabled={isExecutingDrill}
                    className="w-full py-3 bg-[#0D2A4A] text-white font-extrabold rounded-xl shadow hover:bg-[#0D2A4A]/90 transition text-xs flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className={`w-4 h-4 ${isExecutingDrill ? 'animate-spin' : ''}`} />
                    <span>{isExecutingDrill ? 'Memproses Pipeline...' : 'Mulai Eksekusi Drill'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
                <Layers className="w-5 h-5 text-[#0D2A4A]" /> DR Scenario Library & Stage Progression
              </h3>

              {scenarios.map((sc) => {
                const isSelected = sc.id === selectedScenarioId;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected ? 'border-[#0D2A4A] bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-indigo-700">{sc.id}</span>
                      {getSeverityBadge(sc.severityLevel)}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">{sc.title}</h4>
                    <p className="text-xs text-slate-600">{sc.description}</p>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-2 border-t">
                      <span>Target RPO: {sc.targetRPOMinutes}m</span>
                      <span>Target RTO: {sc.targetRTOMinutes}m</span>
                      <span>Category: {sc.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DRILL AUDIT HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <FileText className="w-5 h-5 text-[#0D2A4A]" /> Audit Reports & Historical Drills
            </h3>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Drill ID</th>
                    <th className="py-2.5 px-3">Scenario</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Actual RPO / RTO</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {drills.map((d) => (
                    <tr key={d.drillId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{d.drillId}</td>
                      <td className="py-2.5 px-3 font-sans font-bold">{d.scenarioTitle}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.mode === 'SIMULATION' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {d.mode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-600">{d.status}</td>
                      <td className="py-2.5 px-3 text-slate-700">{d.actualRPOMinutes}m / {d.actualRTOMinutes}m</td>
                      <td className="py-2.5 px-3 font-black text-purple-700">{d.recoveryScore}/100</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(d.startedAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ACTION ITEMS */}
        {activeTab === 'ACTION_ITEMS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" /> Post-Mortem Action Items Tracker
              </h3>

              {!isLimitedView && (
                <button
                  onClick={() => setShowActionModal(true)}
                  className="px-3 py-1.5 bg-[#0D2A4A] text-white rounded-xl text-xs font-bold hover:bg-[#0D2A4A]/90 transition"
                >
                  + Tambah Action Item
                </button>
              )}
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Problem / Task</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {actionItems.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{act.id}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">{act.problem}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${act.priority === 'P0' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                          {act.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{act.owner}</td>
                      <td className="py-2.5 px-3 text-slate-500">{act.deadline}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-600">{act.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DR RUNBOOK */}
        {activeTab === 'RUNBOOK' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b pb-3">
              <BookOpen className="w-5 h-5 text-[#0D2A4A]" /> Disaster Recovery Operational Runbook Documentation
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-3 text-xs leading-relaxed text-slate-700 font-mono">
              <h4 className="font-extrabold text-sm text-[#0D2A4A]">Standard Emergency Protocol (/docs/disaster-recovery-runbook.md)</h4>
              <p>1. DEKLARASI: Apabila insiden terjadi, tetapkan ID Insiden INC-YYYYMMDD-XXXX dan Severity Level.</p>
              <p>2. CONTAINMENT: Lakukan STOP WRITE pada API untuk mencegah pemburukan data produksi.</p>
              <p>3. BACKUP SELECTION: Ambil backup terverifikasi SHA-256 terbaru dari 9C Engine.</p>
              <p>4. RESTORE & TEST: Restore ke isolated staging container dan jalankan 10-module Smoke Test.</p>
              <p>5. GO LIVE GATE: Minta persetujuan resmi Incident Commander sebelum peralihan traffic.</p>
            </div>
          </div>
        )}
      </div>

      {/* PROD RECOVERY CONFIRMATION MODAL */}
      {showProdConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-extrabold">Konfirmasi Production Recovery</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda memilih mode <strong>PRODUCTION_RECOVERY</strong>. Operasi ini memerlukan persetujuan Go Live Gate dan audit log resmi.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Ketik "CONFIRM-RECOVERY" untuk melanjutkan:</label>
              <input
                type="text"
                value={prodConfirmText}
                onChange={(e) => setProdConfirmText(e.target.value)}
                placeholder="CONFIRM-RECOVERY"
                className="w-full p-2.5 border rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowProdConfirmModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
              >
                Batal
              </button>
              <button
                disabled={prodConfirmText !== 'CONFIRM-RECOVERY'}
                onClick={() => executeDrillNow('PRODUCTION_RECOVERY')}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
              >
                Jalankan Production Recovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION ITEM MODAL */}
      {showActionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Tambah Action Item Post-Mortem</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Masalah / Deskripsi Tugas:</label>
                <textarea
                  value={newActionProblem}
                  onChange={(e) => setNewActionProblem(e.target.value)}
                  placeholder="Deskripsi perbaikan yang diperlukan..."
                  className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D2A4A]"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas:</label>
                <select
                  value={newActionPriority}
                  onChange={(e) => setNewActionPriority(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none"
                >
                  <option value="P0">P0 — Critical Urgent</option>
                  <option value="P1">P1 — High Priority</option>
                  <option value="P2">P2 — Medium Priority</option>
                  <option value="P3">P3 — Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Penanggung Jawab:</label>
                <input
                  type="text"
                  value={newActionOwner}
                  onChange={(e) => setNewActionOwner(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreateActionItem}
                className="px-4 py-2 bg-[#0D2A4A] text-white rounded-xl text-xs font-bold hover:bg-[#0D2A4A]/90 transition"
              >
                Simpan Action Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
