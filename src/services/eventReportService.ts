// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Event Report Service (Laporan Pelaksanaan Kegiatan)

import {
  LaporanKegiatan,
  ActorSession,
  MutationResponse
} from '../types/activity';
import { activityCalendarService } from './activityCalendarService';
import { DOCUMENT_BRANDING } from '../config/documentBranding';

const STORAGE_KEY_REPORTS = 'smart_rt_event_reports_v1';

// Seed Initial Report for EVT-2026-000001
const INITIAL_REPORTS: LaporanKegiatan[] = [
  {
    idLaporan: 'LAP-2026-000001',
    kegiatanId: 'EVT-2026-000001',
    nomorLaporan: '001/LPJ-RT07/VIII/2026',
    judulKegiatan: 'Kerja Bakti & Pemasangan Umbul-Umbul HUT RI Ke-81',
    tanggalPelaksanaan: '2026-08-10',
    lokasi: 'Pos Kamling Utama & Gapura Blok C RT 07',
    penanggungJawab: 'Bpk. Bambang Sutrisno (Seksi Lingkungan)',
    jumlahPesertaHadir: 42,
    totalPesertaTerdaftar: 45,
    ringkasanPelaksanaan:
      'Kerja bakti dimulai pukul 06.30 WIB diawali dengan pembagian kelompok kerja menjadi 3 regu: Regu 1 pengecatan gapura, Regu 2 pembersihan selokan utama, dan Regu 3 pemasangan bendera serta umbul-umbul.',
    hasilKegiatan:
      'Gapura masuk RT 07 selesai dicat dengan warna baru, selokan sepanjang 250 meter bersih dari sedimen, dan 40 buah umbul-umbul Merah Putih terpasang rapi.',
    kendala: 'Dua kaleng cat merah kurang pada saat pengecatan lis gapura, langsung ditanggulangi dengan kas insidental.',
    tindakLanjut: 'Pemasangan lampu hias gantung dijadwalkan pada malam hari tanggal 14 Agustus oleh tim pemuda RT 07.',
    status: 'FINAL',
    finalizedAt: '2026-08-11T09:00:00.000Z',
    finalizedBy: 'SEKRETARIS-01',
    createdAt: '2026-08-10T14:00:00.000Z',
    updatedAt: '2026-08-11T09:00:00.000Z',
    revisionHistory: [
      {
        version: 1,
        modifiedAt: '2026-08-11T09:00:00.000Z',
        modifiedBy: 'Bpk. Eko Nurcahyo (Sekretaris RT)',
        changeSummary: 'Finalisasi laporan pertanggungjawaban kegiatan kerja bakti.'
      }
    ]
  }
];

