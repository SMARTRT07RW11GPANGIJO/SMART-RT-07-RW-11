/**
 * Authorization.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — AUTHORIZATION ENFORCEMENT & SESSION VALIDATION
 * 
 * Server-authoritative session, role, and permission validation.
 */

var ROLE_PERMISSIONS = {
  PUBLIC: ['PUBLIC_READ', 'QR_VERIFY'],
  WARGA: [
    'PUBLIC_READ', 'PROFILE_SELF', 'LETTER_CREATE', 'LETTER_READ_SELF',
    'PDF_GENERATE', 'QR_VERIFY', 'PAYMENT_READ_SELF', 'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF', 'AI_CHAT'
  ],
  PENGURUS: [
    'PUBLIC_READ', 'PROFILE_SELF', 'RESIDENT_READ', 'LETTER_CREATE',
    'LETTER_READ_SELF', 'LETTER_READ_ALL', 'LETTER_VERIFY', 'PDF_GENERATE',
    'QR_VERIFY', 'PAYMENT_READ_SELF', 'FINANCE_READ', 'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF', 'COMPLAINT_MANAGE', 'ANNOUNCEMENT_CREATE', 'AI_CHAT'
  ],
  KETUA_RT: [
    'PUBLIC_READ', 'PROFILE_SELF', 'RESIDENT_READ', 'RESIDENT_MANAGE',
    'LETTER_CREATE', 'LETTER_READ_SELF', 'LETTER_READ_ALL', 'LETTER_VERIFY',
    'LETTER_APPROVE', 'LETTER_DELETE', 'PDF_GENERATE', 'QR_VERIFY',
    'PAYMENT_READ_SELF', 'FINANCE_READ', 'FINANCE_MANAGE', 'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF', 'COMPLAINT_MANAGE', 'ANNOUNCEMENT_CREATE',
    'ANNOUNCEMENT_PUBLISH', 'AUDIT_READ', 'AI_CHAT', 'AI_ADMIN_TOOLS'
  ],
  ADMIN: [
    'PUBLIC_READ', 'PROFILE_SELF', 'RESIDENT_READ', 'RESIDENT_MANAGE',
    'LETTER_CREATE', 'LETTER_READ_SELF', 'LETTER_READ_ALL', 'LETTER_VERIFY',
    'LETTER_APPROVE', 'LETTER_DELETE', 'PDF_GENERATE', 'QR_VERIFY',
    'PAYMENT_READ_SELF', 'FINANCE_READ', 'FINANCE_MANAGE', 'COMPLAINT_CREATE',
    'COMPLAINT_READ_SELF', 'COMPLAINT_MANAGE', 'ANNOUNCEMENT_CREATE',
    'ANNOUNCEMENT_PUBLISH', 'AUDIT_READ', 'BACKUP_CREATE', 'BACKUP_RESTORE',
    'AI_CHAT', 'AI_ADMIN_TOOLS'
  ]
};

function validateSession(sessionToken) {
  if (!sessionToken) {
    return { isValid: false, code: "AUTH_REQUIRED", message: "Maaf, Anda harus login terlebih dahulu." };
  }
  
  var props = PropertiesService.getScriptProperties();
  var rawSession = props.getProperty("SESSION_" + sessionToken);
  
  if (!rawSession) {
    return { isValid: false, code: "INVALID_SESSION", message: "Maaf, sesi Anda sudah tidak valid. Silakan login kembali." };
  }
  
  var session = JSON.parse(rawSession);
  var now = new Date().getTime();
  
  if (session.expiresAt < now) {
    return { isValid: false, code: "SESSION_EXPIRED", message: "Maaf, sesi Anda telah berakhir. Silakan login kembali." };
  }
  
  if (session.isRevoked) {
    return { isValid: false, code: "INVALID_SESSION", message: "Maaf, sesi Anda sudah tidak valid. Silakan login kembali." };
  }
  
  if (session.isActive === false) {
    return { isValid: false, code: "ACCOUNT_INACTIVE", message: "Akun Anda sedang tidak aktif." };
  }
  
  return { isValid: true, session: session };
}

function checkRolePermission(role, requiredPermission) {
  var perms = ROLE_PERMISSIONS[role] || [];
  return perms.indexOf(requiredPermission) !== -1;
}

function authorizeRoleAndPermission(role, requiredPermission, allowedRoles) {
  if (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(role) === -1) {
    return { authorized: false, code: "ROLE_NOT_ALLOWED", message: "Akses Ditolak: Peran tidak diizinkan." };
  }
  if (!checkRolePermission(role, requiredPermission)) {
    return { authorized: false, code: "PERMISSION_DENIED", message: "Akses Ditolak: Hak akses tidak mencukupi." };
  }
  return { authorized: true };
}
