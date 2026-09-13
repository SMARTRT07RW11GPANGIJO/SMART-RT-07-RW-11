import { Warga } from '../types/rt';
import { DashboardFilterState } from './calculationTypes';

/**
 * Filter Option Structure
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * 1. Normalize Blok
 * "Blok C-01" and "C-01" are normalized to "C-01" strictly in analysis layer.
 * Original WARGA object is never mutated.
 */
export function normalizeBlok(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/^blok\s+/i, '').trim().toUpperCase();
}

/**
 * 2. Normalize Status Domisili
 * SSoT Source: STATUS_TINGGAL
 * Official categories: TETAP, KONTRAK_SEWA, KOS
 * STATUS_WARGA is NOT used for domisili.
 */
export function normalizeStatusDomisili(raw?: string): 'TETAP' | 'KONTRAK_SEWA' | 'KOS' | '' {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().toUpperCase();
  if (clean === 'TETAP') return 'TETAP';
  if (
    clean === 'KONTRAK_SEWA' ||
    clean === 'KONTRAK' ||
    clean === 'SEWA' ||
    clean === 'KONTRAK / SEWA'
  ) {
    return 'KONTRAK_SEWA';
  }
  if (clean === 'KOS' || clean === 'KOST') return 'KOS';
  return '';
}

/**
 * 3. Normalize Jenis Kelamin
 * SSoT Source: JENIS_KELAMIN ('Laki-Laki' / 'Perempuan' / 'L' / 'P')
 */
export function normalizeJenisKelamin(raw?: string): 'L' | 'P' | '' {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().toUpperCase();
  if (clean === 'L' || clean.startsWith('LAKI')) return 'L';
  if (clean === 'P' || clean.startsWith('PEREMPUAN') || clean.startsWith('WANITA')) return 'P';
  return '';
}

/**
 * 4. Calculate Age Dynamically
 * SSoT Source: TANGGAL_LAHIR
 * Calculated against calculatedAt date without adding age field to Warga.
 * If empty/invalid/future -> returns null.
 */
export function calculateAge(tanggalLahir?: string, calculatedAt?: string): number | null {
  if (!tanggalLahir || typeof tanggalLahir !== 'string') return null;
  const raw = tanggalLahir.trim();
  if (!raw) return null;

  let birthDate: Date | null = null;

  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const parts = raw.split(/[-T]/);
    birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else if (/^\d{2}[/-]\d{2}[/-]\d{4}/.test(raw)) {
    // Match DD/MM/YYYY or DD-MM-YYYY
    const parts = raw.split(/[/-]/);
    birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  } else {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      birthDate = d;
    }
  }

  if (!birthDate || isNaN(birthDate.getTime())) return null;

  const refDate = calculatedAt ? new Date(calculatedAt) : new Date();
  if (isNaN(refDate.getTime())) return null;

  // Future check: date cannot be in the future
  if (birthDate.getTime() > refDate.getTime()) {
    return null;
  }

  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0) return null;
  return age;
}

/**
 * Check if dynamic age matches Kelompok Usia filter
 */
export function matchesKelompokUsia(age: number | null, filter: string): boolean {
  const normFilter = filter.trim().toUpperCase();
  if (normFilter === 'ALL') return true;
  if (age === null) return false;

  switch (normFilter) {
    case 'U1':
    case 'U1_ANAK':
    case 'ANAK_0_12':
      return age >= 0 && age <= 12;
    case 'BAYI':
    case 'BAYI_0_1':
      return age >= 0 && age < 1;
    case 'BATITA':
    case 'BATITA_1_3':
      return age >= 1 && age < 3;
    case 'BALITA':
    case 'BALITA_3_5':
      return age >= 3 && age < 5;
    case 'BALITA_ALL':
      return age >= 0 && age < 5;
    case 'ANAK':
    case 'ANAK_5_12':
      return age >= 5 && age <= 12;
    case 'U2':
    case 'U2_REMAJA':
    case 'REMAJA':
      return age >= 13 && age <= 17;
    case 'U3':
    case 'U3_DEWASA_MUDA':
    case 'DEWASA_MUDA':
      return age >= 18 && age <= 29;
    case 'U4':
    case 'U4_DEWASA':
    case 'DEWASA':
      return age >= 30 && age <= 59;
    case 'U5':
    case 'U5_LANSIA':
    case 'LANSIA':
      return age >= 60;
    default:
      return false;
  }
}

