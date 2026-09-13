import { Warga } from '../types/rt';
import {
  calculateDashboardData,
  countActiveFilters,
  calculateTotalKK,
} from './calculationEngine';
import {
  DEFAULT_DASHBOARD_FILTER_STATE,
  DashboardFilterState,
  DashboardCalculationResult,
} from './calculationTypes';

interface TestItem {
  id: string;
  name: string;
  passed: boolean;
  notes: string;
}

const suite: TestItem[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// 1. Active warga masuk engine
try {
  const list: Partial<Warga>[] = [
    { id_warga: 'W-01', status_warga: 'AKTIF' as any, no_kk: 'KK-1' },
    { id_warga: 'W-02', status_warga: 'AKTIF' as any, no_kk: 'KK-2' },
  ];
  const res = calculateDashboardData(list as Warga[]);
  assert(res.status === 'success', 'Expected status success');
  if (res.status === 'success') {
    assert(res.data.summary.totalWargaAktif === 2, 'Expected 2 active warga');
  }
  suite.push({ id: 'TC-001', name: 'Active warga masuk engine', passed: true, notes: '2 active warga successfully processed' });
} catch (e: any) {
  suite.push({ id: 'TC-001', name: 'Active warga masuk engine', passed: false, notes: e.message });
}

// 2. TIDAK_AKTIF tidak masuk
try {
  const list: Partial<Warga>[] = [
    { id_warga: 'W-01', status_warga: 'AKTIF' as any, no_kk: 'KK-1' },
    { id_warga: 'W-02', status_warga: 'TIDAK_AKTIF' as any, no_kk: 'KK-2' },
  ];
  const res = calculateDashboardData(list as Warga[]);
  assert(res.status === 'success', 'Expected status success');
  if (res.status === 'success') {
    assert(res.data.summary.totalWargaAktif === 1, 'Expected 1 active warga');
    assert(res.data.summary.totalWargaTerfilter === 1, 'Expected 1 filtered warga');
  }
  suite.push({ id: 'TC-002', name: 'TIDAK_AKTIF tidak masuk', passed: true, notes: 'TIDAK_AKTIF successfully excluded' });
} catch (e: any) {
  suite.push({ id: 'TC-002', name: 'TIDAK_AKTIF tidak masuk', passed: false, notes: e.message });
}

// 3. STATUS_TINGGAL tidak menentukan active
try {
  const list: Partial<Warga>[] = [
    { id_warga: 'W-01', status_warga: 'TIDAK_AKTIF' as any, status_tinggal: 'TETAP' as any },
    { id_warga: 'W-02', status_warga: 'AKTIF' as any, status_tinggal: 'KOS' as any, no_kk: 'KK-KOS' },
  ];
  const res = calculateDashboardData(list as Warga[]);
  assert(res.status === 'success', 'Expected success');
  if (res.status === 'success') {
    assert(res.data.summary.totalWargaAktif === 1, 'Only AKTIF with KOS included, TIDAK_AKTIF/TETAP excluded');
  }
  suite.push({ id: 'TC-003', name: 'STATUS_TINGGAL tidak menentukan active', passed: true, notes: 'Separation verified' });
} catch (e: any) {
  suite.push({ id: 'TC-003', name: 'STATUS_TINGGAL tidak menentukan active', passed: false, notes: e.message });
}

// 4. Dashboard menerima result success
try {
  const list: Partial<Warga>[] = [
    { id_warga: 'W-01', status_warga: 'AKTIF' as any, no_kk: 'KK-1' },
  ];
  const res: DashboardCalculationResult = calculateDashboardData(list as Warga[]);
  assert(res.status === 'success', 'Dashboard received status success');
  if (res.status === 'success') {
    assert(typeof res.data.metadata.calculatedAt === 'string', 'Timestamp present');
    assert(typeof res.data.summary.totalWargaAktif === 'number', 'Summary present');
  }
  suite.push({ id: 'TC-004', name: 'Dashboard menerima result success', passed: true, notes: 'Result success with data payload' });
} catch (e: any) {
  suite.push({ id: 'TC-004', name: 'Dashboard menerima result success', passed: false, notes: e.message });
}

// 5. Dashboard menerima empty
try {
  const list: Partial<Warga>[] = [
    { id_warga: 'W-01', status_warga: 'TIDAK_AKTIF' as any },
  ];
  const res: DashboardCalculationResult = calculateDashboardData(list as Warga[]);
  assert(res.status === 'empty', 'Dashboard received status empty');
  if (res.status === 'empty') {
    assert(res.data.summary.totalWargaAktif === 0, 'Counts equal 0');
  }
  suite.push({ id: 'TC-005', name: 'Dashboard menerima empty', passed: true, notes: 'Result empty handled safely without mock fallback' });
} catch (e: any) {
  suite.push({ id: 'TC-005', name: 'Dashboard menerima empty', passed: false, notes: e.message });
}

// 6. Dashboard menerima calculation_error
try {
  const res: DashboardCalculationResult = calculateDashboardData(null as any);
  assert(res.status === 'calculation_error', 'Dashboard received status calculation_error');
  if (res.status === 'calculation_error') {
    assert(res.error.code === 'CALCULATION_ENGINE_ERROR', 'Error code present');
    assert(typeof res.error.message === 'string', 'Error message present');
    assert(typeof res.error.stage === 'string', 'Error stage present');
  }
  suite.push({ id: 'TC-006', name: 'Dashboard menerima calculation_error', passed: true, notes: 'Result calculation_error preserved safely' });
} catch (e: any) {
  suite.push({ id: 'TC-006', name: 'Dashboard menerima calculation_error', passed: false, notes: e.message });
}

// 7. Filter state memiliki 7 field
try {
  const fields = ['blok', 'statusDomisili', 'jenisKelamin', 'kelompokUsia', 'pendidikan', 'pekerjaan', 'statusPerkawinan'];
  for (const f of fields) {
    assert(f in DEFAULT_DASHBOARD_FILTER_STATE, `Missing filter field ${f}`);
  }
  assert(Object.keys(DEFAULT_DASHBOARD_FILTER_STATE).length === 7, 'Filter state must have exactly 7 fields');
  suite.push({ id: 'TC-007', name: 'Filter state memiliki 7 field', passed: true, notes: 'Exactly 7 locked fields present' });
} catch (e: any) {
  suite.push({ id: 'TC-007', name: 'Filter state memiliki 7 field', passed: false, notes: e.message });
}

// 8. Default semua filter = ALL
try {
  const keys = Object.keys(DEFAULT_DASHBOARD_FILTER_STATE) as (keyof DashboardFilterState)[];
  for (const k of keys) {
    assert(DEFAULT_DASHBOARD_FILTER_STATE[k] === 'ALL', `${k} must default to ALL`);
  }
  assert(countActiveFilters(DEFAULT_DASHBOARD_FILTER_STATE) === 0, 'Active filter count for default must be 0');
  suite.push({ id: 'TC-008', name: 'Default semua filter = ALL', passed: true, notes: 'All 7 filters default to ALL' });
} catch (e: any) {
  suite.push({ id: 'TC-008', name: 'Default semua filter = ALL', passed: false, notes: e.message });
}

// 9. Existing Dashboard tidak crash
try {
  // We simulate what Dashboard does:
  // memoized calculateDashboardData with normal, empty, and invalid input:
  const r1 = calculateDashboardData([] as Warga[], DEFAULT_DASHBOARD_FILTER_STATE);
  assert(r1.status === 'empty', 'Empty array gives empty status');
  const r2 = calculateDashboardData([
    { id_warga: 'W-01', status_warga: 'AKTIF' as any, no_kk: 'KK-1' } as Warga
  ], DEFAULT_DASHBOARD_FILTER_STATE);
  assert(r2.status === 'success', 'Valid array gives success status');
  suite.push({ id: 'TC-009', name: 'Existing Dashboard tidak crash', passed: true, notes: 'Safe memoization bridge runs with zero exceptions' });
} catch (e: any) {
  suite.push({ id: 'TC-009', name: 'Existing Dashboard tidak crash', passed: false, notes: e.message });
}

// 10. wargaList tidak termutasi
try {
  const originalWarga: Partial<Warga> = {
    id_warga: 'W-IMMUTABLE-01',
    nama_lengkap: 'Siti Aminah',
    status_warga: 'AKTIF' as any,
    no_kk: 'KK-IMM-01',
    alamat: 'Blok A No. 1',
  };
  const frozenStr = JSON.stringify(originalWarga);
  const inputArr = [originalWarga as Warga];
  calculateDashboardData(inputArr, DEFAULT_DASHBOARD_FILTER_STATE);

  assert(inputArr.length === 1, 'Array length must remain unchanged');
  assert(JSON.stringify(originalWarga) === frozenStr, 'Warga object properties must remain completely untouched');
  suite.push({ id: 'TC-010', name: 'wargaList tidak termutasi', passed: true, notes: 'Input list and objects are strictly read-only' });
} catch (e: any) {
  suite.push({ id: 'TC-010', name: 'wargaList tidak termutasi', passed: false, notes: e.message });
}

console.log(JSON.stringify(suite, null, 2));
