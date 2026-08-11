/**
 * TAHAP 9H — USER FEEDBACK SYSTEM TYPES
 * SMART RT 07 RW 11 PERUM GPA NGIJO
 */

export type FeedbackType = 'POSITIVE' | 'NEGATIVE';

export type ReasonCode =
  | 'IRRELEVANT'         // Jawaban tidak sesuai pertanyaan
  | 'INCOMPLETE'         // Informasi kurang lengkap
  | 'INCORRECT'          // Informasi salah
  | 'OUTDATED'           // Informasi sudah tidak berlaku
  | 'MISUNDERSTOOD'      // AI tidak memahami pertanyaan
  | 'TOO_LONG'           // Jawaban terlalu panjang
  | 'TOO_SHORT'          // Jawaban sulit dipahami / kurang detail
  | 'SOURCE_PROBLEM'     // Sumber tidak sesuai
  | 'PROCEDURE_ERROR'    // Prosedur tidak sesuai
  | 'OTHER';             // Masalah lainnya

export type FeedbackStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'INVALID'
  | 'ACTION_REQUIRED'
  | 'RESOLVED'
  | 'CLOSED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RootCauseType =
  | 'MODEL'
  | 'PROMPT'
  | 'RAG'
  | 'KNOWLEDGE'
  | 'AUTHORIZATION'
  | 'TOOL'
  | 'USER_QUERY'
  | 'UI'
  | 'SYSTEM_ERROR';

export type ImprovementType =
  | 'PROMPT_IMPROVEMENT'
  | 'RAG_IMPROVEMENT'
  | 'KNOWLEDGE_UPDATE'
  | 'KNOWLEDGE_VERSION'
  | 'TOOL_IMPROVEMENT'
  | 'UI_IMPROVEMENT'
  | 'MODEL_CONFIGURATION'
  | 'AUTHORIZATION_FIX'
  | 'NO_ACTION';

export interface AIFeedbackRecord {
  feedbackId: string;
  conversationId: string;
  messageId: string;
  userId: string; // Pseudonymous / Masked (e.g., USR-P-***)
  userRole: 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';
  feedbackType: FeedbackType;
  reasonCode?: ReasonCode;
  comment?: string;
  question: string;
  answer: string;
  knowledgeSources?: string[];
  knowledgeVersions?: string[];
  model: string;
  promptVersion: string;
  ragVersion: string;
  timestamp: string;
  status: FeedbackStatus;
  priority: PriorityLevel;
  rootCause?: RootCauseType;
  improvementType?: ImprovementType;
  reviewer?: string;
  reviewNotes?: string;
  resolution?: string;
  associatedTestCaseId?: string; // Sync to 9F Continuous Evaluation
  associatedKnowledgeDocId?: string; // Sync to 9G Knowledge Management
  isGroundingFailure?: boolean;
  piiMasked?: boolean;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  totalAnswers: number;
  positiveCount: number;
  negativeCount: number;
  pendingReviewCount: number;
  validatedCount: number;
  resolvedCount: number;
  invalidCount: number;
  positiveRate: string; // e.g. "85.2%" or "N/A"
  negativeRate: string; // e.g. "14.8%" or "N/A"
  feedbackRate: string; // e.g. "12.5%" or "N/A"
  topProblems: { reason: ReasonCode; label: string; count: number }[];
  topKnowledgeIssues: { docTitle: string; docId: string; category: string; negativeCount: number; status: string }[];
  trends: { period: string; positive: number; negative: number }[];
  rootCauseDistribution: { rootCause: RootCauseType; count: number }[];
}

export interface FeedbackImprovementProposal {
  proposalId: string;
  feedbackIds: string[];
  title: string;
  improvementType: ImprovementType;
  currentVersion: string;
  proposedVersion: string;
  changesDescription: string;
  testResults?: 'PASS' | 'FAIL' | 'PENDING';
  approvedBy?: string;
  approvedAt?: string;
  status: 'PROPOSED' | 'TESTING' | 'APPROVED' | 'DEPLOYED' | 'REJECTED' | 'ROLLED_BACK';
  createdAt: string;
  deployedAt?: string;
}
