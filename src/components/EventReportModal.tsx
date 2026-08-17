// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Event Report (LPJ) Modal & Document Preview

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Save,
  Check,
  History
} from 'lucide-react';
import {
  KegiatanRT,
  LaporanKegiatan,
  ActorSession
} from '../types/activity';
import { eventReportService } from '../services/eventReportService';
import { activityCalendarService } from '../services/activityCalendarService';
import { eventAttendanceService } from '../services/eventAttendanceService';

interface EventReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: KegiatanRT | null;
  actor: ActorSession;
  onError: (error: string) => void;
}

export const EventReportModal: React.FC<EventReportModalProps> = ({
  isOpen,
  onClose,
  event,
  actor,
  onError
}) => {
  const [report, setReport] = useState<LaporanKegiatan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [jumlahPesertaHadir, setJumlahPesertaHadir] = useState(0);
  const [totalPesertaTerdaftar, setTotalPesertaTerdaftar] = useState(0);
  const [ringkasanPelaksanaan, setRingkasanPelaksanaan] = useState('');
  const [hasilKegiatan, setHasilKegiatan] = useState('');
  const [kendala, setKendala] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      loadReport();
    }
  }, [event, isOpen]);

  const loadReport = () => {
    if (!event) return;
    const existingList = eventReportService.getReports(actor, event.idKegiatan);
    if (existingList.length > 0) {
      const rep = existingList[0];
      setReport(rep);
      setJumlahPesertaHadir(rep.jumlahPesertaHadir);
      setTotalPesertaTerdaftar(rep.totalPesertaTerdaftar);
      setRingkasanPelaksanaan(rep.ringkasanPelaksanaan);
      setHasilKegiatan(rep.hasilKegiatan);
      setKendala(rep.kendala);
      setTindakLanjut(rep.tindakLanjut);
      setIsEditing(false);
    } else {
      // Auto populate from Attendance and Event
      const attendees = eventAttendanceService.getAttendees(actor, event.idKegiatan);
      const hadirCount = attendees.filter((a) => a.statusKehadiran === 'HADIR').length;
      const totalCount = attendees.length > 0 ? attendees.length : event.estimasiPeserta;

      setReport(null);
      setJumlahPesertaHadir(hadirCount || 35);
      setTotalPesertaTerdaftar(totalCount || 40);
      setRingkasanPelaksanaan(`Kegiatan "${event.judul}" telah dilaksanakan pada tanggal ${event.tanggalMulai} di ${event.lokasi}.`);
      setHasilKegiatan('Kegiatan berjalan lancar dan mencapai sasaran program kerja RT.');
      setKendala('Tidak ada kendala yang berarti.');
      setTindakLanjut('Menindaklanjuti hasil kegiatan pada agenda pertemuan pengurus berikutnya.');
      setIsEditing(true);
    }
  };

  if (!isOpen || !event) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();

    if (report) {
      // Update existing
      const res = eventReportService.updateReport(
        actor,
        report.idLaporan,
        {
          jumlahPesertaHadir: Number(jumlahPesertaHadir),
          totalPesertaTerdaftar: Number(totalPesertaTerdaftar),
          ringkasanPelaksanaan,
          hasilKegiatan,
          kendala,
          tindakLanjut
        },
        changeSummary,
        reqId
      );

      setIsProcessing(false);
      if (res.success && res.data) {
        setReport(res.data);
        setIsEditing(false);
        setChangeSummary('');
      } else {
        onError(res.error || 'Gagal menyimpan laporan.');
      }
    } else {
      // Create new
      const res = eventReportService.createReport(
        actor,
        {
          kegiatanId: event.idKegiatan,
          judulKegiatan: event.judul,
          tanggalPelaksanaan: event.tanggalMulai,
          lokasi: event.lokasi,
          penanggungJawab: event.penanggungJawabNama,
          jumlahPesertaHadir: Number(jumlahPesertaHadir),
          totalPesertaTerdaftar: Number(totalPesertaTerdaftar),
          ringkasanPelaksanaan,
          hasilKegiatan,
          kendala,
          tindakLanjut
        },
        reqId
      );

      setIsProcessing(false);
      if (res.success && res.data) {
        setReport(res.data);
        setIsEditing(false);
      } else {
        onError(res.error || 'Gagal membuat laporan baru.');
      }
    }
  };

  const handleFinalize = () => {
    if (!report) return;
    setIsProcessing(true);
    const reqId = activityCalendarService.generateRequestId();
    const res = eventReportService.finalizeReport(actor, report.idLaporan, reqId);
    setIsProcessing(false);

    if (res.success && res.data) {
      setReport(res.data);
      setIsEditing(false);
    } else {
      onError(res.error || 'Gagal memfinalisasi laporan.');
    }
  };

  const handlePrint = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>LPJ - ${report.nomorLaporan}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${eventReportService.renderReportHTML(report)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-5 text-white flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#D4A72C] font-bold">
                  {report ? report.nomorLaporan : 'DRAFT BARU'}
                </span>
                {report && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === 'FINAL' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {report.status}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base mt-0.5">Laporan Pertanggungjawaban (LPJ)</h3>
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
          
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700">
              Kegiatan: <span className="text-[#123B5D]">{event.judul}</span>
            </div>
            <div className="flex items-center gap-2">
              {report && (
                <button
                  onClick={handlePrint}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#123B5D]" /> Cetak LPJ Resmi
                </button>
              )}
              {report && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs"
                >
                  Edit Laporan
                </button>
              )}
              {report && report.status === 'DRAFT' && !isEditing && (
                <button
                  onClick={handleFinalize}
                  disabled={isProcessing}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Finalisasi LPJ
                </button>
              )}
            </div>
          </div>

          {/* Form / View */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Jumlah Peserta Hadir (Orang)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={jumlahPesertaHadir}
                    onChange={(e) => setJumlahPesertaHadir(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Total Peserta Terdaftar (Orang)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalPesertaTerdaftar}
                    onChange={(e) => setTotalPesertaTerdaftar(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  1. Ringkasan Pelaksanaan Kegiatan
                </label>
                <textarea
                  rows={3}
                  required
                  value={ringkasanPelaksanaan}
                  onChange={(e) => setRingkasanPelaksanaan(e.target.value)}
                  placeholder="Jelaskan jalannya acara, pembagian regu, dan waktu pelaksanaan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  2. Hasil Kegiatan & Capaian
                </label>
                <textarea
                  rows={3}
                  required
                  value={hasilKegiatan}
                  onChange={(e) => setHasilKegiatan(e.target.value)}
                  placeholder="Pencapaian fisik, kesepakatan rapat, atau hasil pemeriksaan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  3. Kendala yang Dihadapi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  placeholder="Hambatan yang dialami selama kegiatan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  4. Rekomendasi & Tindak Lanjut
                </label>
                <textarea
                  rows={2}
                  required
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  placeholder="Rencana kelanjutan atau evaluasi berikutnya..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              {report && report.status === 'FINAL' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-1">
                  <label className="block text-xs font-bold text-amber-900">
                    Alasan Revisi Dokumen Final (Audit Trail):
                  </label>
                  <input
                    type="text"
                    required
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="Contoh: Penyesuaian angka kehadiran warga blok C..."
                    className="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                {report && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Simpan Laporan
                </button>
              </div>
            </form>
          ) : report ? (
            /* Document Preview */
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 font-medium">Hari / Tanggal:</span>
                    <p className="font-bold text-slate-800">{report.tanggalPelaksanaan}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Tempat:</span>
                    <p className="font-bold text-slate-800">{report.lokasi}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Penanggung Jawab:</span>
                    <p className="font-bold text-slate-800">{report.penanggungJawab}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Kehadiran:</span>
                    <p className="font-bold text-emerald-700">
                      {report.jumlahPesertaHadir} Orang (dari {report.totalPesertaTerdaftar} terdaftar)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-[#123B5D] uppercase">1. Ringkasan Pelaksanaan</h4>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {report.ringkasanPelaksanaan}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#123B5D] uppercase">2. Hasil Kegiatan & Capaian</h4>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {report.hasilKegiatan}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#123B5D] uppercase">3. Kendala</h4>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {report.kendala || 'Tidak ada kendala berarti.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#123B5D] uppercase">4. Tindak Lanjut</h4>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {report.tindakLanjut}
                  </p>
                </div>
              </div>

              {/* Revision History */}
              {report.revisionHistory && report.revisionHistory.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <h5 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <History className="w-3.5 h-3.5 text-[#123B5D]" /> Riwayat Revisi Dokumen
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {report.revisionHistory.map((rev) => (
                      <li key={rev.version} className="border-l-2 border-[#2E7D52] pl-2">
                        <b>v{rev.version}</b> • {new Date(rev.modifiedAt).toLocaleString('id-ID')} • {rev.modifiedBy}: {rev.changeSummary}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
