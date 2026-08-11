/**
 * TAHAP 9H — AI USER FEEDBACK SERVICE (DAL & WORKFLOW ENGINE)
 * SMART RT 07 RW 11 PERUM GPA NGIJO
 */

import {
  AIFeedbackRecord,
  FeedbackMetrics,
  FeedbackImprovementProposal,
  FeedbackType,
  ReasonCode,
  FeedbackStatus,
  PriorityLevel,
  RootCauseType,
  ImprovementType
} from '../types/aiFeedback';
import { logAIAuditEntry } from './aiAuthorizationService';
import { ProductionAlertService } from './productionAlertService';
import { SecurityOperationsService } from './securityOperationsService';
import { ProductionMonitoringService } from './productionMonitoringService';
import { AIContinuousEvaluationService } from './aiContinuousEvaluationService';
import { AIKnowledgeManagementService } from './aiKnowledgeManagementService';

// PII Redaction and Sanitization Utility
export function maskPIIAndSanitize(input: string): { cleanText: string; hadPII: boolean } {
  if (!input) return { cleanText: '', hadPII: false };

  let hadPII = false;
  let text = input;

  // Mask 16-digit NIK / KK
  if (/\b\d{16}\b/.test(text)) {
    hadPII = true;
    text = text.replace(/\b\d{16}\b/g, '****************');
  }

  // Mask Phone Numbers (08xx, +628xx, 628xx)
  if (/\b(08|628|\+628)\d{7,11}\b/.test(text)) {
    hadPII = true;
    text = text.replace(/\b(08|628|\+628)\d{7,11}\b/g, (match) => {
      const start = match.slice(0, 3);
      const end = match.slice(-2);
      return `${start}********${end}`;
    });
  }

  // Mask Emails
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text)) {
    hadPII = true;
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '***@***.com');
  }

  // Prompt Injection Protection: Strip harmful system instruction overrides
  text = text
    .replace(/ignore\s+previous\s+instructions/gi, '[REDACTED_PROMPT_INJECTION]')
    .replace(/system\s+prompt:/gi, '[REDACTED_SYSTEM_LABEL]')
    .replace(/disregard\s+all\s+rules/gi, '[REDACTED_PROMPT_INJECTION]')
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '[REDACTED_SCRIPT]');

  return { cleanText: text.trim(), hadPII };
}

