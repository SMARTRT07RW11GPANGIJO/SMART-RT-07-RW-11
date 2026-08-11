// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Security Denial Codes & User-Facing Error Messages

export type SecurityDenialCode = 
  | 'AUTH_REQUIRED'
  | 'INVALID_SESSION'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_INACTIVE'
  | 'ROLE_NOT_ALLOWED'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_FORBIDDEN'
  | 'OWNERSHIP_REQUIRED'
  | 'CONFIRMATION_REQUIRED'
  | 'TOOL_NOT_ALLOWED'
  | 'DATA_NOT_FOUND';

export interface SecurityErrorDetail {
  code: SecurityDenialCode;
  internalReason: string;
  userFacingMessage: string;
  statusCode: number;
}

export const SECURITY_ERROR_MAP: Record<SecurityDenialCode, SecurityErrorDetail> = {
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    internalReason: 'Authentication token or session context is missing.',
    userFacingMessage: 'Maaf, Anda harus login terlebih dahulu untuk mengakses fitur ini.',
    statusCode: 401
  },
  INVALID_SESSION: {
    code: 'INVALID_SESSION',
    internalReason: 'Session signature or token validation failed.',
    userFacingMessage: 'Maaf, sesi Anda sudah tidak valid. Silakan login kembali.',
    statusCode: 401
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    internalReason: 'Session timestamp exceeds maximum allowed TTL.',
    userFacingMessage: 'Maaf, sesi Anda telah berakhir. Silakan login kembali.',
    statusCode: 401
  },
  ACCOUNT_INACTIVE: {
    code: 'ACCOUNT_INACTIVE',
    internalReason: 'User account status is suspended or deactivated.',
    userFacingMessage: 'Akun Anda sedang tidak aktif. Silakan hubungi Pengurus RT.',
    statusCode: 403
  },
  ROLE_NOT_ALLOWED: {
    code: 'ROLE_NOT_ALLOWED',
    internalReason: 'User role is not listed in allowed tool roles.',
    userFacingMessage: 'Maaf, peran akun Anda tidak memiliki wewenang untuk tindakan ini.',
    statusCode: 403
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    internalReason: 'Role lacks required AIPermission.',
    userFacingMessage: 'Akses ditolak: Hak akses tidak mencukupi.',
    statusCode: 403
  },
  RESOURCE_FORBIDDEN: {
    code: 'RESOURCE_FORBIDDEN',
    internalReason: 'Access to requested target resource is restricted.',
    userFacingMessage: 'Maaf, Anda tidak diperkenankan mengakses berkas/data ini.',
    statusCode: 403
  },
  OWNERSHIP_REQUIRED: {
    code: 'OWNERSHIP_REQUIRED',
    internalReason: 'User ID does not match target resource owner ID (IDOR prevention).',
    userFacingMessage: 'Akses Ditolak: Anda hanya dapat mengakses data milik Anda sendiri.',
    statusCode: 403
  },
  CONFIRMATION_REQUIRED: {
    code: 'CONFIRMATION_REQUIRED',
    internalReason: 'Action requires explicit human confirmation before execution.',
    userFacingMessage: 'Diperlukan konfirmasi eksplisit sebelum tindakan ini dijalankan.',
    statusCode: 400
  },
  TOOL_NOT_ALLOWED: {
    code: 'TOOL_NOT_ALLOWED',
    internalReason: 'Tool execution blocked by security policy guardrail.',
    userFacingMessage: 'Maaf, tindakan ini tidak dapat diproses oleh AI Assistant.',
    statusCode: 403
  },
  DATA_NOT_FOUND: {
    code: 'DATA_NOT_FOUND',
    internalReason: 'Requested resource or document was not found.',
    userFacingMessage: 'Maaf, data atau dokumen yang Anda cari tidak ditemukan.',
    statusCode: 404
  }
};

export class SecurityAuthorizationError extends Error {
  public code: SecurityDenialCode;
  public internalReason: string;
  public userFacingMessage: string;
  public statusCode: number;

  constructor(code: SecurityDenialCode, customInternalReason?: string) {
    const detail = SECURITY_ERROR_MAP[code] || {
      code,
      internalReason: customInternalReason || 'Otorisasi gagal',
      userFacingMessage: 'Akses Ditolak: Otorisasi gagal.',
      statusCode: 403
    };
    super(detail.userFacingMessage);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'SecurityAuthorizationError';
    this.code = code;
    this.internalReason = customInternalReason || detail.internalReason;
    this.userFacingMessage = detail.userFacingMessage;
    this.statusCode = detail.statusCode;
  }
}
