// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9G AI KNOWLEDGE MANAGEMENT SERVICE

import {
  DocumentMetadata,
  KnowledgeCategory,
  KnowledgeStatus,
  KnowledgeVisibility,
  KnowledgeHealthSummary,
  KnowledgeConflictInfo,
  KnowledgeRelease,
  KnowledgeDiffResult,
  RAGRetrieveResult,
  KnowledgeChunk
} from '../types/aiKnowledge';
import { UserRole } from '../types/rt';
import { logAIAuditEntry } from './aiAuthorizationService';
import { ProductionAlertService } from './productionAlertService';
import { SecurityOperationsService } from './securityOperationsService';
import { ProductionMonitoringService } from './productionMonitoringService';
import { AIContinuousEvaluationService } from './aiContinuousEvaluationService';

const KNOWLEDGE_STORE_KEY = 'SMART_RT_AI_KNOWLEDGE_9G_STORE_V1';
const RELEASE_STORE_KEY = 'SMART_RT_AI_KNOWLEDGE_RELEASES_V1';

// INITIAL SEED DATASET FOR ALL 7 CATEGORIES WITH FULL VERSION HISTORY
const INITIAL_KNOWLEDGE_DOCUMENTS: DocumentMetadata[] = [
  // 1. AD_ART (v1.0 SUPERSEDED, v1.2 ACTIVE)
  {
    knowledgeId: 'KM-ADART-001-v1.0',
    title: 'Anggaran Dasar & Anggaran Rumah Tangga RT 07 RW 11',
    category: 'AD_ART',
    version: 'v1.0',
    status: 'SUPERSEDED',
    effectiveFrom: '2024-01-01',
    effectiveUntil: '2026-07-31',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
    approvedAt: '2024-01-01T09:00:00Z',
    approvedBy: 'Sutrisno (Ketua RT 2024)',
    uploadedBy: 'ADMIN',
    source: 'Dokumen Musyawarah Warga RT 07 Tahun 2024',
    fileId: 'DRV-ADART-2024-001',
    mimeType: 'application/pdf',
    checksum: 'a1b2c3d4e5f67890123456789abcdef0',
    language: 'id',
    tags: ['ad_art', 'organisasi', 'hak_warga', 'kewajiban'],
    priority: 2,
    visibility: 'PUBLIC',
    content: 'Anggaran Dasar RT 07 RW 11 Perum GPA Ngijo memuat ketentuan umum keanggotaan warga, kewajiban iuran bulanan Rp 35.000, dan struktur pengurus 3 bidang.',
    summary: 'AD/ART RT 07 versi lama (2024) dengan iuran Rp 35.000.',
    qualityStatus: 'OUTDATED',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/adart-v10-old/view',
    chunks: [
      {
        chunkId: 'CHK-ADART-001-1',
        knowledgeId: 'KM-ADART-001-v1.0',
        version: 'v1.0',
        category: 'AD_ART',
        section: 'Pasal 4 - Iuran Warga',
        content: 'Iuran wajib warga sebesar Rp 35.000 per bulan per KK.',
        effectiveFrom: '2024-01-01',
        effectiveUntil: '2026-07-31',
        checksum: 'a1b2c3d4'
      }
    ]
  },
  {
    knowledgeId: 'KM-ADART-001-v1.2',
    title: 'Anggaran Dasar & Anggaran Rumah Tangga RT 07 RW 11',
    category: 'AD_ART',
    version: 'v1.2',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    approvedAt: '2026-07-30T14:00:00Z',
    approvedBy: 'Sutrisno, M.P. (Ketua RT 07)',
    uploadedBy: 'ADMIN',
    source: 'SK Musyawarah RT 07 RW 11 No. 01/SK-RT/2026',
    fileId: 'DRV-ADART-2026-002',
    mimeType: 'application/pdf',
    checksum: 'f9e8d7c6b5a432100123456789abcdef',
    language: 'id',
    tags: ['ad_art', 'organisasi', 'hak_warga', 'kewajiban', 'iuran_50rb'],
    priority: 2,
    visibility: 'PUBLIC',
    content: 'Anggaran Dasar RT 07 RW 11 Perum GPA Ngijo v1.2 mengatur: 1) Hak & Kewajiban Warga; 2) Iuran wajib warga Rp 50.000 / bulan / KK; 3) Tata cara musyawarah warga; 4) Struktur organisasi pengurus RT 07 terintegrasi digital.',
    summary: 'AD/ART RT 07 v1.2 resmi berlaku mulai 1 Agustus 2026.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/adart-v12-official/view',
    chunks: [
      {
        chunkId: 'CHK-ADART-001-12-1',
        knowledgeId: 'KM-ADART-001-v1.2',
        version: 'v1.2',
        category: 'AD_ART',
        section: 'Pasal 4 - Iuran Kas Warga',
        content: 'Iuran wajib kas warga & kebersihan/keamanan sebesar Rp 50.000 per bulan per KK terhitung 1 Agustus 2026.',
        effectiveFrom: '2026-08-01',
        effectiveUntil: null,
        checksum: 'f9e8d7c6'
      }
    ]
  },

  // 2. SOP (v1.0 SUPERSEDED, v1.2 ACTIVE, v1.3 DRAFT FUTURE EFFECTIVE)
  {
    knowledgeId: 'KM-SOP-001-v1.2',
    title: 'SOP Pelayanan Surat Pengantar & Administrasi Digital',
    category: 'SOP',
    version: 'v1.2',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-07-28T09:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-07-31T16:00:00Z',
    approvedBy: 'Sutrisno, M.P. (Ketua RT 07)',
    uploadedBy: 'Sekretaris RT',
    source: 'SOP Pelayanan Administrasi RT 07 RW 11 GPA Ngijo v1.2',
    fileId: 'DRV-SOP-SURAT-v12',
    mimeType: 'application/pdf',
    checksum: 'c3d4e5f67890123456789abcdef01234',
    language: 'id',
    tags: ['sop', 'surat_pengantar', 'digital_signature', 'qr_code'],
    priority: 3,
    visibility: 'PUBLIC',
    content: 'Prosedur Pelayanan Surat Pengantar RT 07 v1.2: 1) Warga mengajukan lewat Portal Web atau WA Bot; 2) Verifikasi data pemohon oleh Sekretaris/RT; 3) Persetujuan digital Ketua RT; 4) Sistem menerbitkan PDF A4 resmi dengan Stempel Digital, TTD Digital, dan QR Code Verifikasi unik.',
    summary: 'SOP pelayanan surat pengantar digital RT 07 v1.2.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/sop-surat-v12/view',
    chunks: [
      {
        chunkId: 'CHK-SOP-SURAT-12-1',
        knowledgeId: 'KM-SOP-001-v1.2',
        version: 'v1.2',
        category: 'SOP',
        section: 'Prosedur Penerbitan',
        content: 'Penerbitan surat pengantar maksimal 1x24 jam kerja sejak diajukan.',
        effectiveFrom: '2026-08-01',
        effectiveUntil: null,
        checksum: 'c3d4e5f6'
      }
    ]
  },
  {
    knowledgeId: 'KM-SOP-001-v1.3',
    title: 'SOP Pelayanan Surat Pengantar & Administrasi Digital (Revisi September 2026)',
    category: 'SOP',
    version: 'v1.3',
    status: 'APPROVED',
    effectiveFrom: '2026-09-01', // FUTURE EFFECTIVE DATE! AI MUST NOT USE BEFORE 1 SEP 2026!
    effectiveUntil: null,
    createdAt: '2026-08-05T11:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z',
    approvedAt: '2026-08-09T15:00:00Z',
    approvedBy: 'Sutrisno, M.P. (Ketua RT 07)',
    uploadedBy: 'Sekretaris RT',
    source: 'SOP Pelayanan Administrasi RT 07 v1.3 (Draft September)',
    fileId: 'DRV-SOP-SURAT-v13',
    mimeType: 'application/pdf',
    checksum: 'd4e5f67890123456789abcdef0123456',
    language: 'id',
    tags: ['sop', 'surat_pengantar', 'express_approval'],
    priority: 3,
    visibility: 'PUBLIC',
    content: 'Prosedur Pelayanan Surat Pengantar RT 07 v1.3 (Mulai 1 September 2026): Menambahkan fitur persetujuan otomatis AI Express untuk surat tidak bersengketa dalam waktu 15 menit.',
    summary: 'SOP v1.3 belum berlaku sampai 1 September 2026.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/sop-surat-v13/view',
    chunks: [
      {
        chunkId: 'CHK-SOP-SURAT-13-1',
        knowledgeId: 'KM-SOP-001-v1.3',
        version: 'v1.3',
        category: 'SOP',
        section: 'Fitur Express AI',
        content: 'Express AI approval memproses permohonan surat darurat dalam 15 menit.',
        effectiveFrom: '2026-09-01',
        effectiveUntil: null,
        checksum: 'd4e5f678'
      }
    ]
  },

  // 3. PERATURAN (v1.0 ACTIVE)
  {
    knowledgeId: 'KM-PER-001-v1.0',
    title: 'Peraturan Ketertiban, Keamanan & Portal Perum GPA Ngijo',
    category: 'PERATURAN',
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    effectiveUntil: null,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-01-01T10:00:00Z',
    approvedBy: 'Musyawarah Warga RT 07',
    uploadedBy: 'Seksi Keamanan',
    source: 'Peraturan RT 07 RW 11 No. 03/PER-RT/2026',
    fileId: 'DRV-PER-001',
    mimeType: 'application/pdf',
    checksum: 'e5f67890123456789abcdef012345678',
    language: 'id',
    tags: ['peraturan', 'keamanan', 'jam_portal', 'tamu_1x24jam'],
    priority: 1, // Highest
    visibility: 'PUBLIC',
    content: 'Peraturan Keamanan RT 07 RW 11: 1) Portal utama perumahan ditutup jam 23:00 WIB; 2) Tamu menginap >1x24 jam wajib melapor ke Ketua RT/Seksi Keamanan; 3) Kecepatan berkendara di dalam kompleks max 20 km/jam.',
    summary: 'Peraturan keamanan & tertib lingkungan RT 07.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/peraturan-keamanan/view',
    chunks: [
      {
        chunkId: 'CHK-PER-1-1',
        knowledgeId: 'KM-PER-001-v1.0',
        version: 'v1.0',
        category: 'PERATURAN',
        section: 'Pasal 2 - Jam Portal',
        content: 'Portal ditutup jam 23:00 WIB setiap hari.',
        effectiveFrom: '2026-01-01',
        effectiveUntil: null,
        checksum: 'e5f67890'
      }
    ]
  },

  // 4. LAYANAN (v1.1 ACTIVE)
  {
    knowledgeId: 'KM-LAY-001-v1.1',
    title: 'Panduan Layanan Digital & Fasilitas Perumahan RT 07',
    category: 'LAYANAN',
    version: 'v1.1',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
    approvedBy: 'Sutrisno, M.P.',
    uploadedBy: 'ADMIN',
    source: 'Buku Layanan Digital SMART RT 07',
    fileId: 'DRV-LAY-001',
    mimeType: 'application/pdf',
    checksum: 'f67890123456789abcdef0123456789a',
    language: 'id',
    tags: ['layanan', 'surat', 'iuran', 'pengaduan', 'balai_rt'],
    priority: 4,
    visibility: 'PUBLIC',
    content: 'Layanan publik RT 07 mencakup: 1) Surat Pengantar KTP/KK/Nikah/Domisili; 2) Pembayaran Iuran Kas & Sampah; 3) Laporan Pengaduan Sarpras; 4) Peminjaman Balai RT & Tenda Warga.',
    summary: 'Katalog layanan warga RT 07.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/layanan-rt07/view',
    chunks: [
      {
        chunkId: 'CHK-LAY-1-1',
        knowledgeId: 'KM-LAY-001-v1.1',
        version: 'v1.1',
        category: 'LAYANAN',
        section: 'Fasilitas Balai RT',
        content: 'Peminjaman balai RT gratis untuk warga RT 07 dengan reservasi via portal.',
        effectiveFrom: '2026-08-01',
        effectiveUntil: null,
        checksum: 'f6789012'
      }
    ]
  },

  // 5. FAQ (v1.4 ACTIVE)
  {
    knowledgeId: 'KM-FAQ-001-v1.4',
    title: 'FAQ Pertanyaan Sering Diajukan Warga RT 07',
    category: 'FAQ',
    version: 'v1.4',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
    approvedBy: 'Sutrisno, M.P.',
    uploadedBy: 'ADMIN',
    source: 'Database Pertanyaan Warga RT 07',
    fileId: 'DRV-FAQ-001',
    mimeType: 'text/plain',
    checksum: '67890123456789abcdef0123456789ab',
    language: 'id',
    tags: ['faq', 'tanya_jawab', 'iuran', 'surat'],
    priority: 5,
    visibility: 'PUBLIC',
    content: 'Q: Berapa nominal iuran bulanan? A: Rp 50.000 per bulan per KK. Q: Bagaimana cara mendapat surat pengantar? A: Ajukan melalui Portal SMART RT / WA Bot RITA.',
    summary: 'FAQ Resmi Warga RT 07 v1.4.',
    qualityStatus: 'VALID',
    sourceType: 'TXT',
    sourceUrl: null,
    chunks: [
      {
        chunkId: 'CHK-FAQ-1-1',
        knowledgeId: 'KM-FAQ-001-v1.4',
        version: 'v1.4',
        category: 'FAQ',
        section: 'Iuran Bulanan',
        content: 'Iuran kas warga Rp 50.000 / bulan.',
        effectiveFrom: '2026-08-01',
        effectiveUntil: null,
        checksum: '67890123'
      }
    ]
  },

  // 6. KONTAK (v1.1 ACTIVE)
  {
    knowledgeId: 'KM-KTK-001-v1.1',
    title: 'Kontak Resmi Pengurus RT 07 RW 11 GPA Ngijo',
    category: 'KONTAK',
    version: 'v1.1',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
    approvedBy: 'Sutrisno, M.P.',
    uploadedBy: 'ADMIN',
    source: 'Direktori Pengurus RT 07',
    fileId: 'DRV-KTK-001',
    mimeType: 'text/plain',
    checksum: '7890123456789abcdef0123456789abc',
    language: 'id',
    tags: ['kontak', 'ketua_rt', 'sekretaris', 'bendahara', 'email_resmi'],
    priority: 6,
    visibility: 'PUBLIC',
    content: 'Kontak Resmi RT 07: Ketua RT: Bapak Sutrisno, M.P. | Email: rt07rw11.gpa@gmail.com | Jam Sekretariat: 18:30 - 21:00 WIB.',
    summary: 'Kontak pengurus RT 07 RW 11.',
    qualityStatus: 'VALID',
    sourceType: 'TXT',
    sourceUrl: null,
    chunks: []
  },

  // 7. PENGUMUMAN (v1.0 ACTIVE)
  {
    knowledgeId: 'KM-PGM-001-v1.0',
    title: 'Pengumuman Kerja Bakti Masal & Perayaan HUT RI Ke-81',
    category: 'PENGUMUMAN',
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-05',
    effectiveUntil: '2026-08-31',
    createdAt: '2026-08-05T08:00:00Z',
    updatedAt: '2026-08-05T08:00:00Z',
    approvedAt: '2026-08-05T09:00:00Z',
    approvedBy: 'Sutrisno, M.P.',
    uploadedBy: 'Humas RT',
    source: 'Pengumuman Resmi RT 07 No. 08/PGM/2026',
    fileId: 'DRV-PGM-001',
    mimeType: 'application/pdf',
    checksum: '890123456789abcdef0123456789abcd',
    language: 'id',
    tags: ['pengumuman', 'kerja_bakti', 'hut_ri'],
    priority: 7,
    visibility: 'PUBLIC',
    content: 'Kerja bakti pembersihan saluran air & pemasangan bendera HUT RI akan dilaksanakan pada Minggu, 17 Agustus 2026 pukul 07:00 WIB di Balai RT 07.',
    summary: 'Pengumuman kerja bakti HUT RI 2026.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/pgm-hut-ri/view',
    chunks: []
  },

  // 8. INTERNAL SECURITY & PRIVACY RESTRICTED KNOWLEDGE (v1.0 RESTRICTED ACTIVE)
  {
    knowledgeId: 'KM-SOP-SEC-001',
    title: 'SOP Penanganan Insiden Keamanan & Prosedur Eskalasi Admin RT',
    category: 'SOP',
    version: 'v1.0',
    status: 'ACTIVE',
    effectiveFrom: '2026-08-01',
    effectiveUntil: null,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
    approvedBy: 'Sutrisno, M.P.',
    uploadedBy: 'ADMIN',
    source: 'SOP Keamanan Siber & Privasi RT 07',
    fileId: 'DRV-SEC-001',
    mimeType: 'application/pdf',
    checksum: '90123456789abcdef0123456789abcde',
    language: 'id',
    tags: ['restricted', 'security', 'insiden', 'eskalasi'],
    priority: 1,
    visibility: 'RESTRICTED', // RESTRICTED TO ADMIN & KETUA_RT ONLY! WARGA MUST NOT SEE THIS!
    content: 'Prosedur Rahasia Eskalasi Keamanan: Jika terjadi ancaman keamanan fisik atau kebocoran data, Admin wajib menghubungi nomor darurat Polsek Karangploso dan mengaktifkan Lockout Mode di portal.',
    summary: 'SOP Internal Penanganan Kebocoran Data & Insiden.',
    qualityStatus: 'VALID',
    sourceType: 'PDF',
    sourceUrl: 'https://drive.google.com/file/d/sec-sop-restricted/view',
    chunks: []
  }
];

