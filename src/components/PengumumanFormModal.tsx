import React, { useState } from 'react';
import { Pengumuman, KategoriPengumuman } from '../types/rt';
import { X, Megaphone, CheckCircle } from 'lucide-react';

interface PengumumanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPengumuman: (pgm: Pengumuman) => void;
}

export const PengumumanFormModal: React.FC<PengumumanFormModalProps> = ({
  isOpen,
  onClose,
  onAddPengumuman
}) => {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [kategori, setKategori] = useState<KategoriPengumuman>('Kegiatan');
  const [penulis, setPenulis] = useState('Pengurus RT 07');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isi) {
      alert('Mohon lengkapi Judul dan Isi Pengumuman.');
      return;
    }

    const newPgm: Pengumuman = {
      id_pengumuman: `PGM-${Date.now().toString().slice(-4)}`,
      judul,
      isi,
      tanggal: new Date().toISOString().split('T')[0],
      kategori,
      status: 'PUBLISHED',
      penulis
    };

    onAddPengumuman(newPgm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Buat Pengumuman / Broadcast RT</h3>
              <p className="text-xs text-slate-300">Publikasi informasi resmi ke seluruh warga RT 07</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman *</label>
            <input
              type="text"
              required
              placeholder="misal: Himbauan Kebersihan & Pemasangan Bendera HUT RI"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori Pengumuman</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            >
              <option value="Kegiatan">Kegiatan Warga</option>
              <option value="Pengumuman">Pengumuman Umum</option>
              <option value="Keamanan">Keamanan & Ketertiban</option>
              <option value="Lingkungan">Lingkungan & Kebersihan</option>
              <option value="Sosial">Sosial & Posyandu</option>
              <option value="Administrasi">Administrasi RT</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Isi Pengumuman Lengkap *</label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan rincian pengumuman di sini..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Penulis / Pengirim</label>
            <input
              type="text"
              value={penulis}
              onChange={(e) => setPenulis(e.target.value)}
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
              <CheckCircle className="w-4 h-4" /> Publikasikan Pengumuman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
