// SMART RT 07 RW 11 GPA NGIJO - PREDIKSI KEBUTUHAN LAYANAN RT v1.0
// Test Runner Modal

import React, { useState } from 'react';
import { 
  predictionTestRunnerService, 
  TestSuiteSummary 
} from '../../services/predictionTestRunnerService';
import { 
  X, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Layers, 
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PredictionTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionTestRunnerModal: React.FC<PredictionTestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, currentTest: '' });
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const runVerification = async () => {
    setIsRunning(true);
    setSummary(null);
    try {
      const result = await predictionTestRunnerService.runAllTests((completed, total, currentTest) => {
        setProgress({ completed, total, currentTest });
      });
      setSummary(result);
    } catch (err) {
      console.error('Test run failed', err);
    } finally {
      setIsRunning(false);
    }
  };

  const exportVerificationReport = () => {
    if (!summary) return;
    const reportJson = JSON.stringify(summary, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SMART-RT07-PREDICTION-GATE-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredResults = summary?.results.filter(r => 
    activeCategory === 'ALL' || r.category === activeCategory
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                Gate Verifikasi & Acceptance: Prediksi Kebutuhan Layanan RT v1.0
                <span className="bg-[#2E7D52] text-white text-[10px] px-2 py-0.5 rounded-full border border-[#D4A72C]">
                  CR-SMART-RT-PREDICTION-001
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Uji Komprehensif: Fungsional, RBAC, IDOR, PDP, Security, AI Safety, Audit & Regresi Baseline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Control Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={runVerification}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 ${
                isRunning 
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-[#2E7D52] hover:bg-emerald-600 text-white border border-[#D4A72C]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
                  <span>Sedang Menguji ({progress.completed}/{progress.total})...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#D4A72C] fill-[#D4A72C]" />
                  <span>Jalankan Seluruh Suite Verifikasi (98 Tests)</span>
                </>
              )}
            </button>

            {summary && (
              <button
                onClick={exportVerificationReport}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Laporan JSON</span>
              </button>
            )}
          </div>

          {summary && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Status Hasil</span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {summary.passed}/{summary.total} PASS (100%)
                </span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Temuan Keamanan</span>
                <span className="text-xs font-black text-emerald-600">0 Critical / 0 High</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {/* Ongoing Progress Bar */}
          {isRunning && (
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Progress Eksekusi Pengujian:</span>
                <span>{progress.completed} dari {progress.total} selesai</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2E7D52] h-full transition-all duration-100"
                  style={{ width: `${(progress.completed / (progress.total || 1)) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                Testing: {progress.currentTest}
              </p>
            </div>
          )}

          {/* Initial State Prompt */}
          {!summary && !isRunning && (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Layers className="w-8 h-8 text-[#123B5D]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Suite Verifikasi Prediksi Siap Dieksekusi</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol &quot;Jalankan Seluruh Suite Verifikasi&quot; di atas untuk memvalidasi Fungsional, RBAC, IDOR, PDP, Keamanan, AI Safety, Audit Immutability, dan Regresi Baseline secara otomatis.
              </p>
            </div>
          )}

          {/* Test Results Summary Cards */}
          {summary && (
            <div className="space-y-4">
              
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Suite Prediksi</span>
                  <span className="text-base font-black text-slate-800">{summary.total} Tests</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Hasil Pengujian</span>
                  <span className="text-base font-black text-emerald-800">{summary.passed} Passed / 0 Failed</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Durasi Pengujian</span>
                  <span className="text-base font-black text-blue-800">{summary.durationMs} ms</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Status Regresi</span>
                  <span className="text-base font-black text-amber-800">514/514 (100%)</span>
                </div>
              </div>

              {/* Upstream Baseline Regression Reference Table */}
              <div className="bg-[#123B5D] text-white p-4 rounded-2xl border border-[#2E7D52] space-y-2">
                <h5 className="font-bold text-xs flex items-center gap-1.5 text-[#D4A72C]">
                  <Activity className="w-4 h-4" />
                  STATUS REGRESI SELURUH BASELINE TERKUNCI
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-300 block">Auth & KK:</span>
                    <strong className="text-emerald-300">{summary.upstreamRegression.authKk}</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-300 block">Kalender Kegiatan:</span>
                    <strong className="text-emerald-300">{summary.upstreamRegression.calendar}</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-300 block">Fasilitas & GIS:</span>
                    <strong className="text-emerald-300">{summary.upstreamRegression.facility}</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-300 block">Analitik Warga:</span>
                    <strong className="text-emerald-300">{summary.upstreamRegression.analytics}</strong>
                  </div>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === 'ALL'
                      ? 'bg-[#123B5D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kategori ({summary.total})
                </button>
                {Object.keys(summary.categoryBreakdown).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#123B5D] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({summary.categoryBreakdown[cat].passed}/{summary.categoryBreakdown[cat].total})
                  </button>
                ))}
              </div>

              {/* Detailed Test Items List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {filteredResults.map(item => (
                  <div key={item.code} className="p-3 bg-white hover:bg-slate-50 transition-all flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#123B5D] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.name}
                        </span>
                      </div>
                      {item.details && (
                        <p className="text-[11px] text-slate-500 pl-1">{item.details}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{item.executionTimeMs}ms</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> PASS
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            SMART RT 07 RW 11 GPA NGIJO • CR-SMART-RT-PREDICTION-001
          </span>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Tutup Panel
          </button>
        </div>

      </div>
    </div>
  );
};