const INITIAL_RELEASES: KnowledgeRelease[] = [
  {
    releaseId: 'KB-2026-08-v1.2',
    version: 'v1.2',
    releasedAt: '2026-08-01T09:00:00Z',
    releasedBy: 'ADMIN (Sutrisno, M.P.)',
    includedKnowledgeIds: ['KM-ADART-001-v1.2', 'KM-SOP-001-v1.2', 'KM-PER-001-v1.0', 'KM-LAY-001-v1.1', 'KM-FAQ-001-v1.4', 'KM-KTK-001-v1.1', 'KM-PGM-001-v1.0'],
    status: 'ACTIVE',
    evaluationRunId: 'EVAL-RUN-20260801-001',
    notes: 'Rilis Knowledge Base 9G perdana memuat aturan iuran Rp 50rb & SOP digital A4.'
  }
];

export class AIKnowledgeManagementService {
  /**
   * Load all documents from LocalStorage / Memory Store
   */
  public static getAllDocuments(): DocumentMetadata[] {
    try {
      const raw = localStorage.getItem(KNOWLEDGE_STORE_KEY);
      if (!raw) return INITIAL_KNOWLEDGE_DOCUMENTS;
      return JSON.parse(raw);
    } catch (err) {
      return INITIAL_KNOWLEDGE_DOCUMENTS;
    }
  }

