import { Warga } from '../types/rt';
import {
  calculateDashboardData,
  getActiveWarga,
  calculateTotalKK,
} from './calculationEngine';
import {
  DashboardFilterState,
  DEFAULT_DASHBOARD_FILTER_STATE,
  DashboardData,
} from './calculationTypes';
import { reconcileMetrics } from './reconciliation';
import {
  calcMetricCategory,
  classifyPekerjaan,
  classifyHubunganKeluarga,
  classifyOwnerCompleteness,
  classifyPendidikanCategory,
  classifyAgeGroup,
  classifyPosyandu,
} from './classification';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const REF_DATE = '2026-09-08T00:00:00.000Z';

// Sample dataset designed for comprehensive metric testing
const sampleWargaList: Partial<Warga>[] = [
  // 1. Bayi (< 1 yr, 0 yr old) - C-01, TETAP, L, BELUM_KAWIN, Balita, Belum Sekolah, P1
  {
    id_warga: 'W-001',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000001',
    no_kk: '3507120000000001',
    nama_lengkap: 'Bayi Satu',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '2026-01-15', // ~8 months old -> 0 years (Bayi, Balita Total, U1)
    status_perkawinan: 'Belum Kawin',
    pendidikan: '', // Belum Terisi
    pekerjaan: 'Belum Bekerja', // P12
    blok: 'Blok C-01',
    hubunganKeluarga: 'ANAK' as any,
  },
  // 2. Batita (2 yr old) - C-01, TETAP, P, Balita, Belum Terverifikasi hubungan
  {
    id_warga: 'W-002',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000002',
    no_kk: '3507120000000001',
    nama_lengkap: 'Batita Dua',
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2024-03-10', // 2 years old (Batita, Balita Total, U1)
    status_perkawinan: 'Belum Kawin',
    pendidikan: '', // Belum Terisi
    pekerjaan: 'P12',
    blok: 'C-01',
    hubunganKeluarga: '' as any, // blank -> BELUM_TERVERIFIKASI
  },
  // 3. Balita 3-<5 (4 yr old) - C-02, KONTRAK_SEWA, L
  {
    id_warga: 'W-003',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'KONTRAK_SEWA',
    nik: '3507120000000003',
    no_kk: '3507120000000002',
    nama_lengkap: 'Balita Tiga',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '2022-05-15', // 4 years old (Balita 3-<5, Balita Total, U1)
    status_perkawinan: 'Belum Kawin',
    pendidikan: '',
    pekerjaan: 'Pelajar', // P1
    blok: 'C-02',
    hubunganKeluarga: 'ANAK' as any,
    namaPemilikRumah: 'Pak Bambang',
    teleponPemilikRumah: '08123456789', // lengkap
  },
  // 4. Anak 5-12 (8 yr old) - C-02, KONTRAK_SEWA, P
  {
    id_warga: 'W-004',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'KONTRAK_SEWA',
    nik: '3507120000000004',
    no_kk: '3507120000000002',
    nama_lengkap: 'Anak Empat',
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2018-02-10', // 8 years old (Anak, U1)
    status_perkawinan: 'Belum Kawin',
    pendidikan: 'SD',
    pekerjaan: 'Pelajar', // P1
    blok: 'C-02',
    hubunganKeluarga: 'ANAK' as any,
    namaPemilikRumah: 'Pak Bambang',
    teleponPemilikRumah: '', // sebagian
  },
  // 5. U2 Remaja (15 yr old) - C-03, KOS, L
  {
    id_warga: 'W-005',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'KOS',
    nik: '3507120000000005',
    no_kk: '3507120000000003',
    nama_lengkap: 'Remaja Lima',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '2011-04-20', // 15 years old (U2)
    status_perkawinan: 'Belum Kawin',
    pendidikan: 'SMP',
    pekerjaan: 'Siswa', // P1
    blok: 'C-03',
    hubunganKeluarga: 'PENGHUNI_KOS' as any,
    namaPemilikRumah: '',
    teleponPemilikRumah: '', // tidakAda
  },
  // 6. U3 Dewasa Muda (24 yr old) - C-01, TETAP, L
  {
    id_warga: 'W-006',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000006',
    no_kk: '3507120000000001',
    nama_lengkap: 'Dewasa Muda Enam',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '2002-01-05', // 24 years old (U3)
    status_perkawinan: 'Kawin',
    pendidikan: 'S1',
    pekerjaan: 'PNS', // P2
    blok: 'Blok C-01',
    hubunganKeluarga: 'KEPALA_KELUARGA' as any,
  },
  // 7. U4 Dewasa (40 yr old) - C-01, TETAP, P
  {
    id_warga: 'W-007',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000007',
    no_kk: '3507120000000001',
    nama_lengkap: 'Dewasa Tujuh',
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '1986-06-15', // 40 years old (U4)
    status_perkawinan: 'Kawin',
    pendidikan: 'SMA/SMK',
    pekerjaan: 'Ibu Rumah Tangga', // P9
    blok: 'C-01',
    hubunganKeluarga: 'ISTRI' as any,
  },
  // 8. U5 Lansia (65 yr old) - C-03, TETAP, L
  {
    id_warga: 'W-008',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000008',
    no_kk: '3507120000000004',
    nama_lengkap: 'Lansia Delapan',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '1961-03-01', // 65 years old (U5)
    status_perkawinan: 'Cerai Mati',
    pendidikan: 'D3',
    pekerjaan: 'Pensiunan', // P11
    blok: 'C-03',
    hubunganKeluarga: 'KEPALA_KELUARGA' as any,
  },
  // 9. Invalid birth date warga (future date) - C-04, TETAP, P
  {
    id_warga: 'W-009',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000009',
    no_kk: '3507120000000005',
    nama_lengkap: 'Warga Future',
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2030-01-01', // Future date -> invalid
    status_perkawinan: 'Belum Kawin',
    pendidikan: 'S2',
    pekerjaan: 'Dosen', // P6
    blok: 'C-04',
    hubunganKeluarga: 'KEPALA_KELUARGA' as any,
  },
  // 10. Unmappable job citizen - C-04, TETAP, L
  {
    id_warga: 'W-010',
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nik: '3507120000000010',
    no_kk: '3507120000000005',
    nama_lengkap: 'Warga Unmappable',
    jenis_kelamin: 'Laki-Laki',
    tanggal_lahir: '1995-09-08', // 31 years old (U4)
    status_perkawinan: 'Cerai Hidup',
    pendidikan: 'SMA', // maps to SMA/SMK
    pekerjaan: 'Astronaut Galaksi Bima Sakti', // Unmappable -> P13
    blok: 'C-04',
    hubunganKeluarga: 'FAMILI_LAIN' as any,
  },
  // INACTIVE records (must be excluded from active population)
  {
    id_warga: 'W-INACT-01',
    status_warga: 'TIDAK_AKTIF' as any,
    status_tinggal: 'TETAP',
    nama_lengkap: 'Warga Pindah',
  },
  {
    id_warga: 'W-INACT-02',
    status_warga: 'Tetap' as any, // Legacy string, NOT 'AKTIF'
    status_tinggal: 'TETAP',
    nama_lengkap: 'Warga Legacy Tetap',
  },
  {
    id_warga: '', // Empty ID
    status_warga: 'AKTIF' as any,
    status_tinggal: 'TETAP',
    nama_lengkap: 'Warga Tanpa ID',
  },
];

