// SMART RT 07 RW 11 GPA NGIJO - ENVIRONMENTAL FACILITY DATABASE & REAL-WORLD FIELD SURVEY GIS v2.0
// Main Type Definitions for Facilities, Real-World GIS GeoBase, Field Surveys, Inspections, and Maintenance

export type FacilityCategory =
  | 'KEAMANAN'
  | 'PENERANGAN'
  | 'JALAN'
  | 'DRAINASE'
  | 'AIR'
  | 'SAMPAH'
  | 'TEMPAT_IBADAH'
  | 'POSYANDU'
  | 'OLAHRAGA'
  | 'TAMAN'
  | 'RUANG_PUBLIK'
  | 'PARKIR'
  | 'FASILITAS_ANAK'
  | 'TELEKOMUNIKASI'
  | 'LAINNYA';

export type FacilityStatus =
  | 'AKTIF'
  | 'DALAM_PERBAIKAN'
  | 'NONAKTIF'
  | 'DIUSULKAN'
  | 'DIHAPUS';

export type FacilityCondition =
  | 'BAIK'
  | 'CUKUP_BAIK'
  | 'RUSAK_RINGAN'
  | 'RUSAK_SEDANG'
  | 'RUSAK_BERAT'
  | 'TIDAK_LAYAK'
  | 'BELUM_DINILAI';

export type FacilityPriority =
  | 'RENDAH'
  | 'NORMAL'
  | 'TINGGI'
  | 'DARURAT';

export type LocationVerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'REJECTED';

export type GeoSource =
  | 'SURVEYED'
  | 'IMPORTED'
  | 'REFERENCE'
  | 'UNVERIFIED';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type GPSAccuracyGrade =
  | 'HIGH_PRECISION'    // <= 5m
  | 'ACCEPTABLE'        // > 5m - <= 15m
  | 'LOW_PRECISION'      // > 15m - <= 30m
  | 'REQUIRES_REVIEW';  // > 30m

export type DataStaleStatus = 'FRESH' | 'AGING' | 'STALE';

export type GeoObjectType =
  | 'BOUNDARY'
  | 'ROAD'
  | 'BUILDING'
  | 'FACILITY'
  | 'DRAINAGE'
  | 'PARK'
  | 'SECURITY'
  | 'LIGHTING'
  | 'WATER'
  | 'OTHER';

export type GeometryType = 'POINT' | 'LINESTRING' | 'POLYGON';

export type FundingSource =
  | 'KAS_RT'
  | 'SWADAYA_WARGA'
  | 'DANA_DESA_PEMDA'
  | 'CSR_DONATUR'
  | 'LAINNYA';

export interface GeoEvidence {
  evidenceId: string;
  geoId?: string;
  fasilitasId?: string;
  fileData: string; // Base64 data URL or remote URL
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  capturedAt: string;
  capturedBy: string;
  notes?: string;
  exifMetadata?: {
    make?: string;
    model?: string;
    dateTimeOriginal?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    gpsAltitude?: number;
  };
}

