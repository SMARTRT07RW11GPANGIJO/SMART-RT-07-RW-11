/**
 * finance.ts
 * MODUL KEUANGAN RT v2.0 — TYPES & INTERFACES
 * SMART RT 07 RW 11 GPA NGIJO
 */

import { UserRole } from './rt';

// ============================================================================
// FUNDS & ACCOUNTS
// ============================================================================
export type FundId = 'KAS_UMUM' | 'DANA_KEMATIAN' | 'DANA_AGUSTUSAN';

export interface FundAccount {
  fundId: FundId;
  fundName: string;
  description: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  icon: string;
  color: string;
}

// ============================================================================
// TRANSACTION LEDGER
// ============================================================================
export type TransactionType = 'PEMASUKAN' | 'PENGELUARAN' | 'REVERSAL' | 'VOID';

export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'PAID' | 'REJECTED' | 'VOID';

export type CategoryKasUmumIncome = 'Iuran Warga' | 'Sumbangan' | 'Operasional' | 'Lainnya';
export type CategoryKasUmumExpense = 'Keamanan & Pos Kamling' | 'Kebersihan & Sampah' | 'Perbaikan Infrastruktur' | 'Acara / Sosial' | 'Operasional RT' | 'Lainnya';

export type CategoryDanaKematianIncome = 'Iuran Dana Kematian' | 'Donasi' | 'Bantuan' | 'Lainnya';
export type CategoryDanaKematianExpense = 'Santunan Kematian' | 'Bantuan Duka' | 'Transportasi' | 'Perlengkapan' | 'Lainnya';

export type CategoryAgustusanIncome = 'Iuran Agustusan' | 'Amplop Warga' | 'Donasi' | 'Sponsor' | 'Bantuan' | 'Lainnya';
export type CategoryAgustusanExpense = 'Lomba' | 'Hadiah' | 'Konsumsi' | 'Dekorasi' | 'Perlengkapan' | 'Sound System' | 'Dokumentasi' | 'Kebersihan' | 'Keamanan' | 'Honor / Petugas' | 'Lainnya';

export type FinanceCategory = 
  | CategoryKasUmumIncome 
  | CategoryKasUmumExpense 
  | CategoryDanaKematianIncome 
  | CategoryDanaKematianExpense 
  | CategoryAgustusanIncome 
  | CategoryAgustusanExpense;

export interface FinanceTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  fundId: FundId;
  type: TransactionType;
  category: FinanceCategory;
  amount: number;
  description: string;
  payerOrRecipient?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: TransactionStatus;
  referenceId?: string; // Links reversals/adjustments
  reversalReason?: string;
  
  // Workflow timestamps & actors
  createdBy: string;
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
}

// ============================================================================
// DANA KEMATIAN SPECIFIC MODEL
// ============================================================================
export interface DanaKematianTransaction {
  id: string;
  tanggal: string;
  jenisTransaksi: 'PEMASUKAN' | 'PENGELUARAN';
  kategori: CategoryDanaKematianIncome | CategoryDanaKematianExpense;
  nominal: number;
  namaPenerimaPenyetor: string; // Masked for PUBLIC/WARGA view
  keterangan: string;
  buktiTransaksi?: string;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// AMPLONGAN / AGUSTUSAN SPECIFIC MODEL
// ============================================================================
export interface AgustusanTransaction {
  id: string;
  tanggal: string;
  tahun: number;
  namaKegiatan: string;
  jenisTransaksi: 'PEMASUKAN' | 'PENGELUARAN';
  kategori: CategoryAgustusanIncome | CategoryAgustusanExpense;
  nominal: number;
  namaPemberiPenerima: string;
  keterangan: string;
  bukti?: string;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
}

export interface AgustusanBudgetItem {
  id: string;
  tahun: number;
  kategori: CategoryAgustusanExpense;
  anggaran: number;
  realisasi: number;
  keterangan?: string;
}

// ============================================================================
// BUKU KAS LEDGER ITEM
// ============================================================================
export interface BukuKasEntry {
  no: number;
  id: string;
  tanggal: string;
  fundId: FundId;
  uraian: string;
  kategori: string;
  pemasukan: number;
  pengeluaran: number;
  saldoBerjalan: number;
  status: TransactionStatus;
  petugas: string;
}

export interface BukuKasFilter {
  startDate?: string;
  endDate?: string;
  month?: number; // 1-12
  year?: number;
  fundId?: FundId | 'ALL';
  category?: string | 'ALL';
  type?: 'ALL' | 'PEMASUKAN' | 'PENGELUARAN';
}

// ============================================================================
// FINANCIAL REPORT SNAPSHOT
// ============================================================================
export type ReportType = 
  | 'KAS_UMUM' 
  | 'DANA_KEMATIAN' 
  | 'DANA_AGUSTUSAN' 
  | 'PEMASUKAN' 
  | 'PENGELUARAN' 
  | 'REKAP_BULANAN' 
  | 'REKAP_TAHUNAN' 
  | 'BUKU_KAS' 
  | 'PER_FUND';

export interface FinanceReportSnapshot {
  reportId: string;
  period: string; // e.g., "Agustus 2026"
  year: number;
  month?: number;
  fundId?: FundId | 'ALL';
  reportType: ReportType;
  generatedBy: string;
  generatedAt: string;
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  endingBalance: number;
  documentId?: string;
  driveFileUrl?: string;
  version: string; // e.g. "FINANCE_REPORT_v1.0"
  approvedByKetuaRT?: string;
  approvedByBendahara?: string;
  summaryData?: any;
}
