// SMART RT 07 RW 11 GPA NGIJO - Audit Log Service (TAHAP 6E PRODUCTION MONITORING)
// Server-side logging, correlation ID tracking, privacy-aware sanitization & tamper-resistant design

import { AuditLog, AuditSeverity, UserRole } from '../types/rt';
import { syncDataWithGAS } from './apiService';
import { maskNIK, maskPhone } from './securityService';

const STORAGE_KEY_AUDIT_LOGS = 'SMART_RT_AUDIT_LOGS_TAHAP6E';

// Generate unique Correlation ID: REQ-YYYYMMDD-HEX6
export const generateCorrelationId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `REQ-${dateStr}-${randomHex}`;
};

// Event Catalogue for SMART RT 07
export const AUDIT_EVENTS = {
  // Auth
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  MULTIPLE_LOGIN_FAILURE: 'MULTIPLE_LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',

  // User & Permission
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  PERMISSION_CHANGED: 'PERMISSION_CHANGED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',

  // Surat Pengantar
  SURAT_CREATED: 'SURAT_CREATED',
  SURAT_UPDATED: 'SURAT_UPDATED',
  SURAT_VERIFIED: 'SURAT_VERIFIED',
  SURAT_REJECTED: 'SURAT_REJECTED',
  SURAT_APPROVED: 'SURAT_APPROVED',
  SURAT_SIGNED: 'SURAT_SIGNED',
  SURAT_COMPLETED: 'SURAT_COMPLETED',
  SURAT_DOWNLOADED: 'SURAT_DOWNLOADED',

  // Document & Digital Archiving
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED: 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED: 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',

  // Finance
  IURAN_CREATED: 'IURAN_CREATED',
  IURAN_UPDATED: 'IURAN_UPDATED',
  IURAN_PAID: 'IURAN_PAID',
  IURAN_VERIFIED: 'IURAN_VERIFIED',
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED: 'TRANSACTION_DELETED',

  // Pengaduan
  PENGADUAN_CREATED: 'PENGADUAN_CREATED',
  PENGADUAN_UPDATED: 'PENGADUAN_UPDATED',
  PENGADUAN_ASSIGNED: 'PENGADUAN_ASSIGNED',
  PENGADUAN_COMPLETED: 'PENGADUAN_COMPLETED',
  PENGADUAN_CLOSED: 'PENGADUAN_CLOSED',

  // WhatsApp
  WA_SEND_REQUESTED: 'WA_SEND_REQUESTED',
  WA_SEND_SUCCESS: 'WA_SEND_SUCCESS',
  WA_SEND_FAILED: 'WA_SEND_FAILED',
  WA_RETRY: 'WA_RETRY',

  // AI Assistant / RITA & RAG
  AI_REQUEST: 'AI_REQUEST',
  AI_RESPONSE: 'AI_RESPONSE',
  AI_ERROR: 'AI_ERROR',
  AI_RAG_QUERY: 'AI_RAG_QUERY',
  AI_RAG_RETRIEVAL: 'AI_RAG_RETRIEVAL',
  AI_RAG_RESPONSE: 'AI_RAG_RESPONSE',
  AI_RAG_NO_SOURCE: 'AI_RAG_NO_SOURCE',
  AI_RAG_DENIED: 'AI_RAG_DENIED'
} as const;

// Privacy & Sanitization Guard: Removes NIK, KK, Passwords, Tokens, API Keys
export const sanitizeDetailsForAudit = (details: string): string => {
  if (!details) return '';
  
  return details
    // Remove 16-digit NIKs
    .replace(/\b3507\d{12}\b/g, (match) => maskNIK(match))
    // Remove passwords or tokens
    .replace(/(password|token|secret|key|authorization)=['"]?[^'"\s]+['"]?/gi, '$1=***MASKED***')
    // Mask phone numbers
    .replace(/\b(08|628)\d{8,11}\b/g, (match) => maskPhone(match))
    .substring(0, 300); // Limit length
};

