// SMART RT 07 RW 11 GPA NGIJO - PREDIKSI KEBUTUHAN LAYANAN RT v1.0
// Change Request: CR-SMART-RT-PREDICTION-001
// Type Definitions & Data Contracts

import { UserRole } from './rt';

export type PredictionCategory =
  | 'SURAT_ADMINISTRASI'
  | 'KEGIATAN_WARGA'
  | 'PEMELIHARAAN_FASILITAS'
  | 'PENGADUAN_LINGKUNGAN'
  | 'DATA_WARGA_BARU'
  | 'KAS_OPERASIONAL';

export type PredictionType =
  | 'TREND_SURGE'
  | 'SEASONAL_DEMAND'
  | 'MAINTENANCE_DUE'
  | 'CAPACITY_REACH'
  | 'VERIFICATION_BACKLOG'
  | 'PERIODIC_CYCLE';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export type PredictionStatus = 'GENERATED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'DISMISSED' | 'EXPIRED';

export type DataQualityGrade = 'SUFFICIENT' | 'MARGINAL' | 'INSUFFICIENT';

export interface HistoricalDataPoint {
  label: string;
  value: number;
  changePercent?: number;
}

export interface PredictionItem {
  predictionId: string;
  category: PredictionCategory;
  predictionType: PredictionType;
  title: string;
  description: string;
  period: string; // e.g. 'September - Oktober 2026'
  generatedAt: string;
  modelVersion: string; // e.g. 'v1.0.0-stat-rule'
  featureVersion: string; // e.g. 'fv1.0'
  confidence: number; // 0 - 100
  confidenceLevel: ConfidenceLevel;
  dataQuality: DataQualityGrade;
  dataPointsAnalyzed: number;
  provenance: string; // SSoT source description
  evidence: string[];
  historicalMetrics: HistoricalDataPoint[];
  currentValue: number;
  projectedValue: number;
  projectedUnit: string;
  recommendation: string; // Advisory only
  status: PredictionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface PredictionSummary {
  totalPredictions: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  insufficientDataCount: number;
  underReviewCount: number;
  acceptedCount: number;
  dismissedCount: number;
  predictionsByCategory: Record<PredictionCategory, number>;
  predictionsByConfidence: Record<ConfidenceLevel, number>;
  lastComputedAt: string;
  modelVersion: string;
  isColdStart: boolean;
  overallDataQuality: DataQualityGrade;
}

// Strict PDP Feature Vector - Anonymized & Aggregated counters ONLY. NO NIK/KK/DOB/PHONE.
export interface AnonymizedPredictionFeatureVector {
  featurePeriod: string;
  totalActiveWarga: number;
  totalKK: number;
  monthlyLetterCounts: number[];
  monthlyComplaintCounts: number[];
  monthlyEventCounts: number[];
  unverifiedDataCount: number;
  facilitiesNeedingRepairCount: number;
  housingOwnerRatio: number;
  housingRenterRatio: number;
  elderlyRatio: number;
  youthRatio: number;
  averageFamilySize: number;
  dataCompletenessScore: number;
}

export interface PredictionActorSession {
  userId: string;
  role: UserRole;
  nama?: string;
  rtScope?: string;
}

export type PredictionAuditAction =
  | 'PREDICTION_GENERATED'
  | 'PREDICTION_VIEWED'
  | 'PREDICTION_REVIEWED'
  | 'PREDICTION_ACCEPTED'
  | 'PREDICTION_DISMISSED'
  | 'UNAUTHORIZED_PREDICTION_ACCESS';

export interface PredictionAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  action: PredictionAuditAction;
  predictionId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}
