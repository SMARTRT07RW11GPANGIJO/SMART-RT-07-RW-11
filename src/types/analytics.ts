// SMART RT 07 RW 11 GPA NGIJO - ANALYTICS & EXECUTIVE REPORT TYPES
// Change Request: CR-SMART-RT-ANALYTICS-001

import { UserRole } from './rt';

export type ReportType = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export type AttentionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttentionCategory =
  | 'DATA_WARGA_BELUM_LENGKAP'
  | 'FASILITAS_RUSAK_BERAT'
  | 'PEMELIHARAAN_TERTUNDA'
  | 'KEGIATAN_BERISIKO_BENTROK'
  | 'DATA_MEMBUTUHKAN_VERIFIKASI'
  | 'IURAN_MENUNGGAK'
  | 'PENGADUAN_PENDING';

export interface AttentionItem {
  id: string;
  category: AttentionCategory;
  severity: AttentionSeverity;
  title: string;
  description: string;
  count: number;
  source: string;
  generatedAt: string;
  recommendedAction: string;
}

export interface AgeGroupDistribution {
  range: string;
  count: number;
  male: number;
  female: number;
  percentage: number;
}

export interface DemographicAnalytics {
  totalWarga: number;
  totalKK: number;
  gender: {
    lakiLaki: number;
    perempuan: number;
    ratio: string;
    persenLakiLaki: number;
    persenPerempuan: number;
  };
  ageGroups: {
    balita: number; // 0-5
    anak: number;   // 6-12
    remaja: number; // 13-17
    dewasa: number; // 18-59
    lansia: number; // >= 60
  };
  ageDistribution: AgeGroupDistribution[];
  statusAktif: {
    aktif: number;
    nonAktif: number;
    baru: number;
    pindah: number;
    meninggal: number;
  };
  maritalStatus: Record<string, number>;
  religionDistribution: Record<string, number>;
  occupationDistribution: Array<{ name: string; count: number }>;
  educationDistribution: Array<{ name: string; count: number }>;
}

export interface HousingAnalytics {
  pemilik: number;
  kontrak: number;
  kos: number;
  totalHunian: number;
  percentagePemilik: number;
  percentageKontrak: number;
  percentageKos: number;
  byBlok: Array<{
    blok: string;
    pemilik: number;
    kontrak: number;
    kos: number;
    total: number;
  }>;
  trends: Array<{
    period: string;
    pemilik: number;
    kontrak: number;
    kos: number;
  }>;
}

export interface FamilyAnalytics {
  totalKK: number;
  averageMembersPerKK: number;
  minMembers: number;
  maxMembers: number;
  sizeDistribution: {
    kecil: number;  // 1-2 members
    sedang: number; // 3-4 members
    besar: number;  // >= 5 members
  };
  compositionChanges: {
    kepalaKeluargaCount: number;
    istriCount: number;
    anakCount: number;
    lainnyaCount: number;
  };
}

export interface IncompleteResidentDetail {
  id: string;
  nama: string;
  blok: string;
  missingFields: string[];
}

export interface AdminCompletenessAnalytics {
  completenessScorePercent: number;
  wargaWithValidNIK: number;
  wargaWithValidPhone: number;
  wargaWithFullAddress: number;
  wargaPendingVerification: number;
  kkWithValidNumber: number;
  incompleteWargaCount: number;
  incompleteDetails?: IncompleteResidentDetail[];
}

export interface ActivityAnalyticsSummary {
  totalActivities: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  postponed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    total: number;
    completed: number;
  }>;
  activityRateScore: number;
}

export interface FacilityAnalyticsSummary {
  totalFacilities: number;
  activeCount: number;
  maintenanceCount: number;
  inactiveCount: number;
  conditions: {
    baik: number;
    rusakRingan: number;
    rusakSedang: number;
    rusakBerat: number;
  };
  priorities: {
    low: number;
    medium: number;
    high: number;
    emergency: number;
  };
  inspectionCount: number;
  conditionScorePercent: number;
  totalAssetValuation?: number;      // ONLY for ADMIN / KETUA_RT
  formattedAssetValuation?: string;  // ONLY for ADMIN / KETUA_RT
}

export interface ExecutiveAnalyticsOverview {
  generatedAt: string;
  reportPeriod: string;
  projectedRole: UserRole;
  pdpCompliant: boolean;
  demographics: DemographicAnalytics;
  housing: HousingAnalytics;
  family: FamilyAnalytics;
  completeness: AdminCompletenessAnalytics;
  activities: ActivityAnalyticsSummary;
  facilities: FacilityAnalyticsSummary;
  attentionItems: AttentionItem[];
  kpis: {
    totalWarga: number;
    totalKK: number;
    dataCompletenessPercent: number;
    facilityHealthScorePercent: number;
    activityEngagementScore: number;
    urgentAttentionCount: number;
  };
}

export interface ExecutiveReport {
  reportId: string;
  reportType: ReportType;
  period: string;
  startDate: string;
  endDate: string;
  title: string;
  executiveSummary: string;
  demographics: DemographicAnalytics;
  housing: HousingAnalytics;
  family: FamilyAnalytics;
  completeness: AdminCompletenessAnalytics;
  activities: ActivityAnalyticsSummary;
  facilities: FacilityAnalyticsSummary;
  attentionItems: AttentionItem[];
  recommendations: string[];
  generatedAt: string;
  generatorName: string;
  generatorRole: UserRole;
  generatorUserId: string;
  qrVerificationUrl: string;
  verificationToken: string;
  checksum: string;
  isImmutable: boolean;
  revision: number;
  previousRevisionId?: string;
}

export type AnalyticsAuditAction =
  | 'ANALYTICS_VIEWED'
  | 'ANALYTICS_EXPORTED'
  | 'REPORT_GENERATED'
  | 'REPORT_VIEWED'
  | 'REPORT_DOWNLOADED'
  | 'REPORT_REGENERATED'
  | 'UNAUTHORIZED_ANALYTICS_ACCESS'
  | 'UNAUTHORIZED_REPORT_ACCESS';

export interface AnalyticsAuditLog {
  logId: string;
  timestamp: string;
  userId: string;
  role: UserRole;
  action: AnalyticsAuditAction;
  resourceId: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  details: string;
}
