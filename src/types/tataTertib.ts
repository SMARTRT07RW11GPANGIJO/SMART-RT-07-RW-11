/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Types for MODUL TATA TERTIB WARGA v1.0
 */

import { UserRole } from './rt';

export type TataTertibCategory =
  | 'UMUM'
  | 'KEWAJIBAN_WARGA'
  | 'KEAMANAN'
  | 'KEBERSIHAN'
  | 'PARKIR'
  | 'TAMU'
  | 'KEGIATAN'
  | 'HEWAN'
  | 'RENOVASI'
  | 'KEUANGAN'
  | 'FASILITAS'
  | 'SOSIAL'
  | 'PELANGGARAN';

export type TataTertibStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REVISED'
  | 'ARCHIVED';

export interface TataTertibArticle {
  id: string; // e.g. TT-001
  number: string; // e.g. TT-001
  category: TataTertibCategory;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  status: TataTertibStatus;
  version: string; // e.g. "1.1"
  effectiveDate: string; // e.g. "2026-08-17"
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
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
}

export interface TataTertibAck {
  id: string;
  tataTertibId: string;
  version: string;
  userId: string;
  userName: string;
  acknowledgedAt: string;
}

export interface TataTertibFeedback {
  id: string;
  tataTertibId: string;
  isHelpful: boolean;
  comment?: string;
  userId: string;
  createdAt: string;
}

export interface TataTertibSummaryStats {
  activeVersion: string;
  effectiveDate: string;
  activeCount: number;
  draftCount: number;
  pendingCount: number;
  archivedCount: number;
  totalWarga: number;
  ackCount: number;
  ackPercentage: number;
}
