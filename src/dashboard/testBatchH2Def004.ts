/**
 * SMART RT 07 RW 11 - BATCH H2 DEF-004 REGRESSION & VERIFICATION SUITE
 * 
 * Verifies that:
 * 1. OfficialMetricsView uses official age group labels:
 *    - U1 Anak (0-12 th)
 *    - U2 Remaja (13-17 th)
 *    - U3 Dewasa Muda (18-29 th)
 *    - U4 Dewasa (30-59 th)
 *    - U5 Lansia (≥60 th)
 * 2. Legacy labels (<18, 18-24, 25-34, 35-59, 60+) are completely removed.
 * 3. Calculation Engine age distribution remains intact:
 *    - U1 = 4, U2 = 1, U3 = 2, U4 = 2, U5 = 1 (Total: 10)
 * 4. Posyandu hierarchy and mathematical reconciliation remain intact:
 *    - Bayi(1) + Batita(1) + Balita(1) = BalitaTotal(3)
 *    - BalitaTotal(3) + Anak(1) = U1(4)
 */

import fs from 'fs';
import path from 'path';
import { calculateDashboardData } from './calculationEngine';
import { DEFAULT_DASHBOARD_FILTER_STATE } from './calculationTypes';
import { reconcileMetrics } from './reconciliation';
import { Warga } from '../types/rt';

