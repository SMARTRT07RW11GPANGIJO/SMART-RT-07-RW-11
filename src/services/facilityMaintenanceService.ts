// SMART RT 07 RW 11 GPA NGIJO - FACILITY MAINTENANCE SERVICE v1.0
// Append-Only History of Maintenance Work Orders, Repairs, and Cost Tracking

import { FacilityMaintenance, FacilityActorSession, MaintenanceStatus, FacilityCondition } from '../types/facility';
import { facilityService } from './facilityService';

const STORAGE_KEY_MAINTENANCE = 'smart_rt07_facility_maintenance_v1';

const INITIAL_MAINTENANCE: FacilityMaintenance[] = [
  {
    maintenanceId: 'MNT-2026-000001',
    fasilitasId: 'FAS-2026-000001',
    tanggal: '2026-07-15',
    jenisPemeliharaan: 'PENGECATAN_DAN_SERVIS_PORTAL',
    deskripsi: 'Pengecatan ulang pos jaga, pelumasan bearing engsel portal masuk, penggantian lampu darurat pos.',
    vendor: 'Swadaya Tim RT 07',
    pic: 'Bpk. Agus (Seksi Pembangunan)',
    biaya: 450000,
    sumberDana: 'KAS_RT',
    status: 'SELESAI',
    buktiDokumen: 'KW-MNT-2026-07-001',
    fotoSebelum: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60',
    fotoSesudah: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60',
    approvedBy: 'Bpk. Eko Sucahyono',
    createdAt: '2026-07-10T08:00:00.000Z',
    createdBy: 'ADM-001'
  },
  {
    maintenanceId: 'MNT-2026-000002',
    fasilitasId: 'FAS-2026-000002',
    tanggal: '2026-08-16',
    jenisPemeliharaan: 'PENGGANTIAN_LAMPU_PJU_DAN_FITTING',
    deskripsi: 'Penggantian modul LED Philips 50W outdoor tahan air, perbaikan isolasi kabel tiang listrik Blok B.',
    vendor: 'Toko Listrik Karangploso & Teknisi Warga',
    pic: 'Bpk. Agus (Seksi Pembangunan)',
    biaya: 350000,
    sumberDana: 'KAS_RT',
    status: 'DISETUJUI',
    buktiDokumen: 'RAB-PJU-2026-08',
    fotoSebelum: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60',
    approvedBy: 'Bpk. Eko Sucahyono (Ketua RT)',
    createdAt: '2026-08-15T09:00:00.000Z',
    createdBy: 'WRG-002'
  }
];

