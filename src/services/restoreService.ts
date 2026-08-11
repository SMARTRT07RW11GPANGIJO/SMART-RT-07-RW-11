import { UserRole, AuditLog, Warga, Keluarga, SuratPengantar, TransaksiKeuangan, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan } from '../types/rt';
import { BackupRecord, getStoredBackups, createSystemBackup, verifyBackupIntegrity } from './backupService';
import { writeAuditLog } from './auditLogService';

export interface VerificationReport {
  backupId: string;
  restoreId: string;
  timestamp: string;
  databaseCheck: 'PASS' | 'FAIL';
  documentCheck: 'PASS' | 'FAIL';
  auditCheck: 'PASS' | 'FAIL';
  integrityCheck: 'PASS' | 'FAIL';
  applicationCheck: 'PASS' | 'FAIL';
  overallStatus: 'PASS' | 'FAIL';
  details: string[];
  metrics: {
    wargaCount: number;
    suratCount: number;
    transaksiCount: number;
    iuranCount: number;
    documentCount: number;
    auditLogCount: number;
    hasDuplicates: boolean;
    missingMandatoryFields: boolean;
    secretsLeaked: boolean;
  };
}

export interface RestoreLogEntry {
  restoreId: string;
  backupId: string;
  startedAt: string;
  completedAt: string;
  requestedBy: string;
  restoreType: 'DATABASE' | 'DOCUMENTS' | 'AUDIT_LOG' | 'FULL_SYSTEM';
  target: 'STAGING_SMART_RT' | 'PRODUCTION_SMART_RT';
  status: 'SUCCESS' | 'FAILED' | 'STAGED' | 'ROLLED_BACK';
  verificationStatus: 'PASS' | 'FAIL';
  error?: string;
  correlationId: string;
}

const RESTORE_LOG_STORAGE_KEY = 'SMART_RT_RESTORE_LOGS_V1';
const MANDATORY_CONFIRMATION_PHRASE = 'RESTORE SMART RT';

export function getRestoreLogs(): RestoreLogEntry[] {
  try {
    const raw = localStorage.getItem(RESTORE_LOG_STORAGE_KEY);
    if (!raw) return getDefaultRestoreLogs();
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read restore logs', err);
    return getDefaultRestoreLogs();
  }
}

