/**
 * SMART RT 07 RW 11 GPA NGIJO
 * PDF & Printable Generator for Tata Tertib Warga
 */

import { jsPDF } from 'jspdf';
import { TataTertibArticle, TataTertibConfig } from '../types/tataTertib';

export const generateTataTertibPdf = (
  article: TataTertibArticle,
  config?: TataTertibConfig
): void => {
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

  // 1. Header & Kop Surat Resmi
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('RUKUN TETANGGA 07 RUKUN WARGA 11', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;

  doc.setFontSize(12);
  doc.text('PERUMAHAN GRAHA PERMATA ANUGRAH (GPA) DESA NGIJO', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text('Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;

  // Double Divider Line
  doc.setLineWidth(0.8);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 1.5;
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // 2. Title & Metadata
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('TATA TERTIB WARGA RT 07 RW 11', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;

  doc.setFontSize(11);
  doc.text(article.judul.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  const docNo = article.documentNumber || `TT/RT07RW11/${article.kategori.slice(0, 3).toUpperCase()}/${article.id}/2026`;
  doc.text(`Nomor: ${docNo} • Versi: ${article.versi}`, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 8;

  // Metadata Table Box
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, cursorY, maxLineWidth, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, maxLineWidth, 20, 'S');

  doc.text(`Kode Aturan       : ${article.kode || article.id}`, margin + 4, cursorY + 5);
  doc.text(`Kategori            : ${article.kategori}`, margin + 4, cursorY + 10);
  doc.text(`Tanggal Berlaku  : ${article.tanggalBerlaku}`, margin + 4, cursorY + 15);

  doc.text(`Status              : ${article.status}`, margin + 95, cursorY + 5);
  doc.text(`Penyusun         : ${article.dibuatOleh || 'Pengurus RT 07'}`, margin + 95, cursorY + 10);
  doc.text(`Pengesahan      : ${article.disetujuiOleh || 'Ketua RT 07'}`, margin + 95, cursorY + 15);
  cursorY += 26;

  // Function to print wrapped section
  const printSection = (title: string, textOrList: string | string[]) => {
    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin, cursorY);
    cursorY += 4.5;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);

    if (Array.isArray(textOrList)) {
      textOrList.forEach(item => {
        const bulletText = `•  ${item}`;
        const lines = doc.splitTextToSize(bulletText, maxLineWidth - 4);
        if (cursorY + lines.length * 4 > pageHeight - 30) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(lines, margin + 4, cursorY);
        cursorY += lines.length * 4 + 1.5;
      });
      cursorY += 2;
    } else {
      const lines = doc.splitTextToSize(textOrList, maxLineWidth);
      if (cursorY + lines.length * 4.5 > pageHeight - 30) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 4.5 + 3;
    }
  };

  // Sections
  if (article.dasar) printSection('I. DASAR HUKUM & KESEPAKATAN', article.dasar);
  if (article.tujuan) printSection('II. MAKSUD & TUJUAN', article.tujuan);
  if (article.ruangLingkup) printSection('III. RUANG LINGKUP', article.ruangLingkup);

  if (article.kewajiban && article.kewajiban.length > 0) {
    printSection('IV. KEWAJIBAN WARGA', article.kewajiban);
  }

  if (article.larangan && article.larangan.length > 0) {
    printSection('V. LARANGAN', article.larangan);
  }

  if (article.sanksi) printSection('VI. KETENTUAN SANKSI', article.sanksi);

  if (article.isi) {
    printSection('VII. RINCIAN PASAL LENGKAP', article.isi);
  }

  // Pengesahan Section
  if (cursorY > pageHeight - 55) {
    doc.addPage();
    cursorY = 20;
  } else {
    cursorY += 6;
  }

  const signX = pageWidth - margin - 65;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Ditetapkan di : Perum GPA Ngijo', signX, cursorY);
  cursorY += 4.5;
  doc.text(`Pada tanggal  : ${article.tanggalBerlaku}`, signX, cursorY);
  cursorY += 5.5;
  doc.text('Mengetahui / Mengesahkan,', signX, cursorY);
  cursorY += 4.5;
  doc.setFont('times', 'bold');
  doc.text('Ketua RT 07 RW 11 GPA Ngijo', signX, cursorY);
  cursorY += 18;

  doc.text('Bapak Sutrisno, M.P.', signX, cursorY);
  cursorY += 4;
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.text('(Tanda Tangan Digital Tersertifikasi SMART RT)', signX, cursorY);

  // Download Action
  const filename = `TATA-TERTIB-${article.kode || article.id}-v${article.versi}.pdf`;
  doc.save(filename);
};
