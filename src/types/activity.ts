// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Type Definitions and Data Contracts

export type EventStatus =
  | 'DRAFT'
  | 'MENUNGGU_PERSETUJUAN'
  | 'DISETUJUI'
  | 'BERLANGSUNG'
  | 'SELESAI'
  | 'DIBATALKAN'
  | 'DITUNDA'
  | 'ARSIP';

export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type EventCategory =
  | 'RAPAT_RT'
  | 'RAPAT_RW'
  | 'KERJA_BAKTI'
  | 'POSYANDU'
  | 'KEAMANAN'
  | 'KEAGAMAAN'
  | 'SOSIAL'
  | 'PENDIDIKAN'
  | 'KEPEMUDAAN'
  | 'OLAHRAGA'
  | 'HUT_RI'
  | 'TIRAKATAN'
  | 'GOTONG_ROYONG'
  | 'PELAYANAN_WARGA'
  | 'LAINNYA';

export type JenisKegiatan = 'RUTIN' | 'INSIDENTAL' | 'PROGRAM_KERJA' | 'DARURAT' | 'HARI_BESAR';

export type AttendanceStatus = 'TERDAFTAR' | 'HADIR' | 'TIDAK_HADIR' | 'IZIN';

export type EventPermission =
  | 'EVENT_VIEW'
  | 'EVENT_CREATE'
  | 'EVENT_EDIT'
  | 'EVENT_DELETE'
  | 'EVENT_APPROVE'
  | 'EVENT_CANCEL'
  | 'EVENT_POST'
  | 'EVENT_ATTENDANCE'
  | 'EVENT_REPORT'
  | 'EVENT_ARCHIVE';

export type ActivityRole =
  | 'WARGA'
  | 'PENGURUS'
  | 'SEKRETARIS_RT'
  | 'BENDAHARA_RT'
  | 'KETUA_RT'
  | 'ADMIN'
  | 'PUBLIC';

export type ReminderChannel = 'IN_APP' | 'WHATSAPP';
export type ReminderTiming = 'H-7' | 'H-3' | 'H-1' | 'H-0';

export type WhatsAppDeliveryStatus = 'SENT' | 'QUEUED' | 'RETRY' | 'FAILED' | 'NOT_CONFIGURED';

export type WhatsAppEventTrigger =
  | 'EVENT_CREATED'
  | 'EVENT_APPROVED'
  | 'EVENT_UPDATED'
  | 'EVENT_CANCELLED'
  | 'EVENT_POSTPONED'
  | 'EVENT_REMINDER'
  | 'EVENT_STARTED'
  | 'EVENT_COMPLETED';

export type ReportStatus = 'DRAFT' | 'FINAL';
export type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';

export interface KegiatanRT {
  idKegiatan: string;
  kodeKegiatan: string;
  judul: string;
  jenisKegiatan: JenisKegiatan;
  kategori: EventCategory;
  deskripsi: string;
  tanggalMulai: string; // YYYY-MM-DD
  waktuMulai: string; // HH:mm
  tanggalSelesai: string; // YYYY-MM-DD
  waktuSelesai: string; // HH:mm
  lokasi: string;
  alamatLokasi: string;
  penyelenggara: string;
  penanggungJawabId: string; // Ref to Warga ID
  penanggungJawabNama: string;
  targetPeserta: string;
  estimasiPeserta: number;
  status: EventStatus;
  prioritas: EventPriority;
  isPublic: boolean;
  isAllDay: boolean;
  alasanPenundaan?: string;
  alasanPembatalan?: string;
  rejectionReason?: string;
  qrCheckInToken?: string;
  qrTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface KehadiranKegiatan {
  id: string;
  kegiatanId: string;
  wargaId: string;
  keluargaId?: string;
  namaWarga: string;
  blokRumah?: string;
  statusKehadiran: AttendanceStatus;
  checkInAt?: string;
  checkOutAt?: string;
  catatan?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface DokumentasiKegiatan {
  id: string;
  kegiatanId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  driveFileId?: string;
  keterangan?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface LaporanKegiatanRevision {
  version: number;
  modifiedAt: string;
  modifiedBy: string;
  changeSummary: string;
}

export interface LaporanKegiatan {
  idLaporan: string;
  kegiatanId: string;
  nomorLaporan: string;
  judulKegiatan: string;
  tanggalPelaksanaan: string;
  lokasi: string;
  penanggungJawab: string;
  jumlahPesertaHadir: number;
  totalPesertaTerdaftar: number;
  ringkasanPelaksanaan: string;
  hasilKegiatan: string;
  kendala: string;
  tindakLanjut: string;
  status: ReportStatus;
  finalizedAt?: string;
  finalizedBy?: string;
  createdAt: string;
  updatedAt: string;
  revisionHistory?: LaporanKegiatanRevision[];
}

export interface EventReminder {
  id: string;
  kegiatanId: string;
  timing: ReminderTiming;
  channel: ReminderChannel;
  targetUserId?: string;
  targetPhone?: string;
  message: string;
  scheduledAt: string;
  sentAt?: string;
  status: WhatsAppDeliveryStatus;
  errorMessage?: string;
}

export interface EventAuditLog {
  auditId: string;
  requestId: string;
  timestamp: string;
  actorUserId: string;
  actorRole: string;
  resourceId: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  authorization: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  type:
    | 'EVENT_NEW'
    | 'EVENT_SCHEDULE_CHANGE'
    | 'EVENT_CANCEL'
    | 'EVENT_REMINDER'
    | 'EVENT_START'
    | 'EVENT_COMPLETE'
    | 'ATTENDANCE_CONFIRMATION'
    | 'SYSTEM';
  title: string;
  message: string;
  kegiatanId?: string;
  createdAt: string;
  readAt?: string;
  status: 'UNREAD' | 'READ';
}

export interface EventAnalytics {
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  postponedEvents: number;
  activeEvents: number;
  attendanceRate: number;
  totalAttendees: number;
  eventsByCategory: Record<string, number>;
  eventsByMonth: Array<{ month: string; total: number; completed: number }>;
  eventsByPriority: Record<string, number>;
}

export interface ActorSession {
  userId: string;
  role: ActivityRole;
  wargaId?: string;
  nama?: string;
  isBackendConnected?: boolean;
}

export interface MutationResponse<T = any> {
  success: boolean;
  requestId: string;
  data?: T;
  error?: string;
  code?: string;
  backendConnected: boolean;
  auditId?: string;
}
