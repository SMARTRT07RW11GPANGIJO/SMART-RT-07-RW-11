// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8D AI AUTHORIZATION ENFORCEMENT
// Permissions definition catalog

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

export interface PermissionDefinition {
  key: AIPermission;
  category: 'PUBLIC' | 'PROFILE' | 'RESIDENTIAL' | 'LETTERS' | 'FINANCE' | 'COMPLAINTS' | 'ANNOUNCEMENTS' | 'SYSTEM' | 'AI';
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { key: 'PUBLIC_READ', category: 'PUBLIC', description: 'Membaca pengumuman dan kontak publik RT' },
  { key: 'PROFILE_SELF', category: 'PROFILE', description: 'Membaca profil warga sendiri' },
  { key: 'RESIDENT_READ', category: 'RESIDENTIAL', description: 'Membaca data warga RT untuk pengurus' },
  { key: 'RESIDENT_MANAGE', category: 'RESIDENTIAL', description: 'Mengelola data warga RT' },
  { key: 'LETTER_CREATE', category: 'LETTERS', description: 'Mengajukan surat pengantar baru' },
  { key: 'LETTER_READ_SELF', category: 'LETTERS', description: 'Membaca surat milik sendiri' },
  { key: 'LETTER_READ_ALL', category: 'LETTERS', description: 'Membaca seluruh pengajuan surat warga' },
  { key: 'LETTER_VERIFY', category: 'LETTERS', description: 'Memverifikasi berkas surat warga' },
  { key: 'LETTER_APPROVE', category: 'LETTERS', description: 'Menyetujui dan menandatangani surat pengantar' },
  { key: 'LETTER_DELETE', category: 'LETTERS', description: 'Menghapus arsip surat pengantar' },
  { key: 'PDF_GENERATE', category: 'LETTERS', description: 'Mencetak dokumen PDF surat' },
  { key: 'QR_VERIFY', category: 'PUBLIC', description: 'Memverifikasi keabsahan QR code surat' },
  { key: 'PAYMENT_READ_SELF', category: 'FINANCE', description: 'Membaca riwayat pembayaran iuran sendiri' },
  { key: 'FINANCE_READ', category: 'FINANCE', description: 'Membaca rekapitulasi kas & keuangan RT' },
  { key: 'FINANCE_MANAGE', category: 'FINANCE', description: 'Mengelola transaksi keuangan & iuran' },
  { key: 'COMPLAINT_CREATE', category: 'COMPLAINTS', description: 'Membuat tiket pengaduan baru' },
  { key: 'COMPLAINT_READ_SELF', category: 'COMPLAINTS', description: 'Melihat pengaduan milik sendiri' },
  { key: 'COMPLAINT_MANAGE', category: 'COMPLAINTS', description: 'Merespon dan memproses pengaduan warga' },
  { key: 'ANNOUNCEMENT_CREATE', category: 'ANNOUNCEMENTS', description: 'Membuat draf pengumuman RT' },
  { key: 'ANNOUNCEMENT_PUBLISH', category: 'ANNOUNCEMENTS', description: 'Menerbitkan pengumuman ke seluruh warga' },
  { key: 'AUDIT_READ', category: 'SYSTEM', description: 'Membaca log audit keamanan' },
  { key: 'BACKUP_CREATE', category: 'SYSTEM', description: 'Memicu snapshot backup database' },
  { key: 'BACKUP_RESTORE', category: 'SYSTEM', description: 'Melakukan restore database dari backup' },
  { key: 'AI_CHAT', category: 'AI', description: 'Berinteraksi dengan AI Assistant' },
  { key: 'AI_ADMIN_TOOLS', category: 'AI', description: 'Mengakses menu administrasi AI' }
];
