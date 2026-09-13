import { Warga } from '../types/rt';
import {
  DashboardCalculationResult,
  DashboardData,
  DashboardFilterState,
  DEFAULT_DASHBOARD_FILTER_STATE,
  DashboardCalculationError,
  ValidatedWarga,
  DashboardSummary,
  DashboardMetadata,
  DomisiliMetrics,
  DemografiMetrics,
  UsiaMetrics,
  StatusPerkawinanMetrics,
  PendidikanMetrics,
  PekerjaanMetrics,
  BlokMetrics,
  KeluargaMetrics,
  NonTetapMetrics,
} from './calculationTypes';
import { applyCumulativeFilters } from './filters';
import {
  calcMetricCategory,
  calculateAge,
  classifyAgeGroup,
  classifyPosyandu,
  classifyPendidikanCategory,
  OFFICIAL_PENDIDIKAN_CATEGORIES,
  classifyPekerjaan,
  classifyHubunganKeluarga,
  classifyOwnerCompleteness,
  normalizeBlok,
  normalizeStatusDomisili,
  normalizeJenisKelamin,
  normalizeStatusPerkawinan,
} from './classification';
import { reconcileMetrics } from './reconciliation';

/**
 * 1. normalizeFilterState()
 * Memastikan seluruh 7 filter memiliki nilai.
 * Jika filter tidak tersedia, gunakan 'ALL'.
 */
export function normalizeFilterState(
  filterState?: Partial<DashboardFilterState>
): DashboardFilterState {
  if (!filterState || typeof filterState !== 'object') {
    return { ...DEFAULT_DASHBOARD_FILTER_STATE };
  }

  return {
    blok: filterState.blok ? String(filterState.blok).trim() : 'ALL',
    statusDomisili: filterState.statusDomisili ? String(filterState.statusDomisili).trim() : 'ALL',
    jenisKelamin: filterState.jenisKelamin ? String(filterState.jenisKelamin).trim() : 'ALL',
    kelompokUsia: filterState.kelompokUsia ? String(filterState.kelompokUsia).trim() : 'ALL',
    pendidikan: filterState.pendidikan ? String(filterState.pendidikan).trim() : 'ALL',
    pekerjaan: filterState.pekerjaan ? String(filterState.pekerjaan).trim() : 'ALL',
    statusPerkawinan: filterState.statusPerkawinan ? String(filterState.statusPerkawinan).trim() : 'ALL',
  };
}

/**
 * 2. validateWarga()
 * Validasi minimal:
 * - ID_WARGA tidak kosong
 * - STATUS_WARGA dapat dibaca
 * Return ValidatedWarga.
 */
export function validateWarga(warga: Warga): ValidatedWarga {
  const id = String(warga?.id_warga ?? '').trim();
  const rawStatus = warga?.status_warga;
  const statusReadable = typeof rawStatus === 'string' && rawStatus.trim().length > 0;
  const status = String(rawStatus ?? '').trim().toUpperCase();

  const validId = id.length > 0;
  const active = validId && statusReadable && status === 'AKTIF';

  return {
    warga,
    validId,
    active,
  };
}

/**
 * 3. getActiveWarga()
 * Total Warga Aktif hanya berasal dari record yang:
 * - memiliki ID_WARGA valid/tidak kosong
 * - STATUS_WARGA = AKTIF
 */
export function getActiveWarga(wargaList: Warga[]): Warga[] {
  return wargaList.filter((warga) => {
    const id = String(warga?.id_warga ?? '').trim();
    const status = String(warga?.status_warga ?? '').trim().toUpperCase();
    return id.length > 0 && status === 'AKTIF';
  });
}

/**
 * 4. validateInput()
 * Pastikan wargaList adalah array.
 * Jika input tidak valid: throw error yang jelas.
 */
export function validateInput(wargaList: unknown): asserts wargaList is Warga[] {
  if (!Array.isArray(wargaList)) {
    throw new Error('Input wargaList must be an array.');
  }
}

/**
 * 5. applyDashboardFilters()
 * Batch D: Terapkan 7 official filters secara kumulatif AND.
 */
export function applyDashboardFilters(
  activeWarga: Warga[],
  filterState: DashboardFilterState,
  calculatedAt?: string
): Warga[] {
  return applyCumulativeFilters(activeWarga, filterState, calculatedAt);
}

/**
 * 6. calculateTotalKK()
 * Hitung unique NO_KK dari population yang diproses.
 * NO_KK kosong tidak dihitung sebagai KK.
 */
