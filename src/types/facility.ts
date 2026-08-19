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

export type LocationVerificationStatus = 'FIELD_VERIFIED' | 'REFERENCE_UNVERIFIED' | 'PENDING_REVIEW' | 'RESURVEY_REQUIRED' | 'REJECTED';

export type GeoSource =
  | 'SURVEYED'
  | 'IMPORTED'
  | 'REFERENCE'
  | 'UNVERIFIED';

export type VerificationStatus =
  | 'REFERENCE_UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'FIELD_VERIFIED'
  | 'RESURVEY_REQUIRED'
  | 'REJECTED';

export type FieldSurveyStatus =
  | 'REFERENCE_UNVERIFIED'
  | 'SURVEY_IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'FIELD_VERIFIED'
  | 'REJECTED'
  | 'RESURVEY_REQUIRED';

export type GPSPrecisionStatus =
  | 'HIGH_PRECISION'    // <= 5m
  | 'ACCEPTABLE'        // > 5m - <= 10m
  | 'LOW_PRECISION'      // > 10m - <= 25m
  | 'REQUIRES_REVIEW';  // > 25m

export type GPSAccuracyGrade = GPSPrecisionStatus;

export type GPSSignalStatus =
  | 'ACQUIRING'
  | 'GOOD'
  | 'ACCEPTABLE'
  | 'POOR'
  | 'UNAVAILABLE';

export type DistanceComparisonStatus =
  | 'MATCH'
  | 'NEAR'
  | 'SIGNIFICANT_DIFFERENCE'
  | 'REQUIRES_REVIEW'
  | 'NO_REFERENCE';

export type QualityScoreGrade =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'REQUIRES_REVIEW';

export type PhotoCategory =
  | 'FRONT'
  | 'CONDITION'
  | 'DAMAGE'
  | 'SURROUNDING'
  | 'IDENTIFICATION';

export type GeoBaseCertificationState =
  | 'NOT_CERTIFIED'
  | 'PILOT_CERTIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'FULLY_CERTIFIED';

export type FieldDataAcceptanceStatus =
  | 'NOT_ACCEPTED'
  | 'PARTIALLY_ACCEPTED'
  | 'PILOT_ACCEPTED'
  | 'FIELD_DATA_ACCEPTED';

export interface RealWorldEvidencePackageStatus {
  gpsEvidence: boolean;
  timestampEvidence: boolean;
  surveyorIdentity: boolean;
  photoEvidence: boolean;
  fieldChecklist: boolean;
  geofenceResult: boolean;
  surveyRecord: boolean;
  reviewerDecision: boolean;
  auditRecord: boolean;
  integrityHash: boolean;
  allComplete: boolean;
}

export interface CertificationMetrics {
  totalScope: number;
  surveyRequired: number;
  surveyInProgress: number;
  pendingReview: number;
  fieldVerified: number;
  resurveyRequired: number;
  rejected: number;
  remaining: number;
}

