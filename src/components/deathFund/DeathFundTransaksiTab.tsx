import React, { useState } from 'react';
import { IsolatedFinanceTransaction, formatRupiah } from '../../types/finance';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Calendar,
  Download,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface DeathFundTransaksiTabProps {
  transactions: IsolatedFinanceTransaction[];
  currentRole: string;
}

export const DeathFundTransaksiTab: React.FC<DeathFundTransaksiTabProps> = ({
  transactions,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredList = transactions.filter(tx => {
    if (typeFilter !== 'ALL' && tx.transactionType !== typeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchTx = tx.transactionId.toLowerCase().includes(q);
      const matchPayer = (tx.payerOrRecipient || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchTx && !matchPayer) return false;
    }
    return true;
  });

  const totalIncome = filteredList
    .filter(t => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredList
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" /> Buku Besar Mutasi (Isolated Ledger)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh transaksi kredit dan debit tercatat secara permanen dengan enkapsulasi <code className="text-teal-700 font-bold bg-teal-50 px-1 py-0.5 rounded">FundType.DANA_KEMATIAN</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Immutable Audit Ledger
          </span>
        </div>
      </div>

      {/* Ribbon Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Total Mutasi Transaksi</div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{filteredList.length} Entri</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Diurutkan berdasarkan tanggal</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-emerald-600 font-semibold">Kredit (Pemasukan)</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">+{formatRupiah(totalIncome)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Total arus kas masuk</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-rose-600 font-semibold">Debet (Pengeluaran)</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1">-{formatRupiah(totalExpense)}</div>
          <div className="text-[11px] text-rose-700 mt-0.5">Total arus kas keluar</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan ID, kategori, pihak terkait, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="ALL">Semua Jenis Transaksi ({transactions.length})</option>
            <option value="INCOME">🟢 Mutasi Kredit (Pemasukan)</option>
            <option value="EXPENSE">🔴 Mutasi Debet (Pengeluaran)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">No. Transaksi</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Uraian / Deskripsi</th>
                <th className="p-3.5">Pihak Terkait</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5 text-right">Nominal (Rp)</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan transaksi ledger.
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => {
                  const isIncome = tx.transactionType === 'INCOME';
                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-medium text-slate-600 whitespace-nowrap">{tx.date}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{tx.transactionId}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 max-w-sm">{tx.description}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{tx.payerOrRecipient || '-'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {tx.source || 'BANK'}
                        </span>
                      </td>
                      <td className={`p-3.5 text-right font-extrabold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