export function calculateTotalKK(wargaList: Warga[]): number {
  const kkSet = new Set<string>();
  for (const w of wargaList) {
    const noKk = String(w?.no_kk ?? '').trim();
    if (noKk.length > 0) {
      kkSet.add(noKk);
    }
  }
  return kkSet.size;
}

/**
 * 7. countActiveFilters()
 * Hitung berapa dari 7 filter memiliki nilai selain 'ALL'.
 */
export function countActiveFilters(filterState: DashboardFilterState): number {
  let count = 0;
  const filterKeys: (keyof DashboardFilterState)[] = [
    'blok',
    'statusDomisili',
    'jenisKelamin',
    'kelompokUsia',
    'pendidikan',
    'pekerjaan',
    'statusPerkawinan',
  ];

  for (const key of filterKeys) {
    if (filterState[key] && filterState[key] !== 'ALL') {
      count++;
    }
  }

  return count;
}

/**
 * 8. buildSummary()
 */
export function buildSummary(
  totalWargaAktif: number,
  totalKK: number,
  totalWargaTerfilter: number,
  totalFilterAktif: number
): DashboardSummary {
  return {
    totalWargaAktif,
    totalKK,
    totalWargaTerfilter,
    totalFilterAktif,
  };
}

/**
 * 9. buildMetadata()
 */
export function buildMetadata(
  calculatedAt: string,
  totalActive: number,
  totalFiltered: number,
  filterState: DashboardFilterState
): DashboardMetadata {
  return {
    calculatedAt,
    population: {
      totalActive,
      totalFiltered,
    },
    filterState,
  };
}

/**
 * 10. Aggregate Domisili Metrics
 */
function aggregateDomisili(filteredWarga: Warga[]): DomisiliMetrics {
  let countTetap = 0;
  let countKontrak = 0;
  let countKos = 0;
  let missingCount = 0;

  for (const w of filteredWarga) {
    const raw = (w as any).status_tinggal ?? (w as any).STATUS_TINGGAL;
    const domisili = normalizeStatusDomisili(raw);
    if (domisili === 'TETAP') countTetap++;
    else if (domisili === 'KONTRAK_SEWA') countKontrak++;
    else if (domisili === 'KOS') countKos++;
    else missingCount++;
  }

  const totalValid = countTetap + countKontrak + countKos;

  return {
    categories: {
      TETAP: calcMetricCategory(countTetap, totalValid),
      KONTRAK_SEWA: calcMetricCategory(countKontrak, totalValid),
      KOS: calcMetricCategory(countKos, totalValid),
    },
    totalValid,
    missingCount,
  };
}

/**
 * 11. Aggregate Demografi (Gender) Metrics
 */
function aggregateDemografi(filteredWarga: Warga[]): DemografiMetrics {
  let countL = 0;
  let countP = 0;
  let missingCount = 0;

  for (const w of filteredWarga) {
    const gender = normalizeJenisKelamin(w.jenis_kelamin);
    if (gender === 'L') countL++;
    else if (gender === 'P') countP++;
    else missingCount++;
  }

  const totalValid = countL + countP;

  return {
    gender: {
      L: calcMetricCategory(countL, totalValid),
      P: calcMetricCategory(countP, totalValid),
    },
    totalValid,
    missingCount,
  };
}

/**
 * 12. Aggregate Usia Metrics
 */
function aggregateUsia(filteredWarga: Warga[], calculatedAt: string): UsiaMetrics {
  let countU1 = 0;
  let countU2 = 0;
  let countU3 = 0;
  let countU4 = 0;
  let countU5 = 0;

  let countBayi = 0;
  let countBatita = 0;
  let countBalita = 0;
  let countAnak = 0;
  let countBalitaTotal = 0;

  let invalidOrMissingCount = 0;
  let totalValid = 0;

  for (const w of filteredWarga) {
    const age = calculateAge(w.tanggal_lahir, calculatedAt);
    if (age === null || age < 0) {
      invalidOrMissingCount++;
      continue;
    }

    totalValid++;
    const group = classifyAgeGroup(age);
    if (group === 'U1') countU1++;
    else if (group === 'U2') countU2++;
    else if (group === 'U3') countU3++;
    else if (group === 'U4') countU4++;
    else if (group === 'U5') countU5++;

    const posyandu = classifyPosyandu(age);
    if (posyandu.isBayi) countBayi++;
    if (posyandu.isBatita) countBatita++;
    if (posyandu.isBalita) countBalita++;
    if (posyandu.isAnak) countAnak++;
    if (posyandu.isBalitaTotal) countBalitaTotal++;
  }

  return {
    groups: {
      U1: calcMetricCategory(countU1, totalValid),
      U2: calcMetricCategory(countU2, totalValid),
      U3: calcMetricCategory(countU3, totalValid),
      U4: calcMetricCategory(countU4, totalValid),
      U5: calcMetricCategory(countU5, totalValid),
    },
    posyandu: {
      bayi: calcMetricCategory(countBayi, totalValid),
      batita: calcMetricCategory(countBatita, totalValid),
      balita: calcMetricCategory(countBalita, totalValid),
      anak: calcMetricCategory(countAnak, totalValid),
      balitaTotal: calcMetricCategory(countBalitaTotal, totalValid),
    },
    totalValid,
    invalidOrMissingCount,
  };
}

