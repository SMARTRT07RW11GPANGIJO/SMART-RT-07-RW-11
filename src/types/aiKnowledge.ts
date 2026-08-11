// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9G AI KNOWLEDGE MANAGEMENT TYPES

import { UserRole } from './rt';

export type KnowledgeCategory = 
  | 'AD_ART' 
  | 'SOP' 
  | 'PERATURAN' 
  | 'LAYANAN' 
  | 'FAQ' 
  | 'KONTAK' 
  | 'PENGUMUMAN';

export type KnowledgeStatus = 
  | 'DRAFT' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'ACTIVE' 
  | 'SUPERSEDED' 
  | 'ARCHIVED' 
  | 'REJECTED' 
  | 'KNOWLEDGE_CONFLICT';

export type KnowledgeVisibility = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

export type KnowledgeQualityStatus = 'VALID' | 'INCOMPLETE' | 'OUTDATED' | 'CONFLICT' | 'MISSING_METADATA';

export type SourceType = 'MANUAL' | 'PDF' | 'DOCX' | 'GOOGLE_DRIVE' | 'TXT';

export interface KnowledgeChunk {
  chunkId: string;
  knowledgeId: string;
  version: string;
  category: KnowledgeCategory;
  section: string;
  page?: number;
  content: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  checksum: string;
}

export interface DocumentMetadata {
  knowledgeId: string;         // e.g. "KM-SOP-001"
  title: string;
  category: KnowledgeCategory;
  version: string;             // Major.Minor e.g. "v1.2"
  status: KnowledgeStatus;
  effectiveFrom: string;       // ISO Date YYYY-MM-DD
  effectiveUntil: string | null;// ISO Date YYYY-MM-DD or null
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  uploadedBy: string;
  source: string;              // e.g. "SOP Pelayanan RT No. 01/2026"
  fileId: string;
  mimeType: string;
  checksum: string;            // SHA-256 hash or mock hex
  language: string;            // "id"
  tags: string[];
  priority: number;            // 1 (Highest, e.g. PERATURAN) to 7
  visibility: KnowledgeVisibility;
  content: string;
  summary: string;
  qualityStatus: KnowledgeQualityStatus;
  sourceType: SourceType;
  sourceUrl: string | null;
  chunks: KnowledgeChunk[];
}

export interface KnowledgeRelease {
  releaseId: string;           // e.g. "KB-2026-08-v1.2"
  version: string;
  releasedAt: string;
  releasedBy: string;
  includedKnowledgeIds: string[];
  status: 'ACTIVE' | 'SUPERSEDED' | 'ROLLED_BACK';
  evaluationRunId?: string;
  notes: string;
}

export interface KnowledgeConflictInfo {
  conflictId: string;
  topic: string;
  docAId: string;
  docBId: string;
  category: KnowledgeCategory;
  description: string;
  detectedAt: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface KnowledgeHealthSummary {
  healthScorePercent: number;
  totalDocuments: number;
  activeDocuments: number;
  pendingReview: number;
  supersededDocuments: number;
  archivedDocuments: number;
  expiringDocuments: number;
  conflictCount: number;
  lastReleaseVersion: string;
  ragIndexCount: number;
  qualityBreakdown: {
    valid: number;
    incomplete: number;
    outdated: number;
    conflict: number;
  };
}

export interface KnowledgeDiffResult {
  docAId: string;
  docBId: string;
  addedLines: string[];
  removedLines: string[];
  changedMetadata: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface RAGRetrieveResult {
  found: boolean;
  item: DocumentMetadata | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceCitation: string;
  matchedChunkText?: string;
  rejectionReason?: string;
}
