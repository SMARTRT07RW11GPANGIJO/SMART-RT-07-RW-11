// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8A AI AUTHORIZATION & ZERO TRUST SERVICE
import { AIPermission, RolePermissionConfig, AIToolDefinition, AIAuditEntry, DataClassificationRule } from '../types/aiPermissions';
import { UserRole } from '../types/rt';

const STORAGE_AI_AUDIT_LOGS_KEY = 'SMART_RT_AI_AUDIT_LOG_V1';

// 1. Role Permission Matrix (Strict Default Deny)
export const ROLE_PERMISSIONS: Record<UserRole, AIPermission[]> = {
  PUBLIC: [
    'PUBLIC_READ',
    'QR_VERIFY'
  ],
  WARGA: [
    'PUBLIC_READ',
    'PROFILE_SELF',
    'LETTER_CREATE',
    'LETTER_READ_SELF',
    'PDF_GENERATE',
    'QR_VERIFY',
    'PAYMENT_READ_SELF',
    'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF',
    'AI_CHAT'
  ],
  PENGURUS: [
    'PUBLIC_READ',
    'PROFILE_SELF',
    'RESIDENT_READ',
    'LETTER_CREATE',
    'LETTER_READ_SELF',
    'LETTER_READ_ALL',
    'LETTER_VERIFY',
    'PDF_GENERATE',
    'QR_VERIFY',
    'PAYMENT_READ_SELF',
    'FINANCE_READ',
    'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF',
    'COMPLAINT_MANAGE',
    'ANNOUNCEMENT_CREATE',
    'AI_CHAT'
  ],
  KETUA_RT: [
    'PUBLIC_READ',
    'PROFILE_SELF',
    'RESIDENT_READ',
    'RESIDENT_MANAGE',
    'LETTER_CREATE',
    'LETTER_READ_SELF',
    'LETTER_READ_ALL',
    'LETTER_VERIFY',
    'LETTER_APPROVE',
    'LETTER_DELETE',
    'PDF_GENERATE',
    'QR_VERIFY',
    'PAYMENT_READ_SELF',
    'FINANCE_READ',
    'FINANCE_MANAGE',
    'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF',
    'COMPLAINT_MANAGE',
    'ANNOUNCEMENT_CREATE',
    'ANNOUNCEMENT_PUBLISH',
    'AUDIT_READ',
    'AI_CHAT',
    'AI_ADMIN_TOOLS'
  ],
  ADMIN: [
    'PUBLIC_READ',
    'PROFILE_SELF',
    'RESIDENT_READ',
    'RESIDENT_MANAGE',
    'LETTER_CREATE',
    'LETTER_READ_SELF',
    'LETTER_READ_ALL',
    'LETTER_VERIFY',
    'LETTER_APPROVE',
    'LETTER_DELETE',
    'PDF_GENERATE',
    'QR_VERIFY',
    'PAYMENT_READ_SELF',
    'FINANCE_READ',
    'FINANCE_MANAGE',
    'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF',
    'COMPLAINT_MANAGE',
    'ANNOUNCEMENT_CREATE',
    'ANNOUNCEMENT_PUBLISH',
    'AUDIT_READ',
    'BACKUP_CREATE',
    'BACKUP_RESTORE',
    'AI_CHAT',
    'AI_ADMIN_TOOLS'
  ]
};

