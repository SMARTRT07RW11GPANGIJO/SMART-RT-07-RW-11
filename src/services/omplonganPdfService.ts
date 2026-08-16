/**
 * omplonganPdfService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * MODUL OMPLONGAN / AMPLONGAN AGUSTUSAN v1.0
 * 
 * Formal Report Generation & Printing Engine (A4 Layout)
 * Supports 7 official report types including complete LPJ Agustusan (Sections A to M).
 */

import {
  OmplonganReportType,
  OmplonganKegiatan,
  OmplonganTarikan,
  OmplonganWargaItem,
  OmplonganPengeluaran,
  OmplonganDashboardStats,
  OmplonganRekapWarga,
  OmplonganRekapPetugas
} from '../types/omplongan';
import { formatRupiah } from '../types/finance';
import { DOCUMENT_BRANDING, getLetterPlace, getChairmanName, getChairmanTitle } from '../config/documentBranding';

export interface ReportPayload {
  type: OmplonganReportType;
  kegiatan: OmplonganKegiatan;
  stats: OmplonganDashboardStats;
  tarikanList: OmplonganTarikan[];
  itemsList: OmplonganWargaItem[];
  pengeluaranList: OmplonganPengeluaran[];
  rekapWarga: OmplonganRekapWarga[];
  rekapPetugas: OmplonganRekapPetugas[];
  filterStartDate?: string;
  filterEndDate?: string;
}

