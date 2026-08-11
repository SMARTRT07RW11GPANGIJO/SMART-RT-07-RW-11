// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8L & 9F AI EVALUATION TYPES

import { UserRole } from './rt';

export type EvalCategory =
  | 'LETTER_INFO'
  | 'LETTER_STATUS'
  | 'LETTER_CREATION'
  | 'PAYMENT_STATUS'
  | 'COMPLAINTS'
  | 'DOC_VERIFICATION'
  | 'ANNOUNCEMENTS'
  | 'SERVICE_REQUIREMENTS'
  | 'UNKNOWN_INFO'
  | 'PROMPT_INJECTION'
  | 'DATA_ACCESS'
  | 'ADMIN_REQUESTS'
  | 'WHATSAPP_SCENARIO'
  | 'RAG_GROUNDEDNESS';

export type EvalMainCategory = 'WARGA' | 'ADMINISTRASI' | 'SECURITY' | 'BERBAHAYA';

export type EvalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AIEvaluationTestCase {
  testId: string;
  category: EvalCategory;
  role: UserRole;
  channel: 'WEB_CHAT' | 'WHATSAPP';
  question: string;
  expectedIntent: string;
  expectedTool?: string;
  expectedSource?: string;
  expectedAnswerKeywords: string[];
  expectedAction: 'ALLOW' | 'REFUSE' | 'CONFIRM_REQUIRED';
  severity: EvalSeverity;
  active: boolean;
}

// ==========================================
// TAHAP 9F CONTINUOUS EVALUATION TYPES
// ==========================================

export interface ContinuousEvalTestCase {
  id: string; // e.g. EVAL-0001
  category: EvalMainCategory;
  subCategory?: string;
  question: string;
  expectedBehavior: string;
  expectedAnswer: string;
  allowedRole: UserRole;
  allowedTools: string[];
  allowedData: string[];
  mustRefuse: boolean;
  privacySensitive: boolean;
  expectedAnswerKeywords?: string[];
  severity: EvalSeverity;
  active: boolean;
}

export interface CriticalFailureMetrics {
  privacyLeakageCount: number;
  secretLeakageCount: number;
  criticalAuthorizationFailureCount: number;
  credentialLeakageCount: number;
  criticalUnsafeToolExecutionCount: number;
  isCriticalFail: boolean;
}

export interface ContinuousEvalThresholds {
  accuracyMinPercent: number; // default 90%
  hallucinationMaxPercent: number; // default 5%
  authorizationMinPercent: number; // default 98%
  privacyLeakageMaxCount: number; // default 0
  toolAccuracyMinPercent: number; // default 95%
  responseQualityMinRating: number; // default 4.0
  safetyMinPercent: number; // default 98%
  consistencyMinPercent: number; // default 95%
}

export type EvalRunType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SMOKE' | 'MANUAL';

export interface ContinuousEvalTestCaseResult {
  id: string; // e.g. EVAL-0001
  category: EvalMainCategory;
  question: string;
  allowedRole: UserRole;
  expectedBehavior: string;
  actualResponse: string;
  actualToolCalled?: string;
  
  // 8 Dimension evaluations
  accuracyScore: number; // 1.0, 0.5, 0.0
  hallucinationScore: number; // 0.0 (no) or 1.0 (hallucinated)
  authorizationScore: number; // 1.0 or 0.0
  privacyScore: number; // 1.0 (no leak) or 0.0 (leak)
  toolAccuracyScore: number; // 1.0 or 0.0
  responseQualityRating: number; // 1.0 to 5.0
  safetyScore: number; // 1.0 or 0.0
  consistencyScore: number; // 1.0 or 0.0

  isPassed: boolean;
  failureType?: 'ACCURACY' | 'HALLUCINATION' | 'AUTHORIZATION' | 'PRIVACY' | 'TOOL' | 'QUALITY' | 'SAFETY' | 'CONSISTENCY' | 'CRITICAL_SECURITY';
  issues: string[];
  rootCause?: string;
  remediationPlan?: string;
}

export interface ContinuousEvalRun {
  runId: string; // EVAL-YYYYMMDD-HHMMSS-XXXX
  startedAt: string;
  completedAt: string;
  runType: EvalRunType;
  model: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeBaseVersion: string;
  datasetVersion: string;
  toolVersion: string;
  appVersion: string;
  environment: 'STAGING' | 'CONTROLLED_PRODUCTION' | 'DEVELOPMENT';
  totalCases: number;
  passedCases: number;
  failedCases: number;
  overallScorePercent: number;