  /**
   * Save documents to LocalStorage
   */
  public static saveDocuments(docs: DocumentMetadata[]): void {
    localStorage.setItem(KNOWLEDGE_STORE_KEY, JSON.stringify(docs));
  }

  /**
   * Get Knowledge Releases
   */
  public static getReleases(): KnowledgeRelease[] {
    try {
      const raw = localStorage.getItem(RELEASE_STORE_KEY);
      if (!raw) return INITIAL_RELEASES;
      return JSON.parse(raw);
    } catch (err) {
      return INITIAL_RELEASES;
    }
  }

  public static saveReleases(releases: KnowledgeRelease[]): void {
    localStorage.setItem(RELEASE_STORE_KEY, JSON.stringify(releases));
  }

  /**
   * STRICT RAG RETRIEVAL FILTER:
   * Rule: AI ONLY retrieves knowledge where:
   * 1) status === 'ACTIVE'
   * 2) effectiveFrom <= currentDate (YYYY-MM-DD)
   * 3) effectiveUntil === null OR effectiveUntil >= currentDate
   * 4) Authorization check:
   *    - WARGA -> PUBLIC
   *    - PENGURUS -> PUBLIC, INTERNAL
   *    - ADMIN / KETUA_RT -> PUBLIC, INTERNAL, RESTRICTED
   */
  public static getActiveEffectiveKnowledge(
    userRole: UserRole,
    currentDateStr: string = new Date().toISOString().split('T')[0]
  ): DocumentMetadata[] {
    const allDocs = this.getAllDocuments();

    return allDocs.filter((doc) => {
      // 1. Status Filter
      if (doc.status !== 'ACTIVE') return false;

      // 2. Effective From Filter (MUST NOT BE IN FUTURE)
      if (doc.effectiveFrom > currentDateStr) return false;

      // 3. Effective Until Filter (MUST NOT BE EXPIRED)
      if (doc.effectiveUntil && doc.effectiveUntil < currentDateStr) return false;

      // 4. Authorization / Visibility Filter
      if (doc.visibility === 'RESTRICTED' && userRole !== 'ADMIN' && userRole !== 'KETUA_RT') {
        return false;
      }
      if (doc.visibility === 'INTERNAL' && userRole === 'WARGA') {
        return false;
      }

      return true;
    });
  }

