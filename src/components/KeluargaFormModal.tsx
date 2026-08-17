import React, { useState } from 'react';
import { Keluarga } from '../types/rt';
import { X, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { ResidentFamilyService } from '../services/residentFamilyService';

interface KeluargaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKeluarga: (kk: Keluarga) => void;
}

export const KeluargaFormModal: React.FC<KeluargaFormModalProps> = ({
  isOpen,
  onClose,
  onAddKeluarga
}) => {
  const [no_kk, setNoKk] = useState('');
  const [nama_kepala_keluarga, setNamaKepala] = useState('');
  const [blok, setBlok] = useState('Blok C-01');
  const [jumlah_anggota, setJumlahAnggota] = useState(3);
  const [status_rumah, setStatusRumah] = useState<'Milik Sendiri' | 'Sewa / Kontrak' | 'Rumah Dinas'>('Milik Sendiri');
  const [no_hp, setNoHp] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanKK = no_kk.replace(/\D/g, '');
    const partialKK: Partial<Keluarga> = {
      no_kk: cleanKK,
      nomorKK: cleanKK,
      nama_kepala_keluarga,
      blok,
      jumlah_anggota,
      status_rumah,
      no_hp,
      keterangan
    };

    const validation = ResidentFamilyService.validateKeluarga(partialKK);
    if (!validation.valid) {
      setValidationError(validation.error || 'Data Kartu Keluarga tidak valid.');
      return;
    }

    const newKkId = `KK-${Date.now().toString().slice(-4)}`;
    const newKeluarga: Keluarga = {
      id_kk: newKkId,
      keluargaId: newKkId,
      no_kk: cleanKK,
      nomorKK: cleanKK,
      nama_kepala_keluarga,
      alamat: `Perum GPA Ngijo ${blok}`,
      blok,
      jumlah_anggota,
      status_rumah,
      statusKeluarga: 'AKTIF',
      no_hp,
      keterangan: keterangan || 'Terdaftar Aktif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddKeluarga(newKeluarga);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Tambah Kartu Keluarga (KK)</h3>
                <span className="bg-[#2E7D52] text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Data KK v1.1
                </span>
              </div>
              <p className="text-xs text-slate-300">Pendataan Kepala Keluarga & Basis Iuran RT 07 RW 11</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Validasi KK Gagal</span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (16 Digit Angka) *</label>
            <input
              type="text"
              required
              maxLength={16}
              placeholder="350712xxxxxxxxxx"
              value={no_kk}
              onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Kepala Keluarga (Sesuai KK) *</label>
            <input
              type="text"
              required
              placeholder="misal: Bambang Sugianto, S.T."
              value={nama_kepala_keluarga}
              onChange={(e) => setNamaKepala(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Blok Rumah *</label>
              <input
                type="text"
                required
                placeholder="Blok C-01"
                value={blok}
                onChange={(e) => setBlok(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Anggota Keluarga</label>
              <input
                type="number"
                min={1}
                max={15}
                value={jumlah_anggota}
                onChange={(e) => setJumlahAnggota(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Kepemilikan Rumah</label>
            <select
              value={status_rumah}
              onChange={(e) => setStatusRumah(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            >
              <option value="Milik Sendiri">Milik Sendiri</option>
              <option value="Sewa / Kontrak">Sewa / Kontrak</option>
              <option value="Rumah Dinas">Rumah Dinas</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Kepala Keluarga</label>
            <input
              type="text"
              placeholder="081234567890"
              value={no_hp}
              onChange={(e) => setNoHp(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
            <input
              type="text"
              placeholder="misal: Masa sewa s/d Des 2026 / Pemilik aktif"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Wajib 16 digit & valid
            </span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#2E7D52] hover:bg-[#236340] shadow-sm flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Simpan Kartu Keluarga
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
