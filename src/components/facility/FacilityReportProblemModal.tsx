// SMART RT 07 RW 11 GPA NGIJO - FACILITY DAMAGE REPORT MODAL v1.0
// Resident-Facing Portal for Reporting Damaged Infrastructure & Facilities

import React, { useState } from 'react';
import { FasilitasLingkungan } from '../../types/facility';
import { X, Send, AlertTriangle, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface FacilityReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: FasilitasLingkungan[];
  selectedFacility: FasilitasLingkungan | null;
  onSubmit: (data: {
    fasilitasId: string;
    namaFasilitas: string;
    jenisMasalah: string;
    deskripsi: string;
    fotoUrl?: string;
    pelaporNama: string;
    pelaporHp?: string;
  }) => Promise<void>;
  currentUserName: string;
  currentUserRole: string;
}

export const FacilityReportProblemModal: React.FC<FacilityReportProblemModalProps> = ({
  isOpen,
  onClose,
  facilities,
  selectedFacility,
  onSubmit,
  currentUserName,
  currentUserRole
}) => {
  const [targetFacilityId, setTargetFacilityId] = useState<string>(
    selectedFacility?.fasilitasId || (facilities.length > 0 ? facilities[0].fasilitasId : '')
  );
  const [jenisMasalah, setJenisMasalah] = useState('Lampu Mati / Padam');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [pelaporNama, setPelaporNama] = useState(currentUserName || 'Warga RT 07');
  const [pelaporHp, setPelaporHp] = useState('081234567890');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentFac = facilities.find((f) => f.fasilitasId === targetFacilityId) || selectedFacility;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskripsi.trim()) {
      setErrorMsg('Harap berikan penjelasan mengenai kerusakan.');
      return;
    }
    if (!pelaporNama.trim()) {
      setErrorMsg('Nama pelapor wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        fasilitasId: targetFacilityId,
        namaFasilitas: currentFac?.namaFasilitas || 'Fasilitas Lingkungan',
        jenisMasalah,
        deskripsi,
        fotoUrl,
        pelaporNama,
        pelaporHp
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-500 text-white">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Laporkan Kerusakan Fasilitas</h3>
              <p className="text-[11px] text-amber-100 mt-0.5">
                Pengaduan langsung ke Pengurus RT 07 RW 11 GPA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-amber-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-800 text-base">Laporan Berhasil Terkirim!</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Terima kasih atas kepedulian Anda. Pengurus RT 07 telah menerima notifikasi dan akan segera menindaklanjuti fasilitas yang dilaporkan.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="bg-[#123B5D] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all hover:bg-[#0A2338]"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Target Facility Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Fasilitas Bermasalah</label>
              <select
                value={targetFacilityId}
                onChange={(e) => setTargetFacilityId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-medium text-slate-800"
              >
                {facilities.map((f) => (
                  <option key={f.fasilitasId} value={f.fasilitasId}>
                    [{f.kodeFasilitas}] {f.namaFasilitas} — {f.lokasi}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Masalah */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gejala / Jenis Kerusakan</label>
              <select
                value={jenisMasalah}
                onChange={(e) => setJenisMasalah(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-medium text-slate-800"
              >
                <option value="Lampu Mati / Padam">Lampu Mati / Padam</option>
                <option value="Saluran Drainase Tersumbat / Banjir">Saluran Drainase Tersumbat / Banjir</option>
                <option value="Paving / Jalan Berlubang & Rusak">Paving / Jalan Berlubang & Rusak</option>
                <option value="Portal / Pagar Keamanan Macet">Portal / Pagar Keamanan Macet</option>
                <option value="Sampah Menumpuk / Rusak">Tempat Sampah Menumpuk / Rusak</option>
                <option value="Kran / Pipa Air Bocor">Kran / Pipa Air Bocor</option>
                <option value="Kamera CCTV Offline / Tidak Jelas">Kamera CCTV Offline / Tidak Jelas</option>
                <option value="Fasilitas Anak / Olahraga Rusak">Fasilitas Anak / Olahraga Rusak</option>
                <option value="Lainnya">Masalah Lainnya</option>
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Keterangan Detail Lokasi & Kerusakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Contoh: Lampu tiang depan rumah Blok B No 8 mati sejak 2 hari lalu, kondisi gelap gulita saat malam..."
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none"
                required
              />
            </div>

            {/* Foto Bukti */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Camera className="w-3 h-3 text-slate-400" /> Foto Bukti Kerusakan (Opsional)
              </label>
              <input
                type="text"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                placeholder="URL foto bukti kondisi fasilitas..."
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>

            {/* Pelapor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pelapor</label>
                <input
                  type="text"
                  value={pelaporNama}
                  onChange={(e) => setPelaporNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={pelaporHp}
                  onChange={(e) => setPelaporHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Kirim Pengaduan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
