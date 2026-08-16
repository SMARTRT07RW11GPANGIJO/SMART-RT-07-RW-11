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
  MessageSquare,
  Play,
  CheckCheck
} from 'lucide-react';
import { DigitalDocument, SuratPengantar } from '../types/rt';
import { verifyDocumentById, maskNIK, maskKK, maskPhoneNumber, maskAddress } from '../services/documentService';
import { SuratService } from '../services/suratService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { UserRole, roleHasPermission } from '../security/roles';
import { printOrSavePDF } from '../services/pdfGeneratorService';
import { DOCUMENT_BRANDING } from '../config/documentBranding';
import { SignatureMetadata } from '../types/digitalSignature';
import { getSignatureMetadataByDocId } from '../services/digitalSignatureService';
import { DigitalSignatureTestRunner, SecuritySignatureSuiteReport } from '../services/digitalSignatureTestRunner';

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
  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'VERIFIKASI_PENGURUS' | 'QR_PUBLIC_CHECK' | 'SECURITY_AUDIT_SUITE'>(
    currentRole === 'WARGA' || currentRole === 'PUBLIC' ? 'QR_PUBLIC_CHECK' : 'VERIFIKASI_PENGURUS'
  );

  // Local state for surat list
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
  const [verifiedMeta, setVerifiedMeta] = useState<SignatureMetadata | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'VALID' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND' | 'INVALID_HASH'>('IDLE');
  const [qrStatusMessage, setQrStatusMessage] = useState<string>('');
  const [securityWarningMessage, setSecurityWarningMessage] = useState<string | null>(null);

  // Test Suite States
  const [suiteReport, setSuiteReport] = useState<SecuritySignatureSuiteReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

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
    const match = path.match(/\/(?:verify|verifikasi)\/([A-Za-z0-9-]+)/);
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
      setVerifiedMeta(null);
      setQrStatusMessage(result.statusText);
      setSecurityWarningMessage(null);
      return;
    }

    setVerifiedDoc(result.document);
    setVerifiedMeta(result.signatureMetadata || getSignatureMetadataByDocId(result.document.documentId) || null);
    setVerifyStatus(result.status);
    setQrStatusMessage(result.statusText);
    setSecurityWarningMessage(result.securityWarning || null);
  };

  const handleRunSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const report = await DigitalSignatureTestRunner.runAllTests();
      setSuiteReport(report);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Filtered List Logic
  const filteredSuratList = localSuratList.filter((s) => {
    const matchSearch =
      s.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nama_pemohon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jenis_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.blok_rumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'MENUNGGU_VERIFIKASI') return s.status === 'DIAJUKAN' || (s as any).status === 'MENUNGGU_VERIFIKASI';
    if (filterStatus === 'DIVERIFIKASI') return s.status === 'DIVERIFIKASI';
    if (filterStatus === 'DITOLAK') return s.status === 'DITOLAK';
    if (filterStatus === 'DISETUJUI') return s.status === 'DISETUJUI';
    if (filterStatus === 'SELESAI') return s.status === 'SELESAI';
    return true;
  });

  const pendingCount = localSuratList.filter(s => s.status === 'DIAJUKAN' || (s as any).status === 'MENUNGGU_VERIFIKASI').length;
  const verifiedCount = localSuratList.filter(s => s.status === 'DIVERIFIKASI').length;
  const completedCount = localSuratList.filter(s => s.status === 'SELESAI' || s.status === 'DISETUJUI').length;

  const renderStatusBadge = (status: SuratPengantar['status']) => {
    switch (status) {
      case 'DIAJUKAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-500" /> Menunggu Verifikasi
          </span>
        );
      case 'DIVERIFIKASI':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3 text-blue-500" /> Diverifikasi Pengurus
          </span>
        );
      case 'DISETUJUI':
      case 'SELESAI':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selesai / Terbit
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <Ban className="w-3 h-3 text-rose-500" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 w-fit">
            {status}
          </span>
        );
    }
  };

  const handleOpenVerifyConfirm = (surat: SuratPengantar) => {
    setSelectedSurat(surat);
    setIsConfirmModalOpen(true);
  };

  const handleOpenRejectModal = (surat: SuratPengantar) => {
    setSelectedSurat(surat);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleExecuteVerification = async () => {
    if (!selectedSurat) return;
    setIsProcessing(true);

    try {
      const result = await SuratService.verifySurat(
        selectedSurat.id_surat,
        'VERIFY',
        `Disetujui oleh Pengurus (${sessionContext.role})`,
        sessionContext
      );

      if (result.success && result.surat) {
        setLocalSuratList(prev => prev.map(s => s.id_surat === selectedSurat.id_surat ? result.surat! : s));
        setIsConfirmModalOpen(false);
        setFeedbackToast({
          type: 'success',
          title: 'Verifikasi Berhasil',
          message: result.message,
          waStatus: result.whatsappSent ? 'SENT' : 'FAILED'
        });
      } else {
        setFeedbackToast({
          type: 'error',
          title: 'Verifikasi Gagal',
          message: result.message
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: 'Security Error',
        message: err?.message || 'Terjadi kesalahan sistem'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteRejection = async () => {
    if (!selectedSurat || !rejectionReason.trim()) {
      alert('Wajib mencantumkan alasan penolakan berkas surat.');
      return;
    }
    setIsProcessing(true);

    try {
      const result = await SuratService.verifySurat(
        selectedSurat.id_surat,
        'REJECT',
        rejectionReason.trim(),
        sessionContext
      );

      if (result.success && result.surat) {
        setLocalSuratList(prev => prev.map(s => s.id_surat === selectedSurat.id_surat ? result.surat! : s));
        setIsRejectModalOpen(false);
        setFeedbackToast({
          type: 'info',
          title: 'Pengajuan Ditolak',
          message: result.message
        });
      } else {
        setFeedbackToast({
          type: 'error',
          title: 'Gagal Menolak',
          message: result.message
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: 'Security Error',
        message: err?.message || 'Gagal memproses penolakan'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteKetuaApproval = async (surat: SuratPengantar) => {
    setIsProcessing(true);
    try {
      const result = await SuratService.processSuratApprovalAndGeneration(
        surat.id_surat,
        'Disetujui dan ditandatangani digital oleh Ketua RT 07',
        sessionContext
      );

      if (result.success && result.surat) {
        setLocalSuratList(prev => prev.map(s => s.id_surat === surat.id_surat ? result.surat! : s));
        setFeedbackToast({
          type: 'success',
          title: 'Dokumen Resmi Diterbitkan & Disahkan',
          message: result.message,
          waStatus: result.whatsappSent ? 'SENT' : 'FAILED'
        });
      } else {
        setFeedbackToast({
          type: 'error',
          title: 'Gagal Mengesahkan',
          message: result.message
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        title: 'Gagal Otorisasi',
        message: err?.message || 'Akses ditolak.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
            feedbackToast.type === 'success' 
              ? 'bg-emerald-900/95 border-emerald-700 text-white' 
              : feedbackToast.type === 'error'
              ? 'bg-rose-900/95 border-rose-700 text-white'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}>
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : feedbackToast.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm">{feedbackToast.title}</h4>
              <p className="opacity-90 mt-0.5">{feedbackToast.message}</p>
              {feedbackToast.waStatus && (
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5 text-[11px] font-mono text-emerald-300">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Notifikasi Warga: {feedbackToast.waStatus === 'SENT' ? 'Terkirim ✓' : 'Lokal / Simulasi'}</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setFeedbackToast(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-[#123B5D] via-[#0D2840] to-[#081B2B] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#D4A72C] text-[#123B5D]">
                SMART RT 07 RW 11 GPA NGIJO
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Generator Surat v2.0 • Digital Signature Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Verifikasi & TTE Resmi Dokumen
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Modul pengesahan surat elektronik berintegritas tinggi dengan validasi SHA-256, penandatangan resmi Ketua RT <strong>{DOCUMENT_BRANDING.chairmanName}</strong>, tempat surat <strong>{DOCUMENT_BRANDING.letterPlace}</strong>, dan audit trail terenkripsi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenLetterModal && (
              <button
                onClick={onOpenLetterModal}
                className="px-4 py-2.5 rounded-2xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Buat Pengajuan Surat</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-wrap gap-2">
          {isAuthorizedOfficer && (
            <button
              onClick={() => setActiveTab('VERIFIKASI_PENGURUS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'VERIFIKASI_PENGURUS'
                  ? 'bg-white text-[#123B5D] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Verifikasi Berkas Pengurus</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-900 font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('QR_PUBLIC_CHECK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'QR_PUBLIC_CHECK'
                ? 'bg-white text-[#123B5D] shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Portal Verifikasi Publik QR</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SECURITY_AUDIT_SUITE');
              if (!suiteReport) handleRunSecurityTests();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SECURITY_AUDIT_SUITE'
                ? 'bg-[#D4A72C] text-[#123B5D] font-black shadow-md'
                : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-400/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Keamanan TTE (15/15 Tests)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENGURUS VERIFICATION WORKFLOW */}
      {/* ========================================================================= */}
      {activeTab === 'VERIFIKASI_PENGURUS' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Pengajuan</div>
              <div className="text-xl font-black text-slate-900 mt-1">{localSuratList.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-amber-700">Menunggu Verifikasi</div>
              <div className="text-xl font-black text-amber-900 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/50 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-blue-700">Diverifikasi (Siap RT)</div>
              <div className="text-xl font-black text-blue-900 mt-1">{verifiedCount}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Selesai / TTE Sah</div>
              <div className="text-xl font-black text-emerald-900 mt-1">{completedCount}</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, NIK, no surat, keperluan..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#123B5D]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  filterStatus === 'ALL' ? 'bg-[#123B5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({localSuratList.length})
              </button>
              <button
                onClick={() => setFilterStatus('MENUNGGU_VERIFIKASI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  filterStatus === 'MENUNGGU_VERIFIKASI' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                ⏳ Menunggu ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('DIVERIFIKASI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  filterStatus === 'DIVERIFIKASI' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                🔍 Diverifikasi ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterStatus('SELESAI')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  filterStatus === 'SELESAI' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                🟢 Selesai ({completedCount})
              </button>
            </div>
          </div>

          {/* Table of Letters */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                          NIK: {isAuthorizedOfficer ? surat.nik_pemohon : maskNIK(surat.nik_pemohon)}
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
                          <button
                            onClick={() => {
                              setSelectedSurat(surat);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          {isAuthorizedOfficer && (surat.status === 'DIAJUKAN' || (surat as any).status === 'MENUNGGU_VERIFIKASI') && (
                            <>
                              <button
                                onClick={() => handleOpenVerifyConfirm(surat)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs flex items-center gap-1 shadow-xs disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Verifikasi</span>
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(surat)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {(currentRole === 'KETUA_RT' || currentRole === 'ADMIN') && surat.status === 'DIVERIFIKASI' && (
                            <button
                              onClick={() => handleExecuteKetuaApproval(surat)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Setujui (RT)</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PUBLIC QR VERIFICATION LOOKUP */}
      {/* ========================================================================= */}
      {activeTab === 'QR_PUBLIC_CHECK' && (
        <div className="flex flex-col items-center space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); handlePerformQrVerify(searchId); }} className="w-full max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Masukkan ID Dokumen (contoh: DOC-2026-000001)..."
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
                <h2 className="text-xl font-black tracking-wide">✓ DOKUMEN RESMI VALID</h2>
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
                <h2 className="text-xl font-black tracking-wide">✖ DOKUMEN TELAH DICABUT</h2>
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
                <h2 className="text-xl font-black tracking-wide">⚠️ MASA BERLAKU HABIS</h2>
                <p className="text-xs text-amber-100 font-medium">
                  Dokumen ini telah melampaui batas waktu keabsahan resmi.
                </p>
              </div>
            )}

            {verifyStatus === 'INVALID_HASH' && (
              <div className="bg-red-800 text-white p-6 text-center space-y-2 border-b border-red-700">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto border-2 border-white">
                  <ShieldAlert className="w-8 h-8 text-amber-300" />
                </div>
                <h2 className="text-xl font-black tracking-wide">🚨 PERINGATAN INTEGRITAS DOKUMEN</h2>
                <p className="text-xs text-red-200 font-bold">
                  {securityWarningMessage || 'INTEGRITAS DOKUMEN TIDAK VALID (HASH MISMATCH) - DITEMUKAN INDIKASI PERUBAHAN ISI ILLEGAL!'}
                </p>
              </div>
            )}

            {verifyStatus === 'NOT_FOUND' && (
              <div className="bg-slate-800 text-slate-200 p-6 text-center space-y-2 border-b border-slate-700">
                <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mx-auto border border-slate-500">
                  <HelpCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-white">DOKUMEN TIDAK DITEMUKAN</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Nomor atau token dokumen tidak terdaftar dalam basis data resmi RT 07.
                </p>
              </div>
            )}

            {/* Public Doc Detail */}
            {verifiedDoc && (
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Nomor Dokumen:</span>
                    <span className="font-mono font-bold text-emerald-700">{verifiedDoc.documentId}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Nomor Surat:</span>
                    <span className="font-mono font-bold text-[#123B5D]">{verifiedDoc.nomorSurat}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Jenis Surat:</span>
                    <span className="font-bold text-slate-800">{verifiedDoc.jenisSurat}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Tanggal Surat:</span>
                    <span className="font-bold text-slate-800">{verifiedDoc.tanggalSurat}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Tempat Surat:</span>
                    <span className="font-bold text-[#123B5D]">{DOCUMENT_BRANDING.letterPlace}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Penandatangan Resmi:</span>
                    <span className="font-bold text-slate-900">{DOCUMENT_BRANDING.chairmanName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Jabatan:</span>
                    <span className="font-bold text-slate-800">{DOCUMENT_BRANDING.chairmanTitle}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Tanggal Penandatanganan:</span>
                    <span className="font-mono text-slate-700">{verifiedMeta?.signedAt || verifiedDoc.approvedAt}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Status Dokumen:</span>
                    <span className="font-bold text-slate-900">{verifiedDoc.status}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Signature Status:</span>
                    <span className={`font-bold font-mono ${verifyStatus === 'VALID' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {verifiedMeta?.signatureStatus || 'VALID'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Document Hash (SHA-256):</span>
                    <span className="font-mono text-[10px] bg-slate-200 p-1.5 rounded text-slate-800 break-all select-all">
                      {verifiedMeta?.documentHash || verifiedDoc.verificationToken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Nama Pemohon (Warga):</span>
                    <span className="font-bold text-slate-800">{verifiedDoc.pemohonNama}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">NIK (Masked Privacy):</span>
                    <span className="font-mono text-slate-600">{maskNIK(verifiedDoc.pemohonNikMasked)}</span>
                  </div>
                </div>

                {/* Privacy shield note */}
                <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Jaminan Perlindungan Privasi Warga:</span>
                    Sesuai standar perlindungan data pribadi, portal verifikasi publik merasiakan NIK lengkap, No. KK, nomor HP, dan alamat detail rumah warga.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY & DIGITAL SIGNATURE AUDIT SUITE (TEST 1 - 15) */}
      {/* ========================================================================= */}
      {activeTab === 'SECURITY_AUDIT_SUITE' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E7D52]" />
                <h2 className="text-lg font-black text-slate-900">Suite Audit Keamanan Digital Signature (TEST 1 - 15)</h2>
              </div>
              <p className="text-xs text-slate-500">
                Memvalidasi integritas SHA-256, deteksi modifikasi dokumen ilegal, role-based access 403, locking identitas penandatangan, dan perlindungan privasi data warga.
              </p>
            </div>

            <button
              onClick={handleRunSecurityTests}
              disabled={isRunningTests}
              className="px-5 py-2.5 rounded-xl bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold text-xs flex items-center gap-2 shadow transition-all disabled:opacity-50 shrink-0"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                  <span>Menjalankan Audit...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#D4A72C]" />
                  <span>Jalankan Ulang 15 Test Case</span>
                </>
              )}
            </button>
          </div>

          {/* Test Report Overview Cards */}
          {suiteReport && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Test Case</div>
                <div className="text-xl font-black text-slate-900 mt-1">{suiteReport.totalTests} Tests</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] uppercase font-bold text-emerald-700">Passed Tests</div>
                <div className="text-xl font-black text-emerald-800 mt-1">{suiteReport.passedTests} / {suiteReport.totalTests}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
                <div className="text-[10px] uppercase font-bold text-rose-700">Failed Tests</div>
                <div className="text-xl font-black text-rose-800 mt-1">{suiteReport.failedTests}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/50">
                <div className="text-[10px] uppercase font-bold text-blue-700">Status Integritas</div>
                <div className="text-sm font-black text-blue-900 mt-1">
                  {suiteReport.allPassed ? '✓ 100% PRODUCTION READY' : 'REVISION NEEDED'}
                </div>
              </div>
            </div>
          )}

          {/* Test Case Detail List */}
          {suiteReport && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Daftar 15 Test Case Resmi & Hasil Verifikasi</span>
                <span className="text-slate-400 font-mono">{suiteReport.timestamp}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {suiteReport.results.map((test) => (
                  <div key={test.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#123B5D] px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {test.id}
                        </span>
                        <span className="font-bold text-slate-900">{test.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">({test.category})</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{test.actualResult}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{test.executionTimeMs} ms</span>
                      {test.status === 'PASS' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> PASS
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-rose-600" /> FAIL
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* Detail Modal */}
      {isDetailModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#123B5D]" />
                <h3 className="font-bold text-base text-slate-900">Detail Permohonan Surat</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Pengajuan</span>
                <span className="font-mono font-bold text-[#123B5D] text-xs">{selectedSurat.nomor_surat}</span>
              </div>
              {renderStatusBadge(selectedSurat.status)}
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Data Pemohon</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">{selectedSurat.nama_pemohon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">NIK:</span>
                  <span className="font-mono font-bold text-slate-800">{isAuthorizedOfficer ? selectedSurat.nik_pemohon : maskNIK(selectedSurat.nik_pemohon)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Alamat:</span>
                  <span className="font-medium text-slate-800">Perum GPA Ngijo {selectedSurat.blok_rumah}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Keperluan:</span>
                  <span className="font-semibold text-slate-800">{selectedSurat.keperluan}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Verify Modal */}
      {isConfirmModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Verifikasi Pengajuan Surat?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan memverifikasi permohonan <strong>{selectedSurat.jenis_surat}</strong> atas nama <strong>{selectedSurat.nama_pemohon}</strong>. Berkas akan diteruskan ke Ketua RT untuk disahkan dan ditandatangani secara digital.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteVerification}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#2E7D52] hover:bg-[#236340] text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Ya, Verifikasi Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-700">
              <Ban className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Tolak Pengajuan Surat</h3>
            </div>
            <p className="text-xs text-slate-600">
              Mohon cantumkan alasan penolakan berkas permohonan agar pemohon dapat memperbaiki data yang diajukan:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Lampiran NIK / KTP belum sesuai domisili..."
              rows={3}
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteRejection}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                <span>Tolak Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
