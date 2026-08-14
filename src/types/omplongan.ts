/**
 * omplongan.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * MODUL OMPLONGAN / AMPLONGAN AGUSTUSAN v1.0
 * 
 * Authoritative Type Definitions for Kegiatan Agustusan, Sesi Tarikan,
 * Hasil Input Warga, Setoran, Verifikasi, Pengeluaran, Rekap, dan LPJ.
 */

import { UserRole } from './rt';
import { FundType } from './finance';

// ============================================================================
// 1. STATUS & ENUM DEFINITIONS
// ============================================================================

export type KegiatanStatus = 'DRAFT' | 'AKTIF' | 'SELESAI' | 'ARSIP';

export type TarikanStatus = 
  | 'DRAFT' 
  | 'BERJALAN' 
  | 'SELESAI' 
  | 'MENUNGGU_VERIFIKASI' 
  | 'TERVERIFIKASI' 
  | 'SELISIH';

export type WargaPaymentStatus = 
  | 'BELUM_DITARIK' 
  | 'TERTARIK' 
  | 'SEBAGIAN' 
  | 'LUNAS' 
  | 'DITOLAK';

export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'QRIS';

export type DepositStatus = 
  | 'BELUM_SETOR' 
  | 'MENUNGGU_VERIFIKASI' 
  | 'TERVERIFIKASI' 
  | 'SELISIH';

export type PemasukanCategory = 
  | 'OMPLONGAN_WARGA' 
  | 'DONASI' 
  | 'SPONSOR' 
  | 'SUMBANGAN_LAINNYA';

export type PengeluaranCategory =
  | 'HADIAH_LOMBA'
  | 'KONSUMSI'
  | 'DEKORASI'
  | 'UMBUL_UMBUL'
  | 'PERLENGKAPAN'
  | 'SEWA_PERALATAN'
  | 'PANGGUNG'
  | 'SOUND_SYSTEM'
  | 'DOKUMENTASI'
  | 'KEAMANAN'
  | 'KEBERSIHAN'
  | 'PENTAS_SENI'
  | 'MALAM_PUNCAK'
  | 'LAINNYA';

export type ExpenseStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'PAID';

// ============================================================================
// 2. CORE DATA INTERFACES
// ============================================================================

export interface OmplonganKegiatan {
  idKegiatan: string;
  namaKegiatan: string;
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  targetDana: number;
  targetPerKeluarga: number;
  status: KegiatanStatus;
  catatan?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OmplonganTarikan {
  idTarikan: string; // e.g. TARIKAN-001
  kegiatanId: string;
  nomorTarikan: number;
  tanggal: string; // YYYY-MM-DD
  petugasId: string;
  namaPetugas: string;
  wilayah: string; // e.g. 'Blok A & B', 'Wilayah Blok C-07'
  jumlahWargaDikunjungi: number;
  jumlahTransaksi: number;
  jumlahTidakMembayar: number;
  totalInput: number; // Sum of resident payments
  totalSetoran: number; // Real physical deposit handed over
  selisih: number; // totalSetoran - totalInput
  alasanSelisih?: string; // Required if selisih !== 0
  catatan?: string;
  status: TarikanStatus;
  createdAt: string;
  closedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  depositProofDriveUrl?: string;
}

export interface OmplonganWargaItem {
  id: string; // Record ID
  tarikanId: string; // TARIKAN-001
  kegiatanId: string;
  wargaId: string; // WRG-001
  namaWarga: string;
  nomorRumah: string; // e.g. 'Blok C-07'
  blok: string;
  noHp?: string;
  targetNominal: number;
  nominal: number;
  metode: PaymentMethod;
  status: WargaPaymentStatus;
  catatan?: string;
  receiptDriveUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OmplonganPengeluaran {
  id: string; // EXP-OMP-001
  kegiatanId: string;
  tanggal: string;
  kategori: PengeluaranCategory;
  keterangan: string;
  nominal: number;
  penerima: string;
  metode: PaymentMethod;
  buktiDriveId?: string;
  buktiFileName?: string;
  buktiUrl?: string;
  status: ExpenseStatus;
  catatan?: string;
  createdBy: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  reversalReason?: string;
}

export interface OmplonganDeposit {
  idDeposit: string;
  idTarikan: string;
  petugasId: string;
  namaPetugas: string;
  tanggal: string;
  totalInput: number;
  totalSetoran: number;
  selisih: number;
  alasanSelisih?: string;
  buktiSetoranUrl?: string;
  catatan?: string;
  status: DepositStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

// ============================================================================
// 3. STATS & REKAP INTERFACES
// ============================================================================

export interface OmplonganDashboardStats {
  totalWarga: number;
  totalTarget: number;
  totalTerkumpul: number;
  totalPengeluaran: number;
  saldo: number;
  persentasePencapaian: number;
  totalTarikan: number;
  totalTransaksi: number;
  rataRataNominal: number;
}

export interface OmplonganRekapWarga {
  wargaId: string;
  namaWarga: string;
  nomorRumah: string;
  blok: string;
  noHp?: string;
  target: number;
  totalDibayar: number;
  sisa: number;
  status: WargaPaymentStatus;
  jumlahTarikanIkut: number;
  riwayat: {
    tarikanId: string;
    tanggal: string;
    nominal: number;
    metode: PaymentMethod;
    petugas: string;
  }[];
}

export interface OmplonganRekapPetugas {
  petugasId: string;
  namaPetugas: string;
  jumlahTarikan: number;
  jumlahWarga: number;
  totalDitagih: number;
  totalDisetor: number;
  selisih: number;
}

export interface OmplonganAuditEntry {
  id: string;
  actorId: string;
  role: UserRole;
  action: 
    | 'OMPLONGAN_CREATED'
    | 'TARIKAN_CREATED'
    | 'OMPLONGAN_PAYMENT_CREATED'
    | 'OMPLONGAN_PAYMENT_UPDATED'
    | 'TARIKAN_CLOSED'
    | 'DEPOSIT_CREATED'
    | 'DEPOSIT_VERIFIED'
    | 'EXPENSE_CREATED'
    | 'EXPENSE_UPDATED'
    | 'EXPENSE_APPROVED'
    | 'REPORT_GENERATED'
    | 'PDF_GENERATED'
    | 'SECURITY_TEST_EXECUTED';
  resourceId: string;
  timestamp: string;
  requestId: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED' | 'ERROR';
  details?: string;
}

export type OmplonganReportType =
  | 'PEMASUKAN'
  | 'PENGELUARAN'
  | 'GABUNGAN'
  | 'REKAP_TARIKAN'
  | 'REKAP_PETUGAS'
  | 'REKAP_WARGA'
  | 'LPJ_AKHIR';
