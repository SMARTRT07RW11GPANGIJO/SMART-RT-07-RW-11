// SMART RT 07 RW 11 GPA NGIJO - FACILITY MAINTENANCE MODAL v1.0
// Work Order & Maintenance Form for Repairs, Renovations, and Cost Authorizations

import React, { useState } from 'react';
import {
  FasilitasLingkungan,
  MaintenanceStatus,
  FacilityCondition
} from '../../types/facility';
import { X, Save, Wrench, AlertCircle, DollarSign } from 'lucide-react';

interface FacilityMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FasilitasLingkungan | null;
  onSubmit: (data: {
    fasilitasId: string;
    tanggal: string;
    jenisPemeliharaan: string;
    deskripsi: string;
    vendor?: string;
    pic: string;
    biaya: number;
    sumberDana: string;
    initialStatus?: MaintenanceStatus;
    buktiDokumen?: string;
    fotoSebelum?: string;
  }) => Promise<void>;
  currentUserName: string;
  currentUserRole: string;
}

export const FacilityMaintenanceModal: React.FC<FacilityMaintenanceModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSubmit,
  currentUserName,
  currentUserRole
}) => {
  const [jenisPemeliharaan, setJenisPemeliharaan] = useState('PERBAIKAN_RUTIN');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('Swadaya Tim RT 07');
  const [pic, setPic] = useState(currentUserName || 'Seksi Pembangunan RT');
  const [biaya, setBiaya] = useState<number>(facility?.estimasiBiayaPerbaikan || 150000);
  const [sumberDana, setSumberDana] = useState('KAS_RT');
  const [initialStatus, setInitialStatus] = useState<MaintenanceStatus>(
    ['ADMIN', 'KETUA_RT'].includes(currentUserRole.toUpperCase()) ? 'DISETUJUI' : 'DIUSULKAN'
  );
  const [buktiDokumen, setBuktiDokumen] = useState('');
  const [fotoSebelum, setFotoSebelum] = useState(facility?.fotoUtama || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !facility) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskripsi.trim()) {
      setErrorMsg('Deskripsi rencana pemeliharaan wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        fasilitasId: facility.fasilitasId,
        tanggal,
        jenisPemeliharaan,
        deskripsi,
        vendor,
        pic,
        biaya: Number(biaya) || 0,
        sumberDana,
        initialStatus,
        buktiDokumen,
        fotoSebelum
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan usulan pemeliharaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#123B5D]" /> Usulkan / Catat Pemeliharaan Fasilitas
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
              <label className="block font-bold text-slate-700 mb-1">Jenis Pemeliharaan</label>
              <select
                value={jenisPemeliharaan}
                onChange={(e) => setJenisPemeliharaan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-medium text-slate-800"
              >
                <option value="PERBAIKAN_RUTIN">Perbaikan Rutin</option>
                <option value="PENGGANTIAN_SPAREPART">Penggantian Sparepart</option>
                <option value="RENOVASI">Renovasi / Pengecatan</option>
                <option value="PEMBERSIHAN_MASAL">Pembersihan / Kerja Bakti</option>
                <option value="DARURAT">Penanganan Darurat</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Rincian Pekerjaan / Spesifikasi Perbaikan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Contoh: Pembelian lampu LED Philips 50W, penggantian fitting keramik, biaya tenaga teknisi..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vendor / Pelaksana</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Toko Listrik / Teknisi"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Nama Pengurus PIC"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimasi / Biaya Riil (Rp)</label>
              <input
                type="number"
                value={biaya}
                onChange={(e) => setBiaya(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-bold text-[#123B5D]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300"
              >
                <option value="KAS_RT">Kas RT 07</option>
                <option value="SWADAYA_WARGA">Swadaya Warga</option>
                <option value="DANA_DESA_PEMDA">Dana Desa / Pemda</option>
                <option value="CSR_DONATUR">CSR / Donatur</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Usulan</label>
            <select
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value as MaintenanceStatus)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-bold text-emerald-800"
            >
              <option value="DIUSULKAN">Diusulkan (Menunggu Persetujuan RT)</option>
              <option value="DISETUJUI">Disetujui (Siap Dikerjakan)</option>
              <option value="BERLANGSUNG">Sedang Berlangsung</option>
              <option value="SELESAI">Selesai Dikerjakan</option>
            </select>
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
              <Save className="w-3.5 h-3.5" /> Simpan Usulan Pemeliharaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
