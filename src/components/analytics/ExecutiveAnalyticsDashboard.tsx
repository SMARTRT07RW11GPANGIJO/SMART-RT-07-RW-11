import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Users,
  Home,
  ShieldCheck,
  Building,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  History,
  FileCheck,
  ChevronRight,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { UserRole } from '../../types/rt';
import {
  ExecutiveAnalyticsOverview,
  ExecutiveReport,
  ReportType,
  AttentionItem,
  AnalyticsAuditLog
} from '../../types/analytics';
import { AnalyticsService, AnalyticsActorSession } from '../../services/analyticsService';
import { ExecutiveReportModal } from './ExecutiveReportModal';

interface ExecutiveAnalyticsDashboardProps {
  currentRole: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  isBackendConnected?: boolean;
}

const COLORS = {
  navy: '#123B5D',
  gold: '#D4A72C',
  green: '#2E7D52',
  red: '#C62828',
  sky: '#0284C7',
  amber: '#D97706',
  purple: '#7C3AED',
  slate: '#64748B'
};

const PIE_COLORS = ['#2E7D52', '#D4A72C', '#123B5D', '#0284C7', '#7C3AED'];

export const ExecutiveAnalyticsDashboard: React.FC<ExecutiveAnalyticsDashboardProps> = ({
  currentRole,
  currentUserId = 'USR-ANL',
  currentUserName = 'Pengurus RT 07',
  isBackendConnected = true
}) => {
  const [overview, setOverview] = useState<ExecutiveAnalyticsOverview | null>(null);
  const [reports, setReports] = useState<ExecutiveReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AnalyticsAuditLog[]>([]);
  const [selectedReport, setSelectedReport] = useState<ExecutiveReport | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'THIS_MONTH' | 'QUARTER' | 'YEAR'>('THIS_MONTH');
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'housing' | 'facilities' | 'reports'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const actor: AnalyticsActorSession = {
    userId: currentUserId,
    role: currentRole,
    nama: currentUserName,
    isBackendConnected
  };

  const loadData = () => {
    try {
      const service = AnalyticsService.getInstance();
      const ov = service.getExecutiveOverview(actor);
      setOverview(ov);
      const repList = service.getReports(actor);
      setReports(repList);
      if (['ADMIN', 'KETUA_RT'].includes(currentRole)) {
        const logs = service.getAuditLogs(actor);
        setAuditLogs(logs);
      }
    } catch (err: any) {
      console.warn('Analytics loading error:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole, currentUserId]);

  if (!overview) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500 animate-pulse">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">Memuat Data Analitik SMART RT 07...</p>
      </div>
    );
  }

  const handleGenerateReport = (type: ReportType) => {
    setIsGeneratingReport(true);
    try {
      const service = AnalyticsService.getInstance();
      const newRep = service.generateReport(actor, type);
      setReports((prev) => [newRep, ...prev]);
      setSelectedReport(newRep);
      setReportModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan laporan.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const service = AnalyticsService.getInstance();
      const csv = service.exportAnalyticsCSV(actor);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SMART_RT07_Analitik_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal mengekspor data CSV.');
    }
  };

  const housingPieData = [
    { name: 'Pemilik Tetap', value: overview.housing.pemilik },
    { name: 'Kontrak / Sewa', value: overview.housing.kontrak },
    { name: 'Penghuni Kos', value: overview.housing.kos }
  ].filter((d) => d.value > 0);

  const facilityConditionData = [
    { name: 'Kondisi Baik', value: overview.facilities.conditions.baik, color: '#2E7D52' },
    { name: 'Rusak Ringan', value: overview.facilities.conditions.rusakRingan, color: '#D4A72C' },
    { name: 'Rusak Sedang', value: overview.facilities.conditions.rusakSedang, color: '#D97706' },
    { name: 'Rusak Berat', value: overview.facilities.conditions.rusakBerat, color: '#C62828' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Executive Header */}
      <div className="bg-[#123B5D] text-white p-6 rounded-3xl shadow-lg border border-[#2E7D52] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C] shadow">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                EXECUTIVE ANALYTICS & LAPORAN OTOMATIS KETUA RT
              </h2>
              <span className="bg-[#2E7D52] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#D4A72C]">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Single Source of Truth • Real-Time Data Aggregation • PDP & RBAC Compliant
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['KETUA_RT', 'ADMIN', 'PENGURUS'].includes(currentRole) && (
            <button
              onClick={() => handleGenerateReport('MONTHLY')}
              disabled={isGeneratingReport}
              className="bg-[#D4A72C] hover:bg-[#c49826] text-[#123B5D] text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isGeneratingReport ? 'Menerbitkan...' : 'Terbitkan Laporan Bulanan'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {['ADMIN', 'KETUA_RT'].includes(currentRole) && (
            <button
              onClick={() => setAuditDrawerOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Log Audit ({auditLogs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#D4A72C]" />
          <span>Ringkasan Eksekutif</span>
        </button>

        <button
          onClick={() => setActiveTab('demographics')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'demographics'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#2E7D52]" />
          <span>Demografi & Usia</span>
        </button>

        <button
          onClick={() => setActiveTab('housing')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'housing'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-amber-600" />
          <span>Status Hunian & Blok</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'facilities'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-sky-600" />
          <span>Kesehatan Fasilitas</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>Arsip Laporan Resmi ({reports.length})</span>
        </button>
      </div>

      {/* Attention Required Banner (Prioritas Ketua RT) */}
      {overview.attentionItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Perhatian Manajerial Ketua RT ({overview.attentionItems.length} Tindak Lanjut)
                </h4>
                <p className="text-[11px] text-amber-800">
                  Poin prioritas yang dihasilkan secara otomatis oleh Attention Required Engine.
                </p>
              </div>
            </div>
            <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full">
              {overview.kpis.urgentAttentionCount} Mendesak
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {overview.attentionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1.5 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      item.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : item.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[9px] text-slate-400">{item.source}</span>
                </div>
                <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
                <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-medium">
                  <strong>Saran:</strong> {item.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <Users className="w-4 h-4 text-[#123B5D]" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  100% Aktif
                </span>
              </div>
              <span className="text-2xl font-black text-[#123B5D] block">{overview.demographics.totalWarga}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Warga (Jiwa)</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <Home className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  ~{overview.family.averageMembersPerKK} org/KK
                </span>
              </div>
              <span className="text-2xl font-black text-amber-700 block">{overview.family.totalKK}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Kartu Keluarga</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#2E7D52]" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  SSoT Valid
                </span>
              </div>
              <span className="text-2xl font-black text-[#2E7D52] block">
                {overview.completeness.completenessScorePercent}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Kelengkapan Data</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <Building className="w-4 h-4 text-sky-600" />
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                  {overview.facilities.conditions.baik}/{overview.facilities.totalFacilities} Prima
                </span>
              </div>
              <span className="text-2xl font-black text-sky-700 block">
                {overview.facilities.conditionScorePercent}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Kesehatan Fasilitas</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {overview.activities.completed} Selesai
                </span>
              </div>
              <span className="text-2xl font-black text-purple-700 block">
                {overview.activities.activityRateScore}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Keaktifan Kegiatan</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                  Tindak Lanjut
                </span>
              </div>
              <span className="text-2xl font-black text-red-700 block">
                {overview.attentionItems.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Poin Perhatian</span>
            </div>
          </div>

          {/* Core Analytics Visuals (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Demographic Distribution Bar Chart */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                    Piramida Kelompok Usia Warga RT 07
                  </h4>
                  <p className="text-[11px] text-slate-500">Distribusi laki-laki dan perempuan per kelompok umur</p>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  Total: {overview.demographics.totalWarga} Jiwa
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.demographics.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, color: '#fff', fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="male" name="Laki-Laki" fill="#123B5D" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="female" name="Perempuan" fill="#2E7D52" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Housing Status Breakdown Pie */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                    Komposisi Status Hunian
                  </h4>
                  <p className="text-[11px] text-slate-500">Milik sendiri, kontrak/sewa, dan penghuni kos</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  {overview.housing.totalHunian} Unit Hunian
                </span>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={housingPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {housingPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, color: '#fff', fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Pemilik Tetap</span>
                  <span className="text-xs font-black text-[#2E7D52]">{overview.housing.pemilik} ({overview.housing.percentagePemilik}%)</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Kontrak / Sewa</span>
                  <span className="text-xs font-black text-amber-600">{overview.housing.kontrak} ({overview.housing.percentageKontrak}%)</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Penghuni Kos</span>
                  <span className="text-xs font-black text-[#123B5D]">{overview.housing.kos} ({overview.housing.percentageKos}%)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Reports Generator & Quick Stats */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Pusat Penerbitan Laporan Resmi Otomatis
                </h4>
                <p className="text-xs text-slate-600">
                  Diterbitkan dengan Nomor Registrasi Unik, QR Verifikasi, dan Format Standar Cetak A4.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenerateReport('WEEKLY')}
                className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 transition-all shadow-2xs"
              >
                Laporan Mingguan
              </button>
              <button
                onClick={() => handleGenerateReport('MONTHLY')}
                className="bg-[#123B5D] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                Laporan Bulanan
              </button>
              <button
                onClick={() => handleGenerateReport('QUARTERLY')}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                Laporan Triwulan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEMOGRAPHICS */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                Detail Kelompok Umur & Distribusi Gender
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Kelompok Usia</th>
                      <th className="px-4 py-3 text-center">Laki-Laki</th>
                      <th className="px-4 py-3 text-center">Perempuan</th>
                      <th className="px-4 py-3 text-center">Total Jiwa</th>
                      <th className="px-4 py-3 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overview.demographics.ageDistribution.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-800">{item.range}</td>
                        <td className="px-4 py-2.5 text-center text-[#123B5D] font-bold">{item.male}</td>
                        <td className="px-4 py-2.5 text-center text-[#2E7D52] font-bold">{item.female}</td>
                        <td className="px-4 py-2.5 text-center font-black text-slate-900">{item.count}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-600">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                Statistik Keluarga & Kepala Keluarga
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total KK Terdaftar</span>
                  <span className="font-black text-[#123B5D]">{overview.family.totalKK} KK</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Rata-rata Anggota</span>
                  <span className="font-bold text-slate-900">{overview.family.averageMembersPerKK} orang/KK</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Keluarga Kecil (1-2 org)</span>
                  <span className="font-bold text-emerald-700">{overview.family.sizeDistribution.kecil} KK</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Keluarga Sedang (3-4 org)</span>
                  <span className="font-bold text-amber-700">{overview.family.sizeDistribution.sedang} KK</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Keluarga Besar (≥5 org)</span>
                  <span className="font-bold text-purple-700">{overview.family.sizeDistribution.besar} KK</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: HOUSING & BLOCKS */}
      {activeTab === 'housing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Distribusi Status Hunian Per Blok Perumahan GPA Ngijo
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.housing.byBlok}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="blok" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, color: '#fff', fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pemilik" name="Pemilik Tetap" fill="#2E7D52" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="kontrak" name="Kontrak / Sewa" fill="#D4A72C" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="kos" name="Penghuni Kos" fill="#123B5D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACILITIES */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Indeks Kesehatan Fasilitas</span>
              <div className="text-3xl font-black text-[#2E7D52]">{overview.facilities.conditionScorePercent}%</div>
              <p className="text-xs text-slate-500">Berdasarkan data inspeksi spasial GeoBase terkini</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Aset Lingkungan</span>
              <div className="text-3xl font-black text-[#123B5D]">{overview.facilities.totalFacilities} Unit</div>
              <p className="text-xs text-slate-500">{overview.facilities.activeCount} berstatus aktif beroperasi</p>
            </div>

            {overview.facilities.formattedAssetValuation && (
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Valuasi Total Aset (PDP Role)</span>
                <div className="text-2xl font-black text-emerald-900">{overview.facilities.formattedAssetValuation}</div>
                <p className="text-[10px] text-emerald-700">Hanya diproyeksikan untuk role Ketua RT / Admin</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Kondisi Fisik Sarana Prasarana
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {facilityConditionData.map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">{c.name}</span>
                  <span className="text-2xl font-black block" style={{ color: c.color }}>{c.value}</span>
                  <span className="text-[10px] text-slate-400">Unit Terdata</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS ARCHIVE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Arsip Dokumen Laporan Eksekutif RT
                </h4>
                <p className="text-xs text-slate-500">
                  Laporan resmi yang telah diterbitkan bersifat tetap (immutable) dan dapat diverifikasi secara publik.
                </p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Belum ada laporan yang diterbitkan. Silakan terbitkan laporan baru.
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((rep) => (
                  <div
                    key={rep.reportId}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#123B5D] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {rep.reportId}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{rep.title}</h5>
                        {rep.revision > 1 && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Rev {rep.revision}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Periode: <strong>{rep.period}</strong></span>
                        <span>•</span>
                        <span>Diterbitkan: {new Date(rep.generatedAt).toLocaleDateString('id-ID')}</span>
                        <span>•</span>
                        <span>Oleh: {rep.generatorName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setReportModalOpen(true);
                      }}
                      className="bg-[#2E7D52] hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Laporan</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Drawer / Modal */}
      {auditDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#123B5D]" />
                <h3 className="font-bold text-sm text-slate-900">Log Audit Akses & Laporan Analitik</h3>
              </div>
              <button
                onClick={() => setAuditDrawerOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div key={log.logId} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#123B5D]">{log.action}</span>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px]">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>User: {log.userId} ({log.role})</span>
                    <span
                      className={`font-black ${
                        log.status === 'SUCCESS' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official PDF Report Viewer Modal */}
      <ExecutiveReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        report={selectedReport}
        actor={actor}
        onReportUpdated={(updated) => {
          setSelectedReport(updated);
          loadData();
        }}
      />

    </div>
  );
};