// Execute all 25 tests

// BE-001 Total Warga Aktif
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  assert(res.status === 'success', 'Result must be success');
  if (res.status === 'success') {
    assert(res.data.summary.totalWargaAktif === 10, `Expected 10 active warga, got ${res.data.summary.totalWargaAktif}`);
    assert(res.data.metadata.population.totalActive === 10, 'Metadata totalActive must match 10');
  }
  results.push({ id: 'BE-001', name: 'Total Warga Aktif', passed: true, notes: '10 active citizens, inactive & invalid IDs safely excluded' });
} catch (e: any) {
  results.push({ id: 'BE-001', name: 'Total Warga Aktif', passed: false, notes: e.message });
}

// BE-002 Total KK unique
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Unique KKs in active population: 3507120000000001, ...0002, ...0003, ...0004, ...0005 -> 5 KKs
    assert(res.data.summary.totalKK === 5, `Expected 5 unique KK, got ${res.data.summary.totalKK}`);
    assert(res.data.keluarga.totalKK === 5, 'Keluarga totalKK must match summary');
  }
  results.push({ id: 'BE-002', name: 'Total KK unique', passed: true, notes: '5 unique non-empty KKs recognized' });
} catch (e: any) {
  results.push({ id: 'BE-002', name: 'Total KK unique', passed: false, notes: e.message });
}