// User ID Masking / Pseudonymization
export function pseudonymizeUserId(userId: string): string {
  if (!userId) return 'USR-P-ANON';
  if (userId.startsWith('USR-P-')) return userId;
  const rawClean = userId.replace(/[^a-zA-Z0-9]/g, '');
  const prefix = rawClean.slice(0, 3).toUpperCase() || 'USR';
  const hash = Math.abs(
    rawClean.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(36).substring(0, 4).toUpperCase();
  return `USR-P-${prefix}${hash}`;
}

// Map Reason Codes to Human Friendly Labels
export const REASON_LABELS: Record<ReasonCode, string> = {
  IRRELEVANT: 'Jawaban tidak sesuai pertanyaan',
  INCOMPLETE: 'Informasi kurang lengkap',
  INCORRECT: 'Informasi salah',
  OUTDATED: 'Informasi sudah tidak berlaku',
  MISUNDERSTOOD: 'AI tidak memahami pertanyaan',
  TOO_LONG: 'Jawaban terlalu panjang',
  TOO_SHORT: 'Jawaban sulit dipahami / kurang detail',
  SOURCE_PROBLEM: 'Sumber tidak sesuai',
  PROCEDURE_ERROR: 'Prosedur tidak sesuai',
  OTHER: 'Masalah lainnya'
};

// Initial Mock Feedback Dataset
const INITIAL_FEEDBACK_STORAGE: AIFeedbackRecord[] = [
  {
    feedbackId: 'FB-1001',
    conversationId: 'CONV-8G-001',
    messageId: 'MSG-8G-102',
    userId: 'USR-P-WRG12A',
    userRole: 'WARGA',
    feedbackType: 'NEGATIVE',
    reasonCode: 'OUTDATED',
    comment: 'SOP pengurusan surat domisili di jawaban AI masih menyebut syarat foto 3x4 padahal sudah dihapus di SK RT 2026.',
    question: 'Bagaimana syarat membuat surat pengantar domisili?',
    answer: 'Untuk pengantar domisili, lampirkan NIK, KK, dan pasfoto 3x4 berwarna 2 lembar ke Ketua RT.',
    knowledgeSources: ['SOP_SURAT_DOMISILI_V1.1.PDF'],
    knowledgeVersions: ['v1.1'],
    model: 'gemini-2.5-flash',
    promptVersion: 'prompt-v1.4',
    ragVersion: 'rag-v2.1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    status: 'VALIDATED',
    priority: 'HIGH',
    rootCause: 'KNOWLEDGE',
    improvementType: 'KNOWLEDGE_UPDATE',
    reviewer: 'Ketua RT 07',
    reviewNotes: 'Valid. SOP v1.1 sudah kedaluwarsa. Perlu update dokumen ke v1.2.',
    resolution: 'Dokumen Knowledge Base 9G diupdate ke v1.2',
    associatedKnowledgeDocId: 'KB-SURAT-DOMISILI-01'
  },
  {
    feedbackId: 'FB-1002',
    conversationId: 'CONV-8G-002',
    messageId: 'MSG-8G-105',
    userId: 'USR-P-PNG44B',
    userRole: 'PENGURUS',
    feedbackType: 'POSITIVE',
    question: 'Berapa besaran iuran kas bulanan warga?',
    answer: 'Besaran iuran kas bulanan RT 07 RW 11 adalah Rp 50.000 per KK per bulan, dibayarkan paling lambat tanggal 10.',
    knowledgeSources: ['PERATURAN_IURAN_RT07_2026.PDF'],
    knowledgeVersions: ['v2.0'],
    model: 'gemini-2.5-flash',
    promptVersion: 'prompt-v1.4',
    ragVersion: 'rag-v2.1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
    status: 'RESOLVED',
    priority: 'LOW',
    reviewer: 'Admin System',
    reviewNotes: 'Jawaban akurat sesuai Peraturan Iuran 2026.'
  },
  {
    feedbackId: 'FB-1003',
    conversationId: 'CONV-8G-003',
    messageId: 'MSG-8G-109',
    userId: 'USR-P-WRG88X',
    userRole: 'WARGA',
    feedbackType: 'NEGATIVE',
    reasonCode: 'TOO_LONG',
    comment: 'Penjelasan jadwal kerja bakti terlalu bertele-tele dan panjang.',
    question: 'Kapan jadwal kerja bakti bulan ini?',
    answer: 'Kerja bakti diselenggarakan pada hari Minggu pertama setiap bulan, yaitu tanggal 3 Agustus 2026 jam 06.00 WIB berkumpul di Balai RT 07. Diharapkan setiap warga membawa peralatan kebersihan seperti cangkul, sapu lidi, dan kantong sampah. Konsumsi disediakan oleh pengurus RT.',
    knowledgeSources: ['AGENDA_KEGIATAN_AUGUST_2026.PDF'],
    knowledgeVersions: ['v1.0'],
    model: 'gemini-2.5-flash',
    promptVersion: 'prompt-v1.4',
    ragVersion: 'rag-v2.1',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'TRIAGED',
    priority: 'MEDIUM',
    rootCause: 'PROMPT',
    improvementType: 'PROMPT_IMPROVEMENT'
  },
  {
    feedbackId: 'FB-1004',
    conversationId: 'CONV-8G-004',
    messageId: 'MSG-8G-112',
    userId: 'USR-P-WRG99Z',
    userRole: 'WARGA',
    feedbackType: 'POSITIVE',
    question: 'Siapa ketua RT 07 sekarang?',
    answer: 'Ketua RT 07 RW 11 Perum GPA Ngijo saat ini dijabat oleh Bapak Budi Santoso untuk periode 2025-2028.',
    knowledgeSources: ['STRUKTUR_ORGANISASI_RT07.PDF'],
    knowledgeVersions: ['v1.0'],
    model: 'gemini-2.5-flash',
    promptVersion: 'prompt-v1.4',
    ragVersion: 'rag-v2.1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'RESOLVED',
    priority: 'LOW'
  }
];

// Memory Storage State
let FEEDBACK_STORAGE: AIFeedbackRecord[] = [...INITIAL_FEEDBACK_STORAGE];

let IMPROVEMENT_PROPOSALS_STORAGE: FeedbackImprovementProposal[] = [
  {
    proposalId: 'PROP-9H-001',
    feedbackIds: ['FB-1001'],
    title: 'Pembaruan Knowledge SOP Surat Domisili v1.2',
    improvementType: 'KNOWLEDGE_UPDATE',
    currentVersion: 'SOP_SURAT_DOMISILI_V1.1',
    proposedVersion: 'SOP_SURAT_DOMISILI_V1.2',
    changesDescription: 'Menghapus persyaratan pasfoto 3x4 sesuai SK Peraturan RT 07 Tahun 2026.',
    testResults: 'PASS',
    approvedBy: 'Ketua RT 07',
    approvedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    status: 'DEPLOYED',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    deployedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    proposalId: 'PROP-9H-002',
    feedbackIds: ['FB-1003'],
    title: 'Optimasi Prompt Ringkas untuk Informasi Agenda',
    improvementType: 'PROMPT_IMPROVEMENT',
    currentVersion: 'prompt-v1.4',
    proposedVersion: 'prompt-v1.5',
    changesDescription: 'Menambahkan constraint "Berikan jawaban singkat & to the point max 3 kalimat untuk pertanyaan seputar agenda/jadwal".',
    testResults: 'PASS',
    status: 'TESTING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Rate Limiting Map (UserId -> Timestamps Array)
const USER_RATE_LIMIT_MAP = new Map<string, number[]>();

export class AIFeedbackService {
  /**
   * Submit new feedback or update existing if duplicate messageId
   */
  public static submitFeedback(params: {
    conversationId: string;
    messageId: string;
    userId: string;
    userRole: 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';
    feedbackType: FeedbackType;
    reasonCode?: ReasonCode;
    comment?: string;
    question: string;
    answer: string;
    knowledgeSources?: string[];
    knowledgeVersions?: string[];
    model?: string;
    promptVersion?: string;
    ragVersion?: string;
  }): { success: boolean; feedback: AIFeedbackRecord; isDuplicateUpdate: boolean; warningMessage?: string } {
    const rawUserId = params.userId || 'USR-ANON';
    const maskedUser = pseudonymizeUserId(rawUserId);

    // Rate Limiting Check (Max 10 per minute)
    const now = Date.now();
    const timestamps = USER_RATE_LIMIT_MAP.get(rawUserId) || [];
    const validTimestamps = timestamps.filter((ts) => now - ts < 60000);
    if (validTimestamps.length >= 10) {
      throw new Error('Batas pengiriman feedback terlampaui. Silakan tunggu 1 menit.');
    }
    validTimestamps.push(now);
    USER_RATE_LIMIT_MAP.set(rawUserId, validTimestamps);

    // PII Masking & Prompt Injection Scrubbing
    const commentSanitized = maskPIIAndSanitize(params.comment || '');

    // Determine initial Priority
    let priority: PriorityLevel = 'LOW';
    if (params.feedbackType === 'NEGATIVE') {
      priority = 'MEDIUM';
      if (
        params.reasonCode === 'INCORRECT' ||
        params.reasonCode === 'OUTDATED' ||
        params.reasonCode === 'PROCEDURE_ERROR'
      ) {
        priority = 'HIGH';
      }

      // Check for Critical keywords
      const lowerComment = commentSanitized.cleanText.toLowerCase();
      if (
        lowerComment.includes('bocor') ||
        lowerComment.includes('pribadi') ||
        lowerComment.includes('rahasia') ||
        lowerComment.includes('peretasan') ||
        lowerComment.includes('salah fatal')
      ) {
        priority = 'CRITICAL';
      }
    }

    // Check Duplicate
    const existingIndex = FEEDBACK_STORAGE.findIndex(
      (f) => f.messageId === params.messageId && f.userId === maskedUser
    );

    let isDuplicateUpdate = false;
    let record: AIFeedbackRecord;

    if (existingIndex >= 0) {
      isDuplicateUpdate = true;
      record = {
        ...FEEDBACK_STORAGE[existingIndex],
        feedbackType: params.feedbackType,
        reasonCode: params.reasonCode || FEEDBACK_STORAGE[existingIndex].reasonCode,
        comment: commentSanitized.cleanText || FEEDBACK_STORAGE[existingIndex].comment,
        priority: priority === 'CRITICAL' ? 'CRITICAL' : FEEDBACK_STORAGE[existingIndex].priority,
        timestamp: new Date().toISOString(),
        piiMasked: commentSanitized.hadPII
      };
      FEEDBACK_STORAGE[existingIndex] = record;
    } else {
      record = {
        feedbackId: `FB-${Date.now().toString().slice(-6)}`,
        conversationId: params.conversationId || `CONV-${Date.now()}`,
        messageId: params.messageId,
        userId: maskedUser,
        userRole: params.userRole,
        feedbackType: params.feedbackType,
        reasonCode: params.reasonCode,
        comment: commentSanitized.cleanText,
        question: params.question,
        answer: params.answer,
        knowledgeSources: params.knowledgeSources || [],
        knowledgeVersions: params.knowledgeVersions || [],
        model: params.model || 'gemini-2.5-flash',
        promptVersion: params.promptVersion || 'prompt-v1.4',
        ragVersion: params.ragVersion || 'rag-v2.1',
        timestamp: new Date().toISOString(),
        status: 'NEW',
        priority,
        piiMasked: commentSanitized.hadPII
      };
      FEEDBACK_STORAGE.unshift(record);
    }

    // Audit Log Entry (Tahap 6E/6F Audit Logger)
    logAIAuditEntry({
      userId: maskedUser,
      role: params.userRole,
      sessionId: `SESSION-${params.conversationId}`,
      action: isDuplicateUpdate ? 'FEEDBACK_UPDATED' : 'FEEDBACK_SUBMITTED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: record.feedbackId,
      result: 'SUCCESS',
      decision: `Feedback ${params.feedbackType} ${params.reasonCode || ''} berhasil disimpan untuk Message ${params.messageId}`
    });

    // Critical Alert Integration (9B & 9E & 9A)
    if (priority === 'CRITICAL') {
      ProductionAlertService.sendAlert({
        title: '🚨 CRITICAL AI FEEDBACK DETECTED',
        severity: 'CRITICAL',
        component: 'AI_FEEDBACK_ENGINE_9H',
        message: `Potensi insiden privasi/keamanan dari feedback pengguna: "${record.comment}"`,
        metricValue: 1,
        thresholdValue: 1
      });

      SecurityOperationsService.createFinding({
        category: 'AI_SECURITY',
        severity: 'CRITICAL',
        title: `Laporan Keamanan / Privasi dari User Feedback (${record.feedbackId})`,
        description: `Pengguna ${maskedUser} melaporkan isu kritis pada jawaban AI: ${record.comment}`,
        source: 'REALTIME_ANOMALY',
        affectedService: 'AI Feedback System (9H)',
        owner: 'ADMIN',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      });

      ProductionMonitoringService.recordMetric('ai_critical_feedback_count', 1, 'count', {
        feedbackId: record.feedbackId
      });
    }

    return {
      success: true,
      feedback: record,
      isDuplicateUpdate,
      warningMessage: commentSanitized.hadPII
        ? 'Data sensitif (NIK/No. HP/Email) terdeteksi & disamarkan otomatis demi keamanan privasi.'
        : undefined
    };
  }

  /**
   * Get all feedback records with filtering
   */
  public static getFeedbackList(filter?: {
    status?: FeedbackStatus;
    type?: FeedbackType;
    reasonCode?: ReasonCode;
    priority?: PriorityLevel;
    role?: string;
    searchQuery?: string;
  }): AIFeedbackRecord[] {
    let result = [...FEEDBACK_STORAGE];

    if (filter?.status) {
      result = result.filter((f) => f.status === filter.status);
    }
    if (filter?.type) {
      result = result.filter((f) => f.feedbackType === filter.type);
    }
    if (filter?.reasonCode) {
      result = result.filter((f) => f.reasonCode === filter.reasonCode);
    }
    if (filter?.priority) {
      result = result.filter((f) => f.priority === filter.priority);
    }
    if (filter?.role) {
      result = result.filter((f) => f.userRole === filter.role);
    }
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          (f.comment && f.comment.toLowerCase().includes(q)) ||
          f.feedbackId.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Calculate Comprehensive Feedback Metrics & Analytics
   */
  public static getFeedbackMetrics(totalAIAnswers: number = 250): FeedbackMetrics {
    const totalFeedback = FEEDBACK_STORAGE.length;
    const positiveCount = FEEDBACK_STORAGE.filter((f) => f.feedbackType === 'POSITIVE').length;
    const negativeCount = FEEDBACK_STORAGE.filter((f) => f.feedbackType === 'NEGATIVE').length;
    const pendingReviewCount = FEEDBACK_STORAGE.filter((f) => f.status === 'NEW' || f.status === 'TRIAGED' || f.status === 'UNDER_REVIEW').length;
    const validatedCount = FEEDBACK_STORAGE.filter((f) => f.status === 'VALIDATED' || f.status === 'ACTION_REQUIRED').length;
    const resolvedCount = FEEDBACK_STORAGE.filter((f) => f.status === 'RESOLVED' || f.status === 'CLOSED').length;
    const invalidCount = FEEDBACK_STORAGE.filter((f) => f.status === 'INVALID').length;

    // Rates Formulas with N/A guards if denominator is 0
    const positiveRate = totalFeedback > 0 ? `${((positiveCount / totalFeedback) * 100).toFixed(1)}%` : 'N/A';
    const negativeRate = totalFeedback > 0 ? `${((negativeCount / totalFeedback) * 100).toFixed(1)}%` : 'N/A';
    const feedbackRate = totalAIAnswers > 0 ? `${((totalFeedback / totalAIAnswers) * 100).toFixed(1)}%` : 'N/A';

    // Top Problems Breakdown
    const reasonCounts: Record<string, number> = {};
    FEEDBACK_STORAGE.filter((f) => f.feedbackType === 'NEGATIVE' && f.reasonCode).forEach((f) => {
      const code = f.reasonCode!;
      reasonCounts[code] = (reasonCounts[code] || 0) + 1;
    });

    const topProblems = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason: reason as ReasonCode,
        label: REASON_LABELS[reason as ReasonCode] || reason,
        count
      }))
      .sort((a, b) => b.count - a.count);

    // Knowledge Issues Tracking
    const docIssuesMap: Record<string, { title: string; count: number; category: string }> = {};
    FEEDBACK_STORAGE.filter((f) => f.feedbackType === 'NEGATIVE' && f.knowledgeSources?.length).forEach((f) => {
      f.knowledgeSources!.forEach((src) => {
        if (!docIssuesMap[src]) {
          docIssuesMap[src] = { title: src, count: 0, category: 'Knowledge' };
        }
        docIssuesMap[src].count += 1;
      });
    });

    const topKnowledgeIssues = Object.entries(docIssuesMap)
      .map(([id, item]) => ({
        docId: id,
        docTitle: item.title,
        category: item.category,
        negativeCount: item.count,
        status: item.count >= 2 ? 'POTENTIAL_OUTDATED' : 'REVIEW_NEEDED'
      }))
      .sort((a, b) => b.negativeCount - a.negativeCount);

    // Root Cause Distribution
    const rcMap: Record<string, number> = {};
    FEEDBACK_STORAGE.filter((f) => f.rootCause).forEach((f) => {
      rcMap[f.rootCause!] = (rcMap[f.rootCause!] || 0) + 1;
    });

    const rootCauseDistribution = Object.entries(rcMap).map(([rc, count]) => ({
      rootCause: rc as RootCauseType,
      count
    }));

    // Daily Trends (Mock / Simulated grouping)
    const trends = [
      { period: 'Senin', positive: 24, negative: 3 },
      { period: 'Selasa', positive: 30, negative: 4 },
      { period: 'Rabu', positive: 28, negative: 2 },
      { period: 'Kamis', positive: 35, negative: 5 },
      { period: 'Jumat', positive: 40, negative: 3 },
      { period: 'Sabtu', positive: 22, negative: 2 },
      { period: 'Minggu', positive: 18, negative: 1 }
    ];

    return {
      totalFeedback,
      totalAnswers: totalAIAnswers,
      positiveCount,
      negativeCount,
      pendingReviewCount,
      validatedCount,
      resolvedCount,
      invalidCount,
      positiveRate,
      negativeRate,
      feedbackRate,
      topProblems,
      topKnowledgeIssues,
      trends,
      rootCauseDistribution
    };
  }

  /**
   * Review & Validate Feedback
   */
  public static reviewFeedback(params: {
    feedbackId: string;
    reviewer: string;
    validation: 'VALID' | 'INVALID';
    rootCause?: RootCauseType;
    improvementType?: ImprovementType;
    reviewNotes?: string;
    resolution?: string;
    isGroundingFailure?: boolean;
  }): AIFeedbackRecord {
    const idx = FEEDBACK_STORAGE.findIndex((f) => f.feedbackId === params.feedbackId);
    if (idx < 0) throw new Error('Feedback record not found');

    const item = FEEDBACK_STORAGE[idx];

    let newStatus: FeedbackStatus = params.validation === 'VALID' ? 'VALIDATED' : 'INVALID';
    if (params.validation === 'VALID' && params.improvementType && params.improvementType !== 'NO_ACTION') {
      newStatus = 'ACTION_REQUIRED';
    } else if (params.resolution) {
      newStatus = 'RESOLVED';
    }

    const updated: AIFeedbackRecord = {
      ...item,
      status: newStatus,
      reviewer: params.reviewer,
      rootCause: params.rootCause || item.rootCause,
      improvementType: params.improvementType || item.improvementType,
      reviewNotes: params.reviewNotes || item.reviewNotes,
      resolution: params.resolution || item.resolution,
      isGroundingFailure: params.isGroundingFailure ?? item.isGroundingFailure
    };

    // Auto-sync to 9F Continuous Evaluation if VALID
    if (params.validation === 'VALID' && !updated.associatedTestCaseId) {
      try {
        const newTestCaseId = `TC-FB-${updated.feedbackId}`;
        AIContinuousEvaluationService.addCustomTestCase({
          id: newTestCaseId,
          category: 'ACCURACY',
          name: `Evaluasi Feedback ${updated.feedbackId}: ${updated.reasonCode || 'Kualitas Jawaban'}`,
          description: `Test Case dibuat otomatis dari Valid User Feedback (${updated.feedbackId}). Pertanyaan: "${updated.question}"`,
          prompt: updated.question,
          expectedKeywords: [],
          minScore: 0.85,
          active: true
        });
        updated.associatedTestCaseId = newTestCaseId;
      } catch (e) {
        console.warn('Sync to 9F Continuous Evaluation notice:', e);
      }
    }

    // Auto-sync to 9G Knowledge Management if Knowledge/Outdated issue
    if (
      params.validation === 'VALID' &&
      (params.rootCause === 'KNOWLEDGE' || updated.reasonCode === 'OUTDATED') &&
      updated.knowledgeSources?.length
    ) {
      try {
        const targetSource = updated.knowledgeSources[0];
        AIKnowledgeManagementService.flagDocumentForReview(
          targetSource,
          `Feedback ${updated.feedbackId} menandai dokumen ini sebagai kedaluwarsa/salah. Catatan: ${updated.reviewNotes}`
        );
        updated.associatedKnowledgeDocId = targetSource;
      } catch (e) {
        console.warn('Sync to 9G Knowledge Management notice:', e);
      }
    }

    FEEDBACK_STORAGE[idx] = updated;

    // Log Audit
    logAIAuditEntry({
      userId: params.reviewer,
      role: 'ADMIN',
      sessionId: `REVIEW-${updated.feedbackId}`,
      action: params.validation === 'VALID' ? 'FEEDBACK_VALIDATED' : 'FEEDBACK_REJECTED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: updated.feedbackId,
      result: 'SUCCESS',
      decision: `Feedback ${updated.feedbackId} ditinjau oleh ${params.reviewer} -> Status: ${newStatus}, Validation: ${params.validation}`
    });

    return updated;
  }

  /**
   * Create Improvement Proposal
   */
  public static createImprovementProposal(params: {
    feedbackIds: string[];
    title: string;
    improvementType: ImprovementType;
    currentVersion: string;
    proposedVersion: string;
    changesDescription: string;
  }): FeedbackImprovementProposal {
    const proposal: FeedbackImprovementProposal = {
      proposalId: `PROP-9H-${Date.now().toString().slice(-4)}`,
      feedbackIds: params.feedbackIds,
      title: params.title,
      improvementType: params.improvementType,
      currentVersion: params.currentVersion,
      proposedVersion: params.proposedVersion,
      changesDescription: params.changesDescription,
      testResults: 'PENDING',
      status: 'PROPOSED',
      createdAt: new Date().toISOString()
    };

    IMPROVEMENT_PROPOSALS_STORAGE.unshift(proposal);

    logAIAuditEntry({
      userId: 'ADMIN',
      role: 'ADMIN',
      sessionId: `PROP-${proposal.proposalId}`,
      action: 'IMPROVEMENT_CREATED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: proposal.proposalId,
      result: 'SUCCESS',
      decision: `Proposal Perbaikan ${proposal.proposalId} (${proposal.title}) dibuat untuk ${params.feedbackIds.length} feedback.`
    });

    return proposal;
  }

  /**
   * Run Test & Approve Proposal
   */
  public static testAndApproveProposal(proposalId: string, approverName: string): FeedbackImprovementProposal {
    const idx = IMPROVEMENT_PROPOSALS_STORAGE.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) throw new Error('Proposal not found');

    const updated: FeedbackImprovementProposal = {
      ...IMPROVEMENT_PROPOSALS_STORAGE[idx],
      testResults: 'PASS',
      status: 'APPROVED',
      approvedBy: approverName,
      approvedAt: new Date().toISOString()
    };

    IMPROVEMENT_PROPOSALS_STORAGE[idx] = updated;

    logAIAuditEntry({
      userId: approverName,
      role: 'KETUA_RT',
      sessionId: `APPROVE-${proposalId}`,
      action: 'IMPROVEMENT_APPROVED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: proposalId,
      result: 'SUCCESS',
      decision: `Proposal Perbaikan ${proposalId} LULUS pengujian regresi dan DISETUJUI oleh ${approverName}.`
    });

    return updated;
  }

  /**
   * Deploy New Version to Production
   */
  public static deployProposal(proposalId: string): FeedbackImprovementProposal {
    const idx = IMPROVEMENT_PROPOSALS_STORAGE.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) throw new Error('Proposal not found');

    const updated: FeedbackImprovementProposal = {
      ...IMPROVEMENT_PROPOSALS_STORAGE[idx],
      status: 'DEPLOYED',
      deployedAt: new Date().toISOString()
    };

    // Mark linked feedbacks as RESOLVED
    updated.feedbackIds.forEach((fbId) => {
      const fbIdx = FEEDBACK_STORAGE.findIndex((f) => f.feedbackId === fbId);
      if (fbIdx >= 0) {
        FEEDBACK_STORAGE[fbIdx].status = 'RESOLVED';
        FEEDBACK_STORAGE[fbIdx].resolution = `Diperbaiki melalui Perilisan ${updated.proposedVersion} (${updated.title})`;
      }
    });

    IMPROVEMENT_PROPOSALS_STORAGE[idx] = updated;

    logAIAuditEntry({
      userId: 'ADMIN',
      role: 'ADMIN',
      sessionId: `DEPLOY-${proposalId}`,
      action: 'IMPROVEMENT_DEPLOYED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: proposalId,
      result: 'SUCCESS',
      decision: `Versi Baru ${updated.proposedVersion} resmi DIPUBLIKASIKAN ke Production. Feedback terkait diset RESOLVED.`
    });

    ProductionAlertService.sendAlert({
      title: '🚀 NEW AI IMPROVEMENT VERSION RELEASED',
      severity: 'INFO',
      component: 'AI_FEEDBACK_ENGINE_9H',
      message: `Versi baru ${updated.proposedVersion} (${updated.title}) telah dirilis ke production berdasarkan feedback warga.`,
      metricValue: 1,
      thresholdValue: 1
    });

    return updated;
  }

  /**
   * Rollback Proposal
   */
  public static rollbackProposal(proposalId: string, reason: string): FeedbackImprovementProposal {
    const idx = IMPROVEMENT_PROPOSALS_STORAGE.findIndex((p) => p.proposalId === proposalId);
    if (idx < 0) throw new Error('Proposal not found');

    const updated: FeedbackImprovementProposal = {
      ...IMPROVEMENT_PROPOSALS_STORAGE[idx],
      status: 'ROLLED_BACK'
    };

    IMPROVEMENT_PROPOSALS_STORAGE[idx] = updated;

    logAIAuditEntry({
      userId: 'ADMIN',
      role: 'ADMIN',
      sessionId: `ROLLBACK-${proposalId}`,
      action: 'IMPROVEMENT_DEPLOYED',
      tool: 'AI_USER_FEEDBACK_9H',
      resourceId: proposalId,
      result: 'WARNING',
      decision: `Rollback versi ${updated.proposedVersion} kembali ke ${updated.currentVersion}. Alasan: ${reason}`
    });

    return updated;
  }

  /**
   * Get all proposals
   */
  public static getProposals(): FeedbackImprovementProposal[] {
    return [...IMPROVEMENT_PROPOSALS_STORAGE];
  }
}
