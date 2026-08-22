// SMART RT 07 RW 11 GPA NGIJO - EXTERNAL INTEGRATION TEST RUNNER MODAL v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Filter, 
  Download,
  Server,
  Cloud
} from 'lucide-react';
import { 
  ExternalTestRunnerService, 
  ExternalTestCaseResult 
} from '../../services/external/externalTestRunnerService';

interface ExternalTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExternalTestRunnerModal: React.FC<ExternalTestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<ExternalTestCaseResult[]>([]);
  const [stats, setStats] = useState<{ total: number; passed: number; failed: number; durationMs: number }>({
    total: 0,
    passed: 0,
    failed: 0,
    durationMs: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const executeSuite = async () => {
    setIsRunning(true);
    try {
      const suite = await ExternalTestRunnerService.runAllTests();
      setTestResults(suite.results);
      setStats({
        total: suite.total,
        passed: suite.passed,
        failed: suite.failed,
        durationMs: suite.durationMs
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && testResults.length === 0) {
      executeSuite();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(testResults.map(t => t.category)))];
  const filteredResults = selectedCategory === 'ALL'
    ? testResults
    : testResults.filter(t => t.category === selectedCategory);

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  const downloadReport = () => {
    const reportText = [
      '============================================================',
      'SMART RT EXTERNAL SERVICE INTEGRATION v1.0',
      'AUTOMATED MASTER ACCEPTANCE & SECURITY TEST REPORT',
      '============================================================',
      `Date: ${new Date().toISOString()}`,
      `Total Tests: ${stats.total}`,
      `Passed: ${stats.passed}`,
      `Failed: ${stats.failed}`,
      `Pass Rate: ${passRate}%`,
      `Duration: ${stats.durationMs}ms`,
      '------------------------------------------------------------',
      ...testResults.map(t => `[${t.status}] ${t.id} (${t.category}): ${t.description} -> ${t.actualOutput}`),
      '============================================================'
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SMART_RT_EXTERNAL_SERVICE_REPORT_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#123B5D] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
              <Cloud className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gate Verifikasi Integrasi Layanan Eksternal v1.0</h2>
              <p className="text-xs text-slate-300">
                CR-SMART-RT-EXTERNAL-001 • Comprehensive Functional, Security, Zero-PII, RBAC & AI Safety Gate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Stats Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={executeSuite}
              disabled={isRunning}
              className="bg-[#2E7D52] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Menjalankan Uji...' : 'Jalankan Ulang Suite'}</span>
            </button>

            <button
              onClick={downloadReport}
              disabled={testResults.length === 0}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Laporan</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500">Total Uji</div>
              <div className="font-bold text-slate-800 text-sm">{stats.total}</div>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
              <div className="text-[10px] text-emerald-700">Lolos (PASS)</div>
              <div className="font-bold text-emerald-700 text-sm">{stats.passed}</div>
            </div>
            <div className="bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 text-center">
              <div className="text-[10px] text-red-700">Gagal (FAIL)</div>
              <div className="font-bold text-red-700 text-sm">{stats.failed}</div>
            </div>
            <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400">Tingkat Lolos</div>
              <div className="font-bold text-[#D4A72C] text-sm">{passRate}%</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-600 shrink-0">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#123B5D] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Test Result List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada hasil pengujian yang cocok dengan filter.
            </div>
          ) : (
            filteredResults.map((test) => (
              <div
                key={test.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  test.status === 'PASS'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-red-50/80 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {test.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {test.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                          {test.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{test.description}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-0.5">
                        <span>
                          <strong className="text-slate-700">Actual:</strong> {test.actualOutput}
                        </span>
                        <span>
                          <strong className="text-slate-700">Expected:</strong> {test.expectedOutput}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      test.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Semua pengujian dijalankan secara deterministik pada isolated memory adapter.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            Tutup Gate
          </button>
        </div>
      </div>
    </div>
  );
};