/**
 * 5. Normalize Pendidikan
 * SSoT Source: PENDIDIKAN
 * Categories: SD, SMP, SMA/SMK, D1, D2, D3, D4, S1, S2, S3
 */
export function normalizePendidikan(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().toUpperCase();
  if (clean === 'SMA' || clean === 'SMK' || clean === 'SMA/SMK' || clean === 'SLTA') {
    return 'SMA/SMK';
  }
  if (clean === 'SMP' || clean === 'SLTP') {
    return 'SMP';
  }
  if (['SD', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'].includes(clean)) {
    return clean;
  }
  return clean;
}

/**
 * 6. Classify Pekerjaan (P1–P13)
 * SSoT Source: PEKERJAAN (text)
 * Mapped to exactly one category, unclassified falls to P13.
 */
export function classifyPekerjaan(raw?: string): string {
  if (!raw || typeof raw !== 'string') return 'P13';
  const clean = raw.trim().toUpperCase();
  if (!clean) return 'P13';

  // Direct code match
  if (/^P[1-9]$|^P1[0-3]$/.test(clean)) return clean;
  if (/^P([1-9]|1[0-3])\b/.test(clean)) {
    const match = clean.match(/^P([1-9]|1[0-3])/);
    if (match) return `P${match[1]}`;
  }

  // P1 Pelajar/Mahasiswa
  if (/PELAJAR|MAHASISW[AI]|SANTRI|SISW[AI]|STUDENT/.test(clean)) return 'P1';

  // P2 PNS/ASN
  if (/PNS|ASN|PEGAWAI NEGERI|APARATUR SIPIL/.test(clean)) return 'P2';

  // P3 TNI/Polri
  if (/TNI|POLRI|POLISI|TENTARA|MILITER|KOPASSUS|BRIMOB/.test(clean)) return 'P3';

  // P5 Wiraswasta/Pengusaha (Evaluated before P4 to avoid substring SWASTA collision)
  if (/WIRASWASTA|PENGUSAHA|ENTREPRENEUR|USAHA SENDIRI|BISNIS/.test(clean)) return 'P5';

  // P4 Karyawan/Pegawai Swasta
  if (/KARYAWAN|(?<!WIRA)SWASTA|PEGAWAI SWASTA|BURUH PABRIK|STAFF SWASTA/.test(clean)) return 'P4';

  // P6 Profesional
  if (/DOKTER|PENGACARA|NOTARIS|AKUNTAN|ARSITEK|INSINYUR|PROGRAMMER|KONSULTAN|DOSEN|BIDAN|PERAWAT|APOTEKER|PSIKOLOG|DESAINER|ENGINEER|DEVELOPER/.test(clean)) {
    return 'P6';
  }

  // P7 Pedagang
  if (/PEDAGANG|DAGANG|PENJUAL|WARUNG|TOKO|TRADER/.test(clean)) return 'P7';

  // P8 Petani/Peternak/Nelayan
  if (/PETANI|TANI|PETERNAK|NELAYAN|PERKEBUNAN/.test(clean)) return 'P8';

  // P9 Ibu Rumah Tangga
  if (/IBU RUMAH TANGGA|IRT|RUMAH TANGGA|MENGURUS RUMAH/.test(clean)) return 'P9';

  // P10 Pekerja Harian/Buruh
  if (/HARIAN|BURUH HARIAN|BURUH LEPAS|TUKANG|KULI|SERABUTAN|FREELANCE/.test(clean)) return 'P10';

  // P11 Pensiunan
  if (/PENSIUNAN|PENSIUN|PURNAWIRAWAN/.test(clean)) return 'P11';

  // P12 Tidak Bekerja
  if (/TIDAK BEKERJA|BELUM BEKERJA|MENGANGGUR|TIDAK PUNYA PEKERJAAN/.test(clean)) return 'P12';

  // P13 Lainnya/Belum Terklasifikasi
  return 'P13';
}

/**
 * 7. Normalize Status Perkawinan
 * SSoT Source: STATUS_PERKAWINAN
 * Missing stays missing.
 */
export function normalizeStatusPerkawinan(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'BELUM_KAWIN' || clean === 'BELUM_MENIKAH') return 'BELUM_KAWIN';
  if (clean === 'KAWIN' || clean === 'MENIKAH') return 'KAWIN';
  if (clean === 'CERAI_HIDUP') return 'CERAI_HIDUP';
  if (clean === 'CERAI_MATI') return 'CERAI_MATI';
  return clean;
}

