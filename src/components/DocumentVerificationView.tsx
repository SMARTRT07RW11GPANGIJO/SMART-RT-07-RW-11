import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Ban, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Lock, 
  QrCode, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  User, 
  Home, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Send, 
  FileCheck, 
  Printer, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Info,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';
import { DigitalDocument, SuratPengantar } from '../types/rt';
import { verifyDocumentById, maskNIK } from '../services/documentService';
import { SuratService } from '../services/suratService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { UserRole, roleHasPermission } from '../security/roles';
import { printOrSavePDF } from '../services/pdfGeneratorService';

interface DocumentVerificationViewProps {
  suratList?: SuratPengantar[];
  digitalDocs?: DigitalDocument[];
  currentRole?: UserRole;
  onRefreshList?: () => void;
  onOpenLetterModal?: () => void;
}

type FilterStatus = 'ALL' | 'MENUNGGU_VERIFIKASI' | 'DIVERIFIKASI' | 'DITOLAK' | 'DISETUJUI' | 'SELESAI';

export const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({
  suratList: initialSuratList = [],
  digitalDocs = [],
  currentRole = 'PENGURUS',
  onRefreshList,
  onOpenLetterModal
}) => {
  // Active Main View Tab: 'VERIFIKASI_PENGURUS' or 'QR_PUBLIC_CHECK'
  const [activeTab, setActiveTab] = useState<'VERIFIKASI_PENGURUS' | 'QR_PUBLIC_CHECK'>(
    currentRole === 'WARGA' || currentRole === 'PUBLIC' ? 'QR_PUBLIC_CHECK' : 'VERIFIKASI_PENGURUS'
  );

  // Local state for surat list to enable instant updates
  const [localSuratList, setLocalSuratList] = useState<SuratPengantar[]>(() => {
    const stored = SuratService.getStoredSuratList();
    if (stored && stored.length > 0) return stored;
    return initialSuratList.length > 0 ? initialSuratList : [];
  });

  // Sync if initialSuratList changes and local is empty
  useEffect(() => {
    if (initialSuratList.length > 0 && localSuratList.length === 0) {
      setLocalSuratList(initialSuratList);
    }
  }, [initialSuratList]);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Surat for Detail & Action Modals
  const [selectedSurat, setSelectedSurat] = useState<SuratPengantar | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Processing & Toast States
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    waStatus?: 'SENT' | 'FAILED';
  } | null>(null);

  // QR Public Lookup States
  const [searchId, setSearchId] = useState<string>('');
  const [verifiedDoc, setVerifiedDoc] = useState<DigitalDocument | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VALID' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND'>('IDLE');
  const [qrStatusMessage, setQrStatusMessage] = useState<string>('');

  // Authoritative Session Context
  const effectiveRole: UserRole = (currentRole as UserRole) || 'PENGURUS';
  const sessionContext: AuthoritativeSessionContext = {
    sessionId: `SESS-${effectiveRole.toLowerCase()}-${Date.now()}`,
    userId: effectiveRole === 'KETUA_RT' ? 'ketua_rt_07' : effectiveRole === 'PENGURUS' ? 'sekretaris_rt_07' : `usr_${effectiveRole.toLowerCase()}`,
    role: effectiveRole,
    isValid: true,
    isUserActive: true
  };

  const isAuthorizedOfficer = currentRole === 'PENGURUS' || currentRole === 'KETUA_RT' || currentRole === 'ADMIN';

  // Check URL parameter for QR verify code
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/verify\/([A-Za-z0-9-]+)/);
    const searchParams = new URLSearchParams(window.location.search);
    const codeParam = searchParams.get('code') || searchParams.get('docId');

    if (match && match[1]) {
      setActiveTab('QR_PUBLIC_CHECK');
      handlePerformQrVerify(match[1]);
    } else if (codeParam) {
      setActiveTab('QR_PUBLIC_CHECK');
      handlePerformQrVerify(codeParam);
    } else if (activeTab === 'QR_PUBLIC_CHECK' && !verifiedDoc) {
      handlePerformQrVerify('DOC-2026-000001');
    }
  }, []);

  const handlePerformQrVerify = (docIdToTest: string) => {
    if (!docIdToTest || docIdToTest.trim() === '') return;
    setSearchId(docIdToTest);
    const result = verifyDocumentById(docIdToTest);

    if (!result.found || !result.document) {
      setVerifyStatus('NOT_FOUND');
      setVerifiedDoc(null);
      setQrStatusMessage(result.statusText);
      return;
    }

    setVerifiedDoc(result.document);
    if (result.document.status === 'VALID') {
      setVerifyStatus('VALID');
    } else if (result.document.status === 'REVOKED') {
      setVerifyStatus('REVOKED');
    } else if (result.document.status === 'EXPIRED') {
      setVerifyStatus('EXPIRED');
    } else {
      setVerifyStatus('NOT_FOUND');
    }
    setQrStatusMessage(result.statusText);
  };

  // Filtered List Logic
  const filteredSuratList = localSuratList.filter((s) => {
    // Search match
    const matchSearch =
      s.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nama_pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jenis_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.blok_rumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Status filter
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'MENUNGGU_VERIFIKASI') return s.status === 'DIAJUKAN' || (s as any).status === 'MENUNGGU_VERIFIKASI';
    if (filterStatus === 'DIVERIFIKASI') return s.status === 'DIVERIFIKASI';
    if (filterStatus === 'DITOLAK') return s.status === 'DITOLAK';
    if (filterStatus === 'DISETUJUI') return s.status === 'DISETUJUI';
    if (filterStatus === 'SELESAI') return s.status === 'SELESAI';

    return true;
  });

  // Action Handlers
  const handleOpenVerifyConfirm = (surat: SuratPengantar) => {
    setSelectedSurat(surat);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteVerification = async () => {
    if (!selectedSurat) return;
    setIsProcessing(true);
    setFeedbackToast(null);

    try {
      const result = await SuratService.verifySurat(
        selectedSurat.id_surat,
        'VERIFY',
        `Diverifikasi resmi oleh ${currentRole === 'KETUA_RT' ? 'Ketua RT' : 'Sekretaris RT 07'} pada ${new Date().toLocaleDateString('id-ID')}`,
        sessionContext
      );

      if (result.success && result.surat) {
        // Update local state immediately
        const updatedList = localSuratList.map((item) =>
          item.id_surat === selectedSurat.id_surat ? result.surat! : item
        );
        setLocalSuratList(updatedList);
        SuratService.saveSuratList(updatedList);

        if (onRefreshList) onRefreshList();

        setFeedbackToast({
          type: 'success',
          title: '✅ Surat Berhasil Diverifikasi',
          message: `Nomor: ${result.surat.nomor_surat || result.surat.id_surat} an. ${result.surat.nama_pemohon} berhasil diverifikasi dan diteruskan ke Ketua RT.`,
          waStatus: result.whatsappSent ? 'SENT' : 'FAILED'
        });

        setIsConfirmModalOpen(false);
        setIsDetailModalOpen(false);
      } else {
        setFeedbackToast({
          type: 'error',
          title: '❌ Verifikasi Gagal',
          message: result.message || 'Gagal memverifikasi surat.'
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: '❌ Verifikasi Gagal',
        message: err?.message || 'Terjadi kesalahan otorisasi sistem.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRejectModal = (surat: SuratPengantar) => {
    setSelectedSurat(surat);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleExecuteRejection = async () => {
    if (!selectedSurat) return;
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      alert('Mohon masukkan alasan penolakan yang jelas (minimal 5 karakter).');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await SuratService.verifySurat(
        selectedSurat.id_surat,
        'REJECT',
        `Ditolak oleh ${currentRole}: ${rejectionReason.trim()}`,
        sessionContext
      );

      if (result.success && result.surat) {
        const updatedList = localSuratList.map((item) =>
          item.id_surat === selectedSurat.id_surat ? result.surat! : item
        );
        setLocalSuratList(updatedList);
        SuratService.saveSuratList(updatedList);

        if (onRefreshList) onRefreshList();

        setFeedbackToast({
          type: 'info',
          title: 'Surat Ditolak',
          message: `Pengajuan an. ${result.surat.nama_pemohon} telah ditolak dengan catatan: "${rejectionReason}"`
        });

        setIsRejectModalOpen(false);
        setIsDetailModalOpen(false);
      } else {
        setFeedbackToast({
          type: 'error',
          title: 'Gagal Menolak',
          message: result.message || 'Gagal memperbarui status.'
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: 'Gagal',
        message: err?.message || 'Terjadi kesalahan sistem.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Ketua RT Instant Approval Trigger
  const handleExecuteKetuaApproval = async (surat: SuratPengantar) => {
    setIsProcessing(true);
    setFeedbackToast(null);

    try {
      const result = await SuratService.processSuratApprovalAndGeneration(
        surat.id_surat,
        'Disetujui & Diterbitkan secara resmi oleh Ketua RT 07 RW 11',
        sessionContext
      );

      if (result.success && result.surat) {
        const updatedList = localSuratList.map((item) =>
          item.id_surat === surat.id_surat ? result.surat! : item
        );
        setLocalSuratList(updatedList);
        SuratService.saveSuratList(updatedList);

        if (onRefreshList) onRefreshList();

        setFeedbackToast({
          type: 'success',
          title: '✅ Surat Disetujui & Diterbitkan',
          message: `Surat Resmi ${result.surat.nomor_surat} telah disetujui, Dokumen PDF & QR Token keabsahan aktif.`,
          waStatus: result.whatsappSent ? 'SENT' : 'FAILED'
        });
      } else {
        setFeedbackToast({
          type: 'error',
          title: 'Gagal Approval',
          message: result.message || 'Gagal memproses persetujuan Ketua RT.'
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: err?.message || 'Hanya Ketua RT / Admin yang dapat menyetujui dan menandatangani surat.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper status badge renderer
  const renderStatusBadge = (status: SuratPengantar['status']) => {
    switch (status) {
      case 'DIAJUKAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            MENUNGGU VERIFIKASI
          </span>
        );
      case 'DIVERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            DIVERIFIKASI
          </span>
        );
      case 'DISETUJUI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            DISETUJUI (KETUA RT)
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            SELESAI / PDF TERBIT
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            DITOLAK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const pendingCount = localSuratList.filter((s) => s.status === 'DIAJUKAN').length;
  const verifiedCount = localSuratList.filter((s) => s.status === 'DIVERIFIKASI').length;
  const completedCount = localSuratList.filter((s) => s.status === 'SELESAI').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-[#123B5D] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#2E7D52]/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#2E7D52]/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0A2338] border border-[#D4A72C]/40 text-[#D4A72C] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SISTEM ADMINISTRASI DIGITAL SURAT RT 07 RW 11
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <FileText className="w-8 h-8 text-[#D4A72C]" />
                Verifikasi Surat Warga
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Alur verifikasi berkas permohonan surat pengantar warga oleh Pengurus / Sekretaris RT, penandatanganan digital Ketua RT, serta penerbitan QR Document Code resmi.
              </p>
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#0A2338]/90 p-1.5 rounded-2xl border border-slate-700 shrink-0">
              <button
                onClick={() => setActiveTab('VERIFIKASI_PENGURUS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'VERIFIKASI_PENGURUS'
                    ? 'bg-[#2E7D52] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <span>Antrean Verifikasi</span>
                {pendingCount > 0 && (
                  <span className="bg-[#C62828] text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('QR_PUBLIC_CHECK')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'QR_PUBLIC_CHECK'
                    ? 'bg-[#123B5D] text-white border border-[#D4A72C] shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#D4A72C]" />
                <span>Cek QR Publik</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
            <div className="bg-[#0A2338]/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Pengajuan</span>
              <span className="text-lg font-black text-white">{localSuratList.length} Berkas</span>
            </div>
            <div className="bg-[#0A2338]/60 p-3 rounded-2xl border border-amber-500/30">
              <span className="text-amber-400 block text-[10px] uppercase font-bold">Menunggu Verifikasi</span>
              <span className="text-lg font-black text-amber-300">{pendingCount} Berkas</span>
            </div>
            <div className="bg-[#0A2338]/60 p-3 rounded-2xl border border-blue-500/30">
              <span className="text-blue-400 block text-[10px] uppercase font-bold">Siap Disetujui RT</span>
              <span className="text-lg font-black text-blue-300">{verifiedCount} Berkas</span>
            </div>
            <div className="bg-[#0A2338]/60 p-3 rounded-2xl border border-emerald-500/30">
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">Selesai & Terbit</span>
              <span className="text-lg font-black text-emerald-300">{completedCount} Dokumen</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackToast && (
          <div className={`p-4 rounded-2xl border shadow-md flex items-start justify-between gap-4 transition-all ${
            feedbackToast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
            feedbackToast.type === 'error' ? 'bg-rose-50 border-rose-300 text-rose-900' :
            'bg-blue-50 border-blue-300 text-blue-900'
          }`}>
            <div className="flex items-start gap-3">
              {feedbackToast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#2E7D52] shrink-0 mt-0.5" /> :
               feedbackToast.type === 'error' ? <AlertTriangle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" /> :
               <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
              <div className="space-y-1">
                <h4 className="font-bold text-sm">{feedbackToast.title}</h4>
                <p className="text-xs">{feedbackToast.message}</p>
                {feedbackToast.waStatus && (
                  <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/70 border border-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2E7D52]" />
                    WhatsApp Notifikasi Pemohon: {feedbackToast.waStatus === 'SENT' ? '✅ TERKIRIM' : '⚠️ DALAM ANTRIAN RETRY'}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MAIN TAB 1: PENGURUS VERIFICATION WORKFLOW */}
        {activeTab === 'VERIFIKASI_PENGURUS' && (
          <div className="space-y-6">

            {/* Non-Officer Warning Banner if logged in as Warga */}
            {!isAuthorizedOfficer && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Mode Tinjauan Terbatas (Role: {currentRole})</span>
                  Tindakan verifikasi resmi dan penandatanganan surat dibatasi untuk Pengurus RT / Ketua RT. Anda dapat melihat daftar riwayat dan melakukan pengecekan QR keabsahan dokumen.
                </div>
              </div>
            )}

            {/* Search & Status Filters Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Cari nomor pengajuan / nama warga / jenis surat / keperluan..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Create Letter Quick Action */}
                {onOpenLetterModal && (
                  <button
                    onClick={onOpenLetterModal}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>+ Ajukan Surat Baru</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Status:
                </span>

                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'ALL'
                      ? 'bg-[#123B5D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({localSuratList.length})
                </button>

                <button
                  onClick={() => setFilterStatus('MENUNGGU_VERIFIKASI')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'MENUNGGU_VERIFIKASI'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  🟡 Menunggu Verifikasi ({pendingCount})
                </button>

                <button
                  onClick={() => setFilterStatus('DIVERIFIKASI')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'DIVERIFIKASI'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  🔵 Diverifikasi ({verifiedCount})
                </button>

                <button
                  onClick={() => setFilterStatus('DISETUJUI')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'DISETUJUI'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  🟣 Disetujui ({localSuratList.filter(s => s.status === 'DISETUJUI').length})
                </button>

                <button
                  onClick={() => setFilterStatus('SELESAI')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'SELESAI'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  🟢 Selesai ({completedCount})
                </button>

                <button
                  onClick={() => setFilterStatus('DITOLAK')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                    filterStatus === 'DITOLAK'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  🔴 Ditolak ({localSuratList.filter(s => s.status === 'DITOLAK').length})
                </button>
              </div>
            </div>

            {/* List Table / Cards */}
            {filteredSuratList.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">Tidak ada berkas permohonan surat</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchTerm ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian Anda.' : 'Belum ada pengajuan surat warga pada kategori status ini.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-bold text-[#123B5D] hover:underline"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Desktop View Table */}
                <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#123B5D] text-white uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3.5">Nomor Pengajuan</th>
                        <th className="p-3.5">Pemohon & NIK</th>
                        <th className="p-3.5">Jenis Surat</th>
                        <th className="p-3.5">Keperluan</th>
                        <th className="p-3.5">Tanggal</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Aksi Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSuratList.map((surat) => (
                        <tr key={surat.id_surat} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-[#123B5D] block">{surat.nomor_surat}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{surat.id_surat}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{surat.nama_pemohon}</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              NIK: {isAuthorizedOfficer ? (surat.nik_pemohon || maskNIK('3507120101900001')) : maskNIK(surat.nik_pemohon || '3507120101900001')}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{surat.blok_rumah}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{surat.jenis_surat}</span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="text-slate-600 truncate" title={surat.keperluan}>{surat.keperluan}</p>
                            {surat.catatan_admin && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                Catatan: {surat.catatan_admin}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-slate-500">
                            {surat.tanggal_pengajuan}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {renderStatusBadge(surat.status)}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detail Button */}
                              <button
                                onClick={() => {
                                  setSelectedSurat(surat);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                                title="Lihat Detail Pengajuan"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Detail</span>
                              </button>

                              {/* Verify Button (for Pengurus/Ketua RT when status is DIAJUKAN) */}
                              {isAuthorizedOfficer && (surat.status === 'DIAJUKAN' || (surat as any).status === 'MENUNGGU_VERIFIKASI') && (
                                <>
                                  <button
                                    onClick={() => handleOpenVerifyConfirm(surat)}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verifikasi</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenRejectModal(surat)}
                                    disabled={isProcessing}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                                    title="Tolak Pengajuan"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Ketua RT Approval Action if Diverifikasi */}
                              {(currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && surat.status === 'DIVERIFIKASI' && (
                                <button
                                  onClick={() => handleExecuteKetuaApproval(surat)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Setujui (RT)</span>
                                </button>
                              )}

                              {/* Print/Preview if Selesai */}
                              {surat.status === 'SELESAI' && (
                                <button
                                  onClick={() => {
                                    setSelectedSurat(surat);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#D4A72C]" />
                                  <span>PDF</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredSuratList.map((surat) => (
                    <div
                      key={surat.id_surat}
                      className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-mono font-bold text-[#123B5D] text-xs block">{surat.nomor_surat}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{surat.id_surat}</span>
                        </div>
                        {renderStatusBadge(surat.status)}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{surat.nama_pemohon}</span>
                          <span className="text-slate-500 font-medium">{surat.blok_rumah}</span>
                        </div>
                        <p className="text-slate-700 font-semibold">{surat.jenis_surat}</p>
                        <p className="text-slate-600 text-[11px]"><b>Keperluan:</b> {surat.keperluan}</p>
                        <p className="text-slate-400 text-[10px]">Tgl Pengajuan: {surat.tanggal_pengajuan}</p>
                        {surat.catatan_admin && (
                          <p className="text-[11px] text-[#2E7D52] bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <b>Catatan:</b> {surat.catatan_admin}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedSurat(surat);
                            setIsDetailModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>

                        {isAuthorizedOfficer && (surat.status === 'DIAJUKAN' || (surat as any).status === 'MENUNGGU_VERIFIKASI') && (
                          <>
                            <button
                              onClick={() => handleOpenVerifyConfirm(surat)}
                              disabled={isProcessing}
                              className="flex-1 py-2 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs flex items-center justify-center gap-1 shadow disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Verifikasi
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(surat)}
                              disabled={isProcessing}
                              className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {(currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && surat.status === 'DIVERIFIKASI' && (
                          <button
                            onClick={() => handleExecuteKetuaApproval(surat)}
                            disabled={isProcessing}
                            className="flex-1 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Setujui RT
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MAIN TAB 2: PUBLIC QR VERIFICATION LOOKUP */}
        {activeTab === 'QR_PUBLIC_CHECK' && (
          <div className="flex flex-col items-center space-y-6">
            
            {/* Search Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handlePerformQrVerify(searchId); }} className="w-full max-w-2xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Masukkan ID Dokumen atau Hash QR (contoh: DOC-2026-000001)..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border-2 border-slate-300 text-slate-900 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-[#123B5D] shadow-sm"
                />
                <Search className="w-5 h-5 absolute left-4 text-slate-400" />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs shadow transition-all"
                >
                  Verifikasi
                </button>
              </div>
            </form>

            {/* Verification Result Card */}
            <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              
              {verifyStatus === 'VALID' && (
                <div className="bg-emerald-600 text-white p-6 text-center space-y-2 border-b border-emerald-500">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-wide">✓ DOKUMEN RESMI VALID</h2>
                  <p className="text-xs text-emerald-100 font-medium">
                    Dokumen ini terdaftar sah dalam Database Administrasi Digital RT 07 RW 11 GPA Ngijo
                  </p>
                </div>
              )}

              {verifyStatus === 'REVOKED' && (
                <div className="bg-rose-700 text-white p-6 text-center space-y-2 border-b border-rose-600">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
                    <Ban className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-wide">✖ DOKUMEN TELAH DICABUT</h2>
                  <p className="text-xs text-rose-100 font-medium">
                    Dokumen ini telah dicabut oleh Pengurus RT dan TIDAK LAGI BERLAKU.
                  </p>
                </div>
              )}

              {verifyStatus === 'EXPIRED' && (
                <div className="bg-amber-600 text-white p-6 text-center space-y-2 border-b border-amber-500">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-wide">⚠️ MASA BERLAKU HABIS</h2>
                  <p className="text-xs text-amber-100 font-medium">
                    Dokumen ini telah melampaui batas waktu keabsahan resmi.
                  </p>
                </div>
              )}

              {verifyStatus === 'NOT_FOUND' && (
                <div className="bg-slate-800 text-slate-200 p-6 text-center space-y-2 border-b border-slate-700">
                  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mx-auto border border-slate-500">
                    <HelpCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">DOKUMEN TIDAK DITEMUKAN</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Nomor atau token dokumen tidak terdaftar dalam basis data publik RT 07.
                  </p>
                </div>
              )}

              {/* Public Doc Detail */}
              {verifiedDoc && (
                <div className="p-6 space-y-5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Penerbit Resmi:</span>
                      <span className="font-bold text-[#123B5D]">RT 07 RW 11 Perum GPA Ngijo</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Nomor Registrasi Surat:</span>
                      <span className="font-mono font-bold text-[#123B5D]">{verifiedDoc.nomorSurat}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Document ID:</span>
                      <span className="font-mono font-bold text-emerald-700">{verifiedDoc.documentId}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Jenis Layanan / Dokumen:</span>
                      <span className="font-bold text-slate-800">{verifiedDoc.jenisSurat}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Tanggal Masehi Terbit:</span>
                      <span className="font-bold text-slate-800">{verifiedDoc.tanggalSurat}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Nama Pemohon (Warga):</span>
                      <span className="font-bold text-slate-800">{verifiedDoc.pemohonNama}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">NIK Status (Masked):</span>
                      <span className="font-mono text-slate-600">{verifiedDoc.pemohonNikMasked}</span>
                    </div>
                  </div>

                  {/* Privacy shield note */}
                  <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-500">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Privasi Terjaga:</span>
                      Data pribadi sensitif seperti Nomor NIK lengkap dan No. KK dirahasiakan pada portal publik sesuai UU Perlindungan Data Pribadi (PDP).
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL SURAT & RIWAYAT PROSES */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#123B5D]" />
                <h3 className="font-bold text-base text-slate-900">Detail Permohonan Surat</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Pengajuan</span>
                <span className="font-mono font-bold text-[#123B5D] text-xs">{selectedSurat.nomor_surat}</span>
              </div>
              {renderStatusBadge(selectedSurat.status)}
            </div>

            {/* Applicant Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Data Pemohon</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">{selectedSurat.nama_pemohon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">NIK:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {isAuthorizedOfficer ? selectedSurat.nik_pemohon : maskNIK(selectedSurat.nik_pemohon)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nomor KK:</span>
                  <span className="font-mono text-slate-700">{selectedSurat.no_kk || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Blok Rumah:</span>
                  <span className="font-semibold text-[#123B5D]">{selectedSurat.blok_rumah}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jenis Layanan:</span>
                  <span className="font-bold text-slate-900">{selectedSurat.jenis_surat}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Keperluan Pengajuan:</span>
                  <p className="font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                    {selectedSurat.keperluan}
                  </p>
                </div>
                {selectedSurat.catatan_admin && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Catatan Admin / Verifikator:</span>
                    <p className="text-xs text-[#2E7D52] bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
                      {selectedSurat.catatan_admin}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>

              {isAuthorizedOfficer && (selectedSurat.status === 'DIAJUKAN' || (selectedSurat as any).status === 'MENUNGGU_VERIFIKASI') && (
                <>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenRejectModal(selectedSurat);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenVerifyConfirm(selectedSurat);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verifikasi Berkas</span>
                  </button>
                </>
              )}

              {(currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && selectedSurat.status === 'DIVERIFIKASI' && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleExecuteKetuaApproval(selectedSurat);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Setujui (Ketua RT)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRMATION VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-[#2E7D52]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Konfirmasi Verifikasi Surat</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin memverifikasi permohonan surat ini?
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <p><b>Nomor:</b> <span className="font-mono text-[#123B5D]">{selectedSurat.nomor_surat}</span></p>
              <p><b>Pemohon:</b> {selectedSurat.nama_pemohon}</p>
              <p><b>Jenis:</b> {selectedSurat.jenis_surat}</p>
              <p><b>Keperluan:</b> {selectedSurat.keperluan}</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 text-left flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                Status akan berubah menjadi <b>DIVERIFIKASI</b>, notifikasi WhatsApp dikirim ke pemohon, dan berkas diteruskan ke Ketua RT untuk disetujui.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteVerification}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ya, Verifikasi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REJECTION REASON MODAL */}
      {/* ========================================================================= */}
      {isRejectModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <Ban className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Tolak Permohonan Surat</h3>
            </div>

            <p className="text-xs text-slate-500">
              Masukkan alasan penolakan berkas permohonan an. <b>{selectedSurat.nama_pemohon}</b>. Alasan ini akan dicatat dalam sistem dan disampaikan kepada pemohon.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Berkas persyaratan KTP belum terlampir / Data NIK tidak sesuai KK..."
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRejection}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>Tolak Permohonan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
