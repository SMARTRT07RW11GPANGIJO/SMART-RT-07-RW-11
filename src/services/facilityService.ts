// SMART RT 07 RW 11 GPA NGIJO - ENVIRONMENTAL FACILITY DATABASE SERVICE v1.0
// Authoritative Service for Facility Registry, GIS Coordinates, and RBAC Operations

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
  FacilityComplaintReport
} from '../types/facility';
import { CONDITION_SCORE_MAP, GPA_NGIJO_BOUNDS } from '../config/facilityConfig';

const STORAGE_KEY_FACILITIES = 'smart_rt07_facilities_v1';
const STORAGE_KEY_AUDIT = 'smart_rt07_facility_audit_v1';
const STORAGE_KEY_EVENT_LINKS = 'smart_rt07_facility_event_links_v1';
const STORAGE_KEY_COMPLAINTS = 'smart_rt07_facility_complaints_v1';

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
  public hasPermission(role: string, action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'REPORT' | 'INSPECT' | 'MAINTAIN' | 'VIEW_INTERNAL'): boolean {
    const r = role.toUpperCase();
    if (r === 'ADMIN' || r === 'KETUA_RT') return true;

    switch (action) {
      case 'READ':
      case 'REPORT':
        return true;
      case 'VIEW_INTERNAL':
        return ['SEKRETARIS_RT', 'BENDAHARA_RT', 'SEKSI_KEGIATAN'].includes(r);
      case 'CREATE':
      case 'UPDATE':
      case 'INSPECT':
      case 'MAINTAIN':
        return ['SEKRETARIS_RT', 'SEKSI_KEGIATAN'].includes(r);
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

  public getAuditLogs(actor: FacilityActorSession): FacilityAuditLog[] {
    if (!this.hasPermission(actor.role, 'VIEW_INTERNAL')) {
      return [];
    }
    return this.auditLogs;
  }
}

export const facilityService = new FacilityService();