// BE-003 Domisili TETAP/KONTRAK_SEWA/KOS
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // TETAP: W-001, W-002, W-006, W-007, W-008, W-009, W-010 = 7
    // KONTRAK_SEWA: W-003, W-004 = 2
    // KOS: W-005 = 1
    const { categories, totalValid } = res.data.domisili;
    assert(totalValid === 10, `Expected 10 valid domisili, got ${totalValid}`);
    assert(categories.TETAP.count === 7, `Expected 7 TETAP, got ${categories.TETAP.count}`);
    assert(categories.TETAP.percentage === 70, `Expected 70% TETAP, got ${categories.TETAP.percentage}`);
    assert(categories.KONTRAK_SEWA.count === 2, `Expected 2 KONTRAK_SEWA, got ${categories.KONTRAK_SEWA.count}`);
    assert(categories.KONTRAK_SEWA.percentage === 20, `Expected 20% KONTRAK_SEWA, got ${categories.KONTRAK_SEWA.percentage}`);
    assert(categories.KOS.count === 1, `Expected 1 KOS, got ${categories.KOS.count}`);
    assert(categories.KOS.percentage === 10, `Expected 10% KOS, got ${categories.KOS.percentage}`);
  }
  results.push({ id: 'BE-003', name: 'Domisili TETAP/KONTRAK_SEWA/KOS', passed: true, notes: '7 TETAP (70%), 2 KONTRAK (20%), 1 KOS (10%)' });
} catch (e: any) {
  results.push({ id: 'BE-003', name: 'Domisili TETAP/KONTRAK_SEWA/KOS', passed: false, notes: e.message });
}

// BE-004 Gender
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // L: W-001, W-003, W-005, W-006, W-008, W-010 = 6
    // P: W-002, W-004, W-007, W-009 = 4
    assert(res.data.demografi.gender.L.count === 6, `Expected 6 L, got ${res.data.demografi.gender.L.count}`);
    assert(res.data.demografi.gender.L.percentage === 60, `Expected 60%, got ${res.data.demografi.gender.L.percentage}`);
    assert(res.data.demografi.gender.P.count === 4, `Expected 4 P, got ${res.data.demografi.gender.P.count}`);
    assert(res.data.demografi.gender.P.percentage === 40, `Expected 40%, got ${res.data.demografi.gender.P.percentage}`);
    assert(res.data.demografi.totalValid === 10, 'Total valid gender must be 10');
  }
  results.push({ id: 'BE-004', name: 'Gender', passed: true, notes: '6 L (60.0%) and 4 P (40.0%)' });
} catch (e: any) {
  results.push({ id: 'BE-004', name: 'Gender', passed: false, notes: e.message });
}

