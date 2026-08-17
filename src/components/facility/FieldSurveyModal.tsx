// SMART RT 07 RW 11 GPA NGIJO - FIELD SURVEY GPS CAPTURE MODAL v2.0
// Mobile & Desktop On-Site GPS Data Collector with Accuracy Gating & Geotagged Photo Evidence

import React, { useState, useEffect } from 'react';
import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority,
  FacilityActorSession,
  GeoEvidence,
  GPSAccuracyGrade
} from '../../types/facility';
import {
  FACILITY_CATEGORIES,
  CONDITION_METADATA,
  GPS_ACCURACY_THRESHOLDS,
  getGPSAccuracyGrade,
  GPA_NGIJO_BOUNDS
} from '../../config/facilityConfig';
import {
  Crosshair,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Radio,
  Compass,
  Layers,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface FieldSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  actor: FacilityActorSession;
  existingFacility?: FasilitasLingkungan | null;
  onSaveSurvey: (surveyData: any) => Promise<void>;
}

export const FieldSurveyModal: React.FC<FieldSurveyModalProps> = ({
  isOpen,
  onClose,
  actor,
  existingFacility,
  onSaveSurvey
}) => {
  const [namaFasilitas, setNamaFasilitas] = useState('');
  const [kategori, setKategori] = useState<FacilityCategory>('KEAMANAN');
  const [subkategori, setSubkategori] = useState('');
  const [kondisi, setKondisi] = useState<FacilityCondition>('BAIK');
  const [prioritas, setPrioritas] = useState<FacilityPriority>('NORMAL');
  const [notes, setNotes] = useState('');

  // GPS State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSource, setGpsSource] = useState<'DEVICE_HARDWARE' | 'MANUAL_FINE_TUNE'>('DEVICE_HARDWARE');

  // Photo Evidence State
  const [photoEvidence, setPhotoEvidence] = useState<GeoEvidence[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoSizeBytes, setPhotoSizeBytes] = useState(0);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill if editing existing facility
  useEffect(() => {
    if (existingFacility) {
      setNamaFasilitas(existingFacility.namaFasilitas);
      setKategori(existingFacility.kategori);
      setSubkategori(existingFacility.subkategori || '');
      setKondisi(existingFacility.kondisi);
      setPrioritas(existingFacility.tingkatPrioritas);
      setLatitude(existingFacility.latitude);
      setLongitude(existingFacility.longitude);
      setAccuracyMeters(existingFacility.accuracyMeters || existingFacility.akurasiLokasi || 5);
      setNotes(existingFacility.catatan || '');
    } else {
      setNamaFasilitas('');
      setKategori('KEAMANAN');
      setSubkategori('POS_KEAMANAN');
      setKondisi('BAIK');
      setPrioritas('NORMAL');
      setLatitude(null);
      setLongitude(null);
      setAccuracyMeters(null);
      setNotes('');
      setPhotoEvidence([]);
      setPhotoPreview(null);
    }
  }, [existingFacility, isOpen]);

  // Acquire Live GPS
  const handleAcquireGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setIsAcquiringGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Number(position.coords.accuracy.toFixed(1));

        setLatitude(lat);
        setLongitude(lng);
        setAccuracyMeters(acc);
        setGpsSource('DEVICE_HARDWARE');
        setIsAcquiringGPS(false);
      },
      (err) => {
        setIsAcquiringGPS(false);
        let msg = 'Gagal memperoleh koordinat GPS dari perangkat.';
        if (err.code === 1) {
          msg = 'Izin akses lokasi ditolak oleh browser/pengguna. Silakan aktifkan izin lokasi.';
        } else if (err.code === 2) {
          msg = 'Sinyal GPS tidak tersedia atau posisi tidak dapat ditentukan.';
        } else if (err.code === 3) {
          msg = 'Batas waktu pengambilan sinyal GPS habis (Timeout). Coba lagi di area terbuka.';
        }
        setGpsError(msg);

        // Fallback to center of RT 07 if no GPS
        if (!latitude) {
          setLatitude(Number(GPA_NGIJO_BOUNDS.centerLat.toFixed(6)));
          setLongitude(Number(GPA_NGIJO_BOUNDS.centerLng.toFixed(6)));
          setAccuracyMeters(15);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Handle Photo Evidence Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size <= 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 5 MB.`);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Format foto tidak valid. Gunakan format JPEG, PNG, atau WEBP.');
      return;
    }

    setPhotoFileName(file.name);
    setPhotoSizeBytes(file.size);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);

      const evidenceItem: GeoEvidence = {
        evidenceId: `EVD-${Date.now()}`,
        fileName: file.name,
        fileMimeType: file.type,
        fileSizeBytes: file.size,
        fileData: base64,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        capturedAt: new Date().toISOString(),
        capturedBy: actor.nama,
        notes: 'Bukti foto lapangan survey GPS'
      };

      setPhotoEvidence([evidenceItem]);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const accuracyGradeInfo = accuracyMeters ? getGPSAccuracyGrade(accuracyMeters) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaFasilitas.trim()) {
      setErrorMsg('Nama fasilitas wajib diisi.');
      return;
    }

    if (latitude === null || longitude === null) {
      setErrorMsg('Koordinat GPS wajib diambil terlebih dahulu.');
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMsg('Koordinat di luar rentang geografis yang valid.');
      return;
    }

    if (!actor.isBackendConnected) {
      setErrorMsg('SURVEY NOT COMMITTED: Fail-closed mode aktif. Backend tidak terhubung.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveSurvey({
        fasilitasId: existingFacility?.fasilitasId,
        namaFasilitas,
        kategori,
        subkategori,
        latitude,
        longitude,
        accuracyMeters: accuracyMeters || 5,
        conditionScore: kondisi === 'BAIK' ? 5 : kondisi === 'CUKUP_BAIK' ? 4 : kondisi === 'RUSAK_RINGAN' ? 3 : kondisi === 'RUSAK_SEDANG' ? 2 : 1,
        prioritas,
        notes,
        photoEvidence,
        deviceMetadata: {
          userAgent: navigator.userAgent,
          source: gpsSource,
          timestamp: new Date().toISOString()
        }
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">FIELD SURVEY MODE v2.0</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
                  GPS FIELD CAPTURE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pengambilan Titik Geospasial Nyata & Bukti Fisik Lapangan RT 07 RW 11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Survey Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian Validasi</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Section 1: Live GPS Acquisition Engine */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Pengambilan Koordinat GPS Real-Time</h3>
              </div>
              <span className="text-xs font-medium text-slate-500">WGS84 Datum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Latitude (Lintang)</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {latitude !== null ? latitude : 'Belum Diambil'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Longitude (Bujur)</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {longitude !== null ? longitude : 'Belum Diambil'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Akurasi Perangkat</span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {accuracyMeters !== null ? `± ${accuracyMeters} meter` : '-'}
                </span>
              </div>
            </div>

            {/* GPS Gating Badge */}
            {accuracyGradeInfo && (
              <div className="flex items-center justify-between p-3 rounded-xl border bg-white text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: accuracyGradeInfo.color }}
                  />
                  <span className="font-bold text-slate-800">{accuracyGradeInfo.label}</span>
                </div>
                <span className="text-slate-600 font-medium">{accuracyGradeInfo.description}</span>
              </div>
            )}

            {gpsError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* GPS Button */}
            <button
              type="button"
              onClick={handleAcquireGPS}
              disabled={isAcquiringGPS}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isAcquiringGPS ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mencari Sinyal Satelit GPS...
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  {latitude ? 'Perbarui Titik GPS Lapangan' : 'Ambil Titik Koordinat GPS Saat Ini'}
                </>
              )}
            </button>
          </div>

          {/* Section 2: Facility Attributes */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Objek / Fasilitas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaFasilitas}
                onChange={(e) => setNamaFasilitas(e.target.value)}
                placeholder="Contoh: Lampu Penerangan Gang 2 Blok B No. 14"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Fasilitas
                </label>
                <select
                  value={kategori}
                  onChange={(e) => {
                    const cat = e.target.value as FacilityCategory;
                    setKategori(cat);
                    const meta = FACILITY_CATEGORIES.find((c) => c.key === cat);
                    if (meta && meta.subcategories.length > 0) {
                      setSubkategori(meta.subcategories[0]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {FACILITY_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kondisi Fisik Saat Survey
                </label>
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value as FacilityCondition)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(CONDITION_METADATA).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Lapangan & Deskripsi Kerusakan / Temuan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Deskripsikan kondisi fisik, patokan lokasi rumah terdekat, atau tindakan yang dibutuhkan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Geotagged Photo Evidence */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-slate-900 text-sm">Bukti Foto On-Site (Geotagged)</h4>
              </div>
              <span className="text-xs text-slate-500">Maks. 5 MB (JPEG/PNG/WEBP)</span>
            </div>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-black/5">
                <img
                  src={photoPreview}
                  alt="Preview Bukti Lapangan"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoEvidence([]);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-mono">
                  {latitude ? `${latitude}, ${longitude}` : 'Geotagging Aktif'}
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  Ambil Foto Langsung atau Unggah Berkas
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Format gambar JPG, PNG, atau WEBP
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Section 4: Workflow Governance Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Tata Kelola Survey Geospasial RT 07</span>
              Data survey lapangan akan disimpan dalam status <span className="font-semibold">PENDING (Menunggu Verifikasi)</span> dan diaudit oleh Sekretaris/Ketua RT 07 sebelum disinkronkan ke Data Resmi Peta Lingkungan.
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || latitude === null}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyimpan Survey...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Kirim Hasil Survey Lapangan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
