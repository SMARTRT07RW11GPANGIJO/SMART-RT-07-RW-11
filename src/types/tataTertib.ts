/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Types for MODUL TATA TERTIB WARGA v1.0 (STANDALONE PRODUCTION READY)
 */

import { UserRole } from './rt';

export type TataTertibCategory =
  | 'KEBERSIHAN'
  | 'KEAMANAN'
  | 'KETERTIBAN'
  | 'LINGKUNGAN'
  | 'SOSIAL'
  | 'FASILITAS_UMUM'
  | 'PARKIR'
  | 'HEWAN_PELIHARAAN'
  | 'KEGIATAN_WARGA'
  | 'JAM_ISTIRAHAT'
  | 'SAMPAH'
  | 'UMUM'
  | 'KEWAJIBAN_WARGA'
  | 'TAMU'
  | 'RENOVASI'
  | 'KEUANGAN'
  | 'PELANGGARAN'
  | 'LAINNYA'
  | string; // Support dynamic custom categories

export type TataTertibStatus =
  | 'DRAFT'
  | 'MENUNGGU_PERSETUJUAN'
  | 'AKTIF'
  | 'DITINJAU'
  | 'DIREVISI'
  | 'DIARSIPKAN'
  // Backward compatibility aliases
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REVISED'
  | 'ARCHIVED';

export interface TataTertibCategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  isSystem?: boolean;
  createdAt: string;
}

export interface TataTertibArticle {
  id: string; // e.g. TT-001 or TT-KEB-001
  kode: string; // e.g. TT-KEB-001
  judul: string;
  kategori: TataTertibCategory;
  nomor: string; // e.g. BAB I Pasal 1 / TT-001
  isi: string;
  dasar?: string; // e.g. "Kesepakatan Musyawarah Warga RT 07 RW 11"
  tujuan?: string; // e.g. "Menjaga lingkungan tetap bersih, sehat dan nyaman"
  ruangLingkup?: string; // e.g. "Seluruh warga penghuni, penyewa, dan tamu di lingkungan RT 07"
  kewajiban?: string[]; // e.g. ["Menjaga kebersihan area rumah", "Membuang sampah sesuai jadwal"]
  larangan?: string[]; // e.g. ["Membuang sampah sembarangan", "Membakar sampah di pemukiman"]
  sanksi?: string; // e.g. "Teguran lisan, tertulis, dan denda sosial sesuai kesepakatan RT"
  catatan?: string;
  status: TataTertibStatus;
  versi: string; // e.g. "1.1" / "1.2"
  tanggalBerlaku: string; // e.g. "2026-08-17"
  tanggalBerakhir?: string;
  dibuatOleh: string;
  disetujuiOleh?: string;
  createdAt: string;
  updatedAt: string;
  documentNumber?: string; // e.g. "TT/RT07RW11/KEB/001/2026"
  keywords: string[];

  // Legacy fields preserved for backward compatibility
  number?: string;
  category?: TataTertibCategory;
  title?: string;
  summary?: string;
  content?: string;
  version?: string;
  effectiveDate?: string;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface TataTertibHistory {
  id: string;
  tataTertibId: string;
  version: string;
  changeSummary: string;
  previousVersion: string;
  approvedBy: string;
  approvedAt: string;
  effectiveDate: string;
  reason?: string;
  changesList?: string[];
  createdBy?: string;
}

export interface TataTertibAck {
  id: string;
  tataTertibId: string;
  version: string;
  userId: string;
  userName: string;
  acknowledgedAt: string;
  blokRumah?: string;
}

export interface TataTertibFeedback {
  id: string;
  tataTertibId: string;
  isHelpful: boolean;
  comment?: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

export interface TataTertibSummaryStats {
  activeVersion: string;
  effectiveDate: string;
  totalTataTertib: number;
  activeCount: number;
  draftCount: number;
  pendingCount: number;
  archivedCount: number;
  revisedCount: number;
  totalCategories: number;
  totalWarga: number;
  ackCount: number;
  ackPercentage: number;
  lastUpdatedDate: string;
}

export interface TataTertibConfig {
  documentNumberFormat: string; // e.g. "TT/RT07RW11/{CAT}/{NO}/{YEAR}"
  kopHeaderTitle: string;
  kopSubTitle: string;
  kopLocation: string;
  signingOfficialName: string;
  signingOfficialTitle: string;
  enableWhatsAppNotifications: boolean;
  enableRAGKnowledgeBase: boolean;
}

export type TataTertibTabType =
  | 'DASHBOARD'
  | 'DAFTAR'
  | 'KATEGORI'
  | 'SEARCH'
  | 'PENGUMUMAN'
  | 'RIWAYAT'
  | 'CETAK_PDF'
  | 'PENGATURAN';

export interface TataTertibAuditLog {
  id: string;
  action:
    | 'TATA_TERTIB_CREATED'
    | 'TATA_TERTIB_UPDATED'
    | 'TATA_TERTIB_SUBMITTED'
    | 'TATA_TERTIB_APPROVED'
    | 'TATA_TERTIB_PUBLISHED'
    | 'TATA_TERTIB_ARCHIVED'
    | 'TATA_TERTIB_VERSION_CREATED'
    | 'TATA_TERTIB_PRINTED'
    | 'TATA_TERTIB_PDF_GENERATED'
    | 'TATA_TERTIB_ACCESS_DENIED'
    | 'TATA_TERTIB_CATEGORY_ADDED'
    | 'TATA_TERTIB_ACKNOWLEDGED';
  userId: string;
  userName: string;
  role: string;
  targetId?: string;
  details: string;
  timestamp: string;
  ipDevice?: string;
  result: 'SUCCESS' | 'REJECTED' | 'WARNING';
}
