/**
 * omplonganService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * 10I — OMPLOGAN ISOLATED FINANCIAL SERVICE
 *
 * Exclusively manages FundType.OMPLOGAN transactions, tarikan, balance, and reports.
 */

import { FundType, IsolatedFinanceTransaction, FinanceReportSnapshot } from '../types/finance';
import { FinancialRepository } from './financialRepository';
import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';

export class OmplonganService {
  public static readonly FUND_TYPE = FundType.OMPLOGAN;

  /**
   * Add Collection / Tarikan Omplongan (Income)
   */
  public static addCollection(
    payload: {
      category?: string;
      amount: number;
      date: string;
      description: string;
      tarikanNumber?: string;
      payer?: string;
      receiptUrl?: string;
      source?: 'MANUAL' | 'QRIS' | 'TRANSFER' | 'CASH';
      idempotencyKey?: string;
    },
    session: AuthoritativeSessionContext
  ): IsolatedFinanceTransaction {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat tarikan omplongan.');
    }

    const desc = payload.tarikanNumber
      ? `[${payload.tarikanNumber}] ${payload.description}`
      : payload.description;

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'INCOME',
        category: payload.category || 'Tarikan Omplongan',
        amount: payload.amount,
        date: payload.date,
        description: desc,
        payerOrRecipient: payload.payer || 'Warga RT 07',
        receiptUrl: payload.receiptUrl,
        source: payload.source || 'CASH',
        idempotencyKey: payload.idempotencyKey,
        status: 'APPROVED'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );
  }

  /**
   * Add Expense for Omplongan / Agustusan Activities
   */
  public static addExpense(
    payload: {
      category: string;
      amount: number;
      date: string;
      description: string;
      recipient?: string;
      receiptUrl?: string;
      source?: 'MANUAL' | 'TRANSFER' | 'CASH';
    },
    session: AuthoritativeSessionContext
  ): IsolatedFinanceTransaction {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat pengeluaran omplongan.');
    }

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'EXPENSE',
        category: payload.category || 'Perlengkapan',
        amount: payload.amount,
        date: payload.date,
        description: payload.description,
        payerOrRecipient: payload.recipient || 'Panitia / Pihak Terkait',
        receiptUrl: payload.receiptUrl,
        source: payload.source || 'CASH',
        status: ['BENDAHARA', 'ADMIN', 'KETUA_RT'].includes(session.role) ? 'VERIFIED' : 'PENDING'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );
  }

  /**
   * List Transactions for Omplongan Only
   */
  public static listTransactions(session?: AuthoritativeSessionContext): IsolatedFinanceTransaction[] {
    if (session) {
      validateSessionContext(session);
    }
    return FinancialRepository.listTransactions(this.FUND_TYPE);
  }

  /**
   * Calculate Real-Time Balance for Omplongan Only
   */
  public static getBalance(): { openingBalance: number; income: number; expense: number; closingBalance: number } {
    return FinancialRepository.calculateBalance(this.FUND_TYPE);
  }

  /**
   * Generate Isolated Report for Omplongan Only
   */
  public static generateReport(period: string, year: number, session: AuthoritativeSessionContext): FinanceReportSnapshot {
    validateSessionContext(session);
    const balance = this.getBalance();

    return {
      reportId: `REP-OMP-${year}-${Date.now().toString().slice(-4)}`,
      period,
      year,
      fundId: this.FUND_TYPE,
      reportType: 'DANA_AGUSTUSAN',
      generatedBy: session.userId,
      generatedAt: new Date().toISOString(),
      startingBalance: balance.openingBalance,
      totalIncome: balance.income,
      totalExpense: balance.expense,
      endingBalance: balance.closingBalance,
      documentId: `DOC-OMP-${Date.now()}`,
      driveFileUrl: `/documents/KEUANGAN_OMPLOGAN_${year}.pdf`,
      version: 'FINANCE_REPORT_OMPLOGAN_v2.0',
      approvedByKetuaRT: 'Eko Sucahyono',
      approvedByBendahara: 'Ahmad Ridwan, S.E.'
    };
  }
}