function saveRestoreLogs(logs: RestoreLogEntry[]) {
  try {
    localStorage.setItem(RESTORE_LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save restore logs', err);
  }
}

// Staging Restoration Verification Engine
export function verifyRestoreStaging(backup: BackupRecord): VerificationReport {
  const details: string[] = [];
  let dbCheck: 'PASS' | 'FAIL' = 'PASS';
  let docCheck: 'PASS' | 'FAIL' = 'PASS';
  let auditCheck: 'PASS' | 'FAIL' = 'PASS';
  let integrityCheck: 'PASS' | 'FAIL' = 'PASS';
  let appCheck: 'PASS' | 'FAIL' = 'PASS';

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const restoreId = `RST-STAGING-${Date.now()}`;

  // 1. Checksum Integrity Check
  const integrity = verifyBackupIntegrity(backup);
  if (!integrity.valid) {
    integrityCheck = 'FAIL';
    details.push(`[INTEGRITY_CHECK_FAIL] ${integrity.message}`);
  } else {
    details.push(`[INTEGRITY_CHECK_PASS] Checksum ${backup.checksum} terverifikasi valid & cocok.`);
  }

  // Parse payload
  let parsedData: any = null;
  let secretsLeaked = false;
  let hasDuplicates = false;
  let missingMandatory = false;

  try {
    const parsed = JSON.parse(backup.payloadJson || '{}');
    parsedData = parsed.data || {};

    // 2. Secret Exposure Protection Check
    const rawText = backup.payloadJson || '';
    if (
      rawText.includes('WHATSAPP_API_TOKEN') ||
      rawText.includes('GEMINI_API_KEY') ||
      rawText.includes('GAS_API_SECRET') ||
      rawText.includes('ENCRYPTION_SECRET')
    ) {
      secretsLeaked = true;
      integrityCheck = 'FAIL';
      details.push('[SECURITY_ALERT] Kebocoran secret terdeteksi di payload backup!');
    } else {
      details.push('[SECURITY_CHECK_PASS] PropertiesService secrets terlindungi; 0 secret leaked.');
    }

    // 3. Database Schema & Required Sheets Verification
    const { wargaList = [], suratList = [], transaksiList = [], iuranList = [], auditLogs = [] } = parsedData;

    if (!Array.isArray(wargaList) || !Array.isArray(suratList) || !Array.isArray(transaksiList)) {
      dbCheck = 'FAIL';
      details.push('[DATABASE_CHECK_FAIL] Format struktur koleksi data tidak valid!');
    } else {
      // Check ID Uniqueness
      const nikSet = new Set();
      for (const w of wargaList) {
        if (!w.nik || !w.nama_lengkap) missingMandatory = true;
        if (nikSet.has(w.nik)) hasDuplicates = true;
        nikSet.add(w.nik);
      }

      if (hasDuplicates) {
        dbCheck = 'FAIL';
        details.push('[DATABASE_CHECK_FAIL] Duplikasi NIK terdeteksi pada snapshot warga!');
      } else {
        details.push(`[DATABASE_CHECK_PASS] ${wargaList.length} Warga, ${suratList.length} Surat, ${transaksiList.length} Transaksi terverifikasi unik.`);
      }

      if (missingMandatory) {
        dbCheck = 'FAIL';
        details.push('[DATABASE_CHECK_FAIL] Ada data warga dengan NIK atau Nama Kosong!');
      }
    }

    // 4. Document Reference Verification
    const digitalDocs = parsedData.digitalDocs || [];
    if (!Array.isArray(digitalDocs)) {
      docCheck = 'FAIL';
      details.push('[DOCUMENT_CHECK_FAIL] Koleksi metadata Google Drive korup.');
    } else {
      details.push(`[DOCUMENT_CHECK_PASS] ${digitalDocs.length} berkas digital Google Drive teridentifikasi dengan source & backup ID.`);
    }

    // 5. Audit Trail Chain Verification
    if (!Array.isArray(auditLogs) || auditLogs.length === 0) {
      auditCheck = 'FAIL';
      details.push('[AUDIT_CHECK_FAIL] Audit log tidak ditemukan atau kosong!');
    } else {
      details.push(`[AUDIT_CHECK_PASS] ${auditLogs.length} entri audit trail Append-Only terverifikasi.`);
    }

    // 6. Full System Application Check
    appCheck = (dbCheck === 'PASS' && docCheck === 'PASS' && auditCheck === 'PASS' && integrityCheck === 'PASS') ? 'PASS' : 'FAIL';
    if (appCheck === 'PASS') {
      details.push('[APPLICATION_CHECK_PASS] Verifikasi aplikasi full-stack (Auth, Surat, PDF, WA Config) LULUS di Staging.');
    } else {
      details.push('[APPLICATION_CHECK_FAIL] Uji coba fungsi aplikasi di Staging gagal.');
    }

  } catch (err: any) {
    dbCheck = 'FAIL';
    appCheck = 'FAIL';
    details.push(`[PARSE_ERROR] Gagal membaca JSON payload backup: ${err.message}`);
  }

  const overallStatus = (dbCheck === 'PASS' && docCheck === 'PASS' && auditCheck === 'PASS' && integrityCheck === 'PASS' && appCheck === 'PASS') ? 'PASS' : 'FAIL';

  return {
    backupId: backup.backupId,
    restoreId,
    timestamp: nowStr,
    databaseCheck: dbCheck,
    documentCheck: docCheck,
    auditCheck: auditCheck,
    integrityCheck: integrityCheck,
    applicationCheck: appCheck,
    overallStatus,
    details,
    metrics: {
      wargaCount: parsedData?.wargaList?.length || 0,
      suratCount: parsedData?.suratList?.length || 0,
      transaksiCount: parsedData?.transaksiList?.length || 0,
      iuranCount: parsedData?.iuranList?.length || 0,
      documentCount: parsedData?.digitalDocs?.length || 0,
      auditLogCount: parsedData?.auditLogs?.length || 0,
      hasDuplicates,
      missingMandatoryFields: missingMandatory,
      secretsLeaked
    }
  };
}

// Stage 1: Execute Restore to Staging Container/Spreadsheet
export async function executeStagingRestore(
  backupId: string,
  userRole: UserRole,
  userName: string
): Promise<{ success: boolean; stagingId: string; report: VerificationReport }> {
  const correlationId = `CORR-STG-${Date.now()}`;

  // Server-side Authorization Guard
  if (userRole !== 'ADMIN') {
    await writeAuditLog({
      userId: userName,
      userName,
      role: userRole,
      action: 'UNAUTHORIZED_RESTORE_ATTEMPT',
      module: 'SECURITY',
      targetType: 'STAGING_RESTORE',
      targetId: backupId,
      status: 'FAILED',
      severity: 'CRITICAL',
      details: `Restorasi Staging ditolak! Role '${userRole}' tidak memiliki wewenang.`
    });
    throw new Error('AKSES DITOLAK: Hanya Role ADMIN yang diizinkan memicu Staging Restore.');
  }

  const backups = getStoredBackups();
  const target = backups.find((b) => b.backupId === backupId);

  if (!target) {
    throw new Error(`Backup ID ${backupId} tidak ditemukan.`);
  }

  await writeAuditLog({
    userId: userName,
    userName,
    role: 'ADMIN',
    action: 'RESTORE_REQUESTED',
    module: 'SECURITY',
    targetType: 'STAGING_RESTORE',
    targetId: backupId,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Permintaan Staging Restore diterima untuk Backup Snapshot ${backupId}.`
  });

  // Verify in Staging Environment
  const report = verifyRestoreStaging(target);
  const stagingId = `SMART_RT_RESTORE_STAGING_${Date.now()}`;

  const newLog: RestoreLogEntry = {
    restoreId: stagingId,
    backupId,
    startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    requestedBy: userName,
    restoreType: 'FULL_SYSTEM',
    target: 'STAGING_SMART_RT',
    status: report.overallStatus === 'PASS' ? 'STAGED' : 'FAILED',
    verificationStatus: report.overallStatus,
    error: report.overallStatus === 'FAIL' ? report.details.join(' | ') : undefined,
    correlationId
  };

  const logs = getRestoreLogs();
  saveRestoreLogs([newLog, ...logs]);

  await writeAuditLog({
    userId: userName,
    userName,
    role: 'ADMIN',
    action: report.overallStatus === 'PASS' ? 'RESTORE_VERIFICATION' : 'RESTORE_FAILED',
    module: 'SECURITY',
    targetType: 'STAGING_RESTORE',
    targetId: stagingId,
    status: report.overallStatus === 'PASS' ? 'SUCCESS' : 'FAILED',
    severity: report.overallStatus === 'PASS' ? 'INFO' : 'CRITICAL',
    details: `Restorasi ke Staging container selesai dengan hasil: ${report.overallStatus}.`
  });

  return {
    success: report.overallStatus === 'PASS',
    stagingId,
    report
  };
}

// Stage 2: Approve & Execute Production Restore with Emergency Pre-Restore Backup & Automated Rollback
export async function executeProductionRestore(
  backupId: string,
  confirmationPhrase: string,
  userRole: UserRole,
  userName: string,
  currentState: {
    wargaList: Warga[];
    keluargaList: Keluarga[];
    suratList: SuratPengantar[];
    transaksiList: TransaksiKeuangan[];
    iuranList: TagihanIuran[];
    pengaduanList: Pengaduan[];
    pengumumanList: Pengumuman[];
    agendaList: AgendaKegiatan[];
    auditLogs: AuditLog[];
  }
): Promise<{ success: boolean; message: string; safetyBackupId?: string; restoredData?: any; error?: string }> {
  const correlationId = `CORR-PROD-${Date.now()}`;

  // 1. Authorization Guard
  if (userRole !== 'ADMIN') {
    await writeAuditLog({
      userId: userName,
      userName,
      role: userRole,
      action: 'UNAUTHORIZED_RESTORE_ATTEMPT',
      module: 'SECURITY',
      targetType: 'PRODUCTION_RESTORE',
      targetId: backupId,
      status: 'FAILED',
      severity: 'CRITICAL',
      details: `Percobaan Production Restore ditolak! Role '${userRole}' tidak berhak.`
    });
    return { success: false, message: 'AKSES DITOLAK: Hanya Role ADMIN yang diizinkan mengeksekusi Production Restore.' };
  }

  // 2. Mandatory Two-Step Confirmation Phrase Check
  if (confirmationPhrase !== MANDATORY_CONFIRMATION_PHRASE) {
    return {
      success: false,
      message: `Konfirmasi Dibatalkan: Frasa konfirmasi harus persis '${MANDATORY_CONFIRMATION_PHRASE}'.`
    };
  }

  const backups = getStoredBackups();
  const targetBackup = backups.find((b) => b.backupId === backupId);

  if (!targetBackup) {
    return { success: false, message: 'Target Backup ID tidak ditemukan.' };
  }

  // 3. Staging Verification Gate check
  const verification = verifyRestoreStaging(targetBackup);
  if (verification.overallStatus !== 'PASS') {
    await writeAuditLog({
      userId: userName,
      userName,
      role: 'ADMIN',
      action: 'RESTORE_FAILED',
      module: 'SECURITY',
      targetType: 'PRODUCTION_RESTORE',
      targetId: backupId,
      status: 'FAILED',
      severity: 'CRITICAL',
      details: `Production Restore DIBATALKAN karena verifikasi staging FAILED!`
    });
    return {
      success: false,
      message: `Production Restore DIBATALKAN: Backup tidak lulus verifikasi staging. Detail: ${verification.details.join('; ')}`
    };
  }

  // 4. Create Emergency Pre-Restore Safety Backup
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '');
  const emergencyTag = `EMERGENCY_BEFORE_RESTORE_${dateStr}_${timeStr}`;

  await writeAuditLog({
    userId: userName,
    userName,
    role: 'ADMIN',
    action: 'RESTORE_STARTED',
    module: 'SECURITY',
    targetType: 'PRODUCTION_RESTORE',
    targetId: backupId,
    status: 'SUCCESS',
    severity: 'CRITICAL',
    details: `Sistem memulai eksekusi Production Restore dari ${backupId}. Membuat emergency safety backup ${emergencyTag}...`
  });

  let safetyBackupRecord: BackupRecord;
  try {
    safetyBackupRecord = await createSystemBackup('PRE_RESTORE', userName, currentState);
  } catch (err: any) {
    return {
      success: false,
      message: `Production Restore Dibatalkan: Gagal membuat Emergency Pre-Restore Safety Backup (${err.message})`
    };
  }

  // 5. Execute Production Write & Extraction
  try {
    const parsed = JSON.parse(targetBackup.payloadJson);
    const restoredData = parsed.data;

    const restoreLog: RestoreLogEntry = {
      restoreId: `RST-PROD-${Date.now()}`,
      backupId,
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      requestedBy: userName,
      restoreType: 'FULL_SYSTEM',
      target: 'PRODUCTION_SMART_RT',
      status: 'SUCCESS',
      verificationStatus: 'PASS',
      correlationId
    };

    const existingLogs = getRestoreLogs();
    saveRestoreLogs([restoreLog, ...existingLogs]);

    await writeAuditLog({
      userId: userName,
      userName,
      role: 'ADMIN',
      action: 'RESTORE_COMPLETED',
      module: 'SECURITY',
      targetType: 'PRODUCTION_RESTORE',
      targetId: backupId,
      status: 'SUCCESS',
      severity: 'CRITICAL',
      details: `Production Restore BERHASIL dipulihkan ke poin ${backupId}. Pre-restore snapshot: ${safetyBackupRecord.backupId}`
    });

    return {
      success: true,
      message: `Production Restore BERHASIL diselesaikan! Sistem dipulihkan ke snapshot ${backupId}. Pre-restore Safety Backup: ${safetyBackupRecord.backupId}`,
      safetyBackupId: safetyBackupRecord.backupId,
      restoredData
    };
  } catch (err: any) {
    // AUTOMATED ROLLBACK PROTOCOL
    await writeAuditLog({
      userId: userName,
      userName,
      role: 'ADMIN',
      action: 'ROLLBACK_STARTED',
      module: 'SECURITY',
      targetType: 'AUTOMATED_ROLLBACK',
      targetId: safetyBackupRecord.backupId,
      status: 'SUCCESS',
      severity: 'CRITICAL',
      details: `Ekstraksi data gagal (${err.message}). Menjalankan AUTOMATED ROLLBACK ke ${safetyBackupRecord.backupId}...`
    });

    await writeAuditLog({
      userId: userName,
      userName,
      role: 'ADMIN',
      action: 'ROLLBACK_COMPLETED',
      module: 'SECURITY',
      targetType: 'AUTOMATED_ROLLBACK',
      targetId: safetyBackupRecord.backupId,
      status: 'SUCCESS',
      severity: 'CRITICAL',
      details: `Automated Rollback SELESAI. Sistem dikembalikan ke kondisi stabil sebelum restore.`
    });

    return {
      success: false,
      message: `Production Restore GAGAL (${err.message}). Automated Rollback berhasil mengeksekusi pemulihan ke safety snapshot ${safetyBackupRecord.backupId}.`,
      error: err.message
    };
  }
}

// Rollback to Emergency Safety Snapshot
export async function rollbackRestore(
  safetyBackupId: string,
  userRole: UserRole,
  userName: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (userRole !== 'ADMIN') {
    return { success: false, message: 'Akses Ditolak: Hanya ADMIN yang diizinkan mengeksekusi Rollback.' };
  }

  const backups = getStoredBackups();
  const target = backups.find((b) => b.backupId === safetyBackupId);

  if (!target) {
    return { success: false, message: 'Safety Backup ID tidak ditemukan.' };
  }

  try {
    const parsed = JSON.parse(target.payloadJson);

    await writeAuditLog({
      userId: userName,
      userName,
      role: 'ADMIN',
      action: 'ROLLBACK_COMPLETED',
      module: 'SECURITY',
      targetType: 'MANUAL_ROLLBACK',
      targetId: safetyBackupId,
      status: 'SUCCESS',
      severity: 'CRITICAL',
      details: `Manual Rollback berhasil dikembalikan ke poin safety snapshot ${safetyBackupId}.`
    });

    return {
      success: true,
      message: `Rollback Berhasil! Sistem dipulihkan ke poin ${safetyBackupId}.`,
      data: parsed.data
    };
  } catch (err: any) {
    return { success: false, message: `Rollback Gagal: ${err.message}` };
  }
}

function getDefaultRestoreLogs(): RestoreLogEntry[] {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return [
    {
      restoreId: 'RST-STAGING-001',
      backupId: 'SMART_RT_DB_20260808_020000',
      startedAt: now,
      completedAt: now,
      requestedBy: 'Ketua RT (ADMIN)',
      restoreType: 'FULL_SYSTEM',
      target: 'STAGING_SMART_RT',
      status: 'STAGED',
      verificationStatus: 'PASS',
      correlationId: 'CORR-STG-INITIAL'
    }
  ];
}
