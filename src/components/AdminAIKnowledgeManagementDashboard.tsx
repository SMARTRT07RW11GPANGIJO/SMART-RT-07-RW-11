// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9G ADMIN AI KNOWLEDGE MANAGEMENT DASHBOARD

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Plus,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Eye,
  GitCompare,
  TrendingUp,
  Download,
  Database,
  Layers,
  Settings,
  Lock,
  Unlock,
  Play,
  Filter,
  Check,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import {
  DocumentMetadata,
  KnowledgeCategory,
  KnowledgeStatus,
  KnowledgeVisibility,
  KnowledgeHealthSummary,
  KnowledgeConflictInfo,
  KnowledgeRelease,
  KnowledgeDiffResult,
  RAGRetrieveResult
} from '../types/aiKnowledge';
import { AIKnowledgeManagementService } from '../services/aiKnowledgeManagementService';
import { RagRetrieverService, RagRetrievalOutput } from '../services/ragRetrieverService';
import { RagTestRunnerService, RagTestResult } from '../services/ragTestRunnerService';
import { UserRole } from '../types/rt';

interface Props {
  currentUserRole: UserRole;
}

export const AdminAIKnowledgeManagementDashboard: React.FC<Props> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'DOCUMENTS' | 'CATEGORIES' | 'PENDING' | 'DIFF' | 'RAG_SIMULATOR' | 'RELEASES'
  >('OVERVIEW');

  const [healthSummary, setHealthSummary] = useState<KnowledgeHealthSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [conflicts, setConflicts] = useState<KnowledgeConflictInfo[]>([]);
  const [releases, setReleases] = useState<KnowledgeRelease[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);

  // Add Doc Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('SOP');
  const [newVersion, setNewVersion] = useState<string>('v1.3');
  const [newContent, setNewContent] = useState<string>('');
  const [newEffectiveFrom, setNewEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newVisibility, setNewVisibility] = useState<KnowledgeVisibility>('PUBLIC');

  // Diff State
  const [diffDocA, setDiffDocA] = useState<string>('');
  const [diffDocB, setDiffDocB] = useState<string>('');
  const [diffResult, setDiffResult] = useState<KnowledgeDiffResult | null>(null);

  // RAG Simulator State
  const [simQuery, setSimQuery] = useState<string>('Berapa nominal iuran warga bulanan?');
  const [simRole, setSimRole] = useState<UserRole>('WARGA');
  const [simDate, setSimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [simResult, setSimResult] = useState<RAGRetrieveResult | null>(null);
  const [ragOutput, setRagOutput] = useState<RagRetrievalOutput | null>(null);
  const [testResults, setTestResults] = useState<RagTestResult[] | null>(null);

  // Access check
  if (currentUserRole !== 'ADMIN' && currentUserRole !== 'KETUA_RT') {
    return (
      <div className="p-8 text-center bg-red-900/20 border border-red-500/30 rounded-xl text-red-200">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <h3 className="text-xl font-bold">Akses Ditolak (403)</h3>
        <p className="text-sm mt-1 text-red-300">
          Modul AI Knowledge Management (Tahap 9G) hanya dapat diakses oleh Administrator & Ketua RT.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const health = AIKnowledgeManagementService.getHealthSummary();
    setHealthSummary(health);
    const docs = AIKnowledgeManagementService.getAllDocuments();
    setDocuments(docs);
    const confs = AIKnowledgeManagementService.detectConflicts();
    setConflicts(confs);
    const rels = AIKnowledgeManagementService.getReleases();
    setReleases(rels);

    if (docs.length >= 2) {
      setDiffDocA(docs[0].knowledgeId);
      setDiffDocB(docs[1].knowledgeId);
    }
  };

  const handleCreateDocument = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Judul dan isi dokumen wajib diisi.');
      return;
    }

    AIKnowledgeManagementService.createDocument(
      {
        title: newTitle,
        category: newCategory,
        version: newVersion,
        content: newContent,
        summary: newContent.slice(0, 100) + '...',
        effectiveFrom: newEffectiveFrom,
        visibility: newVisibility,
        source: `Upload Manual (${currentUserRole})`
      },
      currentUserRole
    );

    setAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    loadData();
    alert('✅ Dokumen baru berhasil disimpan dalam status DRAFT! Memerlukan Review & Approval sebelum diaktifkan.');
  };

  const handleApprove = (docId: string) => {
    try {
      AIKnowledgeManagementService.approveDocument(docId, currentUserRole, `Pengurus (${currentUserRole})`);
      loadData();
      alert('✅ Dokumen berhasil disetujui (APPROVED)!');
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleActivate = (docId: string) => {
    try {
      AIKnowledgeManagementService.activateDocument(docId, currentUserRole);
      loadData();
      alert('🚀 Dokumen resmi DIAKTIFKAN! Dokumen versi lama otomatis menjadi SUPERSEDED.');
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleRunDiff = () => {
    if (!diffDocA || !diffDocB) return;
    try {
      const res = AIKnowledgeManagementService.compareDocuments(diffDocA, diffDocB);
      setDiffResult(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRunSim = () => {
    const legacyRes = AIKnowledgeManagementService.ragRetrieveKnowledge(simQuery, simRole, simDate);
    setSimResult(legacyRes);

    const ragRes = RagRetrieverService.retrieve({
      query: simQuery,
      userId: `ADM-SIM`,
      userName: `Admin Tester (${simRole})`,
      role: simRole,
      currentDateStr: simDate,
      sourceChannel: 'ADMIN_TEST'
    });
    setRagOutput(ragRes);
  };

  const handleRunAutoTestSuite = () => {
    const results = RagTestRunnerService.runAllTestCases();
    setTestResults(results);
  };

  const handleCreateRelease = () => {
    const versionStr = `KB-${new Date().toISOString().slice(0, 7)}-v${releases.length + 1}.0`;
    AIKnowledgeManagementService.createRelease(versionStr, 'Rilis Knowledge Base 9G Terbaru', currentUserRole);
    loadData();
    alert(`🎉 Release ${versionStr} berhasil diterbitkan!`);
  };

  const filteredDocs = documents.filter((d) => {
    const matchCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.knowledgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.version.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  AI Knowledge Management Engine
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    TAHAP 9G
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Sistem Tata Kelola Pengetahuan AI Berversi (AD/ART, SOP, Peraturan, Layanan, FAQ, Kontak, Pengumuman)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Tambah Dokumen (Draft)
            </button>
            <button
              onClick={handleCreateRelease}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Terbitkan Release
            </button>
            <button
              onClick={loadData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* METADATA SUMMARY BAR */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">KB Health Score:</span>
            <span
              className={`font-mono font-extrabold text-sm ${
                (healthSummary?.healthScorePercent || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {healthSummary?.healthScorePercent || 0}% HEALTHY
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Total Dokumen:</span>
            <span className="font-mono text-white font-semibold text-sm">{healthSummary?.totalDocuments || 0} File</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Dokumen Active:</span>
            <span className="font-mono text-emerald-400 font-semibold text-sm">{healthSummary?.activeDocuments || 0} Valid</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Pending Review:</span>
            <span className="font-mono text-amber-400 font-semibold text-sm">{healthSummary?.pendingReview || 0} Items</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Konflik Dokumen:</span>
            <span
              className={`font-mono font-bold text-sm ${
                (healthSummary?.conflictCount || 0) > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {healthSummary?.conflictCount || 0} Conflicts
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Versi Release AI:</span>
            <span className="font-mono text-cyan-300 font-semibold text-sm">{healthSummary?.lastReleaseVersion}</span>
          </div>
        </div>
      </div>

      {/* CONFLICT WARNING BANNER */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-2xl flex items-start gap-3 text-rose-200">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-rose-300">Peringatan Konflik Pengetahuan AI (Critical Knowledge Conflict)</h4>
            <p>
              Terdeteksi {conflicts.length} konflik dokumen aktif. AI dilarang memilih jawaban secara acak. Harap lakukan supersede pada salah satu dokumen.
            </p>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Overview & Health' },
          { id: 'DOCUMENTS', label: `Documents & Versions (${documents.length})` },
          { id: 'CATEGORIES', label: '7 Categories Hub' },
          { id: 'PENDING', label: `Pending Review (${healthSummary?.pendingReview || 0})` },
          { id: 'DIFF', label: 'Version Diff Tool' },
          { id: 'RAG_SIMULATOR', label: 'RAG Effective Date Test' },
          { id: 'RELEASES', label: 'Releases & Rollback' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatusMetricCard title="ACTIVE (Current)" count={healthSummary?.activeDocuments || 0} color="emerald" desc="Digunakan AI untuk RAG" />
            <StatusMetricCard title="PENDING (Review)" count={healthSummary?.pendingReview || 0} color="amber" desc="Menunggu persetujuan RT" />
            <StatusMetricCard title="SUPERSEDED" count={healthSummary?.supersededDocuments || 0} color="indigo" desc="Versi lama tidak aktif" />
            <StatusMetricCard title="ARCHIVED" count={healthSummary?.archivedDocuments || 0} color="slate" desc="Arsip sejarah organisasi" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Prinsip Pengetahuan AI (AI Knowledge Governance Rules)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 1. APPROVED & ACTIVE ONLY
                </div>
                <p className="text-slate-400">
                  AI tidak diperbolehkan menggunakan dokumen status DRAFT atau REJECTED, meskipun file diunggah terbaru.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 2. EFFECTIVE DATE LOGIC
                </div>
                <p className="text-slate-400">
                  Dokumen versi baru dengan <code>effectiveFrom</code> masa depan (future date) tidak digunakan sampai tanggal tsb tiba.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 3. AUTHORIZATION & PRIVACY
                </div>
                <p className="text-slate-400">
                  Pengetahuan berspesifikasi RESTRICTED/INTERNAL disaring ketat di server-side berdasarkan role pemohon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS & VERSIONS TABLE */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Daftar Dokumen Pengetahuan Terverifikasi
            </h3>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari judul/ID/versi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="AD_ART">AD_ART</option>
                <option value="SOP">SOP</option>
                <option value="PERATURAN">PERATURAN</option>
                <option value="LAYANAN">LAYANAN</option>
                <option value="FAQ">FAQ</option>
                <option value="KONTAK">KONTAK</option>
                <option value="PENGUMUMAN">PENGUMUMAN</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="APPROVED">APPROVED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="SUPERSEDED">SUPERSEDED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr>
                  <th className="p-3">ID & Versi</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Judul Dokumen</th>
                  <th className="p-3">Berlaku Dari</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDocs.map((doc) => (
                  <tr key={doc.knowledgeId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-mono font-bold text-blue-400">{doc.knowledgeId}</div>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800 text-[10px]">
                        {doc.version}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{doc.category}</td>
                    <td className="p-3 max-w-xs font-medium text-white">{doc.title}</td>
                    <td className="p-3 font-mono text-slate-300">{doc.effectiveFrom}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          doc.visibility === 'PUBLIC'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : doc.visibility === 'INTERNAL'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {doc.visibility}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          doc.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : doc.status === 'APPROVED'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : doc.status === 'DRAFT' || doc.status === 'UNDER_REVIEW'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {doc.status === 'UNDER_REVIEW' || doc.status === 'DRAFT' ? (
                        <button
                          onClick={() => handleApprove(doc.knowledgeId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-[10px] transition"
                        >
                          Approve
                        </button>
                      ) : null}
                      {doc.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleActivate(doc.knowledgeId)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-[10px] transition"
                        >
                          Activate
                        </button>
                      ) : null}
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-[10px]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 7 CATEGORIES HUB */}
      {activeTab === 'CATEGORIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'AD_ART', desc: 'Anggaran Dasar & Anggaran Rumah Tangga Organisasi RT 07' },
            { name: 'SOP', desc: 'Standar Operasional Prosedur Pelayanan, Iuran & Keamanan' },
            { name: 'PERATURAN', desc: 'Peraturan Warga, Jam Portal, Ketertiban Lingkungan' },
            { name: 'LAYANAN', desc: 'Katalog Layanan Digital, Administrasi & Fasilitas Warga' },
            { name: 'FAQ', desc: 'Daftar Pertanyaan Sering Diajukan Warga & Jawaban Resmi' },
            { name: 'KONTAK', desc: 'Kontak Resmi Pengurus RT, Jam Pelayanan & Alamat' },
            { name: 'PENGUMUMAN', desc: 'Pengumuman Resmi Kegiatan & Informasi Terkini' }
          ].map((cat) => {
            const docsInCat = documents.filter((d) => d.category === cat.name);
            const activeDoc = docsInCat.find((d) => d.status === 'ACTIVE');
            return (
              <div key={cat.name} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    {cat.name}
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    {docsInCat.length} Docs
                  </span>
                </div>
                <p className="text-xs text-slate-400">{cat.desc}</p>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500 block">Versi Aktif Saat Ini:</span>
                  {activeDoc ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {activeDoc.title} ({activeDoc.version})
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold">Tidak Ada Versi Aktif</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: PENDING REVIEW */}
      {activeTab === 'PENDING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Dokumen Menunggu Review & Approval Dual Control
          </h3>

          {documents.filter((d) => d.status === 'DRAFT' || d.status === 'UNDER_REVIEW').length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="font-semibold text-emerald-300">Semua Dokumen Telah Disetujui!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents
                .filter((d) => d.status === 'DRAFT' || d.status === 'UNDER_REVIEW')
                .map((d) => (
                  <div key={d.knowledgeId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-400">{d.knowledgeId}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{d.version}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{d.status}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{d.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{d.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(d.knowledgeId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        Setujui (Approve)
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VERSION DIFF TOOL */}
      {activeTab === 'DIFF' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            Alat Pembanding Versi Dokumen (Version Diff Engine)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Dokumen Versi Awal (Source):</label>
              <select
                value={diffDocA}
                onChange={(e) => setDiffDocA(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              >
                {documents.map((d) => (
                  <option key={d.knowledgeId} value={d.knowledgeId}>
                    {d.knowledgeId} — {d.title} ({d.version})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Dokumen Versi Pembanding (Target):</label>
              <select
                value={diffDocB}
                onChange={(e) => setDiffDocB(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              >
                {documents.map((d) => (
                  <option key={d.knowledgeId} value={d.knowledgeId}>
                    {d.knowledgeId} — {d.title} ({d.version})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunDiff}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            Jalankan Analisis Perbedaan (Diff)
          </button>

          {diffResult && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Hasil Perbandingan Versi:</h4>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">Perubahan Metadata:</span>
                {diffResult.changedMetadata.length === 0 ? (
                  <span className="text-slate-500 italic">Tidak ada perubahan metadata.</span>
                ) : (
                  diffResult.changedMetadata.map((m, idx) => (
                    <div key={idx} className="text-cyan-300">
                      • <strong>{m.field}</strong>: {m.oldValue} &rarr; {m.newValue}
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-rose-400 font-bold block mb-1">Teks Dihapus / Diubah:</span>
                  {diffResult.removedLines.length === 0 ? (
                    <span className="text-slate-500 italic">Tidak ada.</span>
                  ) : (
                    diffResult.removedLines.map((l, idx) => (
                      <div key={idx} className="bg-rose-950/30 text-rose-300 p-1.5 rounded font-mono text-[11px] my-1">
                        - {l}
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <span className="text-emerald-400 font-bold block mb-1">Teks Ditambahkan:</span>
                  {diffResult.addedLines.length === 0 ? (
                    <span className="text-slate-500 italic">Tidak ada.</span>
                  ) : (
                    diffResult.addedLines.map((l, idx) => (
                      <div key={idx} className="bg-emerald-950/30 text-emerald-300 p-1.5 rounded font-mono text-[11px] my-1">
                        + {l}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: RAG SIMULATOR & AUTOMATED TEST MATRIX */}
      {activeTab === 'RAG_SIMULATOR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Tahap 8G RAG Retriever Engine & Test Suite Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Uji mekanisme RAG, query classification, authorization filter, boundary tags, dan otomatisasi test suite (RAG-001 s/d RAG-014).
              </p>
            </div>
            <button
              onClick={handleRunAutoTestSuite}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Jalankan Automated Test Suite (14 Scenarios)
            </button>
          </div>

          {/* Interactive Single Test Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Simulasi Query RAG Interaktif:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Pertanyaan Simulasi:</label>
                <input
                  type="text"
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Role Pemohon:</label>
                <select
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="WARGA">WARGA (Public Documents Only)</option>
                  <option value="PENGURUS">PENGURUS (Public + Internal)</option>
                  <option value="ADMIN">ADMIN (Public + Internal + Restricted)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tanggal Simulasi (Effective Date):</label>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunSim}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Jalankan Retrieval RAG
            </button>

            {ragOutput && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Klasifikasi Intent:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                      {ragOutput.queryType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Confidence:</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      ragOutput.confidence === 'HIGH_CONFIDENCE' ? 'bg-emerald-500/20 text-emerald-400' :
                      ragOutput.confidence === 'MEDIUM_CONFIDENCE' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {ragOutput.confidence}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {ragOutput.correlationId}
                  </span>
                </div>

                {ragOutput.deniedReason ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 space-y-1">
                    <strong className="block text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Akses Ditolak / Privacy Guard Active:
                    </strong>
                    <p>{ragOutput.deniedReason}</p>
                  </div>
                ) : ragOutput.found ? (
                  <div className="space-y-2">
                    <div className="text-blue-300 font-bold">
                      📌 Dokumen Ditemukan: {ragOutput.retrievedDocuments[0]?.title} ({ragOutput.retrievedDocuments[0]?.version})
                    </div>
                    <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                      {ragOutput.synthesizedAnswer}
                    </p>
                    <div className="text-emerald-400 font-mono text-[11px]">
                      {ragOutput.sourceCitation}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-300">
                    Informasi tidak ditemukan dalam Knowledge Base resmi RT 07.
                  </div>
                )}

                {/* Prompt Boundary Context Preview */}
                <details className="pt-2 border-t border-slate-800">
                  <summary className="text-slate-400 hover:text-white font-mono cursor-pointer">
                    🔍 Lihat Boundary Context Tag (&lt;KNOWLEDGE_CONTEXT&gt;)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {ragOutput.contextPrompt}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Automated Test Results Matrix Table */}
          {testResults && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Results Test Matrix (20 Scenarios)
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Total Test: {testResults.length} | Passed: {testResults.filter(t => t.status === 'PASS' || t.status === 'BLOCKED').length}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Test ID</th>
                      <th className="p-3">Nama Skenario</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Query</th>
                      <th className="p-3">Scope / Auth</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Catatan Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {testResults.map((t) => (
                      <tr key={t.testId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-cyan-300">{t.testId}</td>
                        <td className="p-3 font-semibold text-white">{t.name}</td>
                        <td className="p-3 font-mono text-slate-400">{t.userRole}</td>
                        <td className="p-3 max-w-xs truncate text-slate-300">{t.query}</td>
                        <td className="p-3 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.authorization === 'ALLOWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {t.expectedScope} / {t.authorization}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black ${
                            t.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            t.status === 'BLOCKED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 max-w-xs truncate">{t.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: RELEASES & ROLLBACK */}
      {activeTab === 'RELEASES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-400" />
            Riwayat Rilis Knowledge Base & Fitur Rollback
          </h3>

          <div className="space-y-3">
            {releases.map((rel) => (
              <div key={rel.releaseId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-cyan-300">{rel.releaseId}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{rel.status}</span>
                </div>
                <h4 className="text-sm font-bold text-white">Versi Rilis: {rel.version}</h4>
                <p className="text-xs text-slate-400">{rel.notes}</p>
                <div className="text-xs text-slate-500">
                  Diterbitkan oleh: {rel.releasedBy} | {new Date(rel.releasedAt).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD DOCUMENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Tambah Dokumen Pengetahuan Baru (Draft Status)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Judul Dokumen:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SOP Penanganan Sampah Warga"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Kategori Dokumen:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="AD_ART">AD_ART</option>
                    <option value="SOP">SOP</option>
                    <option value="PERATURAN">PERATURAN</option>
                    <option value="LAYANAN">LAYANAN</option>
                    <option value="FAQ">FAQ</option>
                    <option value="KONTAK">KONTAK</option>
                    <option value="PENGUMUMAN">PENGUMUMAN</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Versi (Format Major.Minor):</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tanggal Tanggal Berlaku (Effective From):</label>
                  <input
                    type="date"
                    value={newEffectiveFrom}
                    onChange={(e) => setNewEffectiveFrom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Tingkat Visibilitas (Visibility):</label>
                  <select
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="PUBLIC">PUBLIC (Dapat diakses Warga)</option>
                    <option value="INTERNAL">INTERNAL (Pengurus Only)</option>
                    <option value="RESTRICTED">RESTRICTED (Admin & Ketua RT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Isi Lengkap Dokumen:</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Tuliskan prosedur, pasal, atau informasi resmi lengkap..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Simpan Sebagai Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT DETAIL MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">{selectedDoc.title}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                <div>ID: <span className="font-mono text-blue-400">{selectedDoc.knowledgeId}</span></div>
                <div>Versi: <span className="font-mono text-emerald-400">{selectedDoc.version}</span></div>
                <div>Kategori: <span className="text-slate-200">{selectedDoc.category}</span></div>
                <div>Status: <span className="font-bold text-amber-400">{selectedDoc.status}</span></div>
                <div>Berlaku: <span className="text-slate-300">{selectedDoc.effectiveFrom}</span></div>
                <div>Visibility: <span className="text-slate-300">{selectedDoc.visibility}</span></div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Isi Dokumen:</span>
                <p className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 leading-relaxed">
                  {selectedDoc.content}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Sumber Resmi:</span>
                <p className="text-slate-300">{selectedDoc.source}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatusMetricCardProps {
  title: string;
  count: number;
  color: string;
  desc: string;
}

const StatusMetricCard: React.FC<StatusMetricCardProps> = ({ title, count, color, desc }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
    <span className="text-xs text-slate-400 uppercase font-semibold">{title}</span>
    <div className="text-2xl font-bold text-white">{count} Docs</div>
    <p className="text-[11px] text-slate-400">{desc}</p>
  </div>
);
