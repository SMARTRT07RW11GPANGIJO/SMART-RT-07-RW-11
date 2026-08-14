import React from 'react';
import { DashboardStatsDK, StatusPesertaDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  HeartHandshake, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface DeathFundDashboardTabProps {
  stats: DashboardStatsDK;
  onNavigateTab: (tab: any) => void;
  openNewPemasukan: () => void;
  openNewPengeluaran: () => void;
  openReportKejadian: () => void;
  openGenerateIuran: () => void;
  recentTransactions: any[];
}

export const DeathFundDashboardTab: React.FC<DeathFundDashboardTabProps> = ({
  stats,
  onNavigateTab,
  openNewPemasukan,
  openNewPengeluaran,
  openReportKejadian,
  openGenerateIuran,
  recentTransactions
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#123B5D] to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-teal-500/30">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> FUND ISOLATION: DANA KEMATIAN
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                RT 07 RW 11 GPA NGIJO
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              🕊️ Dana Kematian & Sosial Duka
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Sistem kas sosial dan santunan duka cita mandiri warga RT 07 RW 11 GPA Ngijo dengan tata kelola transparan, verifikasi akurat, dan rekonsiliasi berkala.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openNewPemasukan}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" /> Pemasukan
            </button>
            <button
              onClick={openNewPengeluaran}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" /> Pengeluaran
            </button>
            <button
              onClick={openReportKejadian}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-1.5 shadow"
            >
              🕯️ Lapor Duka
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Kas Tersedia</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">
              {formatRupiah(stats.saldoTotal)}
            </div>
            <div className="text-xs text-teal-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Real-Time Ledger Terisolasi
            </div>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pemasukan</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-600">
              {formatRupiah(stats.totalPemasukan)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Iuran peserta, donasi & bantuan
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran / Santunan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600">
              {formatRupiah(stats.totalPengeluaran)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Santunan ({formatRupiah(stats.totalSantunanTersalurkan)}) & duka
            </div>
          </div>
        </div>

        {/* Card 4: Kepesertaan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Peserta Terdaftar</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">
              {stats.totalPesertaAktif} <span className="text-sm font-medium text-slate-500">/ {stats.totalPesertaKK} KK</span>
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-1">
              {stats.totalPesertaAktif} KK Status Aktif
            </div>
          </div>
        </div>
      </div>

      {/* Progress Iuran & Kejadian Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Iuran Bulan Berjalan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Iuran Bulan Berjalan (Agustus 2026)
              </h3>
              <button
                onClick={openGenerateIuran}
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                + Generate Tagihan
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Realisasi Terkumpul:</span>
                <span className="font-bold text-emerald-600">{formatRupiah(stats.iuranBulanIniTerkumpul)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (stats.iuranBulanIniTerkumpul / (stats.iuranBulanIniTarget || 1)) * 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="font-bold text-emerald-700 text-lg">{stats.jumlahSudahBayarBulanIni} KK</div>
                  <div className="text-slate-500">Sudah Lunas</div>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="font-bold text-amber-700 text-lg">{stats.jumlahBelumBayarBulanIni} KK</div>
                  <div className="text-slate-500">Belum Bayar</div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('iuran')}
            className="w-full mt-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Kelola Iuran & Tagihan →
          </button>
        </div>

        {/* Santunan & Kejadian Duka */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-600" /> Ringkasan Kejadian & Santunan
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-900 text-xs">
                <div className="font-bold">Kejadian Tahun 2026: {stats.jumlahKejadianTahunIni} Kasus</div>
                <div className="mt-1 text-slate-600">Total Santunan Disalurkan: <strong>{formatRupiah(stats.totalSantunanTersalurkan)}</strong></div>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div>• Standar santunan warga aktif: <strong>Rp 2.000.000</strong></div>
                <div>• Bantuan pemakaman & logistik: <strong>Rp 500.000</strong></div>
                <div>• Disetujui resmi oleh Ketua RT & disalurkan oleh Bendahara.</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onNavigateTab('kejadian')}
              className="py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              🕯️ Kejadian Kematian
            </button>
            <button
              onClick={() => onNavigateTab('santunan')}
              className="py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all"
            >
              🤝 Kelola Santunan
            </button>
          </div>
        </div>

        {/* Info Rekonsiliasi & Keamanan */}
        <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Keamanan & Rekonsiliasi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh transaksi Dana Kematian terisolasi penuh pada ledger <code className="text-teal-700 font-bold bg-teal-100 px-1 py-0.5 rounded">FundType.DANA_KEMATIAN</code> dan tidak dapat diakses atau dimanipulasi dari kas RT umum.
            </p>
            <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">Rekening Kas Dana Kematian:</div>
              <div>Bank Jatim Syariah • 014-209-8877</div>
              <div className="text-[11px] text-slate-400">a.n Kas Dana Kematian RT 07 GPA Ngijo</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onNavigateTab('rekonsiliasi')}
              className="py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              🔄 Rekonsiliasi
            </button>
            <button
              onClick={() => onNavigateTab('laporan')}
              className="py-2 text-xs font-bold text-teal-700 bg-teal-600 text-white hover:bg-teal-500 rounded-xl transition-all"
            >
              📊 Cetak Laporan
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Mutasi Transaksi Terkini</h3>
            <p className="text-xs text-slate-500">Transaksional terbaru kas dana kematian RT 07 RW 11</p>
          </div>
          <button
            onClick={() => onNavigateTab('transaksi')}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Lihat Semua Transaksi ({recentTransactions.length}) →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada transaksi Dana Kematian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">No. Transaksi</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Uraian / Keterangan</th>
                  <th className="p-3">Pihak Terkait</th>
                  <th className="p-3 text-right">Nominal</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.slice(0, 5).map((tx, idx) => {
                  const isIncome = tx.transactionType === 'INCOME' || tx.type === 'PEMASUKAN';
                  return (
                    <tr key={tx.transactionId || tx.id || idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-medium text-slate-600">{tx.date}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">{tx.transactionId || tx.id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 max-w-xs truncate">{tx.description}</td>
                      <td className="p-3 text-slate-600">{tx.payerOrRecipient || '-'}</td>
                      <td className={`p-3 text-right font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {tx.status || 'APPROVED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