// 2. AI Tool Permission Matrix
export const AI_TOOLS_CATALOG: AIToolDefinition[] = [
  {
    toolName: 'getPublicInformation',
    category: 'READ_SELF',
    requiredPermission: 'PUBLIC_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Mendapatkan pengumuman publik, kontak pengurus RT, dan jadwal kegiatan.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'PUBLIC'
  },
  {
    toolName: 'getMyProfile',
    category: 'READ_SELF',
    requiredPermission: 'PROFILE_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Membaca profil warga sendiri (nama, alamat, no telp) tanpa NIK/KK utuh.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'getMyLetters',
    category: 'READ_SELF',
    requiredPermission: 'LETTER_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Mendapatkan daftar pengajuan surat milik warga yang sedang login.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'getMyPayments',
    category: 'READ_SELF',
    requiredPermission: 'PAYMENT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Membaca riwayat pembayaran iuran milik warga sendiri.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'getMyComplaints',
    category: 'READ_SELF',
    requiredPermission: 'COMPLAINT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Melihat status pengaduan/tiket yang diajukan sendiri.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'createLetterRequest',
    category: 'MUTATION',
    requiredPermission: 'LETTER_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Mengajukan surat pengantar baru ke pengurus RT.',
    requiresHumanConfirmation: true,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'createComplaint',
    category: 'MUTATION',
    requiredPermission: 'COMPLAINT_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Membuat tiket pengaduan baru warga.',
    requiresHumanConfirmation: true,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'getAssignedLetters',
    category: 'READ_STAFF',
    requiredPermission: 'LETTER_READ_ALL',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Melihat seluruh berkas pengajuan surat warga untuk diverifikasi/disetujui.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'getFinanceSummary',
    category: 'READ_STAFF',
    requiredPermission: 'FINANCE_READ',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    description: 'Membaca ringkasan kas RT dan rekapitulasi pembayaran iuran.',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'INTERNAL'
  },
  {
    toolName: 'publishAnnouncement',
    category: 'MUTATION',
    requiredPermission: 'ANNOUNCEMENT_PUBLISH',
    allowedRoles: ['KETUA_RT', 'ADMIN'],
    description: 'Menerbitkan pengumuman resmi RT ke seluruh warga.',
    requiresHumanConfirmation: true,
    dataClassificationLevel: 'PUBLIC'
  },
  {
    toolName: 'searchResidents',
    category: 'ADMIN',
    requiredPermission: 'RESIDENT_MANAGE',
    allowedRoles: ['KETUA_RT', 'ADMIN'],
    description: 'Mencari data warga dalam direktori RT (scoped, NIK/KK tetap dimask).',
    requiresHumanConfirmation: false,
    dataClassificationLevel: 'CONFIDENTIAL'
  },
  {
    toolName: 'createBackup',
    category: 'ADMIN',
    requiredPermission: 'BACKUP_CREATE',
    allowedRoles: ['ADMIN'],
    description: 'Memicu pembuatan snapshot backup database ke Drive 06_BACKUP.',
    requiresHumanConfirmation: true,
    dataClassificationLevel: 'RESTRICTED'
  }
];

// 3. Data Classification Rules for AI Sanitization
export const DATA_CLASSIFICATION_RULES: DataClassificationRule[] = [
  {
    field: 'nik',
    classification: 'RESTRICTED',
    aiPolicy: 'MASK',
    exampleInput: '3507121508850004',
    sanitizedOutput: '350712******0004'
  },
  {
    field: 'no_kk',
    classification: 'RESTRICTED',
    aiPolicy: 'MASK',
    exampleInput: '3507120101180009',
    sanitizedOutput: '350712******0009'
  },
  {
    field: 'password',
    classification: 'RESTRICTED',
    aiPolicy: 'STRIP',
    exampleInput: 'AdminSecret@2026',
    sanitizedOutput: '[REDACTED]'
  },
  {
    field: 'token',
    classification: 'RESTRICTED',
    aiPolicy: 'STRIP',
    exampleInput: 'AKfycbz_SMART_RT07_EXEC',
    sanitizedOutput: '[REDACTED]'
  },
  {
    field: 'api_key',
    classification: 'RESTRICTED',
    aiPolicy: 'STRIP',
    exampleInput: 'AIzaSyA_DEMO_KEY',
    sanitizedOutput: '[REDACTED]'
  },
  {
    field: 'nomor_hp',
    classification: 'CONFIDENTIAL',
    aiPolicy: 'MASK',
    exampleInput: '081234567890',
    sanitizedOutput: '0812****7890'
  }
];

// 4. Authorization & Authentication Enforcement Core Functions
export interface AuthContext {
  isValidSession: boolean;
  isExpired?: boolean;
  isRevoked?: boolean;
  isUserActive?: boolean;
  verifiedUserId?: string;
  verifiedRole?: UserRole;
}

export function validateAIAuthContext(context?: AuthContext): { valid: boolean; errorMessage: string } {
  if (!context || !context.isValidSession || context.isExpired || context.isRevoked || context.isUserActive === false) {
    return {
      valid: false,
      errorMessage: "Maaf, sesi Anda sudah tidak valid. Silakan login kembali."
    };
  }
  return { valid: true, errorMessage: "" };
}