// BE-005 Age U1-U5
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Valid ages: 9 citizens (W-009 has future date)
    // U1 (0-12): W-001 (0), W-002 (2), W-003 (4), W-004 (8) = 4
    // U2 (13-17): W-005 (15) = 1
    // U3 (18-29): W-006 (24) = 1
    // U4 (30-59): W-007 (40), W-010 (31) = 2
    // U5 (>=60): W-008 (65) = 1
    const { groups, totalValid, invalidOrMissingCount } = res.data.usia;
    assert(totalValid === 9, `Expected 9 valid ages, got ${totalValid}`);
    assert(invalidOrMissingCount === 1, `Expected 1 invalid date, got ${invalidOrMissingCount}`);
    assert(groups.U1.count === 4, `Expected 4 in U1, got ${groups.U1.count}`);
    assert(groups.U2.count === 1, `Expected 1 in U2, got ${groups.U2.count}`);
    assert(groups.U3.count === 1, `Expected 1 in U3, got ${groups.U3.count}`);
    assert(groups.U4.count === 2, `Expected 2 in U4, got ${groups.U4.count}`);
    assert(groups.U5.count === 1, `Expected 1 in U5, got ${groups.U5.count}`);
  }
  results.push({ id: 'BE-005', name: 'Age U1-U5', passed: true, notes: 'U1: 4, U2: 1, U3: 1, U4: 2, U5: 1 against 9 valid birth dates' });
} catch (e: any) {
  results.push({ id: 'BE-005', name: 'Age U1-U5', passed: false, notes: e.message });
}

// BE-006 Bayi/Batita/Balita 3-<5/Anak 5-12
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    const { posyandu, groups } = res.data.usia;
    assert(posyandu.bayi.count === 1, `Expected 1 Bayi, got ${posyandu.bayi.count}`);
    assert(posyandu.batita.count === 1, `Expected 1 Batita, got ${posyandu.batita.count}`);
    assert(posyandu.balita.count === 1, `Expected 1 Balita 3-<5, got ${posyandu.balita.count}`);
    assert(posyandu.anak.count === 1, `Expected 1 Anak 5-12, got ${posyandu.anak.count}`);
    assert(posyandu.balitaTotal.count === 3, `Expected 3 Balita Total, got ${posyandu.balitaTotal.count}`);
    assert(posyandu.balitaTotal.count + posyandu.anak.count === groups.U1.count, 'BalitaTotal + Anak === U1');
  }
  results.push({ id: 'BE-006', name: 'Bayi/Batita/Balita 3-<5/Anak 5-12', passed: true, notes: 'Bayi: 1, Batita: 1, Balita 3-<5: 1, Anak: 1, BalitaTotal: 3 (all sum to U1=4)' });
} catch (e: any) {
  results.push({ id: 'BE-006', name: 'Bayi/Batita/Balita 3-<5/Anak 5-12', passed: false, notes: e.message });
}

// BE-007 invalid/missing birth date
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    assert(res.data.usia.invalidOrMissingCount === 1, 'Invalid/future date count must be 1');
    assert(res.data.summary.totalWargaAktif === 10, 'W-009 still counted in total population');
  }
  results.push({ id: 'BE-007', name: 'invalid/missing birth date', passed: true, notes: 'Future birth date excluded from age distribution but retained in population' });
} catch (e: any) {
  results.push({ id: 'BE-007', name: 'invalid/missing birth date', passed: false, notes: e.message });
}

// BE-008 Education
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Valid educations:
    // W-004: SD (1)
    // W-005: SMP (1)
    // W-007: SMA/SMK (1)
    // W-010: SMA -> SMA/SMK (1) -> Total SMA/SMK = 2
    // W-008: D3 (1)
    // W-006: S1 (1)
    // W-009: S2 (1)
    // Total valid = 7
    const { categories, totalValid } = res.data.pendidikan;
    assert(totalValid === 7, `Expected 7 valid educations, got ${totalValid}`);
    assert(categories['SD'].count === 1, 'SD: 1');
    assert(categories['SMP'].count === 1, 'SMP: 1');
    assert(categories['SMA/SMK'].count === 2, 'SMA/SMK: 2');
    assert(categories['D3'].count === 1, 'D3: 1');
    assert(categories['S1'].count === 1, 'S1: 1');
    assert(categories['S2'].count === 1, 'S2: 1');
    assert(categories['S3'].count === 0, 'S3: 0');
  }
  results.push({ id: 'BE-008', name: 'Education', passed: true, notes: 'SD:1, SMP:1, SMA/SMK:2, D3:1, S1:1, S2:1 across 7 valid' });
} catch (e: any) {
  results.push({ id: 'BE-008', name: 'Education', passed: false, notes: e.message });
}

