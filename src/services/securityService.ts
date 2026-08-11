import { UserRole, Warga, Keluarga, SuratPengantar, TagihanIuran } from '../types/rt';

export type Permission = 
  | 'ALL'
  | 'DASHBOARD_VIEW'
  | 'DASHBOARD_VIEW_LIMITED'
  | 'WARGA_VIEW'
  | 'WARGA_VIEW_LIMITED'
  | 'WARGA_CREATE'
  | 'WARGA_UPDATE'
  | 'WARGA_DELETE'
  | 'KELUARGA_VIEW'
  | 'KELUARGA_VIEW_LIMITED'
  | 'SURAT_CREATE'
  | 'SURAT_VIEW'
  | 'SURAT_VIEW_OWN'
  | 'SURAT_PROCESS'
  | 'SURAT_APPROVE'
  | 'SURAT_REJECT'
  | 'SURAT_REVOKE'
  | 'SURAT_GENERATE_PDF'
  | 'KEUANGAN_VIEW'
  | 'KEUANGAN_UPDATE'
  | 'IURAN_VIEW'
  | 'IURAN_VIEW_OWN'
  | 'IURAN_UPDATE'
  | 'PENGADUAN_CREATE'
  | 'PENGADUAN_VIEW'
  | 'PENGADUAN_VIEW_OWN'
  | 'PENGADUAN_UPDATE'
  | 'PENGUMUMAN_CREATE'
  | 'PENGUMUMAN_UPDATE'
  | 'PENGUMUMAN_VIEW'
  | 'AGENDA_CREATE'
  | 'AGENDA_VIEW'
  | 'ARSIP_VIEW'
  | 'ARSIP_VIEW_LIMITED'
  | 'USER_MANAGE'
  | 'ROLE_MANAGE'
  | 'AUDIT_LOG_VIEW'
  | 'BACKUP_CREATE'
  | 'BACKUP_RESTORE'
  | 'SECURITY_HEALTH_VIEW'
  | 'AI_USE'
  | 'AI_USE_PUBLIC'
  | 'AI_ADMIN'
  | 'VERIFY_DOCUMENT'
  | 'PUBLIC_INFO_VIEW'
  | 'VIEW_WARGA'
  | 'VIEW_NIK'
  | 'VIEW_KK'
  | 'VIEW_PHONE'
  | 'EDIT_WARGA'
  | 'DELETE_WARGA'
  | 'UPLOAD_DOCUMENT'
  | 'VIEW_DOCUMENT'
  | 'DELETE_DOCUMENT'
  | 'VIEW_FINANCE'
  | 'BACKUP_DATABASE'
  | 'VIEW_AUDIT_LOG';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ['ALL'],
  KETUA_RT: [
    'DASHBOARD_VIEW',
    'WARGA_VIEW',
    'VIEW_WARGA',
    'VIEW_NIK',
    'VIEW_KK',
    'VIEW_PHONE',
    'KELUARGA_VIEW',
    'SURAT_VIEW',
    'SURAT_APPROVE',
    'SURAT_REJECT',
    'SURAT_REVOKE',
    'SURAT_GENERATE_PDF',
    'KEUANGAN_VIEW',
    'VIEW_FINANCE',
    'IURAN_VIEW',
    'PENGADUAN_VIEW',
    'PENGADUAN_UPDATE',
    'PENGUMUMAN_CREATE',
    'PENGUMUMAN_UPDATE',
    'PENGUMUMAN_VIEW',
    'AGENDA_CREATE',
    'AGENDA_VIEW',
    'ARSIP_VIEW',
    'VIEW_DOCUMENT',
    'AUDIT_LOG_VIEW',
    'VIEW_AUDIT_LOG',
    'SECURITY_HEALTH_VIEW',
    'BACKUP_CREATE',
    'BACKUP_DATABASE',
    'AI_USE',
    'AI_ADMIN',
    'VERIFY_DOCUMENT',
    'PUBLIC_INFO_VIEW'
  ],
  PENGURUS: [
    'DASHBOARD_VIEW',
    'WARGA_VIEW_LIMITED',
    'VIEW_WARGA',
    'KELUARGA_VIEW_LIMITED',
    'SURAT_VIEW',
    'SURAT_PROCESS',
    'SURAT_GENERATE_PDF',
    'KEUANGAN_VIEW',
    'VIEW_FINANCE',
    'IURAN_VIEW',
    'IURAN_UPDATE',
    'PENGADUAN_VIEW',
    'PENGADUAN_UPDATE',
    'PENGUMUMAN_CREATE',
    'PENGUMUMAN_VIEW',
    'AGENDA_CREATE',
    'AGENDA_VIEW',
    'ARSIP_VIEW_LIMITED',
    'VIEW_DOCUMENT',
    'AI_USE',
    'VERIFY_DOCUMENT',
    'PUBLIC_INFO_VIEW'
  ],
  WARGA: [
    'DASHBOARD_VIEW_LIMITED',
    'SURAT_CREATE',
    'SURAT_VIEW_OWN',
    'IURAN_VIEW_OWN',
    'PENGADUAN_CREATE',
    'PENGADUAN_VIEW_OWN',
    'PENGUMUMAN_VIEW',
    'AGENDA_VIEW',
    'VERIFY_DOCUMENT',
    'AI_USE',
    'PUBLIC_INFO_VIEW'
  ],
  PUBLIC: [
    'PUBLIC_INFO_VIEW',
    'PENGUMUMAN_VIEW',
    'AGENDA_VIEW',
    'VERIFY_DOCUMENT',
    'AI_USE_PUBLIC'
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('ALL')) return true;
  return permissions.includes(permission);
}

