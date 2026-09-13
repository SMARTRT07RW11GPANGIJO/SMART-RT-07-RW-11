import { Warga } from '../types/rt';

export type DashboardFilterValue = string;

export interface DashboardFilterState {
  blok: DashboardFilterValue;
  statusDomisili: DashboardFilterValue;
  jenisKelamin: DashboardFilterValue;
  kelompokUsia: DashboardFilterValue;
  pendidikan: DashboardFilterValue;
  pekerjaan: DashboardFilterValue;
  statusPerkawinan: DashboardFilterValue;
}

export const DEFAULT_DASHBOARD_FILTER_STATE: DashboardFilterState = {
  blok: 'ALL',
  statusDomisili: 'ALL',
  jenisKelamin: 'ALL',
  kelompokUsia: 'ALL',
  pendidikan: 'ALL',
  pekerjaan: 'ALL',
  statusPerkawinan: 'ALL',
};

export type DashboardCalculationStatus =
  | 'success'
  | 'empty'
  | 'calculation_error';

export interface DashboardCalculationError {
  code: string;
  stage: string;
  message: string;
}

export interface DashboardPopulation {
  totalActive: number;
  totalFiltered: number;
}

export interface DashboardMetadata {
  calculatedAt: string;
  population: DashboardPopulation;
  filterState: DashboardFilterState;
}

export interface MetricCategory {
  count: number;
  percentage: number | null;
  formattedPercentage?: string;
}

export interface DashboardSummary {
  totalWargaAktif: number;
  totalKK: number;
  totalWargaTerfilter: number;
  totalFilterAktif: number;
}

export interface DomisiliMetrics {
  categories: {
    TETAP: MetricCategory;
    KONTRAK_SEWA: MetricCategory;
    KOS: MetricCategory;
  };
  totalValid: number;
  missingCount: number;
}

export interface DemografiMetrics {
  gender: {
    L: MetricCategory;
    P: MetricCategory;
  };
  totalValid: number;
  missingCount: number;
}

export interface UsiaMetrics {
  groups: {
    U1: MetricCategory;
    U2: MetricCategory;
    U3: MetricCategory;
    U4: MetricCategory;
    U5: MetricCategory;
  };
  posyandu: {
    bayi: MetricCategory;
    batita: MetricCategory;
    balita: MetricCategory;
    anak: MetricCategory;
    balitaTotal: MetricCategory;
  };
  totalValid: number;
  invalidOrMissingCount: number;
}

export interface StatusPerkawinanMetrics {
  categories: {
    BELUM_KAWIN: MetricCategory;
    KAWIN: MetricCategory;
    CERAI_HIDUP: MetricCategory;
    CERAI_MATI: MetricCategory;
  };
  totalValid: number;
  missingCount: number;
}

export interface PendidikanMetrics {
  categories: {
    SD: MetricCategory;
    SMP: MetricCategory;
    'SMA/SMK': MetricCategory;
    D1: MetricCategory;
    D2: MetricCategory;
    D3: MetricCategory;
    D4: MetricCategory;
    S1: MetricCategory;
    S2: MetricCategory;
    S3: MetricCategory;
    [key: string]: MetricCategory;
  };
  totalValid: number;
  belumTerisiCount: number;
}

export interface PekerjaanMetrics {
  categories: {
    P1: MetricCategory;
    P2: MetricCategory;
    P3: MetricCategory;
    P4: MetricCategory;
    P5: MetricCategory;
    P6: MetricCategory;
    P7: MetricCategory;
    P8: MetricCategory;
    P9: MetricCategory;
    P10: MetricCategory;
    P11: MetricCategory;
    P12: MetricCategory;
    P13: MetricCategory;
    [key: string]: MetricCategory;
  };
  totalValid: number;
}

export interface BlokMetrics {
  distribution: Record<string, MetricCategory>;
  totalBlok: number;
}

export interface KeluargaMetrics {
  totalKK: number;
  averageMembersPerKK: number;
  membersPerKKDistribution?: Record<string, number>;
  hubunganKeluarga: {
    KEPALA_KELUARGA: MetricCategory;
    ISTRI: MetricCategory;
    ANAK: MetricCategory;
    ORANG_TUA: MetricCategory;
    FAMILI_LAIN: MetricCategory;
    PENYEWA: MetricCategory;
    PENGHUNI_KOS: MetricCategory;
    BELUM_TERVERIFIKASI: MetricCategory;
    [key: string]: MetricCategory;
  };
}

export interface NonTetapMetrics {
  totalNonTetap: number;
  kontrakSewa: MetricCategory;
  kos: MetricCategory;
  byBlock: Record<string, number>;
  ownerDataCompleteness: {
    lengkap: MetricCategory;
    sebagian: MetricCategory;
    tidakAda: MetricCategory;
  };
}

/**
 * Full Dashboard Data Contract v1.0
 * Batch E — Full Metric Engine Implementation
 */
export interface DashboardData {
  metadata: DashboardMetadata;
  summary: DashboardSummary;
  domisili: DomisiliMetrics;
  demografi: DemografiMetrics;
  usia: UsiaMetrics;
  statusPerkawinan: StatusPerkawinanMetrics;
  pendidikan: PendidikanMetrics;
  pekerjaan: PekerjaanMetrics;
  blok: BlokMetrics;
  keluarga: KeluargaMetrics;
  nonTetap: NonTetapMetrics;
}

export interface DashboardCalculationSuccess {
  status: 'success' | 'empty';
  data: DashboardData;
}

export interface DashboardCalculationFailure {
  status: 'calculation_error';
  error: DashboardCalculationError;
}

export type DashboardCalculationResult =
  | DashboardCalculationSuccess
  | DashboardCalculationFailure;

/**
 * Internal validated representation.
 * Tidak ditulis kembali ke SSoT.
 */
export interface ValidatedWarga {
  warga: Warga;
  validId: boolean;
  active: boolean;
}
