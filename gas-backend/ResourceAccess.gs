/**
 * ResourceAccess.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — RESOURCE OWNERSHIP & IDOR PROTECTION
 * 
 * Verifies resource ownership on the backend to prevent direct object reference attacks.
 */

function checkResourceOwnership(sessionUserId, targetResourceOwnerId, sessionRole, staffPermission) {
  // Staff override check
  if (staffPermission && checkRolePermission(sessionRole, staffPermission)) {
    return { allowed: true };
  }
  
  if (!sessionUserId || !targetResourceOwnerId || sessionUserId !== targetResourceOwnerId) {
    return {
      allowed: false,
      code: "OWNERSHIP_REQUIRED",
      message: "Akses Ditolak: Anda hanya dapat mengakses data milik Anda sendiri."
    };
  }
  
  return { allowed: true };
}

function scopeRecordsToOwner(records, sessionUserId, sessionRole, staffPermission) {
  if (staffPermission && checkRolePermission(sessionRole, staffPermission)) {
    return records;
  }
  
  return records.filter(function(row) {
    return row.id_warga === sessionUserId || row.nik === sessionUserId;
  });
}
