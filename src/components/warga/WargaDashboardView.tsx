import React, { useState, useEffect } from 'react';
import {
  FileText,
  Wallet,
  AlertTriangle,
  BookOpen,
  Heart,
  Bot,
  Bell,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  QrCode,
  Calendar,
  Megaphone,
  ShieldCheck,
  Building,
  RefreshCw,
  Send,
  ExternalLink,
  Wifi,
  WifiOff,
  BellRing,
  HelpCircle,
  Phone,
  Info,
  ShieldAlert
} from 'lucide-react';
import { AuthoritativeSessionContext } from '../../security/authorization';
import { WargaDashboardData, WargaInvoiceItem } from '../../types/wargaDashboard';
import { WargaDashboardService } from '../../services/wargaDashboardService';
import { WargaQrisPaymentModal } from './WargaQrisPaymentModal';
import { WargaProfileModal } from './WargaProfileModal';
import { WargaNotificationsModal } from './WargaNotificationsModal';
import { SecurityIsolationTestModal } from './SecurityIsolationTestModal';

interface WargaDashboardViewProps {
  authContext: AuthoritativeSessionContext;
  onNavigate: (tab: string, subTab?: string) => void;
  onOpenLetterModal?: () => void;
  onOpenComplaintModal?: () => void;
}

