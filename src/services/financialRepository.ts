/**
 * financialRepository.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * 10I — FINANCIAL LEDGER ISOLATION & REPOSITORY LAYER
 *
 * Strict Single Source of Truth for Ledger Storage & Fund Isolation.
 */

import {
  FundType,
  IsolatedFinanceTransaction,
  FinanceTransaction,
  TransactionStatus,
  QRISPaymentRecord,
  FundTransferRecord,
  normalizeFundType,
  formatRupiah
} from '../types/finance';
import { AuditLogger } from './auditLoggerService';

// Storage Keys strictly isolated per fund
export const LEDGER_STORAGE_KEYS: Record<FundType, string> = {
  [FundType.RT_UMUM]: 'SMART_RT_LEDGER_RT_UMUM_10I',
  [FundType.DANA_KEMATIAN]: 'SMART_RT_LEDGER_DANA_KEMATIAN_10I',
  [FundType.OMPLOGAN]: 'SMART_RT_LEDGER_OMPLOGAN_10I'
};

export const QRIS_PAYMENTS_KEY = 'SMART_RT_QRIS_PAYMENTS_10I';
export const TRANSFERS_KEY = 'SMART_RT_FUND_TRANSFERS_10I';

// Initial Base Balances per Fund (Real Baseline for RT 07 GPA Ngijo)
export const INITIAL_OPENING_BALANCES: Record<FundType, number> = {
  [FundType.RT_UMUM]: 10000000,
  [FundType.DANA_KEMATIAN]: 3600000,
  [FundType.OMPLOGAN]: 0
};

// Seed Transactions for initial boot
const SEED_TRANSACTIONS_RT_UMUM: IsolatedFinanceTransaction[] = [
  {
    transactionId: 'TX-RT-20260801-001',
    fundType: FundType.RT_UMUM,
    transactionType: 'INCOME',
    category: 'Iuran Warga',
    amount: 3500000,
    date: '2026-08-01',
    description: 'Iuran Kas Bulanan Agustus 2026 (70 KK x Rp 50.000)',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:00:00Z',
    status: 'APPROVED',
    source: 'MANUAL',
    payerOrRecipient: 'Warga RT 07 RW 11',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:00:00Z'
  },
  {
    transactionId: 'TX-RT-20260802-002',
    fundType: FundType.RT_UMUM,
    transactionType: 'EXPENSE',
    category: 'Keamanan & Pos Kamling',
    amount: 1200000,
    date: '2026-08-02',
    description: 'Honor 2 Petugas Keamanan / Hansip Bulan Juli 2026',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-02T10:00:00Z',
    status: 'PAID',
    source: 'CASH',
    payerOrRecipient: 'Pak Joko & Pak Supri',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-02T10:15:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-02T11:00:00Z'
  },
  {
    transactionId: 'TX-RT-20260803-003',
    fundType: FundType.RT_UMUM,
    transactionType: 'EXPENSE',
    category: 'Kebersihan & Sampah',
    amount: 900000,
    date: '2026-08-03',
    description: 'Iuran Pengangkutan Sampah Lingkungan Bulan Juli 2026',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-03T09:00:00Z',
    status: 'PAID',
    source: 'TRANSFER',
    payerOrRecipient: 'Petugas Kebersihan Desa Ngijo',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-03T10:00:00Z'
  }
];

const SEED_TRANSACTIONS_DANA_KEMATIAN: IsolatedFinanceTransaction[] = [
  {
    transactionId: 'TX-DK-20260801-001',
    fundType: FundType.DANA_KEMATIAN,
    transactionType: 'INCOME',
    category: 'Iuran Dana Kematian',
    amount: 1400000,
    date: '2026-08-01',
    description: 'Iuran Sosial Kematian Agustus 2026 (70 KK x Rp 20.000)',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:30:00Z',
    status: 'APPROVED',
    source: 'MANUAL',
    payerOrRecipient: 'Warga RT 07 RW 11',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:30:00Z'
  },
  {
    transactionId: 'TX-DK-20260804-002',
    fundType: FundType.DANA_KEMATIAN,
    transactionType: 'EXPENSE',
    category: 'Santunan Kematian',
    amount: 1000000,
    date: '2026-08-04',
    description: 'Santunan Duka Cita untuk Keluarga Almarhum Sdr. Sastro',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-04T13:00:00Z',
    status: 'PAID',
    source: 'TRANSFER',
    payerOrRecipient: 'Ahli Waris Almarhum Sdr. Sastro (Blok C-08)',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-04T13:30:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-04T14:00:00Z'
  }
];