export function requireAuthenticatedUser(role: UserRole): boolean {
  if (role === 'PUBLIC') {
    return false;
  }
  return true;
}

export function hasPermission(role: UserRole, permission: AIPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function requirePermission(
  role: UserRole, 
  permission: AIPermission, 
  userId: string, 
  actionName: string, 
  toolName: string
): { allowed: boolean; reason?: string } {
  if (!hasPermission(role, permission)) {
    const reason = `Akses Ditolak: Role ${role} tidak memiliki hak akses ${permission} untuk tindakan ${actionName}.`;
    
    logAIAuditEntry({
      userId,
      role,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: actionName,
      tool: toolName,
      result: 'DENIED',
      decision: 'BLOCKED_NO_PERMISSION',
      deniedReason: reason
    });

    return { allowed: false, reason };
  }
  return { allowed: true };
}

export function requireRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role);
}

export function requireResourceOwnership(
  role: UserRole,
  currentUserId: string,
  resourceOwnerId: string,
  permissionOverrideForStaff?: AIPermission
): { allowed: boolean; reason?: string } {
  // Staff override check
  if (permissionOverrideForStaff && hasPermission(role, permissionOverrideForStaff)) {
    return { allowed: true };
  }

  // Warga ownership check
  if (currentUserId !== resourceOwnerId) {
    const reason = `Resource Ownership Violation: User ${currentUserId} mencoba mengakses resource milik ${resourceOwnerId}.`;
    logAIAuditEntry({
      userId: currentUserId,
      role,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: 'RESOURCE_OWNERSHIP_CHECK',
      tool: 'DataOwnershipGuard',
      resourceId: resourceOwnerId,
      result: 'DENIED',
      decision: 'BLOCKED_NOT_OWNER',
      deniedReason: reason
    });
    return { allowed: false, reason };
  }

  return { allowed: true };
}

// 5. Data Sanitization Function for AI Payloads
export function sanitizeDataForAI<T>(data: T): T {
  if (!data) return data;

  const jsonStr = JSON.stringify(data);
  let sanitizedStr = jsonStr;

  // Mask NIK (16 digits)
  sanitizedStr = sanitizedStr.replace(/("nik"\s*:\s*")(\d{6})\d{6}(\d{4})"/gi, '$1$2******$3"');
  
  // Mask KK (16 digits)
  sanitizedStr = sanitizedStr.replace(/("no_kk"\s*:\s*")(\d{6})\d{6}(\d{4})"/gi, '$1$2******$3"');

  // Mask phone numbers (10-13 digits)
  sanitizedStr = sanitizedStr.replace(/("no_hp"|"telepon"|"whatsapp"\s*:\s*")(\d{4})\d+(\d{4})"/gi, '$1$2****$3"');

  // Strip sensitive keys
  sanitizedStr = sanitizedStr.replace(/("password"|"token"|"api_key"|"secret"|"private_key"\s*:\s*")[^"]+"/gi, '$1[REDACTED]"');

  try {
    return JSON.parse(sanitizedStr);
  } catch (e) {
    console.error('Data sanitization JSON parse failed:', e);
    return data;
  }
}

// 6. AI Audit Logging Engine
export function getAIAuditLogs(): AIAuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_AI_AUDIT_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse AI Audit Logs:', e);
    return [];
  }
}

export function logAIAuditEntry(entryData: Omit<AIAuditEntry, 'id' | 'timestamp'>): AIAuditEntry {
  const currentLogs = getAIAuditLogs();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = (currentLogs.length + 1).toString().padStart(4, '0');

  const newEntry: AIAuditEntry = {
    ...entryData,
    id: `AIAUD-${dateStr}-${seq}`,
    timestamp: new Date().toISOString()
  };

  const updated = [newEntry, ...currentLogs];
  try {
    localStorage.setItem(STORAGE_AI_AUDIT_LOGS_KEY, JSON.stringify(updated.slice(0, 200))); // Keep last 200
  } catch (e) {
    console.error('Failed to save AI Audit Entry:', e);
  }

  return newEntry;
}
