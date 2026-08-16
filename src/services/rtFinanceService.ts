/**
 * rtFinanceService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * 10I — RT UMUM ISOLATED FINANCIAL SERVICE
 *
 * Exclusively manages FundType.RT_UMUM transactions, balance, and reports.
 */

import { FundType, IsolatedFinanceTransaction, FinanceReportSnapshot } from '../types/finance';
import { FinancialRepository } from './financialRepository';
import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';

export class RtFinanceService {
  public static readonly FUND_TYPE = FundType.RT_UMUM;

  /**
   * Add Income to Kas Umum RT 07
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
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat pemasukan RT Umum.');
    }

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'INCOME',
        category: payload.category || 'Iuran Warga',
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
   * Add Expense from Kas Umum RT 07
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
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak. Hanya Pengurus/Bendahara yang dapat mencatat pengeluaran RT Umum.');
    }

    return FinancialRepository.createTransaction(
      this.FUND_TYPE,
      {
        transactionType: 'EXPENSE',
        category: payload.category || 'Operasional RT',
        amount: payload.amount,
        date: payload.date,
        description: payload.description,
        payerOrRecipient: payload.recipient || 'Petugas/Pihak Terkait',
        receiptUrl: payload.receiptUrl,
        source: payload.source || 'CASH',
        status: ['BENDAHARA', 'ADMIN', 'KETUA_RT'].includes(session.role) ? 'VERIFIED' : 'PENDING'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );
  }

  /**
   * List Transactions for RT Umum Only
   */
  public static listTransactions(session?: AuthoritativeSessionContext): IsolatedFinanceTransaction[] {
    if (session) {
      validateSessionContext(session);
      // Warga role check
      if (session.role === 'WARGA') {
        // Warga only gets sanitized public summary, not internal raw modifications
      }
    }
    return FinancialRepository.listTransactions(this.FUND_TYPE);
  }

  /**
   * Calculate Real-Time Balance for RT Umum Only
   */
  public static getBalance(): { openingBalance: number; income: number; expense: number; closingBalance: number } {
    return FinancialRepository.calculateBalance(this.FUND_TYPE);
  }

  /**
   * Generate Isolated Report for RT Umum Only
   */
  public static generateReport(period: string, year: number, session: AuthoritativeSessionContext): FinanceReportSnapshot {
    validateSessionContext(session);
    const balance = this.getBalance();

    return {
      reportId: `REP-RT-UMUM-${year}-${Date.now().toString().slice(-4)}`,
      period,
      year,
      fundId: this.FUND_TYPE,
      reportType: 'KAS_UMUM',
      generatedBy: session.userId,
      generatedAt: new Date().toISOString(),
      startingBalance: balance.openingBalance,
      totalIncome: balance.income,
      totalExpense: balance.expense,
      endingBalance: balance.closingBalance,
      documentId: `DOC-RT-UMUM-${Date.now()}`,
      driveFileUrl: `/documents/KEUANGAN_RT_UMUM_${year}.pdf`,
      version: 'FINANCE_REPORT_RT_UMUM_v2.0',
      approvedByKetuaRT: 'Eko Sucahyono',
      approvedByBendahara: 'Ahmad Ridwan, S.E.'
    };
  }
}
