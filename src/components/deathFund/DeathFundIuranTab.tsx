import React, { useState } from 'react';
import { IuranTagihanDK, MetodePembayaranDK, StatusIuranDK, PesertaDanaKematian } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { 
  CreditCard, 
  Search, 
  Filter, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  PlusCircle, 
  Check, 
  X,
  ExternalLink,
  Receipt,
  Download
} from 'lucide-react';

interface DeathFundIuranTabProps {
  invoices: IuranTagihanDK[];
  pesertaList: PesertaDanaKematian[];
  onGenerateMonthly: (bulan: number, tahun: number, nominal: number) => void;
  onPayInvoice: (invoiceId: string, payload: { amount: number; method: MetodePembayaranDK; keterangan?: string }) => void;
  currentRole: string;
}

export const DeathFundIuranTab: React.FC<DeathFundIuranTabProps> = ({
  invoices,
  pesertaList,
  onGenerateMonthly,
  onPayInvoice,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusIuranDK>('ALL');
  const [periodeFilter, setPeriodeFilter] = useState<string>('ALL');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: 2026,
    nominal: 10000
  });

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<IuranTagihanDK | null>(null);
  const [payForm, setPayForm] = useState<{
    amount: number;
    method: MetodePembayaranDK;
    keterangan: string;
  }>({
    amount: 10000,
    method: 'QRIS',
    keterangan: 'Iuran Dana Kematian Warga'
  });

  const [qrModalInvoice, setQrModalInvoice] = useState<IuranTagihanDK | null>(null);

  const canManage = ['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(currentRole);

  const availablePeriods = Array.from(new Set(invoices.map(i => i.periode)));

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (periodeFilter !== 'ALL' && inv.periode !== periodeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = inv.namaKepalaKeluarga.toLowerCase().includes(q);
      const matchInv = inv.invoiceId.toLowerCase().includes(q);
      const matchBlok = `${inv.blokRumah || ''} ${inv.nomorRumah || ''}`.toLowerCase().includes(q);
      if (!matchName && !matchInv && !matchBlok) return false;
    }
    return true;
  });

  const totalTagihan = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalTerbayar = filteredInvoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const lunasCount = filteredInvoices.filter(i => i.status === 'LUNAS').length;

  const handleOpenPay = (inv: IuranTagihanDK) => {
    setSelectedInvoiceToPay(inv);
    setPayForm({
      amount: inv.amount - (inv.paidAmount || 0),
      method: 'QRIS',
      keterangan: `Pembayaran Iuran DK: ${inv.namaKepalaKeluarga} (${inv.periode})`
    });
    setIsPayModalOpen(true);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceToPay) return;

    onPayInvoice(selectedInvoiceToPay.invoiceId, payForm);
    setIsPayModalOpen(false);
    setSelectedInvoiceToPay(null);
  };

  const handleExecuteGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateMonthly(Number(generateForm.bulan), Number(generateForm.tahun), Number(generateForm.nominal));
    setIsGenerateModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" /> Pengelolaan Iuran & Tagihan Dana Kematian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tagihan wajib iuran Rp 10.000 / KK / bulan untuk seluruh peserta aktif warga RT 07.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Generate Iuran Bulanan
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Total Nilai Tagihan</div>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{formatRupiah(totalTagihan)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{filteredInvoices.length} Lembar Tagihan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-emerald-600 font-semibold">Realisasi Pembayaran</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{formatRupiah(totalTerbayar)}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {lunasCount} Lunas ({totalTagihan > 0 ? Math.round((totalTerbayar / totalTagihan) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-rose-600 font-semibold">Sisa Belum Lunas / Tunggakan</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1">{formatRupiah(totalTagihan - totalTerbayar)}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
            {filteredInvoices.length - lunasCount} KK Belum Selesai
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama warga, nomor invoice INV-DK-..., blok rumah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="ALL">Semua Periode ({availablePeriods.length})</option>
            {availablePeriods.map(per => (
              <option key={per} value={per}>{per}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="ALL">Semua Status Bayar</option>
            <option value="LUNAS">🟢 Status: LUNAS</option>
            <option value="BELUM_BAYAR">🟡 Status: BELUM BAYAR</option>
            <option value="MENUNGGAK">🔴 Status: MENUNGGAK</option>
            <option value="SEBAGIAN">🔵 Status: SEBAGIAN</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">No. Invoice</th>
                <th className="p-3.5">Nama Peserta / KK</th>
                <th className="p-3.5">Periode</th>
                <th className="p-3.5 text-right">Tagihan</th>
                <th className="p-3.5 text-right">Terbayar</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5 text-center">Aksi / QRIS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data tagihan iuran.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isLunas = inv.status === 'LUNAS';
                  return (
                    <tr key={inv.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-700">{inv.invoiceId}</div>
                        <div className="text-[10px] text-slate-400">{inv.transactionId || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 text-sm">{inv.namaKepalaKeluarga}</div>
                        <div className="text-[11px] text-slate-500">{inv.blokRumah} No. {inv.nomorRumah}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {inv.periode}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-800">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        {formatRupiah(inv.paidAmount || 0)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLunas
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'MENUNGGAK'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {inv.paymentMethod ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {inv.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isLunas && (
                            <>
                              <button
                                onClick={() => setQrModalInvoice(inv)}
                                className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-all font-bold text-[11px] flex items-center gap-1"
                                title="Buka QRIS Pembayaran"
                              >
                                <QrCode className="w-3.5 h-3.5" /> QRIS
                              </button>
                              {canManage && (
                                <button
                                  onClick={() => handleOpenPay(inv)}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Bayar
                                </button>
                              )}
                            </>
                          )}
                          {isLunas && (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                            </span>
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

      {/* GENERATE MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-teal-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal-300" /> Generate Tagihan Iuran Bulanan
              </h4>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteGenerate} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bulan Periode</label>
                  <select
                    value={generateForm.bulan}
                    onChange={(e) => setGenerateForm({ ...generateForm, bulan: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value={1}>Januari</option>
                    <option value={2}>Februari</option>
                    <option value={3}>Maret</option>
                    <option value={4}>April</option>
                    <option value={5}>Mei</option>
                    <option value={6}>Juni</option>
                    <option value={7}>Juli</option>
                    <option value={8}>Agustus</option>
                    <option value={9}>September</option>
                    <option value={10}>Oktober</option>
                    <option value={11}>November</option>
                    <option value={12}>Desember</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={generateForm.tahun}
                    onChange={(e) => setGenerateForm({ ...generateForm, tahun: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nominal Iuran Per KK (Rp)</label>
                <input
                  type="number"
                  step={1000}
                  value={generateForm.nominal}
                  onChange={(e) => setGenerateForm({ ...generateForm, nominal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-teal-700"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ⚠️ Sistem akan secara otomatis memeriksa peserta dengan status <strong>AKTIF</strong> dan menghindari duplikasi tagihan untuk periode yang sama.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
                >
                  Proses Generate Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QRIS MODAL */}
      {qrModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-teal-400" /> QRIS Tagihan Dana Kematian
              </h4>
              <button onClick={() => setQrModalInvoice(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="font-mono font-bold text-slate-600">{qrModalInvoice.invoiceId}</div>
              <div className="text-sm font-bold text-slate-800">{qrModalInvoice.namaKepalaKeluarga}</div>
              <div className="text-xs text-slate-500">Periode: {qrModalInvoice.periode}</div>

              <div className="p-3 bg-white border-2 border-dashed border-teal-500/50 rounded-2xl flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021226590014ID.LINKAJA.WWW011893600911002133445502150000000000000000303UMI51440014ID.CO.QRIS.WWW0215ID10200000000010303UMI5204599953033605405100005802ID5925KAS%20DANA%20KEMATIAN%20RT076006MALANG61056515262070703A01630489A1`}
                  alt="QRIS Dana Kematian"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <div className="text-xl font-extrabold text-teal-700">
                {formatRupiah(qrModalInvoice.amount - (qrModalInvoice.paidAmount || 0))}
              </div>

              <div className="text-[11px] text-slate-400">
                Scan menggunakan BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, atau DANA.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setQrModalInvoice(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPayModalOpen && selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-300" /> Catat Pembayaran Iuran Warga
              </h4>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Invoice: <span className="font-mono font-bold text-slate-800">{selectedInvoiceToPay.invoiceId}</span></div>
                <div className="text-slate-500 font-medium">Nama: <span className="font-bold text-slate-800">{selectedInvoiceToPay.namaKepalaKeluarga}</span></div>
                <div className="text-slate-500 font-medium">Periode: <span className="font-semibold text-slate-800">{selectedInvoiceToPay.periode}</span></div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nominal yang Dibayarkan (Rp) *</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran *</label>
                <select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="QRIS">QRIS Statis / Dinamis</option>
                  <option value="TRANSFER">Transfer Bank (Bank Jatim Syariah)</option>
                  <option value="TUNAI">Tunai / Cash Langsung ke Pengurus</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan Catatan</label>
                <input
                  type="text"
                  value={payForm.keterangan}
                  onChange={(e) => setPayForm({ ...payForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Konfirmasi Lunas & Masuk Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