// BE-009 missing education
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // W-001, W-002, W-003 have empty education string -> 3
    assert(res.data.pendidikan.belumTerisiCount === 3, `Expected 3 belum terisi, got ${res.data.pendidikan.belumTerisiCount}`);
    assert(res.data.pendidikan.totalValid + res.data.pendidikan.belumTerisiCount === 10, 'Valid + Belum Terisi === 10');
  }
  results.push({ id: 'BE-009', name: 'missing education', passed: true, notes: '3 blank educations marked as belumTerisiCount, excluded from denominator' });
} catch (e: any) {
  results.push({ id: 'BE-009', name: 'missing education', passed: false, notes: e.message });
}

// BE-010 Occupation P1-P13
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // P1 (Pelajar/Mahasiswa): W-003, W-004, W-005 = 3
    // P2 (PNS/ASN): W-006 = 1
    // P6 (Profesional/Dosen): W-009 = 1
    // P9 (Ibu Rumah Tangga): W-007 = 1
    // P11 (Pensiunan): W-008 = 1
    // P12 (Tidak Bekerja): W-001, W-002 = 2
    // P13 (Lainnya): W-010 = 1
    const { categories, totalValid } = res.data.pekerjaan;
    assert(totalValid === 10, 'Total valid pekerjaan === 10');
    assert(categories['P1'].count === 3, `P1: 3, got ${categories['P1'].count}`);
    assert(categories['P2'].count === 1, `P2: 1, got ${categories['P2'].count}`);
    assert(categories['P6'].count === 1, `P6: 1, got ${categories['P6'].count}`);
    assert(categories['P9'].count === 1, `P9: 1, got ${categories['P9'].count}`);
    assert(categories['P11'].count === 1, `P11: 1, got ${categories['P11'].count}`);
    assert(categories['P12'].count === 2, `P12: 2, got ${categories['P12'].count}`);
    assert(categories['P13'].count === 1, `P13: 1, got ${categories['P13'].count}`);
  }
  results.push({ id: 'BE-010', name: 'Occupation P1-P13', passed: true, notes: 'Precise classification across official P1-P13 codes' });
} catch (e: any) {
  results.push({ id: 'BE-010', name: 'Occupation P1-P13', passed: false, notes: e.message });
}

// BE-011 unmappable occupation → P13
try {
  assert(classifyPekerjaan('Astronaut Galaksi Bima Sakti') === 'P13', 'Unknown text must map to P13');
  assert(classifyPekerjaan('') === 'P13', 'Empty string must map to P13');
  assert(classifyPekerjaan(undefined) === 'P13', 'Undefined must map to P13');
  results.push({ id: 'BE-011', name: 'unmappable occupation → P13', passed: true, notes: 'Unclassified text and blanks reliably fall to P13' });
} catch (e: any) {
  results.push({ id: 'BE-011', name: 'unmappable occupation → P13', passed: false, notes: e.message });
}

// BE-012 Block normalization
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // C-01: W-001, W-002, W-006, W-007 = 4 (mix of "Blok C-01" and "C-01")
    // C-02: W-003, W-004 = 2
    // C-03: W-005, W-008 = 2
    // C-04: W-009, W-010 = 2
    const { distribution, totalBlok } = res.data.blok;
    assert(totalBlok === 4, `Expected 4 distinct blocks, got ${totalBlok}`);
    assert(distribution['C-01'].count === 4, `Expected 4 in C-01, got ${distribution['C-01'].count}`);
    assert(distribution['C-02'].count === 2, `Expected 2 in C-02, got ${distribution['C-02'].count}`);
    assert(distribution['C-03'].count === 2, `Expected 2 in C-03, got ${distribution['C-03'].count}`);
    assert(distribution['C-04'].count === 2, `Expected 2 in C-04, got ${distribution['C-04'].count}`);
  }
  results.push({ id: 'BE-012', name: 'Block normalization', passed: true, notes: '"Blok C-01" and "C-01" unified cleanly to C-01 (4 citizens)' });
} catch (e: any) {
  results.push({ id: 'BE-012', name: 'Block normalization', passed: false, notes: e.message });
}