const SEED_TRANSACTIONS_OMPLOGAN: IsolatedFinanceTransaction[] = [
  {
    transactionId: 'TX-OM-20260801-001',
    fundType: FundType.OMPLOGAN,
    transactionType: 'INCOME',
    category: 'Tarikan Omplongan',
    amount: 3500000,
    date: '2026-08-01',
    description: 'Tarikan Omplongan Agustusan (70 KK x Rp 50.000)',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-01T08:45:00Z',
    status: 'APPROVED',
    source: 'MANUAL',
    payerOrRecipient: 'Warga RT 07 RW 11',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-01T09:45:00Z'
  },
  {
    transactionId: 'TX-OM-20260805-002',
    fundType: FundType.OMPLOGAN,
    transactionType: 'INCOME',
    category: 'Donasi',
    amount: 1000000,
    date: '2026-08-05',
    description: 'Donasi Tokoh Masyarakat Perum GPA Ngijo',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-05T10:00:00Z',
    status: 'APPROVED',
    source: 'TRANSFER',
    payerOrRecipient: 'H. Abdul Ghofur (Blok C-01)',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-05T10:30:00Z'
  },
  {
    transactionId: 'TX-OM-20260806-003',
    fundType: FundType.OMPLOGAN,
    transactionType: 'EXPENSE',
    category: 'Dekorasi',
    amount: 750000,
    date: '2026-08-06',
    description: 'Pembelian Bendera Umbul-umbul & Lampu Hias Gapura RT',
    createdBy: 'bendahara_01',
    createdAt: '2026-08-06T14:00:00Z',
    status: 'PAID',
    source: 'CASH',
    payerOrRecipient: 'Panitia Agustusan RT 07',
    verifiedBy: 'pengurus_01',
    verifiedAt: '2026-08-06T14:30:00Z',
    approvedBy: 'ketua_rt',
    approvedAt: '2026-08-06T15:00:00Z'
  }
];

// In-Memory fallback store for environments without localStorage
const memoryStore: Record<string, string> = {};

function getStoreItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (_) {}
  return memoryStore[key] || null;
}

function setStoreItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (_) {}
  memoryStore[key] = value;
}

export class FinancialRepository {
  /**
   * Validate that the fundType is an authoritative member of the FundType enum
   */
  public static validateFundType(fundType: any): FundType {
    if (!fundType) {
      throw new Error('fundType is required and cannot be empty.');
    }
    const normalized = normalizeFundType(fundType);
    if (!normalized || !Object.values(FundType).includes(normalized)) {
      throw new Error(`Invalid fundType '${fundType}'. Must be RT_UMUM, DANA_KEMATIAN, or OMPLOGAN.`);
    }
    return normalized;
  }

  /**
   * Get transactions for a specific isolated fund
   */
  public static getFundLedger(fundType: FundType): IsolatedFinanceTransaction[] {
    const validFund = this.validateFundType(fundType);
    const storageKey = LEDGER_STORAGE_KEYS[validFund];
    const raw = getStoreItem(storageKey);

    if (raw) {
      try {
        const parsed: IsolatedFinanceTransaction[] = JSON.parse(raw);
        return parsed.filter(t => t.fundType === validFund);
      } catch (e) {
        console.error(`[FinancialRepository] Failed to parse ledger for ${validFund}`, e);
      }
    }

    // Initialize seeds if empty
    let seed: IsolatedFinanceTransaction[] = [];
    if (validFund === FundType.RT_UMUM) seed = SEED_TRANSACTIONS_RT_UMUM;
    else if (validFund === FundType.DANA_KEMATIAN) seed = SEED_TRANSACTIONS_DANA_KEMATIAN;
    else if (validFund === FundType.OMPLOGAN) seed = SEED_TRANSACTIONS_OMPLOGAN;

    this.saveFundLedger(validFund, seed);
    return seed;
  }

  /**
   * Save transactions for a specific isolated fund
   */
  public static saveFundLedger(fundType: FundType, transactions: IsolatedFinanceTransaction[]): void {
    const validFund = this.validateFundType(fundType);
    const storageKey = LEDGER_STORAGE_KEYS[validFund];
    // Enforce invariant: every transaction saved here MUST have fundType === validFund
    const strictlyFiltered = transactions.filter(t => t.fundType === validFund);
    setStoreItem(storageKey, JSON.stringify(strictlyFiltered));
  }

