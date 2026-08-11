import { UserRole } from './rt';
import { AIPermission } from '../security/permissions';

export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ToolSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface AIToolSchema {
  type: 'object';
  properties: Record<string, ToolSchemaProperty>;
  required?: string[];
}

export interface AIToolDefinition {
  toolId: string;
  name: string;
  category: 'READ' | 'TRANSACTION' | 'DOCUMENT' | 'COMMUNICATION' | 'ADMIN';
  description: string;
  permission: AIPermission;
  requiredPermission?: AIPermission;
  allowedRoles: UserRole[];
  riskLevel: AIRiskLevel;
  inputSchema: AIToolSchema;
  outputSchema: AIToolSchema;
  confirmationRequired: boolean;
  requiresConfirmation?: boolean;
  requiresOwnership: boolean;
  auditEvent: string;
  rateLimit: number; // max executions per minute
}

export interface AuthoritativeSession {
  sessionId: string;
  userId: string;
  residentId: string;
  role: UserRole;
  userName: string;
  isValidSession: boolean;
  isExpired?: boolean;
  isRevoked?: boolean;
}

export interface ToolExecutionContext {
  session: AuthoritativeSession;
  confirmed?: boolean;
  userPrompt?: string;
  clientIp?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  status: 'EXECUTED' | 'CONFIRMATION_REQUIRED' | 'DENIED' | 'ERROR' | 'RATE_LIMITED';
  toolId: string;
  riskLevel?: AIRiskLevel;
  confirmationPrompt?: {
    id: string;
    title: string;
    description: string;
    payload: Record<string, any>;
  };
  data?: any;
  error?: string;
  auditLogId?: string;
}

export type NotificationChannel = 'WHATSAPP' | 'SYSTEM' | 'EMAIL';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface NotificationQueueItem {
  id: string;
  recipient: string;
  recipientName?: string;
  channel: NotificationChannel;
  event: AutomationEventType;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  sentAt?: string;
  error?: string;
}

export type AutomationEventType =
  | 'LETTER_CREATED'
  | 'LETTER_VERIFIED'
  | 'LETTER_APPROVED'
  | 'LETTER_COMPLETED'
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_UPDATED'
  | 'COMPLAINT_COMPLETED'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_OVERDUE'
  | 'ANNOUNCEMENT_CREATED';

export interface AutomationWorkflowPayload {
  eventId: string;
  eventType: AutomationEventType;
  triggeredBy: string;
  timestamp: string;
  recordId: string;
  data: Record<string, any>;
}

export interface ScheduledWorkflowRule {
  ruleId: string;
  name: string;
  description: string;
  schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  targetRoles: UserRole[];
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}
