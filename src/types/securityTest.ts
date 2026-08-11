export type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SecurityTestStatus = 'PASS' | 'FAIL' | 'SKIPPED';

export type SecurityCategory = 
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'RBAC'
  | 'SESSION'
  | 'INPUT_VALIDATION'
  | 'XSS'
  | 'SHEETS_INJECTION'
  | 'FORM_SECURITY'
  | 'API_SECURITY'
  | 'IDOR'
  | 'PRIVILEGE_ESCALATION'
  | 'RATE_LIMITING'
  | 'SECRET_SECURITY'
  | 'DATA_PROTECTION'
  | 'GOOGLE_DRIVE'
  | 'AUDIT_LOG'
  | 'BACKUP'
  | 'RESTORE'
  | 'WHATSAPP_API'
  | 'FRONTEND_SECURITY'
  | 'DATA_MINIMIZATION'
  | 'MASKING'
  | 'AUDIT_LOGGING'
  | 'AI_TOOLS'
  | 'AUTOMATION';

export interface SecurityTestLog {
  testId: string;
  category: SecurityCategory;
  testName: string;
  title?: string;
  expected: string;
  actual: string;
  status: SecurityTestStatus;
  passed?: boolean;
  severity: SecuritySeverity;
  testedBy: string;
  timestamp: string;
  notes: string;
}

export interface SecurityTestResult {
  passed: number;
  totalTests: number;
  durationMs: number;
  logs: Array<{
    testId: string;
    title: string;
    passed: boolean;
    notes: string;
  }>;
}

export type ProductionGateStatus = 'READY_FOR_PRODUCTION' | 'BLOCKED';

export interface SecuritySummaryReport {
  timestamp: string;
  testedBy: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  securityScore: number; // Percentage 0 - 100
  productionGateStatus: ProductionGateStatus;
  gateMessage: string;
  logs: SecurityTestLog[];
}

export interface SecurityRemediationItem {
  id: string;
  category: SecurityCategory;
  issue: string;
  severity: SecuritySeverity;
  affectedComponent: string;
  remediation: string;
  status: 'FIXED' | 'ACCEPTED_RISK' | 'OPEN';
}