/**
 * Filter a single Warga across all 7 official filters with cumulative AND logic.
 */
export function filterWargaRecord(
  warga: Warga,
  filterState: DashboardFilterState,
  calculatedAt?: string
): boolean {
  // 1. BLOK
  if (filterState.blok !== 'ALL') {
    const targetBlok = normalizeBlok(filterState.blok);
    const wargaBlok = normalizeBlok(warga.blok);
    if (wargaBlok !== targetBlok) return false;
  }

  // 2. STATUS DOMISILI (SSoT: status_tinggal)
  if (filterState.statusDomisili !== 'ALL') {
    const rawTinggal = (warga as any).status_tinggal ?? (warga as any).STATUS_TINGGAL ?? '';
    const wargaDomisili = normalizeStatusDomisili(rawTinggal);
    const targetDomisili = filterState.statusDomisili.trim().toUpperCase();
    if (wargaDomisili !== targetDomisili) return false;
  }

  // 3. JENIS KELAMIN
  if (filterState.jenisKelamin !== 'ALL') {
    const targetGender = normalizeJenisKelamin(filterState.jenisKelamin);
    const wargaGender = normalizeJenisKelamin(warga.jenis_kelamin);
    if (wargaGender !== targetGender) return false;
  }

  // 4. KELOMPOK USIA (Dynamic from TANGGAL_LAHIR)
  if (filterState.kelompokUsia !== 'ALL') {
    const age = calculateAge(warga.tanggal_lahir, calculatedAt);
    if (!matchesKelompokUsia(age, filterState.kelompokUsia)) return false;
  }

  // 5. PENDIDIKAN
  if (filterState.pendidikan !== 'ALL') {
    const targetPendidikan = normalizePendidikan(filterState.pendidikan);
    const wargaPendidikan = normalizePendidikan(warga.pendidikan);
    if (!wargaPendidikan || wargaPendidikan !== targetPendidikan) return false;
  }

  // 6. PEKERJAAN (P1–P13)
  if (filterState.pekerjaan !== 'ALL') {
    const targetPekerjaan = classifyPekerjaan(filterState.pekerjaan);
    const wargaPekerjaan = classifyPekerjaan(warga.pekerjaan);
    if (wargaPekerjaan !== targetPekerjaan) return false;
  }

  // 7. STATUS PERKAWINAN
  if (filterState.statusPerkawinan !== 'ALL') {
    const targetPerkawinan = normalizeStatusPerkawinan(filterState.statusPerkawinan);
    const wargaPerkawinan = normalizeStatusPerkawinan(warga.status_perkawinan);
    if (!wargaPerkawinan || wargaPerkawinan !== targetPerkawinan) return false;
  }

  return true;
}

/**
 * Apply all 7 Dashboard filters on active warga population.
 * Guaranteed to return an immutable subset without mutating input.
 */
