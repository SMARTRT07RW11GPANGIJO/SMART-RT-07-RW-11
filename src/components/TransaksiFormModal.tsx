import React, { useState } from 'react';
import { TransaksiKeuangan } from '../types/rt';
import { X, Wallet, CheckCircle } from 'lucide-react';

interface TransaksiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaksi: (trx: TransaksiKeuangan) => void;
  currentSaldo: number;
}

export const TransaksiFormModal: React.FC<TransaksiFormModalProps> = ({
  isOpen,
  onClose,
  onAddTransaksi,
  currentSaldo
}) => {
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kategori, setKategori] = useState<TransaksiKeuangan['kategori']>('Iuran Warga');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState<number>(50000);
  const [petugas, setPetugas] = useState('Bendahara RT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan || nominal <= 0) {
      alert('Mohon isi keterangan dan nominal yang valid.');
      return;
    }

    const pem = jenis === 'Pemasukan' ? nominal : 0;
    const peng = jenis === 'Pengeluaran' ? nominal : 0;
    const nextSaldo = currentSaldo + pem - peng;

    const newTrx: TransaksiKeuangan = {
      id_transaksi: `TRX-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().split('T')[0],
      jenis,
      kategori,
      keterangan,
      pemasukan: pem,
      pengeluaran: peng,
      saldo_berjalan: nextSaldo,
      petugas
    };

    onAddTransaksi(newTrx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Catat Transaksi Kas RT</h3>
              <p className="text-xs text-slate-300">Pencatatan Transparan Pemasukan & Pengeluaran</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJenis('Pemasukan')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  jenis === 'Pemasukan' ? 'bg-[#2E7D52] text-white border-[#2E7D52]' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                + Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setJenis('Pengeluaran')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  jenis === 'Pengeluaran' ? 'bg-[#C62828] text-white border-[#C62828]' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                - Pengeluaran
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori Transaksi</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            >
              <option value="Iuran Warga">Iuran Warga</option>
              <option value="Sumbangan">Sumbangan / Donasi</option>
              <option value="Kerja Bakti">Kerja Bakti</option>
              <option value="Keamanan">Keamanan & Pos Kamling</option>
              <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
              <option value="Perbaikan Infrastruktur">Perbaikan Infrastruktur</option>
              <option value="Acara / Sosial">Acara / Kegiatan Sosial</option>
              <option value="Kas RT">Lain-lain / Operasional Kas</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal (Rupiah) *</label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={nominal}
              onChange={(e) => setNominal(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rincian & Keterangan *</label>
            <textarea
              required
              rows={3}
              placeholder="misal: Pembelian 3 lampu jalan LED Blok C"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Petugas / Penanggung Jawab</label>
            <input
              type="text"
              value={petugas}
              onChange={(e) => setPetugas(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#2E7D52] hover:bg-[#236340] shadow flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