export interface GeoBaseScopeItem {
  facilityId: string;
  facilityCode: string;
  facilityCategory: FacilityCategory;
  facilityName: string;
  referenceCoordinate: { latitude: number; longitude: number };
  surveyCoordinate?: { latitude: number; longitude: number; accuracyMeters?: number };
  verifiedCoordinate?: { latitude: number; longitude: number; accuracyMeters?: number };
  surveyStatus: FieldSurveyStatus;
  verificationStatus: VerificationStatus;
  hasPhysicalSurvey: boolean;
  hasPhotoEvidence: boolean;
  hasChecklist: boolean;
  hasAuditRecord: boolean;
  hasValidHash: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface GeoBaseCertificationScope {
  totalScope: number;
  referenceUnverifiedCount: number;
  pendingReviewCount: number;
  fieldVerifiedCount: number;
  resurveyRequiredCount: number;
  rejectedCount: number;
  scopeItems: GeoBaseScopeItem[];
}

export interface GeoBaseCertificationEvaluation {
  certificationStatus: GeoBaseCertificationState;
  softwareStatus: 'PRODUCTION READY';
  layer1SoftwareStatus: 'SOFTWARE_READY';
  layer2FieldDataStatus: FieldDataAcceptanceStatus;
  layer3CertificationStatus: GeoBaseCertificationState;
  totalScope: number;
  referenceUnverified: number;
  surveyRequired: number;
  surveyInProgress: number;
  pendingReview: number;
  resurveyRequired: number;
  rejected: number;
  fieldVerified: number;
  fieldVerifiedRate: number; // percentage 0-100
  evidencePackage: RealWorldEvidencePackageStatus;
  gpsEvidencePass: boolean;
  photoEvidencePass: boolean;
  geofencePass: boolean;
  checklistPass: boolean;
  rbacPass: boolean;
  idorPass: boolean;
  auditPass: boolean;
  sha256Pass: boolean;
  geoJsonPass: boolean;
  documentEnginePass: boolean;
  letterheadPass: boolean;
  automatedTestsPassCount: number;
  totalAutomatedTests: number;
  evaluatedAt: string;
  evaluatedBy: string;
  canFullyCertify: boolean;
  blockingReasons: string[];
}

export interface AutomatedCertificationTestResult {
  testId: string; // TEST-CERT-001 to TEST-CERT-030
  name: string;
  category: 'INTEGRITY' | 'SECURITY' | 'GPS' | 'WORKFLOW' | 'FIREWALL' | 'SYSTEM';
  status: 'PENDING' | 'PASS' | 'FAIL';
  message?: string;
}

export interface FieldSurveyChecklist {
  physicalFound: boolean;       // 1. Objek benar-benar ada di lokasi
  locationMatch: boolean;       // 2. Lokasi sesuai kondisi lapangan
  gpsObtained: boolean;         // 3. Koordinat GPS berhasil diperoleh
  gpsAccurate: boolean;         // 4. Akurasi GPS dapat diterima
  notDuplicate: boolean;        // 5. Objek tidak merupakan duplikasi
  conditionMatch: boolean;      // 6. Kondisi fisik telah diperiksa
  photoAvailable: boolean;      // 7. Foto bukti telah diambil
  onSiteSurvey: boolean;        // 8. Survey dilakukan langsung di lokasi
}

export interface CertificationRecord {
  verificationId: string;       // CERT-YYYYMMDD-XXXXXX
  verifiedBy: string;
  verifiedByRole: string;
  verifiedAt: string;
  verificationDecision: 'FIELD_VERIFIED' | 'REJECTED' | 'RESURVEY_REQUIRED';
  verificationNotes: string;
  surveyId: string;
  facilityId?: string;
  coordinateHash: string;
  photoChecksum: string[];
  auditId: string;
}

export interface PilotSurveyReport {
  generatedAt: string;
  generatedBy: string;
  totalTargetFacilities: number;
  totalSurveyed: number;
  totalSuccess: number;
  totalFailed: number;
  averageAccuracyMeters: number;
  totalOutsideBoundary: number;
  totalResurveyRequired: number;
  totalFieldVerified: number;
  totalPhotosCollected: number;
  pilotFacilityResults: {
    facilityId: string;
    namaFasilitas: string;
    kategori: FacilityCategory;
    surveyStatus: FieldSurveyStatus;
    accuracyMeters: number;
    photoCount: number;
    notes: string;
    insideBoundary: boolean;
  }[];
  overallAuditHash?: string;
  fieldIssues: string[];
  recommendations: string[];
}

export interface GeoBaseGateStatus {
  softwareStatus: 'PRODUCTION READY';
  fieldSurveyStatus: 'READY / ACTIVE';
  realWorldDataStatus: 'PENDING' | 'PARTIALLY_VERIFIED' | 'VERIFIED';
  referenceDataStatus: 'EXPLICITLY UNVERIFIED';
  geobaseCertification: 'NOT CERTIFIED' | 'PILOT CERTIFIED' | 'FULLY CERTIFIED';
  aiDataAccess: 'LOCKED UNTIL VERIFIED' | 'ACTIVE_FOR_VERIFIED';
  analytics: 'LOCKED UNTIL VERIFIED' | 'ACTIVE_FOR_VERIFIED';
  financialDecisionData: 'LOCKED UNTIL VERIFIED' | 'ACTIVE_FOR_VERIFIED';
  totalFacilities: number;
  referenceUnverifiedCount: number;
  pendingReviewCount: number;
  fieldVerifiedCount: number;
  resurveyRequiredCount: number;
  rejectedCount: number;
}

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
  surveyId?: string;
  geoId?: string;
  fasilitasId?: string;
  fileData: string; // Base64 data URL or remote URL
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  checksum?: string;
  category?: PhotoCategory;
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
  historyId?: string;
  geoId: string;
  facilityId?: string;
  eventType?: 'CREATE' | 'SURVEY_SUBMITTED' | 'SURVEY_APPROVED' | 'SURVEY_REJECTED' | 'RESURVEY_REQUESTED' | 'GEO_IMPORTED' | 'UPDATE_COORDINATE' | 'RESET';
  oldValue?: string;
  newValue?: string;
  oldGeometry?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number][];
  };
  newGeometry?: {
    latitude?: number;
    longitude?: number;
    coordinates?: [number, number][];
  };
  performedBy?: string;
  changedAt: string;
  timestamp?: string;
  changedBy: string;
  requestId?: string;
  hash?: string;
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

