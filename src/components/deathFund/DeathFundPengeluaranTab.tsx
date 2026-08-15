import React, { useState } from 'react';
import { PengeluaranDK, KategoriPengeluaranDK, MetodePembayaranDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  TrendingDown, 
  Search, 
  PlusCircle, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Receipt,
  FileText
} from 'lucide-react';

interface DeathFundPengeluaranTabProps {
  pengeluaranList: PengeluaranDK[];
  currentBalance: number;
  onAddPengeluaran: (payload: any) => void;
  currentRole: string;
}

export const DeathFundPengeluaranTab: React.FC<DeathFundPengeluaranTabProps> = ({
  pengeluaranList,
  currentBalance,
  onAddPengeluaran,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    penerima: '',
    kategori: 'Santunan' as KategoriPengeluaranDK,
    nominal: 1000000,
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
    metode: 'TRANSFER' as MetodePembayaranDK,
    buktiUrl: '',
    overrideReason: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  const canManage = ['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const filteredList = pengeluaranList.filter(item => {
    if (kategoriFilter !== 'ALL' && item.kategori !== kategoriFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchPenerima = item.penerima.toLowerCase().includes(q);
      const matchKet = (item.keterangan || '').toLowerCase().includes(q);
      const matchTx = item.nomorTransaksi.toLowerCase().includes(q);
      if (!matchPenerima && !matchKet && !matchTx) return false;
    }
    return true;
  });

  const totalNominal = filteredList.reduce((sum, item) => sum + item.nominal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.penerima.trim() || form.nominal <= 0) return;

    if (form.nominal > currentBalance && !['KETUA_RT', 'ADMIN'].includes(currentRole)) {
      setErrorMessage(`⚠️ Saldo Kas Dana Kematian (${formatRupiah(currentBalance)}) tidak mencukupi untuk pengeluaran ${formatRupiah(form.nominal)}.`);
      return;
    }

    try {
      onAddPengeluaran(form);
      setIsAddModalOpen(false);
      setForm({
        penerima: '',
        kategori: 'Santunan',
        nominal: 1000000,
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: '',
        metode: 'TRANSFER',
        buktiUrl: '',
        overrideReason: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengeluaran.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" /> Buku Pengeluaran Kas Dana Kematian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan mutasi debet kas duka, santunan ahli waris, bantuan logistik pemakaman, dan karangan bunga duka.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setErrorMessage('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Catat Pengeluaran Baru
          </button>
        )}
      </div>

      {/* Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
          <div className="text-xs text-rose-700 font-semibold">Total Pengeluaran Tercatat</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{formatRupiah(totalNominal)}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">{filteredList.length} Transaksi Pengeluaran</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-semibold">Saldo Kas Saat Ini</div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{formatRupiah(currentBalance)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Batas maksimum pencairan dana</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-semibold">Perlindungan Saldo</div>
          <div className="text-xs font-bold text-teal-700 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-teal-600" /> Strict Balance Guard Active
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mencegah saldo kas minus</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama penerima, nomor transaksi, atau uraian pengeluaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="ALL">Semua Kategori Pengeluaran</option>
            <option value="Santunan">Santunan</option>
            <option value="Bantuan Pemakaman">Bantuan Pemakaman</option>
            <option value="Karangan Bunga Duka">Karangan Bunga Duka</option>
            <option value="Administrasi / Operasional Kas">Administrasi / Operasional Kas</option>
            <option value="Lain-lain">Lain-lain</option>
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
                <th className="p-3.5">Penerima Dana</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Keterangan / Uraian</th>
                <th className="p-3.5 text-center">Metode</th>
                <th className="p-3.5 text-right">Nominal (Rp)</th>
                <th className="p-3.5 text-center">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Belum ada data pengeluaran pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-medium text-slate-600 whitespace-nowrap">{item.tanggal}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">{item.nomorTransaksi}</td>
                    <td className="p-3.5 font-bold text-slate-800">{item.penerima}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs">{item.keterangan}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.metode}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600 whitespace-nowrap">
                      - {formatRupiah(item.nominal)}
                    </td>
                    <td className="p-3.5 text-center text-slate-500 font-medium">
                      {item.petugas}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PENGELUARAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-rose-800 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-rose-300" /> Catat Pengeluaran Kas Dana Kematian
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Penerima Dana / Ahli Waris *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahli Waris Alm. Bpk Hendro / Bpk Sigit"
                  value={form.penerima}
                  onChange={(e) => setForm({ ...form, penerima: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Pengeluaran</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Santunan">Santunan Duka</option>
                    <option value="Bantuan Pemakaman">Bantuan Pemakaman</option>
                    <option value="Karangan Bunga Duka">Karangan Bunga Duka</option>
                    <option value="Administrasi / Operasional Kas">Administrasi / Operasional Kas</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    step={10000}
                    required
                    value={form.nominal}
                    onChange={(e) => setForm({ ...form, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-rose-700 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran</label>
                  <select
                    value={form.metode}
                    onChange={(e) => setForm({ ...form, metode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="TRANSFER">Transfer Rekening</option>
                    <option value="TUNAI">Tunai / Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Uraian Transaksi</label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Keterangan rincian penyaluran santunan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {form.nominal > currentBalance && ['KETUA_RT', 'ADMIN'].includes(currentRole) && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-1">
                  <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Otorisasi Khusus Ketua RT: Saldo Kas Defisit
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Alasan darurat persetujuan override kas defisit..."
                    value={form.overrideReason}
                    onChange={(e) => setForm({ ...form, overrideReason: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-amber-400 bg-white rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Receipt className="w-3.5 h-3.5" /> Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
