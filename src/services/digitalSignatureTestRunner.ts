/**
 * digitalSignatureTestRunner.ts
 * AUTOMATED SECURITY & DIGITAL SIGNATURE TEST SUITE
 * SMART RT 07 RW 11 GPA NGIJO
 * 
 * Verifies TEST 1 through TEST 15 per Specification:
 * TEST 1: Generate surat -> QR dibuat
 * TEST 2: Scan QR -> VALID
 * TEST 3: Modify document -> INVALID_HASH
 * TEST 4: Revoke document -> REVOKED
 * TEST 5: Unknown document -> NOT_FOUND
 * TEST 6: Expired document -> EXPIRED
 * TEST 7: Signer = Eko Sucahyono -> PASS
 * TEST 8: Signer = Sutrisno -> REJECT
 * TEST 9: Place = Karangploso -> PASS
 * TEST 10: Place = Malang -> REJECT
 * TEST 11: QR tanpa registry -> REJECT
 * TEST 12: Hash mismatch -> SECURITY WARNING
 * TEST 13: Public user melihat QR -> tidak dapat melihat NIK/KK lengkap
 * TEST 14: Warga mencoba membuat signature -> 403 FORBIDDEN
 * TEST 15: Pengurus mencoba approve tanpa hak -> 403 FORBIDDEN
 */

import {
  InternalVerificationProvider,
  calculateDocumentSHA256Sync,
  getSignatureMetadataByDocId,
  saveSignatureMetadata,
  revokeSignature,
  getAuthoritativeTimestamp
} from './digitalSignatureService';
import {
  verifyDocumentById,
  maskNIK,
  maskKK,
  maskPhoneNumber,
  maskAddress,
  getStoredDigitalDocuments,
  saveDigitalDocumentStore
} from './documentService';
import { CanonicalDocumentPayload, SignatureMetadata } from '../types/digitalSignature';
import { DOCUMENT_BRANDING } from '../config/documentBranding';

export interface TestCaseResult {
  id: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  actualResult: string;
  expectedResult: string;
  details?: string;
  executionTimeMs: number;
}

export interface SecuritySignatureSuiteReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  results: TestCaseResult[];
}

