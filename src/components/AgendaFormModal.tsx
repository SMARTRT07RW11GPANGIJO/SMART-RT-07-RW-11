import React, { useState } from 'react';
import { AgendaKegiatan } from '../types/rt';
import { X, Calendar, CheckCircle } from 'lucide-react';

interface AgendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgenda: (agenda: AgendaKegiatan) => void;
}

export const AgendaFormModal: React.FC<AgendaFormModalProps> = ({
  isOpen,
  onClose,
  onAddAgenda
}) => {
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jam, setJam] = useState('19:30 - Selesai');
  const [lokasi, setLokasi] = useState('Pos Kamling / Balai Warga RT 07');
  const [deskripsi, setDeskripsi] = useState('');
  const [penanggung_jawab, setPic] = useState('Ketua RT 07');
  const [kategori, setKategori] = useState('Rapat RT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !tanggal || !lokasi) {
      alert('Mohon isi Judul, Tanggal, dan Lokasi Kegiatan.');
      return;
    }

    const newAgd: AgendaKegiatan = {
      id_agenda: `AGD-${Date.now().toString().slice(-4)}`,
      judul,
      tanggal,
      jam,
      lokasi,
      deskripsi,
      penanggung_jawab,
      kategori
    };

    onAddAgenda(newAgd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tambah Agenda Kegiatan RT 07</h3>
              <p className="text-xs text-slate-300">Jadwal kegiatan gotong royong, rapat, dan posyandu</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Agenda / Kegiatan *</label>
            <input
              type="text"
              required
              placeholder="misal: Kerja Bakti Massal Pengecatan Gapura"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Pelaksanaan</label>
              <input
                type="text"
                placeholder="06:30 - 09:00 WIB"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Pelaksanaan *</label>
            <input
              type="text"
              required
              placeholder="Lapangan Serbaguna RT 07"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kategori Agenda</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            >
              <option value="Gotong Royong">Gotong Royong & Kerja Bakti</option>
              <option value="Rapat RT">Rapat Rutin RT</option>
              <option value="Kegiatan Sosial">Kegiatan Sosial & Keagamaan</option>
              <option value="Posyandu">Posyandu & Kesehatan</option>
              <option value="Olahraga">Olahraga & Senam</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi Kegiatan</label>
            <textarea
              rows={3}
              placeholder="Rincian acara atau perlengkapan yang perlu dibawa warga..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
            <input
              type="text"
              value={penanggung_jawab}
              onChange={(e) => setPic(e.target.value)}
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
              <CheckCircle className="w-4 h-4" /> Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