// BE-013 Family members per KK
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // 10 active citizens distributed across 5 KKs -> 10 / 5 = 2.0 average members
    assert(res.data.keluarga.averageMembersPerKK === 2.0, `Expected 2.0, got ${res.data.keluarga.averageMembersPerKK}`);
  }
  results.push({ id: 'BE-013', name: 'Family members per KK', passed: true, notes: 'Average members per KK = 2.0 across 5 KKs' });
} catch (e: any) {
  results.push({ id: 'BE-013', name: 'Family members per KK', passed: false, notes: e.message });
}

// BE-014 HUBUNGAN_KELUARGA blank
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // W-002 has blank hubunganKeluarga -> BELUM_TERVERIFIKASI = 1
    assert(res.data.keluarga.hubunganKeluarga.BELUM_TERVERIFIKASI.count === 1, 'Expected 1 BELUM_TERVERIFIKASI');
  }
  results.push({ id: 'BE-014', name: 'HUBUNGAN_KELUARGA blank', passed: true, notes: 'Blank hubungan keluarga assigned to BELUM_TERVERIFIKASI without inference' });
} catch (e: any) {
  results.push({ id: 'BE-014', name: 'HUBUNGAN_KELUARGA blank', passed: false, notes: e.message });
}

// BE-015 Non-Tetap
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Non-tetap: W-003, W-004 (KONTRAK_SEWA), W-005 (KOS) -> Total = 3
    const { totalNonTetap, kontrakSewa, kos, byBlock } = res.data.nonTetap;
    assert(totalNonTetap === 3, `Expected 3 non-tetap, got ${totalNonTetap}`);
    assert(kontrakSewa.count === 2, `Expected 2 kontrak, got ${kontrakSewa.count}`);
    assert(kos.count === 1, `Expected 1 kos, got ${kos.count}`);
    assert(byBlock['C-02'] === 2, '2 in C-02');
    assert(byBlock['C-03'] === 1, '1 in C-03');
  }
  results.push({ id: 'BE-015', name: 'Non-Tetap', passed: true, notes: '3 non-tetap residents (2 kontrak, 1 kos) isolated with block breakdown' });
} catch (e: any) {
  results.push({ id: 'BE-015', name: 'Non-Tetap', passed: false, notes: e.message });
}

// BE-016 owner completeness
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // W-003: nama + telp -> lengkap (1)
    // W-004: nama only -> sebagian (1)
    // W-005: neither -> tidakAda (1)
    const { lengkap, sebagian, tidakAda } = res.data.nonTetap.ownerDataCompleteness;
    assert(lengkap.count === 1, `Expected 1 lengkap, got ${lengkap.count}`);
    assert(sebagian.count === 1, `Expected 1 sebagian, got ${sebagian.count}`);
    assert(tidakAda.count === 1, `Expected 1 tidakAda, got ${tidakAda.count}`);
  }
  results.push({ id: 'BE-016', name: 'owner completeness', passed: true, notes: 'Lengkap: 1 (33.3%), Sebagian: 1 (33.3%), Tidak Ada: 1 (33.3%)' });
} catch (e: any) {
  results.push({ id: 'BE-016', name: 'owner completeness', passed: false, notes: e.message });
}

// BE-017 denominator
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Education has 7 valid entries, so S1 (1 citizen) percentage = 1/7 * 100 = 14.3%
    // NOT 1/10 (10.0%)!
    const s1 = res.data.pendidikan.categories['S1'];
    assert(s1.percentage === 14.3, `Expected 14.3% for S1 based on valid denom (7), got ${s1.percentage}`);
  }
  results.push({ id: 'BE-017', name: 'denominator', passed: true, notes: 'Pendidikan S1 percentage correctly uses valid education denominator (7) = 14.3%' });
} catch (e: any) {
  results.push({ id: 'BE-017', name: 'denominator', passed: false, notes: e.message });
}