  /**
   * RAG Retrieval for AI Assistant (RITA)
   */
  public static ragRetrieveKnowledge(
    query: string,
    userRole: UserRole,
    currentDateStr: string = new Date().toISOString().split('T')[0]
  ): RAGRetrieveResult {
    const queryLower = query.toLowerCase();
    const activeKnowledge = this.getActiveEffectiveKnowledge(userRole, currentDateStr);

    // Sort by Priority (1 highest)
    activeKnowledge.sort((a, b) => a.priority - b.priority);

    const matchedDoc = activeKnowledge.find((doc) => {
      const titleMatch = doc.title.toLowerCase().includes(queryLower);
      const contentMatch = doc.content.toLowerCase().includes(queryLower);
      const tagMatch = doc.tags.some((t) => queryLower.includes(t.toLowerCase()));
      const categoryMatch = doc.category.toLowerCase().includes(queryLower);
      return titleMatch || contentMatch || tagMatch || categoryMatch;
    });

    if (!matchedDoc) {
      return {
        found: false,
        item: null,
        confidence: 'LOW',
        sourceCitation: '',
        rejectionReason: 'Informasi tidak ditemukan dalam Knowledge Base resmi yang aktif & berlaku.'
      };
    }

    const citation = `Sumber: ${matchedDoc.title} (${matchedDoc.version}) | Kategori: ${matchedDoc.category} | Berlaku: ${matchedDoc.effectiveFrom}`;

    return {
      found: true,
      item: matchedDoc,
      confidence: 'HIGH',
      sourceCitation: citation
    };
  }