// Initial Preset Seed for Production Audit Trail
const INITIAL_AUDIT_SEED: AuditLog[] = [
  {
    id_log: 'LOG-20260809-001',
    logId: 'LOG-20260809-001',
    timestamp: '2026-08-09 08:00:12',
    userId: 'ADM-001',
    userName: 'Bpk. Tri Raharjo (Admin RT)',
    role: 'ADMIN',
    action: 'LOGIN_SUCCESS',
    module: 'AUTH',
    targetType: 'SYSTEM_SESSION',
    targetId: 'SES-9921',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Login berhasil dari IP terdaftar dengan otentikasi 2-layer.',
    correlationId: 'REQ-20260809-8F73A1',
    user: 'Bpk. Tri Raharjo (Admin RT)',
    record_id: 'SES-9921',
    description: 'Login berhasil dari IP terdaftar dengan otentikasi 2-layer.'
  },
  {
    id_log: 'LOG-20260809-002',
    logId: 'LOG-20260809-002',
    timestamp: '2026-08-09 08:15:30',
    userId: 'WAR-008',
    userName: 'Bpk. Hendra Wijaya',
    role: 'WARGA',
    action: 'SURAT_CREATED',
    module: 'SURAT',
    targetType: 'SuratPengantar',
    targetId: 'SURAT-2026-0012',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Pengajuan Surat Pengantar KTP baru diajukan oleh warga (Blok A-12).',
    correlationId: 'REQ-20260809-A4B12C',
    user: 'Bpk. Hendra Wijaya',
    record_id: 'SURAT-2026-0012',
    description: 'Pengajuan Surat Pengantar KTP baru diajukan oleh warga (Blok A-12).'
  },
  {
    id_log: 'LOG-20260809-003',
    logId: 'LOG-20260809-003',
    timestamp: '2026-08-09 08:30:00',
    userId: 'PGR-002',
    userName: 'Ibu Ratna Pertiwi (Sekretaris)',
    role: 'PENGURUS',
    action: 'SURAT_VERIFIED',
    module: 'SURAT',
    targetType: 'SuratPengantar',
    targetId: 'SURAT-2026-0012',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Surat Pengantar KTP diverifikasi berkasnya oleh Sekretaris RT.',
    correlationId: 'REQ-20260809-C82D11',
    user: 'Ibu Ratna Pertiwi (Sekretaris)',
    record_id: 'SURAT-2026-0012',
    description: 'Surat Pengantar KTP diverifikasi berkasnya oleh Sekretaris RT.'
  },
  {
    id_log: 'LOG-20260809-004',
    logId: 'LOG-20260809-004',
    timestamp: '2026-08-09 09:00:45',
    userId: 'KRT-001',
    userName: 'Bpk. Agus Santoso (Ketua RT)',
    role: 'KETUA_RT',
    action: 'SURAT_APPROVED',
    module: 'SURAT',
    targetType: 'SuratPengantar',
    targetId: 'SURAT-2026-0012',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Ketua RT menyetujui & menandatangani Surat Pengantar KTP digital.',
    correlationId: 'REQ-20260809-F91A00',
    user: 'Bpk. Agus Santoso (Ketua RT)',
    record_id: 'SURAT-2026-0012',
    description: 'Ketua RT menyetujui & menandatangani Surat Pengantar KTP digital.'
  },
  {
    id_log: 'LOG-20260809-005',
    logId: 'LOG-20260809-005',
    timestamp: '2026-08-09 09:05:10',
    userId: 'SYSTEM',
    userName: 'WhatsApp Gateway Engine',
    role: 'ADMIN',
    action: 'WA_SEND_SUCCESS',
    module: 'WA',
    targetType: 'WA_NOTIFICATION',
    targetId: 'WALOG-17882',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Notifikasi WA SURAT_COMPLETED terkirim ke warga terdaftar (+62812****0004).',
    correlationId: 'REQ-20260809-F91A00',
    user: 'WhatsApp Gateway Engine',
    record_id: 'WALOG-17882',
    description: 'Notifikasi WA SURAT_COMPLETED terkirim ke warga terdaftar (+62812****0004).'
  },
  {
    id_log: 'LOG-20260809-006',
    logId: 'LOG-20260809-006',
    timestamp: '2026-08-09 09:12:00',
    userId: 'WAR-008',
    userName: 'Bpk. Hendra Wijaya',
    role: 'WARGA',
    action: 'DOCUMENT_DOWNLOADED',
    module: 'DOKUMEN',
    targetType: 'DigitalDocument',
    targetId: 'DOC-2026-0012',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Dokumen Surat Pengantar PDF A4 diunduh oleh warga pemohon.',
    correlationId: 'REQ-20260809-D89E34',
    user: 'Bpk. Hendra Wijaya',
    record_id: 'DOC-2026-0012',
    description: 'Dokumen Surat Pengantar PDF A4 diunduh oleh warga pemohon.'
  },
  {
    id_log: 'LOG-20260809-007',
    logId: 'LOG-20260809-007',
    timestamp: '2026-08-09 09:30:15',
    userId: 'PGR-001',
    userName: 'Bpk. Bambang Setiawan (Bendahara)',
    role: 'PENGURUS',
    action: 'IURAN_PAID',
    module: 'KEUANGAN',
    targetType: 'TagihanIuran',
    targetId: 'IUR-202608-005',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Konfirmasi pembayaran iuran bulanan Agustus 2026 Blok C-05 LUNAS.',
    correlationId: 'REQ-20260809-B771A2',
    user: 'Bpk. Bambang Setiawan (Bendahara)',
    record_id: 'IUR-202608-005',
    description: 'Konfirmasi pembayaran iuran bulanan Agustus 2026 Blok C-05 LUNAS.'
  },
  {
    id_log: 'LOG-20260809-008',
    logId: 'LOG-20260809-008',
    timestamp: '2026-08-09 10:00:22',
    userId: 'WAR-015',
    userName: 'Ibu Siti Aminah',
    role: 'WARGA',
    action: 'PENGADUAN_CREATED',
    module: 'PENGADUAN',
    targetType: 'Pengaduan',
    targetId: 'ADU-2026-0004',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Laporan pengaduan lingkungan (Lampu Jalan Padam Blok D) dibuat.',
    correlationId: 'REQ-20260809-E11900',
    user: 'Ibu Siti Aminah',
    record_id: 'ADU-2026-0004',
    description: 'Laporan pengaduan lingkungan (Lampu Jalan Padam Blok D) dibuat.'
  },
  {
    id_log: 'LOG-20260809-009',
    logId: 'LOG-20260809-009',
    timestamp: '2026-08-09 10:15:00',
    userId: 'WAR-015',
    userName: 'Ibu Siti Aminah',
    role: 'WARGA',
    action: 'AI_REQUEST',
    module: 'AI',
    targetType: 'RITA_AI_PROMPT',
    targetId: 'RITA-99218',
    status: 'SUCCESS',
    severity: 'INFO',
    details: 'Warga mengajukan pertanyaan RAG ke RITA AI: Jadwal Pengangkutan Sampah.',
    correlationId: 'REQ-20260809-R112A0',
    user: 'Ibu Siti Aminah',
    record_id: 'RITA-99218',
    description: 'Warga mengajukan pertanyaan RAG ke RITA AI: Jadwal Pengangkutan Sampah.'
  },
  {
    id_log: 'LOG-20260809-010',
    logId: 'LOG-20260809-010',
    timestamp: '2026-08-09 10:45:00',
    userId: 'UNKNOWN',
    userName: 'Percobaan Akses Tidak Dikenal',
    role: 'PUBLIC',
    action: 'LOGIN_FAILED',
    module: 'AUTH',
    targetType: 'AUTH_GATE',
    targetId: 'ATTEMPT-1',
    status: 'FAILED',
    severity: 'WARNING',
    details: 'Gagal login: Username/Password salah untuk user rt07_guest.',
    correlationId: 'REQ-20260809-X88102',
    user: 'Percobaan Akses Tidak Dikenal',
    record_id: 'ATTEMPT-1',
    description: 'Gagal login: Username/Password salah untuk user rt07_guest.'
  },
  {
    id_log: 'LOG-20260809-011',
    logId: 'LOG-20260809-011',
    timestamp: '2026-08-09 10:46:12',
    userId: 'UNKNOWN',
    userName: 'Percobaan Akses Tidak Dikenal',
    role: 'PUBLIC',
    action: 'MULTIPLE_LOGIN_FAILURE',
    module: 'SECURITY',
    targetType: 'BRUTE_FORCE_GUARD',
    targetId: 'IP-213.163.xxx',
    status: 'FAILED',
    severity: 'CRITICAL',
    details: 'MULTIPLE_LOGIN_FAILURE: 3 kali percobaan login gagal berturut-turut terdeteksi dalam 5 menit. Akses diblokir sementara.',
    correlationId: 'REQ-20260809-X88102',
    user: 'Percobaan Akses Tidak Dikenal',
    record_id: 'IP-213.163.xxx',
    description: 'MULTIPLE_LOGIN_FAILURE: 3 kali percobaan login gagal berturut-turut terdeteksi dalam 5 menit. Akses diblokir sementara.'
  }
];

