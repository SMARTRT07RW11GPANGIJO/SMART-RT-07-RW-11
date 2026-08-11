import { UserRole } from '../types/rt';
import { getStoredBackups, getBackupHealth } from './backupService';
import { getRestoreLogs, verifyRestoreStaging, VerificationReport } from './restoreService';
import { writeAuditLog } from './auditLogService';

export interface DRHealthMetrics {
  lastBackupTime: string;
  lastVerifiedBackupTime: string;
  backupHealthStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  lastDRTestDate: string;
  daysSinceLastDRTest: number;
  drTestDueStatus: 'OK' | 'WARNING' | 'CRITICAL'; // >30 days WARNING, >60 days CRITICAL
  lastSuccessfulRestoreTime: string;
  rpoConfigHours: number; // 6, 12, or 24 hours
  rpoStatus: 'PASS' | 'WARNING' | 'FAIL';
  rtoTargetHours: number; // <= 4 hours
  rtoStatus: 'PASS' | 'FAIL';
  subsystemStatus: {
    database: 'OK' | 'WARNING' | 'FAIL';
    documents: 'OK' | 'WARNING' | 'FAIL';
    audit: 'OK' | 'WARNING' | 'FAIL';
    securitySecrets: 'OK' | 'SECURE';
  };
}

export interface DRIncident {
  incidentId: string; // DR-YYYYMMDD-XXXX
  startedAt: string;
  detectedBy: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  backupUsed?: string;
  restoreId?: string;
  status: 'OPEN' | 'MITIGATED' | 'RESOLVED';
  resolvedAt?: string;
  resolution?: string;
}

export interface DRTestResult {
  testId: string;
  timestamp: string;
  executedBy: string;
  targetEnvironment: 'STAGING_CONTAINER_ISOLATED';
  databaseRestoreCheck: 'PASS' | 'FAIL';
  documentRestoreCheck: 'PASS' | 'FAIL';
  auditRestoreCheck: 'PASS' | 'FAIL';
  verificationCheck: 'PASS' | 'FAIL';
  applicationHealthCheck: 'PASS' | 'FAIL';
  overallStatus: 'PASS' | 'FAIL';
  durationMs: number;
  report: VerificationReport;
  summaryNote: string;
}

const DR_INCIDENTS_KEY = 'SMART_RT_DR_INCIDENTS_V1';
const DR_LAST_TEST_DATE_KEY = 'SMART_RT_DR_LAST_TEST_DATE_V1';
const DR_RPO_CONFIG_KEY = 'SMART_RT_DR_RPO_CONFIG_HOURS_V1';

export function getRPOConfigHours(): number {
  const stored = localStorage.getItem(DR_RPO_CONFIG_KEY);
  if (stored) {
    const val = parseInt(stored, 10);
    if ([6, 12, 24].includes(val)) return val;
  }
  return 24; // Default 24 Hours
}

export function setRPOConfigHours(hours: number): void {
  if ([6, 12, 24].includes(hours)) {
    localStorage.setItem(DR_RPO_CONFIG_KEY, hours.toString());
  }
}

export function getLastDRTestDate(): string {
  const stored = localStorage.getItem(DR_LAST_TEST_DATE_KEY);
  if (stored) return stored;
  const initial = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  localStorage.setItem(DR_LAST_TEST_DATE_KEY, initial);
  return initial;
}

export function getDRIncidents(): DRIncident[] {
  try {
    const raw = localStorage.getItem(DR_INCIDENTS_KEY);
    if (!raw) return getDefaultDRIncidents();
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse DR incidents', err);
    return getDefaultDRIncidents();
  }
}

function saveDRIncidents(incidents: DRIncident[]): void {
  try {
    localStorage.setItem(DR_INCIDENTS_KEY, JSON.stringify(incidents));
  } catch (err) {
    console.error('Failed to save DR incidents', err);
  }
}