  /**
   * Create New Knowledge Document (Status: DRAFT)
   */
  public static createDocument(
    data: Partial<DocumentMetadata>,
    actor: string = 'ADMIN'
  ): DocumentMetadata {
    const allDocs = this.getAllDocuments();
    const newDoc: DocumentMetadata = {
      knowledgeId: data.knowledgeId || `KM-${data.category || 'DOC'}-${Date.now().toString().slice(-4)}-${data.version || 'v1.0'}`,
      title: data.title || 'Dokumen Baru Tanpa Judul',
      category: data.category || 'SOP',
      version: data.version || 'v1.0',
      status: 'DRAFT', // ALWAYS DRAFT FIRST! NO AUTOMATIC ACTIVE!
      effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: data.effectiveUntil || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      uploadedBy: actor,
      source: data.source || 'Pengunggahan Manual System',
      fileId: data.fileId || `FILE-${Date.now()}`,
      mimeType: data.mimeType || 'application/pdf',
      checksum: data.checksum || Math.random().toString(16).substring(2, 10) + 'hash2026',
      language: 'id',
      tags: data.tags || ['dokumen_baru'],
      priority: data.priority || 4,
      visibility: data.visibility || 'PUBLIC',
      content: data.content || '',
      summary: data.summary || '',
      qualityStatus: 'VALID',
      sourceType: data.sourceType || 'MANUAL',
      sourceUrl: data.sourceUrl || null,
      chunks: data.chunks || []
    };

    allDocs.push(newDoc);
    this.saveDocuments(allDocs);

    // Audit Entry
    logAIAuditEntry({
      userId: actor,
      role: (actor === 'KETUA_RT' || actor === 'ADMIN' || actor === 'PENGURUS' || actor === 'WARGA') ? actor : 'ADMIN',
      sessionId: 'KM-CREATE-SESSION',
      action: 'KNOWLEDGE_CREATED',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: newDoc.knowledgeId,
      result: 'SUCCESS',
      decision: `Dokumen Knowledge ${newDoc.knowledgeId} (${newDoc.title} ${newDoc.version}) berhasil dibuat DRAFT`
    });

    return newDoc;
  }