// BE-018 zero denominator
try {
  // Test zero denominator handling using helper and empty population
  const emptyRes = calculateDashboardData([], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (emptyRes.status === 'empty') {
    const s1 = emptyRes.data.pendidikan.categories['S1'];
    assert(s1.percentage === null, 'Percentage must be null on zero denominator');
    assert(s1.formattedPercentage === '— / Tidak tersedia', 'Formatted string must be "— / Tidak tersedia"');
  }

  const zeroCat = calcMetricCategory(0, 0);
  assert(zeroCat.percentage === null, 'calcMetricCategory percentage must be null when denom=0');
  assert(zeroCat.formattedPercentage === '— / Tidak tersedia', 'Must be "— / Tidak tersedia"');
  results.push({ id: 'BE-018', name: 'zero denominator', passed: true, notes: 'Zero denominator yields null / "— / Tidak tersedia", never 0%' });
} catch (e: any) {
  results.push({ id: 'BE-018', name: 'zero denominator', passed: false, notes: e.message });
}

// BE-019 percentage rounding
try {
  const cat1 = calcMetricCategory(1, 3); // 33.3%
  assert(cat1.percentage === 33.3, `Expected 33.3%, got ${cat1.percentage}`);
  assert(cat1.formattedPercentage === '33.3%', `Expected "33.3%", got ${cat1.formattedPercentage}`);

  const cat2 = calcMetricCategory(2, 3); // 66.7%
  assert(cat2.percentage === 66.7, `Expected 66.7%, got ${cat2.percentage}`);

  const catZero = calcMetricCategory(0, 5); // 0.0%
  assert(catZero.percentage === 0, 'Zero count with positive denom must be 0%');
  assert(catZero.formattedPercentage === '0.0%', 'Formatted must be 0.0%');
  results.push({ id: 'BE-019', name: 'percentage rounding', passed: true, notes: 'Roundings capped at 1 decimal place; count 0 with denom>0 yields 0.0%' });
} catch (e: any) {
  results.push({ id: 'BE-019', name: 'percentage rounding', passed: false, notes: e.message });
}

// BE-020 reconciliation
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  assert(res.status === 'success', 'Must be success on valid data');

  // Verify that an invalid corrupted data object fails reconciliation
  let caughtError = false;
  try {
    if (res.status === 'success') {
      const corrupted: DashboardData = JSON.parse(JSON.stringify(res.data));
      corrupted.usia.groups.U1.count = 999; // Corrupt sum
      reconcileMetrics(corrupted);
    }
  } catch (err: any) {
    caughtError = true;
  }
  assert(caughtError, 'Corrupted data must throw in reconcileMetrics');
  results.push({ id: 'BE-020', name: 'reconciliation', passed: true, notes: 'All dimensions reconcile cleanly, corruption caught immediately' });
} catch (e: any) {
  results.push({ id: 'BE-020', name: 'reconciliation', passed: false, notes: e.message });
}

// BE-021 input immutability
try {
  const clone = JSON.parse(JSON.stringify(sampleWargaList));
  calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  assert(JSON.stringify(sampleWargaList) === JSON.stringify(clone), 'Input list must remain strictly identical');
  results.push({ id: 'BE-021', name: 'input immutability', passed: true, notes: 'Zero mutations or synthetic fields injected into input records' });
} catch (e: any) {
  results.push({ id: 'BE-021', name: 'input immutability', passed: false, notes: e.message });
}

// BE-022 no synthetic data
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (res.status === 'success') {
    // Missing education count is 3, not mapped to "SD" or dummy category
    assert(res.data.pendidikan.belumTerisiCount === 3, 'Belum terisi count is preserved');
    // Blank hubungan keluarga is BELUM_TERVERIFIKASI, not inferred
    assert(res.data.keluarga.hubunganKeluarga.BELUM_TERVERIFIKASI.count === 1, 'BELUM_TERVERIFIKASI preserved');
  }
  results.push({ id: 'BE-022', name: 'no synthetic data', passed: true, notes: 'Zero synthetic fallback; missing states officially recorded' });
} catch (e: any) {
  results.push({ id: 'BE-022', name: 'no synthetic data', passed: false, notes: e.message });
}