class EventReportService {
  private reports: LaporanKegiatan[] = [];
  private processedRequestIds: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (raw) {
        this.reports = JSON.parse(raw);
      } else {
        this.reports = [...INITIAL_REPORTS];
        this.saveToStorage();
      }
    } catch {
      this.reports = [...INITIAL_REPORTS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(this.reports));
    } catch (e) {
      console.error('Failed to save report data', e);
    }
  }

  public getReports(actor: ActorSession, kegiatanId?: string): LaporanKegiatan[] {
    if (kegiatanId) {
      return this.reports.filter((r) => r.kegiatanId === kegiatanId);
    }
    return this.reports;
  }

  public getReportById(actor: ActorSession, idLaporan: string): LaporanKegiatan | null {
    return this.reports.find((r) => r.idLaporan === idLaporan) || null;
  }

  public createReport(
    actor: ActorSession,
    payload: Omit<LaporanKegiatan, 'idLaporan' | 'nomorLaporan' | 'createdAt' | 'updatedAt' | 'status' | 'revisionHistory'>,
    requestId: string
  ): MutationResponse<LaporanKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!activityCalendarService.hasPermission(actor.role, 'EVENT_REPORT')) {
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk membuat laporan kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true
      };
    }

    const nextSeq = this.reports.length + 1;
    const idLaporan = `LAP-2026-${nextSeq.toString().padStart(6, '0')}`;
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonthRoman = romanMonths[new Date().getMonth()];
    const nomorLaporan = `${nextSeq.toString().padStart(3, '0')}/LPJ-RT07/${currentMonthRoman}/2026`;

    const newReport: LaporanKegiatan = {
      ...payload,
      idLaporan,
      nomorLaporan,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionHistory: []
    };

    this.reports.unshift(newReport);
    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: newReport,
      backendConnected: true
    };
  }

  public updateReport(
    actor: ActorSession,
    idLaporan: string,
    patch: Partial<LaporanKegiatan>,
    changeSummary: string,
    requestId: string
  ): MutationResponse<LaporanKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const reportIndex = this.reports.findIndex((r) => r.idLaporan === idLaporan);
    if (reportIndex === -1) {
      return {
        success: false,
        requestId,
        error: 'Laporan kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const existing = this.reports[reportIndex];
    const isFinal = existing.status === 'FINAL';

    // If already FINAL, require change summary and add revision entry
    const history = existing.revisionHistory || [];
    if (isFinal) {
      const nextVersion = history.length + 1;
      history.push({
        version: nextVersion,
        modifiedAt: new Date().toISOString(),
        modifiedBy: actor.nama || actor.userId,
        changeSummary: changeSummary || 'Pembaruan data laporan pasca-finalisasi.'
      });
    }

    const updated: LaporanKegiatan = {
      ...existing,
      ...patch,
      idLaporan: existing.idLaporan,
      nomorLaporan: existing.nomorLaporan,
      updatedAt: new Date().toISOString(),
      revisionHistory: history
    };

    this.reports[reportIndex] = updated;
    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: updated,
      backendConnected: true
    };
  }

  public finalizeReport(
    actor: ActorSession,
    idLaporan: string,
    requestId: string
  ): MutationResponse<LaporanKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!activityCalendarService.hasPermission(actor.role, 'EVENT_REPORT')) {
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Hanya Pengurus/Sekretaris/Ketua RT yang dapat memfinalisasi laporan.',
        code: 'FORBIDDEN',
        backendConnected: true
      };
    }

    const report = this.reports.find((r) => r.idLaporan === idLaporan);
    if (!report) {
      return {
        success: false,
        requestId,
        error: 'Laporan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    report.status = 'FINAL';
    report.finalizedAt = new Date().toISOString();
    report.finalizedBy = actor.userId;
    report.updatedAt = new Date().toISOString();

    if (!report.revisionHistory) report.revisionHistory = [];
    report.revisionHistory.push({
      version: 1,
      modifiedAt: new Date().toISOString(),
      modifiedBy: actor.nama || actor.userId,
      changeSummary: 'Laporan dinyatakan FINAL dan disahkan.'
    });

    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: report,
      backendConnected: true
    };
  }

  // Render Printable HTML for Official Laporan Kegiatan
  public renderReportHTML(report: LaporanKegiatan): string {
    const formattedDate = new Date(report.tanggalPelaksanaan).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="border-bottom: 3px double #123B5D; padding-bottom: 12px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; color: #123B5D; font-size: 18px; text-transform: uppercase;">RUKUN TETANGGA 07 RUKUN WARGA 11</h2>
          <h3 style="margin: 4px 0; color: #2E7D52; font-size: 14px;">PERUMAHAN GRAHA PELITA ASRI (GPA) NGIJO</h3>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 16px; margin: 0 0 4px 0; text-decoration: underline; color: #0f172a;">LAPORAN PERTANGGUNGJAWABAN KEGIATAN</h1>
          <p style="font-size: 12px; color: #475569; margin: 0;">Nomor: ${report.nomorLaporan}</p>
        </div>

        <table style="width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse;">
          <tr>
            <td style="width: 25%; font-weight: bold; padding: 6px 0;">Nama Kegiatan</td>
            <td style="width: 5%;">:</td>
            <td style="width: 70%;">${report.judulKegiatan}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px 0;">Hari / Tanggal</td>
            <td>:</td>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px 0;">Tempat / Lokasi</td>
            <td>:</td>
            <td>${report.lokasi}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px 0;">Penanggung Jawab</td>
            <td>:</td>
            <td>${report.penanggungJawab}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px 0;">Jumlah Peserta</td>
            <td>:</td>
            <td><b>${report.jumlahPesertaHadir} Orang</b> (dari total ${report.totalPesertaTerdaftar} terdaftar)</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 6px 0;">Status Dokumen</td>
            <td>:</td>
            <td><span style="display:inline-block; padding: 2px 8px; font-size: 11px; font-weight: bold; color: ${report.status === 'FINAL' ? '#047857' : '#b45309'}; background: ${report.status === 'FINAL' ? '#d1fae5' : '#fef3c7'}; border-radius: 4px;">${report.status}</span></td>
          </tr>
        </table>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 14px; margin: 0 0 6px 0; color: #123B5D; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">1. RINGKASAN PELAKSANAAN</h4>
          <p style="font-size: 13px; text-align: justify; margin: 0;">${report.ringkasanPelaksanaan}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 14px; margin: 0 0 6px 0; color: #123B5D; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">2. HASIL KEGIATAN & CAPAIAN</h4>
          <p style="font-size: 13px; text-align: justify; margin: 0;">${report.hasilKegiatan}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 14px; margin: 0 0 6px 0; color: #123B5D; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">3. KENDALA YANG DIHADAPI</h4>
          <p style="font-size: 13px; text-align: justify; margin: 0;">${report.kendala || 'Tidak ada kendala berarti selama kegiatan berlangsung.'}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 14px; margin: 0 0 6px 0; color: #123B5D; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">4. REKOMENDASI & TINDAK LANJUT</h4>
          <p style="font-size: 13px; text-align: justify; margin: 0;">${report.tindakLanjut}</p>
        </div>

        <div style="margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px; page-break-inside: avoid;">
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0 0 60px 0;">Penanggung Jawab Kegiatan,</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${report.penanggungJawab}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Seksi Pelaksana</p>
          </div>
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0 0 60px 0;">Mengetahui,<br/>Ketua RT 07 RW 11 GPA Ngijo</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${DOCUMENT_BRANDING.chairmanName}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Ketua RT 07</p>
          </div>
        </div>
      </div>
    `;
  }
}

export const eventReportService = new EventReportService();
