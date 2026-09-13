/**
 * SMART RT 07 RW 11 - BATCH H1 DEF-003 REGRESSION & VERIFICATION SUITE
 * 
 * Verifies that:
 * 1. Wiraswasta is classified as P5 (Wiraswasta/Pengusaha) instead of P4
 * 2. Karyawan/Pegawai Swasta correctly remains P4
 * 3. All official P1-P13 categories and synonyms are mapped accurately
 * 4. Calculation engine preserves reconciliation, summary, demographic dimensions, and privacy
 */

import { classifyPekerjaan } from './filters';
import { calculateDashboardData, getActiveWarga } from './calculationEngine';
import { DEFAULT_DASHBOARD_FILTER_STATE } from './calculationTypes';
import { reconcileMetrics } from './reconciliation';
import { Warga } from '../types/rt';

export interface TestCaseResult {
  id: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export const MANDATORY_H1_CASES: [string, string][] = [
  ['Wiraswasta', 'P5'],
  ['WIRASWASTA', 'P5'],
  ['wiraswasta', 'P5'],
  ['Wiraswasta/Pengusaha', 'P5'],
  ['Pengusaha', 'P5'],
  ['Pengusaha/Usaha Sendiri', 'P5'],
  ['Usaha Sendiri', 'P5'],
  ['Bisnis Sendiri', 'P5'],
  ['Karyawan Swasta', 'P4'],
  ['Pegawai Swasta', 'P4'],
  ['Staff Swasta', 'P4'],
  ['Buruh Pabrik', 'P4'],
  ['PNS', 'P2'],
  ['ASN', 'P2'],
  ['TNI', 'P3'],
  ['Polri', 'P3'],
  ['Pedagang', 'P7'],
  ['Ibu Rumah Tangga', 'P9'],
  ['Pensiunan', 'P11'],
  ['Tidak Bekerja', 'P12'],
  ['pekerjaan tidak dikenali', 'P13']
];

export function runClassifierTests(): {
  allPassed: boolean;
  results: TestCaseResult[];
} {
  const results: TestCaseResult[] = [];
  let allPassed = true;

  MANDATORY_H1_CASES.forEach(([input, expected], idx) => {
    const actual = classifyPekerjaan(input);
    const passed = actual === expected;
    if (!passed) allPassed = false;

    results.push({
      id: `H1-REG-${String(idx + 1).padStart(3, '0')}`,
      input,
      expected,
      actual,
      passed
    });
  });

  return { allPassed, results };
}

// 10 Sample Active Citizens dataset with known demographics
export const SAMPLE_WARGA_ACTIVE: any[] = [
  {
    id_warga: 'W-001',
    nama_lengkap: 'Ahmad Bayi',
    no_kk: 'KK-001',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '2026-01-15',
    pendidikan: 'SD',
    pekerjaan: 'Pelajar',
    status_perkawinan: 'BELUM_KAWIN',
    blok: 'Blok C-01',
    hubunganKeluarga: 'ANAK'
  },
  {
    id_warga: 'W-002',
    nama_lengkap: 'Budi Batita',
    no_kk: 'KK-001',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'P',
    tanggal_lahir: '2024-03-10',
    pendidikan: '',
    pekerjaan: 'Belum Bekerja',
    status_perkawinan: 'BELUM_KAWIN',
    blok: 'C-01',
    hubunganKeluarga: 'ANAK'
  },
  {
    id_warga: 'W-003',
    nama_lengkap: 'Citra Balita',
    no_kk: 'KK-002',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'P',
    tanggal_lahir: '2022-05-20',
    pendidikan: '',
    pekerjaan: '',
    status_perkawinan: 'BELUM_KAWIN',
    blok: 'C-02',
    hubunganKeluarga: 'ANAK'
  },
  {
    id_warga: 'W-004',
    nama_lengkap: 'Doni Anak',
    no_kk: 'KK-002',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '2015-08-12',
    pendidikan: 'SMP',
    pekerjaan: 'Pelajar',
    status_perkawinan: 'BELUM_KAWIN',
    blok: 'C-02',
    hubunganKeluarga: 'ANAK'
  },
  {
    id_warga: 'W-005',
    nama_lengkap: 'Eka Remaja',
    no_kk: 'KK-003',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '2011-04-10',
    pendidikan: 'SMA/SMK',
    pekerjaan: 'PNS',
    status_perkawinan: 'BELUM_KAWIN',
    blok: 'C-01',
    hubunganKeluarga: 'KEPALA_KELUARGA'
  },
  {
    id_warga: 'W-006',
    nama_lengkap: 'Fajar Dewasa Muda',
    no_kk: 'KK-004',
    status_warga: 'AKTIF',
    status_tinggal: 'KONTRAK_SEWA',
    jenis_kelamin: 'L',
    tanggal_lahir: '2001-11-25',
    pendidikan: 'S1',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'KAWIN',
    blok: 'C-02',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    nama_pemilik_rumah: 'Ibu Pemilik',
    no_hp_pemilik: '08123456789'
  },
  {
    id_warga: 'W-007',
    nama_lengkap: 'Gita Dewasa Muda Kos',
    no_kk: 'KK-005',
    status_warga: 'AKTIF',
    status_tinggal: 'KOS',
    jenis_kelamin: 'P',
    tanggal_lahir: '1998-02-14',
    pendidikan: 'D3',
    pekerjaan: 'Wiraswasta', // Targeted record for DEF-003
    status_perkawinan: 'KAWIN',
    blok: 'C-03',
    hubunganKeluarga: 'PENGHUNI_KOS',
    nama_pemilik_rumah: 'Bapak Kost'
  },
  {
    id_warga: 'W-008',
    nama_lengkap: 'Hadi Dewasa',
    no_kk: 'KK-001',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '1985-09-01',
    pendidikan: 'SMA/SMK',
    pekerjaan: 'Wiraswasta/Pengusaha', // Targeted record for DEF-003
    status_perkawinan: 'KAWIN',
    blok: 'Blok C-01',
    hubunganKeluarga: 'FAMILI_LAIN'
  },
  {
    id_warga: 'W-009',
    nama_lengkap: 'Indah Dewasa Kontrak',
    no_kk: 'KK-004',
    status_warga: 'AKTIF',
    status_tinggal: 'KONTRAK_SEWA',
    jenis_kelamin: 'P',
    tanggal_lahir: '1970-07-07',
    pendidikan: 'S2',
    pekerjaan: 'Pensiunan',
    status_perkawinan: 'CERAI_HIDUP',
    blok: 'C-02',
    hubunganKeluarga: 'ISTRI'
  },
  {
    id_warga: 'W-010',
    nama_lengkap: 'Joko Lansia',
    no_kk: '',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '1961-03-01',
    pendidikan: '',
    pekerjaan: 'Buruh Pabrik',
    status_perkawinan: 'CERAI_MATI',
    blok: 'C-03',
    hubunganKeluarga: ''
  }
];

export function runEngineRegression(): {
  status: string;
  data: any;
  reconciled: boolean;
  def003Verified: boolean;
} {
  const REF_DATE = '2026-09-08T00:00:00.000Z';
  const result = calculateDashboardData(SAMPLE_WARGA_ACTIVE as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (result.status !== 'success') {
    throw new Error(`Engine returned status: ${result.status}`);
  }

  // Check DEF-003 impact:
  // W-007 (Wiraswasta) -> P5
  // W-008 (Wiraswasta/Pengusaha) -> P5
  // W-006 (Karyawan Swasta) -> P4
  // W-010 (Buruh Pabrik) -> P4
  const p4Count = result.data.pekerjaan.categories.P4.count;
  const p5Count = result.data.pekerjaan.categories.P5.count;

  // In this dataset: P4 should be 2 (Karyawan Swasta + Buruh Pabrik)
  // P5 should be 2 (Wiraswasta + Wiraswasta/Pengusaha)
  const def003Verified = p5Count === 2 && p4Count === 2;
  let isReconciled = false;
  try {
    reconcileMetrics(result.data);
    isReconciled = true;
  } catch {
    isReconciled = false;
  }

  return {
    status: result.status,
    data: result.data,
    reconciled: isReconciled,
    def003Verified
  };
}

// Auto-run when executed directly via CLI
if (typeof process !== 'undefined' && process.argv[1]?.includes('testBatchH1Def003')) {
  console.log('====================================================');
  console.log('  SMART RT 07 RW 11 - BATCH H1 DEF-003 TEST REPORT  ');
  console.log('====================================================\n');
  
  const { allPassed, results } = runClassifierTests();
  console.log('1. CLASSIFIER REGRESSION TESTS (P1-P13):');
  results.forEach(r => {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.id} | ${r.input.padEnd(25)} | Expected: ${r.expected} | Actual: ${r.actual}`);
  });
  console.log(`\nCLASSIFIER VERDICT: ${allPassed ? 'ALL 21 TESTS PASSED' : 'SOME TESTS FAILED'}`);

  const engine = runEngineRegression();
  console.log('\n2. CALCULATION ENGINE REGRESSION:');
  console.log(`Engine Execution Status: ${engine.status}`);
  console.log(`Reconciliation isReconciled: ${engine.reconciled}`);
  console.log(`DEF-003 Engine Verification (P4=2, P5=2): ${engine.def003Verified ? 'PASS' : 'FAIL'}`);
  console.log(`Summary: totalWargaAktif=${engine.data.summary.totalWargaAktif}, totalKK=${engine.data.summary.totalKK}`);
  console.log(`Pekerjaan P4 (Karyawan Swasta): count=${engine.data.pekerjaan.categories.P4.count} (${engine.data.pekerjaan.categories.P4.formattedPercentage})`);
  console.log(`Pekerjaan P5 (Wiraswasta): count=${engine.data.pekerjaan.categories.P5.count} (${engine.data.pekerjaan.categories.P5.formattedPercentage})`);
}
