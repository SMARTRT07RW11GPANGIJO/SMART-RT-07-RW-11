import { UserRole } from '../types/rt';

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
  | 'PUBLIC_INFO_VIEW';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ['ALL'],
  KETUA_RT: [
    'DASHBOARD_VIEW',
    'WARGA_VIEW',
    'KELUARGA_VIEW',
    'SURAT_VIEW',
    'SURAT_APPROVE',
    'SURAT_REJECT',
    'SURAT_REVOKE',
    'SURAT_GENERATE_PDF',
    'KEUANGAN_VIEW',
    'IURAN_VIEW',
    'PENGADUAN_VIEW',
    'PENGADUAN_UPDATE',
    'PENGUMUMAN_CREATE',
    'PENGUMUMAN_UPDATE',
    'PENGUMUMAN_VIEW',
    'AGENDA_CREATE',
    'AGENDA_VIEW',
    'ARSIP_VIEW',
    'AUDIT_LOG_VIEW',
    'SECURITY_HEALTH_VIEW',
    'BACKUP_CREATE',
    'AI_USE',
    'AI_ADMIN',
    'VERIFY_DOCUMENT',
    'PUBLIC_INFO_VIEW'
  ],
  PENGURUS: [
    'DASHBOARD_VIEW',
    'WARGA_VIEW_LIMITED',
    'KELUARGA_VIEW_LIMITED',
    'SURAT_VIEW',
    'SURAT_PROCESS',
    'SURAT_GENERATE_PDF',
    'KEUANGAN_VIEW',
    'IURAN_VIEW',
    'IURAN_UPDATE',
    'PENGADUAN_VIEW',
    'PENGADUAN_UPDATE',
    'PENGUMUMAN_CREATE',
    'PENGUMUMAN_VIEW',
    'AGENDA_CREATE',
    'AGENDA_VIEW',
    'ARSIP_VIEW_LIMITED',
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

export function maskNik(nik: string): string {
  if (!nik || nik.length < 8) return '3507************';
  return nik.substring(0, 4) + '********' + nik.substring(nik.length - 4);
}

export function maskNoHp(noHp: string): string {
  if (!noHp || noHp.length < 8) return '08**********';
  return noHp.substring(0, 4) + '****' + noHp.substring(noHp.length - 2);
}

export function maskNoKk(noKk: string): string {
  if (!noKk || noKk.length < 8) return '3507************';
  return noKk.substring(0, 4) + '********' + noKk.substring(noKk.length - 4);
}

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