/**
 * 13. Aggregate Status Perkawinan Metrics
 */
function aggregateStatusPerkawinan(filteredWarga: Warga[]): StatusPerkawinanMetrics {
  let countBelumKawin = 0;
  let countKawin = 0;
  let countCeraiHidup = 0;
  let countCeraiMati = 0;
  let missingCount = 0;

  for (const w of filteredWarga) {
    const status = normalizeStatusPerkawinan(w.status_perkawinan);
    if (status === 'BELUM_KAWIN') countBelumKawin++;
    else if (status === 'KAWIN') countKawin++;
    else if (status === 'CERAI_HIDUP') countCeraiHidup++;
    else if (status === 'CERAI_MATI') countCeraiMati++;
    else missingCount++;
  }

  const totalValid = countBelumKawin + countKawin + countCeraiHidup + countCeraiMati;

  return {
    categories: {
      BELUM_KAWIN: calcMetricCategory(countBelumKawin, totalValid),
      KAWIN: calcMetricCategory(countKawin, totalValid),
      CERAI_HIDUP: calcMetricCategory(countCeraiHidup, totalValid),
      CERAI_MATI: calcMetricCategory(countCeraiMati, totalValid),
    },
    totalValid,
    missingCount,
  };
}

/**
 * 14. Aggregate Pendidikan Metrics
 */
function aggregatePendidikan(filteredWarga: Warga[]): PendidikanMetrics {
  const counts: Record<string, number> = {};
  for (const cat of OFFICIAL_PENDIDIKAN_CATEGORIES) {
    counts[cat] = 0;
  }

  let belumTerisiCount = 0;
  let totalValid = 0;

  for (const w of filteredWarga) {
    const { category, isBelumTerisi } = classifyPendidikanCategory(w.pendidikan);
    if (isBelumTerisi || !category) {
      belumTerisiCount++;
    } else {
      counts[category] = (counts[category] || 0) + 1;
      totalValid++;
    }
  }

  const categories: PendidikanMetrics['categories'] = {
    SD: calcMetricCategory(counts['SD'] || 0, totalValid),
    SMP: calcMetricCategory(counts['SMP'] || 0, totalValid),
    'SMA/SMK': calcMetricCategory(counts['SMA/SMK'] || 0, totalValid),
    D1: calcMetricCategory(counts['D1'] || 0, totalValid),
    D2: calcMetricCategory(counts['D2'] || 0, totalValid),
    D3: calcMetricCategory(counts['D3'] || 0, totalValid),
    D4: calcMetricCategory(counts['D4'] || 0, totalValid),
    S1: calcMetricCategory(counts['S1'] || 0, totalValid),
    S2: calcMetricCategory(counts['S2'] || 0, totalValid),
    S3: calcMetricCategory(counts['S3'] || 0, totalValid),
  };

  return {
    categories,
    totalValid,
    belumTerisiCount,
  };
}

/**
 * 15. Aggregate Pekerjaan Metrics (P1–P13)
 */
function aggregatePekerjaan(filteredWarga: Warga[]): PekerjaanMetrics {
  const counts: Record<string, number> = {};
  for (let i = 1; i <= 13; i++) {
    counts[`P${i}`] = 0;
  }

  for (const w of filteredWarga) {
    const pCode = classifyPekerjaan(w.pekerjaan);
    counts[pCode] = (counts[pCode] || 0) + 1;
  }

  const totalValid = filteredWarga.length;
  const categories: PekerjaanMetrics['categories'] = {
    P1: calcMetricCategory(counts['P1'] || 0, totalValid),
    P2: calcMetricCategory(counts['P2'] || 0, totalValid),
    P3: calcMetricCategory(counts['P3'] || 0, totalValid),
    P4: calcMetricCategory(counts['P4'] || 0, totalValid),
    P5: calcMetricCategory(counts['P5'] || 0, totalValid),
    P6: calcMetricCategory(counts['P6'] || 0, totalValid),
    P7: calcMetricCategory(counts['P7'] || 0, totalValid),
    P8: calcMetricCategory(counts['P8'] || 0, totalValid),
    P9: calcMetricCategory(counts['P9'] || 0, totalValid),
    P10: calcMetricCategory(counts['P10'] || 0, totalValid),
    P11: calcMetricCategory(counts['P11'] || 0, totalValid),
    P12: calcMetricCategory(counts['P12'] || 0, totalValid),
    P13: calcMetricCategory(counts['P13'] || 0, totalValid),
  };

  return {
    categories,
    totalValid,
  };
}

