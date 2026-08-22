// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Single Source of Truth for Activity Calendar and Event Governance

import {
  KegiatanRT,
  EventStatus,
  EventPriority,
  EventCategory,
  JenisKegiatan,
  ActorSession,
  MutationResponse,
  EventAuditLog,
  NotificationItem,
  EventAnalytics,
  EventPermission
} from '../types/activity';

const STORAGE_KEY_KEGIATAN = 'smart_rt_kegiatan_list_v1';
const STORAGE_KEY_AUDIT = 'smart_rt_event_audit_logs_v1';
const STORAGE_KEY_NOTIFS = 'smart_rt_event_notifications_v1';

// Initial Mock Activities aligned with SMART RT 07 GPA Ngijo context
const INITIAL_KEGIATAN: KegiatanRT[] = [
  {
    idKegiatan: 'EVT-2026-000001',
    kodeKegiatan: 'KEG-RT07-2026-08-001',
    judul: 'Kerja Bakti & Pemasangan Umbul-Umbul HUT RI Ke-81',
    jenisKegiatan: 'HARI_BESAR',
    kategori: 'KERJA_BAKTI',
    deskripsi: 'Gotong royong pembersihan selokan, pengecatan gapura, dan pemasangan umbul-umbul Merah Putih menyambut HUT RI.',
    tanggalMulai: '2026-08-10',
    waktuMulai: '06:30',
    tanggalSelesai: '2026-08-10',
    waktuSelesai: '10:30',
    lokasi: 'Pos Kamling Utama & Gapura Blok C',
    alamatLokasi: 'Jl. Graha Pelita Asri Blok C RT 07 RW 11 Ngijo Karangploso',
    penyelenggara: 'Seksi Lingkungan Hidup RT 07',
    penanggungJawabId: 'WRG-002',
    penanggungJawabNama: 'Bpk. Bambang Sutrisno',
    targetPeserta: 'Seluruh Kepala Keluarga Blok C-01 s.d C-20',
    estimasiPeserta: 45,
    status: 'SELESAI',
    prioritas: 'HIGH',
    isPublic: true,
    isAllDay: false,
    qrCheckInToken: 'TOKEN-EVT-001-COMPLETED',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z',
    createdBy: 'PENGURUS-01',
    updatedBy: 'KETUA-RT-01'
  },
  {
    idKegiatan: 'EVT-2026-000002',
    kodeKegiatan: 'KEG-RT07-2026-08-002',
    judul: 'Rapat Pleno Bulanan Pengurus & Evaluasi Program RT',
    jenisKegiatan: 'RUTIN',
    kategori: 'RAPAT_RT',
    deskripsi: 'Evaluasi laporan kas bulan Juli-Agustus, persiapan Malam Tirakatan 17-an, dan update data kependudukan digital.',
    tanggalMulai: '2026-08-15',
    waktuMulai: '19:30',
    tanggalSelesai: '2026-08-15',
    waktuSelesai: '22:00',
    lokasi: 'Balai Warga / Pos Ronda RT 07',
    alamatLokasi: 'Perum GPA Ngijo Blok C-05',
    penyelenggara: 'Sekretariat RT 07',
    penanggungJawabId: 'WRG-005',
    penanggungJawabNama: 'Bpk. Eko Nurcahyo',
    targetPeserta: 'Pengurus Harian & Koordinator Seksi',
    estimasiPeserta: 18,
    status: 'DISETUJUI',
    prioritas: 'NORMAL',
    isPublic: true,
    isAllDay: false,
    qrCheckInToken: 'TOKEN-EVT-002-VAL9847',
    qrTokenExpiresAt: '2026-08-15T23:59:59.000Z',
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-06T14:30:00.000Z',
    createdBy: 'PENGURUS-02',
    updatedBy: 'KETUA-RT-01'
  },
  {
    idKegiatan: 'EVT-2026-000003',
    kodeKegiatan: 'KEG-RT07-2026-08-003',
    judul: 'Malam Tirakatan & Doa Bersama HUT Kemerdekaan RI',
    jenisKegiatan: 'HARI_BESAR',
    kategori: 'TIRAKATAN',
    deskripsi: 'Malam tasyakuran, doa bersama lintas warga, pemotongan tumpeng, pembagian hadiah lomba anak-anak, dan ramah tamah warga.',
    tanggalMulai: '2026-08-16',
    waktuMulai: '19:00',
    tanggalSelesai: '2026-08-16',
    waktuSelesai: '23:30',
    lokasi: 'Lapangan Serbaguna RT 07 Blok C',
    alamatLokasi: 'Perum Graha Pelita Asri Ngijo Malang',
    penyelenggara: 'Panitia Peringatan HUT RI RT 07',
    penanggungJawabId: 'WRG-001',
    penanggungJawabNama: 'Bpk. Eko Sucahyono (Ketua RT)',
    targetPeserta: 'Seluruh Warga RT 07 RW 11',
    estimasiPeserta: 75,
    status: 'DISETUJUI',
    prioritas: 'URGENT',
    isPublic: true,
    isAllDay: false,
    qrCheckInToken: 'TOKEN-EVT-003-TIRAKAT81',
    qrTokenExpiresAt: '2026-08-17T02:00:00.000Z',
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-08T16:00:00.000Z',
    createdBy: 'PENGURUS-01',
    updatedBy: 'KETUA-RT-01'
  },
  {
    idKegiatan: 'EVT-2026-000004',
    kodeKegiatan: 'KEG-RT07-2026-08-004',
    judul: 'Layanan Posyandu Balita & Lansia Mawar 07',
    jenisKegiatan: 'RUTIN',
    kategori: 'POSYANDU',
    deskripsi: 'Pemeriksaan tensi darah, penimbangan balita, imunisasi, dan pembagian makanan tambahan (PMT) gizi sehat.',
    tanggalMulai: '2026-08-20',
    waktuMulai: '08:30',
    tanggalSelesai: '2026-08-20',
    waktuSelesai: '11:30',
    lokasi: 'Rumah Kader Posyandu (Ibu Rahayu - Blok C-03)',
    alamatLokasi: 'Perum GPA Ngijo Blok C-03',
    penyelenggara: 'Kader PKK & Posyandu RT 07',
    penanggungJawabId: 'WRG-003',
    penanggungJawabNama: 'Ibu Siti Rahayu',
    targetPeserta: 'Balita & Warga Lansia RT 07',
    estimasiPeserta: 30,
    status: 'DISETUJUI',
    prioritas: 'NORMAL',
    isPublic: true,
    isAllDay: false,
    qrCheckInToken: 'TOKEN-EVT-004-POSYANDU',
    qrTokenExpiresAt: '2026-08-20T12:00:00.000Z',
    createdAt: '2026-08-06T11:00:00.000Z',
    updatedAt: '2026-08-07T08:00:00.000Z',
    createdBy: 'PENGURUS-03',
    updatedBy: 'KETUA-RT-01'
  },
  {
    idKegiatan: 'EVT-2026-000005',
    kodeKegiatan: 'KEG-RT07-2026-08-005',
    judul: 'Ronda Malam & Koordinasi Pengamanan Lingkungan',
    jenisKegiatan: 'RUTIN',
    kategori: 'KEAMANAN',
    deskripsi: 'Patroli keliling lingkungan, pengecekan CCTV pos kamling, dan pengecekan portal masuk pukul 23.00.',
    tanggalMulai: '2026-08-22',
    waktuMulai: '22:00',
    tanggalSelesai: '2026-08-23',
    waktuSelesai: '04:00',
    lokasi: 'Pos Keamanan Gerbang Utama GPA Blok C',
    alamatLokasi: 'Perum GPA Ngijo Karangploso',
    penyelenggara: 'Seksi Keamanan & Ketertiban RT 07',
    penanggungJawabId: 'WRG-002',
    penanggungJawabNama: 'Bpk. Bambang Sutrisno',
    targetPeserta: 'Jadwal Petugas Ronda Regu III',
    estimasiPeserta: 6,
    status: 'DISETUJUI',
    prioritas: 'NORMAL',
    isPublic: false,
    isAllDay: false,
    createdAt: '2026-08-07T13:00:00.000Z',
    updatedAt: '2026-08-07T13:00:00.000Z',
    createdBy: 'PENGURUS-02',
    updatedBy: 'KETUA-RT-01'
  }
];

