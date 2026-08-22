// SMART RT 07 RW 11 GPA NGIJO - PRODUCTION OPERATIONS & GOVERNANCE v1.0
// Comprehensive Operational Models, Health States, Incident Lifecycle, Release & DR Governance

export type OperationalHealthStatus = 
  | 'HEALTHY' 
  | 'DEGRADED' 
  | 'WARNING' 
  | 'FAILED' 
  | 'OFFLINE' 
  | 'RECOVERING' 
  | 'UNKNOWN';

export type OperationalSeverity = 
  | 'SEV-1 CRITICAL' 
  | 'SEV-2 HIGH' 
  | 'SEV-3 MEDIUM' 
  | 'SEV-4 LOW';

export type IncidentLifecycleStatus = 
  | 'DETECTED' 
  | 'TRIAGED' 
  | 'ACKNOWLEDGED' 
  | 'MITIGATING' 
  | 'RESOLVED' 
  | 'CLOSED';

export type ReleaseLifecycleState = 
  | 'DEVELOPMENT' 
  | 'TEST' 
  | 'ACCEPTANCE' 
  | 'PRE_PRODUCTION' 
  | 'PRODUCTION' 
  | 'LOCKED' 
  | 'ROLLED_BACK';

export type OperationalDomain = 
  | 'APPLICATION'
  | 'API'
  | 'AUTH-KK'
  | 'DATA_ACCESS'
  | 'WHATSAPP'
  | 'AI_SERVICE'
  | 'EXTERNAL_SERVICES'
  | 'AUDIT_PIPELINE'
  | 'BACKUP_SUBSYSTEM'
  | 'RESTORE_SUBSYSTEM'
  | 'QUEUE_SYSTEM'
  | 'FEATURE_FLAGS'
  | 'SECURITY_OPERATIONS'
  | 'PERFORMANCE_SLO';

export interface OperationalHealthItem {
  serviceId: OperationalDomain;
  serviceName: string;
  status: OperationalHealthStatus;
  severity: OperationalSeverity;
  latencyMs: number;
  failureCount: number;
  lastSuccessfulCheck: string;
  checkedAt: string;
  sanitizedDiagnostic: string;
  recoveryState: 'STABLE' | 'DEGRADED' | 'RECOVERING' | 'CIRCUIT_OPEN';
}

export interface OperationalHealthSnapshot {
  snapshotId: string;
  timestamp: string;
  overallStatus: OperationalHealthStatus;
  healthScore: number; // 0 - 100
  items: OperationalHealthItem[];
  activeIncidentCount: number;
  securityEventCount: number;
}

export interface OperationalIncident {
  incidentId: string; // INC-YYYYMMDD-XXXX
  severity: OperationalSeverity;
  status: IncidentLifecycleStatus;
  service: OperationalDomain;
  correlationId: string;
  detectedAt: string;
  updatedAt: string;
  sanitizedDescription: string;
  assignedActor: string;
  mitigation?: string;
  resolution?: string;
  closedAt?: string;
  auditTrailReference: string[];
}

export interface OperationalMetric {
  metricId: string;
  name: string;
  category: 'LATENCY' | 'THROUGHPUT' | 'ERROR_RATE' | 'CAPACITY' | 'DURATION';
  value: number;
  unit: 'ms' | 'rpm' | '%' | 'MB' | 's';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  thresholdWarning: number;
  thresholdCritical: number;
}

export interface OperationalRelease {
  releaseId: string;
  changeRequestId: string;
  version: string;
  moduleName: string;
  status: ReleaseLifecycleState;
  createdAt: string;
  promotedAt?: string;
  promotedBy?: string;
  rollbackStatus: 'NONE' | 'READY' | 'EXECUTED';
  auditReference: string;
  regressionTestSummary?: string;
}

