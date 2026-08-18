// SMART RT 07 RW 11 GPA NGIJO - ENVIRONMENTAL FACILITY DATABASE & REAL-WORLD FIELD SURVEY GIS v2.0
// Authoritative Service for Facility Registry, Real-World GIS GeoBase, Field Surveys, and RBAC Operations

import {
  FasilitasLingkungan,
  FacilityCategory,
  FacilityCondition,
  FacilityPriority,
  FacilityStatus,
  FacilityActorSession,
  FacilityAnalytics,
  FacilityAuditLog,
  FacilityEventLink,
  FacilityComplaintReport,
  GeoObject,
  GeoSurvey,
  GeoEvidence,
  GeoHistory,
  RTBoundary,
  GPSAccuracyGrade,
  VerificationStatus,
  GeoSource
} from '../types/facility';
import {
  CONDITION_SCORE_MAP,
  GPA_NGIJO_BOUNDS,
  getGPSAccuracyGrade,
  calculateStaleStatus,
  RT07_REFERENCE_BOUNDARY,
  isInsideRT07Boundary,
  getDistanceComparisonStatus,
  getGPSSignalStatus,
  calculateSurveyQualityScore,
  calculateDistanceMeters
} from '../config/facilityConfig';

const STORAGE_KEY_FACILITIES = 'smart_rt07_facilities_v1';
const STORAGE_KEY_AUDIT = 'smart_rt07_facility_audit_v1';
const STORAGE_KEY_EVENT_LINKS = 'smart_rt07_facility_event_links_v1';
const STORAGE_KEY_COMPLAINTS = 'smart_rt07_facility_complaints_v1';
const STORAGE_KEY_GEO_OBJECTS = 'smart_rt07_geo_objects_v2';
const STORAGE_KEY_GEO_SURVEYS = 'smart_rt07_geo_surveys_v2';
const STORAGE_KEY_GEO_EVIDENCE = 'smart_rt07_geo_evidence_v2';
const STORAGE_KEY_GEO_HISTORY = 'smart_rt07_geo_history_v2';
const STORAGE_KEY_RT_BOUNDARY = 'smart_rt07_rt_boundary_v2';

// Initial authoritative seed data for RT 07 RW 11 GPA Ngijo
const INITIAL_FACILITIES: FasilitasLingkungan[] = [
  {
    fasilitasId: 'FAS-2026-000001',
    kodeFasilitas: 'FAS-RT07-KMN-001',
    namaFasilitas: 'Pos Keamanan Utama & Portal Masuk GPA',
    kategori: 'KEAMANAN',
    subkategori: 'POS_KEAMANAN',
    deskripsi: 'Pos jaga satpam gerbang utama RT 07 RW 11 GPA Ngijo dilengkapi portal otomatis dan perlengkapan ronda.',
    lokasi: 'Gerbang Masuk Utama RT 07 (Jl. Permata Raya)',
    alamatSingkat: 'Jl. Permata Raya Blok A-01 GPA Ngijo',
    latitude: -7.9018,
    longitude: 112.5975,
    akurasiLokasi: 3,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'BAIK',
    conditionScore: 5,
    tingkatPrioritas: 'NORMAL',
    tanggalPendataan: '2026-01-10',
    tanggalPemeriksaanTerakhir: '2026-08-10',
    tanggalPemeliharaanTerakhir: '2026-07-15',
    penanggungJawabId: 'WRG-001',
    penanggungJawabNama: 'Bpk. Eko Sucahyono (Ketua RT)',
    teleponPIC: '081234567890',
    fotoUtama: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60'
    ],
    jumlahFoto: 2,
    estimasiNilaiAset: 35000000,
    estimasiBiayaPerbaikan: 0,
    sumberDana: 'SWADAYA_WARGA',
    catatan: 'Kondisi fisik kokoh, monitor CCTV beroperasi normal 24 jam.',
    isPublic: true,
    linkedEventIds: ['EVT-2026-000001'],
    complaintCount: 0,
    createdAt: '2026-01-10T08:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-10T10:00:00.000Z',
    updatedBy: 'ADM-001',
    version: 3
  },
  {
    fasilitasId: 'FAS-2026-000002',
    kodeFasilitas: 'FAS-RT07-LMP-002',
    namaFasilitas: 'Lampu Penerangan Jalan Blok B No. 08',
    kategori: 'PENERANGAN',
    subkategori: 'LAMPU_JALAN',
    deskripsi: 'Tiang lampu PJU LED 50W penerangan jalan lorong Blok B dekat rumah warga.',
    lokasi: 'Depan Rumah Blok B-08 RT 07',
    alamatSingkat: 'Gang 2 Blok B RT 07 GPA Ngijo',
    latitude: -7.9023,
    longitude: 112.5982,
    akurasiLokasi: 4,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'TIDAK_LAYAK',
    conditionScore: 0,
    tingkatPrioritas: 'DARURAT',
    tanggalPendataan: '2026-02-15',
    tanggalPemeriksaanTerakhir: '2026-08-14',
    tanggalPemeliharaanTerakhir: '2026-05-10',
    penanggungJawabId: 'WRG-002',
    penanggungJawabNama: 'Seksi Pembangunan RT',
    teleponPIC: '081234567891',
    fotoUtama: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [],
    jumlahFoto: 1,
    estimasiNilaiAset: 1200000,
    estimasiBiayaPerbaikan: 350000,
    sumberDana: 'KAS_RT',
    catatan: 'Bohlam putus dan fitting korosi akibat hujan. Area gelap rawan keamanan.',
    isPublic: true,
    linkedEventIds: [],
    complaintCount: 3,
    createdAt: '2026-02-15T09:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-14T11:30:00.000Z',
    updatedBy: 'ADM-001',
    version: 4
  },
  {
    fasilitasId: 'FAS-2026-000003',
    kodeFasilitas: 'FAS-RT07-DRN-003',
    namaFasilitas: 'Saluran Drainase Utama Blok C & Bak Kontrol',
    kategori: 'DRAINASE',
    subkategori: 'SALURAN_AIR',
    deskripsi: 'Gorong-gorong dan selokan primer pembuangan air hujan penghubung Blok C ke sungai luar perumahan.',
    lokasi: 'Sisi Timur Blok C RT 07',
    alamatSingkat: 'Blok C Sisi Timur GPA Ngijo',
    latitude: -7.9031,
    longitude: 112.5991,
    akurasiLokasi: 5,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'RUSAK_SEDANG',
    conditionScore: 2,
    tingkatPrioritas: 'TINGGI',
    tanggalPendataan: '2026-01-20',
    tanggalPemeriksaanTerakhir: '2026-08-01',
    tanggalPemeliharaanTerakhir: '2026-04-20',
    penanggungJawabId: 'WRG-003',
    penanggungJawabNama: 'Bpk. Hendro (Seksi Kebersihan)',
    teleponPIC: '081234567892',
    fotoUtama: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [],
    jumlahFoto: 1,
    estimasiNilaiAset: 25000000,
    estimasiBiayaPerbaikan: 2000000,
    sumberDana: 'KAS_RT',
    catatan: 'Endapan lumpur dan retakan penutup beton memerlukan pengerukan kerja bakti.',
    isPublic: true,
    linkedEventIds: ['EVT-2026-000001'],
    complaintCount: 2,
    createdAt: '2026-01-20T10:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-01T15:00:00.000Z',
    updatedBy: 'ADM-001',
    version: 2
  },
  {
    fasilitasId: 'FAS-2026-000004',
    kodeFasilitas: 'FAS-RT07-BAL-004',
    namaFasilitas: 'Balai Warga & Pendopo Serbaguna RT 07',
    kategori: 'RUANG_PUBLIK',
    subkategori: 'BALAI_RT',
    deskripsi: 'Pusat kegiatan musyawarah warga, posyandu lansia & balita, serta kegiatan arisan RT.',
    lokasi: 'Fasum Taman Tengah RT 07',
    alamatSingkat: 'Taman Fasum RT 07 RW 11 GPA Ngijo',
    latitude: -7.9026,
    longitude: 112.5986,
    akurasiLokasi: 2,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'BAIK',
    conditionScore: 5,
    tingkatPrioritas: 'NORMAL',
    tanggalPendataan: '2026-01-05',
    tanggalPemeriksaanTerakhir: '2026-08-12',
    tanggalPemeliharaanTerakhir: '2026-07-20',
    penanggungJawabId: 'WRG-001',
    penanggungJawabNama: 'Bpk. Eko Sucahyono (Ketua RT)',
    teleponPIC: '081234567890',
    fotoUtama: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [],
    jumlahFoto: 1,
    estimasiNilaiAset: 65000000,
    estimasiBiayaPerbaikan: 0,
    sumberDana: 'SWADAYA_WARGA',
    catatan: 'Dilengkapi fasilitas sound system, proyektor, whiteboard, dan toilet bersih.',
    isPublic: true,
    linkedEventIds: ['EVT-2026-000002'],
    complaintCount: 0,
    createdAt: '2026-01-05T08:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-12T14:00:00.000Z',
    updatedBy: 'ADM-001',
    version: 1
  },
  {
    fasilitasId: 'FAS-2026-000005',
    kodeFasilitas: 'FAS-RT07-OLA-005',
    namaFasilitas: 'Lapangan Bulutangkis & Senam RT 07',
    kategori: 'OLAHRAGA',
    subkategori: 'LAPANGAN_BULUTANGKIS',
    deskripsi: 'Lapangan olahraga outdoor multifungsi beraspal halus dengan net bulutangkis dan tiang lampu sorot.',
    lokasi: 'Sebelah Barat Balai RT',
    alamatSingkat: 'Fasum Barat RT 07 GPA Ngijo',
    latitude: -7.9027,
    longitude: 112.5983,
    akurasiLokasi: 3,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'CUKUP_BAIK',
    conditionScore: 4,
    tingkatPrioritas: 'NORMAL',
    tanggalPendataan: '2026-01-15',
    tanggalPemeriksaanTerakhir: '2026-08-05',
    tanggalPemeliharaanTerakhir: '2026-06-10',
    penanggungJawabId: 'WRG-004',
    penanggungJawabNama: 'Seksi Pemuda & Olahraga',
    teleponPIC: '081234567893',
    fotoUtama: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [],
    jumlahFoto: 1,
    estimasiNilaiAset: 18000000,
    estimasiBiayaPerbaikan: 500000,
    sumberDana: 'SWADAYA_WARGA',
    catatan: 'Cat garis lapangan mulai pudar, permukaan aspal masih rata dan aman.',
    isPublic: true,
    linkedEventIds: [],
    complaintCount: 1,
    createdAt: '2026-01-15T09:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-05T16:00:00.000Z',
    updatedBy: 'ADM-001',
    version: 1
  },
  {
    fasilitasId: 'FAS-2026-000006',
    kodeFasilitas: 'FAS-RT07-SMP-006',
    namaFasilitas: 'Bank Sampah & Unit Komposter RT 07',
    kategori: 'SAMPAH',
    subkategori: 'BANK_SAMPAH',
    deskripsi: 'Tempat pemilahan sampah anorganik terpadu dan tong komposter pupuk organik cair/padat swadaya.',
    lokasi: 'Pojok Belakang Fasum Blok D',
    alamatSingkat: 'Ujung Blok D RT 07 GPA Ngijo',
    latitude: -7.9038,
    longitude: 112.5979,
    akurasiLokasi: 4,
    locationStatus: 'VERIFIED',
    status: 'AKTIF',
    kondisi: 'BAIK',
    conditionScore: 5,
    tingkatPrioritas: 'NORMAL',
    tanggalPendataan: '2026-02-01',
    tanggalPemeriksaanTerakhir: '2026-08-08',
    tanggalPemeliharaanTerakhir: '2026-07-01',
    penanggungJawabId: 'WRG-005',
    penanggungJawabNama: 'Ibu PKK RT 07',
    teleponPIC: '081234567894',
    fotoUtama: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60',
    fotoTambahan: [],
    jumlahFoto: 1,
    estimasiNilaiAset: 8000000,
    estimasiBiayaPerbaikan: 0,
    sumberDana: 'SWADAYA_WARGA',
    catatan: 'Pengelolaan tertib oleh kelompok dasawisma RT 07.',
    isPublic: true,
    linkedEventIds: [],
    complaintCount: 0,
    createdAt: '2026-02-01T11:00:00.000Z',
    createdBy: 'ADM-001',
    updatedAt: '2026-08-08T10:00:00.000Z',
    updatedBy: 'ADM-001',
    version: 1
  }
];

