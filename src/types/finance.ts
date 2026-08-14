/**
 * finance.ts
 * MODUL KEUANGAN RT v2.0 & 10I FINANCIAL LEDGER ISOLATION
 * SMART RT 07 RW 11 GPA NGIJO
 */

import { UserRole } from './rt';

// ============================================================================
// 1. FINANCIAL FUND ENUM & ALIASES (STRICT SOURCE OF TRUTH)
// ============================================================================
export enum FundType {
  RT_UMUM = 'RT_UMUM',
  DANA_KEMATIAN = 'DANA_KEMATIAN',
  OMPLOGAN = 'OMPLOGAN'
}

export type FundId = FundType | 'KAS_UMUM' | 'DANA_AGUSTUSAN' | 'DANA_KEMATIAN' | 'RT_UMUM' | 'OMPLOGAN' | string;

/**
 * Normalize string or identifier into the strict authoritative FundType enum.
 * Returns null if unrecognized.
 */
export function normalizeFundType(fund: string | FundType | FundId | undefined): FundType | null {
  if (!fund) return null;
  const upper = String(fund).toUpperCase().trim();
  if (upper === 'RT_UMUM' || upper === 'KAS_UMUM' || upper === 'RT' || upper === 'UMUM') {
    return FundType.RT_UMUM;
  }
  if (upper === 'DANA_KEMATIAN' || upper === 'KEMATIAN' || upper === 'SOSIAL_KEMATIAN') {
    return FundType.DANA_KEMATIAN;
  }
  if (upper === 'OMPLOGAN' || upper === 'DANA_AGUSTUSAN' || upper === 'AGUSTUSAN' || upper === 'AMPLONGAN') {
    return FundType.OMPLOGAN;
  }
  return null;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export interface FundAccount {
  fundId: FundType | string;
  fundName: string;
  description: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  icon: string;
  color: string;
  badge?: string;
}

// ============================================================================
// TRANSACTION LEDGER
// ============================================================================
export type TransactionType = 'PEMASUKAN' | 'PENGELUARAN' | 'INCOME' | 'EXPENSE' | 'REVERSAL' | 'VOID';

export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'PAID' | 'REJECTED' | 'VOID';

export type CategoryKasUmumIncome = 'Iuran Warga' | 'Sumbangan' | 'Operasional' | 'Lainnya';
export type CategoryKasUmumExpense = 'Keamanan & Pos Kamling' | 'Kebersihan & Sampah' | 'Perbaikan Infrastruktur' | 'Acara / Sosial' | 'Operasional RT' | 'Lainnya';

export type CategoryDanaKematianIncome = 'Iuran Dana Kematian' | 'Donasi' | 'Bantuan' | 'Lainnya';
export type CategoryDanaKematianExpense = 'Santunan Kematian' | 'Bantuan Duka' | 'Transportasi' | 'Perlengkapan' | 'Lainnya';

export type CategoryAgustusanIncome = 'Iuran Agustusan' | 'Tarikan Omplongan' | 'Amplop Warga' | 'Donasi' | 'Sponsor' | 'Bantuan' | 'Lainnya';
export type CategoryAgustusanExpense = 'Lomba' | 'Hadiah' | 'Konsumsi' | 'Dekorasi' | 'Perlengkapan' | 'Sound System' | 'Dokumentasi' | 'Kebersihan' | 'Keamanan' | 'Honor / Petugas' | 'Lainnya';

export type FinanceCategory = 
  | CategoryKasUmumIncome 
  | CategoryKasUmumExpense 
  | CategoryDanaKematianIncome 
  | CategoryDanaKematianExpense 
  | CategoryAgustusanIncome 
  | CategoryAgustusanExpense
  | string;

export interface FinanceTransaction {
  id: string;
  transactionId?: string; // Standard alias
  date: string; // YYYY-MM-DD
  fundId: FundId;
  fundType?: FundType; // Authoritative isolated fund type
  type: TransactionType;
  transactionType?: 'INCOME' | 'EXPENSE' | 'REVERSAL' | 'VOID';
  category: FinanceCategory;
  amount: number;
  description: string;
  payerOrRecipient?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: TransactionStatus;
  source?: 'MANUAL' | 'QRIS' | 'TRANSFER' | 'CASH' | 'SYSTEM';
  referenceId?: string; // Links reversals/adjustments
  reversalReason?: string;
  idempotencyKey?: string;
  providerTransactionId?: string;
  
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

export interface IsolatedFinanceTransaction {
  transactionId: string;
  fundType: FundType;
  transactionType: 'INCOME' | 'EXPENSE' | 'REVERSAL' | 'VOID';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  createdBy: string;
  createdAt: string;
  status: TransactionStatus;
  source: 'MANUAL' | 'QRIS' | 'TRANSFER' | 'CASH' | 'SYSTEM';
  referenceId?: string;
  payerOrRecipient?: string;
  receiptUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  reversalReason?: string;
  idempotencyKey?: string;
  providerTransactionId?: string;
}

// ============================================================================
// QRIS PAYMENT BINDING
// ============================================================================
export interface QRISPaymentRecord {
  paymentId: string;
  invoiceId: string;
  fundType: FundType;
  amount: number;
  description: string;
  payerName: string;
  payerPhone?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  providerTransactionId?: string;
  createdAt: string;
  paidAt?: string;
  signature?: string;
  idempotencyKey: string;
}

// ============================================================================
// DUAL-APPROVAL FUND TRANSFER (DISABLED BY DEFAULT)
// ============================================================================
export interface FundTransferRecord {
  transferId: string;
  sourceFund: FundType;
  destinationFund: FundType;
  amount: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  auditId?: string;
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
