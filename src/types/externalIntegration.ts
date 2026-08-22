// SMART RT 07 RW 11 GPA NGIJO - EXTERNAL SERVICE INTEGRATION TYPES v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)
// Architecture: Isolated Adapter Layer, Server-Authoritative RBAC, Zero-PII PDP Gate

export type ExternalServiceType = 'GAS_SHEETS' | 'WHATSAPP_GATEWAY' | 'GEMINI_AI' | 'OSM_MAP';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type IntegrationHealthStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'DISABLED';

export interface ExternalFeatureFlags {
  EXTERNAL_GAS_SYNC_ENABLED: boolean;
  EXTERNAL_WA_GATEWAY_ENABLED: boolean;
  EXTERNAL_GEMINI_AI_ENABLED: boolean;
  EXTERNAL_PAYMENT_ENABLED: false; // Strictly BLOCKED / OUT OF SCOPE
  EXTERNAL_OAUTH_ENABLED: false;   // Strictly BLOCKED / OUT OF SCOPE
}

export interface ServiceCircuitBreaker {
  service: ExternalServiceType;
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  lastStateChange: number;
  failureThreshold: number; // e.g. 50% or 3 consecutive
  resetTimeoutMs: number;  // e.g. 30000ms
}

export interface OutboundQueueItem {
  id: string;
  service: ExternalServiceType;
  action: string;
  sanitizedPayload: Record<string, any>;
  recipientHash?: string;
  status: 'QUEUED' | 'PROCESSING' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'DROPPED';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
  idempotencyKey: string;
}

export interface InboundWebhookEvent {
  id: string;
  service: ExternalServiceType;
  eventType: string;
  signature: string;
  timestamp: number;
  payload: Record<string, any>;
  receivedAt: number;
  status: 'VERIFIED' | 'REJECTED_SIGNATURE' | 'REJECTED_EXPIRED' | 'REJECTED_REPLAY' | 'REJECTED_SCHEMA' | 'PROCESSED';
  rejectionReason?: string;
}

export interface IntegrationAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  role: string;
  service: ExternalServiceType;
  action: 
    | 'EXTERNAL_REQUEST_CREATED'
    | 'EXTERNAL_REQUEST_SUCCESS'
    | 'EXTERNAL_REQUEST_FAILED'
    | 'EXTERNAL_TIMEOUT'
    | 'EXTERNAL_RETRY'
    | 'EXTERNAL_CIRCUIT_OPENED'
    | 'EXTERNAL_WEBHOOK_RECEIVED'
    | 'EXTERNAL_WEBHOOK_REJECTED'
    | 'EXTERNAL_DATA_SANITIZED'
    | 'EXTERNAL_DATA_BLOCKED';
  targetResource?: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED' | 'DEGRADED';
  metadata: Record<string, any>; // Sanitized metadata only, 0 PII, 0 Secrets
}

export interface ServiceHealthReport {
  service: ExternalServiceType;
  name: string;
  enabled: boolean;
  health: IntegrationHealthStatus;
  circuitState: CircuitBreakerState;
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  lastSuccessTimestamp?: string;
  lastFailureTimestamp?: string;
  lastErrorMessage?: string;
  queueDepth: number;
  avgLatencyMs: number;
}

export interface ExternalActorSession {
  userId: string;
  role: 'ADMIN' | 'KETUA_RT' | 'PENGURUS' | 'WARGA' | 'PUBLIC';
  nama?: string;
  isBackendConnected?: boolean;
}

export interface SanitizationResult<T = any> {
  isValid: boolean;
  sanitizedData: T;
  blockedFields: string[];
  piiViolations: string[];
  secretViolations: string[];
}