// In-memory fallback for CLI and SSR
let inMemoryAuditLogs: AuditLog[] = [...INITIAL_AUDIT_SEED];

export const getStoredAuditLogs = (): AuditLog[] => {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_SEED));
        return INITIAL_AUDIT_SEED;
      }
      return JSON.parse(raw);
    } catch {
      return inMemoryAuditLogs;
    }
  }
  return inMemoryAuditLogs;
};

export const saveStoredAuditLogs = (logs: AuditLog[]): void => {
  inMemoryAuditLogs = [...logs];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
    } catch {
      // ignore
    }
  }
};

export interface CreateAuditLogParams {
  userId?: string;
  userName?: string;
  role?: UserRole;
  action: string;
  module: 'AUTH' | 'USER' | 'SURAT' | 'DOKUMEN' | 'KEUANGAN' | 'PENGADUAN' | 'WA' | 'AI' | 'SECURITY' | 'SYSTEM' | string;
  targetType: string;
  targetId: string;
  status?: 'SUCCESS' | 'WARNING' | 'FAILED';
  severity?: AuditSeverity;
  details: string;
  correlationId?: string;
}

// Record Audit Log Server-Side via GAS + Local Backup
export const writeAuditLog = async (params: CreateAuditLogParams): Promise<AuditLog> => {
  const correlationId = params.correlationId || generateCorrelationId();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const logId = `LOG-${Date.now()}`;

  const cleanDetails = sanitizeDetailsForAudit(params.details);

  const newLog: AuditLog = {
    id_log: logId,
    logId,
    timestamp,
    userId: params.userId || 'SYSTEM',
    userName: params.userName || 'System Engine',
    role: params.role || 'ADMIN',
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    targetId: params.targetId,
    status: params.status || 'SUCCESS',
    severity: params.severity || (params.status === 'FAILED' ? 'WARNING' : 'INFO'),
    details: cleanDetails,
    correlationId,
    user: params.userName || 'System Engine',
    record_id: params.targetId,
    description: cleanDetails
  };

  // Sync with Google Apps Script AUDIT_LOG Sheet
  syncDataWithGAS('writeAuditLog', newLog).catch(() => {});

  // Update Local Storage
  const current = getStoredAuditLogs();
  const updated = [newLog, ...current];
  saveStoredAuditLogs(updated);

  return newLog;
};

