import React, { useState } from 'react';
import { Warga } from '../types/rt';
import { X, UserPlus, CheckCircle } from 'lucide-react';

interface WargaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarga: (warga: Warga) => void;
}

export const WargaFormModal: React.FC<WargaFormModalProps> = ({ isOpen, onClose, onAddWarga }) => {
  const [formData, setFormData] = useState<Omit<Warga, 'id_warga'>>({
    nik: '',
    no_kk: '',
    nama_lengkap: '',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1990-01-01',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'Pegawai Swasta',
    no_hp: '',
    email: '',
    alamat: 'Perum GPA Ngijo Blok C',
    blok: 'Blok C-01',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    keterangan: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap || !formData.nik || !formData.blok) {
      alert('Mohon lengkapi Nama Lengkap, NIK, dan Blok Rumah.');
      return;
    }

    const newWarga: Warga = {
      ...formData,
      id_warga: `WRG-${Date.now().toString().slice(-4)}`
    };

    onAddWarga(newWarga);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tambah Data Warga RT 07</h3>
              <p className="text-xs text-slate-300">Registrasi Kependudukan Terverifikasi Perum GPA Ngijo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                placeholder="misal: Ir. Budi Santoso"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="350712xxxxxxxxxx"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Kartu Keluarga (KK)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="350712xxxxxxxxxx"
                value={formData.no_kk}
                onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Blok Rumah *</label>
              <input
                type="text"
                required
                placeholder="misal: Blok C-09"
                value={formData.blok}
                onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Warga</label>
              <select
                value={formData.status_warga}
                onChange={(e) => setFormData({ ...formData, status_warga: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              >
                <option value="Tetap">Tetap (Pemilik)</option>
                <option value="Kontrak">Kontrak / Sewa</option>
                <option value="Kos">Kos</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                placeholder="081234567890"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pekerjaan</label>
              <input
                type="text"
                placeholder="Wiraswasta / Pegawai / PNS"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
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
              <CheckCircle className="w-4 h-4" /> Simpan Data Warga
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
