/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Modal & Main View for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Trash2,
  Car,
  Users,
  Volume2,
  Dog,
  Hammer,
  DollarSign,
  Home,
  AlertTriangle,
  Search,
  CheckCircle,
  CheckSquare,
  Printer,
  Download,
  ThumbsUp,
  ThumbsDown,
  Info,
  Clock,
  Plus,
  Send,
  Lock,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  Award,
  BookOpen,
  Calendar,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types/rt';
import {
  TataTertibArticle,
  TataTertibCategory,
  TataTertibHistory,
  TataTertibStatus
} from '../types/tataTertib';
import { TataTertibService } from '../services/tataTertibService';

interface TataTertibModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentUserName?: string;
  openComplaintModal?: () => void;
  openFinanceModal?: () => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TataTertibModal: React.FC<TataTertibModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUserName = 'Bpk. Warga RT 07',
  openComplaintModal,
  openFinanceModal,
  addToast
}) => {
  const userId = currentRole === 'WARGA' ? 'warga_01' : currentRole === 'KETUA_RT' ? 'ketua_rt' : currentRole === 'PENGURUS' ? 'pengurus_01' : 'admin_01';

  // Submenu Tabs
  const [activeTab, setActiveTab] = useState<
    | 'UMUM'
    | 'HAK_KEWAJIBAN'
    | 'KEAMANAN'
    | 'KEBERSIHAN'
    | 'PARKIR'
    | 'TAMU'
    | 'KEGIATAN'
    | 'HEWAN'
    | 'RENOVASI'
    | 'KEUANGAN'
    | 'FASILITAS'
    | 'PELANGGARAN'
    | 'DOKUMEN'
    | 'RIWAYAT'
    | 'ADMIN_PANEL'
  >('UMUM');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Articles & Data State
  const [articles, setArticles] = useState<TataTertibArticle[]>([]);
  const [history, setHistory] = useState<TataTertibHistory[]>([]);
  const [stats, setStats] = useState(TataTertibService.getSummaryStats());
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // Expanded articles in view
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('TT-001');

  // Feedback Tracking
  const [feedbackGiven, setFeedbackGiven] = useState<{ [articleId: string]: boolean }>({});

  // Draft Creation Form
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftForm, setDraftForm] = useState({
    category: 'UMUM' as TataTertibCategory,
    title: '',
    summary: '',
    content: '',
    keywords: '',
    effectiveDate: '2026-08-17'
  });

  // Approval Form
  const [approvalModalArticle, setApprovalModalArticle] = useState<TataTertibArticle | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    newVersion: '1.2',
    effectiveDate: '2026-08-17',
    changeSummary: 'Revisi & pembaruan pasal tata tertib warga'
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const allArticles = TataTertibService.getArticles();
    setArticles(allArticles);
    setHistory(TataTertibService.getHistoryList());
    const currentStats = TataTertibService.getSummaryStats();
    setStats(currentStats);
    setIsAcknowledged(TataTertibService.isUserAcknowledged(userId, currentStats.activeVersion));
  };

  const handleAcknowledge = () => {
    const res = TataTertibService.acknowledge(userId, currentUserName, stats.activeVersion);
    if (res.success) {
      setIsAcknowledged(true);
      setStats(TataTertibService.getSummaryStats());
      if (addToast) addToast(res.message, 'success');
    }
  };

  const handleFeedback = (articleId: string, isHelpful: boolean) => {
    const res = TataTertibService.submitFeedback(articleId, isHelpful, '', userId);
    setFeedbackGiven(prev => ({ ...prev, [articleId]: true }));
    if (addToast) addToast(res.message, 'info');
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftForm.title || !draftForm.content) {
      if (addToast) addToast('Judul dan isi tata tertib wajib diisi', 'error');
      return;
    }

    const res = TataTertibService.createDraft(
      {
        category: draftForm.category,
        title: draftForm.title,
        summary: draftForm.summary,
        content: draftForm.content,
        keywords: draftForm.keywords.split(',').map(k => k.trim()),
        effectiveDate: draftForm.effectiveDate
      },
      currentRole,
      currentUserName
    );

    if (res.success) {
      if (addToast) addToast(res.message, 'success');
      setShowDraftModal(false);
      setDraftForm({
        category: 'UMUM',
        title: '',
        summary: '',
        content: '',
        keywords: '',
        effectiveDate: '2026-08-17'
      });
      loadData();
    } else {
      if (addToast) addToast(res.message, 'error');
    }
  };

  const handleSubmitForApproval = (articleId: string) => {
    const res = TataTertibService.submitForApproval(articleId, currentRole, currentUserName);
    if (res.success) {
      if (addToast) addToast(res.message, 'success');
      loadData();
    } else {
      if (addToast) addToast(res.message, 'error');
    }
  };

  const handleApproveAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalArticle) return;

    const res = TataTertibService.approveAndPublish(
      approvalModalArticle.id,
      approvalForm.newVersion,
      approvalForm.effectiveDate,
      approvalForm.changeSummary,
      currentRole,
      currentUserName
    );

    if (res.success) {
      if (addToast) addToast(res.message, 'success');
      setApprovalModalArticle(null);
      loadData();
    } else {
      if (addToast) addToast(res.message, 'error');
    }
  };

  const handleArchive = (articleId: string) => {
    if (window.confirm('Apakah Anda yakin ingin mengarsipkan aturan tata tertib ini?')) {
      const res = TataTertibService.archiveArticle(articleId, currentRole, currentUserName);
      if (res.success) {
        if (addToast) addToast(res.message, 'info');
        loadData();
      }
    }
  };

  // Filter Articles for Display
  const filteredArticles = articles.filter(art => {
    // Only PUBLIC/WARGA see ACTIVE status unless searching or in Admin Panel
    if (activeTab !== 'ADMIN_PANEL' && art.status !== 'ACTIVE') return false;

    // Filter by tab
    if (activeTab === 'UMUM' && art.category !== 'UMUM') return false;
    if (activeTab === 'HAK_KEWAJIBAN' && art.category !== 'KEWAJIBAN_WARGA') return false;
    if (activeTab === 'KEAMANAN' && art.category !== 'KEAMANAN') return false;
    if (activeTab === 'KEBERSIHAN' && art.category !== 'KEBERSIHAN') return false;
    if (activeTab === 'PARKIR' && art.category !== 'PARKIR') return false;
    if (activeTab === 'TAMU' && art.category !== 'TAMU') return false;
    if (activeTab === 'KEGIATAN' && art.category !== 'KEGIATAN') return false;
    if (activeTab === 'HEWAN' && art.category !== 'HEWAN') return false;
    if (activeTab === 'RENOVASI' && art.category !== 'RENOVASI') return false;
    if (activeTab === 'KEUANGAN' && art.category !== 'KEUANGAN') return false;
    if (activeTab === 'FASILITAS' && art.category !== 'FASILITAS') return false;
    if (activeTab === 'PELANGGARAN' && art.category !== 'PELANGGARAN') return false;

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = art.summary.toLowerCase().includes(q);
      const matchContent = art.content.toLowerCase().includes(q);
      const matchKeywords = art.keywords.some(k => k.toLowerCase().includes(q));
      const matchNum = art.number.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchContent || matchKeywords || matchNum;
    }

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-700/50 rounded-xl border border-emerald-500/30">
              <BookOpen className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">📜 TATA TERTIB WARGA</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Versi {stats.activeVersion}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Status: AKTIF
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                RT 07 RW 11 Perumahan Graha Permata Anugrah (GPA), Desa Ngijo, Karangploso • Berlaku sejak: {stats.effectiveDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* SEARCH & ACKNOWLEDGEMENT BANNER */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="🔎 Cari pasal, kata kunci, parkir, iuran, tamu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Acknowledgement Status Pill */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {isAcknowledged ? (
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Anda telah membaca & menyetujui Versi {stats.activeVersion}</span>
              </div>
            ) : (
              <button
                onClick={handleAcknowledge}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md active:scale-95"
              >
                <CheckSquare className="w-4 h-4" />
                <span>SAYA SUDAH MEMBACA</span>
              </button>
            )}
          </div>
        </div>

        {/* SUBMENU NAVIGATION TABS */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center space-x-1 overflow-x-auto text-xs scrollbar-thin">
          <button
            onClick={() => setActiveTab('UMUM')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'UMUM' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>🏠 Umum</span>
          </button>

          <button
            onClick={() => setActiveTab('HAK_KEWAJIBAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'HAK_KEWAJIBAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👨‍👩‍👧 Hak & Kewajiban</span>
          </button>

          <button
            onClick={() => setActiveTab('KEAMANAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'KEAMANAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>🛡️ Keamanan</span>
          </button>

          <button
            onClick={() => setActiveTab('KEBERSIHAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'KEBERSIHAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>🧹 Kebersihan</span>
          </button>

          <button
            onClick={() => setActiveTab('PARKIR')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'PARKIR' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>🚗 Parkir</span>
          </button>

          <button
            onClick={() => setActiveTab('TAMU')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'TAMU' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Tamu</span>
          </button>

          <button
            onClick={() => setActiveTab('KEGIATAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'KEGIATAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>🔊 Kegiatan</span>
          </button>

          <button
            onClick={() => setActiveTab('HEWAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'HEWAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Dog className="w-3.5 h-3.5" />
            <span>🐕 Hewan</span>
          </button>

          <button
            onClick={() => setActiveTab('RENOVASI')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'RENOVASI' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>🏗️ Renovasi</span>
          </button>

          <button
            onClick={() => setActiveTab('KEUANGAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'KEUANGAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>💰 Iuran</span>
          </button>

          <button
            onClick={() => setActiveTab('FASILITAS')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'FASILITAS' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>🏘️ Fasilitas</span>
          </button>

          <button
            onClick={() => setActiveTab('PELANGGARAN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'PELANGGARAN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ Pelanggaran</span>
          </button>

          <button
            onClick={() => setActiveTab('DOKUMEN')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'DOKUMEN' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>📄 Dokumen PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('RIWAYAT')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'RIWAYAT' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📢 Riwayat Versi</span>
          </button>

          {['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(currentRole) && (
            <button
              onClick={() => setActiveTab('ADMIN_PANEL')}
              className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'ADMIN_PANEL' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>⚙️ Panel Pengurus</span>
            </button>
          )}
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

          {/* TAB: DOKUMEN PDF & CETAK A4 */}
          {activeTab === 'DOKUMEN' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
              
              {/* PRINT CONTROLS */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">📄 Dokumen Resmi Tata Tertib Warga</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cetak atau simpan sebagai PDF dokumen resmi versi {stats.activeVersion} berserta Kop RT 07 & QR Verification Code.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ CETAK A4</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>📄 SIMPAN PDF</span>
                  </button>
                </div>
              </div>

              {/* OFFICIAL A4 DOCUMENT PRINT CONTAINER */}
              <div id="printable-tata-tertib-document" className="p-8 bg-white font-serif text-slate-900 border border-slate-200 rounded-xl space-y-6">
                
                {/* OFFICIAL KOP SURAT RT */}
                <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1">
                  <h2 className="text-sm font-bold tracking-widest text-slate-900 uppercase">RUKUN TETANGGA 07 RUKUN WARGA 11</h2>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">PERUMAHAN GRAHA PERMATA ANUGRAH (GPA)</h1>
                  <p className="text-xs font-sans text-slate-700">
                    Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152
                  </p>
                  <p className="text-[11px] font-sans text-slate-500 italic">
                    Email: rt07rw11.gpa@gmail.com • Portal Web Official: SMART RT 07
                  </p>
                </div>

                {/* DOCUMENT TITLE & REGISTRATION */}
                <div className="text-center space-y-1 py-2">
                  <h2 className="text-lg font-bold uppercase underline tracking-wide">TATA TERTIB WARGA RT 07 RW 11</h2>
                  <p className="font-sans text-xs text-slate-700">
                    Nomor Dokumen: Dok/TT-RT07/VIII/2026 • Versi: {stats.activeVersion}
                  </p>
                  <p className="font-sans text-xs text-slate-600 italic">
                    Disahkan & Berlaku Efektif Sejak: {stats.effectiveDate}
                  </p>
                </div>

                {/* FULL ARTICLES PRINT CONTENT */}
                <div className="space-y-6 text-sm leading-relaxed text-slate-800 font-sans">
                  {articles.filter(a => a.status === 'ACTIVE').map(art => (
                    <div key={art.id} className="space-y-2 border-b border-slate-100 pb-4">
                      <h3 className="font-bold text-slate-900 text-base">{art.title}</h3>
                      <p className="text-xs text-slate-600 italic">{art.summary}</p>
                      <div className="whitespace-pre-line text-xs pl-3 border-l-2 border-emerald-600 text-slate-800 font-sans mt-2">
                        {art.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* OFFICIAL SIGNATURES & QR VERIFICATION */}
                <div className="pt-8 border-t border-slate-300 flex items-end justify-between font-sans text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700">Verifikasi Dokumen Digital:</p>
                    <div className="p-2 border border-slate-300 rounded-lg bg-slate-50 inline-block text-center">
                      <div className="w-20 h-20 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center p-1 text-center rounded">
                        QR-VERIFY<br/>TT-RT07-v1.1<br/>VALID-OFFICIAL
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Scan untuk otentikasi</p>
                    </div>
                  </div>

                  <div className="text-center space-y-12">
                    <div>
                      <p className="text-slate-600">Ditetapkan di Ngijo, Malang</p>
                      <p className="font-bold text-slate-800">Mengetahui & Menyetujui,</p>
                      <p className="font-semibold text-slate-700">Ketua RT 07 RW 11 GPA Ngijo</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 text-sm underline uppercase">Bapak Sutrisno, M.P.</p>
                      <p className="text-[10px] text-slate-500">Masa Bakti 2024 - 2027</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: RIWAYAT PERUBAHAN VERSI */}
          {activeTab === 'RIWAYAT' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">📢 Riwayat Perubahan & Versi Tata Tertib</h3>
                  <p className="text-xs text-slate-500">Log transparansi revisi dokumen resmi dari masa ke masa.</p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                  Versi Aktif Saat Ini: v{stats.activeVersion}
                </div>
              </div>

              <div className="space-y-4">
                {history.map(h => (
                  <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded-lg font-bold text-xs">
                          Versi {h.version}
                        </span>
                        <span className="text-xs text-slate-500">
                          Disahkan: {new Date(h.approvedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Oleh: {h.approvedBy}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{h.changeSummary}</p>
                    <p className="text-xs text-slate-500 italic">Berlaku Efektif Sejak: {h.effectiveDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ADMIN PANEL (FOR PENGURUS/KETUA_RT/ADMIN) */}
          {activeTab === 'ADMIN_PANEL' && ['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(currentRole) && (
            <div className="space-y-6">
              
              {/* ADMIN DASHBOARD STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Versi Aktif</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">v{stats.activeVersion}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Efektif: {stats.effectiveDate}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Aturan Aktif</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.activeCount} Pasal</p>
                  <p className="text-[10px] text-slate-400 mt-1">Telah disahkan Ketua RT</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Draft & Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.draftCount + stats.pendingCount}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.pendingCount} menunggu approval</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">Warga Membaca (Ack)</p>
                  <p className="text-2xl font-bold text-cyan-600 mt-1">{stats.ackPercentage}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.ackCount} dari {stats.totalWarga} KK</p>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-800">⚙️ Pengelolaan Konten Tata Tertib</h3>
                  <p className="text-xs text-slate-500">Pengurus dapat membuat draft, Ketua RT meninjau & mengesahkan.</p>
                </div>
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="flex items-center space-x-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Draft Aturan Baru</span>
                </button>
              </div>

              {/* ARTICLES LIST FOR ADMIN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Daftar Semua Aturan & Draft</h4>
                <div className="space-y-3">
                  {articles.map(art => (
                    <div key={art.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            #{art.number}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            art.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            art.status === 'DRAFT' ? 'bg-slate-200 text-slate-800' :
                            art.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {art.status}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">{art.category}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{art.title}</p>
                        <p className="text-xs text-slate-500">{art.summary}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {art.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmitForApproval(art.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Ajukan Review</span>
                          </button>
                        )}

                        {art.status === 'PENDING_APPROVAL' && ['KETUA_RT', 'ADMIN'].includes(currentRole) && (
                          <button
                            onClick={() => {
                              setApprovalModalArticle(art);
                              setApprovalForm({
                                newVersion: '1.2',
                                effectiveDate: new Date().toISOString().split('T')[0],
                                changeSummary: `Pengesahan ${art.title}`
                              });
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                        )}

                        {art.status === 'ACTIVE' && ['KETUA_RT', 'ADMIN'].includes(currentRole) && (
                          <button
                            onClick={() => handleArchive(art.id)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Arsip</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STANDARD CATEGORY ARTICLES VIEW */}
          {!['DOKUMEN', 'RIWAYAT', 'ADMIN_PANEL'].includes(activeTab) && (
            <div className="space-y-6">
              
              {/* ACTION QUICK LINKS FOR SPECIFIC TABS */}
              {activeTab === 'KEAMANAN' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Keadaan Darurat / Gangguan Keamanan?</h4>
                      <p className="text-xs text-red-700">Segera buat laporan cepat agar ditindaklanjuti oleh Seksi Keamanan RT.</p>
                    </div>
                  </div>
                  {openComplaintModal && (
                    <button
                      onClick={openComplaintModal}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>🚨 LAPORKAN KEJADIAN</span>
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'KEUANGAN' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-md">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Iuran Bulanan & Transparansi Kas</h4>
                      <p className="text-xs text-emerald-700">Iuran RT Rp 50.000 / KK / bulan & Dana Kematian Rp 20.000 / KK / bulan.</p>
                    </div>
                  </div>
                  {openFinanceModal && (
                    <button
                      onClick={openFinanceModal}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>💳 LIHAT INFORMASI IURAN</span>
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'FASILITAS' && (
                <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-cyan-700 text-white rounded-xl shadow-md">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-cyan-900">Fasilitas Umum & Kerusakan Inventaris</h4>
                      <p className="text-xs text-cyan-700">Temukan kerusakan pada penerangan jalan, tenda, atau balai RT?</p>
                    </div>
                  </div>
                  {openComplaintModal && (
                    <button
                      onClick={openComplaintModal}
                      className="px-4 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold hover:bg-cyan-800 transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Laporkan Kerusakan</span>
                    </button>
                  )}
                </div>
              )}

              {/* ARTICLES LISTING */}
              {filteredArticles.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-bold">Tidak ada pasal tata tertib yang ditemukan.</p>
                  <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori submenu.</p>
                </div>
              ) : (
                filteredArticles.map(art => {
                  const isExpanded = expandedArticleId === art.id;
                  return (
                    <div
                      key={art.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-emerald-300"
                    >
                      <div
                        onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                            #{art.number}
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{art.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{art.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            Versi {art.version} • {art.effectiveDate}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* EXPANDED CONTENT */}
                      {isExpanded && (
                        <div className="px-6 py-5 bg-slate-50/70 border-t border-slate-200 space-y-4">
                          <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800 pl-4 border-l-4 border-emerald-600 font-sans bg-white p-4 rounded-xl border border-slate-200">
                            {art.content}
                          </div>

                          {/* KEYWORDS & FEEDBACK */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap gap-1">
                              {art.keywords.map((kw, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-medium">
                                  #{kw}
                                </span>
                              ))}
                            </div>

                            {/* HELPFUL FEEDBACK */}
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>Apakah pasal ini membantu?</span>
                              {feedbackGiven[art.id] ? (
                                <span className="text-emerald-600 font-bold text-[11px]">✓ Masukan disimpan</span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleFeedback(art.id, true)}
                                    className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    title="Membantu"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(art.id, false)}
                                    className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Tidak membantu"
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>SMART RT 07 RW 11 GPA NGIJO • Module Tata Tertib v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* DRAFT CREATION MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">➕ Tambah Draft Aturan Baru</h3>
            
            <form onSubmit={handleCreateDraft} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={draftForm.category}
                  onChange={e => setDraftForm({ ...draftForm, category: e.target.value as TataTertibCategory })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                >
                  <option value="UMUM">UMUM</option>
                  <option value="KEWAJIBAN_WARGA">KEWAJIBAN WARGA</option>
                  <option value="KEAMANAN">KEAMANAN</option>
                  <option value="KEBERSIHAN">KEBERSIHAN</option>
                  <option value="PARKIR">PARKIR</option>
                  <option value="TAMU">TAMU</option>
                  <option value="KEGIATAN">KEGIATAN</option>
                  <option value="HEWAN">HEWAN</option>
                  <option value="RENOVASI">RENOVASI</option>
                  <option value="KEUANGAN">KEUANGAN</option>
                  <option value="FASILITAS">FASILITAS</option>
                  <option value="PELANGGARAN">PELANGGARAN</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul BAB / Pasal</label>
                <input
                  type="text"
                  placeholder="e.g. BAB XIV - Pengelolaan Pos Ronda Malam"
                  value={draftForm.title}
                  onChange={e => setDraftForm({ ...draftForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Sederhana</label>
                <input
                  type="text"
                  placeholder="Penjelasan singkat maksud aturan..."
                  value={draftForm.summary}
                  onChange={e => setDraftForm({ ...draftForm, summary: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Lengkap (Pasal & Ayat)</label>
                <textarea
                  rows={5}
                  placeholder="Pasal 1: ...&#10;1. ...&#10;2. ..."
                  value={draftForm.content}
                  onChange={e => setDraftForm({ ...draftForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Kunci (dipisah koma)</label>
                <input
                  type="text"
                  placeholder="ronda, jam malam, portal"
                  value={draftForm.keywords}
                  onChange={e => setDraftForm({ ...draftForm, keywords: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Sebagai Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL & PUBLISH MODAL FOR KETUA RT */}
      {approvalModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">✅ Pengesahan & Publish Tata Tertib</h3>
            <p className="text-xs text-slate-600">
              Pengesahan resmi oleh Ketua RT akan mengaktifkan aturan #{approvalModalArticle.number} ({approvalModalArticle.title}) untuk seluruh warga.
            </p>

            <form onSubmit={handleApproveAndPublish} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Versi Baru</label>
                <input
                  type="text"
                  value={approvalForm.newVersion}
                  onChange={e => setApprovalForm({ ...approvalForm, newVersion: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Berlaku Efektif</label>
                <input
                  type="date"
                  value={approvalForm.effectiveDate}
                  onChange={e => setApprovalForm({ ...approvalForm, effectiveDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Catatan Pengesahan (Log)</label>
                <textarea
                  rows={3}
                  value={approvalForm.changeSummary}
                  onChange={e => setApprovalForm({ ...approvalForm, changeSummary: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalArticle(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Sahkan & Mempublikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