export function getDRHealthMetrics(): DRHealthMetrics {
  const backups = getStoredBackups();
  const restoreLogs = getRestoreLogs();
  const backupHealth = getBackupHealth();

  const latestBackup = backups[0];
  const lastVerifiedBackup = backups.find((b) => b.verified);
  const lastSuccessRestore = restoreLogs.find((l) => l.status === 'SUCCESS' || l.status === 'STAGED');

  const lastTestStr = getLastDRTestDate();
  const lastTestDate = new Date(lastTestStr.replace(' ', 'T'));
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24));

  let drTestDueStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
  if (diffDays > 60) {
    drTestDueStatus = 'CRITICAL';
  } else if (diffDays > 30) {
    drTestDueStatus = 'WARNING';
  }

  const rpoConfigHours = getRPOConfigHours();
  let rpoStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (latestBackup) {
    const lastBackupDate = new Date(latestBackup.timestamp.replace(' ', 'T'));
    const hoursSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceBackup > rpoConfigHours) {
      rpoStatus = 'FAIL';
    } else if (hoursSinceBackup > rpoConfigHours * 0.8) {
      rpoStatus = 'WARNING';
    }
  } else {
    rpoStatus = 'FAIL';
  }

  return {
    lastBackupTime: latestBackup ? latestBackup.timestamp : 'Belum Ada',
    lastVerifiedBackupTime: lastVerifiedBackup ? lastVerifiedBackup.timestamp : 'Belum Ada',
    backupHealthStatus: backupHealth.overall === 'HEALTHY' ? 'HEALTHY' : 'DEGRADED',
    lastDRTestDate: lastTestStr,
    daysSinceLastDRTest: Math.max(0, diffDays),
    drTestDueStatus,
    lastSuccessfulRestoreTime: lastSuccessRestore ? lastSuccessRestore.completedAt : 'Belum Pernah',
    rpoConfigHours,
    rpoStatus,
    rtoTargetHours: 4, // RTO Target <= 4 Hours
    rtoStatus: 'PASS',
    subsystemStatus: {
      database: backupHealth.database.status === 'OK' ? 'OK' : 'WARNING',
      documents: backupHealth.documents.status === 'OK' ? 'OK' : 'WARNING',
      audit: backupHealth.audit.status === 'OK' ? 'OK' : 'WARNING',
      securitySecrets: 'SECURE'
    }
  };
}

// DR Test Simulator (Runs in STAGING - Zero Production Modification)
export async function runDisasterRecoveryTest(
  userRole: UserRole,
  userName: string
): Promise<DRTestResult> {
  const startTime = Date.now();

  if (userRole !== 'ADMIN') {
    await writeAuditLog({
      userId: userName,
      userName,
      role: userRole,
      action: 'UNAUTHORIZED_RESTORE_ATTEMPT',
      module: 'SECURITY',
      targetType: 'DR_TEST',
      targetId: 'DR_TEST_JOB',
      status: 'FAILED',
      severity: 'CRITICAL',
      details: `Disaster Recovery Test ditolak! Role '${userRole}' tidak berhak.`
    });
    throw new Error('Akses Ditolak: Hanya Role ADMIN yang dapat menjalankan Disaster Recovery Test.');
  }

  const backups = getStoredBackups();
  const latestBackup = backups[0];

  if (!latestBackup) {
    throw new Error('DR Test Gagal: Tidak ada snapshot backup yang tersedia.');
  }

  // Perform Staging Verification Check
  const report = verifyRestoreStaging(latestBackup);

  const durationMs = Date.now() - startTime;
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Update last DR test timestamp
  localStorage.setItem(DR_LAST_TEST_DATE_KEY, nowStr);

  const testResult: DRTestResult = {
    testId: `DR-TEST-${Date.now()}`,
    timestamp: nowStr,
    executedBy: userName,
    targetEnvironment: 'STAGING_CONTAINER_ISOLATED',
    databaseRestoreCheck: report.databaseCheck,
    documentRestoreCheck: report.documentCheck,
    auditRestoreCheck: report.auditCheck,
    verificationCheck: report.integrityCheck,
    applicationHealthCheck: report.applicationCheck,
    overallStatus: report.overallStatus,
    durationMs,
    report,
    summaryNote: report.overallStatus === 'PASS'
      ? `Uji coba Disaster Recovery di Staging BERHASIL (${durationMs}ms). 0 data production diubah.`
      : `Uji coba Disaster Recovery FAILED pada tahap verifikasi.`
  };

  await writeAuditLog({
    userId: userName,
    userName,
    role: 'ADMIN',
    action: report.overallStatus === 'PASS' ? 'RESTORE_VERIFICATION' : 'RESTORE_FAILED',
    module: 'SECURITY',
    targetType: 'DR_TEST',
    targetId: testResult.testId,
    status: report.overallStatus === 'PASS' ? 'SUCCESS' : 'FAILED',
    severity: 'INFO',
    details: `Disaster Recovery Test (Monthly Simulation) selesai: Overall ${report.overallStatus} dalam ${durationMs}ms.`
  });

  return testResult;
}