class FacilityService {
  private facilities: FasilitasLingkungan[] = [];
  private geoObjects: GeoObject[] = [];
  private geoSurveys: GeoSurvey[] = [];
  private geoEvidence: GeoEvidence[] = [];
  private geoHistory: GeoHistory[] = [];
  private rtBoundary: RTBoundary = RT07_REFERENCE_BOUNDARY;
  private auditLogs: FacilityAuditLog[] = [];
  private eventLinks: FacilityEventLink[] = [];
  private complaints: FacilityComplaintReport[] = [];
  private processedRequestIds: Set<string> = new Set();
  private backendOnline: boolean = true;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FACILITIES);
      if (stored) {
        this.facilities = JSON.parse(stored);
      } else {
        this.facilities = [...INITIAL_FACILITIES];
        this.saveState();
      }

      const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      }

      const storedLinks = localStorage.getItem(STORAGE_KEY_EVENT_LINKS);
      if (storedLinks) {
        this.eventLinks = JSON.parse(storedLinks);
      }

      const storedComplaints = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (storedComplaints) {
        this.complaints = JSON.parse(storedComplaints);
      }

      const storedGeo = localStorage.getItem(STORAGE_KEY_GEO_OBJECTS);
      if (storedGeo) {
        this.geoObjects = JSON.parse(storedGeo);
      } else {
        // Bootstrap GeoObjects from initial facilities
        this.geoObjects = this.facilities.map((f) => ({
          geoId: `GEO-${f.fasilitasId}`,
          objectType: 'FACILITY',
          geometryType: 'POINT',
          name: f.namaFasilitas,
          latitude: f.latitude,
          longitude: f.longitude,
          source: (f.coordinateSource || 'SURVEYED') as GeoSource,
          verificationStatus: (f.surveyStatus || 'VERIFIED') as VerificationStatus,
          accuracyMeters: f.accuracyMeters || f.akurasiLokasi || 4,
          accuracyGrade: (f.accuracyGrade || 'HIGH_PRECISION') as GPSAccuracyGrade,
          capturedAt: f.createdAt,
          capturedBy: f.createdBy,
          verifiedAt: f.updatedAt,
          verifiedBy: f.updatedBy,
          notes: f.catatan,
          qualityScore: f.qualityScore || 5,
          staleStatus: f.staleStatus || 'FRESH',
          lastSurveyedAt: f.lastSurveyedAt || f.createdAt,
          lastSurveyedBy: f.lastSurveyedBy || f.penanggungJawabNama,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
          version: f.version
        }));
        this.saveGeoState();
      }

      const storedSurveys = localStorage.getItem(STORAGE_KEY_GEO_SURVEYS);
      if (storedSurveys) {
        this.geoSurveys = JSON.parse(storedSurveys);
      }

      const storedEvidence = localStorage.getItem(STORAGE_KEY_GEO_EVIDENCE);
      if (storedEvidence) {
        this.geoEvidence = JSON.parse(storedEvidence);
      }

      const storedHistory = localStorage.getItem(STORAGE_KEY_GEO_HISTORY);
      if (storedHistory) {
        this.geoHistory = JSON.parse(storedHistory);
      }

      const storedBoundary = localStorage.getItem(STORAGE_KEY_RT_BOUNDARY);
      if (storedBoundary) {
        this.rtBoundary = JSON.parse(storedBoundary);
      }
    } catch {
      this.facilities = [...INITIAL_FACILITIES];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_FACILITIES, JSON.stringify(this.facilities));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEY_EVENT_LINKS, JSON.stringify(this.eventLinks));
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(this.complaints));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }

  private saveGeoState() {
    try {
      localStorage.setItem(STORAGE_KEY_GEO_OBJECTS, JSON.stringify(this.geoObjects));
      localStorage.setItem(STORAGE_KEY_GEO_SURVEYS, JSON.stringify(this.geoSurveys));
      localStorage.setItem(STORAGE_KEY_GEO_EVIDENCE, JSON.stringify(this.geoEvidence));
      localStorage.setItem(STORAGE_KEY_GEO_HISTORY, JSON.stringify(this.geoHistory));
      localStorage.setItem(STORAGE_KEY_RT_BOUNDARY, JSON.stringify(this.rtBoundary));
    } catch (e) {
      console.warn('Geo state save warning:', e);
    }
  }

  public setBackendStatus(isOnline: boolean) {
    this.backendOnline = isOnline;
  }

  public getBackendStatus(): boolean {
    return this.backendOnline;
  }

  public generateRequestId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  // RBAC Permission Check
  public hasPermission(
    role: string,
    action:
      | 'READ'
      | 'CREATE'
      | 'UPDATE'
      | 'DELETE'
      | 'REPORT'
      | 'INSPECT'
      | 'MAINTAIN'
      | 'VIEW_INTERNAL'
      | 'SURVEY'
      | 'VERIFY'
      | 'MANAGE_BOUNDARY'
  ): boolean {
    const r = role.toUpperCase();
    if (r === 'ADMIN' || r === 'KETUA_RT') return true;

    switch (action) {
      case 'READ':
      case 'REPORT':
      case 'SURVEY':
        return true; // Warga can submit surveys to PENDING
      case 'VIEW_INTERNAL':
        return ['SEKRETARIS_RT', 'BENDAHARA_RT', 'SEKSI_KEGIATAN', 'SEKSI_LINGKUNGAN'].includes(r);
      case 'CREATE':
      case 'UPDATE':
      case 'INSPECT':
      case 'MAINTAIN':
        return ['SEKRETARIS_RT', 'SEKSI_KEGIATAN', 'SEKSI_LINGKUNGAN'].includes(r);
      case 'VERIFY':
        return ['SEKRETARIS_RT', 'ADMIN', 'KETUA_RT'].includes(r);
      case 'MANAGE_BOUNDARY':
        return ['SEKRETARIS_RT', 'ADMIN', 'KETUA_RT'].includes(r);
      case 'DELETE':
        return false; // Only Admin & Ketua RT
      default:
        return false;
    }
  }

  // Audit Logger
  private logAudit(
    actor: FacilityActorSession,
    action: string,
    resourceType: FacilityAuditLog['resourceType'],
    resourceId: string,
    authorization: 'AUTHORIZED' | 'DENIED',
    status: 'SUCCESS' | 'FAILED',
    previousState?: string,
    newState?: string,
    details?: string
  ) {
    const entry: FacilityAuditLog = {
      auditId: `AUDIT-FAS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      actorUserId: actor.userId,
      actorRole: actor.role,
      action,
      resourceType,
      resourceId,
      previousState,
      newState,
      authorization,
      status,
      details
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.saveState();
  }

  // GET FACILITIES (with Privacy / PDP Filtering)
  public getFacilities(actor: FacilityActorSession): FasilitasLingkungan[] {
    const isInternal = this.hasPermission(actor.role, 'VIEW_INTERNAL');
    
    return this.facilities
      .filter((f) => f.status !== 'DIHAPUS')
      .map((f) => {
        if (!isInternal && actor.role.toUpperCase() === 'WARGA') {
          // Public Privacy Masking
          return {
            ...f,
            catatan: undefined, // internal remarks hidden
            estimasiNilaiAset: undefined, // internal financial estimation hidden
            teleponPIC: undefined // private phone hidden
          };
        }
        return f;
      });
  }

  public getFacilityById(actor: FacilityActorSession, id: string): FasilitasLingkungan | null {
    const facility = this.facilities.find((f) => f.fasilitasId === id && f.status !== 'DIHAPUS');
    if (!facility) return null;

    const isInternal = this.hasPermission(actor.role, 'VIEW_INTERNAL');
    if (!isInternal && actor.role.toUpperCase() === 'WARGA') {
      return {
        ...facility,
        catatan: undefined,
        estimasiNilaiAset: undefined,
        teleponPIC: undefined
      };
    }
    return facility;
  }

  // CREATE FACILITY
  public createFacility(
    actor: FacilityActorSession,
    data: Omit<FasilitasLingkungan, 'fasilitasId' | 'kodeFasilitas' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'version' | 'jumlahFoto'>,
    requestId: string
  ): { success: boolean; data?: FasilitasLingkungan; error?: string; code?: string; backendConnected?: boolean } {
    // 1. Concurrency / Idempotency Check
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        error: 'Permintaan duplikat terdeteksi (Idempotent violation).',
        code: 'DUPLICATE_REQUEST'
      };
    }
    this.processedRequestIds.add(requestId);

    // 2. Offline Fail-Closed Check
    if (!this.backendOnline || !actor.isBackendConnected) {
      this.logAudit(actor, 'CREATE_FACILITY', 'FASILITAS', 'PENDING', 'AUTHORIZED', 'FAILED', undefined, undefined, 'Offline fail-closed rejected write');
      return {
        success: false,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    // 3. RBAC Check
    if (!this.hasPermission(actor.role, 'CREATE')) {
      this.logAudit(actor, 'CREATE_FACILITY', 'FASILITAS', 'DENIED', 'DENIED', 'FAILED', undefined, undefined, 'RBAC permission denied');
      return {
        success: false,
        error: 'Akses Ditolak: Anda tidak memiliki izin untuk mendaftarkan fasilitas lingkungan.',
        code: 'FORBIDDEN'
      };
    }

    // 4. Coordinates Validation
    if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
      return {
        success: false,
        error: 'Latitude koordinat tidak valid (harus antara -90 hingga 90 derajat).',
        code: 'INVALID_COORDINATES'
      };
    }
    if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
      return {
        success: false,
        error: 'Longitude koordinat tidak valid (harus antara -180 hingga 180 derajat).',
        code: 'INVALID_COORDINATES'
      };
    }

    // 5. Category Validation
    if (!data.kategori) {
      return {
        success: false,
        error: 'Kategori fasilitas wajib diisi sesuai enum standar.',
        code: 'MISSING_CATEGORY'
      };
    }

    // 6. Condition Validation
    if (!data.kondisi) {
      return {
        success: false,
        error: 'Kondisi fasilitas wajib diisi.',
        code: 'INVALID_CONDITION'
      };
    }

    const nextIdNum = this.facilities.length + 1;
    const fasilitasId = `FAS-2026-${String(nextIdNum).padStart(6, '0')}`;
    const prefixMap: Record<string, string> = {
      KEAMANAN: 'KMN',
      PENERANGAN: 'LMP',
      JALAN: 'JLN',
      DRAINASE: 'DRN',
      AIR: 'AIR',
      SAMPAH: 'SMP',
      TEMPAT_IBADAH: 'IBD',
      POSYANDU: 'PSY',
      OLAHRAGA: 'OLA',
      TAMAN: 'TMN',
      RUANG_PUBLIK: 'BAL',
      PARKIR: 'PKR',
      FASILITAS_ANAK: 'ANK',
      TELEKOMUNIKASI: 'TLK',
      LAINNYA: 'FAS'
    };
    const codePrefix = prefixMap[data.kategori] || 'FAS';
    const kodeFasilitas = `FAS-RT07-${codePrefix}-${String(nextIdNum).padStart(3, '0')}`;

    const score = CONDITION_SCORE_MAP[data.kondisi] ?? 0;
    const nowIso = new Date().toISOString();

    const newFacility: FasilitasLingkungan = {
      ...data,
      fasilitasId,
      kodeFasilitas,
      conditionScore: score,
      jumlahFoto: (data.fotoUtama ? 1 : 0) + (data.fotoTambahan ? data.fotoTambahan.length : 0),
      createdAt: nowIso,
      createdBy: actor.userId,
      updatedAt: nowIso,
      updatedBy: actor.userId,
      version: 1
    };

    this.facilities.unshift(newFacility);
    this.saveState();

    this.logAudit(
      actor,
      'CREATE_FACILITY',
      'FASILITAS',
      fasilitasId,
      'AUTHORIZED',
      'SUCCESS',
      undefined,
      JSON.stringify({ nama: newFacility.namaFasilitas, kode: kodeFasilitas }),
      `Fasilitas baru ${newFacility.namaFasilitas} berhasil didaftarkan.`
    );

    return {
      success: true,
      data: newFacility,
      backendConnected: true
    };
  }

  // UPDATE FACILITY
  public updateFacility(
    actor: FacilityActorSession,
    id: string,
    data: Partial<FasilitasLingkungan>,
    requestId: string
  ): { success: boolean; data?: FasilitasLingkungan; error?: string; code?: string; backendConnected?: boolean } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Permintaan duplikat terdeteksi.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || !actor.isBackendConnected) {
      return { success: false, error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.', code: 'NOT_COMMITTED', backendConnected: false };
    }

    if (!this.hasPermission(actor.role, 'UPDATE')) {
      return { success: false, error: 'Akses Ditolak: Anda tidak memiliki izin untuk mengubah data fasilitas.', code: 'FORBIDDEN' };
    }

    const index = this.facilities.findIndex((f) => f.fasilitasId === id && f.status !== 'DIHAPUS');
    if (index === -1) {
      return { success: false, error: 'Fasilitas tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const existing = this.facilities[index];

    // Coordinate validation if supplied
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      return { success: false, error: 'Latitude koordinat tidak valid.', code: 'INVALID_COORDINATES' };
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      return { success: false, error: 'Longitude koordinat tidak valid.', code: 'INVALID_COORDINATES' };
    }

    const updatedCondition = data.kondisi || existing.kondisi;
    const score = CONDITION_SCORE_MAP[updatedCondition] ?? existing.conditionScore;

    const updated: FasilitasLingkungan = {
      ...existing,
      ...data,
      fasilitasId: existing.fasilitasId, // immutable
      kodeFasilitas: existing.kodeFasilitas, // immutable
      kondisi: updatedCondition,
      conditionScore: score,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
      version: existing.version + 1
    };

    this.facilities[index] = updated;
    this.saveState();

    this.logAudit(
      actor,
      'UPDATE_FACILITY',
      'FASILITAS',
      id,
      'AUTHORIZED',
      'SUCCESS',
      JSON.stringify(existing),
      JSON.stringify(updated),
      `Data fasilitas ${updated.namaFasilitas} berhasil diperbarui.`
    );

    return { success: true, data: updated, backendConnected: true };
  }

  // SOFT DELETE FACILITY
  public deleteFacility(
    actor: FacilityActorSession,
    id: string,
    reason: string,
    requestId: string
  ): { success: boolean; error?: string; code?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Permintaan duplikat.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || !actor.isBackendConnected) {
      return { success: false, error: 'Backend offline. Fail-closed policy.', code: 'NOT_COMMITTED' };
    }

    if (!this.hasPermission(actor.role, 'DELETE')) {
      return { success: false, error: 'Hanya Administrator & Ketua RT yang dapat menghapus fasilitas.', code: 'FORBIDDEN' };
    }

    const index = this.facilities.findIndex((f) => f.fasilitasId === id && f.status !== 'DIHAPUS');
    if (index === -1) {
      return { success: false, error: 'Fasilitas tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const existing = this.facilities[index];
    existing.status = 'DIHAPUS';
    existing.updatedAt = new Date().toISOString();
    existing.updatedBy = actor.userId;
    existing.catatan = `${existing.catatan ? existing.catatan + ' | ' : ''}Dihapus: ${reason}`;
    existing.version += 1;

    this.facilities[index] = existing;
    this.saveState();

    this.logAudit(
      actor,
      'DELETE_FACILITY',
      'FASILITAS',
      id,
      'AUTHORIZED',
      'SUCCESS',
      'AKTIF',
      'DIHAPUS',
      `Fasilitas ${existing.namaFasilitas} dihapus (Soft Delete). Alasan: ${reason}`
    );

    return { success: true };
  }

  // LINK COMPLAINT TO FACILITY
  public reportComplaint(
    actor: FacilityActorSession,
    complaintData: Omit<FacilityComplaintReport, 'complaintId' | 'createdAt' | 'status'>,
    requestId: string
  ): { success: boolean; data?: FacilityComplaintReport; error?: string; code?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Permintaan pengaduan duplikat.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || !actor.isBackendConnected) {
      return { success: false, error: 'Backend offline. Pengaduan belum tersimpan.', code: 'NOT_COMMITTED' };
    }

    const facility = this.facilities.find((f) => f.fasilitasId === complaintData.fasilitasId);
    if (!facility) {
      return { success: false, error: 'Fasilitas yang dilaporkan tidak valid.', code: 'NOT_FOUND' };
    }

    const complaintId = `ADU-FAS-${Date.now().toString().slice(-6)}`;
    const newComplaint: FacilityComplaintReport = {
      ...complaintData,
      complaintId,
      status: 'BARU',
      createdAt: new Date().toISOString()
    };

    this.complaints.unshift(newComplaint);
    
    // Update complaint count on facility
    facility.complaintCount = (facility.complaintCount || 0) + 1;
    facility.updatedAt = new Date().toISOString();
    this.saveState();

    this.logAudit(
      actor,
      'LINK_COMPLAINT',
      'PENGADUAN',
      complaintId,
      'AUTHORIZED',
      'SUCCESS',
      undefined,
      JSON.stringify({ fasilitasId: facility.fasilitasId, masalah: complaintData.jenisMasalah }),
      `Pengaduan warga untuk fasilitas ${facility.namaFasilitas} berhasil dicatat.`
    );

    return { success: true, data: newComplaint };
  }

  // Alias for backward compatibility
  public createComplaint(
    actor: FacilityActorSession,
    complaintData: Omit<FacilityComplaintReport, 'complaintId' | 'createdAt' | 'status'>,
    requestId: string
  ) {
    return this.reportComplaint(actor, complaintData, requestId);
  }

  public getComplaints(actor: FacilityActorSession, facilityId?: string): FacilityComplaintReport[] {
    if (facilityId) {
      return this.complaints.filter((c) => c.fasilitasId === facilityId);
    }
    return this.complaints;
  }

  // LINK EVENT TO FACILITY
  public linkEventToFacility(
    actor: FacilityActorSession,
    eventId: string,
    facilityId: string,
    keterangan: string,
    requestId: string
  ): { success: boolean; data?: FacilityEventLink; error?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat permintaan relasi event.' };
    }
    this.processedRequestIds.add(requestId);

    if (!this.hasPermission(actor.role, 'CREATE')) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const facility = this.facilities.find((f) => f.fasilitasId === facilityId);
    if (!facility) {
      return { success: false, error: 'Fasilitas tidak ditemukan.' };
    }

    const link: FacilityEventLink = {
      linkId: `LINK-${Date.now()}`,
      eventId,
      fasilitasId: facilityId,
      keterangan,
      createdAt: new Date().toISOString()
    };

    this.eventLinks.unshift(link);
    if (!facility.linkedEventIds) facility.linkedEventIds = [];
    if (!facility.linkedEventIds.includes(eventId)) {
      facility.linkedEventIds.push(eventId);
    }
    this.saveState();

    this.logAudit(actor, 'LINK_EVENT', 'FASILITAS', facilityId, 'AUTHORIZED', 'SUCCESS', undefined, eventId, `Fasilitas dikaitkan dengan Kegiatan ${eventId}`);
    return { success: true, data: link };
  }

  // ANALYTICS & DASHBOARD AGGREGATION
  public getAnalytics(actor: FacilityActorSession): FacilityAnalytics {
    const list = this.getFacilities(actor);

    const totalFacilities = list.length;
    const activeFacilities = list.filter((f) => f.status === 'AKTIF').length;
    const goodConditionFacilities = list.filter((f) => f.kondisi === 'BAIK').length;
    const fairConditionFacilities = list.filter((f) => f.kondisi === 'CUKUP_BAIK').length;
    const damagedFacilities = list.filter((f) => ['RUSAK_RINGAN', 'RUSAK_SEDANG', 'RUSAK_BERAT'].includes(f.kondisi)).length;
    const emergencyFacilities = list.filter((f) => f.tingkatPrioritas === 'DARURAT').length;
    const underRepairFacilities = list.filter((f) => f.status === 'DALAM_PERBAIKAN').length;
    const unassessedFacilities = list.filter((f) => f.kondisi === 'BELUM_DINILAI').length;

    const totalScore = list.reduce((acc, f) => acc + (f.conditionScore || 0), 0);
    const averageConditionScore = totalFacilities > 0 ? Number((totalScore / totalFacilities).toFixed(2)) : 0;

    const totalAssetValue = list.reduce((acc, f) => acc + (f.estimasiNilaiAset || 0), 0);
    const totalRepairCostEstimation = list.reduce((acc, f) => acc + (f.estimasiBiayaPerbaikan || 0), 0);

    const facilityCountByCategory = {} as Record<FacilityCategory, number>;
    const facilityCountByCondition = {} as Record<FacilityCondition, number>;
    const facilityCountByStatus = {} as Record<FacilityStatus, number>;
    const facilityCountByPriority = {} as Record<FacilityPriority, number>;

    list.forEach((f) => {
      facilityCountByCategory[f.kategori] = (facilityCountByCategory[f.kategori] || 0) + 1;
      facilityCountByCondition[f.kondisi] = (facilityCountByCondition[f.kondisi] || 0) + 1;
      facilityCountByStatus[f.status] = (facilityCountByStatus[f.status] || 0) + 1;
      facilityCountByPriority[f.tingkatPrioritas] = (facilityCountByPriority[f.tingkatPrioritas] || 0) + 1;
    });

    // Top 5 Problematic Facilities (Weighted: Complaints * 2 + (5 - conditionScore) * 3 + (isEmergency ? 10 : 0))
    const sortedProblematic = [...list]
      .map((f) => {
        const complaints = f.complaintCount || 0;
        const conditionDeficit = 5 - f.conditionScore;
        const priorityWeight = f.tingkatPrioritas === 'DARURAT' ? 10 : f.tingkatPrioritas === 'TINGGI' ? 5 : 1;
        const urgencyScore = complaints * 2 + conditionDeficit * 3 + priorityWeight;
        return { fasilitas: f, complaintCount: complaints, urgencyScore };
      })
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 5);

    return {
      totalFacilities,
      activeFacilities,
      goodConditionFacilities,
      fairConditionFacilities,
      damagedFacilities,
      emergencyFacilities,
      underRepairFacilities,
      unassessedFacilities,
      averageConditionScore,
      totalAssetValue,
      totalRepairCostEstimation,
      facilityCountByCategory,
      facilityCountByCondition,
      facilityCountByStatus,
      facilityCountByPriority,
      topProblematicFacilities: sortedProblematic
    };
  }

  // ==========================================
  // REAL-WORLD GIS GEOBASE METHODS (v2.0)
  // ==========================================

  public getGeoObjects(actor: FacilityActorSession): GeoObject[] {
    return this.geoObjects;
  }

  public getRTBoundary(actor: FacilityActorSession): RTBoundary {
    return this.rtBoundary;
  }

  public updateRTBoundary(
    actor: FacilityActorSession,
    boundaryData: Partial<RTBoundary>,
    requestId: string
  ): { success: boolean; data?: RTBoundary; error?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat permintaan update boundary.' };
    }
    this.processedRequestIds.add(requestId);

    if (!actor.isBackendConnected || !this.backendOnline) {
      return { success: false, error: 'NOT_COMMITTED: Fail-closed mode aktif. Backend tidak terhubung.' };
    }

    if (!this.hasPermission(actor.role, 'MANAGE_BOUNDARY')) {
      this.logAudit(actor, 'UPDATE_BOUNDARY', 'FASILITAS', 'BOUNDARY', 'DENIED', 'FAILED', undefined, undefined, 'Role tidak memiliki hak kelola batas RT.');
      return { success: false, error: 'Akses ditolak: Hanya Ketua RT / Sekretaris / Admin yang dapat mengubah batas wilayah.' };
    }

    this.rtBoundary = {
      ...this.rtBoundary,
      ...boundaryData,
      updatedAt: new Date().toISOString()
    };

    this.saveGeoState();
    this.logAudit(actor, 'UPDATE_BOUNDARY', 'FASILITAS', this.rtBoundary.boundaryId, 'AUTHORIZED', 'SUCCESS', undefined, JSON.stringify(this.rtBoundary), 'Batas wilayah RT 07 RW 11 diperbarui.');

    return { success: true, data: this.rtBoundary };
  }

  // GPS FIELD SURVEY CAPTURE (FIELD SURVEY EXECUTION v1.0)
  public createGeoSurvey(
    actor: FacilityActorSession,
    surveyData: {
      fasilitasId?: string;
      namaFasilitas: string;
      kategori: FacilityCategory;
      subkategori?: string;
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      altitude?: number | null;
      heading?: number | null;
      speed?: number | null;
      deviceTimestamp?: string;
      conditionScore?: number;
      status?: FacilityStatus;
      prioritas?: FacilityPriority;
      notes?: string;
      checklist?: any;
      deviceMetadata?: any;
      photoEvidence?: GeoEvidence[];
      requestId?: string;
    },
    requestIdParam?: string
  ): { success: boolean; data?: GeoSurvey; error?: string; code?: string; isDuplicate?: boolean } {
    const requestId = surveyData.requestId || requestIdParam || this.generateRequestId();
    const { latitude, longitude, accuracyMeters } = surveyData;

    // 1. Idempotency Check
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat pengiriman survey lapangan (Idempotency Error).', code: 'DUPLICATE_REQUEST', isDuplicate: true };
    }
    this.processedRequestIds.add(requestId);

    // 2. Fail-Closed Offline Verification
    if (!actor.isBackendConnected || !this.backendOnline) {
      return {
        success: false,
        error: 'SURVEY NOT COMMITTED: Fail-closed mode aktif. Backend belum terhubung. Survey belum disahkan.',
        code: 'NOT_COMMITTED'
      };
    }

    // 3. RBAC Check (Warga can submit surveys, enters PENDING_REVIEW)
    if (!this.hasPermission(actor.role, 'SURVEY')) {
      this.logAudit(actor, 'CREATE_SURVEY', 'FASILITAS', 'GEO_SURVEY', 'DENIED', 'FAILED', undefined, undefined, 'Role tidak berwenang melakukan survey.');
      return { success: false, error: 'Akses ditolak untuk melakukan survey GPS.', code: 'FORBIDDEN' };
    }

    // 4. Coordinate Range Validation
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      return { success: false, error: 'Koordinat Latitude tidak valid (harus antara -90 dan 90).', code: 'INVALID_COORDINATES' };
    }
    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      return { success: false, error: 'Koordinat Longitude tidak valid (harus antara -180 dan 180).', code: 'INVALID_COORDINATES' };
    }

    // 5. GPS Accuracy & Signal Derivation
    const accuracyInfo = getGPSAccuracyGrade(accuracyMeters);
    const signalInfo = getGPSSignalStatus(accuracyMeters);

    // 6. Geofence Check against RT 07 RW 11 GPA Ngijo
    const insideBoundary = isInsideRT07Boundary(latitude, longitude);

    // 7. Distance comparison against expected / reference point if attached to existing facility
    let distanceFromExpected: number | null = null;
    let expectedStatus: any = 'NO_REFERENCE';
    let existingFacility: FasilitasLingkungan | undefined;

    if (surveyData.fasilitasId) {
      existingFacility = this.facilities.find((f) => f.fasilitasId === surveyData.fasilitasId);
      if (existingFacility) {
        distanceFromExpected = calculateDistanceMeters(
          existingFacility.latitude,
          existingFacility.longitude,
          latitude,
          longitude
        );
        expectedStatus = getDistanceComparisonStatus(distanceFromExpected).status;
      }
    }

    // 8. Near-duplicate coordinate detection (< 2.0 meters to another distinct facility)
    const nearFacilities = this.facilities.filter(
      (f) => f.fasilitasId !== surveyData.fasilitasId && calculateDistanceMeters(f.latitude, f.longitude, latitude, longitude) < 2.0
    );
    const hasNearDuplicate = nearFacilities.length > 0;

    // 9. Photo & Checklist Verification
    const photoList = surveyData.photoEvidence || [];
    const isNewFacility = !surveyData.fasilitasId;
    const isHighPriority = surveyData.prioritas === 'TINGGI' || surveyData.prioritas === 'DARURAT';

    if (isNewFacility && photoList.length === 0) {
      return {
        success: false,
        error: 'Fasilitas baru wajib menyertakan minimal 1 foto bukti fisik lapangan.',
        code: 'PHOTO_REQUIRED'
      };
    }

    const defaultChecklist = {
      locationMatch: true,
      physicalFound: true,
      conditionMatch: true,
      photoAvailable: photoList.length > 0,
      gpsAccurate: accuracyMeters <= 25,
      insideRt: insideBoundary,
      notDuplicate: !hasNearDuplicate,
      dataComplete: true,
      ...(surveyData.checklist || {})
    };

    const isChecklistComplete = Object.values(defaultChecklist).every(Boolean);

    // 10. Quality Score calculation
    const quality = calculateSurveyQualityScore({
      accuracyMeters,
      insideBoundary,
      photoCount: photoList.length,
      checklistComplete: isChecklistComplete
    });

    // 11. Generate Survey Code: SURVEY-YYYYMMDD-XXXXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seqNum = String(this.geoSurveys.length + 1).padStart(6, '0');
    const surveyCode = `SURVEY-${dateStr}-${seqNum}`;
    const surveyId = surveyCode;
    const geoId = surveyData.fasilitasId ? `GEO-${surveyData.fasilitasId}` : `GEO-${Date.now()}`;
    const now = new Date().toISOString();

    // 12. Construct GeoSurvey / FieldSurvey Entity
    const newSurvey: GeoSurvey = {
      surveyId,
      surveyCode,
      requestId,
      geoId,
      fasilitasId: surveyData.fasilitasId,
      namaFasilitas: surveyData.namaFasilitas.trim(),
      kategori: surveyData.kategori,
      subkategori: surveyData.subkategori || 'UMUM',
      latitude,
      longitude,
      accuracyMeters,
      accuracyGrade: accuracyInfo.grade,
      gpsSignalStatus: signalInfo.status,
      gpsPrecisionStatus: accuracyInfo.grade,
      conditionScore: surveyData.conditionScore ?? (existingFacility ? existingFacility.conditionScore : 5),
      status: surveyData.status || (existingFacility ? existingFacility.status : 'AKTIF'),
      prioritas: surveyData.prioritas || (existingFacility ? existingFacility.tingkatPrioritas : 'NORMAL'),
      source: 'SURVEYED',
      verificationStatus: 'PENDING',
      surveyStatus: 'PENDING_REVIEW',
      capturedAt: now,
      capturedBy: actor.userId,
      capturedByName: actor.nama,
      insideRtBoundary: insideBoundary,
      distanceFromExpectedPoint: distanceFromExpected,
      expectedPointStatus: expectedStatus,
      checklist: defaultChecklist,
      qualityScoreGrade: quality.grade,
      deviceMetadata: {
        altitude: surveyData.altitude ?? null,
        heading: surveyData.heading ?? null,
        speed: surveyData.speed ?? null,
        ...(surveyData.deviceMetadata || {})
      },
      photoEvidence: photoList,
      photoCount: photoList.length,
      notes: surveyData.notes
    };

    this.geoSurveys.unshift(newSurvey);

    // If survey is attached to existing facility, record GeoHistory for coordinate shifts
    if (surveyData.fasilitasId && existingFacility) {
      const history: GeoHistory = {
        geoHistoryId: `GEO-HIST-${Date.now()}`,
        geoId,
        oldGeometry: { latitude: existingFacility.latitude, longitude: existingFacility.longitude },
        newGeometry: { latitude, longitude },
        changedAt: now,
        changedBy: actor.nama,
        reason: `Pengukuran GPS Lapangan (${surveyCode}) oleh ${actor.nama} [Akurasi: ±${accuracyMeters}m - ${accuracyInfo.label}]`
      };
      this.geoHistory.unshift(history);
    }

    // Update or add corresponding GeoObject in PENDING status
    const existingGeo = this.geoObjects.find((g) => g.geoId === geoId);
    if (existingGeo) {
      existingGeo.latitude = latitude;
      existingGeo.longitude = longitude;
      existingGeo.accuracyMeters = accuracyMeters;
      existingGeo.accuracyGrade = accuracyInfo.grade;
      existingGeo.source = 'SURVEYED';
      existingGeo.verificationStatus = 'PENDING';
      existingGeo.capturedAt = now;
      existingGeo.capturedBy = actor.nama;
      existingGeo.updatedAt = now;
      existingGeo.staleStatus = 'FRESH';
      existingGeo.lastSurveyedAt = now;
      existingGeo.lastSurveyedBy = actor.nama;
    } else {
      this.geoObjects.unshift({
        geoId,
        objectType: 'FACILITY',
        geometryType: 'POINT',
        name: surveyData.namaFasilitas,
        latitude,
        longitude,
        source: 'SURVEYED',
        verificationStatus: 'PENDING',
        accuracyMeters,
        accuracyGrade: accuracyInfo.grade,
        capturedAt: now,
        capturedBy: actor.nama,
        notes: surveyData.notes,
        staleStatus: 'FRESH',
        qualityScore: quality.grade === 'EXCELLENT' ? 5 : 3,
        lastSurveyedAt: now,
        lastSurveyedBy: actor.nama,
        createdAt: now,
        updatedAt: now,
        version: 1
      });
    }

    this.saveGeoState();
    this.logAudit(
      actor,
      'CREATE_SURVEY',
      'FASILITAS',
      surveyId,
      'AUTHORIZED',
      'SUCCESS',
      undefined,
      JSON.stringify({ surveyCode, latitude, longitude, accuracyMeters, insideBoundary }),
      `Survey Lapangan ${surveyCode} berhasil dicatat (${accuracyInfo.label}). Status: PENDING_REVIEW.`
    );

    return { success: true, data: newSurvey };
  }

  // VERIFICATION WORKFLOW
  public verifyGeoSurvey(
    actor: FacilityActorSession,
    surveyId: string,
    reviewNotes?: string,
    requestId?: string
  ): { success: boolean; data?: GeoSurvey; error?: string; code?: string } {
    if (requestId && this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat permintaan verifikasi survey.', code: 'DUPLICATE_REQUEST' };
    }
    if (requestId) this.processedRequestIds.add(requestId);

    if (!actor.isBackendConnected || !this.backendOnline) {
      return { success: false, error: 'NOT_COMMITTED: Fail-closed mode aktif. Backend belum terhubung.', code: 'NOT_COMMITTED' };
    }

    if (!this.hasPermission(actor.role, 'VERIFY')) {
      this.logAudit(actor, 'VERIFY_SURVEY', 'FASILITAS', surveyId, 'DENIED', 'FAILED', undefined, undefined, 'Role tidak berwenang memverifikasi survey.');
      return { success: false, error: 'Akses ditolak: Hanya Pengurus/Sekretaris/Ketua RT yang dapat memverifikasi survey lapangan.', code: 'FORBIDDEN' };
    }

    const survey = this.geoSurveys.find((s) => s.surveyId === surveyId);
    if (!survey) {
      return { success: false, error: 'Data survey lapangan tidak ditemukan.', code: 'NOT_FOUND' };
    }

    // Geofence enforcement: Cannot verify if outside RT boundary
    if (survey.insideRtBoundary === false) {
      this.logAudit(actor, 'VERIFY_SURVEY', 'FASILITAS', surveyId, 'AUTHORIZED', 'FAILED', undefined, undefined, 'Ditolak: Titik berada di luar batas RT 07 RW 11');
      return {
        success: false,
        error: 'GEOFENCE REJECTED: Titik GPS berada di luar batas wilayah RT 07 RW 11 GPA Ngijo. Tidak dapat diverifikasi sebagai data resmi.',
        code: 'OUTSIDE_RT_BOUNDARY'
      };
    }

    const now = new Date().toISOString();
    survey.verificationStatus = 'VERIFIED';
    survey.surveyStatus = 'VERIFIED';
    survey.reviewedBy = actor.nama;
    survey.reviewerId = actor.userId;
    survey.reviewerName = actor.nama;
    survey.reviewedAt = now;
    survey.reviewNotes = reviewNotes || 'Terverifikasi sesuai kondisi fisik lapangan & GPS hardware metadata.';
    survey.reviewNote = survey.reviewNotes;

    // Update underlying GeoObject
    const targetGeo = this.geoObjects.find((g) => g.geoId === survey.geoId);
    if (targetGeo) {
      targetGeo.verificationStatus = 'VERIFIED';
      targetGeo.verifiedBy = actor.nama;
      targetGeo.verifiedAt = now;
      targetGeo.updatedAt = now;
    }

    // Update single-source-of-truth FasilitasLingkungan if linked
    if (survey.fasilitasId) {
      const facility = this.facilities.find((f) => f.fasilitasId === survey.fasilitasId);
      if (facility) {
        facility.latitude = survey.latitude;
        facility.longitude = survey.longitude;
        facility.accuracyMeters = survey.accuracyMeters;
        facility.accuracyGrade = survey.accuracyGrade;
        facility.coordinateSource = 'SURVEYED';
        facility.surveyStatus = 'VERIFIED';
        facility.locationStatus = 'VERIFIED';
        facility.lastSurveyedAt = survey.capturedAt;
        facility.lastSurveyedBy = survey.capturedByName;
        facility.staleStatus = 'FRESH';
        facility.conditionScore = survey.conditionScore;
        facility.qualityScore = survey.accuracyGrade === 'HIGH_PRECISION' ? 5 : 4;
        facility.updatedAt = now;
        facility.updatedBy = actor.userId;
        this.saveState();
      }
    }

    this.saveGeoState();
    this.logAudit(actor, 'VERIFY_SURVEY', 'FASILITAS', surveyId, 'AUTHORIZED', 'SUCCESS', 'PENDING', 'VERIFIED', `Survey ${surveyId} diverifikasi resmi oleh ${actor.nama}.`);

    return { success: true, data: survey };
  }

  public rejectGeoSurvey(
    actor: FacilityActorSession,
    surveyId: string,
    rejectionReason: string,
    requestId?: string
  ): { success: boolean; data?: GeoSurvey; error?: string; code?: string } {
    if (requestId && this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat permintaan penolakan survey.', code: 'DUPLICATE_REQUEST' };
    }
    if (requestId) this.processedRequestIds.add(requestId);

    if (!actor.isBackendConnected || !this.backendOnline) {
      return { success: false, error: 'NOT_COMMITTED: Fail-closed mode aktif.', code: 'NOT_COMMITTED' };
    }

    if (!this.hasPermission(actor.role, 'VERIFY')) {
      return { success: false, error: 'Akses ditolak.', code: 'FORBIDDEN' };
    }

    const survey = this.geoSurveys.find((s) => s.surveyId === surveyId);
    if (!survey) {
      return { success: false, error: 'Data survey tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const now = new Date().toISOString();
    survey.verificationStatus = 'REJECTED';
    survey.surveyStatus = 'REJECTED';
    survey.reviewedBy = actor.nama;
    survey.reviewerId = actor.userId;
    survey.reviewerName = actor.nama;
    survey.reviewedAt = now;
    survey.reviewNotes = rejectionReason;
    survey.reviewNote = rejectionReason;

    const targetGeo = this.geoObjects.find((g) => g.geoId === survey.geoId);
    if (targetGeo) {
      targetGeo.verificationStatus = 'REJECTED';
      targetGeo.rejectionReason = rejectionReason;
      targetGeo.updatedAt = now;
    }

    this.saveGeoState();
    this.logAudit(actor, 'REJECT_SURVEY', 'FASILITAS', surveyId, 'AUTHORIZED', 'SUCCESS', 'PENDING', 'REJECTED', `Survey ditolak: ${rejectionReason}`);

    return { success: true, data: survey };
  }

  public requestResurvey(
    actor: FacilityActorSession,
    surveyId: string,
    reason: string,
    requestId?: string
  ): { success: boolean; data?: GeoSurvey; error?: string; code?: string } {
    if (requestId && this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Duplikat permintaan survey ulang.', code: 'DUPLICATE_REQUEST' };
    }
    if (requestId) this.processedRequestIds.add(requestId);

    if (!actor.isBackendConnected || !this.backendOnline) {
      return { success: false, error: 'NOT_COMMITTED: Fail-closed mode aktif.', code: 'NOT_COMMITTED' };
    }

    if (!this.hasPermission(actor.role, 'VERIFY')) {
      return { success: false, error: 'Akses ditolak.', code: 'FORBIDDEN' };
    }

    const survey = this.geoSurveys.find((s) => s.surveyId === surveyId);
    if (!survey) {
      return { success: false, error: 'Data survey tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const now = new Date().toISOString();
    survey.verificationStatus = 'REJECTED';
    survey.surveyStatus = 'RESURVEY_REQUIRED';
    survey.reviewedBy = actor.nama;
    survey.reviewerId = actor.userId;
    survey.reviewerName = actor.nama;
    survey.reviewedAt = now;
    survey.reviewNotes = `MINTA SURVEY ULANG: ${reason}`;
    survey.reviewNote = survey.reviewNotes;

    this.saveGeoState();
    this.logAudit(actor, 'REQUEST_RESURVEY', 'FASILITAS', surveyId, 'AUTHORIZED', 'SUCCESS', 'PENDING', 'RESURVEY_REQUIRED', `Diminta survey ulang on-site: ${reason}`);

    return { success: true, data: survey };
  }

  // GEOTAGGED PHOTO EVIDENCE UPLOAD (SECTION 10, 35)
  public uploadGeoEvidence(
    actor: FacilityActorSession,
    evidenceData: {
      fileData: string;
      fileName: string;
      fileMimeType: string;
      fileSizeBytes: number;
      latitude?: number;
      longitude?: number;
      geoId?: string;
      fasilitasId?: string;
      notes?: string;
    }
  ): { success: boolean; data?: GeoEvidence; error?: string } {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(evidenceData.fileMimeType.toLowerCase())) {
      return {
        success: false,
        error: `Format berkas tidak valid (${evidenceData.fileMimeType}). Hanya diizinkan JPEG, PNG, atau WEBP.`
      };
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (evidenceData.fileSizeBytes > MAX_SIZE) {
      return {
        success: false,
        error: `Ukuran foto melebihi batas maksimal 5 MB (${(evidenceData.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB).`
      };
    }

    const evidence: GeoEvidence = {
      evidenceId: `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      geoId: evidenceData.geoId,
      fasilitasId: evidenceData.fasilitasId,
      fileData: evidenceData.fileData,
      fileName: evidenceData.fileName,
      fileMimeType: evidenceData.fileMimeType,
      fileSizeBytes: evidenceData.fileSizeBytes,
      latitude: evidenceData.latitude,
      longitude: evidenceData.longitude,
      capturedAt: new Date().toISOString(),
      capturedBy: actor.nama,
      notes: evidenceData.notes
    };

    this.geoEvidence.unshift(evidence);
    this.saveGeoState();

    this.logAudit(actor, 'ADD_PHOTO', 'FASILITAS', evidence.evidenceId, 'AUTHORIZED', 'SUCCESS', undefined, evidence.fileName, 'Foto evidence survey lapangan berhasil diunggah.');

    return { success: true, data: evidence };
  }

  public getGeoHistory(actor: FacilityActorSession, geoId?: string): GeoHistory[] {
    if (!this.hasPermission(actor.role, 'VIEW_INTERNAL')) {
      return [];
    }
    if (geoId) {
      return this.geoHistory.filter((h) => h.geoId === geoId);
    }
    return this.geoHistory;
  }

  public getGeoSurveys(actor: FacilityActorSession): GeoSurvey[] {
    if (!this.hasPermission(actor.role, 'VIEW_INTERNAL')) {
      return this.geoSurveys.filter((s) => s.verificationStatus === 'VERIFIED');
    }
    return this.geoSurveys;
  }

  public getFacilitiesNear(actor: FacilityActorSession, lat: number, lng: number, radiusMeters: number): FasilitasLingkungan[] {
    const list = this.getFacilities(actor);
    return list.filter((f) => {
      const dist = calculateDistanceMeters(lat, lng, f.latitude, f.longitude);
      return dist <= radiusMeters;
    });
  }

  public getFacilitiesByCategory(actor: FacilityActorSession, category: FacilityCategory): FasilitasLingkungan[] {
    return this.getFacilities(actor).filter((f) => f.kategori === category);
  }

  public getFacilitiesByCondition(actor: FacilityActorSession, condition: FacilityCondition): FasilitasLingkungan[] {
    return this.getFacilities(actor).filter((f) => f.kondisi === condition);
  }

  public getFacilitiesByPriority(actor: FacilityActorSession, priority: FacilityPriority): FasilitasLingkungan[] {
    return this.getFacilities(actor).filter((f) => f.tingkatPrioritas === priority);
  }

  public getUnverifiedGeoObjects(actor: FacilityActorSession): GeoObject[] {
    if (!this.hasPermission(actor.role, 'VIEW_INTERNAL')) return [];
    return this.geoObjects.filter((g) => g.verificationStatus !== 'VERIFIED');
  }

  public getStaleFacilities(actor: FacilityActorSession): FasilitasLingkungan[] {
    return this.getFacilities(actor).filter((f) => {
      const stale = calculateStaleStatus(f.lastSurveyedAt);
      return stale.status === 'STALE' || stale.status === 'AGING';
    });
  }

  // IMPORT & EXPORT GEOBASE DATA (SECTION 42, 43)
  public importGeoFeatures(
    actor: FacilityActorSession,
    geoData:
      | {
          type?: string;
          features: Array<{
            type?: string;
            geometry: { type: string; coordinates: any };
            properties?: Record<string, any>;
          }>;
        }
      | Array<{
          type?: string;
          geometry: { type: string; coordinates: any };
          properties?: Record<string, any>;
        }>,
    requestIdParam?: string
  ): { success: boolean; importedCount: number; data?: { importedCount: number }; error?: string; code?: string } {
    const requestId = requestIdParam || this.generateRequestId();
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, importedCount: 0, error: 'Duplikat permintaan impor data geospasial.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!this.hasPermission(actor.role, 'CREATE')) {
      return { success: false, importedCount: 0, error: 'Akses ditolak.', code: 'FORBIDDEN' };
    }

    const featureList = Array.isArray(geoData) ? geoData : geoData?.features;

    if (!featureList || !Array.isArray(featureList)) {
      return { success: false, importedCount: 0, error: 'Format GeoJSON FeatureCollection tidak valid.', code: 'INVALID_FORMAT' };
    }

    let count = 0;
    const now = new Date().toISOString();

    featureList.forEach((feat, idx) => {
      const geom = feat?.geometry;
      const props = feat?.properties || {};

      let lat = 0;
      let lng = 0;
      if (geom?.type === 'Point' && Array.isArray(geom.coordinates)) {
        lng = geom.coordinates[0];
        lat = geom.coordinates[1];
      }

      const geoId = `GEO-IMP-${Date.now()}-${idx}`;
      const newGeo: GeoObject = {
        geoId,
        objectType: (props.objectType || 'FACILITY') as any,
        geometryType: geom?.type === 'Point' ? 'POINT' : geom?.type === 'LineString' ? 'LINESTRING' : 'POLYGON',
        name: props.name || props.nama || `Objek Impor #${idx + 1}`,
        latitude: lat || undefined,
        longitude: lng || undefined,
        source: 'IMPORTED', // STRICT: Tagged as IMPORTED & UNVERIFIED
        verificationStatus: 'UNVERIFIED',
        accuracyMeters: props.accuracy || 10,
        accuracyGrade: 'ACCEPTABLE',
        capturedAt: now,
        capturedBy: actor.nama,
        notes: `Diimpor dari berkas eksternal (${props.sourceName || 'GeoJSON'})`,
        staleStatus: 'AGING',
        qualityScore: 3,
        createdAt: now,
        updatedAt: now,
        version: 1
      };

      this.geoObjects.unshift(newGeo);
      count++;
    });

    this.saveGeoState();
    this.logAudit(actor, 'IMPORT_GEO', 'FASILITAS', 'GEO_IMPORT', 'AUTHORIZED', 'SUCCESS', undefined, `Jumlah: ${count}`, `Impor data geospasial berhasil (${count} objek). Status: UNVERIFIED.`);

    return { success: true, importedCount: count, data: { importedCount: count } };
  }

  public exportGeoJson(actor: FacilityActorSession): any {
    const list = this.getFacilities(actor);
    const features = list.map((f) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [f.longitude, f.latitude]
      },
      properties: {
        fasilitasId: f.fasilitasId,
        kodeFasilitas: f.kodeFasilitas,
        namaFasilitas: f.namaFasilitas,
        kategori: f.kategori,
        subkategori: f.subkategori,
        kondisi: f.kondisi,
        conditionScore: f.conditionScore,
        status: f.status,
        tingkatPrioritas: f.tingkatPrioritas,
        source: f.coordinateSource || 'SURVEYED',
        surveyStatus: f.surveyStatus || 'VERIFIED',
        accuracyMeters: f.accuracyMeters || 4,
        lastSurveyedAt: f.lastSurveyedAt,
        lastSurveyedBy: f.lastSurveyedBy,
        staleStatus: f.staleStatus
      }
    }));

    return {
      type: 'FeatureCollection',
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: actor.nama,
        rtNumber: '07',
        rwNumber: '11',
        area: 'Perumahan GPA Ngijo, Karangploso'
      },
      features
    };
  }

  // AI GEO ASSISTANT (FOUNDATION - READ/ANALYZE ONLY)
  public getAIGeoRecommendations(actor: FacilityActorSession): {
    staleSurveyBacklog: FasilitasLingkungan[];
    priorityClusters: { category: string; area: string; issue: string; count: number }[];
    inspectionRecommendations: { facility: FasilitasLingkungan; reason: string; urgency: 'TINGGI' | 'DARURAT' | 'NORMAL' }[];
    summaryMessage: string;
  } {
    const list = this.getFacilities(actor);

    const staleList = list.filter((f) => {
      const stale = calculateStaleStatus(f.lastSurveyedAt);
      return stale.status === 'STALE' || stale.status === 'AGING';
    });

    const inspectionRecs = list
      .filter((f) => f.kondisi === 'RUSAK_BERAT' || f.kondisi === 'TIDAK_LAYAK' || f.tingkatPrioritas === 'DARURAT' || f.kondisi === 'RUSAK_SEDANG')
      .map((f) => ({
        facility: f,
        reason: f.tingkatPrioritas === 'DARURAT'
          ? 'Prioritas DARURAT membutuhkan penanganan dan inspeksi on-site segera.'
          : f.kondisi === 'TIDAK_LAYAK'
          ? 'Kondisi tidak layak pakai memerlukan pemeriksaan estimasi perbaikan/penggantian.'
          : 'Kondisi rusak sedang memerlukan pengecekan lapangan berkala.',
        urgency: (f.tingkatPrioritas === 'DARURAT' ? 'DARURAT' : f.tingkatPrioritas === 'TINGGI' ? 'TINGGI' : 'NORMAL') as any
      }))
      .slice(0, 5);

    const damagedLights = list.filter((f) => f.kategori === 'PENERANGAN' && ['RUSAK_RINGAN', 'RUSAK_SEDANG', 'RUSAK_BERAT', 'TIDAK_LAYAK'].includes(f.kondisi)).length;
    const damagedDrains = list.filter((f) => f.kategori === 'DRAINASE' && ['RUSAK_SEDANG', 'RUSAK_BERAT', 'TIDAK_LAYAK'].includes(f.kondisi)).length;

    const clusters = [];
    if (damagedLights > 0) {
      clusters.push({
        category: 'PENERANGAN',
        area: 'Blok B & Lorong Gang RT 07',
        issue: `${damagedLights} titik lampu memerlukan penggantian bohlam/fitting untuk mencegah titik rawan keamanan.`,
        count: damagedLights
      });
    }
    if (damagedDrains > 0) {
      clusters.push({
        category: 'DRAINASE',
        area: 'Sisi Timur Blok C',
        issue: `${damagedDrains} saluran air mengalami sedimentasi/retakan penutup, disarankan masuk agenda Kerja Bakti RT.`,
        count: damagedDrains
      });
    }

    const summaryMessage = `AI Geo Engine mendeteksi ${staleList.length} fasilitas memerlukan pembaruan survey berkala dan ${inspectionRecs.length} titik fasilitas prioritas tinggi membutuhkan verifikasi kondisi fisik lapangan.`;

    return {
      staleSurveyBacklog: staleList,
      priorityClusters: clusters,
      inspectionRecommendations: inspectionRecs,
      summaryMessage
    };
  }

  public getAuditLogs(actor: FacilityActorSession): FacilityAuditLog[] {
    if (!this.hasPermission(actor.role, 'VIEW_INTERNAL')) {
      return [];
    }
    return this.auditLogs;
  }
}

export const facilityService = new FacilityService();
