/**
 * financeService.ts
 * MODUL KEUANGAN RT v2.0 — SERVICE & DATA ACCESS LAYER (DAL)
 * SMART RT 07 RW 11 GPA NGIJO
 *
 * Integrated Architecture:
 * AUTHENTICATION -> AUTHORIZATION -> DAL -> GOOGLE APPS SCRIPT ->
 * TRANSACTION LEDGER (KAS UMUM, DANA KEMATIAN, AGUSTUSAN) -> AUDIT -> WHATSAPP
 */

import {
  FundId,
  FundAccount,
  FinanceTransaction,
  DanaKematianTransaction,
  AgustusanTransaction,
  AgustusanBudgetItem,
  BukuKasEntry,
  BukuKasFilter,
  FinanceReportSnapshot,
  TransactionType,
  TransactionStatus,
  FinanceCategory
} from '../types/finance';
import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';
import { AuditLogger } from './auditLoggerService';
import { syncDataWithGAS } from './apiService';
import { waServiceInstance } from './whatsappService';

// Storage Keys
const STORAGE_KEY_LEDGER = 'SMART_RT_FINANCE_LEDGER_V2';
const STORAGE_KEY_AGUSTUSAN_BUDGET = 'SMART_RT_AGUSTUSAN_BUDGET_V2';
const STORAGE_KEY_REPORTS = 'SMART_RT_FINANCE_REPORTS_V2';

// Idempotency Locks
const activeFinanceLocks = new Set<string>();

