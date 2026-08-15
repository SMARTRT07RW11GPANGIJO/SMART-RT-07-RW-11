/**
 * wargaDashboard.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * DASHBOARD WARGA v2.0 TYPE DEFINITIONS
 */

import { FundType } from './finance';

export interface WargaProfileSummary {
  idWarga: string;
  namaLengkap: string;
  nikMasked: string;
  noKkMasked: string;
  rt: string;
  rw: string;
  perumahan: string;
  blok: string;
  statusWarga: 'Tetap' | 'Kontrak' | 'Kos';
  statusKeluarga: string;
  noHp: string;
  email: string;
  jumlahAnggotaKeluarga: number;
}

export type WargaInvoiceFundType = 'RT_UMUM' | 'DANA_KEMATIAN' | 'OMPLOGAN';

export interface WargaInvoiceItem {
  id: string;
  fundType: WargaInvoiceFundType;
  title: string;
  periode: string;
  nominal: number;
  paidAmount: number;
  status: 'LUNAS' | 'BELUM_BAYAR' | 'MENUNGGAK';
  dueDate?: string;
  paidAt?: string;
  paymentMethod?: string;
  description?: string;
}

export interface WargaLetterItem {
  idSurat: string;
  nomorSurat: string;
  jenisSurat: string;
  tanggalPengajuan: string;
  tanggalDisetujui?: string;
  status: 'DIAJUKAN' | 'DIVERIFIKASI' | 'MENUNGGU PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';
  catatanAdmin?: string;
  qrCodeHash?: string;
  pdfUrl?: string;
}

export interface WargaComplaintItem {
  idPengaduan: string;
  nomorTiket: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  tanggal: string;
  status: 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';
  tanggapanAdmin?: string;
}

export interface WargaNotificationItem {
  id: string;
  type: 'SURAT' | 'IURAN' | 'PENGUMUMAN' | 'TATA_TERTIB' | 'PENGADUAN' | 'KEGIATAN' | 'DANA_KEMATIAN' | 'OMPLOGAN';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface WargaTataTertibSummary {
  idArticle: string;
  category: string;
  title: string;
  version: string;
  effectiveDate: string;
  summary: string;
  points: string[];
}

export interface WargaActivityItem {
  idAgenda: string;
  judul: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  deskripsi: string;
  penanggungJawab: string;
  kategori: string;
}

export interface WargaDashboardData {
  profile: WargaProfileSummary;
  notifications: WargaNotificationItem[];
  unreadNotificationCount: number;
  invoices: WargaInvoiceItem[];
  totalUnpaidAmount: number;
  letters: WargaLetterItem[];
  complaints: WargaComplaintItem[];
  announcements: {
    id: string;
    judul: string;
    isi: string;
    tanggal: string;
    kategori: string;
    penulis: string;
  }[];
  tataTertibActive: WargaTataTertibSummary;
  activities: WargaActivityItem[];
}