export class OmplonganPdfService {
  /**
   * Generates full HTML content for printable A4 view and PDF export
   */
  public static generateReportHtml(payload: ReportPayload): string {
    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const reportCode = `RPT-OMP-${payload.kegiatan.tahun}-${Date.now().toString().slice(-6)}`;

    let contentBody = '';

    switch (payload.type) {
      case 'PEMASUKAN':
        contentBody = this.renderPemasukanSection(payload);
        break;
      case 'PENGELUARAN':
        contentBody = this.renderPengeluaranSection(payload);
        break;
      case 'GABUNGAN':
        contentBody = this.renderGabunganSection(payload);
        break;
      case 'REKAP_TARIKAN':
        contentBody = this.renderRekapTarikanSection(payload);
        break;
      case 'REKAP_PETUGAS':
        contentBody = this.renderRekapPetugasSection(payload);
        break;
      case 'REKAP_WARGA':
        contentBody = this.renderRekapWargaSection(payload);
        break;
      case 'LPJ_AKHIR':
      default:
        contentBody = this.renderLpjAkhirSection(payload);
        break;
    }

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Keuangan Omplongan Agustusan - SMART RT 07 RW 11</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-size: 11pt;
          }
          .header-box {
            text-align: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header-title {
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            margin: 0;
          }
          .header-subtitle {
            font-size: 12pt;
            font-weight: 700;
            color: #166534;
            margin: 2px 0;
          }
          .header-address {
            font-size: 9pt;
            color: #475569;
            margin: 0;
          }
          .doc-badge {
            display: inline-block;
            background-color: #fee2e2;
            color: #991b1b;
            padding: 3px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10pt;
            margin-top: 8px;
            border: 1px solid #f87171;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .summary-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            background-color: #f8fafc;
          }
          .summary-label {
            font-size: 8.5pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }
          .summary-value {
            font-size: 12pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9.5pt;
          }
          th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
          }
          td {
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .footer-sign {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .sign-box {
            text-align: center;
          }
          .sign-name {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 60px;
          }
          .sign-role {
            font-size: 9pt;
            color: #475569;
          }
          .doc-footer {
            border-top: 1px dashed #cbd5e1;
            margin-top: 30px;
            padding-top: 8px;
            font-size: 8pt;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          .section-heading {
            font-size: 11pt;
            font-weight: 800;
            color: #0f172a;
            margin: 16px 0 8px 0;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header-box" style="display: flex; align-items: center; justify-content: center; gap: 16px; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <img src="${DOCUMENT_BRANDING.logoKabupaten}" alt="${DOCUMENT_BRANDING.logoAlt}" style="width: 70px; height: 84px; object-fit: contain; flex-shrink: 0;" />
          <div style="text-align: center; flex: 1;">
            <h1 class="header-title">${DOCUMENT_BRANDING.organizationName}</h1>
            <div class="header-subtitle">${DOCUMENT_BRANDING.housingName}</div>
            <div class="header-address" style="font-weight: 600;">${DOCUMENT_BRANDING.district} • ${DOCUMENT_BRANDING.regency} • ${DOCUMENT_BRANDING.province}</div>
            <div class="header-address">${DOCUMENT_BRANDING.fullAddress}</div>
            <div class="doc-badge">🇮🇩 ${payload.kegiatan.namaKegiatan.toUpperCase()} (TAHUN ${payload.kegiatan.tahun})</div>
          </div>
        </div>

        ${contentBody}

        <div class="footer-sign" style="display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid;">
          <div class="sign-box" style="text-align: left; width: 250px;">
            <div>Mengetahui,</div>
            <div class="sign-role" style="font-weight: bold; margin-top: 2px;">${DOCUMENT_BRANDING.chairmanOrganization}</div>
            <div class="sign-name" style="font-weight: bold; text-decoration: underline; margin-top: 50px;">${getChairmanName()}</div>
            <div class="sign-role">${getChairmanTitle()}</div>
          </div>
          <div class="sign-box" style="text-align: left; width: 250px;">
            <div>${getLetterPlace()}, ${printDate}</div>
            <div class="sign-role" style="font-weight: bold; margin-top: 2px;">Bendahara / Panitia Agustusan</div>
            <div class="sign-name" style="font-weight: bold; text-decoration: underline; margin-top: 50px;">Siti Rahmawati, S.Pd.</div>
            <div class="sign-role">Bendahara Panitia</div>
          </div>
        </div>

        <div class="doc-footer">
          <div>Dicetak dari: <strong>SMART RT 07 RW 11 System</strong></div>
          <div>Tanggal Cetak: ${printDate}</div>
          <div>Nomor Laporan: <strong>${reportCode}</strong></div>
        </div>
      </body>
      </html>
    `;
  }

  // Section 1: Pemasukan
  private static renderPemasukanSection(p: ReportPayload): string {
    const rows = p.itemsList
      .map(
        (item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${item.createdAt.slice(0, 10)}</td>
          <td><strong>${item.namaWarga}</strong><br><span style="color:#64748b; font-size:8pt;">${item.nomorRumah}</span></td>
          <td>${item.tarikanId}</td>
          <td class="text-center">${item.metode}</td>
          <td class="text-right font-bold">${formatRupiah(item.nominal)}</td>
          <td class="text-center"><span style="color:#166534; font-weight:bold;">${item.status}</span></td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="section-heading">LAPORAN PEMASUKAN DANA OMPLONGAN</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Terkumpul</div>
          <div class="summary-value" style="color:#166534;">${formatRupiah(p.stats.totalTerkumpul)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Target Dana</div>
          <div class="summary-value">${formatRupiah(p.stats.totalTarget)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Pencapaian</div>
          <div class="summary-value">${p.stats.persentasePencapaian}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Transaksi</div>
          <div class="summary-value">${p.stats.totalTransaksi} Warga</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 30px;">No</th>
            <th>Tanggal</th>
            <th>Nama Warga & Rumah</th>
            <th>Sesi Tarikan</th>
            <th class="text-center">Metode</th>
            <th class="text-right">Nominal</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight:bold;">
            <td colspan="5" class="text-right">TOTAL PEMASUKAN OMPLONGAN:</td>
            <td class="text-right" style="color:#166534;">${formatRupiah(p.stats.totalTerkumpul)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // Section 2: Pengeluaran
  private static renderPengeluaranSection(p: ReportPayload): string {
    const rows = p.pengeluaranList
      .map(
        (exp, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${exp.tanggal}</td>
          <td><strong>${exp.kategori.replace('_', ' ')}</strong></td>
          <td>${exp.keterangan}</td>
          <td>${exp.penerima}</td>
          <td class="text-center">${exp.metode}</td>
          <td class="text-right font-bold">${formatRupiah(exp.nominal)}</td>
          <td class="text-center"><span style="color:#166534; font-weight:bold;">${exp.status}</span></td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="section-heading">LAPORAN PENGELUARAN KEGIATAN AGUSTUSAN</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Pengeluaran</div>
          <div class="summary-value" style="color:#991b1b;">${formatRupiah(p.stats.totalPengeluaran)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Jumlah Item Belanja</div>
          <div class="summary-value">${p.pengeluaranList.length} Transaksi</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Pemasukan</div>
          <div class="summary-value">${formatRupiah(p.stats.totalTerkumpul)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Sisa Saldo Kas</div>
          <div class="summary-value" style="color:#1e3a8a;">${formatRupiah(p.stats.saldo)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 30px;">No</th>
            <th>Tanggal</th>
            <th>Kategori</th>
            <th>Keterangan / Rincian</th>
            <th>Penerima</th>
            <th class="text-center">Metode</th>
            <th class="text-right">Nominal</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight:bold;">
            <td colspan="6" class="text-right">TOTAL PENGELUARAN AGUSTUSAN:</td>
            <td class="text-right" style="color:#991b1b;">${formatRupiah(p.stats.totalPengeluaran)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // Section 3: Gabungan / Keuangan Konsolidasi
  private static renderGabunganSection(p: ReportPayload): string {
    return `
      <div class="section-heading">LAPORAN KEUANGAN KONSOLIDASI (GABUNGAN)</div>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Target Dana</div>
          <div class="summary-value">${formatRupiah(p.stats.totalTarget)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Pemasukan</div>
          <div class="summary-value" style="color:#166534;">${formatRupiah(p.stats.totalTerkumpul)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Pengeluaran</div>
          <div class="summary-value" style="color:#991b1b;">${formatRupiah(p.stats.totalPengeluaran)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Saldo Akhir Omplongan</div>
          <div class="summary-value" style="color:#1e3a8a;">${formatRupiah(p.stats.saldo)}</div>
        </div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color:#0f172a;">Ringkasan Arus Kas Kegiatan:</h4>
        <table style="margin-bottom:0;">
          <tr>
            <td>A. Total Pemasukan Tarikan Omplongan Warga</td>
            <td class="text-right font-bold" style="color:#166534;">${formatRupiah(p.stats.totalTerkumpul)}</td>
          </tr>
          <tr>
            <td>B. Total Pengeluaran Perlengkapan, Lomba, Hadiah & Konsumsi</td>
            <td class="text-right font-bold" style="color:#991b1b;">(${formatRupiah(p.stats.totalPengeluaran)})</td>
          </tr>
          <tr style="background-color: #e2e8f0; font-weight:bold; font-size:10.5pt;">
            <td>SALDO SISA DANA AGUSTUSAN (A - B)</td>
            <td class="text-right" style="color:#1e3a8a;">${formatRupiah(p.stats.saldo)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Section 4: Rekap Tarikan
  private static renderRekapTarikanSection(p: ReportPayload): string {
    const rows = p.tarikanList
      .map(
        (t) => `
        <tr>
          <td class="text-center font-bold">${t.idTarikan}</td>
          <td>${t.tanggal}</td>
          <td>${t.namaPetugas}</td>
          <td>${t.wilayah}</td>
          <td class="text-center">${t.jumlahWargaDikunjungi}</td>
          <td class="text-right">${formatRupiah(t.totalInput)}</td>
          <td class="text-right font-bold">${formatRupiah(t.totalSetoran)}</td>
          <td class="text-right" style="${t.selisih !== 0 ? 'color:#dc2626; font-weight:bold;' : ''}">${formatRupiah(t.selisih)}</td>
          <td class="text-center"><span style="color:#166534; font-weight:bold;">${t.status}</span></td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="section-heading">REKAPITULASI SESI TARIKAN OMPLONGAN</div>
      <table>
        <thead>
          <tr>
            <th class="text-center">Tarikan</th>
            <th>Tanggal</th>
            <th>Petugas</th>
            <th>Wilayah</th>
            <th class="text-center">Warga</th>
            <th class="text-right">Input Warga</th>
            <th class="text-right">Setoran</th>
            <th class="text-right">Selisih</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Section 5: Rekap Petugas
  private static renderRekapPetugasSection(p: ReportPayload): string {
    const rows = p.rekapPetugas
      .map(
        (pet, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${pet.namaPetugas}</strong></td>
          <td class="text-center">${pet.jumlahTarikan} Sesi</td>
          <td class="text-center">${pet.jumlahWarga} KK</td>
          <td class="text-right">${formatRupiah(pet.totalDitagih)}</td>
          <td class="text-right font-bold">${formatRupiah(pet.totalDisetor)}</td>
          <td class="text-right">${formatRupiah(pet.selisih)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="section-heading">REKAPITULASI PENARIKAN PER PETUGAS</div>
      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 30px;">No</th>
            <th>Nama Petugas</th>
            <th class="text-center">Jumlah Tarikan</th>
            <th class="text-center">Warga Dikunjungi</th>
            <th class="text-right">Total Ditagih</th>
            <th class="text-right">Total Disetor</th>
            <th class="text-right">Selisih</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Section 6: Rekap Warga
  private static renderRekapWargaSection(p: ReportPayload): string {
    const rows = p.rekapWarga
      .map(
        (w, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${w.namaWarga}</strong></td>
          <td>${w.nomorRumah}</td>
          <td class="text-right">${formatRupiah(w.target)}</td>
          <td class="text-right font-bold" style="color:#166534;">${formatRupiah(w.totalDibayar)}</td>
          <td class="text-right">${formatRupiah(w.sisa)}</td>
          <td class="text-center"><span style="font-weight:bold; ${w.status === 'LUNAS' ? 'color:#166534;' : 'color:#d97706;'}">${w.status}</span></td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="section-heading">REKAPITULASI PARTISIPASI WARGA RT 07 RW 11</div>
      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 30px;">No</th>
            <th>Nama Warga</th>
            <th>Alamat / Blok</th>
            <th class="text-right">Target</th>
            <th class="text-right">Total Dibayar</th>
            <th class="text-right">Sisa</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Section 7: LPJ Akhir Agustusan (Komprehensif A s/d M)
  private static renderLpjAkhirSection(p: ReportPayload): string {
    return `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 13pt; text-transform: uppercase;">LAPORAN PERTANGGUNGJAWABAN (LPJ)</h2>
        <h3 style="margin: 3px 0; font-size: 11pt; color: #166534;">KEGIATAN OMPLONGAN & PERINGATAN HUT RI KE-81 TAHUN 2026</h3>
      </div>

      <div class="section-heading">A. Pendahuluan</div>
      <p style="text-align: justify; font-size: 9.5pt;">
        Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa, rangkaian kegiatan peringatan Hari Ulang Tahun Kemerdekaan Republik Indonesia ke-81 di lingkungan RT 07 RW 11 Perumahan Griya Permata Alam (GPA) Ngijo telah terlaksana dengan lancar, tertib, dan penuh semangat kebersamaan. Laporan ini disusun secara transparan sebagai bentuk pertanggungjawaban panitia kepada seluruh warga RT 07 RW 11.
      </p>

      <div class="section-heading">B. Periode Kegiatan</div>
      <p style="font-size: 9.5pt;">
        Kegiatan penarikan omplongan dan rangkaian acara berlangsung dari tanggal <strong>${p.kegiatan.tanggalMulai}</strong> sampai dengan <strong>${p.kegiatan.tanggalSelesai}</strong>.
      </p>

      <div class="section-heading">C. Rekapitulasi Umum (C, D, E, F, G)</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">C. Total Warga Terdata</div>
          <div class="summary-value">${p.stats.totalWarga} Kepala Keluarga</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">D. Total Sesi Tarikan</div>
          <div class="summary-value">${p.stats.totalTarikan} Sesi Lapangan</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">E. Total Pemasukan</div>
          <div class="summary-value" style="color:#166534;">${formatRupiah(p.stats.totalTerkumpul)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">F. Total Pengeluaran</div>
          <div class="summary-value" style="color:#991b1b;">${formatRupiah(p.stats.totalPengeluaran)}</div>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 10px; border-radius: 6px; font-weight:bold; margin-bottom: 15px;">
        G. Sisa Saldo Kas Agustusan: <span style="color:#1e3a8a; font-size:12pt;">${formatRupiah(p.stats.saldo)}</span> (Dialokasikan ke Kas Umum RT / Kegiatan Warga berikutnya).
      </div>

      <div class="section-heading">H. Ringkasan Pemasukan & I. Ringkasan Pengeluaran</div>
      ${this.renderGabunganSection(p)}

      <div class="section-heading">J. Rekapitulasi Sesi Tarikan Lapangan</div>
      ${this.renderRekapTarikanSection(p)}

      <div class="section-heading">K. Rekapitulasi Kinerja Petugas Penarik</div>
      ${this.renderRekapPetugasSection(p)}

      <div class="section-heading">L. Catatan Khusus Panitia</div>
      <p style="font-size: 9.5pt;">
        Partisipasi warga RT 07 RW 11 mencapai <strong>${p.stats.persentasePencapaian}%</strong> dari target dana yang ditetapkan. Seluruh bukti kwitansi, nota belanja, dan dokumentasi setoran telah diverifikasi oleh Bendahara RT dan disetujui Ketua RT 07 RW 11.
      </p>

      <div class="section-heading">M. Penutup</div>
      <p style="text-align: justify; font-size: 9.5pt;">
        Demikian Laporan Pertanggungjawaban ini dibuat dengan sebenarnya untuk diketahui oleh seluruh warga RT 07 RW 11 Perum GPA Ngijo. Panitia mengucapkan terima kasih sebesar-besarnya atas segala dukungan, bantuan moril, materil, serta kehadiran warga dalam menyemarakkan HUT RI ke-81.
      </p>
    `;
  }

  /**
   * Directly triggers browser printing of the report
   */
  public static printReport(payload: ReportPayload): void {
    const html = this.generateReportHtml(payload);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up browser untuk mencetak laporan.');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
