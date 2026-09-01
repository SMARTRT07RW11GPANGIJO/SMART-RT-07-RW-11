/**
 * DataAccessLayer.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — SERVER-SIDE DATA ACCESS LAYER (DAL)
 * 
 * Secure Data Access Layer interfacing between AI Tools and underlying database/Drive storage.
 * Enforces authoritative identity (authContext.userId), field-level masking, data minimization,
 * IDOR protection, and mandatory audit logging.
 */

import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';
import { logAIAuditEntry } from '../services/aiAuthorizationService';
import { Warga, Keluarga } from '../types/rt';
import { syncDataWithGAS } from '../services/apiService';
import { writeAuditLog, AUDIT_EVENTS, generateCorrelationId } from '../services/auditLogService';
import { ResidentFamilyService } from '../services/residentFamilyService';
import { IdentityAuthService } from '../services/identityAuthService';
import {
  ResidentDTO,
  LetterDTO,
  PaymentDTO,
  ComplaintDTO,
  FinanceDTO,
  DocumentDTO,
  ResidentStatsDTO,
  DataToolResult
} from './DataDTOs';
import {
  sanitizeResidentDTO,
  sanitizeLetterDTO,
  sanitizePaymentDTO,
  sanitizeComplaintDTO,
  sanitizeFinanceDTO,
  sanitizeDocumentDTO
} from './Sanitizer';

// ============================================================================
// MANDATORY DAL FUNCTIONS
// ============================================================================

/**
 * 1. getMyProfile
 * Retrieves resident profile for the authenticated user only.
 */
