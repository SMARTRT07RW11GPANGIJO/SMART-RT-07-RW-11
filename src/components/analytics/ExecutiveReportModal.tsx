import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Home, 
  Building,
  RefreshCw
} from 'lucide-react';
import { ExecutiveReport, ReportType } from '../../types/analytics';
import { AnalyticsService, AnalyticsActorSession } from '../../services/analyticsService';
import { OfficialKopSurat } from '../OfficialKopSurat';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExecutiveReport | null;
  actor: AnalyticsActorSession;
  onReportUpdated?: (updatedReport: ExecutiveReport) => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  report,
  actor,
  onReportUpdated
}) => {
  const [currentReport, setCurrentReport] = useState<ExecutiveReport | null>(report);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);

  React.useEffect(() => {
    setCurrentReport(report);
  }, [report]);

  if (!isOpen || !currentReport) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
================================================================================
${currentReport.title.toUpperCase()}
SMART RT 07 RW 11 PERUMAHAN GRAHA PELITA ASRI, NGIJO, KARANGPLOSO
================================================================================
Nomor Laporan : ${currentReport.reportId}
Periode       : ${currentReport.period}
Tanggal Cetak : ${new Date(currentReport.generatedAt).toLocaleString('id-ID')}
Diterbitkan   : ${currentReport.generatorName} (${currentReport.generatorRole})
Checksum      : ${currentReport.checksum}
Status        : IMMUTABLE OFFICIAL RECORD (Rev ${currentReport.revision})
================================================================================

I. RINGKASAN EKSEKUTIF
--------------------------------------------------------------------------------
${currentReport.executiveSummary}

II. STATISTIK KEPENDUDUKAN & KELUARGA
--------------------------------------------------------------------------------
- Total Warga        : ${currentReport.demographics.totalWarga} Jiwa
- Total Kartu Keluarga: ${currentReport.family.totalKK} KK
- Komposisi Gender   : Laki-laki: ${currentReport.demographics.gender.lakiLaki} (${currentReport.demographics.gender.persenLakiLaki}%), Perempuan: ${currentReport.demographics.gender.perempuan} (${currentReport.demographics.gender.persenPerempuan}%)
- Kelompok Usia      : Balita: ${currentReport.demographics.ageGroups.balita}, Anak: ${currentReport.demographics.ageGroups.anak}, Remaja: ${currentReport.demographics.ageGroups.remaja}, Dewasa: ${currentReport.demographics.ageGroups.dewasa}, Lansia: ${currentReport.demographics.ageGroups.lansia}
- Rata-rata Anggota  : ${currentReport.family.averageMembersPerKK} orang / KK

III. STATUS HUNIAN & KELENGKAPAN ADMINISTRASI
--------------------------------------------------------------------------------
- Rumah Milik Tetap  : ${currentReport.housing.pemilik} (${currentReport.housing.percentagePemilik}%)
- Kontrak / Sewa     : ${currentReport.housing.kontrak} (${currentReport.housing.percentageKontrak}%)
- Penghuni Kos       : ${currentReport.housing.kos} (${currentReport.housing.percentageKos}%)
- Skor Kelengkapan Data: ${currentReport.completeness.completenessScorePercent}%

IV. KONDISI SARANA & PRASARANA LINGKUNGAN
--------------------------------------------------------------------------------
- Total Fasilitas    : ${currentReport.facilities.totalFacilities} Unit
- Indeks Kesehatan   : ${currentReport.facilities.conditionScorePercent}%
- Kondisi Aset       : Baik: ${currentReport.facilities.conditions.baik}, Rusak Ringan: ${currentReport.facilities.conditions.rusakRingan}, Rusak Sedang: ${currentReport.facilities.conditions.rusakSedang}, Rusak Berat: ${currentReport.facilities.conditions.rusakBerat}
${currentReport.facilities.formattedAssetValuation ? `- Estimasi Nilai Aset: ${currentReport.facilities.formattedAssetValuation}` : ''}

V. AKTIVITAS & AGENDA WARGA
--------------------------------------------------------------------------------
- Total Agenda       : ${currentReport.activities.totalActivities}
- Agenda Selesai     : ${currentReport.activities.completed}
- Indeks Keaktifan   : ${currentReport.activities.activityRateScore}%

