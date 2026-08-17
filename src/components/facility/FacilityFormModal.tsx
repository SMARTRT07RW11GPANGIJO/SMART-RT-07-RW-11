// SMART RT 07 RW 11 GPA NGIJO - FACILITY FORM MODAL v1.0
// Form for Creating and Editing Environmental Facilities with Coordinate Validation

import React, { useState, useEffect } from 'react';
import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority,
  FacilityStatus,
  FundingSource
} from '../../types/facility';
import {
  FACILITY_CATEGORIES,
  GPA_NGIJO_BOUNDS,
  CONDITION_SCORE_MAP
} from '../../config/facilityConfig';
import { X, Save, MapPin, AlertCircle, Camera, Check } from 'lucide-react';

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: FasilitasLingkungan | null;
  currentUserRole: string;
}

export const FacilityFormModal: React.FC<FacilityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentUserRole
}) => {
  const [namaFasilitas, setNamaFasilitas] = useState('');
  const [kategori, setKategori] = useState<FacilityCategory>('PENERANGAN');
  const [kategoriCustom, setKategoriCustom] = useState('');
  const [subkategori, setSubkategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [alamatSingkat, setAlamatSingkat] = useState('RT 07 RW 11 GPA Ngijo');
  const [latitude, setLatitude] = useState<number>(-7.9025);
  const [longitude, setLongitude] = useState<number>(112.5985);
  const [akurasiLokasi, setAkurasiLokasi] = useState<number>(5);
  const [status, setStatus] = useState<FacilityStatus>('AKTIF');
  const [kondisi, setKondisi] = useState<FacilityCondition>('BAIK');
  const [tingkatPrioritas, setTingkatPrioritas] = useState<FacilityPriority>('NORMAL');
  const [tanggalPendataan, setTanggalPendataan] = useState(new Date().toISOString().split('T')[0]);
  const [penanggungJawabNama, setPenanggungJawabNama] = useState('Bpk. Eko Sucahyono (Ketua RT)');
  const [teleponPIC, setTeleponPIC] = useState('081234567890');
  const [fotoUtama, setFotoUtama] = useState('');
  const [estimasiNilaiAset, setEstimasiNilaiAset] = useState<number>(1000000);
  const [estimasiBiayaPerbaikan, setEstimasiBiayaPerbaikan] = useState<number>(0);
  const [sumberDana, setSumberDana] = useState<FundingSource>('KAS_RT');
  const [catatan, setCatatan] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setNamaFasilitas(initialData.namaFasilitas);
      setKategori(initialData.kategori);
      setKategoriCustom(initialData.kategoriCustom || '');
      setSubkategori(initialData.subkategori || '');
      setDeskripsi(initialData.deskripsi);
      setLokasi(initialData.lokasi);
      setAlamatSingkat(initialData.alamatSingkat);
      setLatitude(initialData.latitude);
      setLongitude(initialData.longitude);
      setAkurasiLokasi(initialData.akurasiLokasi || 5);
      setStatus(initialData.status);
      setKondisi(initialData.kondisi);
      setTingkatPrioritas(initialData.tingkatPrioritas);
      setTanggalPendataan(initialData.tanggalPendataan);
      setPenanggungJawabNama(initialData.penanggungJawabNama || '');
      setTeleponPIC(initialData.teleponPIC || '');
      setFotoUtama(initialData.fotoUtama || '');
      setEstimasiNilaiAset(initialData.estimasiNilaiAset || 0);
      setEstimasiBiayaPerbaikan(initialData.estimasiBiayaPerbaikan || 0);
      setSumberDana((initialData.sumberDana as FundingSource) || 'KAS_RT');
      setCatatan(initialData.catatan || '');
      setIsPublic(initialData.isPublic !== false);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setNamaFasilitas('');
    setKategori('PENERANGAN');
    setKategoriCustom('');
    setSubkategori('LAMPU_JALAN');
    setDeskripsi('');
    setLokasi('');
    setAlamatSingkat('RT 07 RW 11 GPA Ngijo');
    setLatitude(-7.9025);
    setLongitude(112.5985);
    setAkurasiLokasi(5);
    setStatus('AKTIF');
    setKondisi('BAIK');
    setTingkatPrioritas('NORMAL');
    setTanggalPendataan(new Date().toISOString().split('T')[0]);
    setPenanggungJawabNama('Bpk. Eko Sucahyono (Ketua RT)');
    setTeleponPIC('081234567890');
    setFotoUtama('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60');
    setEstimasiNilaiAset(1500000);
    setEstimasiBiayaPerbaikan(0);
    setSumberDana('KAS_RT');
    setCatatan('');
    setIsPublic(true);
    setErrorMsg('');
  };

  const currentCategoryObj = FACILITY_CATEGORIES.find((c) => c.key === kategori);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaFasilitas.trim()) {
      setErrorMsg('Nama fasilitas wajib diisi.');
      return;
    }

    if (!lokasi.trim()) {
      setErrorMsg('Lokasi spesifik fasilitas wajib diisi.');
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMsg('Koordinat GPS tidak valid (Lat: -90..90, Lng: -180..180).');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        namaFasilitas,
        kategori,
        kategoriCustom: kategori === 'LAINNYA' ? kategoriCustom : undefined,
        subkategori: subkategori || currentCategoryObj?.subcategories[0] || 'UMUM',
        deskripsi,
        lokasi,
        alamatSingkat,
        latitude: Number(latitude),
        longitude: Number(longitude),
        akurasiLokasi: Number(akurasiLokasi),
        locationStatus: 'VERIFIED',
        status,
        kondisi,
        conditionScore: CONDITION_SCORE_MAP[kondisi] || 0,
        tingkatPrioritas,
        tanggalPendataan,
        penanggungJawabNama,
        teleponPIC,
        fotoUtama,
        estimasiNilaiAset: Number(estimasiNilaiAset),
        estimasiBiayaPerbaikan: Number(estimasiBiayaPerbaikan),
        sumberDana,
        catatan,
        isPublic
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan fasilitas.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#123B5D]" />
              {initialData ? 'Perbarui Data Fasilitas Lingkungan' : 'Daftarkan Fasilitas Lingkungan Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              RT 07 RW 11 Perumahan GPA Ngijo, Karangploso, Malang
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Row 1: Nama & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Fasilitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaFasilitas}
                onChange={(e) => setNamaFasilitas(e.target.value)}
                placeholder="Contoh: Lampu Jalan Blok B-08"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori Utama <span className="text-red-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => {
                  const newCat = e.target.value as FacilityCategory;
                  setKategori(newCat);
                  const found = FACILITY_CATEGORIES.find((c) => c.key === newCat);
                  if (found && found.subcategories.length > 0) {
                    setSubkategori(found.subcategories[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                required
              >
                {FACILITY_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subkategori & Kategori Custom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subkategori</label>
              {currentCategoryObj && currentCategoryObj.subcategories.length > 0 ? (
                <select
                  value={subkategori}
                  onChange={(e) => setSubkategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                >
                  {currentCategoryObj.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={subkategori}
                  onChange={(e) => setSubkategori(e.target.value)}
                  placeholder="Subkategori fasilitas"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
                />
              )}
            </div>

            {kategori === 'LAINNYA' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Khusus (Custom)
                </label>
                <input
                  type="text"
                  value={kategoriCustom}
                  onChange={(e) => setKategoriCustom(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
                />
              </div>
            )}
          </div>

          {/* Lokasi & Alamat Singkat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lokasi Spesifik / Patokan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Depan Rumah Blok B-08"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:ring-2 focus:ring-[#123B5D] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Singkat</label>
              <input
                type="text"
                value={alamatSingkat}
                onChange={(e) => setAlamatSingkat(e.target.value)}
                placeholder="Contoh: Blok B RT 07 GPA Ngijo"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* GIS Coordinates */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#123B5D]" /> Koordinat Geografis (GIS)
              </span>
              <span className="text-[10px] text-slate-500">Area GPA Ngijo (Lat ~ -7.902, Lng ~ 112.598)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Akurasi (Meter)</label>
                <input
                  type="number"
                  value={akurasiLokasi}
                  onChange={(e) => setAkurasiLokasi(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Kondisi, Prioritas, & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Fasilitas</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as FacilityCondition)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white"
              >
                <option value="BAIK">🟢 Baik (Sangat Layak)</option>
                <option value="CUKUP_BAIK">🔵 Cukup Baik</option>
                <option value="RUSAK_RINGAN">🟡 Rusak Ringan</option>
                <option value="RUSAK_SEDANG">🟠 Rusak Sedang</option>
                <option value="RUSAK_BERAT">🔴 Rusak Berat</option>
                <option value="TIDAK_LAYAK">⚫ Tidak Layak</option>
                <option value="BELUM_DINILAI">⚪ Belum Dinilai</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={tingkatPrioritas}
                onChange={(e) => setTingkatPrioritas(e.target.value as FacilityPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white"
              >
                <option value="NORMAL">Normal</option>
                <option value="RENDAH">Rendah</option>
                <option value="TINGGI">Tinggi</option>
                <option value="DARURAT">🚨 DARURAT (Urgent Alert)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Operasional</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FacilityStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white"
              >
                <option value="AKTIF">Aktif</option>
                <option value="DALAM_PERBAIKAN">Dalam Perbaikan</option>
                <option value="NONAKTIF">Nonaktif</option>
                <option value="DIUSULKAN">Diusulkan</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi & Spesifikasi</label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan spesifikasi teknis, merek, atau karakteristik fasilitas..."
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white"
            />
          </div>

          {/* PIC & Telepon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                value={penanggungJawabNama}
                onChange={(e) => setPenanggungJawabNama(e.target.value)}
                placeholder="Nama Pengurus / Sie RT"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telepon PIC (Internal)</label>
              <input
                type="text"
                value={teleponPIC}
                onChange={(e) => setTeleponPIC(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Foto URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> URL Foto Utama
            </label>
            <input
              type="text"
              value={fotoUtama}
              onChange={(e) => setFotoUtama(e.target.value)}
              placeholder="https://images.unsplash.com/... atau URL Google Drive"
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
            />
          </div>

          {/* Finansial & Nilai Aset */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimasi Nilai Aset (Rp)</label>
              <input
                type="number"
                value={estimasiNilaiAset}
                onChange={(e) => setEstimasiNilaiAset(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimasi Biaya Perbaikan (Rp)</label>
              <input
                type="number"
                value={estimasiBiayaPerbaikan}
                onChange={(e) => setEstimasiBiayaPerbaikan(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value as FundingSource)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
              >
                <option value="KAS_RT">Kas RT 07</option>
                <option value="SWADAYA_WARGA">Swadaya Warga</option>
                <option value="DANA_DESA_PEMDA">Dana Desa / Pemda</option>
                <option value="CSR_DONATUR">CSR / Donatur</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Catatan Internal */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Internal Pengurus</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan rahasia pengurus (tidak terlihat oleh publik/warga)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#123B5D] hover:bg-[#0A2338] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Fasilitas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