// BE-023 filtered population
try {
  const filterBlok: DashboardFilterState = {
    ...DEFAULT_DASHBOARD_FILTER_STATE,
    blok: 'C-01',
  };
  const res = calculateDashboardData(sampleWargaList as Warga[], filterBlok, REF_DATE);
  if (res.status === 'success') {
    // In C-01: W-001, W-002, W-006, W-007 = 4 citizens
    assert(res.data.summary.totalWargaTerfilter === 4, `Expected 4 in C-01, got ${res.data.summary.totalWargaTerfilter}`);
    assert(res.data.summary.totalWargaAktif === 10, 'Total warga aktif remains 10');
    assert(res.data.demografi.totalValid === 4, 'Filtered demografi valid count is 4');
  }
  results.push({ id: 'BE-023', name: 'filtered population', passed: true, notes: 'All metrics dynamically adapt to filtered subset' });
} catch (e: any) {
  results.push({ id: 'BE-023', name: 'filtered population', passed: false, notes: e.message });
}

// BE-024 combined filters
try {
  const combinedFilter: DashboardFilterState = {
    ...DEFAULT_DASHBOARD_FILTER_STATE,
    blok: 'C-01',
    jenisKelamin: 'L',
  };
  const res = calculateDashboardData(sampleWargaList as Warga[], combinedFilter, REF_DATE);
  if (res.status === 'success') {
    // In C-01 AND L: W-001 (Bayi), W-006 (Dewasa Muda) = 2 citizens
    assert(res.data.summary.totalWargaTerfilter === 2, `Expected 2 citizens, got ${res.data.summary.totalWargaTerfilter}`);
    assert(res.data.demografi.gender.L.count === 2, 'Both are L');
    assert(res.data.demografi.gender.P.count === 0, 'Zero P');
  }
  results.push({ id: 'BE-024', name: 'combined filters', passed: true, notes: 'Cumulative AND filters (Blok C-01 + Gender L) isolate 2 citizens' });
} catch (e: any) {
  results.push({ id: 'BE-024', name: 'combined filters', passed: false, notes: e.message });
}

// BE-025 output dashboardData shape
try {
  const res = calculateDashboardData(sampleWargaList as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  assert(res.status === 'success', 'Expected success status');
  if (res.status === 'success') {
    const d = res.data;
    assert(!!d.metadata && !!d.summary, 'metadata & summary exist');
    assert(!!d.domisili && !!d.demografi && !!d.usia, 'domisili, demografi, usia exist');
    assert(!!d.statusPerkawinan && !!d.pendidikan && !!d.pekerjaan, 'statusPerkawinan, pendidikan, pekerjaan exist');
    assert(!!d.blok && !!d.keluarga && !!d.nonTetap, 'blok, keluarga, nonTetap exist');

    // Privacy Verification: no personal PII in dashboardData
    const jsonString = JSON.stringify(d);
    assert(!jsonString.includes('3507120000000001'), 'No NIK in output');
    assert(!jsonString.includes('08123456789'), 'No phone number in output');
    assert(!jsonString.includes('Dewasa Muda Enam'), 'No citizen names in output');
    assert(!jsonString.includes('Pak Bambang'), 'No owner names in output');
  }
  results.push({ id: 'BE-025', name: 'output dashboardData shape', passed: true, notes: 'Complete official shape verified with zero PII leaks' });
} catch (e: any) {
  results.push({ id: 'BE-025', name: 'output dashboardData shape', passed: false, notes: e.message });
}

// Print results
console.log(JSON.stringify(results, null, 2));

const allPassed = results.every((r) => r.passed);
if (!allPassed) {
  console.error('Some tests failed!');
  process.exit(1);
} else {
  console.log(`ALL ${results.length} BATCH E TESTS PASSED!`);
}
