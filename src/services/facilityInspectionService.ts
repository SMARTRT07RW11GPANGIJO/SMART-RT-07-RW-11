// SMART RT 07 RW 11 GPA NGIJO - FACILITY INSPECTION SERVICE v1.0
// Append-Only History of Facility Audits, Health Inspections, and Recommendations

import { FacilityInspection, FacilityActorSession, FacilityCondition } from '../types/facility';
import { CONDITION_SCORE_MAP } from '../config/facilityConfig';
import { facilityService } from './facilityService';

const STORAGE_KEY_INSPECTIONS = 'smart_rt07_facility_inspections_v1';

const INITIAL_INSPECTIONS: FacilityInspection[] = [
  {
    inspectionId: 'INSP-2026-000001',
    fasilitasId: 'FAS-2026-000002',
    tanggalPemeriksaan: '2026-08-14',
    kondisiSebelum: 'RUSAK_SEDANG',
    kondisiSesudah: 'TIDAK_LAYAK',
    conditionScore: 0,
    temuan: 'Lampu PJU Blok B No 08 padam total. Kabel sambungan fitting terbakar dan housing lampu pecah.',
    rekomendasi: 'Perlu penggantian rumah lampu LED 50W outdoor dan perbaikan kabel instalasi tiang.',
    fotoBukti: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60'],
    pemeriksaId: 'WRG-002',
    pemeriksaNama: 'Bpk. Agus (Seksi Pembangunan)',
    pemeriksaRole: 'SEKSI_KEGIATAN',
    createdAt: '2026-08-14T11:30:00.000Z'
  },
  {
    inspectionId: 'INSP-2026-000002',
    fasilitasId: 'FAS-2026-000003',
    tanggalPemeriksaan: '2026-08-01',
    kondisiSebelum: 'RUSAK_RINGAN',
    kondisiSesudah: 'RUSAK_SEDANG',
    conditionScore: 2,
    temuan: 'Saluran drainase Blok C tertutup sedimen tanah dan rumput liar. Tutup bak kontrol retak.',
    rekomendasi: 'Jadwalkan pengerukan saluran pada kerja bakti RT dan penambalan semen plat penutup.',
    fotoBukti: ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60'],
    pemeriksaId: 'WRG-003',
    pemeriksaNama: 'Bpk. Hendro (Seksi Kebersihan)',
    pemeriksaRole: 'SEKSI_KEGIATAN',
    createdAt: '2026-08-01T15:00:00.000Z'
  },
  {
    inspectionId: 'INSP-2026-000003',
    fasilitasId: 'FAS-2026-000001',
    tanggalPemeriksaan: '2026-08-10',
    kondisiSebelum: 'BAIK',
    kondisiSesudah: 'BAIK',
    conditionScore: 5,
    temuan: 'Peralatan pos ronda lengkap, senter dan tongkat siap pakai, panel monitor CCTV berfungsi jernih.',
    rekomendasi: 'Pertahankan kebersihan rutin pos ronda dan cek oli engsel portal secara berkala.',
    fotoBukti: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60'],
    pemeriksaId: 'WRG-001',
    pemeriksaNama: 'Bpk. Eko Sucahyono',
    pemeriksaRole: 'KETUA_RT',
    createdAt: '2026-08-10T10:00:00.000Z'
  }
];

class FacilityInspectionService {
  private inspections: FacilityInspection[] = [];
  private processedRequestIds: Set<string> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSPECTIONS);
      if (stored) {
        this.inspections = JSON.parse(stored);
      } else {
        this.inspections = [...INITIAL_INSPECTIONS];
        this.saveState();
      }
    } catch {
      this.inspections = [...INITIAL_INSPECTIONS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(this.inspections));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }

  public getInspections(actor: FacilityActorSession, facilityId?: string): FacilityInspection[] {
    if (facilityId) {
      return this.inspections.filter((i) => i.fasilitasId === facilityId);
    }
    return this.inspections;
  }

  // Create Inspection (Append-Only)
  public createInspection(
    actor: FacilityActorSession,
    data: {
      fasilitasId: string;
      tanggalPemeriksaan: string;
      kondisiSesudah: FacilityCondition;
      temuan: string;
      rekomendasi: string;
      fotoBukti?: string[];
    },
    requestId: string
  ): { success: boolean; data?: FacilityInspection; error?: string; code?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Permintaan pemeriksaan duplikat.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!facilityService.getBackendStatus() || !actor.isBackendConnected) {
      return { success: false, error: 'Backend belum terhubung. Fail-closed policy.', code: 'NOT_COMMITTED' };
    }

    if (!facilityService.hasPermission(actor.role, 'INSPECT')) {
      return { success: false, error: 'Akses Ditolak: Anda tidak berwenang mencatat hasil inspeksi fasilitas.', code: 'FORBIDDEN' };
    }

    const facility = facilityService.getFacilityById(actor, data.fasilitasId);
    if (!facility) {
      return { success: false, error: 'Fasilitas tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const score = CONDITION_SCORE_MAP[data.kondisiSesudah] ?? 0;
    const inspectionId = `INSP-2026-${String(this.inspections.length + 1).padStart(6, '0')}`;

    const newInspection: FacilityInspection = {
      inspectionId,
      fasilitasId: data.fasilitasId,
      tanggalPemeriksaan: data.tanggalPemeriksaan || new Date().toISOString().split('T')[0],
      kondisiSebelum: facility.kondisi,
      kondisiSesudah: data.kondisiSesudah,
      conditionScore: score,
      temuan: data.temuan,
      rekomendasi: data.rekomendasi,
      fotoBukti: data.fotoBukti || [],
      pemeriksaId: actor.userId,
      pemeriksaNama: actor.nama,
      pemeriksaRole: actor.role,
      createdAt: new Date().toISOString()
    };

    // Append-only to inspections history
    this.inspections.unshift(newInspection);
    this.saveState();

    // Update facility master state with inspection findings
    facilityService.updateFacility(
      actor,
      data.fasilitasId,
      {
        kondisi: data.kondisiSesudah,
        conditionScore: score,
        tanggalPemeriksaanTerakhir: newInspection.tanggalPemeriksaan,
        tingkatPrioritas: score === 0 ? 'DARURAT' : score <= 2 ? 'TINGGI' : 'NORMAL'
      },
      facilityService.generateRequestId()
    );

    return { success: true, data: newInspection };
  }
}

export const facilityInspectionService = new FacilityInspectionService();
