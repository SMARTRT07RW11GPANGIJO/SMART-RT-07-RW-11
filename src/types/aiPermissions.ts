// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8A AI PERMISSION MATRIX & SECURITY TYPES

export type AIPermission = 
  | 'PUBLIC_READ'
  | 'PROFILE_SELF'
  | 'RESIDENT_READ'
  | 'RESIDENT_MANAGE'
  | 'LETTER_CREATE'
  | 'LETTER_READ_SELF'
  | 'LETTER_READ_ALL'
  | 'LETTER_VERIFY'
  | 'LETTER_APPROVE'
  | 'LETTER_DELETE'
  | 'PDF_GENERATE'
  | 'QR_VERIFY'
  | 'PAYMENT_READ_SELF'
  | 'FINANCE_READ'
  | 'FINANCE_MANAGE'
  | 'COMPLAINT_CREATE'
  | 'COMPLAINT_READ_SELF'
  | 'COMPLAINT_MANAGE'
  | 'ANNOUNCEMENT_CREATE'
  | 'ANNOUNCEMENT_PUBLISH'
  | 'AUDIT_READ'
  | 'BACKUP_CREATE'
  | 'BACKUP_RESTORE'
  | 'AI_CHAT'
  | 'AI_ADMIN_TOOLS';

export interface RolePermissionConfig {
  role: 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';
  description: string;
  permissions: AIPermission[];
}

export interface AIToolDefinition {
  toolName: string;
  category: 'READ_SELF' | 'READ_STAFF' | 'MUTATION' | 'ADMIN';
  requiredPermission: AIPermission;
  allowedRoles: ('PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN')[];
  description: string;
  requiresHumanConfirmation: boolean;
  dataClassificationLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface AIAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  role: 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';
  sessionId: string;
  action: string;
  tool: string;
  resourceId?: string;
  result: 'SUCCESS' | 'DENIED' | 'ERROR';
  decision: string;
  deniedReason?: string;
}

export interface DataClassificationRule {
  field: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  aiPolicy: 'ALLOW' | 'MASK' | 'STRIP' | 'ENCRYPT';
  exampleInput: string;
  sanitizedOutput: string;
}
