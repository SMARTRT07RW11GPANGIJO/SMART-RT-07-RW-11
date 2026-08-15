import React, { useState } from 'react';
import { PemasukanDK, KategoriPemasukanDK, MetodePembayaranDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  TrendingUp, 
  Search, 
  PlusCircle, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Download, 
  X, 
  Receipt,
  FileText
} from 'lucide-react';

interface DeathFundPemasukanTabProps {
  pemasukanList: PemasukanDK[];
  onAddPemasukan: (payload: any) => void;
  currentRole: string;
}

export const DeathFundPemasukanTab: React.FC<DeathFundPemasukanTabProps> = ({
  pemasukanList,
  onAddPemasukan,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    sumber: '',
    kategori: 'Iuran Warga' as KategoriPemasukanDK,
    nominal: 50000,
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
    metode: 'TRANSFER' as MetodePembayaranDK,
    buktiUrl: ''
  });

  const canManage = ['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const filteredList = pemasukanList.filter(item => {
    if (kategoriFilter !== 'ALL' && item.kategori !== kategoriFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchSumber = item.sumber.toLowerCase().includes(q);
      const matchKet = (item.keterangan || '').toLowerCase().includes(q);
      const matchTx = item.nomorTransaksi.toLowerCase().includes(q);
      if (!matchSumber && !matchKet && !matchTx) return false;
    }
    return true;
  });

  const totalNominal = filteredList.reduce((sum, item) => sum + item.nominal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sumber.trim() || form.nominal <= 0) return;

    onAddPemasukan(form);
    setIsAddModalOpen(false);
    setForm({
      sumber: '',
      kategori: 'Iuran Warga',
      nominal: 50000,
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: '',
      metode: 'TRANSFER',
      buktiUrl: ''
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Buku Pemasukan Kas Dana Kematian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan mutasi kredit, iuran bulanan, donasi hamba Allah, subsidi kas umum, dan dana sosial duka.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Catat Pemasukan Baru
          </button>
        )}
      </div>

      {/* Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <div className="text-xs text-emerald-700 font-semibold">Total Pemasukan Tercatat</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{formatRupiah(totalNominal)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{filteredList.length} Transaksi Pemasukan</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-semibold">Kategori Terbesar</div>
          <div className="text-lg font-bold text-slate-800 mt-1">Iuran Warga RT 07</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Iuran rutin bulanan 45 KK</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-semibold">Integrasi Buku Besar</div>
          <div className="text-sm font-bold text-teal-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> Otomatis ke Isolated Ledger
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">FundType.DANA_KEMATIAN</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari sumber dana, nomor transaksi TX-..., atau uraian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="ALL">Semua Kategori Pemasukan</option>
            <option value="Iuran Warga">Iuran Warga</option>
            <option value="Donasi / Infaq Warga">Donasi / Infaq Warga</option>
            <option value="Bantuan Kas RT">Bantuan Kas RT</option>
            <option value="Jasa Giro / Bagi Hasil Bank">Jasa Giro / Bagi Hasil Bank</option>
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
                <th className="p-3.5">Sumber Dana</th>
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
                    Belum ada data pemasukan pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-medium text-slate-600 whitespace-nowrap">{item.tanggal}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">{item.nomorTransaksi}</td>
                    <td className="p-3.5 font-bold text-slate-800">{item.sumber}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs">{item.keterangan}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.metode}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                      + {formatRupiah(item.nominal)}
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

      {/* ADD PEMASUKAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-300" /> Catat Pemasukan Kas Dana Kematian
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sumber Dana / Pembayar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hamba Allah / Donatur Warga Blok B"
                  value={form.sumber}
                  onChange={(e) => setForm({ ...form, sumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Pemasukan</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Donasi / Infaq Warga">Donasi / Infaq Warga</option>
                    <option value="Bantuan Kas RT">Bantuan Kas RT</option>
                    <option value="Jasa Giro / Bagi Hasil Bank">Jasa Giro / Bagi Hasil Bank</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    step={5000}
                    required
                    value={form.nominal}
                    onChange={(e) => setForm({ ...form, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Metode Penerimaan</label>
                  <select
                    value={form.metode}
                    onChange={(e) => setForm({ ...form, metode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
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
                  placeholder="Keterangan rincian penerimaan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <Receipt className="w-3.5 h-3.5" /> Simpan Pemasukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