class FacilityMaintenanceService {
  private maintenanceList: FacilityMaintenance[] = [];
  private processedRequestIds: Set<string> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MAINTENANCE);
      if (stored) {
        this.maintenanceList = JSON.parse(stored);
      } else {
        this.maintenanceList = [...INITIAL_MAINTENANCE];
        this.saveState();
      }
    } catch {
      this.maintenanceList = [...INITIAL_MAINTENANCE];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_MAINTENANCE, JSON.stringify(this.maintenanceList));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }

  public getMaintenanceRecords(actor: FacilityActorSession, facilityId?: string): FacilityMaintenance[] {
    if (facilityId) {
      return this.maintenanceList.filter((m) => m.fasilitasId === facilityId);
    }
    return this.maintenanceList;
  }

  public createMaintenance(
    actor: FacilityActorSession,
    data: Omit<FacilityMaintenance, 'maintenanceId' | 'createdAt' | 'createdBy' | 'status'> & { initialStatus?: MaintenanceStatus },
    requestId: string
  ): { success: boolean; data?: FacilityMaintenance; error?: string; code?: string } {
    if (this.processedRequestIds.has(requestId)) {
      return { success: false, error: 'Permintaan pemeliharaan duplikat.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(requestId);

    if (!facilityService.getBackendStatus() || !actor.isBackendConnected) {
      return { success: false, error: 'Backend belum terhubung. Fail-closed policy.', code: 'NOT_COMMITTED' };
    }

    if (!facilityService.hasPermission(actor.role, 'MAINTAIN')) {
      return { success: false, error: 'Akses Ditolak: Anda tidak berwenang mengusulkan pemeliharaan fasilitas.', code: 'FORBIDDEN' };
    }

    const facility = facilityService.getFacilityById(actor, data.fasilitasId);
    if (!facility) {
      return { success: false, error: 'Fasilitas tidak ditemukan.', code: 'NOT_FOUND' };
    }

    const maintenanceId = `MNT-2026-${String(this.maintenanceList.length + 1).padStart(6, '0')}`;
    const status: MaintenanceStatus = data.initialStatus || (['ADMIN', 'KETUA_RT'].includes(actor.role.toUpperCase()) ? 'DISETUJUI' : 'DIUSULKAN');

    const newRecord: FacilityMaintenance = {
      ...data,
      maintenanceId,
      status,
      approvedBy: status === 'DISETUJUI' ? actor.nama : undefined,
      createdAt: new Date().toISOString(),
      createdBy: actor.userId
    };

    this.maintenanceList.unshift(newRecord);
    this.saveState();

    return { success: true, data: newRecord };
  }

  public updateMaintenanceStatus(
    actor: FacilityActorSession,
    maintenanceId: string,
    newStatus: MaintenanceStatus,
    completionDetails?: {
      fotoSesudah?: string;
      finalCost?: number;
      resultingCondition?: FacilityCondition;
    },
    requestId?: string
  ): { success: boolean; data?: FacilityMaintenance; error?: string; code?: string } {
    const req = requestId || facilityService.generateRequestId();
    if (this.processedRequestIds.has(req)) {
      return { success: false, error: 'Permintaan duplikat.', code: 'DUPLICATE_REQUEST' };
    }
    this.processedRequestIds.add(req);

    if (!facilityService.getBackendStatus() || !actor.isBackendConnected) {
      return { success: false, error: 'Backend offline.', code: 'NOT_COMMITTED' };
    }

    const record = this.maintenanceList.find((m) => m.maintenanceId === maintenanceId);
    if (!record) {
      return { success: false, error: 'Catatan pemeliharaan tidak ditemukan.', code: 'NOT_FOUND' };
    }

    // Role check for Approval
    if (newStatus === 'DISETUJUI' && !['ADMIN', 'KETUA_RT'].includes(actor.role.toUpperCase())) {
      return { success: false, error: 'Hanya Ketua RT atau Administrator yang dapat menyetujui usulan pemeliharaan.', code: 'FORBIDDEN' };
    }

    record.status = newStatus;
    record.updatedAt = new Date().toISOString();
    if (newStatus === 'DISETUJUI') {
      record.approvedBy = actor.nama;
    }

    if (newStatus === 'SELESAI' && completionDetails) {
      if (completionDetails.fotoSesudah) record.fotoSesudah = completionDetails.fotoSesudah;
      if (completionDetails.finalCost !== undefined) record.biaya = completionDetails.finalCost;

      // Update the facility's condition and last maintenance date
      const resultingCondition = completionDetails.resultingCondition || 'BAIK';
      facilityService.updateFacility(
        actor,
        record.fasilitasId,
        {
          kondisi: resultingCondition,
          tanggalPemeliharaanTerakhir: record.tanggal || new Date().toISOString().split('T')[0],
          status: 'AKTIF',
          tingkatPrioritas: resultingCondition === 'BAIK' ? 'NORMAL' : 'TINGGI'
        },
        facilityService.generateRequestId()
      );
    }

    this.saveState();
    return { success: true, data: record };
  }

  public getTotalMaintenanceCost(): number {
    return this.maintenanceList
      .filter((m) => m.status === 'SELESAI' || m.status === 'BERLANGSUNG' || m.status === 'DISETUJUI')
      .reduce((sum, m) => sum + (m.biaya || 0), 0);
  }
}

export const facilityMaintenanceService = new FacilityMaintenanceService();
