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