  /**
   * Submit Document for Review (DRAFT -> UNDER_REVIEW)
   */
  public static submitForReview(knowledgeId: string, actor: string): DocumentMetadata {
    const allDocs = this.getAllDocuments();
    const doc = allDocs.find((d) => d.knowledgeId === knowledgeId);
    if (!doc) throw new Error(`Dokumen ${knowledgeId} tidak ditemukan.`);

    doc.status = 'UNDER_REVIEW';
    doc.updatedAt = new Date().toISOString();
    this.saveDocuments(allDocs);

    logAIAuditEntry({
      userId: actor,
      role: (actor === 'KETUA_RT' || actor === 'ADMIN' || actor === 'PENGURUS' || actor === 'WARGA') ? actor : 'ADMIN',
      sessionId: 'KM-REVIEW-SESSION',
      action: 'KNOWLEDGE_SUBMITTED',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: knowledgeId,
      result: 'SUCCESS',
      decision: `Dokumen ${knowledgeId} diajukan untuk review oleh ${actor}.`
    });

    return doc;
  }

  /**
   * Approve Document (UNDER_REVIEW / DRAFT -> APPROVED)
   * Require DUAL CONTROL: Only ADMIN or KETUA_RT
   */
  public static approveDocument(
    knowledgeId: string,
    approverRole: UserRole,
    approverName: string
  ): DocumentMetadata {
    if (approverRole !== 'ADMIN' && approverRole !== 'KETUA_RT') {
      throw new Error('Akses Ditolak: Hanya Administrator atau Ketua RT yang berhak menyetujui dokumen resmi.');
    }

    const allDocs = this.getAllDocuments();
    const doc = allDocs.find((d) => d.knowledgeId === knowledgeId);
    if (!doc) throw new Error(`Dokumen ${knowledgeId} tidak ditemukan.`);

    doc.status = 'APPROVED';
    doc.approvedAt = new Date().toISOString();
    doc.approvedBy = `${approverName} (${approverRole})`;
    doc.updatedAt = new Date().toISOString();

    this.saveDocuments(allDocs);

    logAIAuditEntry({
      userId: approverName,
      role: approverRole,
      sessionId: 'KM-APPROVE-SESSION',
      action: 'KNOWLEDGE_APPROVED',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: knowledgeId,
      result: 'SUCCESS',
      decision: `Dokumen ${knowledgeId} disetujui (APPROVED) oleh ${approverName}.`
    });

    return doc;
  }

  /**
   * Activate Document (APPROVED -> ACTIVE)
   * AUTOMATICALLY SUPERSEDES previous active document in same Category / Title!
   * Triggers 9F Evaluation & Cache Invalidation.
   */
  public static activateDocument(knowledgeId: string, actor: string): DocumentMetadata {
    const allDocs = this.getAllDocuments();
    const doc = allDocs.find((d) => d.knowledgeId === knowledgeId);
    if (!doc) throw new Error(`Dokumen ${knowledgeId} tidak ditemukan.`);

    if (doc.status !== 'APPROVED') {
      throw new Error(`Dokumen tidak dapat diaktifkan! Status saat ini (${doc.status}) belum APPROVED.`);
    }

    // AUTOMATIC SUPERSEDE: Find any existing ACTIVE document in the same Category / Title
    allDocs.forEach((existing) => {
      if (
        existing.category === doc.category &&
        existing.status === 'ACTIVE' &&
        existing.knowledgeId !== doc.knowledgeId
      ) {
        existing.status = 'SUPERSEDED';
        existing.effectiveUntil = doc.effectiveFrom;
        existing.updatedAt = new Date().toISOString();

        logAIAuditEntry({
          userId: actor,
          role: 'ADMIN',
          sessionId: 'KM-SUPERSEDE-SESSION',
          action: 'KNOWLEDGE_SUPERSEDED',
          tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
          resourceId: existing.knowledgeId,
          result: 'SUCCESS',
          decision: `Dokumen versi lama ${existing.knowledgeId} (${existing.version}) otomatis diubah ke SUPERSEDED menggantikan oleh ${doc.version}.`
        });
      }
    });

    // Activate target document
    doc.status = 'ACTIVE';
    doc.updatedAt = new Date().toISOString();

    this.saveDocuments(allDocs);

    // Re-index & Cache Invalidation Trigger
    ProductionMonitoringService.recordMetric('rag_cache_invalidation', 1, 'COUNT', { knowledgeId, action: 'ACTIVATED' });

    // Trigger 9F Targeted Evaluation
    try {
      AIContinuousEvaluationService.runEvaluationSuite('SMOKE');
    } catch (err) {
      console.warn('Evaluation trigger note:', err);
    }

    logAIAuditEntry({
      userId: actor,
      role: 'ADMIN',
      sessionId: 'KM-ACTIVATE-SESSION',
      action: 'KNOWLEDGE_ACTIVATED',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: knowledgeId,
      result: 'SUCCESS',
      decision: `Dokumen ${knowledgeId} (${doc.title} ${doc.version}) resmi diaktifkan (ACTIVE).`
    });

    return doc;
  }

