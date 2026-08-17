// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Event Detail & Lifecycle Governance Modal

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Tag,
  Share2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Play,
  CheckSquare,
  Archive,
  Ban,
  RotateCcw,
  Edit,
  Send,
  QrCode,
  Download,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import {
  KegiatanRT,
  ActorSession,
  EventStatus
} from '../types/activity';
import { activityCalendarService } from '../services/activityCalendarService';
import { eventReminderService } from '../services/eventReminderService';
import { eventAttendanceService } from '../services/eventAttendanceService';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: KegiatanRT | null;
  actor: ActorSession;
  onEdit: (event: KegiatanRT) => void;
  onOpenAttendance: (event: KegiatanRT) => void;
  onOpenReport: (event: KegiatanRT) => void;
  onStatusChanged: (updatedEvent: KegiatanRT, message: string) => void;
  onError: (error: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  actor,
  onEdit,
  onOpenAttendance,
  onOpenReport,
  onStatusChanged,
  onError
}) => {
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRsvpSuccess, setShowRsvpSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const role = actor.role.toUpperCase();
  const isPengurusOrHigher = ['PENGURUS', 'SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN'].includes(role);
  const isKetuaOrAdmin = ['KETUA_RT', 'ADMIN'].includes(role);

  // Status Badges
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs border border-slate-300">DRAFT</span>;
      case 'MENUNGGU_PERSETUJUAN':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs border border-amber-300 animate-pulse">MENUNGGU PERSETUJUAN</span>;
      case 'DISETUJUI':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs border border-emerald-300">DISETUJUI</span>;
      case 'BERLANGSUNG':
        return <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded-full text-xs border border-sky-300 animate-pulse">BERLANGSUNG</span>;
      case 'SELESAI':
        return <span className="bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full text-xs border border-teal-300">SELESAI</span>;
      case 'DITUNDA':
        return <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full text-xs border border-purple-300">DITUNDA</span>;
      case 'DIBATALKAN':
        return <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-xs border border-rose-300">DIBATALKAN</span>;
      case 'ARSIP':
        return <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs border border-slate-400">ARSIP</span>;
    }
  };

  // State Transition Handlers
  const handleSubmitApproval = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.submitKegiatan(actor, event.idKegiatan, reqId);
    setIsProcessing(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan berhasil diajukan untuk persetujuan Ketua RT.');
    } else {
      onError(res.error || 'Gagal mengajukan kegiatan.');
    }
  };

  const handleApprove = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.approveKegiatan(actor, event.idKegiatan, reqId);
    setIsProcessing(false);
    if (res.success && res.data) {
      eventReminderService.generateStandardReminders(actor, event.idKegiatan);
      onStatusChanged(res.data, 'Kegiatan resmi DISETUJUI dan dijadwalkan.');
    } else {
      onError(res.error || 'Gagal menyetujui kegiatan.');
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      onError('Alasan penolakan wajib diisi.');
      return;
    }
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.rejectKegiatan(actor, event.idKegiatan, rejectReason, reqId);
    setIsProcessing(false);
    setRejectReasonOpen(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan ditolak dan dikembalikan ke DRAFT.');
    } else {
      onError(res.error || 'Gagal menolak kegiatan.');
    }
  };

  const handleStart = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.startKegiatan(actor, event.idKegiatan, reqId);
    setIsProcessing(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan dinyatakan sedang BERLANGSUNG.');
    } else {
      onError(res.error || 'Gagal memulai kegiatan.');
    }
  };

  const handleComplete = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.completeKegiatan(actor, event.idKegiatan, reqId);
    setIsProcessing(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan dinyatakan SELESAI.');
    } else {
      onError(res.error || 'Gagal menyelesaikan kegiatan.');
    }
  };

  const handlePostpone = () => {
    if (!newDate || !newTime || !postponeReason.trim()) {
      onError('Tanggal baru, jam baru, dan alasan penundaan wajib diisi.');
      return;
    }
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.postponeKegiatan(
      actor,
      event.idKegiatan,
      newDate,
      newTime,
      postponeReason,
      reqId
    );
    setIsProcessing(false);
    setPostponeOpen(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Jadwal kegiatan berhasil ditunda/diperbarui.');
    } else {
      onError(res.error || 'Gagal menunda kegiatan.');
    }
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      onError('Alasan pembatalan wajib diisi.');
      return;
    }
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.cancelKegiatan(actor, event.idKegiatan, cancelReason, reqId);
    setIsProcessing(false);
    setCancelReasonOpen(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan resmi DIBATALKAN.');
    } else {
      onError(res.error || 'Gagal membatalkan kegiatan.');
    }
  };

  const handleArchive = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = activityCalendarService.archiveKegiatan(actor, event.idKegiatan, reqId);
    setIsProcessing(false);
    if (res.success && res.data) {
      onStatusChanged(res.data, 'Kegiatan dipindahkan ke ARSIP RT.');
    } else {
      onError(res.error || 'Gagal mengarsipkan kegiatan.');
    }
  };

  // RSVP Handler for Warga
  const handleRsvp = () => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = eventAttendanceService.registerAttendance(
      actor,
      {
        kegiatanId: event.idKegiatan,
        wargaId: actor.wargaId || actor.userId,
        namaWarga: actor.nama || 'Warga RT 07',
        blokRumah: 'Blok C',
        catatan: 'Konfirmasi kehadiran mandiri via Kalender Warga'
      },
      reqId
    );
    setIsProcessing(false);
    if (res.success) {
      setShowRsvpSuccess(true);
      setTimeout(() => setShowRsvpSuccess(false), 4000);
    } else {
      onError(res.error || 'Gagal mendaftar kehadiran.');
    }
  };

  // .ics Download Handler
  const handleDownloadIcs = () => {
    const startDateClean = event.tanggalMulai.replace(/-/g, '') + 'T' + event.waktuMulai.replace(/:/g, '') + '00';
    const endDateClean = event.tanggalSelesai.replace(/-/g, '') + 'T' + event.waktuSelesai.replace(/:/g, '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SMART RT 07 RW 11 GPA NGIJO//Activity Calendar//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.idKegiatan}@smart-rt07.gpa-ngijo.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateClean}`,
      `DTEND:${endDateClean}`,
      `SUMMARY:${event.judul}`,
      `DESCRIPTION:${event.deskripsi.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.lokasi}, ${event.alamatLokasi}`,
      `STATUS:${event.status === 'DIBATALKAN' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.kodeKegiatan}_calendar.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar Web Link
  const getGoogleCalendarUrl = () => {
    const startIso = event.tanggalMulai.replace(/-/g, '') + 'T' + event.waktuMulai.replace(/:/g, '') + '00';
    const endIso = event.tanggalSelesai.replace(/-/g, '') + 'T' + event.waktuSelesai.replace(/:/g, '') + '00';
    const titleEnc = encodeURIComponent(event.judul);
    const descEnc = encodeURIComponent(`${event.deskripsi}\n\nPIC: ${event.penanggungJawabNama}`);
    const locEnc = encodeURIComponent(`${event.lokasi}, ${event.alamatLokasi}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleEnc}&dates=${startIso}/${endIso}&details=${descEnc}&location=${locEnc}`;
  };

  // WhatsApp Share Url
  const waShareUrl = eventReminderService.generateWhatsAppShareUrl(event);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-5 text-white flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]/40 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#D4A72C] font-bold bg-white/10 px-2 py-0.5 rounded-md">
                  {event.kodeKegiatan}
                </span>
                {getStatusBadge(event.status)}
              </div>
              <h3 className="font-bold text-lg mt-1 text-white leading-tight">
                {event.judul}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Key Event Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-emerald-50 text-[#2E7D52] font-bold px-3 py-1 rounded-full border border-emerald-200">
              🏷️ {event.kategori.replace(/_/g, ' ')}
            </span>
            <span className="bg-sky-50 text-[#123B5D] font-bold px-3 py-1 rounded-full border border-sky-200">
              📌 Jenis: {event.jenisKegiatan}
            </span>
            <span className={`font-bold px-3 py-1 rounded-full border ${
              event.prioritas === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              event.prioritas === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              ⚡ Prioritas: {event.prioritas}
            </span>
            {event.isPublic ? (
              <span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full border border-teal-200">
                🌐 Publik Warga
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-300">
                🔒 Khusus / Internal
              </span>
            )}
          </div>

          {/* Core Schedule & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#2E7D52] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Waktu & Tanggal</p>
                  <p className="text-slate-600">
                    {new Date(event.tanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {event.waktuMulai} - {event.waktuSelesai} WIB {event.isAllDay && '(Sepanjang Hari)'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Lokasi Kegiatan</p>
                  <p className="text-slate-800 font-bold">{event.lokasi}</p>
                  <p className="text-slate-500 text-[11px]">{event.alamatLokasi}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#123B5D] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Penanggung Jawab (PIC)</p>
                  <p className="text-slate-800 font-semibold">{event.penanggungJawabNama}</p>
                  <p className="text-slate-500 text-[11px]">Penyelenggara: {event.penyelenggara}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Target & Estimasi Peserta</p>
                  <p className="text-slate-800 font-semibold">{event.targetPeserta}</p>
                  <p className="text-slate-500 text-[11px]">Perkiraan: ~{event.estimasiPeserta} Peserta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reasons for Cancellation or Postponement if any */}
          {event.alasanPenundaan && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900">
              <b>Catatan Penundaan:</b> {event.alasanPenundaan}
            </div>
          )}
          {event.alasanPembatalan && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900">
              <b>Alasan Pembatalan:</b> {event.alasanPembatalan}
            </div>
          )}
          {event.rejectionReason && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <b>Catatan Penolakan Ketua RT:</b> {event.rejectionReason}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Deskripsi & Rincian Kegiatan
            </h4>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {event.deskripsi || 'Tidak ada deskripsi rincian kegiatan.'}
            </div>
          </div>

          {/* QR Check-in Token Display for active events */}
          {event.qrCheckInToken && event.status !== 'DRAFT' && event.status !== 'DIBATALKAN' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-[#2E7D52]" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Token QR Check-in Kegiatan</p>
                  <p className="font-mono text-xs font-bold text-[#2E7D52]">{event.qrCheckInToken}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenAttendance(event)}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
              >
                Buka Scanner Kehadiran
              </button>
            </div>
          )}

          {/* RSVP Success Toast */}
          {showRsvpSuccess && (
            <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4" />
              Konfirmasi kehadiran (RSVP) Anda berhasil dicatat ke sistem RT!
            </div>
          )}

          {/* Public & Resident Action Bar */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {event.status === 'DISETUJUI' && (
                <button
                  onClick={handleRsvp}
                  disabled={isProcessing}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <CheckSquare className="w-4 h-4" /> Daftar Hadir (RSVP)
                </button>
              )}

              <button
                onClick={handleDownloadIcs}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Kalender (.ics)
              </button>

              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Google Calendar
              </a>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> Bagikan WA
              </a>
            </div>

            <button
              onClick={() => onOpenAttendance(event)}
              className="text-[#123B5D] hover:underline text-xs font-bold flex items-center gap-1"
            >
              <Users className="w-4 h-4" /> Rekap Kehadiran
            </button>
          </div>

          {/* Sub-Modals for Postpone, Cancel & Reject */}
          {rejectReasonOpen && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
              <p className="text-xs font-bold text-amber-900">Alasan Penolakan Kegiatan:</p>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan catatan perbaikan atau alasan penolakan..."
                className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectReasonOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-700"
                >
                  Konfirmasi Tolak ke Draft
                </button>
              </div>
            </div>
          )}

          {postponeOpen && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-300 space-y-3">
              <p className="text-xs font-bold text-purple-900">Penjadwalan Ulang / Penundaan Kegiatan:</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="p-2 rounded-xl border border-purple-300 text-xs bg-white"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="p-2 rounded-xl border border-purple-300 text-xs bg-white"
                />
              </div>
              <input
                type="text"
                value={postponeReason}
                onChange={(e) => setPostponeReason(e.target.value)}
                placeholder="Alasan penundaan kegiatan..."
                className="w-full p-2 rounded-xl border border-purple-300 text-xs bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPostponeOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white"
                >
                  Batal
                </button>
                <button
                  onClick={handlePostpone}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700"
                >
                  Simpan Jadwal Baru
                </button>
              </div>
            </div>
          )}

          {cancelReasonOpen && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 space-y-3">
              <p className="text-xs font-bold text-rose-900">Alasan Pembatalan Kegiatan Resmi:</p>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Alasan pembatalan kegiatan..."
                className="w-full p-2.5 rounded-xl border border-rose-300 text-xs bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCancelReasonOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-700"
                >
                  Batalkan Kegiatan
                </button>
              </div>
            </div>
          )}

          {/* Pengurus / Ketua RT Governance Workflow Actions */}
          {isPengurusOrHigher && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#D4A72C] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> PANEL PENGURUS & OTORISASI KEGIATAN ({role})
                </span>
                <span className="text-[10px] text-slate-400">Server-Authoritative RBAC</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* DRAFT -> SUBMIT */}
                {event.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => onEdit(event)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Draft
                    </button>
                    <button
                      onClick={handleSubmitApproval}
                      disabled={isProcessing}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Ajukan Persetujuan
                    </button>
                  </>
                )}

                {/* MENUNGGU_PERSETUJUAN -> APPROVE / REJECT */}
                {event.status === 'MENUNGGU_PERSETUJUAN' && isKetuaOrAdmin && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Setujui Kegiatan
                    </button>
                    <button
                      onClick={() => setRejectReasonOpen(true)}
                      className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Kembalikan ke Draft
                    </button>
                  </>
                )}

                {/* DISETUJUI -> START / POSTPONE / CANCEL */}
                {event.status === 'DISETUJUI' && (
                  <>
                    <button
                      onClick={handleStart}
                      disabled={isProcessing}
                      className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Mulai Kegiatan
                    </button>
                    <button
                      onClick={() => setPostponeOpen(true)}
                      className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Tunda Jadwal
                    </button>
                    <button
                      onClick={() => setCancelReasonOpen(true)}
                      className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Batalkan
                    </button>
                  </>
                )}

                {/* BERLANGSUNG -> COMPLETE */}
                {event.status === 'BERLANGSUNG' && (
                  <button
                    onClick={handleComplete}
                    disabled={isProcessing}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Tandai Selesai
                  </button>
                )}

                {/* SELESAI -> BUAT LAPORAN / ARSIP */}
                {event.status === 'SELESAI' && (
                  <>
                    <button
                      onClick={() => onOpenReport(event)}
                      className="bg-[#2E7D52] hover:bg-[#236340] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Laporan Kegiatan (LPJ)
                    </button>
                    {isKetuaOrAdmin && (
                      <button
                        onClick={handleArchive}
                        disabled={isProcessing}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" /> Arsipkan
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
