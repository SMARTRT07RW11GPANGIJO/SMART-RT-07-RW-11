// SMART RT 07 RW 11 GPA NGIJO - FACILITY INSPECTION MODAL v1.0
// Form for Recording On-Site Physical Inspection & Health State Changes

import React, { useState } from 'react';
import {
  FasilitasLingkungan,
  FacilityCondition
} from '../../types/facility';
import { CONDITION_METADATA } from '../../config/facilityConfig';
import { X, Save, Eye, AlertCircle, Camera } from 'lucide-react';

interface FacilityInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FasilitasLingkungan | null;
  onSubmit: (data: {
    fasilitasId: string;
    tanggalPemeriksaan: string;
    kondisiSesudah: FacilityCondition;
    temuan: string;
    rekomendasi: string;
    fotoBukti?: string[];
  }) => Promise<void>;
  currentUserName: string;
  currentUserRole: string;
}

export const FacilityInspectionModal: React.FC<FacilityInspectionModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSubmit,
  currentUserName,
  currentUserRole
}) => {
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [kondisiSesudah, setKondisiSesudah] = useState<FacilityCondition>(
    facility?.kondisi || 'BAIK'
  );
  const [temuan, setTemuan] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');
  const [fotoBuktiUrl, setFotoBuktiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !facility) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temuan.trim()) {
      setErrorMsg('Hasil temuan pemeriksaan wajib diisi.');
      return;
    }
    if (!rekomendasi.trim()) {
      setErrorMsg('Rekomendasi tindak lanjut wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        fasilitasId: facility.fasilitasId,
        tanggalPemeriksaan,
        kondisiSesudah,
        temuan,
        rekomendasi,
        fotoBukti: fotoBuktiUrl ? [fotoBuktiUrl] : []
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil inspeksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#123B5D]" /> Catat Pemeriksaan Fisik Fasilitas
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {facility.namaFasilitas} ({facility.kodeFasilitas})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Pemeriksaan</label>
              <input
                type="date"
                value={tanggalPemeriksaan}
                onChange={(e) => setTanggalPemeriksaan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Hasil Cek</label>
              <select
                value={kondisiSesudah}
                onChange={(e) => setKondisiSesudah(e.target.value as FacilityCondition)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-bold text-slate-800"
              >
                <option value="BAIK">🟢 Baik (Sangat Layak)</option>
                <option value="CUKUP_BAIK">🔵 Cukup Baik</option>
                <option value="RUSAK_RINGAN">🟡 Rusak Ringan</option>
                <option value="RUSAK_SEDANG">🟠 Rusak Sedang</option>
                <option value="RUSAK_BERAT">🔴 Rusak Berat</option>
                <option value="TIDAK_LAYAK">⚫ Tidak Layak Pakai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Temuan Lapangan / Kerusakan Teridentifikasi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={temuan}
              onChange={(e) => setTemuan(e.target.value)}
              placeholder="Jelaskan kondisi fisik komponen yang diperiksa, retakan, kelistrikan, dll..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Rekomendasi Tindak Lanjut <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={rekomendasi}
              onChange={(e) => setRekomendasi(e.target.value)}
              placeholder="Contoh: Perlu penggantian lampu, kerja bakti pengurasan saluran..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Foto Bukti Pemeriksaan (Opsional)
            </label>
            <input
              type="text"
              value={fotoBuktiUrl}
              onChange={(e) => setFotoBuktiUrl(e.target.value)}
              placeholder="URL foto kondisi saat pemeriksaan"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-500">
            Pemeriksa: <strong className="text-slate-700">{currentUserName}</strong> ({currentUserRole})
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
              className="bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Hasil Cek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