export interface GeoHistory {
  geoHistoryId: string;
  geoId: string;
  oldGeometry: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number][];
  };
  newGeometry: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number][];
  };
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface GeoObject {
  geoId: string;
  objectType: GeoObjectType;
  geometryType: GeometryType;
  name: string;
  latitude?: number;
  longitude?: number;
  coordinates?: [number, number][]; // For lines / polygons (lat, lng)
  source: GeoSource;
  verificationStatus: VerificationStatus;
  accuracyMeters?: number;
  accuracyGrade?: GPSAccuracyGrade;
  capturedAt?: string;
  capturedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  photoEvidenceIds?: string[];
  notes?: string;
  qualityScore?: number; // 1-5
  staleStatus?: DataStaleStatus;
  lastSurveyedAt?: string;
  lastSurveyedBy?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface RTBoundary {
  boundaryId: string;
  rtNumber: string; // "07"
  rwNumber: string; // "11"
  areaName: string; // "Perumahan GPA Ngijo RT 07 RW 11"
  polygon: [number, number][]; // Array of [lat, lng]
  source: GeoSource;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoSurvey {
  surveyId: string; // SURVEY-YYYYMMDD-XXXXXX
  requestId: string; // REQ-YYYYMMDD-XXXXXX
  geoId?: string;
  fasilitasId?: string;
  namaFasilitas: string;
  kategori: FacilityCategory;
  subkategori: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  accuracyGrade: GPSAccuracyGrade;
  conditionScore: number;
  status: FacilityStatus;
  prioritas: FacilityPriority;
  source: 'SURVEYED';
  verificationStatus: VerificationStatus;
  capturedAt: string;
  capturedBy: string;
  capturedByName: string;
  deviceMetadata?: {
    userAgent?: string;
    platform?: string;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  photoEvidence?: GeoEvidence[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface FasilitasLingkungan {
  fasilitasId: string; // e.g. "FAS-2026-000001"
  kodeFasilitas: string; // e.g. "FAS-RT07-LMP-001"
  namaFasilitas: string;
  kategori: FacilityCategory;
  kategoriCustom?: string;
  subkategori: string;
  deskripsi: string;
  lokasi: string; // e.g. "Pertigaan Blok C - Depan Rumah C-04"
  alamatSingkat: string; // e.g. "Blok C RT 07 GPA Ngijo"
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
  akurasiLokasi: number; // in meters (e.g. 5)
  locationStatus: LocationVerificationStatus;
  geoId?: string; // Relation to GeoObject
  coordinateSource?: GeoSource;
  accuracyMeters?: number;
  accuracyGrade?: GPSAccuracyGrade;
  surveyStatus?: VerificationStatus;
  lastSurveyedAt?: string;
  lastSurveyedBy?: string;
  staleStatus?: DataStaleStatus;
  qualityScore?: number; // 1-5 stars
  status: FacilityStatus;
  kondisi: FacilityCondition;
  conditionScore: number; // 5=BAIK, 4=CUKUP_BAIK, 3=RUSAK_RINGAN, 2=RUSAK_SEDANG, 1=RUSAK_BERAT, 0=TIDAK_LAYAK
  tingkatPrioritas: FacilityPriority;
  tanggalPendataan: string; // YYYY-MM-DD
  tanggalPemeriksaanTerakhir?: string;
  tanggalPemeliharaanTerakhir?: string;
  penanggungJawabId?: string; // WargaId
  penanggungJawabNama?: string;
  teleponPIC?: string;
  fotoUtama?: string;
  fotoTambahan?: string[];
  jumlahFoto: number;
  photoEvidenceList?: GeoEvidence[];
  estimasiNilaiAset?: number; // In IDR
  estimasiBiayaPerbaikan?: number; // In IDR
  sumberDana?: FundingSource | string;
  catatan?: string;
  isPublic: boolean;
  linkedEventIds?: string[];
  complaintCount?: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export interface FacilityInspection {
  inspectionId: string; // e.g. "INSP-2026-000001"
  fasilitasId: string;
  tanggalPemeriksaan: string;
  kondisiSebelum: FacilityCondition;
  kondisiSesudah: FacilityCondition;
  conditionScore: number;
  temuan: string;
  rekomendasi: string;
  fotoBukti?: string[];
  pemeriksaId: string;
  pemeriksaNama: string;
  pemeriksaRole: string;
  createdAt: string;
}

export type MaintenanceStatus =
  | 'DIUSULKAN'
  | 'DISETUJUI'
  | 'BERLANGSUNG'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface FacilityMaintenance {
  maintenanceId: string; // e.g. "MNT-2026-000001"
  fasilitasId: string;
  tanggal: string;
  jenisPemeliharaan: string; // "PERBAIKAN_RUTIN" | "PENGGANTIAN_SPAREPART" | "RENOVASI" | "PEMBERSIHAN" | "DARURAT"
  deskripsi: string;
  vendor?: string;
  pic: string;
  biaya: number;
  sumberDana: string;
  status: MaintenanceStatus;
  buktiDokumen?: string;
  fotoSebelum?: string;
  fotoSesudah?: string;
  approvedBy?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface FacilityPhoto {
  photoId: string;
  facilityId: string;
  fileName: string;
  caption?: string;
  driveFileId?: string;
  driveUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface FacilityEventLink {
  linkId: string;
  eventId: string;
  fasilitasId: string;
  keterangan: string;
  createdAt: string;
}

export interface FacilityComplaintReport {
  complaintId: string; // e.g. "ADU-FAS-2026-001"
  fasilitasId: string;
  namaFasilitas: string;
  jenisMasalah: string;
  deskripsi: string;
  fotoUrl?: string;
  pelaporId?: string;
  pelaporNama: string;
  pelaporHp?: string;
  status: 'BARU' | 'DIVERIFIKASI' | 'DITINDAKLANJUTI' | 'SELESAI' | 'DITOLAK';
  tanggapanPengurus?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FacilityAuditLog {
  auditId: string;
  timestamp: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  resourceType: 'FASILITAS' | 'PEMERIKSAAN' | 'PEMELIHARAAN' | 'FOTO' | 'PENGADUAN';
  resourceId: string;
  previousState?: string;
  newState?: string;
  authorization: 'AUTHORIZED' | 'DENIED';
  status: 'SUCCESS' | 'FAILED';
  details?: string;
}

export interface FacilityActorSession {
  userId: string;
  role: string;
  nama: string;
  isBackendConnected: boolean;
}

export interface FacilityAnalytics {
  totalFacilities: number;
  activeFacilities: number;
  goodConditionFacilities: number;
  fairConditionFacilities: number;
  damagedFacilities: number; // RUSAK_RINGAN + RUSAK_SEDANG + RUSAK_BERAT
  emergencyFacilities: number; // Prioritas DARURAT
  underRepairFacilities: number;
  unassessedFacilities: number;
  averageConditionScore: number;
  totalAssetValue: number;
  totalRepairCostEstimation: number;
  facilityCountByCategory: Record<FacilityCategory, number>;
  facilityCountByCondition: Record<FacilityCondition, number>;
  facilityCountByStatus: Record<FacilityStatus, number>;
  facilityCountByPriority: Record<FacilityPriority, number>;
  topProblematicFacilities: {
    fasilitas: FasilitasLingkungan;
    complaintCount: number;
    urgencyScore: number;
  }[];
}