export interface OperationalBackupVerification {
  verificationId: string;
  backupId: string;
  timestamp: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  completeness: 'COMPLETE' | 'PARTIAL' | 'CORRUPTED';
  checksumVerified: boolean;
  checksumAlgorithm: 'SHA-256';
  retentionDaysValid: boolean;
  sizeBytes: number;
  sanitizedReport: string;
  isolatedSandboxVerified: boolean;
}

export interface OperationalRestoreVerification {
  restoreTestId: string;
  backupIdUsed: string;
  timestamp: string;
  status: 'RESTORE_VERIFIED' | 'RESTORE_FAILED';
  targetEnvironment: 'SANDBOX_ISOLATED_IN_MEMORY';
  schemaIntegrityCheck: 'PASS' | 'FAIL';
  recordIntegrityCheck: 'PASS' | 'FAIL';
  referentialIntegrityCheck: 'PASS' | 'FAIL';
  auditIntegrityCheck: 'PASS' | 'FAIL';
  authCompatibilityCheck: 'PASS' | 'FAIL';
  durationMs: number;
  sanitizedSummary: string;
}

export interface OperationalDRDrill {
  drillId: string;
  startedAt: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  targetEnvironment: 'ISOLATED_DR_SANDBOX';
  rpoHoursTarget: number;
  rpoHoursActual: number;
  rtoMinutesTarget: number;
  rtoMinutesActual: number;
  backupReady: boolean;
  restoreReady: boolean;
  appRecoveryReady: boolean;
  authRecoveryReady: boolean;
  auditRecoveryReady: boolean;
  externalRecoveryReady: boolean;
  summaryNote: string;
  executedBy: string;
}

export interface OperationalFeatureFlagState {
  flagKey: string;
  description: string;
  enabled: boolean;
  category: 'OPERATIONS' | 'SECURITY' | 'EXTERNAL' | 'SYSTEM';
  isBlockedPermanent?: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface OperationalSecurityEvent {
  eventId: string;
  timestamp: string;
  eventType: 
    | 'AUTH_FAILURE'
    | 'AUTHORIZATION_DENIED'
    | 'IDOR_ATTEMPT'
    | 'ROLE_ESCALATION_ATTEMPT'
    | 'WEBHOOK_REJECTED'
    | 'WEBHOOK_REPLAY'
    | 'RATE_LIMIT_EXCEEDED'
    | 'PROMPT_INJECTION_DETECTED'
    | 'PII_SANITIZATION_BLOCK'
    | 'SECRET_EXPOSURE_ATTEMPT'
    | 'EXTERNAL_SERVICE_FAILURE'
    | 'SUSPICIOUS_OPERATIONAL_ACCESS';
  severity: OperationalSeverity;
  service: string;
  correlationId: string;
  sanitizedDetail: string;
  actorMasked: string;
  actionTaken: 'BLOCKED' | 'FLAGGED' | 'RATE_LIMITED' | 'ALERTED';
}

export type ProdOpsAuditAction =
  | 'OPS_HEALTH_CHECKED'
  | 'OPS_INCIDENT_CREATED'
  | 'OPS_INCIDENT_ACKNOWLEDGED'
  | 'OPS_INCIDENT_UPDATED'
  | 'OPS_INCIDENT_RESOLVED'
  | 'OPS_INCIDENT_CLOSED'
  | 'OPS_BACKUP_VERIFIED'
  | 'OPS_RESTORE_VERIFIED'
  | 'OPS_DR_DRILL_STARTED'
  | 'OPS_DR_DRILL_COMPLETED'
  | 'OPS_DR_DRILL_FAILED'
  | 'OPS_SECURITY_ALERT'
  | 'OPS_FEATURE_FLAG_CHANGED'
  | 'OPS_RELEASE_STARTED'
  | 'OPS_RELEASE_PROMOTED'
  | 'OPS_RELEASE_ROLLED_BACK'
  | 'OPS_ROLLBACK_STARTED'
  | 'OPS_ROLLBACK_COMPLETED';
