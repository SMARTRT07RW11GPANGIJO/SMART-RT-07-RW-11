import React, { useState } from 'react';
import { Pengaduan, KategoriPengaduan } from '../types/rt';
import { X, Send, AlertTriangle, Image as ImageIcon, Ticket } from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPengaduan: (newPengaduan: Pengaduan) => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  onAddPengaduan
}) => {
  const [namaPelapor, setNamaPelapor] = useState('');
  const [noHp, setNoHp] = useState('');
  const [kategori, setKategori] = useState<KategoriPengaduan>('Lampu jalan');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPelapor || !lokasi || !deskripsi) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNo = `ADU-2026-${randomNum}`;

    const newComplaint: Pengaduan = {
      id_pengaduan: `ADU-${Date.now().toString().slice(-4)}`,
      nomor_tiket: ticketNo,
      nama_pelapor: namaPelapor,
      no_hp: noHp || '081234567890',
      kategori,
      lokasi,
      deskripsi,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'BARU'
    };

    onAddPengaduan(newComplaint);
    setSubmittedTicket(ticketNo);
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setNamaPelapor('');
    setNoHp('');
    setLokasi('');
    setDeskripsi('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#C62828] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#D4A72C]" />
            <h3 className="font-bold text-base">Layanan Pengaduan & Aspirasi Warga</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedTicket ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                <Ticket className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Pengaduan Berhasil Dikirim!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Pengaduan Anda telah tercatat pada sistem SMART RT dan diteruskan ke Pengurus terkait.
              </p>
              
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 inline-block">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Nomor Tiket Anda</span>
                <span className="text-xl font-mono font-black text-[#123B5D]">{submittedTicket}</span>
              </div>

              <p className="text-[11px] text-slate-500">
                Gunakan nomor tiket ini untuk melacak status penanganan di portal atau WhatsApp RT.
              </p>

              <button
                onClick={handleReset}
                className="w-full bg-[#123B5D] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#0A2338]"
              >
                Selesai & Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Sampaikan masalah fasilitas lingkungan, keamanan, kebersihan, atau usulan Anda secara langsung.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelapor</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Dahlan (Blok C-10)"
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#C62828] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#C62828] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Keluhan</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#C62828] focus:outline-none"
                  >
                    <option value="Lampu jalan">Lampu Jalan / Penerangan</option>
                    <option value="Kebersihan">Kebersihan & Sampah</option>
                    <option value="Keamanan">Keamanan & Kamtibmas</option>
                    <option value="Jalan">Jalan & Saluran Air</option>
                    <option value="Sosial">Sosial & Fasum</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Detail Kejadian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Depan Pos Kamling Utama Blok C"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#C62828] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Pengaduan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan kondisi atau permasalahan secara detail..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#C62828] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Upload Foto Pendukung (Simulasi)
                </span>
                <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded font-bold">Auto Attachment</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C62828] hover:bg-red-800 shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Pengaduan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