export interface FieldSurvey {
  surveyId: string;
  facilityId?: string;
  surveyCode: string; // SURVEY-YYYYMMDD-XXXXXX
  surveyorId: string;
  surveyorName: string;

  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;

  capturedAt: string;
  deviceTimestamp: string;
  serverTimestamp: string;

  gpsSignalStatus: GPSSignalStatus;
  gpsPrecisionStatus: GPSPrecisionStatus;

  photoEvidenceId?: string;
  photoEvidenceList?: GeoEvidence[];
  photoCount: number;

  insideRtBoundary: boolean;
  distanceFromExpectedPoint: number | null;
  expectedPointStatus?: DistanceComparisonStatus;

  surveyStatus: FieldSurveyStatus;

  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNote?: string;

  checklist?: FieldSurveyChecklist;
  qualityScoreGrade?: QualityScoreGrade;

  requestId: string;
  createdAt: string;
  updatedAt: string;

  dataSource: 'GPS_ON_SITE' | 'REFERENCE';
  sourceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  version: number;
}

export interface SurveySession {
  sessionId: string;
  surveyorId: string;
  surveyorName: string;
  startedAt: string;
  endedAt?: string;
  deviceInfo?: string;
  surveyCount: number;
  verifiedCount: number;
  pendingCount: number;
}

export interface GeoSurvey {
  surveyId: string; // SURVEY-YYYYMMDD-XXXXXX
  surveyCode?: string;
  requestId: string; // REQ-YYYYMMDD-XXXXXX
  surveyorId?: string;
  timestamp?: string;
  geoId?: string;
  fasilitasId?: string;
  namaFasilitas: string;
  kategori: FacilityCategory;
  subkategori: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  accuracyGrade: GPSAccuracyGrade;
  gpsSignalStatus?: GPSSignalStatus;
  gpsPrecisionStatus?: GPSPrecisionStatus;
  conditionScore: number;
  status: FacilityStatus;
  prioritas: FacilityPriority;
  source: 'SURVEYED' | 'REFERENCE';
  verificationStatus: VerificationStatus | FieldSurveyStatus;
  surveyStatus?: FieldSurveyStatus;
  capturedAt: string;
  capturedBy: string;
  capturedByName: string;
  insideRtBoundary?: boolean;
  distanceFromExpectedPoint?: number | null;
  expectedPointStatus?: DistanceComparisonStatus;
  checklist?: FieldSurveyChecklist;
  qualityScoreGrade?: QualityScoreGrade;
  deviceMetadata?: {
    userAgent?: string;
    platform?: string;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  photoEvidence?: GeoEvidence[];
  photoCount?: number;
  notes?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewNote?: string;
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
