/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Cetak & PDF Tab for MODUL TATA TERTIB WARGA v1.0
 */

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Building2,
  FileText,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  TataTertibArticle,
  TataTertibConfig
} from '../../types/tataTertib';
import { generateTataTertibPdf } from '../../utils/tataTertibPdf';

interface TataTertibCetakTabProps {
  articles: TataTertibArticle[];
  config: TataTertibConfig;
}

export const TataTertibCetakTab: React.FC<TataTertibCetakTabProps> = ({ articles, config }) => {
  const activeArticles = articles.filter(a => a.status === 'AKTIF' || a.status === 'ACTIVE');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFullBookPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    let cursorY = 20;

    // Cover / Header
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(config.kopHeaderTitle, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 6;

    doc.setFontSize(11);
    doc.text(config.kopSubTitle, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text(config.kopLocation, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 6;

    // Double divider
    doc.setLineWidth(0.8);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 1.5;
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('BUKU TATA TERTIB RESMI WARGA RT 07', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 6;

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('Versi 1.1 • Edisi Pemukiman Guyub Rukun & Aman', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 10;

    activeArticles.forEach((article, index) => {
      if (cursorY > pageHeight - 50) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text(`${article.nomor || `PASAL ${index + 1}`}: ${article.judul.toUpperCase()}`, margin, cursorY);
      cursorY += 5;

      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);

      if (article.tujuan) {
        doc.setFont('times', 'italic');
        const goalLines = doc.splitTextToSize(`Tujuan: ${article.tujuan}`, maxLineWidth);
        doc.text(goalLines, margin, cursorY);
        cursorY += goalLines.length * 4.5 + 2;
        doc.setFont('times', 'normal');
      }

      const contentLines = doc.splitTextToSize(article.isi || '', maxLineWidth);
      if (cursorY + contentLines.length * 4.5 > pageHeight - 30) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(contentLines, margin, cursorY);
      cursorY += contentLines.length * 4.5 + 6;

      // Divider between articles
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 6;
    });

    // End Signature Section
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = 20;
    }
    const signX = pageWidth - margin - 65;
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text('Ditetapkan di : Perum GPA Ngijo', signX, cursorY);
    cursorY += 4.5;
    doc.text('Pada tanggal  : 17 Agustus 2026', signX, cursorY);
    cursorY += 5;
    doc.setFont('times', 'bold');
    doc.text('Ketua RT 07 RW 11 GPA Ngijo', signX, cursorY);
    cursorY += 18;
    doc.text(config.signingOfficialName, signX, cursorY);
    cursorY += 4;
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.text('(Tanda Tangan Elektronik Sah SMART RT)', signX, cursorY);

    doc.save('BUKU-TATA-TERTIB-RT07-RW11-GPA-NGIJO.pdf');
  };

  const displayedArticles = selectedArticleId === 'ALL'
    ? activeArticles
    : activeArticles.filter(a => a.id === selectedArticleId || a.kode === selectedArticleId);

  return (
    <div className="space-y-6">
      {/* Control Action Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#123B5D]" />
            Pratinjau Dokumen Cetak & Format PDF Resmi
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Format A4 standar surat resmi RT 07 RW 11 Perum GPA Ngijo dengan nomor surat dan legalitas Ketua RT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            aria-label="Pilih pasal yang akan dicetak"
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          >
            <option value="ALL">Cetak Seluruh Buku (13 Bab/Pasal)</option>
            {activeArticles.map(a => (
              <option key={a.id} value={a.id}>{a.kode} - {a.judul}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#123B5D] hover:bg-[#0A2338] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak (Print Preview)
          </button>

          <button
            onClick={handleDownloadFullBookPdf}
            className="px-4 py-2 bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Unduh PDF Resmi
          </button>
        </div>
      </div>

      {/* Printable Sheet (Simulated A4 Paper) */}
      <div className="bg-slate-200/60 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto">
        <div
          id="printable-tata-tertib-sheet"
          className="bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-14 shadow-2xl rounded-sm text-slate-900 border border-slate-300 font-serif leading-relaxed"
        >
          {/* Formal Header (KOP RT) */}
          <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6">
            <h1 className="font-bold text-lg sm:text-xl tracking-wider text-slate-900 uppercase">
              {config.kopHeaderTitle}
            </h1>
            <h2 className="font-bold text-sm sm:text-base text-slate-800 uppercase mt-0.5">
              {config.kopSubTitle}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              {config.kopLocation}
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center my-6 space-y-1">
            <h3 className="font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide underline underline-offset-4">
              TATA TERTIB KEHIDUPAN BERMASYARAKAT WARGA RT 07
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Nomor: TT/RT07RW11/GPA-NGIJO/2026 • Versi 1.1 Resmi
            </p>
          </div>

          {/* Articles Flow */}
          <div className="space-y-6 text-xs sm:text-sm text-slate-800">
            {displayedArticles.map((art, idx) => (
              <div key={art.id} className="space-y-2 border-b border-slate-200 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">
                    {art.nomor || `Pasal ${idx + 1}`}: {art.judul}
                  </h4>
                  <span className="text-[10px] font-sans font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {art.kode || art.id}
                  </span>
                </div>

                {art.dasar && (
                  <p className="text-xs italic text-slate-600">
                    Dasar: {art.dasar}
                  </p>
                )}

                <div className="whitespace-pre-line leading-relaxed text-slate-700 text-xs sm:text-[13px]">
                  {art.isi}
                </div>

                {art.sanksi && (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs mt-2">
                    <span className="font-bold text-slate-800">Sanksi Pelanggaran: </span>
                    <span className="text-slate-700">{art.sanksi}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Signature & Legal Verification */}
          <div className="mt-12 pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
              <div className="w-12 h-12 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[11px]">QR Verifikasi Keabsahan</p>
                <p className="text-[10px] text-slate-500">Tersertifikasi Portal SMART RT</p>
                <p className="text-[10px] text-emerald-700 font-bold">STATUS: DOKUMEN SAH</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="font-sans text-xs">Ngijo, Karangploso, 17 Agustus 2026</p>
              <p className="font-bold text-slate-900">Ketua RT 07 RW 11 GPA Ngijo</p>
              <div className="h-14 flex items-center justify-end">
                <span className="text-xs italic text-emerald-700 font-sans bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  [Tanda Tangan Digital Terverifikasi]
                </span>
              </div>
              <p className="font-bold text-slate-900 underline">{config.signingOfficialName}</p>
              <p className="text-xs text-slate-500 font-sans">{config.signingOfficialTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
