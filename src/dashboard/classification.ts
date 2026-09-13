import { MetricCategory } from './calculationTypes';
import {
  calculateAge,
  normalizeBlok,
  normalizeStatusDomisili,
  normalizeJenisKelamin,
  normalizePendidikan,
  classifyPekerjaan,
  normalizeStatusPerkawinan,
} from './filters';

export {
  calculateAge,
  normalizeBlok,
  normalizeStatusDomisili,
  normalizeJenisKelamin,
  normalizePendidikan,
  classifyPekerjaan,
  normalizeStatusPerkawinan,
};

/**
 * Helper to calculate percentage and formatted string:
 * - count / denominator * 100
 * - denominator === 0 -> null, '— / Tidak tersedia'
 * - count === 0 && denominator > 0 -> 0, '0.0%'
 * - Max 1 decimal place
 */
export function calcMetricCategory(count: number, denominator: number): MetricCategory {
  if (denominator <= 0) {
    return {
      count,
      percentage: null,
      formattedPercentage: '— / Tidak tersedia',
    };
  }
  if (count === 0) {
    return {
      count: 0,
      percentage: 0,
      formattedPercentage: '0.0%',
    };
  }
  const pct = Math.round((count / denominator) * 1000) / 10;
  return {
    count,
    percentage: pct,
    formattedPercentage: `${pct.toFixed(1)}%`,
  };
}

/**
 * Classify dynamic age into BPS kelompok utama:
 * U1 Anak = 0–12
 * U2 Remaja = 13–17
 * U3 Dewasa Muda = 18–29
 * U4 Dewasa = 30–59
 * U5 Lansia = >=60
 */
export function classifyAgeGroup(
  age: number | null
): 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | null {
  if (age === null || age < 0) return null;
  if (age <= 12) return 'U1';
  if (age <= 17) return 'U2';
  if (age <= 29) return 'U3';
  if (age <= 59) return 'U4';
  return 'U5';
}

/**
 * Classify dynamic age into Posyandu cohorts:
 * - Bayi = 0–<1
 * - Batita = 1–<3
 * - Balita = 3–<5
 * - Anak = 5–12
 * - Balita total = usia <5
 */
export function classifyPosyandu(age: number | null): {
  isBayi: boolean;
  isBatita: boolean;
  isBalita: boolean;
  isAnak: boolean;
  isBalitaTotal: boolean;
} {
  if (age === null || age < 0) {
    return {
      isBayi: false,
      isBatita: false,
      isBalita: false,
      isAnak: false,
      isBalitaTotal: false,
    };
  }
  return {
    isBayi: age < 1,
    isBatita: age >= 1 && age < 3,
    isBalita: age >= 3 && age < 5,
    isAnak: age >= 5 && age <= 12,
    isBalitaTotal: age < 5,
  };
}

/**
 * Classify Pendidikan into official 10 categories or mark as Belum Terisi:
 * SD, SMP, SMA/SMK, D1, D2, D3, D4, S1, S2, S3
 */
export const OFFICIAL_PENDIDIKAN_CATEGORIES = [
  'SD',
  'SMP',
  'SMA/SMK',
  'D1',
  'D2',
  'D3',
  'D4',
  'S1',
  'S2',
  'S3',
] as const;

export type OfficialPendidikan = typeof OFFICIAL_PENDIDIKAN_CATEGORIES[number];

export function classifyPendidikanCategory(raw?: string): {
  category: OfficialPendidikan | null;
  isBelumTerisi: boolean;
} {
  if (!raw || typeof raw !== 'string') {
    return { category: null, isBelumTerisi: true };
  }
  const clean = raw.trim();
  if (!clean) {
    return { category: null, isBelumTerisi: true };
  }

  const normalized = normalizePendidikan(clean);
  if ((OFFICIAL_PENDIDIKAN_CATEGORIES as readonly string[]).includes(normalized)) {
    return { category: normalized as OfficialPendidikan, isBelumTerisi: false };
  }

  // Any unrecognized or invalid education string is treated as missing / belum terisi for data quality
  return { category: null, isBelumTerisi: true };
}

/**
 * Classify Hubungan Keluarga without inference.
 * Blank/unrecognized = BELUM_TERVERIFIKASI.
 */
export function classifyHubunganKeluarga(
  raw?: string
):
  | 'KEPALA_KELUARGA'
  | 'ISTRI'
  | 'ANAK'
  | 'ORANG_TUA'
  | 'FAMILI_LAIN'
  | 'PENYEWA'
  | 'PENGHUNI_KOS'
  | 'BELUM_TERVERIFIKASI' {
  if (!raw || typeof raw !== 'string') return 'BELUM_TERVERIFIKASI';
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (!clean) return 'BELUM_TERVERIFIKASI';
  if (clean === 'KEPALA_KELUARGA' || clean === 'KEPALA') return 'KEPALA_KELUARGA';
  if (clean === 'ISTRI') return 'ISTRI';
  if (clean === 'ANAK') return 'ANAK';
  if (clean === 'ORANG_TUA' || clean === 'ORANGTUA' || clean === 'AYAH' || clean === 'IBU') return 'ORANG_TUA';
  if (clean === 'FAMILI_LAIN' || clean === 'FAMILI') return 'FAMILI_LAIN';
  if (clean === 'PENYEWA') return 'PENYEWA';
  if (clean === 'PENGHUNI_KOS' || clean === 'KOS') return 'PENGHUNI_KOS';
  return 'BELUM_TERVERIFIKASI';
}

/**
 * Classify owner data completeness for non-tetap residents (Kontrak / Sewa / Kos):
 * - lengkap: both NAMA_PEMILIK_RUMAH and TELEPON_PEMILIK_RUMAH are non-empty
 * - sebagian: exactly one of them is non-empty
 * - tidakAda: both are empty/missing
 */
export function classifyOwnerCompleteness(
  namaPemilik?: string,
  teleponPemilik?: string
): 'lengkap' | 'sebagian' | 'tidakAda' {
  const hasNama = typeof namaPemilik === 'string' && namaPemilik.trim().length > 0;
  const hasTelp = typeof teleponPemilik === 'string' && teleponPemilik.trim().length > 0;

  if (hasNama && hasTelp) return 'lengkap';
  if (hasNama || hasTelp) return 'sebagian';
  return 'tidakAda';
}