/**
 * 16. Aggregate Blok Metrics
 */
function aggregateBlok(filteredWarga: Warga[]): BlokMetrics {
  const counts: Record<string, number> = {};

  for (const w of filteredWarga) {
    const raw = normalizeBlok(w.blok);
    const bKey = raw.length > 0 ? bKeyFormat(raw) : 'BELUM_TERDATA';
    counts[bKey] = (counts[bKey] || 0) + 1;
  }

  const totalFiltered = filteredWarga.length;
  const distribution: Record<string, ReturnType<typeof calcMetricCategory>> = {};
  for (const [key, count] of Object.entries(counts)) {
    distribution[key] = calcMetricCategory(count, totalFiltered);
  }

  return {
    distribution,
    totalBlok: Object.keys(counts).length,
  };
}

function bKeyFormat(cleanBlok: string): string {
  return cleanBlok;
}

/**
 * 17. Aggregate Keluarga Metrics
 */
function aggregateKeluarga(filteredWarga: Warga[]): KeluargaMetrics {
  const kkMembersMap = new Map<string, number>();
  let totalWargaWithKK = 0;

  const hubunganCounts: Record<string, number> = {
    KEPALA_KELUARGA: 0,
    ISTRI: 0,
    ANAK: 0,
    ORANG_TUA: 0,
    FAMILI_LAIN: 0,
    PENYEWA: 0,
    PENGHUNI_KOS: 0,
    BELUM_TERVERIFIKASI: 0,
  };

  for (const w of filteredWarga) {
    const noKk = String(w?.no_kk ?? '').trim();
    if (noKk.length > 0) {
      kkMembersMap.set(noKk, (kkMembersMap.get(noKk) || 0) + 1);
      totalWargaWithKK++;
    }

    const rawHubungan = (w as any).hubunganKeluarga ?? (w as any).HUBUNGAN_KELUARGA;
    const cat = classifyHubunganKeluarga(rawHubungan);
    hubunganCounts[cat] = (hubunganCounts[cat] || 0) + 1;
  }

  const totalKK = kkMembersMap.size;
  const averageMembersPerKK =
    totalKK > 0 ? Math.round((totalWargaWithKK / totalKK) * 10) / 10 : 0;

  const totalFiltered = filteredWarga.length;
  const hubunganKeluarga = {
    KEPALA_KELUARGA: calcMetricCategory(hubunganCounts['KEPALA_KELUARGA'] || 0, totalFiltered),
    ISTRI: calcMetricCategory(hubunganCounts['ISTRI'] || 0, totalFiltered),
    ANAK: calcMetricCategory(hubunganCounts['ANAK'] || 0, totalFiltered),
    ORANG_TUA: calcMetricCategory(hubunganCounts['ORANG_TUA'] || 0, totalFiltered),
    FAMILI_LAIN: calcMetricCategory(hubunganCounts['FAMILI_LAIN'] || 0, totalFiltered),
    PENYEWA: calcMetricCategory(hubunganCounts['PENYEWA'] || 0, totalFiltered),
    PENGHUNI_KOS: calcMetricCategory(hubunganCounts['PENGHUNI_KOS'] || 0, totalFiltered),
    BELUM_TERVERIFIKASI: calcMetricCategory(hubunganCounts['BELUM_TERVERIFIKASI'] || 0, totalFiltered),
  };

  return {
    totalKK,
    averageMembersPerKK,
    hubunganKeluarga,
  };
}

/**
 * 18. Aggregate Non-Tetap Metrics
 * Non-tetap: STATUS_TINGGAL === 'KONTRAK_SEWA' || STATUS_TINGGAL === 'KOS'
 */