export interface LabelVerificationItem {
  id: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface LegacyCheckItem {
  label: string;
  present: boolean;
  status: 'PASS' | 'FAIL';
}

export const SAMPLE_10_ACTIVE_WARGA: any[] = [
  // 1. Bayi (<1 th, 0 th) -> U1
  {
    id_warga: 'W-001',
    nama_lengkap: 'Bayi Satu',
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
  // 2. Batita (2 th) -> U1
  {
    id_warga: 'W-002',
    nama_lengkap: 'Batita Dua',
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
  // 3. Balita 3-<5 (4 th) -> U1
  {
    id_warga: 'W-003',
    nama_lengkap: 'Balita Tiga',
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
  // 4. Anak 5-12 (11 th) -> U1
  {
    id_warga: 'W-004',
    nama_lengkap: 'Anak Empat',
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
  // 5. Remaja (15 th) -> U2
  {
    id_warga: 'W-005',
    nama_lengkap: 'Remaja Lima',
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
  // 6. Dewasa Muda (24 th) -> U3
  {
    id_warga: 'W-006',
    nama_lengkap: 'Dewasa Muda Enam',
    no_kk: 'KK-004',
    status_warga: 'AKTIF',
    status_tinggal: 'KONTRAK_SEWA',
    jenis_kelamin: 'L',
    tanggal_lahir: '2001-11-25',
    pendidikan: 'S1',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'KAWIN',
    blok: 'C-02',
    hubunganKeluarga: 'KEPALA_KELUARGA'
  },
  // 7. Dewasa Muda (28 th) -> U3
  {
    id_warga: 'W-007',
    nama_lengkap: 'Dewasa Muda Tujuh',
    no_kk: 'KK-005',
    status_warga: 'AKTIF',
    status_tinggal: 'KOS',
    jenis_kelamin: 'P',
    tanggal_lahir: '1998-02-14',
    pendidikan: 'D3',
    pekerjaan: 'Wiraswasta',
    status_perkawinan: 'KAWIN',
    blok: 'C-03',
    hubunganKeluarga: 'PENGHUNI_KOS'
  },
  // 8. Dewasa (41 th) -> U4
  {
    id_warga: 'W-008',
    nama_lengkap: 'Dewasa Delapan',
    no_kk: 'KK-001',
    status_warga: 'AKTIF',
    status_tinggal: 'TETAP',
    jenis_kelamin: 'L',
    tanggal_lahir: '1985-09-01',
    pendidikan: 'SMA/SMK',
    pekerjaan: 'Wiraswasta/Pengusaha',
    status_perkawinan: 'KAWIN',
    blok: 'Blok C-01',
    hubunganKeluarga: 'FAMILI_LAIN'
  },
  // 9. Dewasa (56 th) -> U4
  {
    id_warga: 'W-009',
    nama_lengkap: 'Dewasa Sembilan',
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
  // 10. Lansia (65 th) -> U5
  {
    id_warga: 'W-010',
    nama_lengkap: 'Lansia Sepuluh',
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

export function verifyOfficialMetricsViewSource(): {
  labelResults: LabelVerificationItem[];
  legacyResults: LegacyCheckItem[];
  allPassed: boolean;
} {
  const filePath = path.resolve(process.cwd(), 'src/components/dashboard/OfficialMetricsView.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  const expectedLabels: { id: string; expected: string; regex: RegExp }[] = [
    { id: 'U1', expected: 'U1 Anak (0-12 th)', regex: /label:\s*['"]U1 Anak \(0-12 th\)['"]/ },
    { id: 'U2', expected: 'U2 Remaja (13-17 th)', regex: /label:\s*['"]U2 Remaja \(13-17 th\)['"]/ },
    { id: 'U3', expected: 'U3 Dewasa Muda (18-29 th)', regex: /label:\s*['"]U3 Dewasa Muda \(18-29 th\)['"]/ },
    { id: 'U4', expected: 'U4 Dewasa (30-59 th)', regex: /label:\s*['"]U4 Dewasa \(30-59 th\)['"]/ },
    { id: 'U5', expected: 'U5 Lansia (≥60 th)', regex: /label:\s*['"]U5 Lansia \(≥60 th\)['"]/ },
  ];

  const labelResults: LabelVerificationItem[] = expectedLabels.map(item => {
    const match = item.regex.test(content);
    return {
      id: item.id,
      expected: item.expected,
      actual: match ? item.expected : 'NOT FOUND IN SOURCE',
      passed: match
    };
  });

  const legacyKeywords = ['<18', '18-24', '25-34', '35-59', '60+'];
  const legacyResults: LegacyCheckItem[] = legacyKeywords.map(kw => {
    // Check if kw appears as part of age labels
    const present = content.includes(`(${kw} th)`) || content.includes(`(${kw})`);
    return {
      label: kw,
      present,
      status: !present ? 'PASS' : 'FAIL'
    };
  });

  const allPassed = labelResults.every(r => r.passed) && legacyResults.every(r => r.status === 'PASS');
  return { labelResults, legacyResults, allPassed };
}

export function runAgeEngineRegression(): {
  totalActive: number;
  groups: { U1: number; U2: number; U3: number; U4: number; U5: number };
  posyandu: { bayi: number; batita: number; balita: number; anak: number; balitaTotal: number };
  formula1Match: boolean;
  formula2Match: boolean;
  reconciled: boolean;
} {
  const REF_DATE = '2026-09-08T00:00:00.000Z';
  const result = calculateDashboardData(SAMPLE_10_ACTIVE_WARGA as Warga[], DEFAULT_DASHBOARD_FILTER_STATE, REF_DATE);
  if (result.status !== 'success') {
    throw new Error(`Engine returned status: ${result.status}`);
  }

  const { usia, summary } = result.data;
  let isReconciled = false;
  try {
    reconcileMetrics(result.data);
    isReconciled = true;
  } catch {
    isReconciled = false;
  }

  const bayi = usia.posyandu.bayi.count;
  const batita = usia.posyandu.batita.count;
  const balita = usia.posyandu.balita.count;
  const anak = usia.posyandu.anak.count;
  const balitaTotal = usia.posyandu.balitaTotal.count;
  const u1 = usia.groups.U1.count;

  return {
    totalActive: summary.totalWargaAktif,
    groups: {
      U1: usia.groups.U1.count,
      U2: usia.groups.U2.count,
      U3: usia.groups.U3.count,
      U4: usia.groups.U4.count,
      U5: usia.groups.U5.count,
    },
    posyandu: { bayi, batita, balita, anak, balitaTotal },
    formula1Match: bayi + batita + balita === balitaTotal,
    formula2Match: balitaTotal + anak === u1,
    reconciled: isReconciled,
  };
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('testBatchH2Def004')) {
  console.log('====================================================');
  console.log('  SMART RT 07 RW 11 - BATCH H2 DEF-004 TEST REPORT  ');
  console.log('====================================================\n');

  const { labelResults, legacyResults, allPassed } = verifyOfficialMetricsViewSource();
  console.log('1. LABEL VERIFICATION (OfficialMetricsView.tsx):');
  labelResults.forEach(r => {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.id} | Expected: ${r.expected.padEnd(25)} | Actual: ${r.actual}`);
  });

  console.log('\n2. LEGACY LABEL ELIMINATION CHECK:');
  legacyResults.forEach(r => {
    console.log(`[${r.status}] Legacy label '${r.label}' still present: ${r.present ? 'YES' : 'NO'}`);
  });

  console.log(`\nUI LABELS OVERALL VERDICT: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);

  const engine = runAgeEngineRegression();
  console.log('\n3. CALCULATION ENGINE AGE REGRESSION:');
  console.log(`Total Warga Aktif: ${engine.totalActive}`);
  console.log(`U1: ${engine.groups.U1} (Expected: 4)`);
  console.log(`U2: ${engine.groups.U2} (Expected: 1)`);
  console.log(`U3: ${engine.groups.U3} (Expected: 2)`);
  console.log(`U4: ${engine.groups.U4} (Expected: 2)`);
  console.log(`U5: ${engine.groups.U5} (Expected: 1)`);
  console.log('\n4. POSYANDU REGRESSION:');
  console.log(`Bayi: ${engine.posyandu.bayi}, Batita: ${engine.posyandu.batita}, Balita: ${engine.posyandu.balita}`);
  console.log(`Balita Total: ${engine.posyandu.balitaTotal} (Formula 1 Match: ${engine.formula1Match})`);
  console.log(`Anak 5-12: ${engine.posyandu.anak} (Formula 2 Match: ${engine.formula2Match})`);
  console.log(`Reconciliation isReconciled: ${engine.reconciled}`);
}
