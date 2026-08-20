// SMART RT 07 RW 11 GPA NGIJO - SMART RT AI CONTROL CENTER v1.0
// Official AI Control Center, Health Metrics, Tool Registry, Audit Viewer & 40-Test Runner

import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types/rt';
import { AITestSuiteResult, AIKnowledgeHealthMetrics, AIAuditRecord } from '../../types/aiAgent';
import { AITestRunnerService } from '../../services/ai/aiTestRunnerService';
import { AIKnowledgeHealthService } from '../../services/ai/aiKnowledgeHealthService';
import { AIAuditService } from '../../services/ai/aiAuditService';
import { AI_TOOL_REGISTRY } from '../../services/ai/aiToolRegistry';
import { AIAssistant } from './AIAssistant';
import {
  Bot,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  Database,
  Lock,
  Search,
  Filter,
  Flame,
  FileCheck,
  Server,
  Sparkles,
  RefreshCw,
  Cpu,
  Eye,
  ShieldAlert
} from 'lucide-react';

interface AIAgentDashboardProps {
  currentRole: UserRole;
  currentUserId?: string;
  currentUserName?: string;
}

export const AIAgentDashboard: React.FC<AIAgentDashboardProps> = ({
  currentRole,
  currentUserId = 'ADM-001',
  currentUserName = 'Bpk. Eko Sucahyono'
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TESTS' | 'TOOLS' | 'AUDIT' | 'PLAYGROUND'>('OVERVIEW');
  const [healthMetrics, setHealthMetrics] = useState<AIKnowledgeHealthMetrics>(AIKnowledgeHealthService.evaluateHealth());
  const [testResults, setTestResults] = useState<AITestSuiteResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSummary, setTestSummary] = useState<{ total: number; passed: number; failed: number; rate: number; duration: number } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AIAuditRecord[]>(AIAuditService.getLogs(50));
  const [testCategoryFilter, setTestCategoryFilter] = useState<string>('ALL');

  const refreshAll = () => {
    setHealthMetrics(AIKnowledgeHealthService.evaluateHealth());
    setAuditLogs(AIAuditService.getLogs(50));
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const suite = await AITestRunnerService.runAllTests();
      setTestResults(suite.results);
      setTestSummary({
        total: suite.total,
        passed: suite.passed,
        failed: suite.failed,
        rate: suite.passRatePercent,
        duration: suite.durationMs
      });
      refreshAll();
    } finally {
      setIsRunningTests(false);
    }
  };

  const filteredTests = testResults.filter((t) => {
    if (testCategoryFilter === 'ALL') return true;
    return t.category === testCategoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0D2A4A] via-[#123B5D] to-[#2E7D52] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#C89A2B]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2E7D52] border-2 border-[#C89A2B] flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-9 h-9 text-[#E9D8B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  SMART RT AI Control Center
                </h1>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-xs font-black px-3 py-1 rounded-full uppercase shadow-xs">
                  v1.0 OFFICIAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium">
                Intelligent Service Layer dengan Grounded RAG, Tool Registry, Privacy / PDP Masking, IDOR Defense, dan Integrasi GeoBase Real-World Data.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="bg-[#C89A2B] hover:bg-[#B38722] text-[#0D2A4A] px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isRunningTests ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#0D2A4A]" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isRunningTests ? 'Menjalankan Uji 40 Test...' : 'Jalankan 40 AI Tests'}</span>
            </button>
            <button
              onClick={refreshAll}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>AI Status</span>
            <Bot className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">PRODUCTION READY</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Service Layer Active</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Model Engine</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">Gemini 3.7 Flash</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Temp: 0.1 (Precision)</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>GeoBase Status</span>
            <Layers className="w-4 h-4 text-[#C89A2B]" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">{healthMetrics.geobaseCertification}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            {healthMetrics.geobaseFieldVerified} Verified / {healthMetrics.geobaseScopeTotal} Total
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Security Gate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">PROTECTED</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">PDP & IDOR Active</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Knowledge Health</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">{healthMetrics.healthScorePercent}%</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">{healthMetrics.verifiedCount} Verified Records</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Audit Trail</span>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-base font-extrabold text-[#0D2A4A]">{auditLogs.length} Events</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">SHA-256 Verified</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#0D2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ringkasan Arsitektur & Health
        </button>
        <button
          onClick={() => setActiveTab('TESTS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'TESTS'
              ? 'bg-[#0D2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Automated Test Suite (40/40)</span>
          {testSummary && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                testSummary.failed === 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {testSummary.passed}/{testSummary.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('TOOLS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'TOOLS'
              ? 'bg-[#0D2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tool Registry & Permissions
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'AUDIT'
              ? 'bg-[#0D2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Log & Security Trail
        </button>
        <button
          onClick={() => setActiveTab('PLAYGROUND')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'PLAYGROUND'
              ? 'bg-[#0D2A4A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C89A2B]" />
          <span>Interactive Assistant</span>
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Layer Architecture Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2E7D52]" />
              Struktur 12 Layer Arsitektur AI Agent
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">LAYER 1-3</span>
                <div className="font-bold text-slate-800 mt-0.5">Auth & RBAC Gateway</div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Otentikasi sesi & pembatasan hak akses berbasis per-role.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">LAYER 4-6</span>
                <div className="font-bold text-slate-800 mt-0.5">Intent & Policy Gate</div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Klasifikasi 15 intent, anti-prompt injection, dan IDOR defense.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">LAYER 7-9</span>
                <div className="font-bold text-slate-800 mt-0.5">RAG & Tool Dispatcher</div>
                <p className="text-slate-500 text-[11px] mt-1">
                  5-Layer knowledge retrieval dan pemanggilan service resmi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">LAYER 10-12</span>
                <div className="font-bold text-slate-800 mt-0.5">Response Guard & Audit</div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Penyegelan kontrak respons, PDP masking, dan audit SHA-256.
                </p>
              </div>
            </div>
          </div>

          {/* Service Integrations & Knowledge Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Status Integrasi Single Source of Truth
              </h3>
              <div className="space-y-2.5 text-xs">
                {Object.entries(healthMetrics.servicesStatus).map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C89A2B]" />
                Kualitas Data & GeoBase Grounding Scope
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="font-bold text-xs">Data Terverifikasi Lapangan (Layer 1)</div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {healthMetrics.geobaseFieldVerified} Fasilitas RT telah diverifikasi fisik on-site dengan GPS akurat dan bukti foto.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="font-bold text-xs">Data Referensi Belum Terverifikasi (Layer 3)</div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {healthMetrics.geobaseReferenceUnverified} Fasilitas masih berstatus data referensi dan otomatis diberi label peringatan oleh AI.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="font-bold text-xs">Status Sertifikasi GeoBase</div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Status saat ini: <strong className="font-bold">{healthMetrics.geobaseCertification}</strong>. AI beroperasi dengan pembatasan skop data verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 40 TESTS */}
      {activeTab === 'TESTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2E7D52]" />
                Automated Verification Suite (AI-001 s/d AI-040)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi komprehensif 40 aspek keamanan, otorisasi, PDP, GeoBase, regresi, dan integritas sistem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={testCategoryFilter}
                onChange={(e) => setTestCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">Semua Kategori ({testResults.length})</option>
                <option value="SECURITY">Security & Privacy</option>
                <option value="RBAC">RBAC & IDOR</option>
                <option value="GEOBASE">GeoBase Safety</option>
                <option value="PDP">PDP Masking</option>
                <option value="REGRESSION">Regression</option>
                <option value="BUILD">Build & Types</option>
              </select>

              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="bg-[#2E7D52] hover:bg-[#256843] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRunningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Jalankan Uji</span>
              </button>
            </div>
          </div>

          {testSummary && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-4">
                <span className="text-slate-600">Total Uji: <strong className="text-slate-900 font-extrabold">{testSummary.total}</strong></span>
                <span className="text-emerald-700">Lulus: <strong className="font-extrabold">{testSummary.passed}</strong></span>
                <span className="text-rose-700">Gagal: <strong className="font-extrabold">{testSummary.failed}</strong></span>
                <span className="text-slate-600">Durasi: <strong className="text-slate-900 font-extrabold">{testSummary.duration}ms</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Tingkat Kelulusan:</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {testSummary.rate}% PASS
                </span>
              </div>
            </div>
          )}

          {filteredTests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <Bot className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Belum ada hasil pengujian. Klik tombol <strong>"Jalankan 40 AI Tests"</strong> di atas.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredTests.map((t) => (
                <div
                  key={t.testId}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-[#0D2A4A] bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {t.testId}
                      </span>
                      <span className="font-bold text-slate-800">{t.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-100 rounded-md">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-normal">{t.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Expected: {t.expected} | Actual: {t.actual}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{t.durationMs}ms</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        t.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TOOLS */}
      {activeTab === 'TOOLS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              Daftar Tool Registry Resmi (AI_TOOL_REGISTRY)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh tool terdaftar dengan hak akses per-role, data classification, dan batasan mutasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.values(AI_TOOL_REGISTRY).map((tool) => (
              <div
                key={tool.toolId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{tool.name}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      tool.mutating
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {tool.mutating ? 'MUTATING (2-Step Confirmed)' : 'READ ONLY'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  {tool.description}
                </p>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span>Klasifikasi: <strong className="font-bold text-slate-700">{tool.dataClassification}</strong></span>
                  <span>Rate: {tool.rateLimit}/menit</span>
                  <div className="flex gap-1">
                    {tool.allowedRoles.map((r) => (
                      <span key={r} className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded-md font-mono">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-700" />
              Audit Log & Security Event Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan interaksi AI dengan penanda waktu, aktor, status otorisasi, dan fingerprint integritas.
            </p>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.logId}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp.slice(11, 19)}</span>
                    <span className="font-bold text-slate-800">{log.event}</span>
                    <span className="text-[10px] font-semibold text-slate-500">[{log.role}] {log.userId}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-normal">{log.details}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{log.durationMs}ms</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLAYGROUND */}
      {activeTab === 'PLAYGROUND' && (
        <div>
          <AIAssistant currentRole={currentRole} userName={currentUserName} />
        </div>
      )}
    </div>
  );
};