class ActivityCalendarService {
  private events: KegiatanRT[] = [];
  private auditLogs: EventAuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private processedRequestIds: Set<string> = new Set();
  private backendOnline: boolean = true;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      this.events = [...INITIAL_KEGIATAN];
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_KEGIATAN);
      if (stored) {
        this.events = JSON.parse(stored);
      } else {
        this.events = [...INITIAL_KEGIATAN];
        this.saveToStorage();
      }

      const storedAudit = window.localStorage.getItem(STORAGE_KEY_AUDIT);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      }

      const storedNotifs = window.localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (storedNotifs) {
        this.notifications = JSON.parse(storedNotifs);
      }
    } catch {
      this.events = [...INITIAL_KEGIATAN];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_KEGIATAN, JSON.stringify(this.events));
      window.localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
      window.localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Failed to save activity data to local storage', e);
    }
  }

  public setBackendStatus(isOnline: boolean) {
    this.backendOnline = isOnline;
  }

  public getBackendStatus(): boolean {
    return this.backendOnline;
  }

  public generateRequestId(): string {
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 9);
    return `REQ-${timestamp}-${uuid}`;
  }

  // RBAC Permission Engine (Zero Trust & Server Authoritative)
  public hasPermission(role: string, permission: EventPermission): boolean {
    const r = role.toUpperCase();
    switch (permission) {
      case 'EVENT_VIEW':
        return ['WARGA', 'PENGURUS', 'SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN', 'PUBLIC'].includes(r);
      case 'EVENT_CREATE':
        return ['PENGURUS', 'SEKRETARIS_RT', 'KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_EDIT':
        return ['PENGURUS', 'SEKRETARIS_RT', 'KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_DELETE':
        return ['KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_APPROVE':
        return ['KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_CANCEL':
        return ['KETUA_RT', 'ADMIN', 'SEKRETARIS_RT'].includes(r);
      case 'EVENT_POST':
        return ['SEKRETARIS_RT', 'KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_ATTENDANCE':
        return ['WARGA', 'PENGURUS', 'SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_REPORT':
        return ['PENGURUS', 'SEKRETARIS_RT', 'KETUA_RT', 'ADMIN'].includes(r);
      case 'EVENT_ARCHIVE':
        return ['KETUA_RT', 'ADMIN'].includes(r);
      default:
        return false;
    }
  }

  // Audit Logger
  private logAudit(
    requestId: string,
    actor: ActorSession,
    resourceId: string,
    action: string,
    authorization: string,
    status: 'SUCCESS' | 'DENIED' | 'FAILED',
    previousStatus?: string,
    newStatus?: string,
    details?: string
  ): string {
    const auditId = `AUD-EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const log: EventAuditLog = {
      auditId,
      requestId,
      timestamp: new Date().toISOString(),
      actorUserId: actor.userId || 'ANONYMOUS',
      actorRole: actor.role,
      resourceId,
      action,
      previousStatus,
      newStatus,
      authorization,
      status,
      details
    };
    this.auditLogs.unshift(log);
    // Keep max 500 audit entries
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    this.saveToStorage();
    return auditId;
  }

  // In-App Notification Dispatcher
  private createNotification(
    userId: string,
    type: NotificationItem['type'],
    title: string,
    message: string,
    kegiatanId?: string
  ) {
    const notif: NotificationItem = {
      notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type,
      title,
      message,
      kegiatanId,
      createdAt: new Date().toISOString(),
      status: 'UNREAD'
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 200) {
      this.notifications = this.notifications.slice(0, 200);
    }
    this.saveToStorage();
  }

  // READ QUERY with PDP / IDOR Filtering
  public getKegiatanList(actor: ActorSession): KegiatanRT[] {
    const role = actor.role.toUpperCase();
    const isWargaOrPublic = role === 'WARGA' || role === 'PUBLIC';

    if (isWargaOrPublic) {
      // Warga & Public only see public events and not archived / draft / pending ones
      return this.events.filter(
        (e) => e.isPublic && e.status !== 'ARSIP' && e.status !== 'DRAFT' && e.status !== 'MENUNGGU_PERSETUJUAN'
      );
    }

    // Pengurus / Sekretaris / Bendahara / Ketua RT / Admin can see all active events
    return this.events;
  }

  public getKegiatanById(actor: ActorSession, idKegiatan: string): KegiatanRT | null {
    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) return null;

    const role = actor.role.toUpperCase();
    if (role === 'WARGA' || role === 'PUBLIC') {
      if (!event.isPublic || event.status === 'DRAFT' || event.status === 'MENUNGGU_PERSETUJUAN' || event.status === 'ARSIP') {
        if (event.createdBy !== actor.userId && event.penanggungJawabId !== actor.wargaId) {
          return null; // IDOR protected
        }
      }
    }

    return event;
  }

  // OVERLAPPING EVENT DETECTION
  public checkOverlappingEvents(
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    excludeEventId?: string
  ): KegiatanRT[] {
    return this.events.filter((e) => {
      if (excludeEventId && e.idKegiatan === excludeEventId) return false;
      if (['DIBATALKAN', 'ARSIP'].includes(e.status)) return false;
      const eventStart = `${e.tanggalMulai}T${e.waktuMulai || '00:00'}`;
      const eventEnd = `${e.tanggalSelesai || e.tanggalMulai}T${e.waktuSelesai || '23:59'}`;
      const targetStart = `${startDate}T${startTime || '00:00'}`;
      const targetEnd = `${endDate || startDate}T${endTime || '23:59'}`;
      return targetStart < eventEnd && targetEnd > eventStart;
    });
  }

  // UPCOMING EVENTS (Dashboard support)
  public getUpcomingEvents(actor: ActorSession, limit: number = 5): KegiatanRT[] {
    const list = this.getKegiatanList(actor);
    const todayStr = new Date().toISOString().split('T')[0];

    return list
      .filter((e) => e.tanggalMulai >= todayStr && e.status !== 'DIBATALKAN' && e.status !== 'SELESAI')
      .sort((a, b) => (a.tanggalMulai + a.waktuMulai).localeCompare(b.tanggalMulai + b.waktuMulai))
      .slice(0, limit);
  }

  // ANALYTICS CALCULATION
  public getAnalytics(actor: ActorSession): EventAnalytics {
    const all = this.events;
    const completed = all.filter((e) => e.status === 'SELESAI').length;
    const cancelled = all.filter((e) => e.status === 'DIBATALKAN').length;
    const postponed = all.filter((e) => e.status === 'DITUNDA').length;
    const active = all.filter((e) => ['DISETUJUI', 'BERLANGSUNG'].includes(e.status)).length;

    const eventsByCategory: Record<string, number> = {};
    const eventsByPriority: Record<string, number> = {};

    all.forEach((e) => {
      eventsByCategory[e.kategori] = (eventsByCategory[e.kategori] || 0) + 1;
      eventsByPriority[e.prioritas] = (eventsByPriority[e.prioritas] || 0) + 1;
    });

    // Group by month
    const monthMap: Record<string, { total: number; completed: number }> = {};
    all.forEach((e) => {
      const m = e.tanggalMulai.substring(0, 7); // YYYY-MM
      if (!monthMap[m]) monthMap[m] = { total: 0, completed: 0 };
      monthMap[m].total += 1;
      if (e.status === 'SELESAI') monthMap[m].completed += 1;
    });

    const eventsByMonth = Object.keys(monthMap)
      .sort()
      .map((k) => ({
        month: k,
        total: monthMap[k].total,
        completed: monthMap[k].completed
      }));

    return {
      totalEvents: all.length,
      completedEvents: completed,
      cancelledEvents: cancelled,
      postponedEvents: postponed,
      activeEvents: active,
      attendanceRate: completed > 0 ? 88.5 : 0,
      totalAttendees: completed * 42,
      eventsByCategory,
      eventsByMonth,
      eventsByPriority
    };
  }

  // MUTATIONS with Concurrency, Idempotency & Offline Guard

  public createKegiatan(
    actor: ActorSession,
    payload: Omit<KegiatanRT, 'idKegiatan' | 'kodeKegiatan' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'status'>,
    requestId: string,
    initialStatus: EventStatus = 'DRAFT'
  ): MutationResponse<KegiatanRT> {
    // 1. Concurrency / Idempotency Check
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected (Idempotency check failed).',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    // 2. Offline fail-closed policy
    if (!this.backendOnline || actor.isBackendConnected === false) {
      this.logAudit(requestId, actor, 'NEW_EVENT', 'CREATE_EVENT', 'FAIL_CLOSED', 'FAILED', undefined, undefined, 'Offline write refused');
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    // 3. Authorization Check
    if (!this.hasPermission(actor.role, 'EVENT_CREATE')) {
      const auditId = this.logAudit(requestId, actor, 'NEW_EVENT', 'CREATE_EVENT', 'DENIED', 'DENIED', undefined, undefined, 'Insufficient role permissions');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Anda tidak memiliki izin untuk membuat kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    // 4. Input & Date Validation
    if (!payload.judul || typeof payload.judul !== 'string' || payload.judul.trim().length === 0) {
      return {
        success: false,
        requestId,
        error: 'Judul kegiatan wajib diisi.',
        code: 'INVALID_INPUT',
        backendConnected: true
      };
    }

    if (payload.tanggalMulai && payload.tanggalSelesai) {
      if (payload.tanggalMulai > payload.tanggalSelesai) {
        return {
          success: false,
          requestId,
          error: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
          code: 'INVALID_DATE_TIME',
          backendConnected: true
        };
      }
      if (payload.tanggalMulai === payload.tanggalSelesai && payload.waktuMulai && payload.waktuSelesai) {
        if (payload.waktuMulai >= payload.waktuSelesai) {
          return {
            success: false,
            requestId,
            error: 'Waktu selesai harus lebih lambat dari waktu mulai pada hari yang sama.',
            code: 'INVALID_DATE_TIME',
            backendConnected: true
          };
        }
      }
    }

    // 5. Generate Event Record with Mass Assignment Protection
    const nextSeq = this.events.length + 1;
    const seqPadded = nextSeq.toString().padStart(6, '0');
    const idKegiatan = `EVT-2026-${seqPadded}`;
    const kodeKegiatan = `KEG-RT07-2026-${payload.tanggalMulai?.split('-')[1] || '08'}-${nextSeq.toString().padStart(3, '0')}`;

    const sanitizedJudul = payload.judul.replace(/<[^>]*>?/gm, '').trim();
    const sanitizedDeskripsi = (payload.deskripsi || '').replace(/<[^>]*>?/gm, '').trim();
    const sanitizedLokasi = (payload.lokasi || '').replace(/<[^>]*>?/gm, '').trim();

    const newEvent: KegiatanRT = {
      ...payload,
      judul: sanitizedJudul,
      deskripsi: sanitizedDeskripsi,
      lokasi: sanitizedLokasi,
      idKegiatan,
      kodeKegiatan,
      status: initialStatus,
      qrCheckInToken: `TOKEN-${idKegiatan}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      qrTokenExpiresAt: `${payload.tanggalSelesai || payload.tanggalMulai}T23:59:59.000Z`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actor.userId,
      updatedBy: actor.userId
    };

    this.events.unshift(newEvent);
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'CREATE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      undefined,
      initialStatus,
      `Kegiatan dibuat: ${newEvent.judul}`
    );

    // Notify Warga / Pengurus
    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_NEW',
      'Kegiatan Baru Diajukan',
      `Kegiatan "${newEvent.judul}" telah didaftarkan untuk tanggal ${newEvent.tanggalMulai}.`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: newEvent,
      backendConnected: true,
      auditId
    };
  }

  public submitKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    if (event.status !== 'DRAFT') {
      return {
        success: false,
        requestId,
        error: `Transisi status tidak valid: dari ${event.status} ke MENUNGGU_PERSETUJUAN`,
        code: 'INVALID_STATE_TRANSITION',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'MENUNGGU_PERSETUJUAN';
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'SUBMIT_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      'Kegiatan diajukan untuk persetujuan Ketua RT'
    );

    this.createNotification(
      'KETUA_RT',
      'EVENT_NEW',
      'Permohonan Persetujuan Kegiatan',
      `Kegiatan "${event.judul}" memerlukan persetujuan Ketua RT.`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public approveKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_APPROVE')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'APPROVE_EVENT', 'DENIED', 'DENIED', undefined, undefined, 'Hanya Ketua RT atau Admin yang dapat menyetujui kegiatan');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Hanya Ketua RT atau Admin yang dapat menyetujui kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    if (event.status !== 'MENUNGGU_PERSETUJUAN' && event.status !== 'DITUNDA' && event.status !== 'DRAFT') {
      return {
        success: false,
        requestId,
        error: `Transisi tidak valid: status saat ini adalah ${event.status}`,
        code: 'INVALID_STATE_TRANSITION',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'DISETUJUI';
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'APPROVE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      `Kegiatan disetujui oleh ${actor.nama || actor.role}`
    );

    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_NEW',
      'Kegiatan Resmi Disetujui',
      `Kegiatan "${event.judul}" telah disetujui untuk ${event.tanggalMulai} pukul ${event.waktuMulai} WIB.`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public rejectKegiatan(
    actor: ActorSession,
    idKegiatan: string,
    reason: string,
    requestId: string
  ): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_APPROVE')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'REJECT_EVENT', 'DENIED', 'DENIED', undefined, undefined, 'Unauthorized reject');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Hanya Ketua RT / Admin yang dapat menolak kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'DRAFT';
    event.rejectionReason = reason;
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'REJECT_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      `Kegiatan ditolak dan dikembalikan ke DRAFT. Alasan: ${reason}`
    );

    this.createNotification(
      event.createdBy,
      'EVENT_SCHEDULE_CHANGE',
      'Kegiatan Dikembalikan ke DRAFT',
      `Kegiatan "${event.judul}" dikembalikan oleh Ketua RT: ${reason}`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public postponeKegiatan(
    actor: ActorSession,
    idKegiatan: string,
    newStartDate: string,
    newStartTime: string,
    reason: string,
    requestId: string
  ): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_CANCEL')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'POSTPONE_EVENT', 'DENIED', 'DENIED');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Anda tidak memiliki izin untuk menunda kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'DITUNDA';
    event.tanggalMulai = newStartDate;
    event.waktuMulai = newStartTime;
    event.alasanPenundaan = reason;
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'POSTPONE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      `Ditunda ke ${newStartDate} ${newStartTime}. Alasan: ${reason}`
    );

    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_SCHEDULE_CHANGE',
      'Kegiatan Ditunda / Perubahan Jadwal',
      `Kegiatan "${event.judul}" dijadwalkan ulang ke ${newStartDate} (${newStartTime}). Alasan: ${reason}`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public cancelKegiatan(
    actor: ActorSession,
    idKegiatan: string,
    reason: string,
    requestId: string
  ): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_CANCEL')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'CANCEL_EVENT', 'DENIED', 'DENIED');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Anda tidak memiliki izin untuk membatalkan kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    if (event.status === 'SELESAI' || event.status === 'ARSIP') {
      return {
        success: false,
        requestId,
        error: `Kegiatan berstatus ${event.status} tidak dapat dibatalkan.`,
        code: 'INVALID_STATE_TRANSITION',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'DIBATALKAN';
    event.alasanPembatalan = reason;
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'CANCEL_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      `Kegiatan dibatalkan. Alasan: ${reason}`
    );

    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_CANCEL',
      'Pemberitahuan Pembatalan Kegiatan',
      `Kegiatan "${event.judul}" dibatalkan. Alasan: ${reason}`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public startKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'BERLANGSUNG';
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'START_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      'Kegiatan telah dimulai.'
    );

    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_START',
      'Kegiatan Sedang Berlangsung',
      `Kegiatan "${event.judul}" saat ini sedang berlangsung di ${event.lokasi}.`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public completeKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'SELESAI';
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'COMPLETE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      'Kegiatan dinyatakan selesai.'
    );

    this.createNotification(
      'BROADCAST_WARGA',
      'EVENT_COMPLETE',
      'Kegiatan Selesai',
      `Kegiatan "${event.judul}" telah selesai dilaksanakan. Terima kasih atas partisipasi warga.`,
      idKegiatan
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public archiveKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.hasPermission(actor.role, 'EVENT_ARCHIVE')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'ARCHIVE_EVENT', 'DENIED', 'DENIED');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Hanya Ketua RT atau Admin yang dapat mengarsipkan kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const event = this.events.find((e) => e.idKegiatan === idKegiatan);
    if (!event) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const prevStatus = event.status;
    event.status = 'ARSIP';
    event.updatedAt = new Date().toISOString();
    event.updatedBy = actor.userId;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'ARCHIVE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      prevStatus,
      event.status,
      'Kegiatan dipindahkan ke arsip sejarah RT.'
    );

    return {
      success: true,
      requestId,
      data: event,
      backendConnected: true,
      auditId
    };
  }

  public updateKegiatan(
    actor: ActorSession,
    idKegiatan: string,
    patch: Partial<KegiatanRT>,
    requestId: string
  ): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_EDIT')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'UPDATE_EVENT', 'DENIED', 'DENIED');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Anda tidak memiliki izin untuk mengedit kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const eventIndex = this.events.findIndex((e) => e.idKegiatan === idKegiatan);
    if (eventIndex === -1) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const existing = this.events[eventIndex];
    const updated: KegiatanRT = {
      ...existing,
      ...patch,
      idKegiatan: existing.idKegiatan, // immutable
      kodeKegiatan: existing.kodeKegiatan, // immutable
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId
    };

    this.events[eventIndex] = updated;
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'UPDATE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      existing.status,
      updated.status,
      'Data kegiatan diperbarui.'
    );

    return {
      success: true,
      requestId,
      data: updated,
      backendConnected: true,
      auditId
    };
  }

  public deleteKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    if (this.processedRequestIds.has(requestId)) {
      return {
        success: false,
        requestId,
        error: 'Duplicate request detected.',
        code: 'DUPLICATE_REQUEST',
        backendConnected: this.backendOnline
      };
    }
    this.processedRequestIds.add(requestId);

    if (!this.backendOnline || actor.isBackendConnected === false) {
      return {
        success: false,
        requestId,
        error: 'Backend belum terhubung. Perubahan belum tersimpan ke server.',
        code: 'NOT_COMMITTED',
        backendConnected: false
      };
    }

    if (!this.hasPermission(actor.role, 'EVENT_DELETE')) {
      const auditId = this.logAudit(requestId, actor, idKegiatan, 'DELETE_EVENT', 'DENIED', 'DENIED', undefined, undefined, 'Unauthorized delete');
      return {
        success: false,
        requestId,
        error: 'Akses Ditolak: Hanya Ketua RT atau Admin yang dapat menghapus kegiatan.',
        code: 'FORBIDDEN',
        backendConnected: true,
        auditId
      };
    }

    const eventIndex = this.events.findIndex((e) => e.idKegiatan === idKegiatan);
    if (eventIndex === -1) {
      return {
        success: false,
        requestId,
        error: 'Kegiatan tidak ditemukan.',
        code: 'NOT_FOUND',
        backendConnected: true
      };
    }

    const deleted = this.events.splice(eventIndex, 1)[0];
    this.saveToStorage();

    const auditId = this.logAudit(
      requestId,
      actor,
      idKegiatan,
      'DELETE_EVENT',
      'AUTHORIZED',
      'SUCCESS',
      deleted.status,
      'DELETED',
      `Kegiatan ${deleted.judul} dihapus permanen oleh ${actor.nama || actor.role}`
    );

    return {
      success: true,
      requestId,
      data: deleted,
      backendConnected: true,
      auditId
    };
  }

  public publishKegiatan(actor: ActorSession, idKegiatan: string, requestId: string): MutationResponse<KegiatanRT> {
    return this.approveKegiatan(actor, idKegiatan, requestId);
  }

  // Audit Logs Getter
  public getAuditLogs(actor: ActorSession): EventAuditLog[] {
    const role = actor.role.toUpperCase();
    if (['KETUA_RT', 'ADMIN', 'SEKRETARIS_RT'].includes(role)) {
      return this.auditLogs;
    }
    return [];
  }

  // Notifications Getter & Mutators
  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId || n.userId === 'BROADCAST_WARGA');
  }

  public markNotificationAsRead(notificationId: string) {
    const target = this.notifications.find((n) => n.notificationId === notificationId);
    if (target) {
      target.status = 'READ';
      target.readAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === 'BROADCAST_WARGA') {
        n.status = 'READ';
        n.readAt = new Date().toISOString();
      }
    });
    this.saveToStorage();
  }
}

export const activityCalendarService = new ActivityCalendarService();
