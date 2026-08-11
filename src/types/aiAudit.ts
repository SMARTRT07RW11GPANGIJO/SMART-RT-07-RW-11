// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J AI AUDIT & ANALYTICS TYPES

import { UserRole } from './rt';

export type AIAuditEventType =
  | 'AI_SESSION_STARTED'
  | 'AI_MESSAGE_RECEIVED'
  | 'AI_INTENT_DETECTED'
  | 'AI_TOOL_REQUESTED'
  | 'AI_TOOL_AUTHORIZED'
  | 'AI_TOOL_DENIED'
  | 'AI_TOOL_CONFIRMATION_REQUIRED'
  | 'AI_TOOL_CONFIRMED'
  | 'AI_TOOL_CANCELLED'
  | 'AI_TOOL_EXECUTED'
  | 'AI_TOOL_FAILED'
  | 'AI_DATA_ACCESS'
  | 'AI_DATA_DENIED'
  | 'AI_AUTOMATION_STARTED'
  | 'AI_AUTOMATION_COMPLETED'
  | 'AI_AUTOMATION_FAILED'
  | 'AI_RESPONSE_GENERATED'
  | 'AI_SECURITY_ALERT'
  | 'AI_RATE_LIMITED'
  | 'AI_ERROR'
  | 'AI_ESCALATION_CREATED'
  | 'AI_EVALUATION_RUN';

export type AuditChannel = 'WEB_CHAT' | 'WHATSAPP' | 'SYSTEM' | 'AUTOMATION';

export type AuditErrorClassification =
  | 'AUTH_ERROR'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'API_ERROR'
  | 'WHATSAPP_ERROR'
  | 'PDF_ERROR'
  | 'AI_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMIT';

export interface AIAuditLog {
  id: string;
  timestamp: string;
  requestId: string;
  sessionId: string;
  userId: string;
  residentId?: string;
  role: UserRole;
  channel: AuditChannel;
  intent?: string;
  toolName?: string;
  action: AIAuditEventType;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  authorization: 'ALLOWED' | 'DENIED' | 'NOT_APPLICABLE';
  confirmation?: 'REQUIRED' | 'GIVEN' | 'CANCELLED' | 'NOT_APPLICABLE';
  status: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'PENDING' | 'WARNING';
  durationMs: number;
  errorCode?: AuditErrorClassification | string;
  details?: string;
  previousHash?: string;
  currentHash?: string;
  createdAt: string;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType =
  | 'EXCESSIVE_PERMISSION_DENIAL'
  | 'EXCESSIVE_REQUESTS'
  | 'RATE_LIMIT_VIOLATION'
  | 'ABNORMAL_TOOL_USAGE'
  | 'REPEATED_FAILED_ACTIONS'
  | 'BROADCAST_ANOMALY'
  | 'PROMPT_INJECTION'
  | 'TOOL_INJECTION'
  | 'DATA_LEAK_ATTEMPT'
  | 'UNAUTHORIZED_AUDIT_ACCESS';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  type: AlertType;
  userId: string;
  requestId?: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ToolAnalyticsItem {
  toolName: string;
  calls: number;
  success: number;
  failed: number;
  denied: number;
  avgDurationMs: number;
}

export interface ErrorAnalyticsItem {
  category: AuditErrorClassification | string;
  count: number;
  percentage: number;
}

export interface CostTrackingMetrics {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  estimatedCostIdr: number;
}

export interface UserFeedbackMetrics {
  helpfulCount: number;
  unhelpfulCount: number;
  totalFeedback: number;
  positiveRatio: number;
  escalationCount: number;
  escalationRate: number;
  resolutionRate: number;
}

export interface AnalyticsOverview {
  totalRequests: number;
  successRate: number;
  failureRate: number;
  denialRate: number;
  avgResponseTimeMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  topIntents: { intent: string; count: number }[];
  topTools: ToolAnalyticsItem[];
  channelDistribution: { channel: AuditChannel; count: number }[];
  roleDistribution: { role: UserRole; count: number }[];
  escalationRate: number;
  resolutionRate: number;
  feedback: UserFeedbackMetrics;
  errors: ErrorAnalyticsItem[];
  cost: CostTrackingMetrics;
  activeAlertsCount: number;
}

export interface RetentionPolicyConfig {
  retentionDays: number; // e.g. 30, 90, 365
  autoPurge: boolean;
  archiveEnabled: boolean;
}

export interface AuditIntegrityStatus {
  isChainValid: boolean;
  totalRecordsChecked: number;
  tamperedRecordIds: string[];
  lastCheckedAt: string;
}

export interface AuditExportOptions {
  format: 'CSV' | 'PDF';
  startDate?: string;
  endDate?: string;
  roleFilter?: UserRole;
  channelFilter?: AuditChannel;
  maskPII: boolean;
}