export const WargaDashboardView: React.FC<WargaDashboardViewProps> = ({
  authContext,
  onNavigate,
  onOpenLetterModal,
  onOpenComplaintModal
}) => {
  const [data, setData] = useState<WargaDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<WargaInvoiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PWA & Push Notification state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pushEnabled, setPushEnabled] = useState(false);

  const loadDashboardData = () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = WargaDashboardService.getWargaDashboardData(authContext);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data Dashboard Warga.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authContext]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMarkNotificationRead = (id: string) => {
    if (data) {
      WargaDashboardService.markNotificationRead(data.profile.idWarga, id);
      loadDashboardData();
    }
  };

  const handleMarkAllNotificationsRead = () => {
    if (data) {
      WargaDashboardService.markAllNotificationsRead(data.profile.idWarga);
      loadDashboardData();
      showToast('Semua notifikasi ditandai telah dibaca.');
    }
  };

  const handleTogglePushNotification = () => {
    if (!pushEnabled) {
      setPushEnabled(true);
      showToast('🔔 Notifikasi push berhasil diaktifkan untuk pengingat iuran & surat.');
    } else {
      setPushEnabled(false);
      showToast('Notifikasi push dinonaktifkan.');
    }
  };

  const handleAiQuickPrompt = (promptText: string) => {
    // Navigate to AI assistant with pre-filled context
    onNavigate('ai-assistant');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5 animate-pulse">
        {/* Skeleton Header */}
        <div className="h-24 bg-slate-200 rounded-3xl" />
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        {/* Skeleton Cards */}
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-44 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 bg-red-50 rounded-3xl border border-red-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#C62828] mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">Terjadi Kendala Memuat Data</h3>
        <p className="text-xs text-slate-600">{error || 'Data tidak ditemukan.'}</p>
        <button
          onClick={loadDashboardData}
          className="bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      </div>
    );
  }

  const {
    profile,
    notifications,
    unreadNotificationCount,
    invoices,
    totalUnpaidAmount,
    letters,
    complaints,
    announcements,
    tataTertibActive,
    activities
  } = data;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-20 sm:pb-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#123B5D] text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Status Alert */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Mode Offline PWA Aktif — Menampilkan data tersimpan di perangkat.</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">OFFLINE</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER & GREETING CARD */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#123B5D] via-[#1A4B75] to-[#2E7D52] rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4A72C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#2E7D52]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Greeting Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-white/15 text-slate-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-xs flex items-center gap-1">
                <Building className="w-3 h-3 text-[#D4A72C]" />
                SMART RT 07 RW 11 GPA NGIJO
              </span>
              {isOnline ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Terhubung
                </span>
              ) : (
                <span className="text-[10px] text-amber-300 font-semibold">Offline</span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Assalamu'alaikum, {profile.namaLengkap}
            </h1>
            <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
              Selamat datang di Portal Layanan Mandiri Warga RT 07. Urus surat, cek iuran, dan sampaikan aspirasi dengan cepat dan transparan.
            </p>
          </div>

          {/* Quick Header Actions (Notification & Profile) */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {/* Security Isolation Compliance Audit Button */}
            <button
              onClick={() => setIsSecurityAuditOpen(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 p-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Audit Keamanan & IDOR Test Suite"
            >
              <ShieldAlert className="w-4 h-4 text-[#D4A72C]" />
              <span className="hidden sm:inline text-[11px]">Audit IDOR</span>
            </button>

            {/* Push notification toggle button */}
            <button
              onClick={handleTogglePushNotification}
              className={`p-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
                pushEnabled
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
              }`}
              title="Aktifkan Notifikasi Push"
            >
              <BellRing className={`w-4 h-4 ${pushEnabled ? 'text-[#D4A72C]' : 'text-slate-300'}`} />
              <span className="hidden sm:inline text-[11px]">{pushEnabled ? 'Push Aktif' : 'Push Notif'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-xs"
              aria-label="Buka Notifikasi"
            >
              <Bell className="w-4 h-4 text-[#D4A72C]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-[#D4A72C] text-[#123B5D] font-black text-[10px] flex items-center justify-center">
                {profile.namaLengkap.slice(0, 1)}
              </div>
              <span className="hidden sm:inline text-xs font-bold">Profil</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROFIL RINGKAS CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D52] border border-emerald-200 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">{profile.namaLengkap}</h3>
              <span className="bg-emerald-50 text-[#2E7D52] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Warga Aktif ({profile.statusWarga})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {profile.blok} • RT {profile.rt} / RW {profile.rw} • {profile.perumahan}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="self-start sm:self-center text-xs font-bold text-[#123B5D] hover:text-[#2E7D52] bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-all flex items-center gap-1"
        >
          Lihat Profil Lengkap <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. ⚡ LAYANAN CEPAT (QUICK ACTION GRID) */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4A72C]" />
            Layanan Cepat Warga
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Akses Mandiri 24 Jam</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          
          {/* 1. Buat Surat */}
          <button
            onClick={() => {
              if (onOpenLetterModal) onOpenLetterModal();
              else onNavigate('surat');
            }}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-sky-700">Ajukan Surat</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Domisili, SKCK, dll</p>
            </div>
          </button>

          {/* 2. Iuran RT */}
          <button
            onClick={() => onNavigate('iuran')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2E7D52] flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-all">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-[#2E7D52]">Iuran RT</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Kas & Pembayaran</p>
            </div>
          </button>

          {/* 3. Pengaduan */}
          <button
            onClick={() => {
              if (onOpenComplaintModal) onOpenComplaintModal();
              else onNavigate('pengaduan');
            }}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#C62828] flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-all">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-[#C62828]">Pengaduan</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Lampu, Sampah, Fasum</p>
            </div>
          </button>

          {/* 4. Tata Tertib */}
          <button
            onClick={() => onNavigate('tata-tertib')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-teal-800">Tata Tertib</h4>
              <p className="text-[10px] text-slate-400 leading-snug">12 Aturan Lingkungan</p>
            </div>
          </button>

          {/* 5. Dana Kematian */}
          <button
            onClick={() => onNavigate('dana-kematian')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-indigo-700">Dana Kematian</h4>
              <p className="text-[10px] text-slate-400 leading-snug">Santunan & Duka Cita</p>
            </div>
          </button>

          {/* 6. AI Assistant */}
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="group p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200 hover:border-[#D4A72C] hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#123B5D] text-[#D4A72C] flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#123B5D] group-hover:text-[#2E7D52]">AI Assistant</h4>
              <p className="text-[10px] text-slate-500 leading-snug">Tanya Info RT 24/7</p>
            </div>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAGIHAN SAYA & PEMBAYARAN (ISOLATED FUNDS BREAKDOWN) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#2E7D52]" />
              Ringkasan Tagihan Saya
            </h3>
            <p className="text-xs text-slate-500">
              Status kewajiban iuran warga (Pos Keuangan Terisolasi)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total Belum Dibayar:</span>
            <span className={`text-sm font-black ${totalUnpaidAmount > 0 ? 'text-[#C62828]' : 'text-[#2E7D52]'}`}>
              Rp {totalUnpaidAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Invoices List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                inv.status === 'LUNAS'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-amber-50/40 border-amber-200 hover:shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {inv.periode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'LUNAS'
                        ? 'bg-emerald-100 text-[#2E7D52] border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {inv.status === 'LUNAS' ? '🟢 LUNAS' : '🟡 BELUM BAYAR'}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800">{inv.title}</h4>
                <p className="text-[11px] text-slate-500">{inv.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                <span className="font-black text-slate-800">
                  Rp {inv.nominal.toLocaleString('id-ID')}
                </span>

                {inv.status !== 'LUNAS' ? (
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Bayar QRIS
                  </button>
                ) : (
                  <span className="text-[10px] text-[#2E7D52] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {inv.paymentMethod || 'Lunas'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D52]" /> Sumber dana terisolasi sesuai amanat kas RT 07.
          </span>
          <button
            onClick={() => onNavigate('iuran')}
            className="text-[#123B5D] hover:underline font-bold"
          >
            Lihat Riwayat Transaksi →
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DUA KOLOM: STATUS SURAT & PENGADUAN SAYA */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Kolom 1: Status Pengajuan Surat */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Pengajuan Surat Saya
              </h3>
              <button
                onClick={() => onNavigate('surat')}
                className="text-xs text-sky-700 hover:underline font-bold"
              >
                Lihat Semua ({letters.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {letters.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Belum ada riwayat permohonan surat.
                </div>
              ) : (
                letters.map((s) => (
                  <div
                    key={s.idSurat}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{s.jenisSurat}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'SELESAI' || s.status === 'DISETUJUI'
                            ? 'bg-emerald-100 text-[#2E7D52]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status === 'SELESAI' ? '🟢 SELESAI' : '🟡 ' + s.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>No: {s.nomorSurat}</span>
                      <span className="font-mono text-slate-400">{s.tanggalPengajuan}</span>
                    </div>
                    {s.catatanAdmin && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 leading-snug">
                        💬 <b>Catatan RT:</b> {s.catatanAdmin}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenLetterModal) onOpenLetterModal();
              else onNavigate('surat');
            }}
            className="w-full bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold py-2.5 rounded-2xl border border-sky-200 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Buat Permohonan Surat Baru
          </button>
        </div>

        {/* Kolom 2: Status Pengaduan Saya */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C62828]" />
                Pengaduan Warga Saya
              </h3>
              <button
                onClick={() => onNavigate('pengaduan')}
                className="text-xs text-[#C62828] hover:underline font-bold"
              >
                Lihat Semua ({complaints.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {complaints.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ada tiket pengaduan aktif.
                </div>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c.idPengaduan}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{c.kategori}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'SELESAI'
                            ? 'bg-emerald-100 text-[#2E7D52]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status === 'SELESAI' ? '🟢 SELESAI' : '🟡 ' + c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{c.deskripsi}</p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Tiket: {c.nomorTiket}</span>
                      <span>{c.tanggal}</span>
                    </div>
                    {c.tanggapanAdmin && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 leading-snug">
                        🛠️ <b>Tanggapan RT:</b> {c.tanggapanAdmin}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenComplaintModal) onOpenComplaintModal();
              else onNavigate('pengaduan');
            }}
            className="w-full bg-rose-50 hover:bg-rose-100 text-[#C62828] font-bold py-2.5 rounded-2xl border border-rose-200 transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Buat Laporan Pengaduan Baru
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. DUA KOLOM: TATA TERTIB & PENGUMUMAN RT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Tata Tertib Aktif */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Tata Tertib Warga RT 07
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Versi Aktif ({tataTertibActive.version})
            </span>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-50/60 to-slate-50 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#123B5D]">{tataTertibActive.title}</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              {tataTertibActive.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#2E7D52] font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="text-[10px] text-slate-400 pt-1">
              Berlaku resmi sejak: {tataTertibActive.effectiveDate}
            </div>
          </div>

          <button
            onClick={() => onNavigate('tata-tertib')}
            className="w-full bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold py-2.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" /> Baca 12 Bab Tata Tertib Lengkap
          </button>
        </div>

        {/* Pengumuman RT */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              Pengumuman Terbaru RT
            </h3>
            <button
              onClick={() => onNavigate('pengumuman')}
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {announcements.slice(0, 2).map((pgm) => (
              <div
                key={pgm.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{pgm.judul}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{pgm.tanggal}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{pgm.isi}</p>
                <span className="text-[10px] text-indigo-700 font-bold block pt-0.5">
                  Oleh: {pgm.penulis}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('pengumuman')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition-all text-xs"
          >
            Buka Papan Pengumuman
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 7. DUA KOLOM: KEGIATAN WARGA & SMART AI ASSISTANT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Kegiatan Warga */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Agenda & Kegiatan RT Mendatang
            </h3>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs text-amber-700 hover:underline font-bold"
            >
              Lihat Kalender
            </button>
          </div>

          <div className="space-y-2.5">
            {activities.map((act) => (
              <div
                key={act.idAgenda}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex flex-col items-center justify-center shrink-0 font-bold">
                  <span className="text-[10px] uppercase leading-none">Agt</span>
                  <span className="text-sm font-black leading-none">{act.tanggal.split('-')[2]}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="font-bold text-slate-800 truncate">{act.judul}</h4>
                  <p className="text-[11px] text-slate-500">
                    ⏰ {act.jam} • 📍 {act.lokasi}
                  </p>
                  <span className="text-[10px] text-slate-400 block">PJ: {act.penanggungJawab}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant Quick Widget */}
        <div className="bg-gradient-to-br from-[#0A2338] via-[#123B5D] to-[#1C452F] text-white rounded-3xl p-5 border border-emerald-400/30 shadow-md space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4A72C]">
              <Bot className="w-4 h-4" />
              <span>SMART RT AI ASSISTANT</span>
            </div>
            <h4 className="font-bold text-sm text-white">Ada yang bisa kami bantu seputar RT 07?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tanyakan prosedur surat, ketentuan iuran, aturan parkir, atau pengaduan secara instan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleAiQuickPrompt('Bagaimana cara membuat surat?')}
                className="text-left bg-white/10 hover:bg-white/20 p-2 rounded-xl text-[11px] text-slate-200 border border-white/10 transition-all truncate"
              >
                📄 Cara buat surat domisili?
              </button>
              <button
                onClick={() => handleAiQuickPrompt('Berapa nominal iuran bulanan RT?')}
                className="text-left bg-white/10 hover:bg-white/20 p-2 rounded-xl text-[11px] text-slate-200 border border-white/10 transition-all truncate"
              >
                💰 Berapa iuran RT bulan ini?
              </button>
              <button
                onClick={() => handleAiQuickPrompt('Bagaimana aturan parkir kendaraan?')}
                className="text-left bg-white/10 hover:bg-white/20 p-2 rounded-xl text-[11px] text-slate-200 border border-white/10 transition-all truncate"
              >
                🚗 Aturan parkir di depan rumah?
              </button>
              <button
                onClick={() => handleAiQuickPrompt('Bagaimana cara mengajukan pengaduan?')}
                className="text-left bg-white/10 hover:bg-white/20 p-2 rounded-xl text-[11px] text-slate-200 border border-white/10 transition-all truncate"
              >
                🚨 Cara membuat tiket laporan?
              </button>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="w-full bg-[#2E7D52] hover:bg-[#236340] text-white font-bold py-2.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Bot className="w-3.5 h-3.5 text-[#D4A72C]" /> Mulai Chat dengan AI Assistant
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 8. MODAL DIALOGS */}
      {/* ========================================================================= */}

      {/* QRIS Payment Modal */}
      <WargaQrisPaymentModal
        isOpen={selectedInvoice !== null}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        authContext={authContext}
        onPaymentSuccess={(msg) => {
          showToast(msg);
          loadDashboardData();
        }}
      />

      {/* Warga Profile Modal */}
      <WargaProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
      />

      {/* Warga Notifications Modal */}
      <WargaNotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigate={(target) => onNavigate(target)}
      />

      {/* Security Isolation Compliance Audit & IDOR Test Modal */}
      <SecurityIsolationTestModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
      />

    </div>
  );
};