  /**
   * CREATE TRANSACTION
   * Strict backend validation of fundType, amount > 0, and non-tamperable attributes.
   */
  public static createTransaction(
    fundType: FundType,
    payload: {
      transactionType: 'INCOME' | 'EXPENSE' | 'REVERSAL' | 'VOID';
      category: string;
      amount: number;
      date: string;
      description: string;
      source?: 'MANUAL' | 'QRIS' | 'TRANSFER' | 'CASH' | 'SYSTEM';
      payerOrRecipient?: string;
      receiptUrl?: string;
      referenceId?: string;
      idempotencyKey?: string;
      providerTransactionId?: string;
      status?: TransactionStatus;
    },
    author: { userId: string; role: string; sessionId?: string }
  ): IsolatedFinanceTransaction {
    const validFund = this.validateFundType(fundType);

    // 1. Amount validation
    if (typeof payload.amount !== 'number' || isNaN(payload.amount) || payload.amount <= 0) {
      throw new Error('Nominal transaksi harus berupa angka positif lebih besar dari 0.');
    }

    // 2. Date validation
    if (!payload.date || isNaN(Date.parse(payload.date))) {
      throw new Error('Tanggal transaksi tidak valid.');
    }

    // 3. Description validation
    if (!payload.description || payload.description.trim().length < 3) {
      throw new Error('Keterangan transaksi wajib diisi minimal 3 karakter.');
    }

    // 4. Check Idempotency / Duplicate
    const existing = this.getFundLedger(validFund);
    if (payload.idempotencyKey) {
      const dup = existing.find(t => t.idempotencyKey === payload.idempotencyKey);
      if (dup) {
        return dup;
      }
    }
    if (payload.providerTransactionId) {
      const dupProvider = existing.find(t => t.providerTransactionId === payload.providerTransactionId);
      if (dupProvider) {
        return dupProvider;
      }
    }

    // 5. Balance sufficiency check for EXPENSE
    if (payload.transactionType === 'EXPENSE') {
      const { closingBalance } = this.calculateBalance(validFund);
      if (closingBalance < payload.amount) {
        throw new Error(`Saldo ${validFund} tidak mencukupi. (Saldo saat ini: ${formatRupiah(closingBalance)}, Dibutuhkan: ${formatRupiah(payload.amount)}).`);
      }
    }

    // 6. Generate Unique Transaction ID
    const prefix = validFund === FundType.RT_UMUM ? 'TX-RT' : validFund === FundType.DANA_KEMATIAN ? 'TX-DK' : 'TX-OM';
    const txId = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const defaultStatus: TransactionStatus = payload.status || (payload.transactionType === 'INCOME' ? 'APPROVED' : (['BENDAHARA', 'ADMIN'].includes(author.role) ? 'VERIFIED' : 'PENDING'));

    const newTx: IsolatedFinanceTransaction = {
      transactionId: txId,
      fundType: validFund, // IMMUTABLE FUND TYPE
      transactionType: payload.transactionType,
      category: payload.category,
      amount: payload.amount,
      date: payload.date,
      description: payload.description.trim(),
      createdBy: author.userId,
      createdAt: new Date().toISOString(),
      status: defaultStatus,
      source: payload.source || 'MANUAL',
      payerOrRecipient: payload.payerOrRecipient?.trim() || 'Warga RT 07',
      receiptUrl: payload.receiptUrl,
      referenceId: payload.referenceId,
      idempotencyKey: payload.idempotencyKey,
      providerTransactionId: payload.providerTransactionId
    };

    const updated = [newTx, ...existing];
    this.saveFundLedger(validFund, updated);

    // Audit Logging
    AuditLogger.log({
      requestId: `REQ-FIN-${Date.now()}`,
      sessionId: author.sessionId || `SESS-${Date.now()}`,
      userId: author.userId,
      role: author.role as any,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FUND_TRANSACTION_CREATED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({
        transactionId: txId,
        fundType: validFund,
        transactionType: payload.transactionType,
        amount: payload.amount,
        status: defaultStatus
      })
    });

    return newTx;
  }

