// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Event Attendance Tracking & Management Component

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle,
  Clock,
  QrCode,
  UserPlus,
  Search,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Building,
  UserCheck
} from 'lucide-react';
import {
  KegiatanRT,
  KehadiranKegiatan,
  AttendanceStatus,
  ActorSession
} from '../types/activity';
import { Warga } from '../types/rt';
import { eventAttendanceService } from '../services/eventAttendanceService';
import { activityCalendarService } from '../services/activityCalendarService';

interface EventAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  event: KegiatanRT | null;
  actor: ActorSession;
  wargaList: Warga[];
  onError: (error: string) => void;
}

export const EventAttendance: React.FC<EventAttendanceProps> = ({
  isOpen,
  onClose,
  event,
  actor,
  wargaList,
  onError
}) => {
  const [attendees, setAttendees] = useState<KehadiranKegiatan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWargaId, setSelectedWargaId] = useState('');
  const [qrInputToken, setQrInputToken] = useState('');
  const [checkInMsg, setCheckInMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      loadData();
    }
  }, [event, isOpen]);

  const loadData = () => {
    if (!event) return;
    const list = eventAttendanceService.getAttendees(actor, event.idKegiatan);
    setAttendees(list);
  };

  if (!isOpen || !event) return null;

  const totalRegistered = attendees.length;
  const totalHadir = attendees.filter((a) => a.statusKehadiran === 'HADIR').length;
  const totalIzin = attendees.filter((a) => a.statusKehadiran === 'IZIN').length;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalHadir / totalRegistered) * 100) : 0;

  const filteredAttendees = attendees.filter(
    (a) =>
      a.namaWarga.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.blokRumah && a.blokRumah.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Manual Add Resident
  const handleAddResident = () => {
    if (!selectedWargaId) {
      onError('Pilih warga terlebih dahulu.');
      return;
    }
    const targetWarga = wargaList.find((w) => w.id_warga === selectedWargaId);
    if (!targetWarga) return;

    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = eventAttendanceService.registerAttendance(
      actor,
      {
        kegiatanId: event.idKegiatan,
        wargaId: targetWarga.id_warga,
        namaWarga: targetWarga.nama_lengkap,
        blokRumah: targetWarga.blok,
        catatan: 'Ditambahkan oleh Pengurus RT'
      },
      reqId
    );
    setIsProcessing(false);

    if (res.success) {
      loadData();
      setSelectedWargaId('');
    } else {
      onError(res.error || 'Gagal menambahkan data kehadiran.');
    }
  };

  // QR / Token Check-In
  const handleTokenCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInputToken.trim()) return;

    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = eventAttendanceService.checkIn(
      actor,
      event.idKegiatan,
      actor.wargaId || actor.userId,
      qrInputToken.trim(),
      reqId
    );
    setIsProcessing(false);

    if (res.success) {
      setCheckInMsg('Check-in Berhasil! Data kehadiran telah dicatat.');
      setQrInputToken('');
      loadData();
      setTimeout(() => setCheckInMsg(''), 4000);
    } else {
      onError(res.error || 'Check-in gagal.');
    }
  };

  // Update Individual Attendance Status
  const handleUpdateStatus = (attendanceId: string, status: AttendanceStatus) => {
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = eventAttendanceService.updateStatus(actor, attendanceId, status, '', reqId);
    setIsProcessing(false);
    if (res.success) {
      loadData();
    } else {
      onError(res.error || 'Gagal memperbarui status kehadiran.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Nama Warga', 'Blok', 'Status Kehadiran', 'Waktu Check In', 'Catatan'];
    const rows = attendees.map((a) => [
      a.id,
      `"${a.namaWarga}"`,
      `"${a.blokRumah || '-'}"`,
      a.statusKehadiran,
      a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString('id-ID') : '-',
      `"${a.catatan || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Hadir_${event.kodeKegiatan}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-5 text-white flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Presensi & Kehadiran Warga</h3>
              <p className="text-xs text-slate-300">
                {event.kodeKegiatan} • {event.judul}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-500">TERDAFTAR</p>
              <p className="text-xl font-extrabold text-slate-800">{totalRegistered}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <p className="text-[11px] font-bold text-[#2E7D52]">HADIR</p>
              <p className="text-xl font-extrabold text-emerald-800">{totalHadir}</p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <p className="text-[11px] font-bold text-amber-600">IZIN</p>
              <p className="text-xl font-extrabold text-amber-800">{totalIzin}</p>
            </div>
            <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-center">
              <p className="text-[11px] font-bold text-[#123B5D]">PERSENTASE</p>
              <p className="text-xl font-extrabold text-sky-900">{attendanceRate}%</p>
            </div>
          </div>

          {/* QR / Token Check-In Box */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#2E7D52]" /> Masukkan Token QR Check-In
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                Token Resmi: {event.qrCheckInToken || 'TIDAK TERSEDIA'}
              </span>
            </div>

            <form onSubmit={handleTokenCheckIn} className="flex gap-2">
              <input
                type="text"
                value={qrInputToken}
                onChange={(e) => setQrInputToken(e.target.value)}
                placeholder="Tempel atau ketik token presensi..."
                className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white outline-hidden focus:ring-2 focus:ring-[#2E7D52]"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Check-In
              </button>
            </form>

            {checkInMsg && (
              <p className="text-xs font-bold text-[#2E7D52] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {checkInMsg}
              </p>
            )}
          </div>

          {/* Add Resident Manually & Search Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedWargaId}
                onChange={(e) => setSelectedWargaId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="">-- Tambah Warga ke Daftar Presensi --</option>
                {wargaList.map((w) => (
                  <option key={w.id_warga} value={w.id_warga}>
                    {w.nama_lengkap} ({w.blok})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddResident}
                disabled={isProcessing}
                className="bg-[#123B5D] hover:bg-[#0d2a42] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" /> Daftarkan Warga
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama warga atau blok..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>
              <button
                onClick={handleExportCsv}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Export CSV
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Warga</th>
                  <th className="py-2.5 px-3">Blok</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Waktu Masuk</th>
                  <th className="py-2.5 px-3 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      Belum ada catatan presensi untuk kegiatan ini.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{a.namaWarga}</td>
                      <td className="py-2.5 px-3 text-slate-600">{a.blokRumah || '-'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            a.statusKehadiran === 'HADIR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.statusKehadiran === 'IZIN'
                              ? 'bg-amber-100 text-amber-800'
                              : a.statusKehadiran === 'TIDAK_HADIR'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {a.statusKehadiran}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString('id-ID') : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'HADIR')}
                            className="px-2 py-1 text-[10px] font-bold hover:bg-emerald-50 text-emerald-700 border-r border-slate-200"
                            title="Tandai Hadir"
                          >
                            Hadir
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'IZIN')}
                            className="px-2 py-1 text-[10px] font-bold hover:bg-amber-50 text-amber-700 border-r border-slate-200"
                            title="Tandai Izin"
                          >
                            Izin
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'TIDAK_HADIR')}
                            className="px-2 py-1 text-[10px] font-bold hover:bg-rose-50 text-rose-700"
                            title="Tandai Tidak Hadir"
                          >
                            Alpha
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
