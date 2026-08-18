// SMART RT 07 RW 11 GPA NGIJO - FIELD SURVEY GPS CAPTURE MODAL v1.0
// Mobile & Desktop On-Site GPS Data Collector with Accuracy Gating & Geotagged Photo Evidence

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Crosshair,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  CheckSquare,
  Navigation
} from 'lucide-react';
import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority,
  FacilityActorSession,
  GeoEvidence,
  PhotoCategory
} from '../../types/facility';
import {
  FACILITY_CATEGORIES,
  CONDITION_METADATA,
  getGPSAccuracyGrade,
  isInsideRT07Boundary,
  calculateDistanceMeters,
  getDistanceComparisonStatus,
  getGPSSignalStatus,
  calculateSurveyQualityScore
} from '../../config/facilityConfig';

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

  // GPS Live State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [deviceTimestamp, setDeviceTimestamp] = useState<string | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Field Survey Mode (High-contrast mobile friendly)
  const [fieldSurveyMode, setFieldSurveyMode] = useState(false);

  // Photo Evidence State & Category
  const [photoEvidence, setPhotoEvidence] = useState<GeoEvidence[]>([]);
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<PhotoCategory>('FRONT');

  // Survey Checklist State
  const [checklist, setChecklist] = useState({
    locationMatch: true,
    physicalFound: true,
    conditionMatch: true,
    photoAvailable: false,
    gpsAccurate: true,
    insideRt: true,
    notDuplicate: true,
    dataComplete: true
  });

  // Submitting State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Geofence check: RT 07 Boundary
  const isInsideBoundary = useMemo(() => {
    if (latitude === null || longitude === null) return true;
    return isInsideRT07Boundary(latitude, longitude);
  }, [latitude, longitude]);

  // Distance comparison vs Expected Reference
  const distanceComparison = useMemo(() => {
    if (!existingFacility || latitude === null || longitude === null) return null;
    const dist = calculateDistanceMeters(
      existingFacility.latitude,
      existingFacility.longitude,
      latitude,
      longitude
    );
    return {
      distanceMeters: dist,
      ...getDistanceComparisonStatus(dist)
    };
  }, [existingFacility, latitude, longitude]);

  // Signal & Accuracy Grades
  const signalInfo = useMemo(() => {
    return getGPSSignalStatus(accuracyMeters, isAcquiringGPS);
  }, [accuracyMeters, isAcquiringGPS]);

  const accuracyGradeInfo = useMemo(() => {
    return accuracyMeters ? getGPSAccuracyGrade(accuracyMeters) : null;
  }, [accuracyMeters]);

  // Quality Score preview
  const qualityScore = useMemo(() => {
    if (accuracyMeters === null) return null;
    return calculateSurveyQualityScore({
      accuracyMeters,
      insideBoundary: isInsideBoundary,
      photoCount: photoEvidence.length,
      checklistComplete: Object.values(checklist).every(Boolean)
    });
  }, [accuracyMeters, isInsideBoundary, photoEvidence.length, checklist]);

  // Sync photoAvailable to checklist
  useEffect(() => {
    setChecklist((prev) => ({
      ...prev,
      photoAvailable: photoEvidence.length > 0,
      insideRt: isInsideBoundary,
      gpsAccurate: (accuracyMeters ?? 99) <= 25
    }));
  }, [photoEvidence.length, isInsideBoundary, accuracyMeters]);

  // Pre-fill on open or change
  useEffect(() => {
    if (existingFacility) {
      setNamaFasilitas(existingFacility.namaFasilitas);
      setKategori(existingFacility.kategori);
      setSubkategori(existingFacility.subkategori || '');
      setKondisi(existingFacility.kondisi);
      setPrioritas(existingFacility.tingkatPrioritas);
      setLatitude(existingFacility.latitude);
      setLongitude(existingFacility.longitude);
      setAccuracyMeters(existingFacility.accuracyMeters || existingFacility.akurasiLokasi || 4.5);
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
      setAltitude(null);
      setHeading(null);
      setSpeed(null);
      setDeviceTimestamp(null);
      setNotes('');
      setPhotoEvidence([]);
    }
  }, [existingFacility, isOpen]);

  // Strict GPS Geolocation Acquisition
  const handleAcquireGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung Web Geolocation GPS API.');
      return;
    }

    setIsAcquiringGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Number(position.coords.accuracy.toFixed(2));
        const alt = position.coords.altitude ? Number(position.coords.altitude.toFixed(1)) : null;
        const hdg = position.coords.heading ? Number(position.coords.heading.toFixed(1)) : null;
        const spd = position.coords.speed ? Number(position.coords.speed.toFixed(1)) : null;
        const ts = new Date(position.timestamp).toISOString();

        setLatitude(lat);
        setLongitude(lng);
        setAccuracyMeters(acc);
        setAltitude(alt);
        setHeading(hdg);
        setSpeed(spd);
        setDeviceTimestamp(ts);
        setIsAcquiringGPS(false);
      },
      (err) => {
        setIsAcquiringGPS(false);
        let msg = 'Gagal memperoleh koordinat GPS dari sensor perangkat.';
        if (err.code === 1) {
          msg = 'Izin akses lokasi ditolak oleh browser. Aktifkan izin lokasi pada setelan peramban.';
        } else if (err.code === 2) {
          msg = 'Sinyal satelit GPS tidak dapat diperoleh. Pindahlah ke area terbuka.';
        } else if (err.code === 3) {
          msg = 'Timeout pencarian satelit GPS (>15 detik). Silakan coba lagi.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Handle Photo Upload with Category
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 5 MB.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Format foto tidak valid. Gunakan JPEG, PNG, atau WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const evidenceItem: GeoEvidence = {
        evidenceId: `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fileName: file.name,
        fileMimeType: file.type,
        fileSizeBytes: file.size,
        fileData: base64,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        capturedAt: new Date().toISOString(),
        capturedBy: actor.nama,
        notes: `Bukti Foto Kategori: ${selectedPhotoCategory}`
      };

      setPhotoEvidence((prev) => [...prev, evidenceItem]);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaFasilitas.trim()) {
      setErrorMsg('Nama fasilitas wajib diisi.');
      return;
    }

    if (latitude === null || longitude === null) {
      setErrorMsg('Koordinat GPS lapangan belum diambil.');
      return;
    }

    // Photo requirement check for new facility
    if (!existingFacility && photoEvidence.length === 0) {
      setErrorMsg('Fasilitas baru wajib menyertakan minimal 1 foto bukti fisik lapangan.');
      return;
    }

    if (!actor.isBackendConnected) {
      setErrorMsg('SURVEY NOT COMMITTED: Fail-closed mode aktif. Backend belum terhubung.');
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
        altitude,
        heading,
        speed,
        deviceTimestamp: deviceTimestamp || new Date().toISOString(),
        conditionScore: kondisi === 'BAIK' ? 5 : kondisi === 'CUKUP_BAIK' ? 4 : kondisi === 'RUSAK_RINGAN' ? 3 : kondisi === 'RUSAK_SEDANG' ? 2 : 1,
        prioritas,
        notes,
        checklist,
        photoEvidence,
        deviceMetadata: {
          userAgent: navigator.userAgent,
          capturedAt: new Date().toISOString()
        }
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil survey lapangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden transition-all ${
        fieldSurveyMode ? 'ring-4 ring-amber-400' : ''
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between transition-colors ${
          fieldSurveyMode ? 'bg-amber-950 text-amber-50' : 'bg-slate-900 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">FIELD SURVEY EXECUTION v1.0</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  SMART RT GIS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pencatatan Fakta Lapangan GPS & Geodatabase Validation • RT 07 RW 11 GPA Ngijo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFieldSurveyMode(!fieldSurveyMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                fieldSurveyMode
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {fieldSurveyMode ? 'High-Contrast Mode: ON' : 'Field UI Mode'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Survey Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Validasi Input Ditolak</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* SECTION 1: GPS SENSOR ENGINE & GEOFENCE */}
          <div className={`p-5 rounded-2xl border transition-all ${
            fieldSurveyMode ? 'bg-slate-950 text-white border-amber-500/50 shadow-lg' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-indigo-600" />
                <h3 className={`font-bold text-sm ${fieldSurveyMode ? 'text-white' : 'text-slate-900'}`}>
                  Sensor GPS & Akurasi Hardware On-Site
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${signalInfo.badgeClass}`}>
                  {signalInfo.label}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isInsideBoundary
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse'
                }`}>
                  {isInsideBoundary ? '✓ DALAM RT 07 RW 11' : '⚠️ DI LUAR BATAS RT'}
                </span>
              </div>
            </div>

            {/* GPS Numerical Coordinates Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <div className={`p-3 rounded-xl border ${fieldSurveyMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 font-semibold block">Latitude (Lintang)</span>
                <span className={`text-sm font-mono font-bold ${fieldSurveyMode ? 'text-amber-400' : 'text-slate-900'}`}>
                  {latitude !== null ? latitude : '---'}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${fieldSurveyMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 font-semibold block">Longitude (Bujur)</span>
                <span className={`text-sm font-mono font-bold ${fieldSurveyMode ? 'text-amber-400' : 'text-slate-900'}`}>
                  {longitude !== null ? longitude : '---'}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${fieldSurveyMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 font-semibold block">Akurasi GPS (±m)</span>
                <span className={`text-sm font-mono font-bold ${fieldSurveyMode ? 'text-amber-400' : 'text-slate-900'}`}>
                  {accuracyMeters !== null ? `± ${accuracyMeters} m` : '---'}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${fieldSurveyMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className="text-[11px] text-slate-400 font-semibold block">Elevasi / Alt</span>
                <span className={`text-sm font-mono font-bold ${fieldSurveyMode ? 'text-amber-400' : 'text-slate-900'}`}>
                  {altitude !== null ? `${altitude} m` : 'N/A'}
                </span>
              </div>
            </div>

            {/* GPS Gating Status Banner */}
            {accuracyGradeInfo && (
              <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between text-xs ${
                fieldSurveyMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accuracyGradeInfo.color }} />
                  <span className="font-bold">{accuracyGradeInfo.label}</span>
                </div>
                <span className="font-medium text-slate-400">{accuracyGradeInfo.description}</span>
              </div>
            )}

            {/* Expected Reference Point Comparison */}
            {distanceComparison && (
              <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between text-xs ${
                fieldSurveyMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-400">Selisih vs Titik Referensi:</span>
                  <span className="font-bold font-mono text-slate-800">{distanceComparison.distanceMeters} m</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${distanceComparison.badgeClass}`}>
                  {distanceComparison.label}
                </span>
              </div>
            )}

            {/* GPS Error */}
            {gpsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Live GPS Capture Button */}
            <button
              type="button"
              onClick={handleAcquireGPS}
              disabled={isAcquiringGPS}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 ${
                fieldSurveyMode
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
              }`}
            >
              {isAcquiringGPS ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mencari Sinyal Satelit GPS...
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  {latitude ? 'Ambil Ulang Titik GPS Nyata' : 'Kunci Titik Koordinat GPS di Lapangan'}
                </>
              )}
            </button>
          </div>

          {/* SECTION 2: ATTRIBUTE REGISTRATION */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Objek / Fasilitas Lingkungan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaFasilitas}
                onChange={(e) => setNamaFasilitas(e.target.value)}
                placeholder="Contoh: Lampu Penerangan Gang 2 Blok B No. 14"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori
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
                  Kondisi Fisik Lapangan
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
                rows={2}
                placeholder="Deskripsikan kondisi fisik, patokan lokasi rumah warga terdekat..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SECTION 3: SURVEY CHECKLIST */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Checklist Verifikasi Lapangan</h4>
              </div>
              {qualityScore && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${qualityScore.badgeClass}`}>
                  SKOR KUALITAS: {qualityScore.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.physicalFound}
                  onChange={(e) => setChecklist({ ...checklist, physicalFound: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Objek fisik ditemukan di lokasi</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.locationMatch}
                  onChange={(e) => setChecklist({ ...checklist, locationMatch: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Posisi sesuai lingkungan sekitar</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.conditionMatch}
                  onChange={(e) => setChecklist({ ...checklist, conditionMatch: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Kondisi fisik telah dinilai jujur</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.notDuplicate}
                  onChange={(e) => setChecklist({ ...checklist, notDuplicate: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Bukan duplikasi fasilitas lain</span>
              </label>
            </div>
          </div>

          {/* SECTION 4: PHOTO EVIDENCE WITH CATEGORY */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-slate-900 text-sm">Bukti Foto Fisik Lapangan</h4>
              </div>
              <span className="text-xs text-slate-500">Maks. 5 MB / foto (JPG/PNG/WEBP)</span>
            </div>

            {/* Photo Category Picker */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Kategori Foto:</span>
              {[
                { id: 'FRONT', label: 'Tampak Depan' },
                { id: 'CONDITION', label: 'Kondisi Fisik' },
                { id: 'DAMAGE', label: 'Bagian Rusak' },
                { id: 'SURROUNDING', label: 'Sekitar' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedPhotoCategory(c.id as PhotoCategory)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedPhotoCategory === c.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Photo Previews List */}
            {photoEvidence.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photoEvidence.map((photo, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-black/5 group">
                    <img src={photo.fileData} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono">
                      {photo.notes || `Foto #${idx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-800">
                + Tambah Foto Bukti Lapangan ({photoEvidence.length} Terunggah)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Alur: REFERENCE → PENDING_REVIEW → VERIFIED</span>
          </div>

          <div className="flex items-center gap-3">
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
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Kirim Hasil Survey
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
