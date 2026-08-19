// SMART RT 07 RW 11 GPA NGIJO - AI AGENT & INTELLIGENT SERVICE ARCHITECTURE v1.0
// Type Definitions for AI Gateway, Intent Engine, Tool Registry, Policy, RAG, and Security

import { UserRole } from './rt';
import { GeoBaseCertificationState, VerificationStatus } from './facility';

export type AIKnowledgeLayer =
  | 'LAYER_1_OFFICIAL_VERIFIED'
  | 'LAYER_2_OPERATIONAL_DATA'
  | 'LAYER_3_REFERENCE_DATA'
  | 'LAYER_4_USER_INPUT'
  | 'LAYER_5_GENERAL_KNOWLEDGE';

export type AIIntent =
  | 'RESIDENT_QUERY'
  | 'FAMILY_QUERY'
  | 'LETTER_QUERY'
  | 'LETTER_STATUS_QUERY'
  | 'ACTIVITY_QUERY'
  | 'FACILITY_QUERY'
  | 'GEOSPATIAL_QUERY'
  | 'FIELD_SURVEY_QUERY'
  | 'COMPLAINT_QUERY'
  | 'FINANCE_QUERY'
  | 'ADMIN_QUERY'
  | 'REPORT_QUERY'
  | 'POLICY_QUERY'
  | 'GENERAL_INFORMATION'
  | 'UNKNOWN';

export type AIDataClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type AISecurityEvent =
  | 'AI_REQUEST'
  | 'AI_INTENT_CLASSIFIED'
  | 'AI_DATA_ACCESS'
  | 'AI_TOOL_CALL'
  | 'AI_PERMISSION_DENIED'
  | 'AI_RESPONSE'
  | 'AI_MUTATION_REQUESTED'
  | 'AI_MUTATION_CONFIRMED'
  | 'AI_SECURITY_BLOCK'
  | 'AI_PROMPT_INJECTION_BLOCK'
  | 'AI_IDOR_BLOCK'
  | 'AI_RATE_LIMITED'
  | 'AI_OFFLINE_BLOCK';

export interface AIActorContext {
  userId: string;
  userName: string;
  role: UserRole;
  nik?: string;
  familyId?: string;
  phone?: string;
  channel: 'WEB_CHAT' | 'WHATSAPP' | 'PWA' | 'INTERNAL_SERVICE';
  isAuthenticated: boolean;
  sessionId: string;
  ipAddress?: string;
  requestId: string;
}

export interface AIToolDefinition {
  toolId: string;
  name: string;
  description: string;
  requiredPermission: string;
  allowedRoles: UserRole[];
  dataClassification: AIDataClassification;
  readOnly: boolean;
  mutating: boolean;
  auditEvent: string;
  rateLimit: number; // max per minute
  confirmationRequired: boolean;
  parameters?: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface AIConfirmationPayload {
  confirmationId: string;
  toolId: string;
  toolName: string;
  title: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  parameters: Record<string, any>;
  expiresAt: string;
  requestedBy: string;
  requiresRole?: UserRole[];
}

export interface AISourceCitation {
  sourceId: string;
  title: string;
  category: string;
  layer: AIKnowledgeLayer;
  verificationStatus?: 'FIELD_VERIFIED' | 'REFERENCE_UNVERIFIED' | 'OFFICIAL' | 'OPERATIONAL';
  isVerifiedRealWorld: boolean;
  snippet?: string;
  urlOrRef?: string;
  provenanceHash?: string;
}

export interface AIResponseMetadata {
  requestId: string;
  userId: string;
  sessionId: string;
  channel: string;
  intent: AIIntent;
  confidence: number; // 0 to 1
  dataSources: AISourceCitation[];
  permissionChecked: boolean;
  sensitivityLevel: AIDataClassification;
  toolsUsed: string[];
  knowledgeLayersUsed: AIKnowledgeLayer[];
  geobaseCertificationState?: GeoBaseCertificationState;
  referenceDataIncluded: boolean;
  timestamp: string;
  latencyMs: number;
  auditEvent: AISecurityEvent;
  executionStatus: 'SUCCESS' | 'DENIED' | 'UNAVAILABLE' | 'BLOCKED' | 'REQUIRES_CONFIRMATION';
}

export interface AIAgentResponse {
  success: boolean;
  message: string;
  role: 'assistant';
  intent: AIIntent;
  metadata: AIResponseMetadata;
  sources: AISourceCitation[];
  confirmationPrompt?: AIConfirmationPayload;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  error?: {
    code:
      | 'AUTH_REQUIRED'
      | 'FORBIDDEN'
      | 'DATA_NOT_FOUND'
      | 'DATA_UNVERIFIED'
      | 'SERVICE_UNAVAILABLE'
      | 'AI_TIMEOUT'
      | 'RATE_LIMITED'
      | 'SECURITY_BLOCKED'
      | 'VALIDATION_ERROR'
      | 'OFFLINE_FAIL_CLOSED';
    message: string;
  };
}

export interface AIKnowledgeHealthMetrics {
  totalItems: number;
  verifiedCount: number;
  referenceCount: number;
  operationalCount: number;
  staleCount: number;
  missingCount: number;
  healthScorePercent: number;
  geobaseCertification: GeoBaseCertificationState;
  geobaseScopeTotal: number;
  geobaseFieldVerified: number;
  geobaseReferenceUnverified: number;
  servicesStatus: Record<string, 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'>;
}

export interface AIAuditRecord {
  logId: string;
  timestamp: string;
  requestId: string;
  userId: string;
  role: UserRole;
  channel: string;
  event: AISecurityEvent;
  intent: AIIntent;
  toolUsed?: string;
  status: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'WARNING' | 'ERROR';
  details: string;
  clientIp?: string;
  durationMs: number;
}

export interface AITestSuiteResult {
  testId: string;
  name: string;
  category: 'SECURITY' | 'RBAC' | 'GEOBASE' | 'PDP' | 'INTEGRITY' | 'REGRESSION' | 'BUILD';
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  durationMs: number;
  message: string;
  expected: string;
  actual: string;
}