  /**
   * Rollback Knowledge Document to a Previous Version
   */
  public static rollbackDocument(
    categoryId: KnowledgeCategory,
    targetKnowledgeId: string,
    actor: string,
    reason: string
  ): DocumentMetadata {
    const allDocs = this.getAllDocuments();
    const targetDoc = allDocs.find((d) => d.knowledgeId === targetKnowledgeId);
    if (!targetDoc) throw new Error(`Dokumen target ${targetKnowledgeId} tidak ditemukan.`);

    // Deactivate current ACTIVE doc in this category
    allDocs.forEach((d) => {
      if (d.category === categoryId && d.status === 'ACTIVE') {
        d.status = 'SUPERSEDED';
        d.updatedAt = new Date().toISOString();
      }
    });

    // Reactivate target doc
    targetDoc.status = 'ACTIVE';
    targetDoc.updatedAt = new Date().toISOString();

    this.saveDocuments(allDocs);

    // Production Alert 9B
    ProductionAlertService.sendAlert({
      title: '🔄 AI Knowledge Rollback Executed',
      severity: 'ERROR',
      component: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      message: `Knowledge Base kategori ${categoryId} di-rollback ke ${targetDoc.version} oleh ${actor}. Alasan: ${reason}`,
      metricValue: 1,
      thresholdValue: 0
    });

    // Audit Entry
    logAIAuditEntry({
      userId: actor,
      role: 'ADMIN',
      sessionId: 'KM-ROLLBACK-SESSION',
      action: 'KNOWLEDGE_ROLLBACK',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: targetDoc.knowledgeId,
      result: 'SUCCESS',
      decision: `Rollback Knowledge Base ${categoryId} ke versi ${targetDoc.version} (${targetDoc.knowledgeId}). Alasan: ${reason}`
    });

    return targetDoc;
  }

  /**
   * Detect Knowledge Conflicts (Overlapping ACTIVE documents in same category)
   */
  public static detectConflicts(): KnowledgeConflictInfo[] {
    const allDocs = this.getAllDocuments();
    const activeDocs = allDocs.filter((d) => d.status === 'ACTIVE');
    const conflicts: KnowledgeConflictInfo[] = [];

    const categoryMap: { [cat: string]: DocumentMetadata[] } = {};
    activeDocs.forEach((doc) => {
      if (!categoryMap[doc.category]) categoryMap[doc.category] = [];
      categoryMap[doc.category].push(doc);
    });

    Object.entries(categoryMap).forEach(([cat, docs]) => {
      if (docs.length > 1) {
        // More than 1 active document in same category -> CONFLICT!
        const c: KnowledgeConflictInfo = {
          conflictId: `CONF-${Date.now()}-${cat}`,
          topic: `Ganda Dokumen Aktif pada Kategori ${cat}`,
          docAId: docs[0].knowledgeId,
          docBId: docs[1].knowledgeId,
          category: cat as KnowledgeCategory,
          description: `Terdeteksi 2 dokumen berstatus ACTIVE secara bersamaan pada kategori ${cat} (${docs[0].version} dan ${docs[1].version}). AI tidak boleh memilih secara acak.`,
          detectedAt: new Date().toISOString(),
          status: 'OPEN'
        };
        conflicts.push(c);

        // Notify 9E Security Operations & 9B Production Alert
        SecurityOperationsService.createFinding({
          category: 'AI_SECURITY',
          severity: 'HIGH',
          title: `Konflik Dokumen Knowledge Base (${cat})`,
          description: c.description,
          source: 'REALTIME_ANOMALY',
          affectedService: 'AI Knowledge Management (9G)',
          owner: 'ADMIN',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString()
        });

        ProductionAlertService.sendAlert({
          title: `⚠️ CRITICAL KNOWLEDGE CONFLICT: ${cat}`,
          severity: 'ERROR',
          component: 'AI_KNOWLEDGE_MANAGEMENT_9G',
          message: c.description,
          metricValue: docs.length,
          thresholdValue: 1
        });
      }
    });

    return conflicts;
  }