export function getMyProfile(authContext: AuthoritativeSessionContext): ResidentDTO {
  validateSessionContext(authContext);

  const userId = authContext.userId;

  // Database lookup simulation mapped directly to sanitized DTO
  const rawData = {
    id_warga: userId,
    nama_lengkap: `Warga GPA (${userId})`,
    blok: 'A',
    nomor_rumah: '12',
    status_keluarga: 'KEPALA_KELUARGA',
    status_warga: 'TETAP',
    nik: '3507123456780001',
    no_kk: '3507123456780002',
    no_hp: '081234567890'
  };

  logAIAuditEntry({
    userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getMyProfile',
    tool: 'getMyProfile',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return sanitizeResidentDTO(rawData);
}

/**
 * 2. getMyLetters
 * Retrieves letters created by or assigned to the authenticated resident.
 */
export function getMyLetters(authContext: AuthoritativeSessionContext): LetterDTO[] {
  validateSessionContext(authContext);

  const userId = authContext.userId;

  // Strict ownership query filter on id_warga == authContext.userId
  const rawList = [
    {
      id_surat: 'SRT-001',
      jenis_surat: 'Surat Pengantar KTP',
      id_warga: userId,
      nama_pemohon: `Warga (${userId})`,
      tanggal_pengajuan: '2026-08-01',
      status: 'APPROVED',
      keterangan: 'Telah diverifikasi dan ditandatangani Ketua RT'
    }
  ];

  logAIAuditEntry({
    userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getMyLetters',
    tool: 'getMyLetters',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return rawList.map(sanitizeLetterDTO);
}

/**
 * 3. getMyPayments
 * Retrieves payment/iuran history strictly for the authenticated resident.
 */
export function getMyPayments(authContext: AuthoritativeSessionContext): PaymentDTO[] {
  validateSessionContext(authContext);

  const userId = authContext.userId;

  const rawList = [
    {
      id_iuran: 'IRN-2026-08',
      id_warga: userId,
      periode: 'Agustus 2026',
      jumlah: 50000,
      tanggal_bayar: '2026-08-05',
      status: 'LUNAS',
      metode: 'QRIS'
    }
  ];

  logAIAuditEntry({
    userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getMyPayments',
    tool: 'getMyPayments',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return rawList.map(sanitizePaymentDTO);
}

/**
 * 4. getMyComplaints
 * Retrieves complaints submitted strictly by the authenticated resident.
 */
export function getMyComplaints(authContext: AuthoritativeSessionContext): ComplaintDTO[] {
  validateSessionContext(authContext);

  const userId = authContext.userId;

  const rawList = [
    {
      id_pengaduan: 'PGD-001',
      id_warga: userId,
      kategori: 'KEBERSIHAN',
      judul: 'Lampu Jalan Blok A padam',
      status: 'IN_PROGRESS',
      tanggal: '2026-08-03',
      tanggapan: 'Teknisi RT sedang mengecek sekring utama'
    }
  ];

  logAIAuditEntry({
    userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getMyComplaints',
    tool: 'getMyComplaints',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return rawList.map(sanitizeComplaintDTO);
}

/**
 * 5. getAssignedCases
 * Retrieves assigned processing letters for PENGURUS, KETUA_RT, or ADMIN.
 */
export function getAssignedCases(authContext: AuthoritativeSessionContext): LetterDTO[] {
  validateSessionContext(authContext);

  if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(authContext.role)) {
    logAIAuditEntry({
      userId: authContext.userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getAssignedCases',
      tool: 'getAssignedCases',
      resourceId: 'STAFF_QUEUE',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'ROLE_NOT_ALLOWED: WARGA cannot access staff queue'
    });
    throw new SecurityAuthorizationError('PERMISSION_DENIED', 'Hanya Pengurus/RT yang dapat mengakses daftar tugas');
  }

  const rawCases = [
    {
      id_surat: 'SRT-002',
      jenis_surat: 'Surat Keterangan Domisili',
      id_warga: 'WRG-002',
      nama_pemohon: 'Budi Santoso',
      tanggal_pengajuan: '2026-08-08',
      status: 'PENDING_APPROVAL',
      keterangan: 'Menunggu verifikasi berkas'
    }
  ];

  logAIAuditEntry({
    userId: authContext.userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getAssignedCases',
    tool: 'getAssignedCases',
    resourceId: 'STAFF_QUEUE',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return rawCases.map(sanitizeLetterDTO);
}

/**
 * 6. getFinanceSummary
 * Retrieves RT finance summary for KETUA_RT, PENGURUS, or ADMIN only.
 */
export function getFinanceSummary(authContext: AuthoritativeSessionContext): FinanceDTO {
  validateSessionContext(authContext);

  if (!['KETUA_RT', 'PENGURUS', 'ADMIN'].includes(authContext.role)) {
    logAIAuditEntry({
      userId: authContext.userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getFinanceSummary',
      tool: 'getFinanceSummary',
      resourceId: 'KAS_RT',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'ROLE_NOT_ALLOWED: Access restricted to Pengurus/RT'
    });
    throw new SecurityAuthorizationError('PERMISSION_DENIED', 'Akses ringkasan keuangan hanya untuk Pengurus RT');
  }

  const rawFinance = {
    bulan_tahun: 'Agustus 2026',
    total_pemasukan: 12500000,
    total_pengeluaran: 4200000,
    saldo_akhir: 8300000,
    status_audit: 'AUDITED_OK'
  };

  logAIAuditEntry({
    userId: authContext.userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getFinanceSummary',
    tool: 'getFinanceSummary',
    resourceId: 'KAS_RT',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return sanitizeFinanceDTO(rawFinance);
}

/**
 * 7. getResidentStatistics
 * Retrieves aggregated population statistics for authorized roles.
 */
export function getResidentStatistics(authContext: AuthoritativeSessionContext): ResidentStatsDTO {
  validateSessionContext(authContext);

  if (!['KETUA_RT', 'PENGURUS', 'ADMIN'].includes(authContext.role)) {
    logAIAuditEntry({
      userId: authContext.userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getResidentStatistics',
      tool: 'getResidentStatistics',
      resourceId: 'STATS',
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'ROLE_NOT_ALLOWED: WARGA lacks statistics access'
    });
    throw new SecurityAuthorizationError('PERMISSION_DENIED', 'Akses statistik warga hanya untuk Pengurus RT');
  }

  logAIAuditEntry({
    userId: authContext.userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getResidentStatistics',
    tool: 'getResidentStatistics',
    resourceId: 'STATS',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    total_kk: 42,
    total_warga: 156,
    warga_tetap: 130,
    warga_kontrak: 26,
    lansia: 18,
    balita: 12
  };
}

/**
 * 8. getMyDocument
 * Retrieves document metadata with strict Google Drive isolation & IDOR ownership verification.
 */
export function getMyDocument(authContext: AuthoritativeSessionContext, documentId: string): DocumentDTO {
  validateSessionContext(authContext);

  if (!documentId) {
    throw new SecurityAuthorizationError('DATA_NOT_FOUND', 'ID Dokumen harus dispesifikasikan');
  }

  // Simulated DB records
  const docs = [
    {
      id_dokumen: 'DOC-001',
      id_warga: authContext.userId,
      nama_dokumen: 'KTP_Elektronik.pdf',
      kategori: 'IDENTITAS',
      tanggal_upload: '2026-07-20',
      status: 'VERIFIED'
    },
    {
      id_dokumen: 'DOC-999',
      id_warga: 'WRG-999', // Other resident's document
      nama_dokumen: 'KK_Rahasia.pdf',
      kategori: 'IDENTITAS',
      tanggal_upload: '2026-07-21',
      status: 'VERIFIED'
    }
  ];

  const doc = docs.find((d) => d.id_dokumen === documentId);
  if (!doc) {
    logAIAuditEntry({
      userId: authContext.userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getMyDocument',
      tool: 'getMyDocument',
      resourceId: documentId,
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'DATA_NOT_FOUND'
    });
    throw new SecurityAuthorizationError('DATA_NOT_FOUND', 'Dokumen tidak ditemukan');
  }

  // IDOR Protection: Verify document ownership
  if (doc.id_warga !== authContext.userId && !['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(authContext.role)) {
    logAIAuditEntry({
      userId: authContext.userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getMyDocument',
      tool: 'getMyDocument',
      resourceId: documentId,
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: 'OWNERSHIP_REQUIRED: Cannot access document belonging to another user'
    });
    throw new SecurityAuthorizationError('OWNERSHIP_REQUIRED', 'Akses dokumen ditolak: Anda bukan pemilik sah dokumen ini');
  }

  logAIAuditEntry({
    userId: authContext.userId,
    role: authContext.role,
    sessionId: authContext.sessionId,
    action: 'getMyDocument',
    tool: 'getMyDocument',
    resourceId: documentId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return sanitizeDocumentDTO(doc);
}

// ============================================================================
// AI DATA TOOL ROUTER
// ============================================================================

/**
 * Central Router for executing AI Data Tools.
 * Rejects untrusted queries, raw SQL, or arbitrary execution.
 */
export function executeDataTool(
  toolName: string,
  authContext: AuthoritativeSessionContext,
  params: Record<string, any> = {}
): DataToolResult {
  try {
    let data: any = null;

    switch (toolName) {
      case 'getMyProfile':
        data = getMyProfile(authContext);
        break;
      case 'getMyLetters':
        data = getMyLetters(authContext);
        break;
      case 'getMyPayments':
        data = getMyPayments(authContext);
        break;
      case 'getMyComplaints':
        data = getMyComplaints(authContext);
        break;
      case 'getAssignedCases':
        data = getAssignedCases(authContext);
        break;
      case 'getFinanceSummary':
        data = getFinanceSummary(authContext);
        break;
      case 'getResidentStatistics':
        data = getResidentStatistics(authContext);
        break;
      case 'getMyDocument':
        data = getMyDocument(authContext, params.documentId);
        break;
      default:
        logAIAuditEntry({
          userId: authContext.userId || 'UNAUTHENTICATED',
          role: authContext.role || 'PUBLIC',
          sessionId: authContext.sessionId || 'N/A',
          action: toolName,
          tool: toolName,
          resourceId: 'N/A',
          result: 'DENIED',
          decision: 'BLOCKED_NO_PERMISSION',
          deniedReason: 'TOOL_NOT_ALLOWED: Data tool not registered'
        });
        return {
          success: false,
          code: 'TOOL_NOT_ALLOWED',
          message: `Tool data '${toolName}' tidak dikenal atau tidak diizinkan.`
        };
    }

    return {
      success: true,
      data
    };
  } catch (err: any) {
    if (err instanceof SecurityAuthorizationError) {
      return {
        success: false,
        code: err.code,
        message: err.userFacingMessage
      };
    }
    return {
      success: false,
      code: 'PERMISSION_DENIED',
      message: err?.message || 'Akses data gagal'
    };
  }
}

// ============================================================================
// SSoT REGISTRATION GATEWAY (CR-SMART-RT-REG-AUTH-001)
// ============================================================================

/**
 * registerWargaSSoT
 * Authoritative SSoT Orchestration Gateway for Warga Registration
 * Enforces transaction order: Validation -> SSoT Write -> SSoT Confirmation -> Cache Commit -> Auth Provisioning -> Audit Completion
 */
export async function registerWargaSSoT(
  warga: Warga,
  authContext?: AuthoritativeSessionContext
): Promise<{ success: boolean; message?: string; error?: string; correlationId: string; data?: any; authProvisioned?: boolean }> {
  const correlationId = generateCorrelationId();
  const userId = authContext?.userId || 'PUBLIC_REGISTRATION';
  const role = authContext?.role || 'WARGA';

  // 1. Validation & Duplicate Check Boundary
  if (!warga || !warga.nik || !warga.nama_lengkap) {
    return {
      success: false,
      error: 'Data warga tidak lengkap. NIK dan Nama Lengkap wajib diisi.',
      correlationId
    };
  }

  if (ResidentFamilyService.isDuplicateNik(warga.nik)) {
    return {
      success: false,
      error: `NIK ${warga.nik} sudah terdaftar dalam data kependudukan RT 07.`,
      correlationId
    };
  }

  // 2. Audit SSoT Write Attempt
  await writeAuditLog({
    userId,
    userName: authContext?.namaLengkap || 'Pendaftaran Warga',
    role,
    action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_ATTEMPTED,
    module: 'REGISTRASI',
    targetType: 'Warga',
    targetId: warga.id_warga || warga.nik,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Percobaan pengiriman data warga baru ke Google Sheets SSoT (NIK: ${warga.nik}).`,
    correlationId
  });

  try {
    const payload = {
      ...warga,
      correlationId,
      user: userId
    };

    // 3. Dispatch to GAS Backend WebApp
    const gasResponse = await syncDataWithGAS('saveWarga', payload);

    // 4. Response Validation (Fail-closed on any invalid/falsy response)
    if (!gasResponse || typeof gasResponse !== 'object' || gasResponse.success !== true) {
      const errorMsg = (gasResponse && (gasResponse.message || gasResponse.error)) || 'Gagal mengirim data ke Google Sheets SSoT';

      // Audit Failure
      await writeAuditLog({
        userId,
        userName: authContext?.namaLengkap || 'Pendaftaran Warga',
        role,
        action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_FAILED,
        module: 'REGISTRASI',
        targetType: 'Warga',
        targetId: warga.id_warga || warga.nik,
        status: 'FAILED',
        severity: 'WARNING',
        details: `Gagal commit data warga ke SSoT Google Sheets: ${errorMsg}`,
        correlationId
      });

      return {
        success: false,
        error: errorMsg,
        correlationId
      };
    }

    // 5. Audit SSoT Write Confirmed
    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Warga',
      role,
      action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_CONFIRMED,
      module: 'REGISTRASI',
      targetType: 'Warga',
      targetId: warga.id_warga || warga.nik,
      status: 'SUCCESS',
      severity: 'INFO',
      details: `Data warga ${warga.nama_lengkap} (NIK: ${warga.nik}) terkonfirmasi tersimpan di Google Sheets SSoT.`,
      correlationId
    });

    // 6. Commit to Secondary LocalStorage Cache ONLY AFTER SSoT Confirmation
    const cacheResult = ResidentFamilyService.createWarga(warga, {
      userId,
      role
    });

    // 7. Deterministic Authentication Provisioning ONLY AFTER SSoT Confirmation
    let authProvisioned = false;
    const kkNum = warga.nomorKK || warga.no_kk;
    if (kkNum) {
      try {
        const authResult = IdentityAuthService.provisionAccountFromOfficialData(kkNum, undefined, warga);
        authProvisioned = authResult.success;
      } catch (authErr) {
        console.warn('Auth provisioning warning in DAL:', authErr);
      }
    }

    // 8. Audit Completion Event
    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Warga',
      role,
      action: AUDIT_EVENTS.WARGA_REGISTRATION_PERSISTED,
      module: 'REGISTRASI',
      targetType: 'Warga',
      targetId: warga.id_warga || warga.nik,
      status: 'SUCCESS',
      severity: 'INFO',
      details: `Pendaftaran warga ${warga.nama_lengkap} (NIK: ${warga.nik}) selesai: SSoT confirmed, cache committed, akun otentikasi diprovisi.`,
      correlationId
    });

    return {
      success: true,
      correlationId,
      message: gasResponse.message || `Data Warga ${warga.nama_lengkap} berhasil disimpan di Google Sheets SSoT`,
      data: {
        ...gasResponse.data,
        id_warga: warga.id_warga,
        nik: warga.nik,
        cacheCommitted: cacheResult.success,
        authProvisioned
      },
      authProvisioned
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Terjadi kesalahan sistem saat komunikasi dengan SSoT';

    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Warga',
      role,
      action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_FAILED,
      module: 'REGISTRASI',
      targetType: 'Warga',
      targetId: warga.id_warga || warga.nik,
      status: 'FAILED',
      severity: 'WARNING',
      details: `Exception saat commit data warga ke SSoT: ${errorMsg}`,
      correlationId
    });

    return {
      success: false,
      error: errorMsg,
      correlationId
    };
  }
}

/**
 * registerKeluargaSSoT
 * Authoritative SSoT Orchestration Gateway for Keluarga Registration
 * Enforces transaction order: Validation -> SSoT Write -> SSoT Confirmation -> Cache Commit -> Auth Provisioning -> Audit Completion
 */
export async function registerKeluargaSSoT(
  keluarga: Keluarga,
  authContext?: AuthoritativeSessionContext
): Promise<{ success: boolean; message?: string; error?: string; correlationId: string; data?: any; authProvisioned?: boolean }> {
  const correlationId = generateCorrelationId();
  const userId = authContext?.userId || 'PUBLIC_REGISTRATION';
  const role = authContext?.role || 'WARGA';

  // 1. Validation & Duplicate Check Boundary
  if (!keluarga || !keluarga.nomorKK || !keluarga.nama_kepala_keluarga) {
    return {
      success: false,
      error: 'Data Kartu Keluarga tidak lengkap. Nomor KK dan Nama Kepala Keluarga wajib diisi.',
      correlationId
    };
  }

  if (ResidentFamilyService.isDuplicateKK(keluarga.nomorKK)) {
    return {
      success: false,
      error: `Nomor KK ${keluarga.nomorKK} sudah terdaftar dalam basis data RT 07.`,
      correlationId
    };
  }

  // 2. Audit SSoT Write Attempt
  await writeAuditLog({
    userId,
    userName: authContext?.namaLengkap || 'Pendaftaran Keluarga',
    role,
    action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_ATTEMPTED,
    module: 'REGISTRASI',
    targetType: 'Keluarga',
    targetId: keluarga.id_kk || keluarga.nomorKK,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Percobaan pengiriman data Kartu Keluarga baru ke Google Sheets SSoT (No KK: ${keluarga.nomorKK}).`,
    correlationId
  });

  try {
    const payload = {
      ...keluarga,
      correlationId,
      user: userId
    };

    // 3. Dispatch to GAS Backend WebApp
    const gasResponse = await syncDataWithGAS('saveKeluarga', payload);

    // 4. Response Validation (Fail-closed on any invalid/falsy response)
    if (!gasResponse || typeof gasResponse !== 'object' || gasResponse.success !== true) {
      const errorMsg = (gasResponse && (gasResponse.message || gasResponse.error)) || 'Gagal mengirim data Kartu Keluarga ke Google Sheets SSoT';

      // Audit Failure
      await writeAuditLog({
        userId,
        userName: authContext?.namaLengkap || 'Pendaftaran Keluarga',
        role,
        action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_FAILED,
        module: 'REGISTRASI',
        targetType: 'Keluarga',
        targetId: keluarga.id_kk || keluarga.nomorKK,
        status: 'FAILED',
        severity: 'WARNING',
        details: `Gagal commit data Kartu Keluarga ke SSoT Google Sheets: ${errorMsg}`,
        correlationId
      });

      return {
        success: false,
        error: errorMsg,
        correlationId
      };
    }

    // 5. Audit SSoT Write Confirmed
    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Keluarga',
      role,
      action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_CONFIRMED,
      module: 'REGISTRASI',
      targetType: 'Keluarga',
      targetId: keluarga.id_kk || keluarga.nomorKK,
      status: 'SUCCESS',
      severity: 'INFO',
      details: `Data Kartu Keluarga an. ${keluarga.nama_kepala_keluarga} (No KK: ${keluarga.nomorKK}) terkonfirmasi tersimpan di Google Sheets SSoT.`,
      correlationId
    });

    // 6. Commit to Secondary LocalStorage Cache ONLY AFTER SSoT Confirmation
    const cacheResult = ResidentFamilyService.createKeluarga(keluarga, {
      userId,
      role
    });

    // 7. Deterministic Authentication Provisioning ONLY AFTER SSoT Confirmation
    let authProvisioned = false;
    const kkNum = keluarga.nomorKK || keluarga.no_kk;
    if (kkNum) {
      try {
        const authResult = IdentityAuthService.provisionAccountFromOfficialData(kkNum, keluarga, undefined);
        authProvisioned = authResult.success;
      } catch (authErr) {
        console.warn('Auth provisioning warning in DAL:', authErr);
      }
    }

    // 8. Audit Completion Event
    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Keluarga',
      role,
      action: AUDIT_EVENTS.KELUARGA_REGISTRATION_PERSISTED,
      module: 'REGISTRASI',
      targetType: 'Keluarga',
      targetId: keluarga.id_kk || keluarga.nomorKK,
      status: 'SUCCESS',
      severity: 'INFO',
      details: `Pendaftaran Kartu Keluarga an. ${keluarga.nama_kepala_keluarga} (No KK: ${keluarga.nomorKK}) selesai: SSoT confirmed, cache committed, akun otentikasi diprovisi.`,
      correlationId
    });

    return {
      success: true,
      correlationId,
      message: gasResponse.message || `Data Kartu Keluarga an. ${keluarga.nama_kepala_keluarga} berhasil disimpan di Google Sheets SSoT`,
      data: {
        ...gasResponse.data,
        id_kk: keluarga.id_kk,
        nomorKK: keluarga.nomorKK,
        cacheCommitted: cacheResult.success,
        authProvisioned
      },
      authProvisioned
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Terjadi kesalahan sistem saat komunikasi dengan SSoT';

    await writeAuditLog({
      userId,
      userName: authContext?.namaLengkap || 'Pendaftaran Keluarga',
      role,
      action: AUDIT_EVENTS.REGISTRATION_SSOT_WRITE_FAILED,
      module: 'REGISTRASI',
      targetType: 'Keluarga',
      targetId: keluarga.id_kk || keluarga.nomorKK,
      status: 'FAILED',
      severity: 'WARNING',
      details: `Exception saat commit data Kartu Keluarga ke SSoT: ${errorMsg}`,
      correlationId
    });

    return {
      success: false,
      error: errorMsg,
      correlationId
    };
  }
}

/**
 * verifyWargaSSoT
 * Authoritative verification handler for Pengurus/Admin role
 * Updates SSoT (Google Sheets) and syncs local cache state
 */
export async function verifyWargaSSoT(
  wargaId: string,
  status: 'TERVERIFIKASI' | 'DITOLAK',
  authContext: AuthoritativeSessionContext,
  notes?: string
): Promise<{ success: boolean; message?: string; error?: string; correlationId: string; data?: any }> {
  const correlationId = generateCorrelationId();
  validateSessionContext(authContext);

  if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(authContext.role)) {
    await writeAuditLog({
      userId: authContext.userId,
      userName: authContext.namaLengkap || authContext.userId,
      role: authContext.role,
      action: AUDIT_EVENTS.UNAUTHORIZED_ACCESS,
      module: 'USER',
      targetType: 'Warga',
      targetId: wargaId,
      status: 'FAILED',
      severity: 'WARNING',
      details: `Upaya verifikasi warga ditolak: User role ${authContext.role} tidak memiliki hak verifikasi.`,
      correlationId
    });
    return {
      success: false,
      error: 'Otoritas ditolak: Hanya Pengurus, Ketua RT, atau Admin yang berhak memverifikasi warga.',
      correlationId
    };
  }

  // Update local cache state
  const cacheResult = ResidentFamilyService.verifyWarga(wargaId, status, {
    userId: authContext.userId,
    role: authContext.role,
    namaLengkap: authContext.namaLengkap
  }, notes);

  if (!cacheResult.success) {
    return {
      success: false,
      error: cacheResult.error || 'Gagal memperbarui status verifikasi warga',
      correlationId
    };
  }

  // Sync with SSoT (GAS)
  try {
    const gasPayload = {
      wargaId,
      statusVerifikasi: status,
      verifiedBy: authContext.namaLengkap || authContext.userId,
      verifiedAt: new Date().toISOString(),
      notes: notes || '',
      correlationId
    };
    await syncDataWithGAS('verifyWarga', gasPayload);
  } catch (syncErr) {
    console.warn('SSoT sync warning during warga verification:', syncErr);
  }

  // Audit event
  await writeAuditLog({
    userId: authContext.userId,
    userName: authContext.namaLengkap || authContext.userId,
    role: authContext.role,
    action: status === 'TERVERIFIKASI' ? AUDIT_EVENTS.WARGA_VERIFIED : AUDIT_EVENTS.WARGA_REJECTED,
    module: 'USER',
    targetType: 'Warga',
    targetId: wargaId,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Warga ${cacheResult.data?.nama_lengkap} (${cacheResult.data?.nik}) status verifikasi: ${status} oleh ${authContext.namaLengkap || authContext.userId}.`,
    correlationId
  });

  return {
    success: true,
    correlationId,
    message: `Data warga berhasil diverifikasi sebagai ${status}`,
    data: cacheResult.data
  };
}

/**
 * verifyKeluargaSSoT
 * Authoritative verification handler for Pengurus/Admin role
 * Updates SSoT (Google Sheets) and syncs local cache state
 */
export async function verifyKeluargaSSoT(
  keluargaId: string,
  status: 'TERVERIFIKASI' | 'DITOLAK',
  authContext: AuthoritativeSessionContext,
  notes?: string
): Promise<{ success: boolean; message?: string; error?: string; correlationId: string; data?: any }> {
  const correlationId = generateCorrelationId();
  validateSessionContext(authContext);

  if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(authContext.role)) {
    await writeAuditLog({
      userId: authContext.userId,
      userName: authContext.namaLengkap || authContext.userId,
      role: authContext.role,
      action: AUDIT_EVENTS.UNAUTHORIZED_ACCESS,
      module: 'USER',
      targetType: 'Keluarga',
      targetId: keluargaId,
      status: 'FAILED',
      severity: 'WARNING',
      details: `Upaya verifikasi Kartu Keluarga ditolak: User role ${authContext.role} tidak memiliki hak verifikasi.`,
      correlationId
    });
    return {
      success: false,
      error: 'Otoritas ditolak: Hanya Pengurus, Ketua RT, atau Admin yang berhak memverifikasi Kartu Keluarga.',
      correlationId
    };
  }

  // Update local cache state
  const cacheResult = ResidentFamilyService.verifyKeluarga(keluargaId, status, {
    userId: authContext.userId,
    role: authContext.role,
    namaLengkap: authContext.namaLengkap
  }, notes);

  if (!cacheResult.success) {
    return {
      success: false,
      error: cacheResult.error || 'Gagal memperbarui status verifikasi Kartu Keluarga',
      correlationId
    };
  }

  // Sync with SSoT (GAS)
  try {
    const gasPayload = {
      keluargaId,
      statusVerifikasi: status,
      verifiedBy: authContext.namaLengkap || authContext.userId,
      verifiedAt: new Date().toISOString(),
      notes: notes || '',
      correlationId
    };
    await syncDataWithGAS('verifyKeluarga', gasPayload);
  } catch (syncErr) {
    console.warn('SSoT sync warning during keluarga verification:', syncErr);
  }

  // Audit event
  await writeAuditLog({
    userId: authContext.userId,
    userName: authContext.namaLengkap || authContext.userId,
    role: authContext.role,
    action: status === 'TERVERIFIKASI' ? AUDIT_EVENTS.KELUARGA_VERIFIED : AUDIT_EVENTS.KELUARGA_REJECTED,
    module: 'USER',
    targetType: 'Keluarga',
    targetId: keluargaId,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Kartu Keluarga an. ${cacheResult.data?.nama_kepala_keluarga} (KK: ${cacheResult.data?.no_kk}) status verifikasi: ${status} oleh ${authContext.namaLengkap || authContext.userId}.`,
    correlationId
  });

  return {
    success: true,
    correlationId,
    message: `Data Kartu Keluarga berhasil diverifikasi sebagai ${status}`,
    data: cacheResult.data
  };
}