export class DigitalSignatureTestRunner {
  static async runAllTests(): Promise<SecuritySignatureSuiteReport> {
    const results: TestCaseResult[] = [];
    const provider = new InternalVerificationProvider();

    // -------------------------------------------------------------
    // TEST 1: Generate surat -> QR dibuat
    // -------------------------------------------------------------
    const t1Start = performance.now();
    const testDocId = `TEST-DOC-${Date.now()}`;
    const testPayload: CanonicalDocumentPayload = {
      documentId: testDocId,
      nomorSurat: '999/RT07-RW11/VIII/2026',
      jenisSurat: 'Surat Domisili',
      tanggalSurat: '2026-08-16',
      letterPlace: 'Karangploso',
      chairmanName: 'Eko Sucahyono',
      chairmanTitle: 'Ketua RT 07 RW 11',
      contentVersion: 'v2.0'
    };

    const signResult = await provider.signDocument(testPayload, {
      userId: 'usr_ketua_rt_07',
      role: 'KETUA_RT',
      name: 'Eko Sucahyono',
      title: 'Ketua RT 07 RW 11'
    });

    const t1Pass = signResult.success && !!signResult.signatureMetadata?.shortHash;
    results.push({
      id: 'TEST 1',
      name: 'Generate Surat & Pembuatan QR Token',
      category: 'GENERATION',
      status: t1Pass ? 'PASS' : 'FAIL',
      expectedResult: 'QR Token dibuat & signature metadata tersimpan',
      actualResult: t1Pass ? `PASS: Signature ID ${signResult.signatureMetadata?.signatureId} created with Hash ${signResult.signatureMetadata?.shortHash}` : `FAIL: ${signResult.message}`,
      executionTimeMs: Math.round(performance.now() - t1Start)
    });

    // -------------------------------------------------------------
    // TEST 2: Scan QR -> VALID
    // -------------------------------------------------------------
    const t2Start = performance.now();
    const verifyT2 = await provider.verifySignature(signResult.signatureMetadata!, testPayload);
    const t2Pass = verifyT2.status === 'VALID' && verifyT2.isValid === true && !verifyT2.tampered;
    results.push({
      id: 'TEST 2',
      name: 'Scan QR Verification',
      category: 'VERIFICATION',
      status: t2Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Status VALID, Tampered = false',
      actualResult: t2Pass ? 'PASS: Status VALID & Document Authenticity Verified' : `FAIL: ${verifyT2.message}`,
      executionTimeMs: Math.round(performance.now() - t2Start)
    });

    // -------------------------------------------------------------
    // TEST 3: Modify document -> INVALID_HASH
    // -------------------------------------------------------------
    const t3Start = performance.now();
    const tamperedPayload: CanonicalDocumentPayload = {
      ...testPayload,
      nomorSurat: '999/RT07-RW11/VIII/2026-TAMPERED' // Modifying content after signature
    };
    const verifyT3 = await provider.verifySignature(signResult.signatureMetadata!, tamperedPayload);
    const t3Pass = verifyT3.status === 'INVALID_HASH' && verifyT3.isValid === false && verifyT3.tampered === true;
    results.push({
      id: 'TEST 3',
      name: 'Document Tampering Detection',
      category: 'TAMPER_DETECTION',
      status: t3Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Status INVALID_HASH, Tampered = true',
      actualResult: t3Pass ? `PASS: INVALID_HASH detected (${verifyT3.securityWarning})` : `FAIL: ${verifyT3.message}`,
      executionTimeMs: Math.round(performance.now() - t3Start)
    });

    // -------------------------------------------------------------
    // TEST 4: Revoke document -> REVOKED
    // -------------------------------------------------------------
    const t4Start = performance.now();
    const revokeRes = revokeSignature(testDocId, 'Eko Sucahyono', 'Uji Coba Pencabutan Dokumen Resmi');
    const verifyT4 = await provider.verifySignature(revokeRes.metadata!, testPayload);
    const t4Pass = revokeRes.success && verifyT4.status === 'REVOKED';
    results.push({
      id: 'TEST 4',
      name: 'Document Revocation Flow',
      category: 'LIFECYCLE',
      status: t4Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Status REVOKED & Tidak Berlaku',
      actualResult: t4Pass ? 'PASS: Status REVOKED correctly returned on public verify' : 'FAIL: Document not revoked properly',
      executionTimeMs: Math.round(performance.now() - t4Start)
    });

    // -------------------------------------------------------------
    // TEST 5: Unknown document -> NOT_FOUND
    // -------------------------------------------------------------
    const t5Start = performance.now();
    const verifyT5 = verifyDocumentById('DOC-UNKNOWN-9999999');
    const t5Pass = !verifyT5.found && verifyT5.statusText.includes('Tidak Ditemukan');
    results.push({
      id: 'TEST 5',
      name: 'Unknown Document Lookup',
      category: 'VERIFICATION',
      status: t5Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Found = false, Status NOT_FOUND',
      actualResult: t5Pass ? 'PASS: Unknown document rejected with NOT_FOUND' : 'FAIL: Found unknown document',
      executionTimeMs: Math.round(performance.now() - t5Start)
    });

    // -------------------------------------------------------------
    // TEST 6: Expired document -> EXPIRED
    // -------------------------------------------------------------
    const t6Start = performance.now();
    const expiredMeta: SignatureMetadata = {
      ...signResult.signatureMetadata!,
      signatureId: `SIG-EXPIRED-${Date.now()}`,
      documentId: 'DOC-EXPIRED-TEST-01',
      signatureStatus: 'EXPIRED'
    };
    const verifyT6 = await provider.verifySignature(expiredMeta, testPayload);
    const t6Pass = verifyT6.status === 'EXPIRED' && verifyT6.isValid === false;
    results.push({
      id: 'TEST 6',
      name: 'Expired Document Detection',
      category: 'LIFECYCLE',
      status: t6Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Status EXPIRED',
      actualResult: t6Pass ? 'PASS: Status EXPIRED correctly returned' : 'FAIL: Expired not handled',
      executionTimeMs: Math.round(performance.now() - t6Start)
    });

    // -------------------------------------------------------------
    // TEST 7: Signer = Eko Sucahyono -> PASS
    // -------------------------------------------------------------
    const t7Start = performance.now();
    const p7: CanonicalDocumentPayload = {
      ...testPayload,
      documentId: `TEST-DOC-7-${Date.now()}`,
      chairmanName: 'Eko Sucahyono'
    };
    const resT7 = await provider.signDocument(p7, {
      userId: 'usr_ketua_rt_07',
      role: 'KETUA_RT',
      name: 'Eko Sucahyono',
      title: 'Ketua RT 07 RW 11'
    });
    const t7Pass = resT7.success === true;
    results.push({
      id: 'TEST 7',
      name: 'Signer Validation (Eko Sucahyono)',
      category: 'IDENTITY_VALIDATION',
      status: t7Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Signing Allowed (PASS)',
      actualResult: t7Pass ? 'PASS: Official Chairman signature approved' : `FAIL: ${resT7.message}`,
      executionTimeMs: Math.round(performance.now() - t7Start)
    });

    // -------------------------------------------------------------
    // TEST 8: Signer = Sutrisno -> REJECT
    // -------------------------------------------------------------
    const t8Start = performance.now();
    const p8: CanonicalDocumentPayload = {
      ...testPayload,
      documentId: `TEST-DOC-8-${Date.now()}`,
      chairmanName: 'Sutrisno' // Legacy fake signer
    };
    const resT8 = await provider.signDocument(p8, {
      userId: 'usr_fake_01',
      role: 'KETUA_RT',
      name: 'Sutrisno',
      title: 'Ketua RT'
    });
    const t8Pass = resT8.success === false && (resT8.errorCode === 'INVALID_SIGNER_IDENTITY' || resT8.message.includes('DITOLAK'));
    results.push({
      id: 'TEST 8',
      name: 'Signer Validation (Legacy Sutrisno Reject)',
      category: 'IDENTITY_VALIDATION',
      status: t8Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Signing REJECTED',
      actualResult: t8Pass ? `PASS: Rejected properly with "${resT8.message}"` : 'FAIL: Non-official signer accepted!',
      executionTimeMs: Math.round(performance.now() - t8Start)
    });

    // -------------------------------------------------------------
    // TEST 9: Place = Karangploso -> PASS
    // -------------------------------------------------------------
    const t9Start = performance.now();
    const p9: CanonicalDocumentPayload = {
      ...testPayload,
      documentId: `TEST-DOC-9-${Date.now()}`,
      letterPlace: 'Karangploso'
    };
    const resT9 = await provider.signDocument(p9, {
      userId: 'usr_ketua_rt_07',
      role: 'KETUA_RT',
      name: 'Eko Sucahyono',
      title: 'Ketua RT 07 RW 11'
    });
    const t9Pass = resT9.success === true;
    results.push({
      id: 'TEST 9',
      name: 'Letter Place Validation (Karangploso)',
      category: 'BRANDING_LOCK',
      status: t9Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Place Karangploso Accepted (PASS)',
      actualResult: t9Pass ? 'PASS: Karangploso accepted as official letter place' : `FAIL: ${resT9.message}`,
      executionTimeMs: Math.round(performance.now() - t9Start)
    });

    // -------------------------------------------------------------
    // TEST 10: Place = Malang -> REJECT
    // -------------------------------------------------------------
    const t10Start = performance.now();
    const p10: CanonicalDocumentPayload = {
      ...testPayload,
      documentId: `TEST-DOC-10-${Date.now()}`,
      letterPlace: 'Malang' // Non-authorized generic place
    };
    const resT10 = await provider.signDocument(p10, {
      userId: 'usr_ketua_rt_07',
      role: 'KETUA_RT',
      name: 'Eko Sucahyono',
      title: 'Ketua RT 07 RW 11'
    });
    const t10Pass = resT10.success === false && resT10.errorCode === 'INVALID_LETTER_PLACE';
    results.push({
      id: 'TEST 10',
      name: 'Letter Place Validation (Malang Reject)',
      category: 'BRANDING_LOCK',
      status: t10Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Place Malang REJECTED',
      actualResult: t10Pass ? `PASS: Rejected invalid place with "${resT10.message}"` : 'FAIL: Non-authorized place accepted!',
      executionTimeMs: Math.round(performance.now() - t10Start)
    });

    // -------------------------------------------------------------
    // TEST 11: QR tanpa registry -> REJECT
    // -------------------------------------------------------------
    const t11Start = performance.now();
    const verifyT11 = verifyDocumentById('QR-UNREGISTERED-TOKEN-009');
    const t11Pass = !verifyT11.found;
    results.push({
      id: 'TEST 11',
      name: 'Unregistered QR Code Rejection',
      category: 'REGISTRY_INTEGRITY',
      status: t11Pass ? 'PASS' : 'FAIL',
      expectedResult: 'Unregistered QR Rejected',
      actualResult: t11Pass ? 'PASS: Unregistered QR rejected with NOT_FOUND' : 'FAIL: Unregistered QR accepted!',
      executionTimeMs: Math.round(performance.now() - t11Start)
    });

    // -------------------------------------------------------------
    // TEST 12: Hash mismatch -> SECURITY WARNING
    // -------------------------------------------------------------
    const t12Start = performance.now();
    const hackedPayload: CanonicalDocumentPayload = {
      ...testPayload,
      documentId: testDocId,
      tanggalSurat: '2026-08-99' // Illegal date
    };
    const verifyT12 = await provider.verifySignature(signResult.signatureMetadata!, hackedPayload);
    const t12Pass = verifyT12.status === 'INVALID_HASH' && !!verifyT12.securityWarning;
    results.push({
      id: 'TEST 12',
      name: 'Hash Mismatch Security Warning Trigger',
      category: 'SECURITY_INTEGRITY',
      status: t12Pass ? 'PASS' : 'FAIL',
      expectedResult: 'SECURITY WARNING Triggered & Status INVALID_HASH',
      actualResult: t12Pass ? `PASS: ${verifyT12.securityWarning}` : 'FAIL: Security warning missing',
      executionTimeMs: Math.round(performance.now() - t12Start)
    });

    // -------------------------------------------------------------
    // TEST 13: Public user melihat QR -> tidak dapat melihat NIK/KK lengkap
    // -------------------------------------------------------------
    const t13Start = performance.now();
    const rawNIK = '3507120101900004';
    const rawKK = '3507120101900001';
    const rawPhone = '081234567890';
    const rawAddress = 'Perum GPA Ngijo Blok C-12, RT 07 RW 11';

    const maskedNikVal = maskNIK(rawNIK);
    const maskedKkVal = maskKK(rawKK);
    const maskedPhoneVal = maskPhoneNumber(rawPhone);
    const maskedAddressVal = maskAddress(rawAddress);

    const t13Pass =
      !maskedNikVal.includes('010190') &&
      maskedNikVal.includes('******') &&
      !maskedKkVal.includes('010190') &&
      maskedKkVal.includes('******') &&
      maskedPhoneVal.includes('****');

    results.push({
      id: 'TEST 13',
      name: 'Citizen Privacy & Data Masking',
      category: 'PRIVACY_PROTECTION',
      status: t13Pass ? 'PASS' : 'FAIL',
      expectedResult: 'NIK, KK, Phone Masked (Zero plain PII to public)',
      actualResult: t13Pass ? `PASS: NIK masked as ${maskedNikVal}, KK masked as ${maskedKkVal}, Phone masked as ${maskedPhoneVal}` : 'FAIL: Plain personal PII exposed!',
      executionTimeMs: Math.round(performance.now() - t13Start)
    });

    // -------------------------------------------------------------
    // TEST 14: Warga mencoba membuat signature -> 403 FORBIDDEN
    // -------------------------------------------------------------
    const t14Start = performance.now();
    const resT14 = await provider.signDocument(testPayload, {
      userId: 'usr_warga_001',
      role: 'WARGA',
      name: 'Hendrik Prasetyo',
      title: 'Warga'
    });
    const t14Pass = resT14.success === false && (resT14.errorCode === 'FORBIDDEN_WARGA_SIGN' || resT14.message.includes('403'));
    results.push({
      id: 'TEST 14',
      name: 'RBAC: Warga Forbidden from Signing (403)',
      category: 'RBAC_SECURITY',
      status: t14Pass ? 'PASS' : 'FAIL',
      expectedResult: '403 FORBIDDEN',
      actualResult: t14Pass ? `PASS: ${resT14.message}` : 'FAIL: Warga was allowed to sign!',
      executionTimeMs: Math.round(performance.now() - t14Start)
    });

    // -------------------------------------------------------------
    // TEST 15: Pengurus mencoba approve tanpa hak -> 403 FORBIDDEN
    // -------------------------------------------------------------
    const t15Start = performance.now();
    const resT15 = await provider.signDocument(testPayload, {
      userId: 'usr_pengurus_seksi_keamanan',
      role: 'PENGURUS',
      name: 'Budi Santoso',
      title: 'Seksi Keamanan'
    });
    const t15Pass = resT15.success === false && (resT15.errorCode === 'FORBIDDEN_PENGURUS_NO_RIGHTS' || resT15.message.includes('403'));
    results.push({
      id: 'TEST 15',
      name: 'RBAC: Unauthorized Pengurus Sign Reject (403)',
      category: 'RBAC_SECURITY',
      status: t15Pass ? 'PASS' : 'FAIL',
      expectedResult: '403 FORBIDDEN',
      actualResult: t15Pass ? `PASS: ${resT15.message}` : 'FAIL: Unauthorized pengurus signed!',
      executionTimeMs: Math.round(performance.now() - t15Start)
    });

    const passedCount = results.filter(r => r.status === 'PASS').length;
    const failedCount = results.filter(r => r.status === 'FAIL').length;

    return {
      timestamp: getAuthoritativeTimestamp(),
      totalTests: results.length,
      passedTests: passedCount,
      failedTests: failedCount,
      allPassed: failedCount === 0,
      results
    };
  }
}