  /**
   * Compare Document Versions (Diff Analysis)
   */
  public static compareDocuments(docIdA: string, docIdB: string): KnowledgeDiffResult {
    const allDocs = this.getAllDocuments();
    const docA = allDocs.find((d) => d.knowledgeId === docIdA);
    const docB = allDocs.find((d) => d.knowledgeId === docIdB);

    if (!docA || !docB) throw new Error('Dokumen yang dibandingkan tidak ditemukan.');

    const linesA = docA.content.split('\n');
    const linesB = docB.content.split('\n');

    const addedLines = linesB.filter((l) => !linesA.includes(l));
    const removedLines = linesA.filter((l) => !linesB.includes(l));

    const changedMetadata = [];
    if (docA.version !== docB.version) changedMetadata.push({ field: 'version', oldValue: docA.version, newValue: docB.version });
    if (docA.status !== docB.status) changedMetadata.push({ field: 'status', oldValue: docA.status, newValue: docB.status });
    if (docA.effectiveFrom !== docB.effectiveFrom) changedMetadata.push({ field: 'effectiveFrom', oldValue: docA.effectiveFrom, newValue: docB.effectiveFrom });
    if (docA.visibility !== docB.visibility) changedMetadata.push({ field: 'visibility', oldValue: docA.visibility, newValue: docB.visibility });

    return {
      docAId: docA.knowledgeId,
      docBId: docB.knowledgeId,
      addedLines,
      removedLines,
      changedMetadata
    };
  }

  /**
   * Get Overall Knowledge Health Summary
   */
  public static getHealthSummary(): KnowledgeHealthSummary {
    const allDocs = this.getAllDocuments();
    const conflicts = this.detectConflicts();
    const currentDate = new Date().toISOString().split('T')[0];

    const activeDocs = allDocs.filter((d) => d.status === 'ACTIVE');
    const pendingReview = allDocs.filter((d) => d.status === 'UNDER_REVIEW' || d.status === 'DRAFT');
    const supersededDocs = allDocs.filter((d) => d.status === 'SUPERSEDED');
    const archivedDocs = allDocs.filter((d) => d.status === 'ARCHIVED');

    const expiringDocs = activeDocs.filter((d) => {
      if (!d.effectiveUntil) return false;
      const daysLeft = (new Date(d.effectiveUntil).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return daysLeft > 0 && daysLeft <= 30;
    });

    const validCount = allDocs.filter((d) => d.qualityStatus === 'VALID').length;
    const incompleteCount = allDocs.filter((d) => d.qualityStatus === 'INCOMPLETE').length;
    const outdatedCount = allDocs.filter((d) => d.qualityStatus === 'OUTDATED').length;

    // Calculate Health Score (100% minus deductions for conflicts/outdated/unapproved)
    let healthScore = 100;
    if (conflicts.length > 0) healthScore -= conflicts.length * 20;
    if (outdatedCount > 0) healthScore -= outdatedCount * 5;
    if (healthScore < 0) healthScore = 0;

    const releases = this.getReleases();
    const lastRelease = releases[0]?.version || 'KB-v1.2';

    return {
      healthScorePercent: healthScore,
      totalDocuments: allDocs.length,
      activeDocuments: activeDocs.length,
      pendingReview: pendingReview.length,
      supersededDocuments: supersededDocs.length,
      archivedDocuments: archivedDocs.length,
      expiringDocuments: expiringDocs.length,
      conflictCount: conflicts.length,
      lastReleaseVersion: lastRelease,
      ragIndexCount: activeDocs.reduce((acc, curr) => acc + (curr.chunks.length || 1), 0),
      qualityBreakdown: {
        valid: validCount,
        incomplete: incompleteCount,
        outdated: outdatedCount,
        conflict: conflicts.length
      }
    };
  }

  /**
   * Create Knowledge Release
   */
  public static createRelease(
    version: string,
    notes: string,
    actor: string
  ): KnowledgeRelease {
    const activeDocs = this.getActiveEffectiveKnowledge('ADMIN');
    const release: KnowledgeRelease = {
      releaseId: `KB-REL-${Date.now()}`,
      version: version || `KB-${new Date().toISOString().slice(0, 7)}-${Date.now().toString().slice(-4)}`,
      releasedAt: new Date().toISOString(),
      releasedBy: actor,
      includedKnowledgeIds: activeDocs.map((d) => d.knowledgeId),
      status: 'ACTIVE',
      notes
    };

    const releases = this.getReleases();
    releases.unshift(release);
    this.saveReleases(releases);

    logAIAuditEntry({
      userId: actor,
      role: 'ADMIN',
      sessionId: 'KM-RELEASE-SESSION',
      action: 'KNOWLEDGE_INDEXED',
      tool: 'AI_KNOWLEDGE_MANAGEMENT_9G',
      resourceId: release.releaseId,
      result: 'SUCCESS',
      decision: `Rilis Knowledge Base ${release.version} diterbitkan dengan ${activeDocs.length} dokumen aktif.`
    });

    return release;
  }

  /**
   * Flag Document for Review (Triggered by Feedback 9H)
   */
  public static flagDocumentForReview(
    knowledgeId: string,
    reason: string,
    reviewer: string
  ): void {
    const docs = this.getAllDocuments();
    const doc = docs.find((d) => d.knowledgeId === knowledgeId || d.title.toLowerCase().includes(knowledgeId.toLowerCase()));
    if (doc) {
      doc.status = 'UNDER_REVIEW';
      doc.qualityStatus = 'OUTDATED';
      doc.updatedAt = new Date().toISOString();
      this.saveDocuments(docs);
    }
  }
}