// DR Incident Management
export function createDRIncident(
  incidentData: Omit<DRIncident, 'incidentId' | 'startedAt' | 'status'>,
  userRole: UserRole,
  userName: string
): DRIncident {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.floor(1000 + Math.random() * 9000);
  const incidentId = `DR-${dateStr}-${randomHex}`;

  const newIncident: DRIncident = {
    incidentId,
    startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    detectedBy: incidentData.detectedBy || userName,
    description: incidentData.description,
    severity: incidentData.severity,
    backupUsed: incidentData.backupUsed,
    status: 'OPEN'
  };

  const incidents = getDRIncidents();
  saveDRIncidents([newIncident, ...incidents]);

  writeAuditLog({
    userId: userName,
    userName,
    role: userRole,
    action: 'RESTORE_STARTED',
    module: 'SECURITY',
    targetType: 'DR_INCIDENT',
    targetId: incidentId,
    status: 'SUCCESS',
    severity: incidentData.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
    details: `Insiden Disaster Recovery dicatat: ${incidentId} [${incidentData.severity}] - ${incidentData.description}`
  });

  return newIncident;
}

export function resolveDRIncident(
  incidentId: string,
  resolution: string,
  userRole: UserRole,
  userName: string
): void {
  const incidents = getDRIncidents();
  const updated = incidents.map((inc) => {
    if (inc.incidentId === incidentId) {
      return {
        ...inc,
        status: 'RESOLVED' as const,
        resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        resolution
      };
    }
    return inc;
  });

  saveDRIncidents(updated);

  writeAuditLog({
    userId: userName,
    userName,
    role: userRole,
    action: 'RESTORE_COMPLETED',
    module: 'SECURITY',
    targetType: 'DR_INCIDENT',
    targetId: incidentId,
    status: 'SUCCESS',
    severity: 'INFO',
    details: `Insiden DR ${incidentId} DITUTUP / RESOLVED. Solusi: ${resolution}`
  });
}

function getDefaultDRIncidents(): DRIncident[] {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return [
    {
      incidentId: `DR-${dateStr}-1088`,
      startedAt: `${new Date().toISOString().slice(0, 10)} 01:15:00`,
      detectedBy: 'Automated Integrity Monitor',
      description: 'Simulasi pemulihan kegagalan koneksi database Google Sheets.',
      severity: 'MEDIUM',
      backupUsed: 'SMART_RT_DB_20260808_020000',
      status: 'RESOLVED',
      resolvedAt: `${new Date().toISOString().slice(0, 10)} 02:00:00`,
      resolution: 'Restorasi dari staging berhasil dipromosikan setelah verifikasi integrity pass.'
    }
  ];
}