export function applyCumulativeFilters(
  activeWarga: Warga[],
  filterState: DashboardFilterState,
  calculatedAt?: string
): Warga[] {
  return activeWarga.filter((w) => filterWargaRecord(w, filterState, calculatedAt));
}

/**
 * Static Official Filter Options (all valid categories remain available)
 */
export const OFFICIAL_FILTER_OPTIONS: Record<keyof DashboardFilterState, FilterOption[]> = {
  blok: [
    { value: 'ALL', label: 'Semua Blok' },
    { value: 'A', label: 'Blok A' },
    { value: 'B', label: 'Blok B' },
    { value: 'C', label: 'Blok C' },
    { value: 'D', label: 'Blok D' },
    { value: 'E', label: 'Blok E' },
    { value: 'F', label: 'Blok F' },
    { value: 'G', label: 'Blok G' },
    { value: 'H', label: 'Blok H' },
  ],
  statusDomisili: [
    { value: 'ALL', label: 'Semua Domisili' },
    { value: 'TETAP', label: 'Tetap' },
    { value: 'KONTRAK_SEWA', label: 'Kontrak / Sewa' },
    { value: 'KOS', label: 'Kos' },
  ],
  jenisKelamin: [
    { value: 'ALL', label: 'Semua Gender' },
    { value: 'L', label: 'Laki-Laki (L)' },
    { value: 'P', label: 'Perempuan (P)' },
  ],
  kelompokUsia: [
    { value: 'ALL', label: 'Semua Usia' },
    { value: 'U1', label: 'U1 Anak (0–12 Thn)' },
    { value: 'BAYI', label: '↳ Bayi (0–<1 Thn)' },
    { value: 'BATITA', label: '↳ Batita (1–<3 Thn)' },
    { value: 'BALITA', label: '↳ Balita (3–<5 Thn)' },
    { value: 'ANAK', label: '↳ Anak (5–12 Thn)' },
    { value: 'U2', label: 'U2 Remaja (13–17 Thn)' },
    { value: 'U3', label: 'U3 Dewasa Muda (18–29 Thn)' },
    { value: 'U4', label: 'U4 Dewasa (30–59 Thn)' },
    { value: 'U5', label: 'U5 Lansia (≥60 Thn)' },
  ],
  pendidikan: [
    { value: 'ALL', label: 'Semua Pendidikan' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA/SMK', label: 'SMA/SMK' },
    { value: 'D1', label: 'D1' },
    { value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'D4', label: 'D4' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
  ],
  pekerjaan: [
    { value: 'ALL', label: 'Semua Pekerjaan' },
    { value: 'P1', label: 'P1 Pelajar/Mahasiswa' },
    { value: 'P2', label: 'P2 PNS/ASN' },
    { value: 'P3', label: 'P3 TNI/Polri' },
    { value: 'P4', label: 'P4 Karyawan/Pegawai Swasta' },
    { value: 'P5', label: 'P5 Wiraswasta/Pengusaha' },
    { value: 'P6', label: 'P6 Profesional' },
    { value: 'P7', label: 'P7 Pedagang' },
    { value: 'P8', label: 'P8 Petani/Peternak/Nelayan' },
    { value: 'P9', label: 'P9 Ibu Rumah Tangga' },
    { value: 'P10', label: 'P10 Pekerja Harian/Buruh' },
    { value: 'P11', label: 'P11 Pensiunan' },
    { value: 'P12', label: 'P12 Tidak Bekerja' },
    { value: 'P13', label: 'P13 Lainnya/Belum Terklasifikasi' },
  ],
  statusPerkawinan: [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'BELUM_KAWIN', label: 'Belum Kawin' },
    { value: 'KAWIN', label: 'Kawin' },
    { value: 'CERAI_HIDUP', label: 'Cerai Hidup' },
    { value: 'CERAI_MATI', label: 'Cerai Mati' },
  ],
};
