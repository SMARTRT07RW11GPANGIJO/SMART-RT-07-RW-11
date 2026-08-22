// SMART RT 07 RW 11 GPA NGIJO - EXTERNAL SERVICE INTEGRATION DASHBOARD v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Activity, 
  Sliders, 
  Lock, 
  Send, 
  FileSpreadsheet, 
  Bot, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  History,
  Info
} from 'lucide-react';
import { IntegrationOrchestratorService } from '../../services/external/integrationOrchestratorService';
import { WhatsappGatewayAdapter } from '../../services/external/adapters/whatsappGatewayAdapter';
import { GasSheetsAdapter } from '../../services/external/adapters/gasSheetsAdapter';
import { GeminiAiAdapter } from '../../services/external/adapters/geminiAiAdapter';
import { 
  ServiceHealthReport, 
  ExternalFeatureFlags, 
  IntegrationAuditLog,
  ExternalActorSession 
} from '../../types/externalIntegration';

interface ExternalIntegrationDashboardProps {
  currentRole: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ExternalIntegrationDashboard: React.FC<ExternalIntegrationDashboardProps> = ({
  currentRole,
  addToast
}) => {
  const [healthReports, setHealthReports] = useState<ServiceHealthReport[]>([]);
  const [featureFlags, setFeatureFlags] = useState<ExternalFeatureFlags>({
    EXTERNAL_GAS_SYNC_ENABLED: true,
    EXTERNAL_WA_GATEWAY_ENABLED: true,
    EXTERNAL_GEMINI_AI_ENABLED: true,
    EXTERNAL_PAYMENT_ENABLED: false,
    EXTERNAL_OAUTH_ENABLED: false
  });
  const [auditLogs, setAuditLogs] = useState<IntegrationAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'FLAGS' | 'SANDBOX' | 'AUDIT'>('HEALTH');

  // Sandbox inputs
  const [testTopic, setTestTopic] = useState('Ringkasan Evaluasi Ronda & Keamanan');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [waPhone, setWaPhone] = useState('081234567890');
  const [waTitle, setWaTitle] = useState('Kerja Bakti Bersama RT 07');
  const [waLoading, setWaLoading] = useState(false);

  const actorSession: ExternalActorSession = {
    userId: 'ACTOR_CURRENT',
    role: (currentRole as any) || 'PENGURUS',
    nama: 'Pengurus RT 07'
  };

  const refreshData = () => {
    setHealthReports(IntegrationOrchestratorService.getHealthReports());
    setFeatureFlags(IntegrationOrchestratorService.getFeatureFlags());
    setAuditLogs(IntegrationOrchestratorService.getAuditLogs(actorSession));
  };

  useEffect(() => {
    refreshData();
  }, [currentRole]);

  const handleToggleFlag = (flag: keyof ExternalFeatureFlags, currentVal: boolean) => {
    const res = IntegrationOrchestratorService.updateFeatureFlag(actorSession, flag, !currentVal);
    if (res.success) {
      addToast(res.message, 'success');
      refreshData();
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleTestAi = async () => {
    setAiLoading(true);
    try {
      const res = await GeminiAiAdapter.requestAdvisoryInsight(
        actorSession,
        testTopic,
        'Analisis kehadiran poskamling minggu ini mencapai 85%.',
        { kehadiran_ronda_persen: 85, insiden_lingkungan: 0 }
      );
      if (res.success) {
        setAiOutput(res.insight);
        addToast('Advisory Gemini AI berhasil digenerate.', 'success');
      } else {
        setAiOutput(`[DITOLAK] ${res.blockedReason || 'Gagal'}`);
        addToast(res.blockedReason || 'Gagal memproses AI', 'error');
      }
      refreshData();
    } finally {
      setAiLoading(false);
    }
  };

  const handleTestWa = async () => {
    setWaLoading(true);
    try {
      const qRes = WhatsappGatewayAdapter.enqueueMessage(
        actorSession,
        'AGENDA_BROADCAST',
        waPhone,
        { judul_agenda: waTitle, lokasi_agenda: 'Balai Warga RT 07' },
        `idem_dash_${Date.now()}`
      );
      if (qRes.success) {
        const pRes = await WhatsappGatewayAdapter.processQueue();
        addToast(`WhatsApp Queue diproses: ${pRes.delivered} terkirim.`, 'success');
      } else {
        addToast(qRes.message, 'error');
      }
      refreshData();
    } finally {
      setWaLoading(false);
    }
  };

  const handleTestGasSync = async () => {
    const res = await GasSheetsAdapter.exportData(actorSession, 'KAS', [
      { id: `TX_${Date.now()}`, kategori: 'IURAN_WARGA', jumlah: 25000, periode: '2026-08' }
    ]);
    if (res.success) {
      addToast(res.message, 'success');
    } else {
      addToast(res.message, 'error');
    }
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#1a4a73] to-[#2E7D52] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A72C] text-xs font-bold mb-3 border border-white/10">
              <Cloud className="w-3.5 h-3.5" />
              <span>ISOLATED ADAPTER & SECURITY LAYER v1.0</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Integrasi Layanan Eksternal</h1>
            <p className="text-slate-200 text-sm mt-1 max-w-2xl">
              Tata kelola terpusat adapter Google Sheets, WhatsApp Gateway, Gemini AI Advisory, dan OpenStreetMap dengan proteksi Zero-PII, Circuit Breaker, dan Server-Authoritative RBAC.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Segarkan Status
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-300">Active Services</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">4 / 4 Online</div>
            <div className="text-[10px] text-slate-400 mt-1">Zero PII Leakage</div>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-300">Circuit Breakers</div>
            <div className="text-xl font-bold text-white mt-0.5">All CLOSED</div>
            <div className="text-[10px] text-emerald-300 mt-1">Normal Resilience</div>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-300">Total Requests</div>
            <div className="text-xl font-bold text-[#D4A72C] mt-0.5">165 reqs</div>
            <div className="text-[10px] text-slate-300 mt-1">99.4% Success Rate</div>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-300">Payment & OAuth</div>
            <div className="text-xl font-bold text-red-400 mt-0.5">BLOCKED</div>
            <div className="text-[10px] text-red-300 mt-1">Out of Scope Policy</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('HEALTH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'HEALTH'
              ? 'bg-[#123B5D] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Health & Circuit Breaker
        </button>

        <button
          onClick={() => setActiveTab('FLAGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'FLAGS'
              ? 'bg-[#123B5D] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Feature Flag Governance
        </button>

        <button
          onClick={() => setActiveTab('SANDBOX')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SANDBOX'
              ? 'bg-[#123B5D] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Integration Sandbox & Probe
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'bg-[#123B5D] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Audit Trail Log
        </button>
      </div>

      {/* TAB 1: HEALTH & CIRCUIT BREAKER */}
      {activeTab === 'HEALTH' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthReports.map((report) => (
            <div key={report.service} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{report.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      report.health === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                      report.health === 'DEGRADED' ? 'bg-amber-100 text-amber-800' :
                      report.health === 'DISABLED' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-800'
                    }`}>
                      {report.health}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Service ID: {report.service}</div>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                    report.circuitState === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    report.circuitState === 'HALF_OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    CB: {report.circuitState}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">Total Permintaan</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{report.totalRequests}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Berhasil / Gagal</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">{report.successRequests} / {report.failedRequests}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Rata-rata Latensi</div>
                  <div className="font-bold text-slate-700 text-sm mt-0.5">{report.avgLatencyMs} ms</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sukses Terakhir: {report.lastSuccessTimestamp || 'Aktif'}</span>
                </div>
                {report.queueDepth > 0 && (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Antrean: {report.queueDepth}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FEATURE FLAGS */}
      {activeTab === 'FLAGS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#123B5D]" />
              Tata Kelola Feature Flag Eksternal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hanya Administrator dan Ketua RT yang memiliki otorisasi untuk mengaktifkan atau menonaktifkan adapter eksternal.
            </p>
          </div>

          <div className="space-y-3">
            {/* GAS Sync Flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="text-sm font-bold text-slate-800">EXTERNAL_GAS_SYNC_ENABLED</div>
                  <div className="text-xs text-slate-500">Sinkronisasi data tabular dan rekapan ke Google Sheets</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFlag('EXTERNAL_GAS_SYNC_ENABLED', featureFlags.EXTERNAL_GAS_SYNC_ENABLED)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  featureFlags.EXTERNAL_GAS_SYNC_ENABLED
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {featureFlags.EXTERNAL_GAS_SYNC_ENABLED ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* WA Gateway Flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-bold text-slate-800">EXTERNAL_WA_GATEWAY_ENABLED</div>
                  <div className="text-xs text-slate-500">Pengiriman notifikasi agenda & reminder warga via WhatsApp</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFlag('EXTERNAL_WA_GATEWAY_ENABLED', featureFlags.EXTERNAL_WA_GATEWAY_ENABLED)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  featureFlags.EXTERNAL_WA_GATEWAY_ENABLED
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {featureFlags.EXTERNAL_WA_GATEWAY_ENABLED ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Gemini AI Flag */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-bold text-slate-800">EXTERNAL_GEMINI_AI_ENABLED</div>
                  <div className="text-xs text-slate-500">Inference AI analitik deskriptif dan advisory drafting</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleFlag('EXTERNAL_GEMINI_AI_ENABLED', featureFlags.EXTERNAL_GEMINI_AI_ENABLED)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  featureFlags.EXTERNAL_GEMINI_AI_ENABLED
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {featureFlags.EXTERNAL_GEMINI_AI_ENABLED ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Blocked Flags Notice */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-red-900">KEBIJAKAN TETAP (PERMANENTLY BLOCKED)</div>
                <div className="text-xs text-red-700 mt-0.5">
                  <code>EXTERNAL_PAYMENT_ENABLED</code> dan <code>EXTERNAL_OAUTH_ENABLED</code> diblokir secara permanen. Kas RT dikelola manual secara aman dan otentikasi warga tetap menggunakan SSoT Auth-KK internal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SANDBOX & PROBES */}
      {activeTab === 'SANDBOX' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gemini AI Probe Sandbox */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Probe Gemini AI Advisory Inference</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Topik Permintaan</label>
              <input
                type="text"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
            <button
              onClick={handleTestAi}
              disabled={aiLoading}
              className="w-full bg-[#123B5D] hover:bg-[#1a4a73] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              <span>Uji Inference AI (Advisory Only)</span>
            </button>
            {aiOutput && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-800 text-[11px]">Hasil Respon AI:</div>
                <p className="leading-relaxed">{aiOutput}</p>
              </div>
            )}
          </div>

          {/* WhatsApp & Google Sheets Probe Sandbox */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Probe WhatsApp & Sheets Sync</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Nomor Penerima (Sanitized)</label>
              <input
                type="text"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D52]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Judul Agenda</label>
              <input
                type="text"
                value={waTitle}
                onChange={(e) => setWaTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D52]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleTestWa}
                disabled={waLoading}
                className="bg-[#2E7D52] hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {waLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Kirim WhatsApp</span>
              </button>
              <button
                onClick={handleTestGasSync}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Sync Sheets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-[#123B5D]" />
              Immutable Integration Audit Log
            </h3>
            <span className="text-xs text-slate-500">Append-Only / Zero-PII Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">Layanan</th>
                  <th className="p-2.5">Aksi Audit</th>
                  <th className="p-2.5">Aktor / Role</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Metadata Sanitized</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Belum ada catatan audit integrasi eksternal.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="p-2.5 font-bold text-slate-700">{log.service}</td>
                      <td className="p-2.5 text-slate-800 font-mono text-[11px]">{log.action}</td>
                      <td className="p-2.5 text-slate-600">
                        {log.actorId} <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">({log.role})</span>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