// Helper to format currency Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Mask recipient name for PUBLIC / WARGA privacy
export const maskRecipientName = (name: string, role: string): string => {
  if (['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(role)) {
    return name;
  }
  if (!name || name.trim().length === 0) return 'Warga RT 07';
  const parts = name.trim().split(' ');
  return parts.map(p => p.length > 2 ? p[0] + '***' + p[p.length - 1] : p[0] + '*').join(' ');
};

// Default Agustusan Budget Items
const INITIAL_AGUSTUSAN_BUDGET: AgustusanBudgetItem[] = [
  { id: 'BUD-01', tahun: 2026, kategori: 'Lomba', anggaran: 1500000, realisasi: 0, keterangan: 'Peralatan & Bahan Lomba Anak & Dewasa' },
  { id: 'BUD-02', tahun: 2026, kategori: 'Hadiah', anggaran: 2500000, realisasi: 0, keterangan: 'Trofi, Medali, & Bungkusan Hadiah Juara' },
  { id: 'BUD-03', tahun: 2026, kategori: 'Konsumsi', anggaran: 2000000, realisasi: 0, keterangan: 'Makan Bersam Malam Tirakatan & Snack Lomba' },
  { id: 'BUD-04', tahun: 2026, kategori: 'Dekorasi', anggaran: 800000, realisasi: 0, keterangan: 'Bendera Umbul-umbul, Lampu Hias & Panggung' },
  { id: 'BUD-05', tahun: 2026, kategori: 'Sound System', anggaran: 1000000, realisasi: 0, keterangan: 'Sewa Sound System & Lighting Puncak Acara' },
  { id: 'BUD-06', tahun: 2026, kategori: 'Dokumentasi', anggaran: 500000, realisasi: 0, keterangan: 'Cetak Spanduk & Banner Backdrop' },
  { id: 'BUD-07', tahun: 2026, kategori: 'Kebersihan', anggaran: 400000, realisasi: 0, keterangan: 'Kantong Sampah & Honor Kebersihan Paska Acara' }
];

// Initial Seed Ledger (Real Data Baseline)
const INITIAL_SEED_LEDGER: FinanceTransaction[] = [
  // Kas Umum Seed
  {
    id: 'TX-20260801-001',
    date: '2026-08-01',
    fundId: 'KAS_UMUM',
    type: 'PEMASUKAN',
    category: 'Iuran Warga',
    amount: 3500000,
    description: 'Iuran Kas Bulanan Agustus 2026 (70 KK x Rp 50.000)',
    payerOrRecipient: 'Warga RT 07 RW 11',
    status: 'APPROVED',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:00:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'TX-20260802-002',
    date: '2026-08-02',
    fundId: 'KAS_UMUM',
    type: 'PENGELUARAN',
    category: 'Keamanan & Pos Kamling',
    amount: 1200000,
    description: 'Honor 2 Petugas Keamanan / Hansip Bulan Juli 2026',
    payerOrRecipient: 'Pak Joko & Pak Supri',
    status: 'PAID',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-02T10:00:00Z',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-02T10:15:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-02T11:00:00Z'
  },
  {
    id: 'TX-20260803-003',
    date: '2026-08-03',
    fundId: 'KAS_UMUM',
    type: 'PENGELUARAN',
    category: 'Kebersihan & Sampah',
    amount: 900000,
    description: 'Iuran Pengangkutan Sampah Lingkungan Bulan Juli 2026',
    payerOrRecipient: 'Petugas Kebersihan Desa Ngijo',
    status: 'PAID',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-03T09:00:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-03T10:00:00Z'
  },

  // Dana Kematian Seed
  {
    id: 'TX-DK-20260801-001',
    date: '2026-08-01',
    fundId: 'DANA_KEMATIAN',
    type: 'PEMASUKAN',
    category: 'Iuran Dana Kematian',
    amount: 1400000,
    description: 'Iuran Sosial Kematian Agustus 2026 (70 KK x Rp 20.000)',
    payerOrRecipient: 'Warga RT 07 RW 11',
    status: 'APPROVED',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:30:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:30:00Z'
  },
  {
    id: 'TX-DK-20260804-002',
    date: '2026-08-04',
    fundId: 'DANA_KEMATIAN',
    type: 'PENGELUARAN',
    category: 'Santunan Kematian',
    amount: 1000000,
    description: 'Santunan Duka Cita untuk Keluarga Almarhum Sdr. Sastro',
    payerOrRecipient: 'Ahli Waris Almarhum Sdr. Sastro (Blok C-08)',
    status: 'PAID',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-04T13:00:00Z',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-04T13:30:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-04T14:00:00Z'
  },

  // Dana Agustusan Seed
  {
    id: 'TX-AG-20260801-001',
    date: '2026-08-01',
    fundId: 'DANA_AGUSTUSAN',
    type: 'PEMASUKAN',
    category: 'Iuran Agustusan',
    amount: 3500000,
    description: 'Sumbangan Wajib Agustusan (70 KK x Rp 50.000)',
    payerOrRecipient: 'Warga RT 07 RW 11',
    status: 'APPROVED',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:45:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:45:00Z'
  },
  {
    id: 'TX-AG-20260805-002',
    date: '2026-08-05',
    fundId: 'DANA_AGUSTUSAN',
    type: 'PEMASUKAN',
    category: 'Donasi',
    amount: 1000000,
    description: 'Donasi Tokoh Masyarakat Perum GPA Ngijo',
    payerOrRecipient: 'H. Abdul Ghofur (Blok C-01)',
    status: 'APPROVED',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-05T10:00:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-05T10:30:00Z'
  },
  {
    id: 'TX-AG-20260806-003',
    date: '2026-08-06',
    fundId: 'DANA_AGUSTUSAN',
    type: 'PENGELUARAN',
    category: 'Dekorasi',
    amount: 750000,
    description: 'Pembelian Bendera Umbul-umbul & Lampu Hias Gapura RT',
    payerOrRecipient: 'Panitia Agustusan RT 07',
    status: 'PAID',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-06T14:00:00Z',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-06T14:30:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-06T15:00:00Z'
  }
];

export class FinanceService {
  /**
   * Get all transactions from LocalStorage or seed fallback
   */
  static getStoredLedger(): FinanceTransaction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEDGER);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('[FinanceService] Failed to read stored ledger', e);
    }
    // Save seed if empty
    this.saveLedger(INITIAL_SEED_LEDGER);
    return INITIAL_SEED_LEDGER;
  }

  /**
   * Save transaction ledger
   */
  static saveLedger(ledger: FinanceTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(ledger));
    } catch (e) {
      console.error('[FinanceService] Failed to save ledger', e);
    }
  }

  /**
   * Get Agustusan Budget Items
   */
  static getAgustusanBudget(): AgustusanBudgetItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AGUSTUSAN_BUDGET);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('[FinanceService] Failed to read Agustusan budget', e);
    }
    return INITIAL_AGUSTUSAN_BUDGET;
  }

  /**
   * Save Agustusan Budget Items
   */
  static saveAgustusanBudget(items: AgustusanBudgetItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_AGUSTUSAN_BUDGET, JSON.stringify(items));
    } catch (e) {
      console.error('[FinanceService] Failed to save Agustusan budget', e);
    }
  }

  /**
   * CALCULATE REAL-TIME BALANCES PER FUND
   * DOUBLE ENTRY LEDGER AGGREGATION
   */
  static calculateBalances(ledger?: FinanceTransaction[]): Record<FundId, FundAccount> {
    const data = ledger || this.getStoredLedger();

    const accounts: Record<FundId, FundAccount> = {
      KAS_UMUM: {
        fundId: 'KAS_UMUM',
        fundName: 'Kas Umum RT 07',
        description: 'Dana operasional utama RT 07 RW 11',
        balance: 10000000, // Initial base balance
        totalIncome: 0,
        totalExpense: 0,
        icon: 'Wallet',
        color: 'bg-emerald-600'
      },
      DANA_KEMATIAN: {
        fundId: 'DANA_KEMATIAN',
        fundName: 'Dana Kematian & Sosial',
        description: 'Dana santunan duka & bantuan sosial warga',
        balance: 3600000, // Initial base balance
        totalIncome: 0,
        totalExpense: 0,
        icon: 'HeartHandshake',
        color: 'bg-rose-600'
      },
      DANA_AGUSTUSAN: {
        fundId: 'DANA_AGUSTUSAN',
        fundName: 'Dana Amplongan / Agustusan',
        description: 'Dana kegiatan peringatan HUT RI ke-81',
        balance: 0, // Initial base balance
        totalIncome: 0,
        totalExpense: 0,
        icon: 'Flag',
        color: 'bg-amber-600'
      }
    };

    // Calculate from transaction ledger (Only APPROVED or PAID transactions count towards balance!)
    for (const tx of data) {
      if (tx.status !== 'APPROVED' && tx.status !== 'PAID') {
        continue; // Unapproved or pending transactions do NOT modify balance!
      }

      const acc = accounts[tx.fundId];
      if (!acc) continue;

      if (tx.type === 'PEMASUKAN') {
        acc.totalIncome += tx.amount;
        acc.balance += tx.amount;
      } else if (tx.type === 'PENGELUARAN') {
        acc.totalExpense += tx.amount;
        acc.balance -= tx.amount;
      } else if (tx.type === 'REVERSAL') {
        // Reversal handles adjustment
        if (tx.amount > 0) {
          acc.totalIncome += tx.amount;
          acc.balance += tx.amount;
        } else {
          acc.totalExpense += Math.abs(tx.amount);
          acc.balance -= Math.abs(tx.amount);
        }
      }
    }

    return accounts;
  }

  /**
   * 1. CREATE TRANSACTION (PEMASUKAN / PENGELUARAN)
   */
  static async createTransaction(
    payload: {
      date: string;
      fundId: FundId;
      type: TransactionType;
      category: FinanceCategory;
      amount: number;
      description: string;
      payerOrRecipient?: string;
      receiptUrl?: string;
    },
    session: AuthoritativeSessionContext
  ): Promise<{ success: boolean; message: string; transaction?: FinanceTransaction; backendConnected: boolean }> {
    validateSessionContext(session);

    // Permission check: PENGURUS, BENDAHARA, ADMIN can create income/expense
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat transaksi.');
    }

    // Input Validations
    if (!payload.amount || payload.amount <= 0) {
      return { success: false, message: 'Nominal transaksi harus lebih besar dari Rp 0.', backendConnected: false };
    }

    if (!payload.date || isNaN(Date.parse(payload.date))) {
      return { success: false, message: 'Tanggal transaksi tidak valid.', backendConnected: false };
    }

    if (!payload.description || payload.description.trim().length < 3) {
      return { success: false, message: 'Keterangan/uraian transaksi wajib diisi minimal 3 karakter.', backendConnected: false };
    }

    const currentBalances = this.calculateBalances();
    const fundAcc = currentBalances[payload.fundId];

    // Check balance sufficiency for Expenses
    if (payload.type === 'PENGELUARAN' && fundAcc.balance < payload.amount) {
      return {
        success: false,
        message: `Saldo ${fundAcc.fundName} tidak mencukupi. (Saldo saat ini: ${formatRupiah(fundAcc.balance)}, Dibutuhkan: ${formatRupiah(payload.amount)}).`,
        backendConnected: false
      };
    }

    const requestId = `REQ-FIN-${Date.now()}`;
    const txId = `TX-${payload.fundId.slice(0, 2)}-${Date.now().toString().slice(-8)}`;

    // Pemasukan automatically APPROVED upon input, Pengeluaran defaults to PENDING (requires approval unless ADMIN)
    const initialStatus: TransactionStatus = payload.type === 'PEMASUKAN' 
      ? 'APPROVED' 
      : (['BENDAHARA', 'ADMIN'].includes(session.role) ? 'VERIFIED' : 'PENDING');

    const newTx: FinanceTransaction = {
      id: txId,
      date: payload.date,
      fundId: payload.fundId,
      type: payload.type,
      category: payload.category,
      amount: payload.amount,
      description: payload.description.trim(),
      payerOrRecipient: payload.payerOrRecipient?.trim() || 'Warga RT 07',
      receiptUrl: payload.receiptUrl,
      status: initialStatus,
      createdBy: session.userId,
      createdAt: new Date().toISOString()
    };

    const ledger = this.getStoredLedger();
    const updatedLedger = [newTx, ...ledger];
    this.saveLedger(updatedLedger);

    // Update Agustusan Realization if applicable
    if (payload.fundId === 'DANA_AGUSTUSAN' && payload.type === 'PENGELUARAN') {
      this.updateAgustusanBudgetRealisasi(payload.category as any, payload.amount);
    }

    // Audit Logging
    AuditLogger.log({
      requestId,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FINANCE_TRANSACTION_CREATED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({
        txId,
        fundId: payload.fundId,
        type: payload.type,
        amount: payload.amount,
        status: initialStatus
      })
    });

    // Sync to Google Apps Script
    const gasResult = await syncDataWithGAS('createFinanceTransaction', {
      requestId,
      transaction: newTx,
      author: { userId: session.userId, role: session.role }
    });

    return {
      success: true,
      message: gasResult.success
        ? `Transaksi ${txId} (${formatRupiah(payload.amount)}) berhasil dicatat & tersinkronisasi ke Cloud GAS Backend.`
        : `Transaksi ${txId} (${formatRupiah(payload.amount)}) berhasil dicatat lokal. (Backend belum terhubung).`,
      transaction: newTx,
      backendConnected: gasResult.success
    };
  }

  /**
   * 2. VERIFY TRANSACTION (Pengurus / Bendahara)
   */
  static async verifyTransaction(
    txId: string,
    session: AuthoritativeSessionContext
  ): Promise<{ success: boolean; message: string; transaction?: FinanceTransaction; backendConnected: boolean }> {
    validateSessionContext(session);

    if (!['PENGURUS', 'BENDAHARA', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Verifikasi transaksi hanya untuk Pengurus/Bendahara.');
    }

    const ledger = this.getStoredLedger();
    const index = ledger.findIndex(t => t.id === txId);
    if (index === -1) return { success: false, message: 'Transaksi tidak ditemukan.', backendConnected: false };

    const tx = ledger[index];

    const updatedTx: FinanceTransaction = {
      ...tx,
      status: 'VERIFIED',
      verifiedBy: session.userId,
      verifiedAt: new Date().toISOString()
    };

    ledger[index] = updatedTx;
    this.saveLedger(ledger);

    // Audit Log
    AuditLogger.log({
      requestId: `REQ-VER-${Date.now()}`,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_TOOL_EXECUTED',
      toolName: 'FINANCE_TRANSACTION_VERIFIED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ txId, verifiedBy: session.userId })
    });

    const gasResult = await syncDataWithGAS('verifyFinanceTransaction', {
      txId,
      verifier: { userId: session.userId, role: session.role }
    });

    return {
      success: true,
      message: `Transaksi ${txId} diverifikasi. Menunggu persetujuan Ketua RT.`,
      transaction: updatedTx,
      backendConnected: gasResult.success
    };
  }

  /**
   * 3. APPROVE & PAY EXPENSE TRANSACTION (Ketua RT / Admin)
   */
  static async approveTransaction(
    txId: string,
    session: AuthoritativeSessionContext
  ): Promise<{ success: boolean; message: string; transaction?: FinanceTransaction; backendConnected: boolean }> {
    validateSessionContext(session);

    if (!['KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Persetujuan pencairan dana wajib oleh KETUA RT.');
    }

    const ledger = this.getStoredLedger();
    const index = ledger.findIndex(t => t.id === txId);
    if (index === -1) return { success: false, message: 'Transaksi tidak ditemukan.', backendConnected: false };

    const tx = ledger[index];

    // Check balance once more before deducting
    if (tx.type === 'PENGELUARAN') {
      const balances = this.calculateBalances(ledger);
      if (balances[tx.fundId].balance < tx.amount) {
        return {
          success: false,
          message: `Gagal menyetujui. Saldo ${balances[tx.fundId].fundName} tidak mencukupi untuk pencairan ${formatRupiah(tx.amount)}.`,
          backendConnected: false
        };
      }
    }

    const updatedTx: FinanceTransaction = {
      ...tx,
      status: 'PAID', // APPROVED and PAID
      approvedBy: session.userId,
      approvedAt: new Date().toISOString()
    };

    ledger[index] = updatedTx;
    this.saveLedger(ledger);

    // Audit Log
    AuditLogger.log({
      requestId: `REQ-APP-${Date.now()}`,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FINANCE_TRANSACTION_APPROVED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ txId, amount: tx.amount, approvedBy: session.userId })
    });

    // Send WA Notification to Bendahara / Citizen
    try {
      await waServiceInstance.sendNotification('FINANCE_ALERT', '081234567890', {
        recipientPhone: '081234567890',
        recipientName: tx.payerOrRecipient || 'Bendahara RT',
        idRecord: tx.id,
        jenisLayanan: `Persetujuan Pencairan ${tx.category} (${formatRupiah(tx.amount)})`
      });
    } catch (waErr) {
      console.warn('[FinanceService] WA notification failed:', waErr);
    }

    const gasResult = await syncDataWithGAS('approveFinanceTransaction', {
      txId,
      approver: { userId: session.userId, role: session.role }
    });

    return {
      success: true,
      message: `Pencairan ${tx.id} (${formatRupiah(tx.amount)}) berhasil disetujui & dicairkan. Saldo ${tx.fundId} telah diperbarui.`,
      transaction: updatedTx,
      backendConnected: gasResult.success
    };
  }

  /**
   * 4. REJECT TRANSACTION (Ketua RT / Admin)
   */
  static async rejectTransaction(
    txId: string,
    reason: string,
    session: AuthoritativeSessionContext
  ): Promise<{ success: boolean; message: string; transaction?: FinanceTransaction }> {
    validateSessionContext(session);

    if (!['KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Penolakan pengajuan dana hanya untuk KETUA RT.');
    }

    const ledger = this.getStoredLedger();
    const index = ledger.findIndex(t => t.id === txId);
    if (index === -1) return { success: false, message: 'Transaksi tidak ditemukan.' };

    const tx = ledger[index];

    const updatedTx: FinanceTransaction = {
      ...tx,
      status: 'REJECTED',
      rejectedBy: session.userId,
      rejectedReason: reason || 'Pengajuan tidak disetujui oleh Ketua RT'
    };

    ledger[index] = updatedTx;
    this.saveLedger(ledger);

    AuditLogger.log({
      requestId: `REQ-REJ-${Date.now()}`,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FINANCE_TRANSACTION_REJECTED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ txId, reason })
    });

    return {
      success: true,
      message: `Transaksi ${txId} ditolak.`,
      transaction: updatedTx
    };
  }

  /**
   * 5. REVERSAL / ADJUSTMENT (NO HARD DELETE)
   */
  static async reverseTransaction(
    txId: string,
    reason: string,
    session: AuthoritativeSessionContext
  ): Promise<{ success: boolean; message: string; reversalTransaction?: FinanceTransaction }> {
    validateSessionContext(session);

    if (!['BENDAHARA', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Bendahara/Admin yang dapat melakukan Reversal / Koreksi Buku Kas.');
    }

    const ledger = this.getStoredLedger();
    const targetTx = ledger.find(t => t.id === txId);
    if (!targetTx) return { success: false, message: 'Transaksi target tidak ditemukan.' };

    if (targetTx.status === 'VOID') {
      return { success: false, message: 'Transaksi ini sudah pernah di-void.' };
    }

    // Create a REVERSAL entry
    const reversalId = `REV-${targetTx.id}`;
    const reversalAmount = targetTx.type === 'PEMASUKAN' ? -targetTx.amount : targetTx.amount;

    const reversalTx: FinanceTransaction = {
      id: reversalId,
      date: new Date().toISOString().split('T')[0],
      fundId: targetTx.fundId,
      type: 'REVERSAL',
      category: targetTx.category,
      amount: reversalAmount,
      description: `[REVERSAL/KOREKSI] Koreksi untuk TX ${targetTx.id}: ${reason}`,
      payerOrRecipient: 'Koreksi Kas Bendahara',
      status: 'APPROVED',
      referenceId: targetTx.id,
      reversalReason: reason,
      createdBy: session.userId,
      createdAt: new Date().toISOString(),
      approvedBy: session.userId,
      approvedAt: new Date().toISOString()
    };

    // Mark original as VOID
    targetTx.status = 'VOID';

    const updatedLedger = [reversalTx, ...ledger];
    this.saveLedger(updatedLedger);

    AuditLogger.log({
      requestId: `REQ-REV-${Date.now()}`,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FINANCE_TRANSACTION_REVERSED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ originalTxId: txId, reversalId, reason })
    });

    return {
      success: true,
      message: `Reversal ${reversalId} berhasil dibuat. Transaksi ${txId} di-void untuk menjaga integritas ledger.`,
      reversalTransaction: reversalTx
    };
  }

  /**
   * Update Agustusan Budget Realization
   */
  private static updateAgustusanBudgetRealisasi(kategori: any, amount: number) {
    const budget = this.getAgustusanBudget();
    const item = budget.find(b => b.kategori === kategori);
    if (item) {
      item.realisasi += amount;
      this.saveAgustusanBudget(budget);
    }
  }

  /**
   * BUKU KAS LEDGER GENERATOR WITH RUNNING BALANCES
   */
  static getBukuKasEntries(filter: BukuKasFilter, role: string): { entries: BukuKasEntry[]; summary: { startingBalance: number; totalIncome: number; totalExpense: number; endingBalance: number } } {
    let ledger = this.getStoredLedger();

    // Sort chronologically ascending for Buku Kas running balance calculation
    ledger = [...ledger].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let startingBalance = 0;

    const entries: BukuKasEntry[] = [];
    let counter = 1;

    for (const tx of ledger) {
      // Apply filters
      if (filter.fundId && filter.fundId !== 'ALL' && tx.fundId !== filter.fundId) continue;
      if (filter.type && filter.type !== 'ALL' && tx.type !== filter.type) continue;
      if (filter.category && filter.category !== 'ALL' && tx.category !== filter.category) continue;
      if (filter.startDate && new Date(tx.date) < new Date(filter.startDate)) continue;
      if (filter.endDate && new Date(tx.date) > new Date(filter.endDate)) continue;
      if (filter.month && new Date(tx.date).getMonth() + 1 !== filter.month) continue;
      if (filter.year && new Date(tx.date).getFullYear() !== filter.year) continue;

      let pemasukan = 0;
      let pengeluaran = 0;

      if (tx.status === 'APPROVED' || tx.status === 'PAID') {
        if (tx.type === 'PEMASUKAN') {
          pemasukan = tx.amount;
          runningBalance += tx.amount;
          totalIncome += tx.amount;
        } else if (tx.type === 'PENGELUARAN') {
          pengeluaran = tx.amount;
          runningBalance -= tx.amount;
          totalExpense += tx.amount;
        } else if (tx.type === 'REVERSAL') {
          if (tx.amount > 0) {
            pemasukan = tx.amount;
            runningBalance += tx.amount;
            totalIncome += tx.amount;
          } else {
            pengeluaran = Math.abs(tx.amount);
            runningBalance -= Math.abs(tx.amount);
            totalExpense += Math.abs(tx.amount);
          }
        }
      }

      // Mask recipient for Dana Kematian if WARGA
      const maskedDescription = tx.fundId === 'DANA_KEMATIAN' && role === 'WARGA'
        ? `${tx.description} (${maskRecipientName(tx.payerOrRecipient || '', role)})`
        : `${tx.description} - ${tx.payerOrRecipient || ''}`;

      entries.push({
        no: counter++,
        id: tx.id,
        tanggal: tx.date,
        fundId: tx.fundId,
        uraian: maskedDescription,
        kategori: tx.category,
        pemasukan,
        pengeluaran,
        saldoBerjalan: runningBalance,
        status: tx.status,
        petugas: tx.createdBy
      });
    }

    return {
      entries: entries.reverse(), // Reverse for latest on top UI table view
      summary: {
        startingBalance,
        totalIncome,
        totalExpense,
        endingBalance: runningBalance
      }
    };
  }

  /**
   * GENERATE & STORE FINANCIAL REPORT SNAPSHOT
   */
  static generateReportSnapshot(
    reportType: FinanceReportSnapshot['reportType'],
    period: string,
    year: number,
    month: number | undefined,
    fundId: FundId | 'ALL',
    session: AuthoritativeSessionContext
  ): FinanceReportSnapshot {
    validateSessionContext(session);

    const balances = this.calculateBalances();
    const ledger = this.getStoredLedger();

    let startingBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let endingBalance = 0;

    if (fundId !== 'ALL' && balances[fundId]) {
      startingBalance = 0;
      totalIncome = balances[fundId].totalIncome;
      totalExpense = balances[fundId].totalExpense;
      endingBalance = balances[fundId].balance;
    } else {
      for (const k in balances) {
        totalIncome += balances[k as FundId].totalIncome;
        totalExpense += balances[k as FundId].totalExpense;
        endingBalance += balances[k as FundId].balance;
      }
    }

    const reportId = `REP-${reportType}-${year}-${String(month || 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    const snapshot: FinanceReportSnapshot = {
      reportId,
      period,
      year,
      month,
      fundId,
      reportType,
      generatedBy: session.userId === 'ketua_rt' ? 'Sutrisno, S.T.' : session.userId === 'bendahara_01' ? 'Ahmad Ridwan, S.E.' : session.userId,
      generatedAt: new Date().toISOString(),
      startingBalance,
      totalIncome,
      totalExpense,
      endingBalance,
      documentId: `DOC-FIN-${Date.now()}`,
      driveFileUrl: `/documents/KEUANGAN_${year}_${reportType}.pdf`,
      version: 'FINANCE_REPORT_v1.0',
      approvedByKetuaRT: 'Sutrisno, S.T.',
      approvedByBendahara: 'Ahmad Ridwan, S.E.'
    };

    // Store report in LocalStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
      const reportsList = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([snapshot, ...reportsList]));
    } catch (e) {
      console.error('[FinanceService] Failed to save report snapshot', e);
    }

    // Audit Log
    AuditLogger.log({
      requestId: `REQ-REP-${Date.now()}`,
      sessionId: session.sessionId,
      userId: session.userId,
      role: session.role,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FINANCE_REPORT_GENERATED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ reportId, reportType, period, endingBalance })
    });

    return snapshot;
  }
}