// Data Masking Helpers
export function maskNIK(nik: string): string {
  if (!nik || nik.length < 8) return '3507************';
  return nik.substring(0, 4) + '********' + nik.substring(nik.length - 4);
}

export function maskKK(noKk: string): string {
  if (!noKk || noKk.length < 8) return '3507************';
  return noKk.substring(0, 4) + '********' + noKk.substring(noKk.length - 4);
}

export function maskPhone(noHp: string): string {
  if (!noHp || noHp.length < 8) return '08**********';
  return noHp.substring(0, 4) + '****' + noHp.substring(noHp.length - 2);
}

// Aliases for compatibility
export const maskNik = maskNIK;
export const maskNoKk = maskKK;
export const maskNoHp = maskPhone;

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function checkObjectOwnership(userRole: UserRole, ownerId: string, currentUserId: string): boolean {
  if (userRole === 'ADMIN' || userRole === 'KETUA_RT' || userRole === 'PENGURUS') {
    return true;
  }
  return ownerId === currentUserId;
}

// Data Minimization Projections for Tahap 6C
export function projectWargaForRole(warga: Warga, role: UserRole, isOwnRecord: boolean = false): Warga {
  if (role === 'ADMIN' || role === 'KETUA_RT' || isOwnRecord) {
    return warga;
  }

  const canSeeNik = hasPermission(role, 'VIEW_NIK');
  const canSeeKk = hasPermission(role, 'VIEW_KK');
  const canSeePhone = hasPermission(role, 'VIEW_PHONE');

  return {
    ...warga,
    nik: canSeeNik ? warga.nik : maskNIK(warga.nik),
    no_kk: canSeeKk ? warga.no_kk : maskKK(warga.no_kk),
    no_hp: canSeePhone ? warga.no_hp : maskPhone(warga.no_hp),
    email: isOwnRecord || role === 'PENGURUS' ? warga.email : '***@***.com'
  };
}

export function projectKeluargaForRole(kk: Keluarga, role: UserRole, isOwnRecord: boolean = false): Keluarga {
  if (role === 'ADMIN' || role === 'KETUA_RT' || isOwnRecord) {
    return kk;
  }

  const canSeeKk = hasPermission(role, 'VIEW_KK');
  const canSeePhone = hasPermission(role, 'VIEW_PHONE');

  return {
    ...kk,
    no_kk: canSeeKk ? kk.no_kk : maskKK(kk.no_kk),
    no_hp: canSeePhone ? kk.no_hp : maskPhone(kk.no_hp)
  };
}

export function projectSuratForRole(surat: SuratPengantar, role: UserRole, isOwnRecord: boolean = false): SuratPengantar {
  if (role === 'ADMIN' || role === 'KETUA_RT' || role === 'PENGURUS' || isOwnRecord) {
    return surat;
  }

  return {
    ...surat,
    nik_pemohon: maskNIK(surat.nik_pemohon),
    no_kk: maskKK(surat.no_kk)
  };
}

export function projectIuranForRole(iuran: TagihanIuran, role: UserRole, isOwnRecord: boolean = false): TagihanIuran {
  if (role === 'ADMIN' || role === 'KETUA_RT' || role === 'PENGURUS' || isOwnRecord) {
    return iuran;
  }

  return {
    ...iuran,
    nama_kepala_keluarga: isOwnRecord ? iuran.nama_kepala_keluarga : iuran.nama_kepala_keluarga.substring(0, 3) + '***'
  };
}

