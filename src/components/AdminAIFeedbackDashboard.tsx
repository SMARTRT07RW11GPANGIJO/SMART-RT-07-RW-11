import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/rt';
import {
  AIFeedbackRecord,
  FeedbackMetrics,
  FeedbackImprovementProposal,
  FeedbackStatus,
  FeedbackType,
  ReasonCode,
  PriorityLevel,
  RootCauseType,
  ImprovementType
} from '../types/aiFeedback';
import { AIFeedbackService, REASON_LABELS } from '../services/aiFeedbackService';
import {
  MessageSquareHeart,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  ShieldAlert,
  GitPullRequest,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  X,
  Send,
  Layers,
  BookOpen,
  Sliders,
  History,
  RotateCcw,
  Zap,
  Tag
} from 'lucide-react';

interface Props {
  currentUserRole: UserRole;
}

export const AdminAIFeedbackDashboard: React.FC<Props> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEEDBACK_LIST' | 'PROPOSALS' | 'ANALYTICS'>('OVERVIEW');
  const [metrics, setMetrics] = useState<FeedbackMetrics>(AIFeedbackService.getFeedbackMetrics());
  const [feedbackList, setFeedbackList] = useState<AIFeedbackRecord[]>(AIFeedbackService.getFeedbackList());
  const [proposals, setProposals] = useState<FeedbackImprovementProposal[]>(AIFeedbackService.getProposals());

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Record for Review Modal
  const [selectedFeedback, setSelectedFeedback] = useState<AIFeedbackRecord | null>(null);
  const [reviewValidation, setReviewValidation] = useState<'VALID' | 'INVALID'>('VALID');
  const [reviewRootCause, setReviewRootCause] = useState<RootCauseType>('KNOWLEDGE');
  const [reviewImprovementType, setReviewImprovementType] = useState<ImprovementType>('KNOWLEDGE_UPDATE');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewResolution, setReviewResolution] = useState<string>('');

  // New Proposal Form State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalImpType, setProposalImpType] = useState<ImprovementType>('PROMPT_IMPROVEMENT');
  const [proposalCurrVer, setProposalCurrVer] = useState('prompt-v1.4');
  const [proposalNewVer, setProposalNewVer] = useState('prompt-v1.5');
  const [proposalDesc, setProposalDesc] = useState('');
  const [selectedFbIds, setSelectedFbIds] = useState<string[]>([]);

  const refreshData = () => {
    setMetrics(AIFeedbackService.getFeedbackMetrics());
    setFeedbackList(
      AIFeedbackService.getFeedbackList({
        status: statusFilter !== 'ALL' ? (statusFilter as FeedbackStatus) : undefined,
        type: typeFilter !== 'ALL' ? (typeFilter as FeedbackType) : undefined,
        reasonCode: reasonFilter !== 'ALL' ? (reasonFilter as ReasonCode) : undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as PriorityLevel) : undefined,
        searchQuery: searchQuery || undefined
      })
    );
    setProposals(AIFeedbackService.getProposals());
  };

  useEffect(() => {
    refreshData();
  }, [statusFilter, typeFilter, reasonFilter, priorityFilter, searchQuery]);

  // Handle Review Submission
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    try {
      AIFeedbackService.reviewFeedback({
        feedbackId: selectedFeedback.feedbackId,
        reviewer: currentUserRole === 'KETUA_RT' ? 'Ketua RT 07' : 'Admin System',
        validation: reviewValidation,
        rootCause: reviewRootCause,
        improvementType: reviewImprovementType,
        reviewNotes,
        resolution: reviewResolution
      });
      setSelectedFeedback(null);
      refreshData();
    } catch (err: any) {
      alert(`Gagal menyimpan review: ${err.message}`);
    }
  };

  // Handle Create Proposal
  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFbIds.length === 0) {
      alert('Pilih minimal 1 feedback untuk dihubungkan ke proposal perbaikan.');
      return;
    }

    try {
      AIFeedbackService.createImprovementProposal({
        feedbackIds: selectedFbIds,
        title: proposalTitle,
        improvementType: proposalImpType,
        currentVersion: proposalCurrVer,
        proposedVersion: proposalNewVer,
        changesDescription: proposalDesc
      });
      setShowProposalModal(false);
      setProposalTitle('');
      setProposalDesc('');
      setSelectedFbIds([]);
      refreshData();
    } catch (err: any) {
      alert(`Gagal membuat proposal: ${err.message}`);
    }
  };

  const handleApproveProposal = (proposalId: string) => {
    AIFeedbackService.testAndApproveProposal(proposalId, currentUserRole === 'KETUA_RT' ? 'Ketua RT 07' : 'Admin System');
    refreshData();
  };

  const handleDeployProposal = (proposalId: string) => {
    AIFeedbackService.deployProposal(proposalId);
    refreshData();
  };

  const handleRollbackProposal = (proposalId: string) => {
    const reason = prompt('Masukkan alasan rollback ke versi sebelumnya:');
    if (reason) {
      AIFeedbackService.rollbackProposal(proposalId, reason);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-[#0D2A4A] via-[#1E3A5F] to-[#0D2A4A] text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-amber-400 text-slate-950 uppercase">
              TAHAP 9H — PRODUCTION
            </span>
            <span className="text-xs text-slate-300 font-mono">SMART RT 07 RW 11 GPA NGIJO</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <MessageSquareHeart className="w-7 h-7 text-amber-400" />
            AI User Feedback & Continuous Improvement System
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pipeline pengumpulan umpan balik pengguna, klasifikasi masalah, analisis akar penyebab (RCA), pembuatan proposal perbaikan, pengujian regresi, dan rilis versi baru RAG/Prompt/Knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Buat Proposal Perbaikan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#0D2A4A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard & Metrik</span>
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK_LIST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'FEEDBACK_LIST'
              ? 'bg-[#0D2A4A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Daftar Feedback ({metrics.totalFeedback})</span>
          {metrics.pendingReviewCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {metrics.pendingReviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('PROPOSALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PROPOSALS'
              ? 'bg-[#0D2A4A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Proposal & Versioning ({proposals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'bg-[#0D2A4A] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analisis RCA & Knowledge</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Feedback</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalFeedback}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Dari {metrics.totalAnswers} jawaban AI</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">👍 Membantu</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{metrics.positiveRate}</span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.positiveCount}</div>
              <span className="text-[10px] text-emerald-600/80 mt-1 block">Positive Feedback Rate</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">👎 Tidak Membantu</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{metrics.negativeRate}</span>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1">{metrics.negativeCount}</div>
              <span className="text-[10px] text-rose-600/80 mt-1 block">Negative Feedback Rate</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
              <div className="text-2xl font-black text-amber-700 mt-1">{metrics.pendingReviewCount}</div>
              <span className="text-[10px] text-amber-600/80 mt-1 block">Perlu Triage/Review</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Resolved & Released</span>
              <div className="text-2xl font-black text-blue-700 mt-1">{metrics.resolvedCount}</div>
              <span className="text-[10px] text-blue-600/80 mt-1 block">Sudah Diperbaiki</span>
            </div>
          </div>

          {/* Daily Trends & Top Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Daily Trend Chart Simulation */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0D2A4A]" />
                    Tren Harian Umpan Balik Pengguna
                  </h3>
                  <p className="text-[11px] text-slate-500">Perbandingan umpan balik positif (👍) dan negatif (👎) minggu ini.</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Feedback Rate: {metrics.feedbackRate}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.trends.map((t) => {
                  const totalDay = t.positive + t.negative;
                  const posPct = totalDay > 0 ? (t.positive / totalDay) * 100 : 0;
                  return (
                    <div key={t.period} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 w-16">{t.period}</span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-emerald-700 font-bold">👍 {t.positive}</span>
                          <span className="text-rose-700 font-bold">👎 {t.negative}</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${posPct}%` }} className="bg-emerald-500 h-full transition-all" />
                        <div style={{ width: `${100 - posPct}%` }} className="bg-rose-500 h-full transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Problems Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Top Negative Feedback Reasons
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">Kategori keluhan paling sering dari jawaban AI.</p>

                <div className="space-y-2.5">
                  {metrics.topProblems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada feedback negatif terdeteksi.</p>
                  ) : (
                    metrics.topProblems.map((p) => (
                      <div key={p.reason} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">{p.label}</span>
                          <span className="text-[10px] font-mono text-slate-500">{p.reason}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-black text-xs">
                          {p.count}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Setiap feedback negatif berulang memicu rekomendasi review otomatis pada dokumen RAG & Prompt.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACK LIST & REVIEW WORKFLOW */}
      {activeTab === 'FEEDBACK_LIST' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
            
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, pertanyaan, jawaban, atau komentar..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D2A4A] outline-none"
              />
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D2A4A] outline-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="NEW">NEW</option>
                <option value="TRIAGED">TRIAGED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="VALIDATED">VALIDATED</option>
                <option value="ACTION_REQUIRED">ACTION_REQUIRED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="INVALID">INVALID</option>
              </select>
            </div>

            {/* Filter Type */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D2A4A] outline-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="POSITIVE">👍 POSITIVE</option>
                <option value="NEGATIVE">👎 NEGATIVE</option>
              </select>
            </div>

            {/* Filter Priority */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0D2A4A] outline-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

          </div>

          {/* Feedback Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">ID & Timestamp</th>
                    <th className="p-3">Pengguna & Role</th>
                    <th className="p-3">Type & Reason</th>
                    <th className="p-3">Pertanyaan & Jawaban AI</th>
                    <th className="p-3">Prioritas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        Tidak ada catatan feedback ditemukan sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map((item) => {
                      return (
                        <tr key={item.feedbackId} className="hover:bg-slate-50 transition-colors">
                          
                          {/* ID & Time */}
                          <td className="p-3 font-mono">
                            <span className="font-bold text-[#0D2A4A] block">{item.feedbackId}</span>
                            <span className="text-[10px] text-slate-400 block">{new Date(item.timestamp).toLocaleString('id-ID')}</span>
                            {item.piiMasked && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold inline-block mt-0.5">
                                PII Masked
                              </span>
                            )}
                          </td>

                          {/* User */}
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{item.userId}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold inline-block mt-0.5">
                              {item.userRole}
                            </span>
                          </td>

                          {/* Type & Reason */}
                          <td className="p-3">
                            {item.feedbackType === 'POSITIVE' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> Membantu
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] inline-flex items-center gap-1">
                                  <ThumbsDown className="w-3 h-3" /> Tidak Membantu
                                </span>
                                {item.reasonCode && (
                                  <span className="text-[10px] text-slate-600 block font-medium">
                                    {REASON_LABELS[item.reasonCode] || item.reasonCode}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Question & Answer */}
                          <td className="p-3 max-w-md">
                            <p className="font-bold text-slate-800 line-clamp-1">Q: "{item.question}"</p>
                            <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">A: {item.answer}</p>
                            {item.comment && (
                              <div className="mt-1 p-1.5 bg-rose-50/60 rounded border border-rose-200 text-[10px] text-rose-900 italic">
                                "{item.comment}"
                              </div>
                            )}
                          </td>

                          {/* Priority */}
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.priority === 'CRITICAL'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                                  : item.priority === 'HIGH'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.priority === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {item.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedFeedback(item);
                                setReviewNotes(item.reviewNotes || '');
                                setReviewResolution(item.resolution || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0D2A4A] text-white font-bold text-xs hover:bg-[#1E3A5F] transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review & Audit</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPOSALS & VERSIONING QUEUE */}
      {activeTab === 'PROPOSALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-[#0D2A4A]" />
                Improvement Proposals & Release Versioning Pipeline
              </h3>
              <p className="text-xs text-slate-500">Proposal perbaikan AI berdasarkan validasi umpan balik warga. Memerlukan uji regresi sebelum rilis.</p>
            </div>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0D2A4A] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Buat Proposal Baru</span>
            </button>
          </div>

          {/* Proposals List */}
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 italic">
                Belum ada proposal perbaikan dibuat.
              </div>
            ) : (
              proposals.map((prop) => (
                <div key={prop.proposalId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0D2A4A] text-xs px-2 py-0.5 rounded bg-slate-100">
                        {prop.proposalId}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{prop.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {prop.improvementType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          prop.status === 'DEPLOYED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : prop.status === 'TESTING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Versi Sumber → Target</span>
                      <span className="font-mono font-bold text-slate-800">
                        {prop.currentVersion} → <span className="text-emerald-700">{prop.proposedVersion}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Uji Regresi (9F)</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {prop.testResults}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Target Feedback IDs</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {prop.feedbackIds.map((id) => (
                          <span key={id} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">Deskripsi Perubahan:</span> {prop.changesDescription}
                  </p>

                  {/* Action Controls for Proposal */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    {prop.status === 'PROPOSED' || prop.status === 'TESTING' ? (
                      <button
                        onClick={() => handleApproveProposal(prop.proposalId)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Jalankan Test & Setujui</span>
                      </button>
                    ) : null}

                    {prop.status === 'APPROVED' ? (
                      <button
                        onClick={() => handleDeployProposal(prop.proposalId)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Rilis ke Production ({prop.proposedVersion})</span>
                      </button>
                    ) : null}

                    {prop.status === 'DEPLOYED' ? (
                      <button
                        onClick={() => handleRollbackProposal(prop.proposalId)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback Versi</span>
                      </button>
                    ) : null}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & RCA */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Root Cause Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0D2A4A]" />
              Distribusi Root Cause Analysis (RCA)
            </h3>
            <p className="text-xs text-slate-500">Hasil pengelompokan sumber masalah dari umpan balik negatif yang tervalidasi.</p>

            <div className="space-y-2.5">
              {metrics.rootCauseDistribution.map((item) => (
                <div key={item.rootCause} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.rootCause}</span>
                    <span className="text-[10px] text-slate-500">Sistem / Komponen Terkait</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#0D2A4A] text-white font-bold">
                    {item.count} masalah
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Knowledge Issues Sync to 9G */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0D2A4A]" />
              Integrasi 9G — Top Outdated / Problematic Knowledge
            </h3>
            <p className="text-xs text-slate-500">Dokumen Knowledge Base yang sering mendapat umpan balik negatif warga.</p>

            <div className="space-y-2.5">
              {metrics.topKnowledgeIssues.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada dokumen bermasalah terdeteksi.</p>
              ) : (
                metrics.topKnowledgeIssues.map((doc) => (
                  <div key={doc.docId} className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{doc.docTitle}</span>
                      <span className="text-[10px] text-rose-700 font-semibold">{doc.status}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold">
                      👎 {doc.negativeCount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* REVIEW & AUDIT MODAL */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#0D2A4A] text-white p-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold">Review & Evaluasi Feedback: {selectedFeedback.feedbackId}</h3>
              <button onClick={() => setSelectedFeedback(null)} className="p-1 rounded text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Details Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Pertanyaan: "{selectedFeedback.question}"</p>
                <p className="text-slate-600">Jawaban AI: {selectedFeedback.answer}</p>
                {selectedFeedback.comment && (
                  <p className="text-rose-700 font-bold italic mt-1">Komentar Warga: "{selectedFeedback.comment}"</p>
                )}
              </div>

              {/* Validation Radio */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setReviewValidation('VALID')}
                  className={`p-3 rounded-xl border cursor-pointer text-center font-bold transition-all ${
                    reviewValidation === 'VALID' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  VALID (AI Memang Salah)
                </label>

                <label
                  onClick={() => setReviewValidation('INVALID')}
                  className={`p-3 rounded-xl border cursor-pointer text-center font-bold transition-all ${
                    reviewValidation === 'INVALID' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                  INVALID (AI Sudah Benar Sesuai SOP)
                </label>
              </div>

              {/* Root Cause Selector */}
              {reviewValidation === 'VALID' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Akar Penyebab (RCA)</label>
                    <select
                      value={reviewRootCause}
                      onChange={(e) => setReviewRootCause(e.target.value as RootCauseType)}
                      className="w-full p-2 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                    >
                      <option value="KNOWLEDGE">1. KNOWLEDGE (SOP/Dokumen Kedaluwarsa)</option>
                      <option value="PROMPT">2. PROMPT (Instruksi Kurang Tepat)</option>
                      <option value="RAG">3. RAG (Dokumen Tidak Relevan Terambil)</option>
                      <option value="MODEL">4. MODEL (Halusinasi Model AI)</option>
                      <option value="AUTHORIZATION">5. AUTHORIZATION (Izin Akses)</option>
                      <option value="TOOL">6. TOOL (Fungsi Otomasi Error)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Tipe Tindakan Perbaikan</label>
                    <select
                      value={reviewImprovementType}
                      onChange={(e) => setReviewImprovementType(e.target.value as ImprovementType)}
                      className="w-full p-2 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                    >
                      <option value="KNOWLEDGE_UPDATE">Update Dokumen Knowledge Base (9G)</option>
                      <option value="PROMPT_IMPROVEMENT">Perbaikan Prompt AI (AI System Prompt)</option>
                      <option value="RAG_IMPROVEMENT">Perbaikan Chunk / Filter RAG</option>
                      <option value="TOOL_IMPROVEMENT">Perbaikan Kode Tool / Function Call</option>
                      <option value="NO_ACTION">Tidak Perlu Perbaikan Langsung</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Catatan Evaluasi / Reviewer</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                  placeholder="Catatan analisis peninjau..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Resolusi / Tindakan Perbaikan</label>
                <input
                  type="text"
                  value={reviewResolution}
                  onChange={(e) => setReviewResolution(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                  placeholder="Langkah penyelesaian..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0D2A4A] text-white font-bold shadow-md"
                >
                  Simpan Evaluasi & Sinkronkan
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CREATE PROPOSAL MODAL */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-[#0D2A4A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-amber-400" />
                Buat Proposal Perbaikan AI Baru
              </h3>
              <button onClick={() => setShowProposalModal(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposalSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Proposal Perbaikan</label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Contoh: Optimasi Prompt Ringkas untuk Informasi Agenda"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tipe Perbaikan</label>
                  <select
                    value={proposalImpType}
                    onChange={(e) => setProposalImpType(e.target.value as ImprovementType)}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                  >
                    <option value="PROMPT_IMPROVEMENT">PROMPT_IMPROVEMENT</option>
                    <option value="RAG_IMPROVEMENT">RAG_IMPROVEMENT</option>
                    <option value="KNOWLEDGE_UPDATE">KNOWLEDGE_UPDATE</option>
                    <option value="TOOL_IMPROVEMENT">TOOL_IMPROVEMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Versi Target Baru</label>
                  <input
                    type="text"
                    required
                    value={proposalNewVer}
                    onChange={(e) => setProposalNewVer(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Pilih Feedback Terkait</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {feedbackList.map((fb) => (
                    <label key={fb.feedbackId} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFbIds.includes(fb.feedbackId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFbIds([...selectedFbIds, fb.feedbackId]);
                          } else {
                            setSelectedFbIds(selectedFbIds.filter((id) => id !== fb.feedbackId));
                          }
                        }}
                      />
                      <span className="font-mono font-bold text-slate-800">{fb.feedbackId}</span>
                      <span className="text-slate-600 truncate">({fb.reasonCode || fb.feedbackType}) - {fb.question}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Deskripsi & Rencana Perubahan</label>
                <textarea
                  required
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                  rows={3}
                  placeholder="Penjelasan perubahan prompt/RAG/knowledge..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0D2A4A] text-white font-bold shadow-md"
                >
                  Simpan Proposal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