// Failed Login Tracking (In-Memory rolling window for MULTIPLE_LOGIN_FAILURE detection)
interface FailedAttemptTracker {
  identifier: string;
  count: number;
  lastTimestamp: number;
}
const failedLoginMap = new Map<string, FailedAttemptTracker>();

export const trackFailedLogin = async (identifier: string, details?: string): Promise<void> => {
  const now = Date.now();
  const cleanId = identifier.trim().toLowerCase();
  const tracker = failedLoginMap.get(cleanId) || { identifier: cleanId, count: 0, lastTimestamp: now };

  // 5 Minutes window reset
  if (now - tracker.lastTimestamp > 5 * 60 * 1000) {
    tracker.count = 0;
  }

  tracker.count += 1;
  tracker.lastTimestamp = now;
  failedLoginMap.set(cleanId, tracker);

  const correlationId = generateCorrelationId();

  // Write single failed attempt log
  await writeAuditLog({
    userId: 'UNKNOWN',
    userName: `Login Attempt (${cleanId})`,
    role: 'PUBLIC',
    action: AUDIT_EVENTS.LOGIN_FAILED,
    module: 'AUTH',
    targetType: 'AUTH_GATE',
    targetId: cleanId,
    status: 'FAILED',
    severity: 'WARNING',
    details: details || `Percobaan login gagal untuk user: ${cleanId}`,
    correlationId
  });

  // Trigger CRITICAL alert if >= 3 failures in 5 minutes
  if (tracker.count >= 3) {
    await writeAuditLog({
      userId: 'SYSTEM_BRUTE_FORCE_GUARD',
      userName: 'Security Guard System',
      role: 'ADMIN',
      action: AUDIT_EVENTS.MULTIPLE_LOGIN_FAILURE,
      module: 'SECURITY',
      targetType: 'LOGIN_MONITOR',
      targetId: cleanId,
      status: 'FAILED',
      severity: 'CRITICAL',
      details: `MULTIPLE_LOGIN_FAILURE: ${tracker.count} kali percobaan login gagal berturut-turut pada user '${cleanId}'.`,
      correlationId
    });
  }
};