function aggregateNonTetap(filteredWarga: Warga[]): NonTetapMetrics {
  let countKontrak = 0;
  let countKos = 0;
  const byBlock: Record<string, number> = {};

  let ownerLengkap = 0;
  let ownerSebagian = 0;
  let ownerTidakAda = 0;

  for (const w of filteredWarga) {
    const rawTinggal = (w as any).status_tinggal ?? (w as any).STATUS_TINGGAL;
    const domisili = normalizeStatusDomisili(rawTinggal);

    if (domisili === 'KONTRAK_SEWA' || domisili === 'KOS') {
      if (domisili === 'KONTRAK_SEWA') countKontrak++;
      if (domisili === 'KOS') countKos++;

      const b = normalizeBlok(w.blok) || 'LAINNYA';
      byBlock[b] = (byBlock[b] || 0) + 1;

      const nama = w.namaPemilikRumah ?? (w as any).NAMA_PEMILIK_RUMAH;
      const telp = w.teleponPemilikRumah ?? (w as any).TELEPON_PEMILIK_RUMAH;
      const comp = classifyOwnerCompleteness(nama, telp);

      if (comp === 'lengkap') ownerLengkap++;
      else if (comp === 'sebagian') ownerSebagian++;
      else ownerTidakAda++;
    }
  }

  const totalNonTetap = countKontrak + countKos;

  return {
    totalNonTetap,
    kontrakSewa: calcMetricCategory(countKontrak, totalNonTetap),
    kos: calcMetricCategory(countKos, totalNonTetap),
    byBlock,
    ownerDataCompleteness: {
      lengkap: calcMetricCategory(ownerLengkap, totalNonTetap),
      sebagian: calcMetricCategory(ownerSebagian, totalNonTetap),
      tidakAda: calcMetricCategory(ownerTidakAda, totalNonTetap),
    },
  };
}

/**
 * PUBLIC FUNCTION: calculateDashboardData()
 * Complete Pipeline:
 * VALIDATE
 * -> ACTIVE
 * -> FILTER
 * -> NORMALIZE & CLASSIFY & AGGREGATE
 * -> DENOMINATE & PERCENTAGE
 * -> RECONCILE
 * -> OUTPUT
 */
export function calculateDashboardData(
  wargaList: Warga[],
  filterState: DashboardFilterState = DEFAULT_DASHBOARD_FILTER_STATE,
  calculatedAt: string = new Date().toISOString()
): DashboardCalculationResult {
  let stage = 'VALIDATE';
  try {
    // 1. VALIDATE
    stage = 'VALIDATE';
    validateInput(wargaList);
    const normalizedFilter = normalizeFilterState(filterState);

    // 2. ACTIVE
    stage = 'ACTIVE';
    const activeWarga = getActiveWarga(wargaList);
    const totalActive = activeWarga.length;

    // 3. FILTER
    stage = 'FILTER';
    const filteredWarga = applyDashboardFilters(activeWarga, normalizedFilter, calculatedAt);
    const totalFiltered = filteredWarga.length;

    // 4. AGGREGATE & CLASSIFY & DENOMINATE & PERCENTAGE
    stage = 'AGGREGATE';
    const totalKK = calculateTotalKK(filteredWarga);
    const totalFilterAktif = countActiveFilters(normalizedFilter);

    const summary = buildSummary(
      totalActive,
      totalKK,
      totalFiltered,
      totalFilterAktif
    );

    const metadata = buildMetadata(
      calculatedAt,
      totalActive,
      totalFiltered,
      normalizedFilter
    );

    const domisili = aggregateDomisili(filteredWarga);
    const demografi = aggregateDemografi(filteredWarga);
    const usia = aggregateUsia(filteredWarga, calculatedAt);
    const statusPerkawinan = aggregateStatusPerkawinan(filteredWarga);
    const pendidikan = aggregatePendidikan(filteredWarga);
    const pekerjaan = aggregatePekerjaan(filteredWarga);
    const blok = aggregateBlok(filteredWarga);
    const keluarga = aggregateKeluarga(filteredWarga);
    const nonTetap = aggregateNonTetap(filteredWarga);

    const data: DashboardData = {
      metadata,
      summary,
      domisili,
      demografi,
      usia,
      statusPerkawinan,
      pendidikan,
      pekerjaan,
      blok,
      keluarga,
      nonTetap,
    };

    // 5. RECONCILE
    stage = 'RECONCILE';
    reconcileMetrics(data);

    // 6. OUTPUT
    stage = 'OUTPUT';
    if (totalFiltered === 0) {
      return {
        status: 'empty',
        data,
      };
    }

    return {
      status: 'success',
      data,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const error: DashboardCalculationError = {
      code: 'CALCULATION_ENGINE_ERROR',
      stage,
      message,
    };
    return {
      status: 'calculation_error',
      error,
    };
  }
}
