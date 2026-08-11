// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Role definitions and permission matrix (Zero Trust / Default Deny / Least Privilege)

import { AIPermission } from './permissions';

export type UserRole = 'ADMIN' | 'KETUA_RT' | 'PENGURUS' | 'WARGA' | 'PUBLIC';

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  permissions: AIPermission[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleConfig> = {
  PUBLIC: {
    role: 'PUBLIC',
    label: 'Publik / Non-Login',
    description: 'Akses terbatas ke informasi publik dan verifikasi QR',
    permissions: [
      'PUBLIC_READ',
      'QR_VERIFY'
    ]
  },
  WARGA: {
    role: 'WARGA',
    label: 'Warga RT 07',
    description: 'Akses layanan mandiri warga (Profil, Surat, Iuran, Pengaduan, Chat AI)',
    permissions: [
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
    ]
  },
  PENGURUS: {
    role: 'PENGURUS',
    label: 'Pengurus RT 07',
    description: 'Pengurus operasional (Verifikasi Surat, Pengaduan, Keuangan, Pengumuman)',
    permissions: [
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
    ]
  },
  KETUA_RT: {
    role: 'KETUA_RT',
    label: 'Ketua RT 07',
    description: 'Kepemimpinan RT (Approval Surat, Kelola Warga, Publikasi Pengumuman, Keuangan)',
    permissions: [
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
    ]
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrator Sistem',
    description: 'Akses penuh administrasi sistem, backup, restore, dan audit log',
    permissions: [
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
  }
};

export function getRolePermissions(role: UserRole): AIPermission[] {
  return ROLE_DEFINITIONS[role]?.permissions || [];
}

export function roleHasPermission(role: UserRole, permission: AIPermission): boolean {
  return getRolePermissions(role).includes(permission);
}
