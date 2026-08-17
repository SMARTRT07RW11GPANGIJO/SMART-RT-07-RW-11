// In-Memory localStorage shim for Node test runner
const storageMap: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storageMap[key] || null,
  setItem: (key: string, val: string) => { storageMap[key] = val; },
  removeItem: (key: string) => { delete storageMap[key]; },
  clear: () => { for (const k in storageMap) delete storageMap[k]; }
};

import { ResidentFamilyService } from './src/services/residentFamilyService';
import { DOCUMENT_BRANDING, OFFICIAL_LETTERHEAD, assertOfficialLetterheadIntegrity } from './src/config/documentBranding';
import { OwnerDataIsolationService } from './src/services/ownerDataIsolationService';
import { INITIAL_WARGA, INITIAL_KELUARGA } from './src/data/mockData';
import {
  internalSignatureProvider,
  calculateDocumentSHA256Sync
} from './src/services/digitalSignatureService';
import { CanonicalDocumentPayload } from './src/types/digitalSignature';

async function main() {
  console.log('============================================================');
  console.log('PRODUCTION REGRESSION & QA AUDIT SUITE v1.0');
  console.log('SMART RT 07 RW 11 GPA NGIJO');
  console.log('============================================================');

  interface TestResult {
    id: string;
    category: string;
    name: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL';
    evidence?: string;
  }

  const results: TestResult[] = [];

  // 1. BASELINE DOCUMENT ENGINE TEST
  let kopCheck = false;
  try {
    assertOfficialLetterheadIntegrity();
    kopCheck = 
      OFFICIAL_LETTERHEAD.logoWidth === 82 &&
      OFFICIAL_LETTERHEAD.logoHeight === 98 &&
      OFFICIAL_LETTERHEAD.headerHeight === 100 &&
      DOCUMENT_BRANDING.letterPlace === 'Karangploso' &&
      DOCUMENT_BRANDING.chairmanName === 'Eko Sucahyono' &&
      DOCUMENT_BRANDING.chairmanTitle === 'Ketua RT 07 RW 11' &&
      DOCUMENT_BRANDING.organizationName === 'RUKUN TETANGGA 07 RUKUN WARGA 11' &&
      DOCUMENT_BRANDING.housingName === 'PERUMAHAN GPA NGIJO' &&
      DOCUMENT_BRANDING.district === 'KECAMATAN KARANGPLOSO' &&
      DOCUMENT_BRANDING.regency === 'KABUPATEN MALANG';
  } catch (e) {
    kopCheck = false;
  }

  results.push({
    id: 'DOC-001',
    category: 'Document Engine Baseline',
    name: 'Locked Letterhead & Signer Constants Verification',
    expected: 'Logo 82x98, Header 100, City Karangploso, Signer Eko Sucahyono, Title Ketua RT 07 RW 11',
    actual: `Logo ${OFFICIAL_LETTERHEAD.logoWidth}x${OFFICIAL_LETTERHEAD.logoHeight}, City ${DOCUMENT_BRANDING.letterPlace}, Signer ${DOCUMENT_BRANDING.chairmanName}`,
    status: kopCheck ? 'PASS' : 'FAIL',
    evidence: JSON.stringify(OFFICIAL_LETTERHEAD)
  });

  // 2. FAMILY-001: Creation and Multiple Members Linking
  ResidentFamilyService.syncInitialData(INITIAL_WARGA, INITIAL_KELUARGA);

  const kkRes = ResidentFamilyService.createKeluarga({
    no_kk: '3507123456789012',
    nomorKK: '3507123456789012',
    nama_kepala_keluarga: 'Budi Santoso',
    blok: 'Blok C-09',
    alamat: 'Perum GPA Ngijo Blok C-09',
    jumlah_anggota: 4,
    status_rumah: 'Milik Sendiri',
    no_hp: '081234567890'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  const familyId = kkRes.data?.keluargaId || '';

  const w1 = ResidentFamilyService.createWarga({
    nama_lengkap: 'Budi Santoso',
    nik: '3507120101800001',
    no_kk: '3507123456789012',
    nomorKK: '3507123456789012',
    keluargaId: familyId,
    blok: 'Blok C-09',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    statusWarga: 'TETAP',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1980-01-01',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'PNS',
    no_hp: '081234567890',
    email: 'budi@example.com',
    alamat: 'Perum GPA Ngijo Blok C-09',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: '2020-01-01'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  const w2 = ResidentFamilyService.createWarga({
    nama_lengkap: 'Siti Aminah',
    nik: '3507124102850002',
    no_kk: '3507123456789012',
    nomorKK: '3507123456789012',
    keluargaId: familyId,
    blok: 'Blok C-09',
    hubunganKeluarga: 'ISTRI',
    statusWarga: 'TETAP',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1985-02-01',
    jenis_kelamin: 'Perempuan',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'Guru',
    no_hp: '081234567891',
    email: 'siti@example.com',
    alamat: 'Perum GPA Ngijo Blok C-09',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: '2020-01-01'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  const w3 = ResidentFamilyService.createWarga({
    nama_lengkap: 'Ahmad Santoso',
    nik: '3507121503100003',
    no_kk: '3507123456789012',
    nomorKK: '3507123456789012',
    keluargaId: familyId,
    blok: 'Blok C-09',
    hubunganKeluarga: 'ANAK',
    statusWarga: 'TETAP',
    tempat_lahir: 'Malang',
    tanggal_lahir: '2010-03-15',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Belum Kawin',
    agama: 'Islam',
    pendidikan: 'SMP',
    pekerjaan: 'Pelajar',
    no_hp: '',
    email: 'ahmad@example.com',
    alamat: 'Perum GPA Ngijo Blok C-09',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: '2020-01-01'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  const w4 = ResidentFamilyService.createWarga({
    nama_lengkap: 'Aisyah Santoso',
    nik: '3507125005150004',
    no_kk: '3507123456789012',
    nomorKK: '3507123456789012',
    keluargaId: familyId,
    blok: 'Blok C-09',
    hubunganKeluarga: 'ANAK',
    statusWarga: 'TETAP',
    tempat_lahir: 'Malang',
    tanggal_lahir: '2015-05-10',
    jenis_kelamin: 'Perempuan',
    status_perkawinan: 'Belum Kawin',
    agama: 'Islam',
    pendidikan: 'SD',
    pekerjaan: 'Pelajar',
    no_hp: '',
    email: 'aisyah@example.com',
    alamat: 'Perum GPA Ngijo Blok C-09',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: '2020-01-01'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  const familyMembers = ResidentFamilyService.getAnggotaKeluarga(familyId, '3507123456789012');

  results.push({
    id: 'REL-001',
    category: 'Relational Integrity',
    name: 'TEST FAMILY-001: 1 Keluarga, 4 Anggota Relasional',
    expected: '1 Keluarga, 4 Anggota terhubung dengan nomorKK & keluargaId sama',
    actual: `Ditemukan ${familyMembers.length} anggota dengan keluargaId ${familyId}`,
    status: (familyMembers.length === 4 && familyMembers.every(m => m.keluargaId === familyId)) ? 'PASS' : 'FAIL',
    evidence: `Anggota: ${familyMembers.map(m => `${m.nama_lengkap} (${m.hubunganKeluarga})`).join(', ')}`
  });

  // 3. NIK VALIDATION TEST
  const invalidNiks = ['123', '123456789012345', '12345678901234567', 'ABC1234567890123'];
  const nikTestPassed = invalidNiks.every(n => !ResidentFamilyService.isValid16Digits(n)) && ResidentFamilyService.isValid16Digits('3507123456789012');

  results.push({
    id: 'VAL-001',
    category: 'Validation',
    name: 'NIK 16 Digit Format Validation',
    expected: 'Hanya 16 digit numerik yang lolos validasi',
    actual: nikTestPassed ? 'Strictly 16 digits enforced' : 'Validation flaw detected',
    status: nikTestPassed ? 'PASS' : 'FAIL',
    evidence: `Tested invalid: ${invalidNiks.join(', ')}`
  });

  // 4. DUPLICATE NIK PROTECTION
  const dupNikRes = ResidentFamilyService.createWarga({
    nama_lengkap: 'Budi Santoso Clone',
    nik: '3507120101800001', // Already registered
    no_kk: '3507123456789012',
    blok: 'Blok C-09',
    statusWarga: 'TETAP',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1980-01-01',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'PNS',
    no_hp: '081234567890',
    email: 'budi_clone@example.com',
    alamat: 'Perum GPA Ngijo Blok C-09',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    tanggal_masuk: '2020-01-01'
  }, { userId: 'ADMIN-01', role: 'Ketua RT' });

  results.push({
    id: 'VAL-002',
    category: 'Integrity',
    name: 'Duplicate NIK Protection',
    expected: 'REJECT dengan pesan "NIK sudah terdaftar"',
    actual: dupNikRes.success ? 'ACCEPTED (FAIL)' : `REJECTED: ${dupNikRes.error}`,
    status: (!dupNikRes.success && dupNikRes.error?.includes('sudah terdaftar')) ? 'PASS' : 'FAIL',
    evidence: dupNikRes.error
  });

  // 5. CONDITIONAL REGISTRATION TESTS
  // TETAP
  const tetapCheck = ResidentFamilyService.validateWarga({
    nama_lengkap: 'Warga Tetap',
    nik: '3507120101990001',
    blok: 'Blok C-01',
    statusWarga: 'TETAP'
  });

  // KONTRAK_SEWA without owner
  const kontrakEmpty = ResidentFamilyService.validateWarga({
    nama_lengkap: 'Warga Kontrak Kosong',
    nik: '3507120101990002',
    blok: 'Blok C-01',
    statusWarga: 'KONTRAK_SEWA',
    namaPemilikRumah: '',
    teleponPemilikRumah: ''
  });

  // KOS with valid owner
  const kosValid = ResidentFamilyService.validateWarga({
    nama_lengkap: 'Warga Kos Lengkap',
    nik: '3507120101990003',
    blok: 'Blok C-01',
    statusWarga: 'KOS',
    namaPemilikRumah: 'H. Sudarsono',
    teleponPemilikRumah: '081299887766'
  });

  results.push({
    id: 'COND-001',
    category: 'Conditional Logic',
    name: 'Conditional Housing Status (TETAP vs KONTRAK/KOS)',
    expected: 'TETAP tidak wajib data pemilik; KONTRAK/KOS wajib data pemilik',
    actual: `TETAP: ${tetapCheck.valid}, KONTRAK_EMPTY: ${kontrakEmpty.valid}, KOS_VALID: ${kosValid.valid}`,
    status: (tetapCheck.valid && !kontrakEmpty.valid && kosValid.valid) ? 'PASS' : 'FAIL',
    evidence: `Error for empty owner: ${kontrakEmpty.error}`
  });

  // 6. OWNER DATA ISOLATION & PRIVACY TEST
  const userProfileRes = OwnerDataIsolationService.getSecuredProfile({
    sessionId: 'sess_test_123',
    userId: 'WRG-001',
    role: 'WARGA',
    isValid: true,
    isExpired: false,
    isRevoked: false,
    isUserActive: true
  });

  const isNikMasked = userProfileRes?.nikMasked?.includes('******');
  const isKkMasked = userProfileRes?.noKkMasked?.includes('******');

  results.push({
    id: 'SEC-001',
    category: 'Security & Privacy',
    name: 'Owner Data Isolation & Privacy Masking',
    expected: 'Data pribadi disamarkan (masked) untuk profil warga non-admin',
    actual: `NIK Masked: ${userProfileRes?.nikMasked}, KK Masked: ${userProfileRes?.noKkMasked}`,
    status: (isNikMasked && isKkMasked) ? 'PASS' : 'FAIL',
    evidence: `Masked format verified: ${userProfileRes?.nikMasked}`
  });

  // 7. DOCUMENT ENGINE DOMISILI GENERATION & VERIFICATION
  const payload: CanonicalDocumentPayload = {
    documentId: 'DOC-2026-TEST-001',
    nomorSurat: '045/RT07-RW11/SKD/VIII/2026',
    jenisSurat: 'Surat Keterangan Domisili',
    tanggalSurat: '2026-08-17',
    letterPlace: DOCUMENT_BRANDING.letterPlace,
    chairmanName: DOCUMENT_BRANDING.chairmanName,
    chairmanTitle: DOCUMENT_BRANDING.chairmanTitle,
    contentVersion: 'v2.0'
  };

  const hash = calculateDocumentSHA256Sync(payload);
  const signRes = await internalSignatureProvider.signDocument(payload, {
    userId: 'ketua_rt_07',
    role: 'KETUA_RT',
    name: DOCUMENT_BRANDING.chairmanName,
    title: DOCUMENT_BRANDING.chairmanTitle
  });

  let verifyRes: any = { isValid: false, tampered: true };
  if (signRes.signatureMetadata) {
    verifyRes = await internalSignatureProvider.verifySignature(signRes.signatureMetadata, payload);
  }

  const docEnginePassed = 
    payload.letterPlace === 'Karangploso' &&
    payload.chairmanName === 'Eko Sucahyono' &&
    payload.chairmanTitle === 'Ketua RT 07 RW 11' &&
    signRes.success === true &&
    verifyRes.isValid === true &&
    verifyRes.tampered === false;

  results.push({
    id: 'DOC-002',
    category: 'Document Engine v2.0',
    name: 'Surat Domisili Generator + Digital Signature + QR Verification',
    expected: 'Place Karangploso, Signer Eko Sucahyono, SHA-256 Valid & Non-tampered',
    actual: `SignSuccess: ${signRes.success}, Place: ${payload.letterPlace}, Signer: ${payload.chairmanName}, SHA-256: ${hash.slice(0, 16)}... (Valid: ${verifyRes.isValid}, Tampered: ${verifyRes.tampered})`,
    status: docEnginePassed ? 'PASS' : 'FAIL',
    evidence: `SHA-256: ${hash} | SignMsg: ${signRes.message}`
  });

  console.log('\n============================================================');
  console.log('RESULTS TABLE:');
  console.log('============================================================');
  results.forEach(r => {
    console.log(`[${r.status}] ${r.id} (${r.category}): ${r.name}`);
    console.log(`       Expected: ${r.expected}`);
    console.log(`       Actual:   ${r.actual}`);
    if (r.evidence) console.log(`       Evidence: ${r.evidence}`);
  });

  const allPassed = results.every(r => r.status === 'PASS');
  console.log('\n============================================================');
  console.log(`FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED - PRODUCTION READY' : 'TESTS FAILED'}`);
  console.log('============================================================');

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal Test Suite Execution Error:', err);
  process.exit(1);
});