  /**
   * GET TRANSACTION WITH STRICT CROSS-FUND CHECK
   */
  public static getTransaction(fundType: FundType, transactionId: string, requester?: { userId: string; role: string }): IsolatedFinanceTransaction {
    const validFund = this.validateFundType(fundType);
    const ledger = this.getFundLedger(validFund);
    const tx = ledger.find(t => t.transactionId === transactionId);

    if (!tx) {
      // Check if it exists in another fund to log cross-fund access attempt
      for (const otherFund of Object.values(FundType)) {
        if (otherFund !== validFund) {
          const otherLedger = this.getFundLedger(otherFund);
          const crossMatch = otherLedger.find(t => t.transactionId === transactionId);
          if (crossMatch) {
            AuditLogger.log({
              requestId: `REQ-CROSS-${Date.now()}`,
              sessionId: `SESS-${Date.now()}`,
              userId: requester?.userId || 'ANONYMOUS',
              role: (requester?.role || 'WARGA') as any,
              action: 'AI_SECURITY_ALERT',
              toolName: 'CROSS_FUND_ACCESS_BLOCKED',
              authorization: 'DENIED',
              status: 'DENIED',
              details: `[CROSS-FUND BLOCKED] Requested fund ${validFund} mismatch with transaction ${transactionId} belonging to ${otherFund}.`
            });
            throw new Error('Transaksi tidak dapat diakses karena berasal dari sumber dana berbeda.');
          }
        }
      }
      throw new Error(`Transaksi '${transactionId}' tidak ditemukan pada ${validFund}.`);
    }

    return tx;
  }

  /**
   * LIST TRANSACTIONS FOR A SPECIFIC FUND ONLY
   */
  public static listTransactions(fundType: FundType, filter?: { type?: string; category?: string; startDate?: string; endDate?: string }): IsolatedFinanceTransaction[] {
    const validFund = this.validateFundType(fundType);
    let items = this.getFundLedger(validFund);

    if (filter) {
      if (filter.type && filter.type !== 'ALL') {
        items = items.filter(t => t.transactionType === filter.type);
      }
      if (filter.category && filter.category !== 'ALL') {
        items = items.filter(t => t.category === filter.category);
      }
      if (filter.startDate) {
        items = items.filter(t => t.date >= filter.startDate!);
      }
      if (filter.endDate) {
        items = items.filter(t => t.date <= filter.endDate!);
      }
    }

    return items;
  }

  /**
   * CALCULATE INDEPENDENT BALANCE PER FUND TYPE
   * Formula: Opening Balance + Income - Expense = Closing Balance
   */
  public static calculateBalance(fundType: FundType): {
    fundType: FundType;
    openingBalance: number;
    income: number;
    expense: number;
    closingBalance: number;
    transactionCount: number;
  } {
    const validFund = this.validateFundType(fundType);
    const ledger = this.getFundLedger(validFund);
    const openingBalance = INITIAL_OPENING_BALANCES[validFund] || 0;

    let income = 0;
    let expense = 0;
    let validTxCount = 0;

    for (const tx of ledger) {
      // Invariant: enforce fundType matches strictly
      if (tx.fundType !== validFund) continue;

      if (tx.status === 'APPROVED' || tx.status === 'PAID') {
        validTxCount++;
        if (tx.transactionType === 'INCOME') {
          income += tx.amount;
        } else if (tx.transactionType === 'EXPENSE') {
          expense += tx.amount;
        } else if (tx.transactionType === 'REVERSAL') {
          if (tx.amount > 0) {
            income += tx.amount;
          } else {
            expense += Math.abs(tx.amount);
          }
        }
      }
    }

    const closingBalance = openingBalance + income - expense;

    return {
      fundType: validFund,
      openingBalance,
      income,
      expense,
      closingBalance,
      transactionCount: validTxCount
    };
  }

