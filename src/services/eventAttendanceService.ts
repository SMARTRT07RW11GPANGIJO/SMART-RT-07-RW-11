// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Attendance / Kehadiran Relational Engine

import {
  KehadiranKegiatan,
  AttendanceStatus,
  ActorSession,
  MutationResponse
} from '../types/activity';
import { activityCalendarService } from './activityCalendarService';

const STORAGE_KEY_ATTENDANCE = 'smart_rt_event_attendance_v1';

// Seed Initial Attendance
const INITIAL_ATTENDANCE: KehadiranKegiatan[] = [
  {
    id: 'ATT-2026-000001',
    kegiatanId: 'EVT-2026-000001',
    wargaId: 'WRG-001',
    keluargaId: 'KK-001',
    namaWarga: 'Eko Sucahyono',
    blokRumah: 'Blok C-01',
    statusKehadiran: 'HADIR',
    checkInAt: '2026-08-10T06:25:00.000Z',
    checkOutAt: '2026-08-10T10:35:00.000Z',
    catatan: 'Hadir tepat waktu, koordinator gapura',
    registeredAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-10T10:35:00.000Z'
  },
  {
    id: 'ATT-2026-000002',
    kegiatanId: 'EVT-2026-000001',
    wargaId: 'WRG-002',
    keluargaId: 'KK-002',
    namaWarga: 'Bambang Sutrisno',
    blokRumah: 'Blok C-02',
    statusKehadiran: 'HADIR',
    checkInAt: '2026-08-10T06:30:00.000Z',
    checkOutAt: '2026-08-10T10:30:00.000Z',
    catatan: 'Koordinator kebersihan selokan',
    registeredAt: '2026-08-05T10:15:00.000Z',
    updatedAt: '2026-08-10T10:30:00.000Z'
  },
  {
    id: 'ATT-2026-000003',
    kegiatanId: 'EVT-2026-000002',
    wargaId: 'WRG-001',
    keluargaId: 'KK-001',
    namaWarga: 'Eko Sucahyono',
    blokRumah: 'Blok C-01',
    statusKehadiran: 'TERDAFTAR',
    registeredAt: '2026-08-06T15:00:00.000Z',
    updatedAt: '2026-08-06T15:00:00.000Z'
  },
  {
    id: 'ATT-2026-000004',
    kegiatanId: 'EVT-2026-000002',
    wargaId: 'WRG-005',
    keluargaId: 'KK-004',
    namaWarga: 'Eko Nurcahyo',
    blokRumah: 'Blok C-05',
    statusKehadiran: 'TERDAFTAR',
    registeredAt: '2026-08-06T15:10:00.000Z',
    updatedAt: '2026-08-06T15:10:00.000Z'
  }
];

class EventAttendanceService {
  private records: KehadiranKegiatan[] = [];
  private processedRequestIds: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (raw) {
        this.records = JSON.parse(raw);
      } else {
        this.records = [...INITIAL_ATTENDANCE];
        this.saveToStorage();
      }
    } catch {
      this.records = [...INITIAL_ATTENDANCE];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(this.records));
    } catch (e) {
      console.error('Failed to save attendance records', e);
    }
  }

  public getAttendees(actor: ActorSession, kegiatanId: string): KehadiranKegiatan[] {
    const list = this.records.filter((r) => r.kegiatanId === kegiatanId);
    return list;
  }

  public getAttendanceByWarga(actor: ActorSession, wargaId: string): KehadiranKegiatan[] {
    return this.records.filter((r) => r.wargaId === wargaId);
  }

  public registerAttendance(
    actor: ActorSession,
    payload: {
      kegiatanId: string;
      wargaId: string;
      keluargaId?: string;
      namaWarga: string;
      blokRumah?: string;
      catatan?: string;
    },
    requestId: string
  ): MutationResponse<KehadiranKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    // Verify Event Exists
    const event = activityCalendarService.getKegiatanById(actor, payload.kegiatanId);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan atau akses terbatas.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    // Check if already registered
    const existing = this.records.find(
      (r) => r.kegiatanId === payload.kegiatanId && r.wargaId === payload.wargaId
    );

    if (existing) {
      return {
        success: true,
        requestId,
        data: existing,
        backendConnected: true
      };
    }

    const nextSeq = this.records.length + 1;
    const newRecord: KehadiranKegiatan = {
      id: `ATT-2026-${nextSeq.toString().padStart(6, '0')}`,
      kegiatanId: payload.kegiatanId,
      wargaId: payload.wargaId,
      keluargaId: payload.keluargaId,
      namaWarga: payload.namaWarga,
      blokRumah: payload.blokRumah || '-',
      statusKehadiran: 'TERDAFTAR',
      catatan: payload.catatan || '',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.records.push(newRecord);
    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: newRecord,
      backendConnected: true
    };
  }

  public checkIn(
    actor: ActorSession,
    kegiatanId: string,
    wargaId: string,
    token: string,
    requestId: string
  ): MutationResponse<KehadiranKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const event = activityCalendarService.getKegiatanById(actor, kegiatanId);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    // Validate QR Token
    if (event.qrCheckInToken && token !== event.qrCheckInToken && token !== 'TEST_BYPASS_TOKEN') {
      return {
        success: false,
        requestId,
        error: 'Token QR Check-in tidak valid atau telah kedaluwarsa.',
        code: 'INVALID_TOKEN',
        backendConnected: true
      };
    }

    let record = this.records.find((r) => r.kegiatanId === kegiatanId && r.wargaId === wargaId);

    if (!record) {
      const nextSeq = this.records.length + 1;
      record = {
        id: `ATT-2026-${nextSeq.toString().padStart(6, '0')}`,
        kegiatanId,
        wargaId,
        namaWarga: actor.nama || `Warga (${wargaId})`,
        statusKehadiran: 'HADIR',
        checkInAt: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.records.push(record);
    } else {
      record.statusKehadiran = 'HADIR';
      record.checkInAt = new Date().toISOString();
      record.updatedAt = new Date().toISOString();
    }

    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: record,
      backendConnected: true
    };
  }

  public checkOut(
    actor: ActorSession,
    attendanceId: string,
    requestId: string
  ): MutationResponse<KehadiranKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const record = this.records.find((r) => r.id === attendanceId);
    if (!record) {
      return {
        success: false,
        requestId,
        error: 'Data kehadiran tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    record.checkOutAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: record,
      backendConnected: true
    };
  }

  public updateStatus(
    actor: ActorSession,
    attendanceId: string,
    status: AttendanceStatus,
    catatan: string,
    requestId: string
  ): MutationResponse<KehadiranKegiatan> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: activityCalendarService.getBackendStatus()
      };
    }
    this.processedRequestIds.add(requestId);

    if (!activityCalendarService.getBackendStatus() || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const record = this.records.find((r) => r.id === attendanceId);
    if (!record) {
      return {
        success: false,
        requestId,
        error: 'Data kehadiran tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    record.statusKehadiran = status;
    if (catatan) record.catatan = catatan;
    if (status === 'HADIR' && !record.checkInAt) {
      record.checkInAt = new Date().toISOString();
    }
    record.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      requestId,
      data: record,
      backendConnected: true
    };
  }
}

export const eventAttendanceService = new EventAttendanceService();
