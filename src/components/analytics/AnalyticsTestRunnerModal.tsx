import React, { useState } from 'react';
import {
  X,
  Play,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  Layers,
  Terminal,
  Cpu,
  FileCheck
} from 'lucide-react';
import {
  AnalyticsTestRunnerService,
  AnalyticsTestSuiteResult,
  AnalyticsTestResultItem
} from '../../services/analyticsTestRunnerService';

interface AnalyticsTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsTestRunnerModal: React.FC<AnalyticsTestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [suiteResult, setSuiteResult] = useState<AnalyticsTestSuiteResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const result = await AnalyticsTestRunnerService.runAllTests();
      setSuiteResult(result);
    } catch (err: any) {
      alert(`Test runner execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const categories = [
    'ALL',
    'FUNCTIONAL',
    'RBAC',
    'IDOR',
    'PDP',
    'SECURITY',
    'REPORT_INTEGRITY',
    'DATA_INTEGRITY'
  ];

  const filteredResults = suiteResult
    ? activeCategory === 'ALL'
      ? suiteResult.results
      : suiteResult.results.filter((r) => r.category === activeCategory)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold shadow">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  GATE VERIFIKASI & PENGUJIAN OTOMATIS ANALITIK
                </h3>
                <span className="bg-[#2E7D52] text-white text-[10px] px-2 py-0.5 rounded-full font-black border border-[#D4A72C]">
                  CR-SMART-RT-ANALYTICS-001
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Functional • RBAC • IDOR • PDP • Security • Report Integrity • Data Integrity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="bg-[#D4A72C] hover:bg-[#c49826] text-[#123B5D] text-xs font-black px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Menjalankan...' : 'Jalankan Semua Test'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Summary Banner if Available */}
        {suiteResult && (
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow ${
                  suiteResult.failed === 0 ? 'bg-[#2E7D52]' : 'bg-red-600'
                }`}
              >
                {suiteResult.failed === 0 ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                  {suiteResult.failed === 0
                    ? 'VERIFIKASI SEMUA GATE: LULUS 100%'
                    : `TERDAPAT ${suiteResult.failed} KEGAGALAN UJI`}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {suiteResult.passed} dari {suiteResult.total} pengujian selesai dalam {suiteResult.durationMs}ms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Test</span>
                <span className="font-black text-slate-800">{suiteResult.total}</span>
              </div>
              <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
                <span className="text-[9px] text-emerald-600 font-bold block uppercase">Lulus</span>
                <span className="font-black text-emerald-800">{suiteResult.passed}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Pass Rate</span>
                <span className="font-black text-[#2E7D52]">{suiteResult.passRatePercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-slate-50">
          {!suiteResult ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto text-slate-600">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">Test Suite Siap Dijalankan</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol "Jalankan Semua Test" untuk memverifikasi 85+ pengujian otomasi modul Analitik & Laporan Otomatis Ketua RT.
              </p>
            </div>
          ) : (
            filteredResults.map((res) => (
              <div
                key={res.testId}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      {res.testId}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{res.category}</span>
                    <h5 className="font-bold text-slate-900">{res.name}</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Expect: {res.expected} | Actual: {res.actual}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">{res.durationMs}ms</span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      res.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {res.status === 'PASS' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        PASS
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-600" />
                        FAIL
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