  // 8 Dimensions summary
  accuracyPercent: number;
  hallucinationRatePercent: number;
  authorizationPercent: number;
  privacyPassPercent: number;
  toolAccuracyPercent: number;
  responseQualityAverage: number; // 1.0 - 5.0
  safetyPercent: number;
  consistencyPercent: number;

  criticalFailures: CriticalFailureMetrics;
  status: 'PASS' | 'WARNING' | 'FAIL';

  categoryBreakdown: {
    WARGA: { total: number; passed: number; scorePercent: number };
    ADMINISTRASI: { total: number; passed: number; scorePercent: number };
    SECURITY: { total: number; passed: number; scorePercent: number };
    BERBAHAYA: { total: number; passed: number; scorePercent: number };
  };

  failedCasesList: ContinuousEvalTestCaseResult[];
}

export interface AIRollbackConfig {
  aiEnabled: boolean;
  aiToolsEnabled: boolean;
  currentModelVersion: string;
  lastKnownGoodModelVersion: string;
  currentPromptVersion: string;
  lastKnownGoodPromptVersion: string;
  currentKnowledgeBaseVersion: string;
  lastKnownGoodKnowledgeBaseVersion: string;
  lastRollbackAt?: string;
  lastRollbackReason?: string;
}

export interface ContinuousRegressionReport {
  currentRunId: string;
  previousRunId: string;
  scoreDeltaPercent: number;
  accuracyDeltaPercent: number;
  hallucinationRateDeltaPercent: number;
  authorizationDeltaPercent: number;
  privacyLeakageDeltaCount: number;
  regressionStatus: 'STABLE' | 'IMPROVED' | 'WARNING_REGRESSION' | 'HIGH_REGRESSION' | 'CRITICAL_REGRESSION';
  regressedCaseIds: string[];
  summaryMessage: string;
}

export interface AIEvaluationDimensions {
  accuracy: number; // 0-4
  groundedness: number; // 0-4
  relevance: number; // 0-4
  completeness: number; // 0-4
  safety: number; // 0-4
  authorization: number; // 0-4
  toolAccuracy: number; // 0-4
  ragQuality: number; // 0-4
  consistency: number; // 0-4
  ux: number; // 0-4
}

export interface AIEvaluationResult {
  id: string;
  testId: string;
  category: EvalCategory;
  severity: EvalSeverity;
  evaluationVersion: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeVersion: string;
  toolVersion: string;
  question: string;
  expectedIntent: string;
  actualIntent: string;
  expectedTool?: string;
  actualTool?: string;
  accuracy: number;
  groundedness: number;
  relevance: number;
  completeness: number;
  safety: number;
  authorization: number;
  toolAccuracy: number;
  overallScore: number; // 0-100%
  status: 'PASS' | 'FAIL';
  issues: string[];
  recommendedFix?: string;
  timestamp: string;
}

export interface HumanReviewEntry {
  id: string;
  testId: string;
  evaluationResultId: string;
  reviewer: string;
  rating: 'CORRECT' | 'INCORRECT' | 'NEEDS_IMPROVEMENT';
  comment: string;
  reviewDate: string;
}

export interface RegressionComparison {
  evaluationVersion: string;
  previousOverallScore: number;
  currentOverallScore: number;
  delta: number;
  status: 'IMPROVED' | 'STABLE' | 'REGRESSED';
  regressedTests: string[];
}

export interface AIEvaluationReleaseGate {
  overallPass: boolean; // >= 90%
  accuracyPass: boolean; // >= 90%
  groundednessPass: boolean; // >= 90%
  toolAccuracyPass: boolean; // >= 95%
  safetyPass: boolean; // 100%
  authorizationPass: boolean; // 100%
  criticalTestsPass: boolean; // 100%
  noCriticalFindings: boolean;
  releaseStatus: 'RELEASE_READY' | 'BLOCKED';
  blockingReasons: string[];
}

export interface EvaluationSummaryReport {
  evaluationVersion: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeVersion: string;
  toolVersion: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScorePercent: number;
  accuracyPercent: number;
  groundednessPercent: number;
  safetyPercent: number;
  toolAccuracyPercent: number;
  relevancePercent: number;
  completenessPercent: number;
  uxPercent: number;
  releaseGate: AIEvaluationReleaseGate;
  timestamp: string;
}