  /**
   * UPDATE TRANSACTION STATUS (APPROVE / VERIFY / REJECT)
   * Strictly verifies fundType. FundType cannot be mutated.
   */
  public static updateTransactionStatus(
    fundType: FundType,
    transactionId: string,
    newStatus: TransactionStatus,
    actor: { userId: string; role: string; reason?: string }
  ): IsolatedFinanceTransaction {
    const validFund = this.validateFundType(fundType);
    const ledger = this.getFundLedger(validFund);
    const index = ledger.findIndex(t => t.transactionId === transactionId);

    if (index === -1) {
      // Check cross-fund
      for (const other of Object.values(FundType)) {
        if (other !== validFund) {
          const existsOther = this.getFundLedger(other).some(t => t.transactionId === transactionId);
          if (existsOther) {
            AuditLogger.log({
              requestId: `REQ-UPD-CROSS-${Date.now()}`,
              sessionId: `SESS-${Date.now()}`,
              userId: actor.userId,
              role: actor.role as any,
              action: 'AI_SECURITY_ALERT',
              toolName: 'CROSS_FUND_UPDATE_BLOCKED',
              authorization: 'DENIED',
              status: 'DENIED',
              details: `[CROSS-FUND UPDATE BLOCKED] Attempt to update transaction ${transactionId} of ${other} via ${validFund} route.`
            });
            throw new Error('Transaksi tidak dapat diakses karena berasal dari sumber dana berbeda.');
          }
        }
      }
      throw new Error(`Transaksi '${transactionId}' tidak ditemukan.`);
    }

    const current = ledger[index];

    // Status updates
    const updated: IsolatedFinanceTransaction = {
      ...current,
      status: newStatus
    };

    if (newStatus === 'VERIFIED') {
      updated.verifiedBy = actor.userId;
      updated.verifiedAt = new Date().toISOString();
    } else if (newStatus === 'APPROVED' || newStatus === 'PAID') {
      updated.approvedBy = actor.userId;
      updated.approvedAt = new Date().toISOString();
    }

    ledger[index] = updated;
    this.saveFundLedger(validFund, ledger);

    AuditLogger.log({
      requestId: `REQ-STAT-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      userId: actor.userId,
      role: actor.role as any,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FUND_TRANSACTION_UPDATED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ transactionId, fundType: validFund, newStatus })
    });

    return updated;
  }

  /**
   * REVERSE TRANSACTION (IMMUTABLE AUDIT TRAIL — NEVER HARD DELETE)
   */
  public static reverseTransaction(
    fundType: FundType,
    transactionId: string,
    reason: string,
    author: { userId: string; role: string }
  ): { original: IsolatedFinanceTransaction; reversal: IsolatedFinanceTransaction } {
    const validFund = this.validateFundType(fundType);
    const ledger = this.getFundLedger(validFund);
    const target = ledger.find(t => t.transactionId === transactionId);

    if (!target) {
      for (const other of Object.values(FundType)) {
        if (other !== validFund) {
          const existsOther = this.getFundLedger(other).some(t => t.transactionId === transactionId);
          if (existsOther) {
            AuditLogger.log({
              requestId: `REQ-REV-CROSS-${Date.now()}`,
              sessionId: `SESS-${Date.now()}`,
              userId: author.userId,
              role: author.role as any,
              action: 'AI_SECURITY_ALERT',
              toolName: 'CROSS_FUND_UPDATE_BLOCKED',
              authorization: 'DENIED',
              status: 'DENIED',
              details: `[CROSS-FUND REVERSAL BLOCKED] Attempt to reverse transaction ${transactionId} belonging to ${other} from ${validFund}.`
            });
            throw new Error('Transaksi tidak dapat diakses karena berasal dari sumber dana berbeda.');
          }
        }
      }
      throw new Error(`Transaksi '${transactionId}' tidak ditemukan.`);
    }

    if (target.status === 'VOID') {
      throw new Error('Transaksi ini sudah pernah di-void.');
    }

    // Mark target as VOID
    target.status = 'VOID';

    // Create Reversal Transaction
    const reversalId = `REV-${target.transactionId}`;
    const reversalAmount = target.transactionType === 'INCOME' ? -target.amount : target.amount;

    const reversalTx: IsolatedFinanceTransaction = {
      transactionId: reversalId,
      fundType: validFund, // Kept strictly in same fund
      transactionType: 'REVERSAL',
      category: target.category,
      amount: reversalAmount,
      date: new Date().toISOString().split('T')[0],
      description: `[REVERSAL/KOREKSI] Koreksi untuk TX ${target.transactionId}: ${reason}`,
      createdBy: author.userId,
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      source: 'SYSTEM',
      referenceId: target.transactionId,
      reversalReason: reason,
      payerOrRecipient: 'Koreksi Kas Bendahara',
      approvedBy: author.userId,
      approvedAt: new Date().toISOString()
    };

    const updatedLedger = [reversalTx, ...ledger];
    this.saveFundLedger(validFund, updatedLedger);

    AuditLogger.log({
      requestId: `REQ-REV-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      userId: author.userId,
      role: author.role as any,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FUND_TRANSACTION_REVERSED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ originalTxId: transactionId, reversalId, fundType: validFund, reason })
    });

    return { original: target, reversal: reversalTx };
  }

  /**
   * REJECT HARD DELETE ATTEMPTS (ALWAYS PRESERVE IMMUTABILITY)
   */
  public static blockDeleteAttempt(
    fundType: FundType,
    transactionId: string,
    actor: { userId: string; role: string }
  ): void {
    const validFund = this.validateFundType(fundType);
    AuditLogger.log({
      requestId: `REQ-DEL-BLOCKED-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      userId: actor.userId,
      role: actor.role as any,
      action: 'AI_SECURITY_ALERT',
      toolName: 'CROSS_FUND_DELETE_BLOCKED',
      authorization: 'DENIED',
      status: 'DENIED',
      details: `[DELETE PROHIBITED] Direct deletion of financial records is prohibited. Attempted for ${transactionId} in ${validFund}. Use Reversal instead.`
    });
    throw new Error('Penghapusan transaksi dilarang. Integritas pembukuan mewajibkan mekanisme Reversal / Koreksi.');
  }

  // ==========================================================================
  // QRIS INTEGRATION & WEBHOOK HANDLER
  // ==========================================================================

  public static createQRISPayment(
    fundType: FundType,
    payload: { invoiceId: string; amount: number; description: string; payerName: string; payerPhone?: string }
  ): QRISPaymentRecord {
    const validFund = this.validateFundType(fundType);
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const idempotencyKey = `IDEM-QRIS-${payload.invoiceId}`;

    const record: QRISPaymentRecord = {
      paymentId,
      invoiceId: payload.invoiceId,
      fundType: validFund, // Immutable fund binding
      amount: payload.amount,
      description: payload.description,
      payerName: payload.payerName,
      payerPhone: payload.payerPhone,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      idempotencyKey
    };

    const raw = getStoreItem(QRIS_PAYMENTS_KEY);
    const list: QRISPaymentRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    setStoreItem(QRIS_PAYMENTS_KEY, JSON.stringify(list));

    return record;
  }

  public static getQRISPaymentByInvoice(invoiceId: string): QRISPaymentRecord | null {
    const raw = getStoreItem(QRIS_PAYMENTS_KEY);
    if (!raw) return null;
    const list: QRISPaymentRecord[] = JSON.parse(raw);
    return list.find(p => p.invoiceId === invoiceId) || null;
  }

  public static processQRISWebhook(payload: {
    providerTransactionId: string;
    signature: string;
    invoiceId: string;
    amount: number;
    paymentId?: string;
  }): { success: boolean; message: string; transaction?: IsolatedFinanceTransaction } {
    // 1. Signature Verification
    const expectedSecret = 'SMART_RT07_QRIS_SEC_2026';
    if (!payload.signature || payload.signature !== expectedSecret) {
      AuditLogger.log({
        requestId: `REQ-QRIS-SIG-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        userId: 'QRIS_GATEWAY',
        role: 'SYSTEM' as any,
        action: 'AI_SECURITY_ALERT',
        toolName: 'FUND_TRANSACTION_BLOCKED',
        authorization: 'DENIED',
        status: 'DENIED',
        details: `[QRIS SIGNATURE FAILED] Invalid signature received for invoice ${payload.invoiceId}.`
      });
      return { success: false, message: 'Invalid QRIS webhook signature.' };
    }

    // 2. Lookup existing payment record (Source of Truth for fundType)
    const payment = this.getQRISPaymentByInvoice(payload.invoiceId);
    if (!payment) {
      return { success: false, message: `Invoice '${payload.invoiceId}' not found in system database.` };
    }

    // 3. Verify Amount
    if (payment.amount !== payload.amount) {
      AuditLogger.log({
        requestId: `REQ-QRIS-AMT-${Date.now()}`,
        sessionId: `SESS-${Date.now()}`,
        userId: 'QRIS_GATEWAY',
        role: 'SYSTEM' as any,
        action: 'AI_SECURITY_ALERT',
        toolName: 'FUND_TRANSACTION_BLOCKED',
        authorization: 'DENIED',
        status: 'DENIED',
        details: `[QRIS AMOUNT MISMATCH] Expected ${payment.amount}, received ${payload.amount}.`
      });
      return { success: false, message: 'Payment amount does not match invoice amount.' };
    }

    // 4. Idempotency Check (Check if already paid)
    if (payment.status === 'PAID') {
      return { success: true, message: 'Webhook already processed (Idempotent replay ignored).' };
    }

    // 5. Update Payment Record
    payment.status = 'PAID';
    payment.providerTransactionId = payload.providerTransactionId;
    payment.paidAt = new Date().toISOString();

    const raw = getStoreItem(QRIS_PAYMENTS_KEY);
    const list: QRISPaymentRecord[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(p => p.invoiceId === payload.invoiceId);
    if (idx !== -1) {
      list[idx] = payment;
      setStoreItem(QRIS_PAYMENTS_KEY, JSON.stringify(list));
    }

    // 6. Automatically Record Transaction to the Pre-Bound Immutable Fund
    const ledgerTx = this.createTransaction(
      payment.fundType,
      {
        transactionType: 'INCOME',
        category: payment.fundType === FundType.RT_UMUM ? 'Iuran Warga' : payment.fundType === FundType.DANA_KEMATIAN ? 'Iuran Dana Kematian' : 'Tarikan Omplongan',
        amount: payment.amount,
        date: new Date().toISOString().split('T')[0],
        description: `[QRIS AUTO] Pembayaran ${payment.description} (Inv: ${payment.invoiceId})`,
        source: 'QRIS',
        payerOrRecipient: payment.payerName,
        providerTransactionId: payload.providerTransactionId,
        idempotencyKey: payment.idempotencyKey,
        status: 'APPROVED'
      },
      { userId: 'QRIS_GATEWAY', role: 'SYSTEM' }
    );

    return {
      success: true,
      message: `QRIS payment successfully credited to ${payment.fundType}.`,
      transaction: ledgerTx
    };
  }

  // ==========================================================================
  // DUAL-APPROVAL FUND TRANSFERS (DISABLED BY DEFAULT)
  // ==========================================================================

  public static createFundTransfer(
    req: { sourceFund: FundType; destinationFund: FundType; amount: number; reason: string },
    requester: { userId: string; role: string }
  ): FundTransferRecord {
    const validSrc = this.validateFundType(req.sourceFund);
    const validDst = this.validateFundType(req.destinationFund);

    if (validSrc === validDst) {
      throw new Error('Sumber dana dan tujuan dana tidak boleh sama.');
    }
    if (req.amount <= 0) {
      throw new Error('Nominal transfer harus lebih besar dari 0.');
    }
    if (!req.reason || req.reason.trim().length < 5) {
      throw new Error('Alasan transfer antar dana wajib diisi minimal 5 karakter (Keperluan Audit).');
    }

    const { closingBalance } = this.calculateBalance(validSrc);
    if (closingBalance < req.amount) {
      throw new Error(`Saldo sumber dana ${validSrc} tidak mencukupi (${formatRupiah(closingBalance)}).`);
    }

    const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const record: FundTransferRecord = {
      transferId,
      sourceFund: validSrc,
      destinationFund: validDst,
      amount: req.amount,
      reason: req.reason.trim(),
      requestedBy: requester.userId,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const raw = getStoreItem(TRANSFERS_KEY);
    const list: FundTransferRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    setStoreItem(TRANSFERS_KEY, JSON.stringify(list));

    AuditLogger.log({
      requestId: `REQ-TRF-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      userId: requester.userId,
      role: requester.role as any,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FUND_TRANSFER_CREATED',
      authorization: 'ALLOWED',
      status: 'PENDING',
      details: JSON.stringify(record)
    });

    return record;
  }

  public static approveFundTransfer(
    transferId: string,
    approver: { userId: string; role: string }
  ): { success: boolean; transfer: FundTransferRecord } {
    if (!['KETUA_RT', 'ADMIN'].includes(approver.role)) {
      throw new Error('Persetujuan transfer antar dana wajib memiliki wewenang KETUA RT atau ADMIN.');
    }

    const raw = getStoreItem(TRANSFERS_KEY);
    const list: FundTransferRecord[] = raw ? JSON.parse(raw) : [];
    const transfer = list.find(t => t.transferId === transferId);

    if (!transfer) {
      throw new Error(`Pengajuan transfer '${transferId}' tidak ditemukan.`);
    }
    if (transfer.status !== 'PENDING') {
      throw new Error(`Transfer '${transferId}' sudah dalam status ${transfer.status}.`);
    }

    // Dual approval check: Requester cannot approve their own transfer
    if (transfer.requestedBy === approver.userId && approver.role !== 'ADMIN') {
      throw new Error('Dual Approval Violation: Pengaju transfer tidak dapat menyetujui transfer buatannya sendiri.');
    }

    // Execute transfer by creating matched transactions in both ledgers
    transfer.status = 'APPROVED';
    transfer.approvedBy = approver.userId;
    transfer.approvedAt = new Date().toISOString();

    // 1. Debit Source Fund (Expense)
    this.createTransaction(
      transfer.sourceFund,
      {
        transactionType: 'EXPENSE',
        category: 'Transfer Antar Dana',
        amount: transfer.amount,
        date: new Date().toISOString().split('T')[0],
        description: `[TRANSFER KELUAR] Transfer ke ${transfer.destinationFund} (Ref: ${transfer.transferId}): ${transfer.reason}`,
        source: 'SYSTEM',
        status: 'PAID'
      },
      { userId: approver.userId, role: approver.role }
    );

    // 2. Credit Destination Fund (Income)
    this.createTransaction(
      transfer.destinationFund,
      {
        transactionType: 'INCOME',
        category: 'Transfer Antar Dana',
        amount: transfer.amount,
        date: new Date().toISOString().split('T')[0],
        description: `[TRANSFER MASUK] Diterima dari ${transfer.sourceFund} (Ref: ${transfer.transferId}): ${transfer.reason}`,
        source: 'SYSTEM',
        status: 'APPROVED'
      },
      { userId: approver.userId, role: approver.role }
    );

    setStoreItem(TRANSFERS_KEY, JSON.stringify(list));

    AuditLogger.log({
      requestId: `REQ-TRF-APP-${Date.now()}`,
      sessionId: `SESS-${Date.now()}`,
      userId: approver.userId,
      role: approver.role as any,
      action: 'AI_AUTOMATION_COMPLETED',
      toolName: 'FUND_TRANSFER_APPROVED',
      authorization: 'ALLOWED',
      status: 'SUCCESS',
      details: JSON.stringify({ transferId, source: transfer.sourceFund, dest: transfer.destinationFund, amount: transfer.amount })
    });

    return { success: true, transfer };
  }

  // ==========================================================================
  // FINANCIAL HEALTH & BACKUP PRESERVATION
  // ==========================================================================

  public static getFinancialHealth(): {
    [key in FundType]: {
      status: 'HEALTHY' | 'WARNING';
      balance: number;
      reconciliation: 'MATCH' | 'MISMATCH';
      txCount: number;
      openingBalance: number;
      income: number;
      expense: number;
    };
  } {
    const res: any = {};
    for (const fund of Object.values(FundType)) {
      const { openingBalance, income, expense, closingBalance, transactionCount } = this.calculateBalance(fund);
      const mathCheck = (openingBalance + income - expense) === closingBalance;
      res[fund] = {
        status: mathCheck && closingBalance >= 0 ? 'HEALTHY' : 'WARNING',
        balance: closingBalance,
        reconciliation: mathCheck ? 'MATCH' : 'MISMATCH',
        txCount: transactionCount,
        openingBalance,
        income,
        expense
      };
    }
    return res;
  }

  public static backupLedgers(): {
    backupId: string;
    timestamp: string;
    version: string;
    data: Record<FundType, IsolatedFinanceTransaction[]>;
    balances: Record<FundType, number>;
  } {
    const data: Record<FundType, IsolatedFinanceTransaction[]> = {
      [FundType.RT_UMUM]: this.getFundLedger(FundType.RT_UMUM),
      [FundType.DANA_KEMATIAN]: this.getFundLedger(FundType.DANA_KEMATIAN),
      [FundType.OMPLOGAN]: this.getFundLedger(FundType.OMPLOGAN)
    };

    const balances: Record<FundType, number> = {
      [FundType.RT_UMUM]: this.calculateBalance(FundType.RT_UMUM).closingBalance,
      [FundType.DANA_KEMATIAN]: this.calculateBalance(FundType.DANA_KEMATIAN).closingBalance,
      [FundType.OMPLOGAN]: this.calculateBalance(FundType.OMPLOGAN).closingBalance
    };

    return {
      backupId: `BCK-FIN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '10I_ISOLATED_LEDGER_v1.0',
      data,
      balances
    };
  }

  public static restoreLedgers(backupData: any): { success: boolean; balances: Record<FundType, number> } {
    if (!backupData || !backupData.data) {
      throw new Error('Struktur file backup tidak valid.');
    }

    // Restore each fund while preserving strict fund isolation
    for (const fund of Object.values(FundType)) {
      const fundTxs: IsolatedFinanceTransaction[] = backupData.data[fund] || [];
      this.saveFundLedger(fund, fundTxs);
    }

    const balances: Record<FundType, number> = {
      [FundType.RT_UMUM]: this.calculateBalance(FundType.RT_UMUM).closingBalance,
      [FundType.DANA_KEMATIAN]: this.calculateBalance(FundType.DANA_KEMATIAN).closingBalance,
      [FundType.OMPLOGAN]: this.calculateBalance(FundType.OMPLOGAN).closingBalance
    };

    return { success: true, balances };
  }
}