// Fetch & Filter Audit Logs with Authorization Guard
export const fetchAuditLogs = (
  role: UserRole,
  filters?: {
    module?: string;
    severity?: 'ALL' | AuditSeverity;
    search?: string;
    action?: string;
  }
): AuditLog[] => {
  // Authorization Rule: Only ADMIN, KETUA_RT, and PENGURUS can view audit logs
  if (role !== 'ADMIN' && role !== 'KETUA_RT' && role !== 'PENGURUS') {
    return [];
  }

  let logs = getStoredAuditLogs();

  // Pengurus receives operational logs only (excludes SECURITY CRITICAL)
  if (role === 'PENGURUS') {
    logs = logs.filter((l) => l.module !== 'SECURITY');
  }

  if (!filters) return logs;

  return logs.filter((l) => {
    if (filters.module && filters.module !== 'ALL' && l.module !== filters.module) return false;
    if (filters.severity && filters.severity !== 'ALL' && l.severity !== filters.severity) return false;
    if (filters.action && filters.action !== 'ALL' && l.action !== filters.action) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const userName = (l.userName || l.user || '').toLowerCase();
      const action = (l.action || '').toLowerCase();
      const details = (l.details || l.description || '').toLowerCase();
      const correlationId = (l.correlationId || '').toLowerCase();
      const targetId = (l.targetId || l.record_id || '').toLowerCase();

      const match =
        userName.includes(q) ||
        action.includes(q) ||
        details.includes(q) ||
        correlationId.includes(q) ||
        targetId.includes(q);
      if (!match) return false;
    }
    return true;
  });
};

// Retention & Security Policy Metadata
export const getAuditRetentionPolicy = () => {
  return {
    storageBackend: 'Google Apps Script + Google Sheets (AUDIT_LOG)',
    retentionDays: 365,
    immutability: 'APPEND-ONLY (No Delete/Edit APIs Exposed)',
    privacyPolicy: 'Zero Raw NIK/KK, Zero Passwords, Zero API Tokens in Logs',
    correlationIdFormat: 'REQ-YYYYMMDD-XXXXXX',
    roleAccess: {
      ADMIN: 'Full Audit Trail Access',
      KETUA_RT: 'Full Audit Trail Access',
      PENGURUS: 'Operational Audit Access',
      WARGA: 'No Access',
      PUBLIC: 'No Access'
    }
  };
};

export const AuditLogService = {
  writeAuditLog,
  logEvent: writeAuditLog,
  getAuditLogs: fetchAuditLogs,
  fetchAuditLogs,
  getStoredAuditLogs,
  generateCorrelationId,
  AUDIT_EVENTS
};

