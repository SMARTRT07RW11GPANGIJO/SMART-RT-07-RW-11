// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Resource Ownership & IDOR Protection Layer

import { UserRole } from './roles';
import { AIPermission } from './permissions';
import { roleHasPermission } from './roles';
import { SecurityAuthorizationError } from './securityErrors';

export interface ResourceOwnershipParams {
  sessionUserId: string;
  sessionRole: UserRole;
  targetResourceOwnerId: string;
  staffOverridePermission?: AIPermission;
}

/**
 * Validates resource ownership to prevent IDOR (Insecure Direct Object Reference).
 * Warga can only access their own resources unless elevated staff permission exists.
 */
export function checkResourceOwnership(params: ResourceOwnershipParams): void {
  const { sessionUserId, sessionRole, targetResourceOwnerId, staffOverridePermission } = params;

  // 1. Check if staff override permission applies
  if (staffOverridePermission && roleHasPermission(sessionRole, staffOverridePermission)) {
    return; // Staff role authorized to access cross-user resources
  }

  // 2. Strict IDOR Ownership Check
  if (!sessionUserId || !targetResourceOwnerId || sessionUserId !== targetResourceOwnerId) {
    throw new SecurityAuthorizationError(
      'OWNERSHIP_REQUIRED',
      `IDOR Attempt Blocked: User '${sessionUserId}' attempted to access resource owned by '${targetResourceOwnerId}'`
    );
  }
}

/**
 * Helper to sanitize resource filters to match owner ID strictly for WARGA
 */
export function scopeResourceQueryToUser<T extends { id_warga?: string; nik?: string }>(
  items: T[],
  sessionUserId: string,
  sessionRole: UserRole,
  staffOverridePermission?: AIPermission
): T[] {
  if (staffOverridePermission && roleHasPermission(sessionRole, staffOverridePermission)) {
    return items; // Staff can view full dataset
  }

  // Filter strictly for current user
  return items.filter(
    (item) => item.id_warga === sessionUserId || item.nik === sessionUserId
  );
}