VI. REKOMENDASI & TINDAK LANJUT PENGURUS
--------------------------------------------------------------------------------
${currentReport.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

================================================================================
Verifikasi Keaslian Dokumen: ${currentReport.qrVerificationUrl}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.reportId}-Laporan-RT07.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    try {
      const updated = AnalyticsService.getInstance().regenerateReport(
        actor,
        currentReport.reportId,
        customNotes.trim() || undefined
      );
      setCurrentReport(updated);
      setShowRegenPrompt(false);
      setCustomNotes('');
      if (onReportUpdated) {
        onReportUpdated(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan revisi laporan.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print bg-[#123B5D] text-white px-6 py-4 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold shadow">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">Pratinjau Dokumen Laporan Resmi RT</h3>
                <span className="bg-[#2E7D52] text-white text-[10px] px-2 py-0.5 rounded-full font-black border border-[#D4A72C]">
                  {currentReport.reportId}
                </span>
                {currentReport.revision > 1 && (
                  <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Revisi {currentReport.revision}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Format Standar Cetak A4 • Berita Acara Resmi Ketua RT 07 RW 11
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['KETUA_RT', 'ADMIN'].includes(actor.role) && (
              <button
                onClick={() => setShowRegenPrompt(!showRegenPrompt)}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
                title="Terbitkan Revisi Laporan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terbitkan Revisi</span>
              </button>
            )}

            <button
              onClick={handleDownloadText}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Teks</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-[#2E7D52] hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak A4</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Regeneration Sub-panel */}
        {showRegenPrompt && (
          <div className="no-print bg-amber-50 p-4 border-b border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Penerbitan Revisi Laporan (Prinsip Immutability Dokumen)
              </span>
              <button
                onClick={() => setShowRegenPrompt(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Batal
              </button>
            </div>
            <p className="text-xs text-amber-800">
              Laporan yang telah diterbitkan bersifat tetap (immutable). Tombol ini akan membuat versi revisi baru ({currentReport.revision + 1}) dengan data agregat terkini tanpa menghapus arsip sebelumnya.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Catatan revisi tambahan (opsional)..."
                className="flex-1 text-xs border border-amber-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {isRegenerating ? 'Memproses...' : 'Konfirmasi Revisi'}
              </button>
            </div>
          </div>
        )}

        {/* Printable Report Document Body (A4 Paper emulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 shadow-lg border border-slate-200 font-sans text-slate-900 space-y-6">
            
            {/* Official Letterhead */}
            <OfficialKopSurat showAdminWarning={false} theme="navy" />
            
            <div className="w-full h-1 bg-[#123B5D] -mt-2" />
            <div className="w-full h-0.5 bg-[#D4A72C] mt-0.5" />

            {/* Document Header & Metadata */}
            <div className="text-center space-y-1 pt-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-[#123B5D]">
                {currentReport.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600">
                <span>Nomor: <strong className="text-slate-900">{currentReport.reportId}</strong></span>
                <span>•</span>
                <span>Periode: <strong className="text-slate-900">{currentReport.period}</strong></span>
                <span>•</span>
                <span>Klasifikasi: <strong className="text-[#2E7D52]">LAPORAN RESMI</strong></span>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D52]" />
                I. Ringkasan Eksekutif Ketua RT
              </h4>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {currentReport.executiveSummary}
              </p>
            </div>

            {/* Section 2: Core KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Warga</span>
                <span className="text-xl font-black text-[#123B5D]">{currentReport.demographics.totalWarga}</span>
                <span className="text-[9px] text-slate-500 block">Jiwa Terdaftar</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Keluarga</span>
                <span className="text-xl font-black text-amber-700">{currentReport.family.totalKK}</span>
                <span className="text-[9px] text-slate-500 block">Kartu Keluarga</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Kesehatan Fasilitas</span>
                <span className="text-xl font-black text-[#2E7D52]">{currentReport.facilities.conditionScorePercent}%</span>
                <span className="text-[9px] text-slate-500 block">{currentReport.facilities.conditions.baik} Aset Prima</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Kelengkapan Data</span>
                <span className="text-xl font-black text-sky-700">{currentReport.completeness.completenessScorePercent}%</span>
                <span className="text-[9px] text-slate-500 block">Tervalidasi SSoT</span>
              </div>
            </div>

            {/* Section 3: Demographic & Housing Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-2xl p-3 space-y-2">
                <h5 className="font-bold text-[#123B5D] border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>II. Demografi Warga Agregat</span>
                  <span className="text-[10px] font-normal text-slate-500">SSoT Master</span>
                </h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Laki-Laki</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.gender.lakiLaki} jiwa ({currentReport.demographics.gender.persenLakiLaki}%)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Perempuan</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.gender.perempuan} jiwa ({currentReport.demographics.gender.persenPerempuan}%)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Balita (0-5 thn)</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.ageGroups.balita} jiwa</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Usia Sekolah (6-17 thn)</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.ageGroups.anak + currentReport.demographics.ageGroups.remaja} jiwa</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Usia Produktif (18-59 thn)</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.ageGroups.dewasa} jiwa</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Lansia (≥60 thn)</span>
                    <span className="font-bold text-slate-900">{currentReport.demographics.ageGroups.lansia} jiwa</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3 space-y-2">
                <h5 className="font-bold text-[#123B5D] border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>III. Status Hunian & Sarana</span>
                  <span className="text-[10px] font-normal text-slate-500">SSoT GeoBase</span>
                </h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Rumah Milik Tetap</span>
                    <span className="font-bold text-slate-900">{currentReport.housing.pemilik} ({currentReport.housing.percentagePemilik}%)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Kontrak / Sewa</span>
                    <span className="font-bold text-slate-900">{currentReport.housing.kontrak} ({currentReport.housing.percentageKontrak}%)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Penghuni Kos</span>
                    <span className="font-bold text-slate-900">{currentReport.housing.kos} ({currentReport.housing.percentageKos}%)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Fasilitas Berfungsi Baik</span>
                    <span className="font-bold text-emerald-700">{currentReport.facilities.conditions.baik} unit</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-50">
                    <span className="text-slate-600">Fasilitas Rusak / Perbaikan</span>
                    <span className="font-bold text-amber-700">{currentReport.facilities.conditions.rusakRingan + currentReport.facilities.conditions.rusakSedang + currentReport.facilities.conditions.rusakBerat} unit</span>
                  </div>
                  {currentReport.facilities.formattedAssetValuation && (
                    <div className="flex justify-between py-0.5 text-emerald-800 font-bold">
                      <span>Valuasi Aset RT</span>
                      <span>{currentReport.facilities.formattedAssetValuation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Recommendations / Action Items */}
            <div className="space-y-2 border border-slate-200 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
                IV. Catatan Rekomendasi & Tindak Lanjut Pengurus
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                {currentReport.recommendations.map((rec, i) => (
                  <li key={i} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ol>
            </div>

            {/* Official Signatures & QR Code Section */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 items-end text-xs">
              
              {/* QR Verification Block */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center p-1">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="space-y-0.5 text-[9px] text-slate-500">
                  <span className="font-bold text-slate-800 block">VERIFIKASI RESMI</span>
                  <span className="block font-mono text-[8px] truncate max-w-[110px]">{currentReport.checksum}</span>
                  <span className="text-emerald-700 font-bold block">✓ Sah & Terverifikasi</span>
                </div>
              </div>

              {/* Sekretaris Block */}
              <div className="text-center space-y-12">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 block">Mengetahui,</span>
                  <span className="font-bold text-slate-800 block">Sekretaris RT 07</span>
                </div>
                <div className="border-b border-slate-400 pb-0.5 mx-4">
                  <span className="font-bold text-slate-900 block">Bpk. Agus Santoso</span>
                </div>
              </div>

              {/* Ketua RT Signature Block */}
              <div className="text-center space-y-12">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 block">Ngijo, {new Date(currentReport.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="font-bold text-slate-800 block">Ketua RT 07 RW 11</span>
                </div>
                <div className="border-b border-slate-400 pb-0.5 mx-4">
                  <span className="font-bold text-[#123B5D] block">Bpk. Eko Sucahyono</span>
                </div>
              </div>
            </div>

            {/* Document Footer Disclaimer */}
            <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-100">
              Dokumen ini diterbitkan secara otomatis oleh Sistem SMART RT 07 RW 11 GPA Ngijo dengan perlindungan integritas digital dan PDP.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
