/**
 * deathFundService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * 10I — DANA KEMATIAN ISOLATED FINANCIAL SERVICE
 *
 * Exclusively manages FundType.DANA_KEMATIAN transactions, balance, and reports.
 */

import { FundType, IsolatedFinanceTransaction, FinanceReportSnapshot } from '../types/finance';
import { FinancialRepository } from './financialRepository';
import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';

export class DeathFundService {
  public static readonly FUND_TYPE = FundType.DANA_KEMATIAN;

  /**
   * Add Income to Dana Kematian & Sosial
   */
  public static addIncome(
    payload: {
      category: string;
      amount: number;
      date: string;
      description: string;
      payer?: string;
      receiptUrl?: string;
      source?: 'MANUAL' | 'QRIS' | 'TRANSFER' | 'CASH';
      idempotencyKey?: string;
    },
    session: AuthoritativeSessionContext
  ): IsolatedFinanceTransaction {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat pemasukan Dana Kematian.');
    }

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'INCOME',
        category: payload.category || 'Iuran Dana Kematian',
        amount: payload.amount,
        date: payload.date,
        description: payload.description,
        payerOrRecipient: payload.payer || 'Warga RT 07',
        receiptUrl: payload.receiptUrl,
        source: payload.source || 'MANUAL',
        idempotencyKey: payload.idempotencyKey,
        status: 'APPROVED'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );
  }

  /**
   * Add Santunan / Disbursement from Dana Kematian
   */
  public static addDisbursement(
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
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat santunan duka kematian.');
    }

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'EXPENSE',
        category: payload.category || 'Santunan Kematian',
        amount: payload.amount,
        date: payload.date,
        description: payload.description,
        payerOrRecipient: payload.recipient || 'Ahli Waris Warga',
        receiptUrl: payload.receiptUrl,
        source: payload.source || 'TRANSFER',
        status: ['BENDAHARA', 'ADMIN', 'KETUA_RT'].includes(session.role) ? 'VERIFIED' : 'PENDING'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );
  }

  /**
   * List Transactions for Dana Kematian Only
   */
  public static listTransactions(session?: AuthoritativeSessionContext): IsolatedFinanceTransaction[] {
    if (session) {
      validateSessionContext(session);
    }
    return FinancialRepository.listTransactions(this.FUND_TYPE);
  }

  /**
   * Calculate Real-Time Balance for Dana Kematian Only
   */
  public static getBalance(): { openingBalance: number; income: number; expense: number; closingBalance: number } {
    return FinancialRepository.calculateBalance(this.FUND_TYPE);
  }

  /**
   * Generate Isolated Report for Dana Kematian Only
   */
  public static generateReport(period: string, year: number, session: AuthoritativeSessionContext): FinanceReportSnapshot {
    validateSessionContext(session);
    const balance = this.getBalance();

    return {
      reportId: `REP-DK-${year}-${Date.now().toString().slice(-4)}`,
      period,
      year,
      fundId: this.FUND_TYPE,
      reportType: 'DANA_KEMATIAN',
      generatedBy: session.userId,
      generatedAt: new Date().toISOString(),
      startingBalance: balance.openingBalance,
      totalIncome: balance.income,
      totalExpense: balance.expense,
      endingBalance: balance.closingBalance,
      documentId: `DOC-DK-${Date.now()}`,
      driveFileUrl: `/documents/KEUANGAN_DANA_KEMATIAN_${year}.pdf`,
      version: 'FINANCE_REPORT_DANA_KEMATIAN_v2.0',
      approvedByKetuaRT: 'Sutrisno, S.T.',
      approvedByBendahara: 'Ahmad Ridwan, S.E.'
    };
  }
}
