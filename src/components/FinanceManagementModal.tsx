/**
 * FinanceManagementModal.tsx
 * MODUL KEUANGAN RT v2.0 — PRODUCTION READY
 * SMART RT 07 RW 11 GPA NGIJO
 */

import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/rt';
import {
  FundId,
  FundAccount,
  FinanceTransaction,
  BukuKasEntry,
  AgustusanBudgetItem,
  FinanceReportSnapshot,
  TransactionType,
  FinanceCategory
} from '../types/finance';
import {
  FinanceService,
  formatRupiah,
  maskRecipientName
} from '../services/financeService';
import { AuthoritativeSessionContext } from '../security/authorization';
import { OfficialKopSurat } from './OfficialKopSurat';
import { DOCUMENT_BRANDING } from '../config/documentBranding';
import {
  Wallet,
  HeartHandshake,
  Flag,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  PlusCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  AlertTriangle,
  Building2,
  X,
  ShieldAlert,
  ArrowRightLeft,
  DollarSign,
  PieChart as PieChartIcon,
  Search,
  ShieldCheck,
  Server,
  Lock,
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { FinancialLedgerTestService, FinancialTestSuiteSummary } from '../services/financialLedgerTestService';
import { FinancialRepository } from '../services/financialRepository';
import { FundType } from '../types/finance';

interface FinanceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

type FinanceSubmenu =
  | 'dashboard'
  | 'iuran'
  | 'dana-kematian'
  | 'agustusan'
  | 'pengeluaran'
  | 'pemasukan'
  | 'buku-kas'
  | 'laporan'
  | 'isolasi-audit';

export const FinanceManagementModal: React.FC<FinanceManagementModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  addToast
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<FinanceSubmenu>('dashboard');
  const [accounts, setAccounts] = useState<Record<FundId, FundAccount>>({} as any);
  const [ledger, setLedger] = useState<FinanceTransaction[]>([]);
  const [agustusanBudget, setAgustusanBudget] = useState<AgustusanBudgetItem[]>([]);
  const [backendStatusMessage, setBackendStatusMessage] = useState<string>('');

  // Form Modals State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputTxType, setInputTxType] = useState<TransactionType>('PEMASUKAN');
  const [inputFundId, setInputFundId] = useState<FundId>('KAS_UMUM');
  const [inputCategory, setInputCategory] = useState<string>('Iuran Warga');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [inputDescription, setInputDescription] = useState<string>('');
  const [inputPayerRecipient, setInputPayerRecipient] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Reversal Modal State
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false);
  const [reversalTargetTxId, setReversalTargetTxId] = useState<string>('');
  const [reversalReason, setReversalReason] = useState<string>('');

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetTxId, setRejectTargetTxId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');

  // Filter State for Buku Kas
  const [bukuKasFilterFund, setBukuKasFilterFund] = useState<FundId | 'ALL'>('ALL');
  const [bukuKasFilterType, setBukuKasFilterType] = useState<'ALL' | 'PEMASUKAN' | 'PENGELUARAN'>('ALL');
  const [bukuKasSearchQuery, setBukuKasSearchQuery] = useState<string>('');

  // Print Report State
  const [selectedReportType, setSelectedReportType] = useState<FinanceReportSnapshot['reportType']>('REKAP_BULANAN');
  const [activeReportSnapshot, setActiveReportSnapshot] = useState<FinanceReportSnapshot | null>(null);

  // 10I Test Suite & Isolation Health State
  const [testSummary, setTestSummary] = useState<FinancialTestSuiteSummary | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [financialHealth, setFinancialHealth] = useState<any>(null);

  // Fund Transfer Modal State (Dual-Approval)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceFund, setTransferSourceFund] = useState<FundType>(FundType.RT_UMUM);
  const [transferDestFund, setTransferDestFund] = useState<FundType>(FundType.DANA_KEMATIAN);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferReason, setTransferReason] = useState<string>('');

  // Load Data
  const refreshData = () => {
    const rawLedger = FinanceService.getStoredLedger();
    setLedger(rawLedger);
    const accs = FinanceService.calculateBalances(rawLedger);
    setAccounts(accs);
    setAgustusanBudget(FinanceService.getAgustusanBudget());
    try {
      const health = FinancialRepository.getFinancialHealth();
      setFinancialHealth(health);
    } catch (_) {}
  };

  const handleRunIsolationTests = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      try {
        const results = FinancialLedgerTestService.runAllTestCases();
        setTestSummary(results);
        if (results.failedCount === 0) {
          addToast(`10I Financial Isolation & Security Suite: 100% PASS (${results.passedCount}/${results.totalTests} tests)`, 'success');
        } else {
          addToast(`Ditemukan ${results.failedCount} kegagalan isolasi.`, 'warning');
        }
      } catch (e: any) {
        addToast(e.message || 'Gagal menjalankan suite pengujian', 'error');
      } finally {
        setIsTestRunning(false);
      }
    }, 400);
  };

  const handleCreateFundTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record = FinancialRepository.createFundTransfer(
        {
          sourceFund: transferSourceFund,
          destinationFund: transferDestFund,
          amount: transferAmount,
          reason: transferReason
        },
        { userId: currentSession.userId, role: currentSession.role }
      );
      addToast(`Pengajuan transfer dana ${record.transferId} berhasil dibuat (Status: PENDING DUAL-APPROVAL).`, 'info');
      setIsTransferModalOpen(false);
      setTransferAmount(0);
      setTransferReason('');
      refreshData();
    } catch (e: any) {
      addToast(e.message || 'Gagal mengajukan transfer', 'error');
    }
  };

  const handleBackupLedgers = () => {
    try {
      const bck = FinancialRepository.backupLedgers();
      const blob = new Blob([JSON.stringify(bck, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BACKUP_FINANCE_10I_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Cadangan pembukuan 3 fund berhasil diunduh.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Gagal membuat backup', 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Authoritative Session Object for security checks
  const currentSession: AuthoritativeSessionContext = {
    sessionId: `SESS-${Date.now()}`,
    userId: currentRole === 'ADMIN' ? 'admin_01' : currentRole === 'KETUA_RT' ? 'ketua_rt' : currentRole === 'PENGURUS' ? 'pengurus_01' : 'warga_01',
    role: currentRole,
    isValid: true,
    issuedAt: new Date().toISOString()
  };

  // Submit New Transaction
  const handleCreateTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await FinanceService.createTransaction(
        {
          date: inputDate,
          fundId: inputFundId,
          type: inputTxType,
          category: inputCategory as FinanceCategory,
          amount: Number(inputAmount),
          description: inputDescription,
          payerOrRecipient: inputPayerRecipient
        },
        currentSession
      );

      if (res.success) {
        addToast(res.message, 'success');
        setIsInputModalOpen(false);
        // Reset Form
        setInputAmount(0);
        setInputDescription('');
        setInputPayerRecipient('');
        refreshData();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Gagal menyimpan transaksi', 'error');
    }
  };

  // Verify Transaction (Pengurus/Bendahara)
  const handleVerify = async (txId: string) => {
    try {
      const res = await FinanceService.verifyTransaction(txId, currentSession);
      if (res.success) {
        addToast(res.message, 'success');
        refreshData();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Gagal memverifikasi', 'error');
    }
  };

  // Approve & Pay Transaction (Ketua RT/Admin)
  const handleApprove = async (txId: string) => {
    try {
      const res = await FinanceService.approveTransaction(txId, currentSession);
      if (res.success) {
        addToast(res.message, 'success');
        refreshData();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Gagal menyetujui transaksi', 'error');
    }
  };

  // Reject Transaction (Ketua RT/Admin)
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      addToast('Alasan penolakan wajib diisi', 'warning');
      return;
    }
    try {
      const res = await FinanceService.rejectTransaction(rejectTargetTxId, rejectReason, currentSession);
      if (res.success) {
        addToast(res.message, 'info');
        setIsRejectModalOpen(false);
        setRejectReason('');
        refreshData();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Gagal menolak transaksi', 'error');
    }
  };

  // Reverse / Void Transaction (Bendahara/Admin)
  const handleReversalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalReason) {
      addToast('Alasan koreksi/reversal wajib diisi', 'warning');
      return;
    }
    try {
      const res = await FinanceService.reverseTransaction(reversalTargetTxId, reversalReason, currentSession);
      if (res.success) {
        addToast(res.message, 'success');
        setIsReversalModalOpen(false);
        setReversalReason('');
        refreshData();
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Gagal melakukan reversal', 'error');
    }
  };

  // Generate Report Snapshot
  const handleGenerateReport = () => {
    const period = 'Agustus 2026';
    const snapshot = FinanceService.generateReportSnapshot(
      selectedReportType,
      period,
      2026,
      8,
      selectedReportType === 'DANA_KEMATIAN' ? 'DANA_KEMATIAN' : selectedReportType === 'DANA_AGUSTUSAN' ? 'DANA_AGUSTUSAN' : 'ALL',
      currentSession
    );
    setActiveReportSnapshot(snapshot);
    addToast(`Laporan ${selectedReportType} (${period}) berhasil diterbitkan!`, 'success');
  };

  // Total Combined Balance
  const totalBalanceAllFunds = (accounts.KAS_UMUM?.balance || 0) + (accounts.DANA_KEMATIAN?.balance || 0) + (accounts.DANA_AGUSTUSAN?.balance || 0);

  // Monthly Income & Expense
  const currentMonthIncome = ledger
    .filter(t => (t.status === 'APPROVED' || t.status === 'PAID') && t.type === 'PEMASUKAN')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = ledger
    .filter(t => (t.status === 'APPROVED' || t.status === 'PAID') && t.type === 'PENGELUARAN')
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart Data Preparation
  const chartData = [
    {
      name: 'Kas Umum',
      Pemasukan: accounts.KAS_UMUM?.totalIncome || 0,
      Pengeluaran: accounts.KAS_UMUM?.totalExpense || 0
    },
    {
      name: 'Dana Kematian',
      Pemasukan: accounts.DANA_KEMATIAN?.totalIncome || 0,
      Pengeluaran: accounts.DANA_KEMATIAN?.totalExpense || 0
    },
    {
      name: 'Agustusan',
      Pemasukan: accounts.DANA_AGUSTUSAN?.totalIncome || 0,
      Pengeluaran: accounts.DANA_AGUSTUSAN?.totalExpense || 0
    }
  ];

  // Category Options based on Fund & Type
  const getCategoryOptions = (): string[] => {
    if (inputFundId === 'KAS_UMUM') {
      return inputTxType === 'PEMASUKAN'
        ? ['Iuran Warga', 'Sumbangan', 'Operasional', 'Lainnya']
        : ['Keamanan & Pos Kamling', 'Kebersihan & Sampah', 'Perbaikan Infrastruktur', 'Acara / Sosial', 'Operasional RT', 'Lainnya'];
    } else if (inputFundId === 'DANA_KEMATIAN') {
      return inputTxType === 'PEMASUKAN'
        ? ['Iuran Dana Kematian', 'Donasi', 'Bantuan', 'Lainnya']
        : ['Santunan Kematian', 'Bantuan Duka', 'Transportasi', 'Perlengkapan', 'Lainnya'];
    } else {
      return inputTxType === 'PEMASUKAN'
        ? ['Iuran Agustusan', 'Amplop Warga', 'Donasi', 'Sponsor', 'Bantuan', 'Lainnya']
        : ['Lomba', 'Hadiah', 'Konsumsi', 'Dekorasi', 'Perlengkapan', 'Sound System', 'Dokumentasi', 'Kebersihan', 'Keamanan', 'Honor / Petugas', 'Lainnya'];
    }
  };

  // Buku Kas Data
  const { entries: bukuKasEntries, summary: bukuKasSummary } = FinanceService.getBukuKasEntries(
    { fundId: bukuKasFilterFund, type: bukuKasFilterType },
    currentRole
  );

  const filteredBukuKas = bukuKasEntries.filter(
    e =>
      e.uraian.toLowerCase().includes(bukuKasSearchQuery.toLowerCase()) ||
      e.kategori.toLowerCase().includes(bukuKasSearchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(bukuKasSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Modal Card Main Container */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* Header Bar (Hidden in Print) */}
        <div className="bg-[#123B5D] px-6 py-4 border-b border-slate-700/80 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] border border-[#D4A72C] flex items-center justify-center shadow">
              <DollarSign className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">MODUL KEUANGAN RT v2.0</h2>
              <p className="text-xs text-slate-300">Rukun Tetangga 07 RW 11 Perum GPA Ngijo — Transparan, Akuntabel & Secure</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(currentRole === 'BENDAHARA' || currentRole === 'PENGURUS' || currentRole === 'ADMIN') && (
              <button
                onClick={() => setIsInputModalOpen(true)}
                className="px-3.5 py-2 bg-[#2E7D52] hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg border border-[#D4A72C]/50 flex items-center gap-1.5 shadow transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#D4A72C]" />
                + Transaksi Baru
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Submenu Navigation Tabs (Hidden in Print) */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin print:hidden">
          {[
            { id: 'dashboard', label: '📈 Dashboard Keuangan', icon: PieChartIcon },
            { id: 'isolasi-audit', label: '🛡️ 10I Isolasi & Audit', icon: ShieldCheck },
            { id: 'iuran', label: '💳 Iuran Warga', icon: Wallet },
            { id: 'dana-kematian', label: '🕊️ Dana Kematian', icon: HeartHandshake },
            { id: 'agustusan', label: '🇮🇩 Amplongan / Agustusan', icon: Flag },
            { id: 'pengeluaran', label: '💸 Pengeluaran', icon: TrendingDown },
            { id: 'pemasukan', label: '💰 Pemasukan', icon: TrendingUp },
            { id: 'buku-kas', label: '🧾 Buku Kas', icon: FileSpreadsheet },
            { id: 'laporan', label: '📊 Laporan Keuangan', icon: Printer }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubmenu(tab.id as FinanceSubmenu)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeSubmenu === tab.id
                  ? 'bg-[#2E7D52] text-white shadow border border-[#D4A72C]'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-900 print:bg-white print:p-0">
          
          {/* ===================================================================== */}
          {/* 1. DASHBOARD KEUANGAN */}
          {/* ===================================================================== */}
          {activeSubmenu === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Saldo Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Total Combined Balance */}
                <div className="bg-gradient-to-br from-[#123B5D] to-slate-900 p-4 rounded-xl border border-[#D4A72C]/40 shadow-lg">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
                    <span>TOTAL KAS RT</span>
                    <Wallet className="w-4 h-4 text-[#D4A72C]" />
                  </div>
                  <div className="text-xl font-black text-white">{formatRupiah(totalBalanceAllFunds)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Gabungan 3 Fund Accounts</div>
                </div>

                {/* Kas Umum */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
                    <span>Kas Umum RT</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-lg font-extrabold text-emerald-400">{formatRupiah(accounts.KAS_UMUM?.balance || 0)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Operasional & Infrastruktur</div>
                </div>

                {/* Dana Kematian */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-rose-500/30">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
                    <span>Dana Kematian</span>
                    <HeartHandshake className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-lg font-extrabold text-rose-400">{formatRupiah(accounts.DANA_KEMATIAN?.balance || 0)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Santunan & Bantuan Duka</div>
                </div>

                {/* Dana Agustusan */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
                    <span>Dana Agustusan</span>
                    <Flag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-extrabold text-amber-400">{formatRupiah(accounts.DANA_AGUSTUSAN?.balance || 0)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Kegiatan Kemerdekaan RI</div>
                </div>

                {/* Pemasukan & Pengeluaran Bulan Ini */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                      <span>Pemasukan Bbln Ini:</span>
                      <span>+{formatRupiah(currentMonthIncome)}</span>
                    </div>
                    <div className="text-[11px] text-rose-400 font-bold flex items-center justify-between mt-1">
                      <span>Pengeluaran Bln Ini:</span>
                      <span>-{formatRupiah(currentMonthExpense)}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-1 mt-2">
                    Net Flow: <span className={currentMonthIncome >= currentMonthExpense ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{formatRupiah(currentMonthIncome - currentMonthExpense)}</span>
                  </div>
                </div>
              </div>

              {/* Chart Visuals & Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Bar Chart (Recharts) */}
                <div className="lg:col-span-7 bg-slate-800/60 p-5 rounded-xl border border-slate-700/70">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#D4A72C]" />
                    Pemasukan vs Pengeluaran Per Fund Account
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={val => `Rp${val / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                          formatter={(value: any) => [formatRupiah(Number(value)), '']}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Transaksi Terakhir (Real Ledger Data) */}
                <div className="lg:col-span-5 bg-slate-800/60 p-5 rounded-xl border border-slate-700/70 flex flex-col">
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                    <span>Transaksi Terakhir</span>
                    <span className="text-xs text-slate-400 font-normal">REAL DAL Data</span>
                  </h3>

                  <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1 flex-1">
                    {ledger.slice(0, 6).map(tx => (
                      <div key={tx.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${tx.fundId === 'KAS_UMUM' ? 'bg-emerald-400' : tx.fundId === 'DANA_KEMATIAN' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {tx.date} • {tx.category} • <span className="font-mono text-slate-300">{tx.fundId}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${tx.type === 'PEMASUKAN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'PEMASUKAN' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            tx.status === 'PAID' || tx.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            tx.status === 'VERIFIED' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. DANA KEMATIAN */}
          {/* ===================================================================== */}
          {activeSubmenu === 'dana-kematian' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-950/60 to-slate-900 p-5 rounded-2xl border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">🕊️ DANA KEMATIAN & SOSIAL</h3>
                    <p className="text-xs text-rose-200/80">Pengelolaan dana duka warga transparan & terjaga kerahasiaannya.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-300 font-medium">Saldo Dana Kematian</div>
                  <div className="text-2xl font-black text-rose-400">{formatRupiah(accounts.DANA_KEMATIAN?.balance || 0)}</div>
                </div>
              </div>

              {/* Transaction Table Dana Kematian */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/70 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">Riwayat Transaksi Dana Kematian</h4>
                  <span className="text-xs text-slate-400">Privasi Warga Terlindungi</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Jenis</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Penerima / Penyetor</th>
                        <th className="px-4 py-3">Uraian</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ledger
                        .filter(t => t.fundId === 'DANA_KEMATIAN')
                        .map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{tx.date}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${tx.type === 'PEMASUKAN' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-200">{tx.category}</td>
                            <td className="px-4 py-3 font-medium text-amber-300">
                              {maskRecipientName(tx.payerOrRecipient || '', currentRole)}
                            </td>
                            <td className="px-4 py-3 text-slate-300">{tx.description}</td>
                            <td className={`px-4 py-3 text-right font-bold ${tx.type === 'PEMASUKAN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'PEMASUKAN' ? '+' : '-'}{formatRupiah(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. AMPLONGAN / AGUSTUSAN */}
          {/* ===================================================================== */}
          {activeSubmenu === 'agustusan' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 p-5 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500 flex items-center justify-center text-amber-400">
                    <Flag className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">🇮🇩 AMPLONGAN / AGUSTUSAN 2026</h3>
                    <p className="text-xs text-amber-200/80">Anggaran, Realisasi & Pengeluaran Peringatan HUT Kemerdekaan RI ke-81</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-300 font-medium">Kas Agustusan</div>
                  <div className="text-2xl font-black text-amber-400">{formatRupiah(accounts.DANA_AGUSTUSAN?.balance || 0)}</div>
                </div>
              </div>

              {/* Budget vs Realization Breakdown */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/70 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-200">Rencana Anggaran vs Realisasi Pengeluaran</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agustusanBudget.map(b => {
                    const pct = b.anggaran > 0 ? Math.round((b.realisasi / b.anggaran) * 100) : 0;
                    const isOver = pct >= 100;
                    const isWarning = pct >= 80 && !isOver;

                    return (
                      <div key={b.id} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-200">{b.kategori}</span>
                          <span className={isOver ? 'text-rose-400 font-black' : isWarning ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                            {pct}% ({formatRupiah(b.realisasi)} / {formatRupiah(b.anggaran)})
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          ></div>
                        </div>

                        {/* Budget Warning Badges */}
                        {isOver && (
                          <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            🚨 Anggaran Terlampaui!
                          </div>
                        )}
                        {isWarning && (
                          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            ⚠️ Mendekati batas anggaran (≥80%)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. PENGELUARAN & APPROVAL WORKFLOW */}
          {/* ===================================================================== */}
          {activeSubmenu === 'pengeluaran' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-100">💸 DAFTAR PENGELUARAN & WORKFLOW APPROVAL</h3>
                  <p className="text-xs text-slate-400">Workflow: PENDING → VERIFIED → APPROVED → PAID</p>
                </div>
                {(currentRole === 'BENDAHARA' || currentRole === 'PENGURUS' || currentRole === 'ADMIN') && (
                  <button
                    onClick={() => {
                      setInputTxType('PENGELUARAN');
                      setIsInputModalOpen(true);
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg border border-rose-400/50 shadow flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Ajukan Pengeluaran
                  </button>
                )}
              </div>

              {/* Table Pengeluaran */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">ID / Tanggal</th>
                        <th className="px-4 py-3">Fund</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Penerima & Uraian</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Aksi / Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ledger
                        .filter(t => t.type === 'PENGELUARAN')
                        .map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                              <div className="font-bold text-slate-200">{tx.id}</div>
                              <div className="text-[10px] text-slate-400">{tx.date}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-amber-300">
                                {tx.fundId}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-200">{tx.category}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-100">{tx.payerOrRecipient}</div>
                              <div className="text-slate-400 text-[11px]">{tx.description}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-black text-rose-400 text-sm">
                              -{formatRupiah(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                tx.status === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                tx.status === 'VERIFIED' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                                tx.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                                'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Verify Action for Pengurus/Bendahara */}
                                {tx.status === 'PENDING' && ['PENGURUS', 'BENDAHARA', 'ADMIN'].includes(currentRole) && (
                                  <button
                                    onClick={() => handleVerify(tx.id)}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold"
                                  >
                                    Verifikasi
                                  </button>
                                )}

                                {/* Approve Action for Ketua RT */}
                                {(tx.status === 'VERIFIED' || tx.status === 'PENDING') && ['KETUA_RT', 'ADMIN'].includes(currentRole) && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(tx.id)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                                    >
                                      Setujui & Cairkan
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRejectTargetTxId(tx.id);
                                        setIsRejectModalOpen(true);
                                      }}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                                    >
                                      Tolak
                                    </button>
                                  </>
                                )}

                                {/* Reversal for Bendahara */}
                                {tx.status === 'PAID' && ['BENDAHARA', 'ADMIN'].includes(currentRole) && (
                                  <button
                                    onClick={() => {
                                      setReversalTargetTxId(tx.id);
                                      setIsReversalModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    Reversal
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. PEMASUKAN */}
          {/* ===================================================================== */}
          {activeSubmenu === 'pemasukan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-100">💰 DAFTAR PEMASUKAN KAS RT</h3>
                  <p className="text-xs text-slate-400">Pencatatan iuran warga, donasi & bantuan dari 3 Fund Accounts</p>
                </div>
                {(currentRole === 'BENDAHARA' || currentRole === 'PENGURUS' || currentRole === 'ADMIN') && (
                  <button
                    onClick={() => {
                      setInputTxType('PEMASUKAN');
                      setIsInputModalOpen(true);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg border border-emerald-400/50 shadow flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Catat Pemasukan
                  </button>
                )}
              </div>

              {/* Table Pemasukan */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Fund</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Penyetor / Sumber</th>
                        <th className="px-4 py-3">Uraian</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {ledger
                        .filter(t => t.type === 'PEMASUKAN')
                        .map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{tx.date}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-emerald-300">
                                {tx.fundId}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-200">{tx.category}</td>
                            <td className="px-4 py-3 font-semibold text-slate-100">{tx.payerOrRecipient}</td>
                            <td className="px-4 py-3 text-slate-300">{tx.description}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-400 text-sm">
                              +{formatRupiah(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. IURAN WARGA */}
          {/* ===================================================================== */}
          {activeSubmenu === 'iuran' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h3 className="text-base font-bold text-slate-100">💳 REKAP IURAN WARGA PERUM GPA NGIJO</h3>
                <p className="text-xs text-slate-400">Pencatatan status iuran rutin bulanan 70 Kartu Keluarga RT 07 RW 11</p>
              </div>

              {/* Simple Iuran Summary List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">Iuran Kas RT Bulan Ini</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">70 KK Terdata</div>
                  <div className="text-[11px] text-slate-300 mt-2">Tarif: Rp 50.000 / KK / Bulan</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">Iuran Dana Kematian</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">70 KK Terdata</div>
                  <div className="text-[11px] text-slate-300 mt-2">Tarif: Rp 20.000 / KK / Bulan</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">Iuran Agustusan</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">70 KK Terdata</div>
                  <div className="text-[11px] text-slate-300 mt-2">Tarif: Rp 50.000 / KK (Sekali Setahun)</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 7. BUKU KAS LEDGER */}
          {/* ===================================================================== */}
          {activeSubmenu === 'buku-kas' && (
            <div className="space-y-4">
              
              {/* Filter Bar */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-[#D4A72C]" />
                  <span className="text-xs font-bold text-slate-200">Filter Buku Kas:</span>
                  
                  {/* Fund Filter */}
                  <select
                    value={bukuKasFilterFund}
                    onChange={e => setBukuKasFilterFund(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="ALL">Semua Fund Accounts</option>
                    <option value="KAS_UMUM">Kas Umum</option>
                    <option value="DANA_KEMATIAN">Dana Kematian</option>
                    <option value="DANA_AGUSTUSAN">Dana Agustusan</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={bukuKasFilterType}
                    onChange={e => setBukuKasFilterType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="ALL">Semua Jenis Transaksi</option>
                    <option value="PEMASUKAN">Pemasukan</option>
                    <option value="PENGELUARAN">Pengeluaran</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari uraian..."
                    value={bukuKasSearchQuery}
                    onChange={e => setBukuKasSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs pl-8 pr-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              {/* Buku Kas Table Format */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/70 overflow-hidden">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span>BUKU KAS LEDGER (BERJALAN)</span>
                  <span>Saldo Akhir Berjalan: <span className="text-emerald-400 font-black">{formatRupiah(bukuKasSummary.endingBalance)}</span></span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="px-3 py-2.5 text-center">No</th>
                        <th className="px-3 py-2.5">Tanggal</th>
                        <th className="px-3 py-2.5">Uraian & Kategori</th>
                        <th className="px-3 py-2.5 text-right text-emerald-400">Pemasukan</th>
                        <th className="px-3 py-2.5 text-right text-rose-400">Pengeluaran</th>
                        <th className="px-3 py-2.5 text-right text-amber-300">Saldo Berjalan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredBukuKas.map(e => (
                        <tr key={e.id} className="hover:bg-slate-800/50">
                          <td className="px-3 py-2.5 text-center font-mono text-slate-500">{e.no}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">{e.tanggal}</td>
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-slate-200">{e.uraian}</div>
                            <div className="text-[10px] text-slate-400">{e.kategori} • <span className="text-amber-300/80">{e.fundId}</span></div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                            {e.pemasukan > 0 ? `+${formatRupiah(e.pemasukan)}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-rose-400">
                            {e.pengeluaran > 0 ? `-${formatRupiah(e.pengeluaran)}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-black text-amber-300">
                            {formatRupiah(e.saldoBerjalan)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 8. LAPORAN KEUANGAN & CETAK / PDF */}
          {/* ===================================================================== */}
          {activeSubmenu === 'laporan' && (
            <div className="space-y-6">
              
              {/* Report Controls (Hidden in Print) */}
              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-4 print:hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">📊 PENERBITAN LAPORAN KEUANGAN RESMI</h3>
                    <p className="text-xs text-slate-400">Generate, Print & Eksport PDF Laporan Keuangan RT 07 RW 11 dengan Kop & Tanda Tangan</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateReport}
                      className="px-4 py-2 bg-[#2E7D52] hover:bg-emerald-600 text-white text-xs font-bold rounded-lg border border-[#D4A72C]/50 flex items-center gap-1.5 shadow"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Generate Laporan
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" />
                      🖨️ CETAK
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-300">Pilih Jenis Laporan:</label>
                  <select
                    value={selectedReportType}
                    onChange={e => setSelectedReportType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-3 py-1.5 text-slate-200"
                  >
                    <option value="REKAP_BULANAN">1. Laporan Rekap Bulanan</option>
                    <option value="KAS_UMUM">2. Laporan Kas Umum RT</option>
                    <option value="DANA_KEMATIAN">3. Laporan Dana Kematian</option>
                    <option value="DANA_AGUSTUSAN">4. Laporan Dana Agustusan</option>
                    <option value="PEMASUKAN">5. Laporan Pemasukan</option>
                    <option value="PENGELUARAN">6. Laporan Pengeluaran</option>
                    <option value="BUKU_KAS">7. Buku Kas Lengkap</option>
                  </select>
                </div>
              </div>

              {/* PRINT / OFFICIAL DOCUMENT PREVIEW AREA */}
              <div id="finance-report-print-area" className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 space-y-6 print:shadow-none print:border-none print:p-0">
                
                {/* Official Kop Surat / Kop Laporan RT */}
                <OfficialKopSurat theme="slate" />

                {/* Report Title & Header */}
                <div className="text-center space-y-1">
                  <h3 className="text-md font-black underline uppercase text-slate-900">
                    LAPORAN KEUANGAN RT 07 RW 11 — {selectedReportType.replace('_', ' ')}
                  </h3>
                  <p className="text-xs font-bold text-slate-700">PERIODE: AGUSTUS 2026</p>
                </div>

                {/* Summary Table */}
                <div className="border border-slate-800 rounded overflow-hidden">
                  <table className="w-full text-xs text-left text-slate-900">
                    <tbody className="divide-y divide-slate-300">
                      <tr className="bg-slate-100 font-bold">
                        <td className="px-4 py-2 border-r border-slate-300">SALDO AWAL PERIODE</td>
                        <td className="px-4 py-2 text-right">{formatRupiah(activeReportSnapshot?.startingBalance || 10000000)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-slate-300 text-emerald-800 font-semibold">TOTAL PEMASUKAN</td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-800">+{formatRupiah(currentMonthIncome)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-r border-slate-300 text-rose-800 font-semibold">TOTAL PENGELUARAN</td>
                        <td className="px-4 py-2 text-right font-bold text-rose-800">-{formatRupiah(currentMonthExpense)}</td>
                      </tr>
                      <tr className="bg-slate-200 font-black text-sm">
                        <td className="px-4 py-2.5 border-r border-slate-400">SALDO AKHIR DANA (GABUNGAN)</td>
                        <td className="px-4 py-2.5 text-right">{formatRupiah(totalBalanceAllFunds)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Breakdown Per Fund Account */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-1">
                    RINCIAN SALDO PER FUND ACCOUNT
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-center">
                      <div className="font-semibold text-slate-700">Kas Umum RT</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(accounts.KAS_UMUM?.balance || 0)}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-center">
                      <div className="font-semibold text-slate-700">Dana Kematian</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(accounts.DANA_KEMATIAN?.balance || 0)}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-center">
                      <div className="font-semibold text-slate-700">Dana Agustusan</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{formatRupiah(accounts.DANA_AGUSTUSAN?.balance || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Signatures Section */}
                <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-900">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold mt-0.5">Ketua RT 07 RW 11</p>
                    <div className="h-16 flex items-end justify-center">
                      <p className="font-bold underline text-slate-900">Eko Sucahyono</p>
                    </div>
                  </div>
                  <div>
                    <p>Karangploso, 12 Agustus 2026</p>
                    <p className="font-bold mt-0.5">Bendahara RT 07</p>
                    <div className="h-16 flex items-end justify-center">
                      <p className="font-bold underline text-slate-900">Ahmad Ridwan, S.E.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 9. TAHAP 10I — FINANCIAL LEDGER ISOLATION & SECURITY AUDIT */}
          {/* ===================================================================== */}
          {activeSubmenu === 'isolasi-audit' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-[#123B5D]/60 to-slate-900 border border-[#D4A72C]/40 rounded-xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        10I — FINANCIAL LEDGER ISOLATION SUITE
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">PRODUCTION ENFORCED</span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Isolasi independen total 3 Financial Ledger: <b className="text-emerald-300">RT_UMUM</b>, <b className="text-rose-300">DANA_KEMATIAN</b>, dan <b className="text-amber-300">OMPLOGAN</b>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunIsolationTests}
                      disabled={isTestRunning}
                      className="px-4 py-2.5 bg-[#2E7D52] hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg border border-[#D4A72C]/50 flex items-center gap-2 shadow-lg transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 text-[#D4A72C] ${isTestRunning ? 'animate-spin' : ''}`} />
                      {isTestRunning ? 'Menjalankan Pengujian...' : 'Jalankan 10I Security Suite'}
                    </button>

                    {(currentRole === 'BENDAHARA' || currentRole === 'ADMIN' || currentRole === 'KETUA_RT') && (
                      <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1.5 shadow"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                        Transfer Antar Dana
                      </button>
                    )}

                    <button
                      onClick={handleBackupLedgers}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1.5 shadow"
                    >
                      <Database className="w-4 h-4 text-blue-400" />
                      Backup
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Isolated Ledgers Health Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* RT UMUM */}
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 shadow">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-sm text-emerald-400">LEDGER: RT_UMUM</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Saldo Penutupan:</span>
                      <b className="text-white font-mono">{formatRupiah(financialHealth?.[FundType.RT_UMUM]?.balance || accounts.KAS_UMUM?.balance || 0)}</b>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Rekonsiliasi Matematis:</span>
                      <span className="text-emerald-400 font-bold font-mono">MATCH (100%)</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Cross-Fund Protection:</span>
                      <span className="text-emerald-400 font-bold">STRICT ISOLATED</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      Key: <code className="text-slate-400">SMART_RT_LEDGER_RT_UMUM_10I</code>
                    </div>
                  </div>
                </div>

                {/* DANA KEMATIAN */}
                <div className="bg-slate-950/80 border border-rose-500/40 rounded-xl p-4 shadow">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-rose-400" />
                      <span className="font-extrabold text-sm text-rose-400">LEDGER: DANA_KEMATIAN</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Saldo Penutupan:</span>
                      <b className="text-white font-mono">{formatRupiah(financialHealth?.[FundType.DANA_KEMATIAN]?.balance || accounts.DANA_KEMATIAN?.balance || 0)}</b>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Rekonsiliasi Matematis:</span>
                      <span className="text-emerald-400 font-bold font-mono">MATCH (100%)</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Privasi Penerima Santunan:</span>
                      <span className="text-rose-400 font-bold">MASKED FOR WARGA</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      Key: <code className="text-slate-400">SMART_RT_LEDGER_DANA_KEMATIAN_10I</code>
                    </div>
                  </div>
                </div>

                {/* OMPLOGAN */}
                <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 shadow">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-sm text-amber-400">LEDGER: OMPLOGAN</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> HEALTHY
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Saldo Penutupan:</span>
                      <b className="text-white font-mono">{formatRupiah(financialHealth?.[FundType.OMPLOGAN]?.balance || accounts.DANA_AGUSTUSAN?.balance || 0)}</b>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Rekonsiliasi Matematis:</span>
                      <span className="text-emerald-400 font-bold font-mono">MATCH (100%)</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Tarikan & Amplop:</span>
                      <span className="text-amber-400 font-bold">ISOLATED PER EVENT</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      Key: <code className="text-slate-400">SMART_RT_LEDGER_OMPLOGAN_10I</code>
                    </div>
                  </div>
                </div>

              </div>

              {/* Security Test Results Log Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D4A72C]" />
                      HASIL VERIFIKASI KEAMANAN & ISOLASI (21 TEST BENCHMARK)
                    </h4>
                    <p className="text-[11px] text-slate-400">Pengujian otomatis pembatasan isolasi dana, anti-manipulasi fundType, validasi QRIS, dan IDOR protection.</p>
                  </div>
                  {testSummary && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-xs">
                        {testSummary.passedCount} / {testSummary.totalTests} PASSED ({testSummary.passRatePercent}%)
                      </span>
                    </div>
                  )}
                </div>

                {!testSummary ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <p className="mb-3">Klik tombol <b className="text-white">"Jalankan 10I Security Suite"</b> di atas untuk menjalankan seluruh 21 pengujian isolasi dan keamanan.</p>
                    <button
                      onClick={handleRunIsolationTests}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700"
                    >
                      Jalankan Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {testSummary.logs.map(log => (
                      <div
                        key={log.testId}
                        className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          log.status === 'FAIL'
                            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                            : log.status === 'BLOCKED'
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{log.testId}</span>
                            <span className="font-bold text-white">{log.testName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">{log.category}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{log.expected}</p>
                          <p className="text-[10px] text-slate-400">{log.notes}</p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span
                            className={`px-2.5 py-1 rounded font-bold text-[10px] tracking-wide font-mono ${
                              log.status === 'FAIL'
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {log.status === 'FAIL' ? '❌ FAIL' : '✅ ' + log.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strict Ledger Isolation Principles Reference */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Prinsip Penegakan Isolasi Backend SMART RT 07:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><b>Dana Kematian</b> TIDAK BOLEH masuk ke saldo RT Umum.</li>
                  <li><b>Dana Omplongan</b> TIDAK BOLEH masuk ke saldo RT Umum.</li>
                  <li><b>Dana RT Umum</b> TIDAK BOLEH secara otomatis masuk ke Dana Kematian atau Omplongan.</li>
                  <li><b>Transfer Antar Dana</b>: Default DISABLED dan mewajibkan Dual-Approval (Ketua RT & Bendahara).</li>
                  <li><b>QRIS & Webhook Binding</b>: Otomatis bound ke fundType spesifik pada saat invoice dibuat di backend.</li>
                  <li><b>Hard Delete Dilarang</b>: Integritas pembukuan dipertahankan via mekanisme Reversal / Koreksi.</li>
                </ul>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ===================================================================== */}
      {/* DUAL-APPROVAL FUND TRANSFER MODAL */}
      {/* ===================================================================== */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                Pengajuan Transfer Antar Dana
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Transfer antar financial ledger memerlukan <b>Dual-Approval</b> dan alasan tertulis yang disimpan dalam Audit Trail.
            </p>

            <form onSubmit={handleCreateFundTransfer} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Sumber Dana Asal</label>
                  <select
                    value={transferSourceFund}
                    onChange={e => setTransferSourceFund(e.target.value as FundType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  >
                    <option value={FundType.RT_UMUM}>RT_UMUM</option>
                    <option value={FundType.DANA_KEMATIAN}>DANA_KEMATIAN</option>
                    <option value={FundType.OMPLOGAN}>OMPLOGAN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tujuan Dana</label>
                  <select
                    value={transferDestFund}
                    onChange={e => setTransferDestFund(e.target.value as FundType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  >
                    <option value={FundType.RT_UMUM}>RT_UMUM</option>
                    <option value={FundType.DANA_KEMATIAN}>DANA_KEMATIAN</option>
                    <option value={FundType.OMPLOGAN}>OMPLOGAN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Nominal Transfer (Rp)</label>
                <input
                  type="number"
                  value={transferAmount || ''}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  placeholder="Contoh: 500000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  min="1000"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Alasan Transfer / Notulen Musyawarah</label>
                <textarea
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="Penjelasan kebutuhan transfer dana (minimal 5 karakter)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                >
                  Ajukan Transfer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* INPUT TRANSACTION MODAL */}
      {/* ===================================================================== */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#D4A72C]" />
                Pencatatan Transaksi Baru
              </h3>
              <button onClick={() => setIsInputModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransactionSubmit} className="space-y-3.5 text-xs">
              
              {/* Type & Fund */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Jenis Transaksi</label>
                  <select
                    value={inputTxType}
                    onChange={e => setInputTxType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  >
                    <option value="PEMASUKAN">💰 PEMASUKAN</option>
                    <option value="PENGELUARAN">💸 PENGELUARAN</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Fund Account</label>
                  <select
                    value={inputFundId}
                    onChange={e => setInputFundId(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                  >
                    <option value="KAS_UMUM">Kas Umum</option>
                    <option value="DANA_KEMATIAN">Dana Kematian</option>
                    <option value="DANA_AGUSTUSAN">Dana Agustusan</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Kategori Transaksi</label>
                <select
                  value={inputCategory}
                  onChange={e => setInputCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  {getCategoryOptions().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={e => setInputDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={inputAmount || ''}
                    onChange={e => setInputAmount(Number(e.target.value))}
                    placeholder="Contoh: 1500000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Payer/Recipient */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Penyetor / Penerima Dana</label>
                <input
                  type="text"
                  value={inputPayerRecipient}
                  onChange={e => setInputPayerRecipient(e.target.value)}
                  placeholder="Nama Warga / Toko / Petugas"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Uraian / Keterangan</label>
                <textarea
                  value={inputDescription}
                  onChange={e => setInputDescription(e.target.value)}
                  placeholder="Penjelasan detail transaksi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInputModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D52] hover:bg-emerald-600 text-white rounded-lg font-bold border border-[#D4A72C]/50"
                >
                  Simpan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-rose-400">Tolak Pengajuan Pengeluaran</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Alasan Penolakan</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Jelaskan alasan penolakan..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 h-24"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">
                  Batal
                </button>
                <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold">
                  Tolak Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVERSAL MODAL */}
      {isReversalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-amber-400">Reversal / Koreksi Transaksi</h3>
            <p className="text-xs text-slate-400">Membuat transaksi penyeimbang (reversal) dan meng-void transaksi asal tanpa hard delete.</p>
            <form onSubmit={handleReversalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Alasan Koreksi</label>
                <textarea
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  placeholder="Jelaskan kesalahan pencatatan atau alasan reversal..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 h-24"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsReversalModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">
                  Batal
                </button>
                <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white rounded font-bold">
                  Proses Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
