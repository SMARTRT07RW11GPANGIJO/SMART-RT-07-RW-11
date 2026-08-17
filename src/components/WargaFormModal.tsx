import React, { useState } from 'react';
import { Warga, Keluarga, StatusWarga, HubunganKeluarga } from '../types/rt';
import { X, UserPlus, CheckCircle, Home, Key, AlertCircle, Users } from 'lucide-react';
import { ResidentFamilyService } from '../services/residentFamilyService';

interface WargaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarga: (warga: Warga) => void;
  keluargaList?: Keluarga[];
}

export const WargaFormModal: React.FC<WargaFormModalProps> = ({
  isOpen,
  onClose,
  onAddWarga,
  keluargaList = []
}) => {
  const [formData, setFormData] = useState<Omit<Warga, 'id_warga'>>({
    nik: '',
    no_kk: '',
    nomorKK: '',
    keluargaId: '',
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
    statusWarga: 'TETAP',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    namaPemilikRumah: '',
    teleponPemilikRumah: '',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    keterangan: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStatusWarga: StatusWarga = formData.statusWarga || (formData.status_warga === 'Kontrak' ? 'KONTRAK_SEWA' : formData.status_warga === 'Kos' ? 'KOS' : 'TETAP');
  const isNonTetap = currentStatusWarga === 'KONTRAK_SEWA' || currentStatusWarga === 'KOS';

  const handleStatusChange = (status: StatusWarga) => {
    setFormData((prev) => ({
      ...prev,
      statusWarga: status,
      status_warga: status === 'KONTRAK_SEWA' ? 'Kontrak' : status === 'KOS' ? 'Kos' : 'Tetap',
      hubunganKeluarga: status === 'KONTRAK_SEWA' ? 'PENYEWA' : status === 'KOS' ? 'PENGHUNI_KOS' : prev.hubunganKeluarga
    }));
    setValidationError(null);
  };

  const handleKkSelect = (selectedKkId: string) => {
    const selectedKk = keluargaList.find((k) => k.keluargaId === selectedKkId || k.id_kk === selectedKkId);
    if (selectedKk) {
      setFormData((prev) => ({
        ...prev,
        keluargaId: selectedKk.keluargaId || selectedKk.id_kk,
        no_kk: selectedKk.no_kk,
        nomorKK: selectedKk.no_kk,
        blok: selectedKk.blok || prev.blok,
        alamat: selectedKk.alamat || prev.alamat
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        keluargaId: '',
        no_kk: '',
        nomorKK: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation via Service
    const validation = ResidentFamilyService.validateWarga(formData);
    if (!validation.valid) {
      setValidationError(validation.error || 'Data registrasi warga tidak valid.');
      return;
    }

    const newWargaId = `WRG-${Date.now().toString().slice(-4)}`;
    const newWarga: Warga = {
      ...formData,
      id_warga: newWargaId,
      wargaId: newWargaId,
      statusWarga: currentStatusWarga,
      status_warga: currentStatusWarga === 'KONTRAK_SEWA' ? 'Kontrak' : currentStatusWarga === 'KOS' ? 'Kos' : 'Tetap',
      // Safe cleanup: if TETAP, remove owner fields
      namaPemilikRumah: isNonTetap ? formData.namaPemilikRumah : undefined,
      teleponPemilikRumah: isNonTetap ? formData.teleponPemilikRumah : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddWarga(newWarga);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] text-white p-5 flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Tambah Data Warga RT 07</h3>
                <span className="bg-[#2E7D52] text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Data Warga v1.1
                </span>
              </div>
              <p className="text-xs text-slate-300">Registrasi Kependudukan & Relasi Kartu Keluarga GPA Ngijo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Validasi Formulir Gagal</span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Status Hunian & Hubungan Keluarga */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-[#123B5D] font-bold text-xs">
              <Home className="w-4 h-4 text-[#2E7D52]" />
              <span>1. Status Domisili & Hubungan Keluarga</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('TETAP')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between ${
                  currentStatusWarga === 'TETAP'
                    ? 'bg-[#123B5D] text-white border-[#123B5D] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Warga Tetap</span>
                  <CheckCircle className={`w-3.5 h-3.5 ${currentStatusWarga === 'TETAP' ? 'text-[#D4A72C]' : 'opacity-0'}`} />
                </div>
                <span className={`text-[10px] font-normal mt-1 ${currentStatusWarga === 'TETAP' ? 'text-slate-200' : 'text-slate-500'}`}>
                  Pemilik Rumah Asli
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('KONTRAK_SEWA')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between ${
                  currentStatusWarga === 'KONTRAK_SEWA'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Kontrak / Sewa</span>
                  <CheckCircle className={`w-3.5 h-3.5 ${currentStatusWarga === 'KONTRAK_SEWA' ? 'text-amber-200' : 'opacity-0'}`} />
                </div>
                <span className={`text-[10px] font-normal mt-1 ${currentStatusWarga === 'KONTRAK_SEWA' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Wajib Data Pemilik
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('KOS')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between ${
                  currentStatusWarga === 'KOS'
                    ? 'bg-purple-800 text-white border-purple-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Penghuni Kos</span>
                  <CheckCircle className={`w-3.5 h-3.5 ${currentStatusWarga === 'KOS' ? 'text-purple-200' : 'opacity-0'}`} />
                </div>
                <span className={`text-[10px] font-normal mt-1 ${currentStatusWarga === 'KOS' ? 'text-purple-100' : 'text-slate-500'}`}>
                  Wajib Data Pemilik
                </span>
              </button>
            </div>

            {/* Relational Hubungan Keluarga & Link to KK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hubungan dalam Keluarga</label>
                <select
                  value={formData.hubunganKeluarga || 'KEPALA_KELUARGA'}
                  onChange={(e) => setFormData({ ...formData, hubunganKeluarga: e.target.value as HubunganKeluarga })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                >
                  <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                  <option value="ISTRI">Istri</option>
                  <option value="ANAK">Anak</option>
                  <option value="ORANG_TUA">Orang Tua / Mertua</option>
                  <option value="FAMILI_LAIN">Famili Lain</option>
                  <option value="PENYEWA">Penyewa (Kontrak)</option>
                  <option value="PENGHUNI_KOS">Penghuni Kos</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Hubungkan ke Kartu Keluarga (KK)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                </label>
                <select
                  value={formData.keluargaId || ''}
                  onChange={(e) => handleKkSelect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                >
                  <option value="">-- Buat / Tanpa Relasi KK Existing --</option>
                  {keluargaList.map((k) => (
                    <option key={k.keluargaId || k.id_kk} value={k.keluargaId || k.id_kk}>
                      {k.nama_kepala_keluarga} ({k.blok}) - KK: {k.no_kk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Owner Details Section (Shown only if KONTRAK_SEWA or KOS) */}
          {isNonTetap && (
            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Key className="w-4 h-4 text-amber-700" />
                <span>2. Data Pemilik Rumah Asli (Wajib Diisi untuk Kontrak/Kos)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Sesuai Tata Tertib RT 07 v1.1, warga kontrak/kos wajib menyertakan identitas dan kontak pemilik rumah untuk keperluan koordinasi darurat & iuran lingkungan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-900 mb-1">Nama Pemilik Rumah *</label>
                  <input
                    type="text"
                    required={isNonTetap}
                    placeholder="misal: Bapak H. Sudarsono"
                    value={formData.namaPemilikRumah || ''}
                    onChange={(e) => setFormData({ ...formData, namaPemilikRumah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">Nomor Telepon / WA Pemilik Rumah *</label>
                  <input
                    type="text"
                    required={isNonTetap}
                    placeholder="misal: 081299887766"
                    value={formData.teleponPemilikRumah || ''}
                    onChange={(e) => setFormData({ ...formData, teleponPemilikRumah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Data Pribadi Utama */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#123B5D] font-bold text-xs">
              <Users className="w-4 h-4 text-[#2E7D52]" />
              <span>{isNonTetap ? '3.' : '2.'} Data Pribadi Warga</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Ir. Budi Santoso, S.T."
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit Angka) *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="350712xxxxxxxxxx"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="350712xxxxxxxxxx"
                  value={formData.no_kk}
                  onChange={(e) => setFormData({ ...formData, no_kk: e.target.value.replace(/\D/g, ''), nomorKK: e.target.value.replace(/\D/g, '') })}
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
                <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="misal: Malang"
                  value={formData.tempat_lahir}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Status Perkawinan</label>
                <select
                  value={formData.status_perkawinan}
                  onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                >
                  <option value="Kawin">Kawin</option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agama</label>
                <select
                  value={formData.agama}
                  onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Wiraswasta / Pegawai Swasta / PNS"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
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
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Kolom wajib diisi
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
                <CheckCircle className="w-4 h-4" /> Simpan Data Warga
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
