// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8L AI EVALUATION CENTER & RELEASE GATE DASHBOARD

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  AlertTriangle,
  FileText,
  TrendingUp,
  Cpu,
  RefreshCw,
  Eye,
  Lock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  Filter,
  Layers,
  Zap,
  Check,
  Ban,
  Clock
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  AIEvaluationResult,
  EvaluationSummaryReport,
  HumanReviewEntry,
  RegressionComparison
} from '../types/aiEvaluation';
import { AIEvaluationEngineService } from '../services/aiEvaluationEngineService';
import { HumanReviewService } from '../services/humanReviewService';
import { AIRegressionEngineService } from '../services/aiRegressionEngineService';
import { GOLDEN_EVALUATION_DATASET } from '../data/goldenDataset8L';

interface AdminAIEvaluationDashboardProps {
  currentRole: UserRole;
  currentUserId: string;
}

export const AdminAIEvaluationDashboard: React.FC<AdminAIEvaluationDashboardProps> = ({
  currentRole,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'GOLDEN' | 'ACCURACY' | 'SAFETY' | 'HUMAN' | 'REGRESSION' | 'FAILED' | 'RELEASE_GATE'
  >('OVERVIEW');

  // State
  const [results, setResults] = useState<AIEvaluationResult[]>([]);
  const [summary, setSummary] = useState<EvaluationSummaryReport | null>(null);
  const [humanReviews, setHumanReviews] = useState<HumanReviewEntry[]>([]);
  const [regression, setRegression] = useState<RegressionComparison | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Filters for Golden Dataset / Results
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<AIEvaluationResult | null>(null);

  // Human Review Modal state
  const [reviewModalTestId, setReviewModalTestId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<'CORRECT' | 'INCORRECT' | 'NEEDS_IMPROVEMENT'>('CORRECT');
  const [reviewComment, setReviewComment] = useState('');

  // Load Data
  const loadData = () => {
    const cached = AIEvaluationEngineService.getCachedResults();
    setResults(cached);

    const sum = AIEvaluationEngineService.computeSummaryReport(cached);
    setSummary(sum);

    const revs = HumanReviewService.getReviews();
    setHumanReviews(revs);

    const reg = AIRegressionEngineService.checkRegression(sum.evaluationVersion, sum.overallScorePercent, cached);
    setRegression(reg);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Run Golden Suite Trigger
  const handleRunEvaluation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const { results: newRes, summary: newSum } = AIEvaluationEngineService.runGoldenSuite();
      setResults(newRes);
      setSummary(newSum);

      const reg = AIRegressionEngineService.checkRegression(newSum.evaluationVersion, newSum.overallScorePercent, newRes);
      setRegression(reg);
      setIsRunning(false);
    }, 600);
  };

  // Submit Human Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalTestId) return;

    HumanReviewService.addReview({
      testId: reviewModalTestId,
      evaluationResultId: selectedResult?.id || `EVAL-${reviewModalTestId}`,
      reviewer: `${currentUserId} (${currentRole})`,
      rating: reviewRating,
      comment: reviewComment
    });

    setHumanReviews(HumanReviewService.getReviews());
    setReviewModalTestId(null);
    setReviewComment('');
  };

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = r.testId.toLowerCase().includes(q);
        const matchesQ = r.question.toLowerCase().includes(q);
        const matchesCat = r.category.toLowerCase().includes(q);
        return matchesId || matchesQ || matchesCat;
      }
      return true;
    });
  }, [results, selectedCategory, selectedSeverity, searchQuery]);

  // Failed Results
  const failedResults = useMemo(() => {
    return results.filter((r) => r.status === 'FAIL');
  }, [results]);

  // ACCESS CONTROL ENFORCEMENT
  if (currentRole === 'WARGA') {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto text-rose-600 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-rose-900 mb-2">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-rose-700 max-w-md mx-auto mb-6">
          Modul AI Evaluation Center (8L) hanya dapat diakses oleh PENGURUS, KETUA RT, dan ADMIN untuk menjamin objektivitas evaluasi AI.
        </p>
        <span className="inline-block px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-xs font-mono font-semibold">
          Role Anda: WARGA (Dibatasi)
        </span>
      </div>
    );
  }

  const isLimitedView = currentRole === 'PENGURUS';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Evaluation Center & Release Gate</h1>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  TAHAP 8L
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                SMART RT 07 RW 11 GPA NGIJO — Automated Benchmark, Golden Dataset, Safety & Release Gate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {summary && (
              <div
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold ${
                  summary.releaseGate.releaseStatus === 'RELEASE_READY'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                {summary.releaseGate.releaseStatus === 'RELEASE_READY' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Ban className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  {summary.releaseGate.releaseStatus === 'RELEASE_READY'
                    ? 'RELEASE READY (GATE PASS)'
                    : 'RELEASE BLOCKED'}
                </span>
              </div>
            )}

            {!isLimitedView && (
              <button
                onClick={handleRunEvaluation}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Zap className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Evaluasi Berjalan...' : 'Jalankan Evaluasi Golden Dataset'}</span>
              </button>
            )}

            <span className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono">
              Role: <strong className="text-indigo-400">{currentRole}</strong>
            </span>
          </div>
        </div>

        {/* LIMITED ACCESS BANNER FOR PENGURUS */}
        {isLimitedView && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <strong>Akses Ringkasan (Pengurus View):</strong> Anda login sebagai PENGURUS. Anda dapat melihat statistik evaluasi & skor agregat. Manajemen dataset & eksekusi release gate memerlukan otorisasi KETUA_RT / ADMIN.
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'OVERVIEW', label: 'Ringkasan & Dashboard', icon: TrendingUp },
            { id: 'GOLDEN', label: 'Golden Dataset (14 Test)', icon: FileText },
            { id: 'ACCURACY', label: 'Akurasi & Tool Accuracy', icon: Cpu },
            { id: 'SAFETY', label: 'Keamanan & Guardrails', icon: Shield },
            { id: 'HUMAN', label: 'Human Review', icon: MessageSquare },
            { id: 'REGRESSION', label: 'Uji Regresi', icon: Layers },
            { id: 'FAILED', label: 'Analisis Gagal', icon: AlertTriangle, badge: failedResults.length },
            { id: 'RELEASE_GATE', label: 'Release Gate Status', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm font-bold'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 bg-rose-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && summary && (
          <div className="space-y-6">
            {/* KPI METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Skor Keseluruhan</p>
                  <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{summary.overallScorePercent}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Ambang Rilis: 90%</span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Akurasi Jawaban</p>
                  <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.accuracyPercent}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Groundedness: {summary.groundednessPercent}%</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Skor Keamanan (Safety)</p>
                  <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{summary.safetyPercent}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Prompt Injection Guarded</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Shield className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tool Call Accuracy</p>
                  <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{summary.toolAccuracyPercent}%</h3>
                  <span className="text-xs text-slate-500 mt-1 block">Ambang Rilis: 95%</span>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Cpu className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* SECONDARY OVERVIEW DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EVALUATION VERSIONS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" /> Versi Komponen AI Ter-Benchmark
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Evaluation Suite:</span>
                    <strong className="text-slate-800">{summary.evaluationVersion}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">AI Model Version:</span>
                    <strong className="text-slate-800">{summary.modelVersion}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">System Prompt Version:</span>
                    <strong className="text-slate-800">{summary.promptVersion}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Knowledge Version:</span>
                    <strong className="text-slate-800">{summary.knowledgeVersion}</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-500">Tools Schema Version:</span>
                    <strong className="text-slate-800">{summary.toolVersion}</strong>
                  </div>
                </div>
              </div>

              {/* REGRESSION DELTA */}
              {regression && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" /> Perubahan Skor Regresi
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Versi Sebelumnya ({regression.evaluationVersion}):</span>
                      <strong className="text-slate-800">{regression.previousOverallScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Versi Saat Ini:</span>
                      <strong className="text-indigo-600">{regression.currentOverallScore}%</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-slate-700 font-bold">Delta Regresi:</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          regression.delta >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {regression.delta >= 0 ? `+${regression.delta}%` : `${regression.delta}%`} ({regression.status})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GOLDEN DATASET */}
        {activeTab === 'GOLDEN' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Penjelajah Golden Dataset (14 Skenario Wajib)
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ID, pertanyaan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                  />
                </div>

                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                >
                  <option value="ALL">Semua Tingkat Risk</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Test ID</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Pertanyaan Warga</th>
                    <th className="py-3 px-3">Expected Tool</th>
                    <th className="py-3 px-3">Kategori Risk</th>
                    <th className="py-3 px-3">Status Evaluasi</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.testId}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">{r.question}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{r.expectedTool || '-'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            r.status === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status} ({r.overallScore}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => setSelectedResult(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!isLimitedView && (
                          <button
                            onClick={() => setReviewModalTestId(r.testId)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                            title="Beri Human Review"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACCURACY & TOOL ACCURACY */}
        {activeTab === 'ACCURACY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Cpu className="w-5 h-5 text-indigo-600" /> Metrics Akurasi Jawaban & Eksekusi Tool AI
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                <p className="text-xs font-bold text-indigo-800 uppercase">Akurasi Kebenaran Jawaban</p>
                <h2 className="text-3xl font-black text-slate-900">{summary?.accuracyPercent}%</h2>
                <p className="text-xs text-slate-500">Mencakup kecocokan kata kunci dan maksud</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="text-xs font-bold text-emerald-800 uppercase">Akurasi Groundedness (RAG)</p>
                <h2 className="text-3xl font-black text-emerald-700">{summary?.groundednessPercent}%</h2>
                <p className="text-xs text-slate-500">Bebas dari halusinasi data / kebijakan</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <p className="text-xs font-bold text-purple-800 uppercase">Akurasi Pemanggilan Tool</p>
                <h2 className="text-3xl font-black text-purple-700">{summary?.toolAccuracyPercent}%</h2>
                <p className="text-xs text-slate-500">Sesuai dengan skema & parameter tool</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAFETY & GUARDRAILS */}
        {activeTab === 'SAFETY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Shield className="w-5 h-5 text-rose-600" /> Evaluasi Keamanan & Pencegahan Prompt Injection
            </h3>

            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">Skor Keamanan Keseluruhan (Safety Score):</span>
                <span className="text-2xl font-black text-rose-700">{summary?.safetyPercent}%</span>
              </div>
              <p className="text-xs text-rose-800">
                Catatan: Syarat kelulusan Release Gate untuk indikator Safety adalah 100% PASS. Kegagalan pada uji injection / data leakage akan secara otomatis memblokir perilisan sistem ke produksi.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: HUMAN REVIEW */}
        {activeTab === 'HUMAN' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Catatan Tinjauan Manusia (Human-in-the-Loop)
            </h3>

            <div className="space-y-3">
              {humanReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">{rev.testId}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rev.rating === 'CORRECT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.rating === 'INCORRECT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.rating}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium">{rev.comment}</p>
                  <p className="text-[11px] text-slate-400">
                    Oleh: {rev.reviewer} | Waktu: {new Date(rev.reviewDate).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REGRESSION */}
        {activeTab === 'REGRESSION' && regression && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <Layers className="w-5 h-5 text-purple-600" /> Laporan Analisis Regresi Sistem AI
            </h3>

            <div className="p-5 rounded-2xl border bg-slate-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Status Regresi:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    regression.status === 'IMPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : regression.status === 'STABLE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {regression.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Pengujian dilakukan membandingkan versi <strong>{regression.evaluationVersion}</strong> dengan versi sebelumnya. Delta skor: <strong>{regression.delta}%</strong>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: FAILED TESTS */}
        {activeTab === 'FAILED' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 border-b pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Analisis & Rekomendasi Perbaikan Pengujian Gagal
            </h3>

            <div className="space-y-4">
              {failedResults.map((f) => (
                <div key={f.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-rose-900">{f.testId}</span>
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{f.question}</p>
                  <div className="text-xs text-rose-800 space-y-1">
                    <p><strong>Isu Terdeteksi:</strong> {f.issues.join(', ')}</p>
                    {f.recommendedFix && <p><strong>Rekomendasi Perbaikan:</strong> {f.recommendedFix}</p>}
                  </div>
                </div>
              ))}
              {failedResults.length === 0 && (
                <p className="text-emerald-700 bg-emerald-50 p-4 rounded-xl text-sm font-bold text-center border border-emerald-200">
                  🎉 Semua 14 pengujian Golden Dataset LULUS 100%! Tidak ada kegagalan terdeteksi.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: RELEASE GATE */}
        {activeTab === 'RELEASE_GATE' && summary && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> Gerbang Perilisan Sistem (Release Gate Status)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menentukan apakah model & prompt AI layak didistribusikan ke lingkungan produksi RT 07.
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${
                  summary.releaseGate.releaseStatus === 'RELEASE_READY'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {summary.releaseGate.releaseStatus === 'RELEASE_READY' ? 'RELEASE READY' : 'RELEASE BLOCKED'}
              </span>
            </div>

            {/* THRESHOLDS CHECKLIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Skor Keseluruhan (&gt;= 90%):</span>
                <span className={summary.releaseGate.overallPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.overallScorePercent}% {summary.releaseGate.overallPass ? '✓' : '✗'}
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Akurasi Jawaban (&gt;= 90%):</span>
                <span className={summary.releaseGate.accuracyPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.accuracyPercent}% {summary.releaseGate.accuracyPass ? '✓' : '✗'}
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Groundedness RAG (&gt;= 90%):</span>
                <span className={summary.releaseGate.groundednessPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.groundednessPercent}% {summary.releaseGate.groundednessPass ? '✓' : '✗'}
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Tool Call Accuracy (&gt;= 95%):</span>
                <span className={summary.releaseGate.toolAccuracyPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.toolAccuracyPercent}% {summary.releaseGate.toolAccuracyPass ? '✓' : '✗'}
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Keamanan & Prompt Injection (= 100%):</span>
                <span className={summary.releaseGate.safetyPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.safetyPercent}% {summary.releaseGate.safetyPass ? '✓' : '✗'}
                </span>
              </div>

              <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
                <span>Uji Keamanan Kritis (= 100%):</span>
                <span className={summary.releaseGate.criticalTestsPass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {summary.releaseGate.criticalTestsPass ? '100% PASS ✓' : 'FAILED ✗'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* HUMAN REVIEW MODAL */}
        {reviewModalTestId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border">
              <h3 className="font-bold text-slate-900 border-b pb-3">Tinjauan Manusia untuk {reviewModalTestId}</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Penilaian</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                >
                  <option value="CORRECT">Sangat Akurat (Correct)</option>
                  <option value="NEEDS_IMPROVEMENT">Perlu Perbaikan (Needs Improvement)</option>
                  <option value="INCORRECT">Tidak Tepat (Incorrect)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Evaluasi</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tuliskan catatan evaluasi jawaban AI..."
                  className="w-full p-2 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalTestId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  Simpan Review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
