import React, { useState } from 'react';
import { SantunanDK, StatusSantunanDK, MetodePembayaranDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  PlusCircle, 
  FileText, 
  User, 
  ShieldCheck, 
  X,
  CreditCard,
  Receipt,
  Download,
  Eye
} from 'lucide-react';

interface DeathFundSantunanTabProps {
  santunanList: SantunanDK[];
  currentBalance: number;
  onApproveSantunan: (idSantunan: string) => void;
  onPaySantunan: (idSantunan: string, payload: { metode: MetodePembayaranDK; buktiBayarUrl?: string }) => void;
  currentRole: string;
}

export const DeathFundSantunanTab: React.FC<DeathFundSantunanTabProps> = ({
  santunanList,
  currentBalance,
  onApproveSantunan,
  onPaySantunan,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusSantunanDK>('ALL');

  // Modal
  const [selectedSantunan, setSelectedSantunan] = useState<SantunanDK | null>(null);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disburseTarget, setDisburseTarget] = useState<SantunanDK | null>(null);
  const [disburseForm, setDisburseForm] = useState<{
    metode: MetodePembayaranDK;
    buktiBayarUrl: string;
  }>({
    metode: 'TRANSFER',
    buktiBayarUrl: ''
  });

  const canApprove = ['KETUA_RT', 'ADMIN'].includes(currentRole);
  const canDisburse = ['BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const filteredList = santunanList.filter(item => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchPenerima = item.namaPenerima.toLowerCase().includes(q);
      const matchId = item.idSantunan.toLowerCase().includes(q);
      const matchKej = item.idKejadian.toLowerCase().includes(q);
      if (!matchPenerima && !matchId && !matchKej) return false;
    }
    return true;
  });

  const totalDisbursed = santunanList
    .filter(s => s.status === 'DIBAYARKAN')
    .reduce((sum, s) => sum + s.nominal, 0);

  const handleOpenDisburse = (s: SantunanDK) => {
    setDisburseTarget(s);
    setDisburseForm({
      metode: 'TRANSFER',
      buktiBayarUrl: ''
    });
    setIsDisburseModalOpen(true);
  };

  const handleConfirmDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseTarget) return;

    onPaySantunan(disburseTarget.idSantunan, disburseForm);
    setIsDisburseModalOpen(false);
    setDisburseTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" /> Penyaluran Santunan Sosial Duka Cita
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Alur persetujuan bertingkat Ketua RT dan pencairan resmi Bendahara untuk meringankan beban keluarga duka cita.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            Total Disalurkan: {formatRupiah(totalDisbursed)}
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama penerima santunan / ahli waris, ID berkas SAN-DK-..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="ALL">Semua Status Santunan</option>
            <option value="DIAJUKAN">🟡 Status: DIAJUKAN (Draft)</option>
            <option value="DISETUJUI">🔵 Status: DISETUJUI KETUA RT</option>
            <option value="DIBAYARKAN">🟢 Status: DIBAYARKAN (Lunas)</option>
            <option value="DITOLAK">🔴 Status: DITOLAK</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID Santunan</th>
                <th className="p-3.5">Nama Penerima / Ahli Waris</th>
                <th className="p-3.5">Jenis Bantuan</th>
                <th className="p-3.5 text-right">Nominal (Rp)</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi / Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan berkas santunan.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  return (
                    <tr key={item.idSantunan} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-700">{item.idSantunan}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.idKejadian}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.namaPenerima}</div>
                        <div className="text-[11px] text-slate-500">{item.hubunganPenerima}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {item.jenisBantuan}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-rose-600 whitespace-nowrap">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {item.tanggal}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'DIBAYARKAN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'DISETUJUI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.status === 'DITOLAK'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSantunan(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>

                          {canApprove && item.status === 'DIAJUKAN' && (
                            <button
                              onClick={() => onApproveSantunan(item.idSantunan)}
                              className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow"
                              title="Persetujuan Ketua RT"
                            >
                              <ShieldCheck className="w-3 h-3" /> Setujui
                            </button>
                          )}

                          {canDisburse && item.status === 'DISETUJUI' && (
                            <button
                              onClick={() => handleOpenDisburse(item)}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow"
                              title="Pencairan Kas Bendahara"
                            >
                              <CreditCard className="w-3 h-3" /> Cairkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSantunan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" /> Detail Berkas Santunan Duka
              </h4>
              <button onClick={() => setSelectedSantunan(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <div className="text-slate-400 text-[10px]">Nomor Berkas</div>
                  <div className="font-mono font-bold text-slate-800">{selectedSantunan.idSantunan}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Penerima / Ahli Waris</div>
                  <div className="text-base font-bold text-slate-900">{selectedSantunan.namaPenerima} ({selectedSantunan.hubunganPenerima})</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate-400 text-[10px]">Nominal Santunan</div>
                    <div className="text-sm font-extrabold text-rose-600">{formatRupiah(selectedSantunan.nominal)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Status</div>
                    <div className="font-bold text-emerald-600">{selectedSantunan.status}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-slate-600">
                <div>• Disetujui Oleh: <strong>{selectedSantunan.disetujuiOleh || 'Menunggu Ketua RT'}</strong></div>
                <div>• Dibayarkan Oleh: <strong>{selectedSantunan.dibayarkanOleh || 'Menunggu Bendahara'}</strong></div>
                {selectedSantunan.metodeBayar && (
                  <div>• Metode Bayar: <strong>{selectedSantunan.metodeBayar}</strong></div>
                )}
                <div>• Keterangan: {selectedSantunan.keterangan || '-'}</div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSantunan(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISBURSEMENT MODAL */}
      {isDisburseModalOpen && disburseTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-rose-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-300" /> Pencairan Kas Santunan Duka Cita
              </h4>
              <button onClick={() => setIsDisburseModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDisburse} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1 text-rose-900">
                <div className="font-semibold">Penerima: <strong>{disburseTarget.namaPenerima}</strong></div>
                <div className="font-semibold">Bantuan: <strong>{disburseTarget.jenisBantuan}</strong></div>
                <div className="text-base font-extrabold text-rose-700 mt-1">
                  Nominal: {formatRupiah(disburseTarget.nominal)}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran *</label>
                <select
                  value={disburseForm.metode}
                  onChange={(e) => setDisburseForm({ ...disburseForm, metode: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value="TRANSFER">Transfer Bank (Bank Jatim Syariah / Rekening Warga)</option>
                  <option value="TUNAI">Tunai / Cash Langsung kepada Ahli Waris</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                ℹ️ Saldo kas saat ini: <strong>{formatRupiah(currentBalance)}</strong>. Pengeluaran ini akan secara otomatis dicatat ke buku pengeluaran dan isolated ledger Dana Kematian.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Penyerahan Santunan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
