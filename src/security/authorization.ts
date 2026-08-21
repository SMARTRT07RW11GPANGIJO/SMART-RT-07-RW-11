// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Core Server-Authoritative Authorization Engine

import { UserRole, roleHasPermission } from './roles';
import { AIPermission } from './permissions';
import { SecurityAuthorizationError, SecurityDenialCode } from './securityErrors';

export interface AuthoritativeSessionContext {
  sessionId: string;
  userId: string;
  role: UserRole;
  isValid: boolean;
  isExpired?: boolean;
  isRevoked?: boolean;
  isUserActive?: boolean;
  issuedAt?: string;
  expiresAt?: string;
  keluargaId?: string;
  nomorKK?: string;
  namaLengkap?: string;
  forcePasswordChange?: boolean;
  isFirstLogin?: boolean;
  accountStatus?: 'PENDING_ACTIVATION' | 'PASSWORD_CHANGE_REQUIRED' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
}

/**
 * Validates the session context server-authoritatively.
 * Throws SecurityAuthorizationError if invalid, expired, revoked, or inactive.
 */
export function validateSessionContext(session?: AuthoritativeSessionContext): AuthoritativeSessionContext {
  if (!session || !session.sessionId || !session.userId) {
    throw new SecurityAuthorizationError('AUTH_REQUIRED', 'Session context missing or incomplete.');
  }

  if (!session.isValid) {
    throw new SecurityAuthorizationError('INVALID_SESSION', 'Session invalid flag set.');
  }

  if (session.isExpired) {
    throw new SecurityAuthorizationError('SESSION_EXPIRED', 'Session TTL expired.');
  }

  if (session.isRevoked) {
    throw new SecurityAuthorizationError('INVALID_SESSION', 'Session revoked by admin.');
  }

  if (session.isUserActive === false) {
    throw new SecurityAuthorizationError('ACCOUNT_INACTIVE', 'User account deactivated.');
  }

  return session;
}

/**
 * Checks if a session has the required permission for a tool or action.
 */
export function checkRolePermission(role: UserRole, requiredPermission: AIPermission): boolean {
  return roleHasPermission(role, requiredPermission);
}

/**
 * Authorizes a role against required permission and allowed roles array.
 */
export function authorizeRoleAndPermission(
  sessionRole: UserRole,
  requiredPermission: AIPermission,
  allowedRoles?: UserRole[]
): void {
  // 1. Check allowed roles list if specified
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(sessionRole)) {
    throw new SecurityAuthorizationError(
      'ROLE_NOT_ALLOWED',
      `Role '${sessionRole}' is not in allowed roles: [${allowedRoles.join(', ')}]`
    );
  }

  // 2. Check permission matrix
  if (!checkRolePermission(sessionRole, requiredPermission)) {
    throw new SecurityAuthorizationError(
      'PERMISSION_DENIED',
      `Role '${sessionRole}' lacks required permission '${requiredPermission}'`
    );
  }
}
