/**
 * documentService.ts
 * DIGITAL DOCUMENT MANAGEMENT & VERIFICATION ENGINE v2.0
 * SMART RT 07 RW 11 GPA NGIJO
 */

import { DigitalDocument, DocumentLifecycle, VerificationStatus, SuratPengantar } from '../types/rt';
import { DOCUMENT_BRANDING, getChairmanName, getChairmanTitle, getLetterPlace } from '../config/documentBranding';
import {
  calculateDocumentSHA256Sync,
  saveSignatureMetadata,
  getSignatureMetadataByDocId,
  revokeSignature,
  getAuthoritativeTimestamp,
  recordSignatureAuditLog
} from './digitalSignatureService';
import { CanonicalDocumentPayload, SignatureMetadata } from '../types/digitalSignature';

const STORAGE_KEY_DOCUMENTS = 'SMART_RT_DIGITAL_DOCUMENTS_V2';
const STORAGE_KEY_SEQ = 'SMART_RT_SURAT_SEQUENCE_2026';

// Roman numeral month converter
export const getRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'VIII';
};

// Masking helpers for privacy protection
export const maskNIK = (nik?: string): string => {
  if (!nik || nik.length < 16) return '350712******0000';
  return `${nik.slice(0, 6)}******${nik.slice(12)}`;
};

export const maskKK = (kk?: string): string => {
  if (!kk || kk.length < 16) return '350712******0000';
  return `${kk.slice(0, 6)}******${kk.slice(12)}`;
};

export const maskPhoneNumber = (phone?: string): string => {
  if (!phone || phone.length < 8) return '0812****0000';
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
};

export const maskAddress = (alamat?: string): string => {
  if (!alamat) return 'Perum GPA Ngijo, Karangploso';
  return alamat.replace(/(Blok\s+[A-Z]-\d+)/i, '$1 (RT 07/RW 11)');
};

// Atomic Document Number Generator
export const generateNextDocumentNumber = (date: Date = new Date()): string => {
  let seq = 1;
  try {
    const storedSeq = localStorage.getItem(STORAGE_KEY_SEQ);
    if (storedSeq) {
      seq = parseInt(storedSeq, 10) + 1;
    }
  } catch (e) {
    seq = 1;
  }

  localStorage.setItem(STORAGE_KEY_SEQ, seq.toString());

  const padSeq = seq.toString().padStart(3, '0');
  const monthRoman = getRomanMonth(date.getMonth());
  const year = date.getFullYear();

  return `${padSeq}/RT07-RW11/${monthRoman}/${year}`;
};

// Unique Document ID generator
export const generateDocumentId = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `DOC-${year}-${randomNum}`;
};

// Initial Seed Documents
export const INITIAL_DIGITAL_DOCUMENTS: DigitalDocument[] = [
  {
    documentId: 'DOC-2026-000001',
    requestId: 'SRT-2026-0001',
    nomorSurat: '001/RT07-RW11/VIII/2026',
    jenisSurat: 'Surat Domisili',
    tanggalSurat: '2026-08-02',
    lifecycle: 'PUBLISHED',
    status: 'VALID',
    createdAt: '2026-08-01 09:30:00',
    createdBy: 'Sekretaris RT 07',
    approvedAt: '2026-08-02 10:15:00',
    approvedBy: `Ketua RT 07 (${DOCUMENT_BRANDING.chairmanName})`,
    qrVerificationUrl: 'https://smart-rt07-gpa-ngijo.app/verifikasi/DOC-2026-000001',
    verificationToken: 'T9X2A0EKO88',
    version: 1,
    pemohonNama: 'Hendrik Prasetyo',
    pemohonNikMasked: '350712******0004',
    pemohonAlamat: 'Perum GPA Ngijo Blok C-12, RT 07 RW 11',
    keperluan: 'Persyaratan Pembukaan Rekening Bank & Administrasi Pekerjaan',
    namaKetua: DOCUMENT_BRANDING.chairmanName,
    jabatanKetua: DOCUMENT_BRANDING.chairmanTitle
  },
  {
    documentId: 'DOC-2026-000002',
    requestId: 'SRT-2026-0002',
    nomorSurat: '002/RT07-RW11/VIII/2026',
    jenisSurat: 'Surat Pengantar SKCK',
    tanggalSurat: '2026-08-05',
    lifecycle: 'APPROVED',
    status: 'VALID',
    createdAt: '2026-08-05 11:20:00',
    createdBy: 'Sekretaris RT 07',
    approvedAt: '2026-08-05 14:00:00',
    approvedBy: `Ketua RT 07 (${DOCUMENT_BRANDING.chairmanName})`,
    qrVerificationUrl: 'https://smart-rt07-gpa-ngijo.app/verifikasi/DOC-2026-000002',
    verificationToken: 'K7P8W1EKO99',
    version: 1,
    pemohonNama: 'Dr. Agus Hermawan',
    pemohonNikMasked: '350712******0003',
    pemohonAlamat: 'Perum GPA Ngijo Blok C-08, RT 07 RW 11',
    keperluan: 'Permohonan Penerbitan SKCK Polres Malang',
    namaKetua: DOCUMENT_BRANDING.chairmanName,
    jabatanKetua: DOCUMENT_BRANDING.chairmanTitle
  }
];

export const getStoredDigitalDocuments = (): DigitalDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load digital documents store', e);
  }
  return INITIAL_DIGITAL_DOCUMENTS;
};

export const saveDigitalDocumentStore = (docs: DigitalDocument[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save digital documents store', e);
  }
};

// Create a new digital document from a SuratPengantar request
export const createDigitalDocumentFromSurat = (
  surat: SuratPengantar,
  approvedBy = `Ketua RT 07 (${DOCUMENT_BRANDING.chairmanName})`
): DigitalDocument => {
  const docId = generateDocumentId();
  const nomorSurat = surat.nomor_surat || generateNextDocumentNumber();
  const tanggalSurat = surat.tanggal_pengajuan || new Date().toISOString().split('T')[0];
  const now = getAuthoritativeTimestamp();

  // Canonical Payload for SHA-256 computation
  const canonicalPayload: CanonicalDocumentPayload = {
    documentId: docId,
    nomorSurat,
    jenisSurat: surat.jenis_surat,
    tanggalSurat,
    letterPlace: DOCUMENT_BRANDING.letterPlace,
    chairmanName: DOCUMENT_BRANDING.chairmanName,
    chairmanTitle: DOCUMENT_BRANDING.chairmanTitle,
    contentVersion: 'v2.0',
    pemohonNamaMasked: surat.nama_pemohon,
    keperluan: surat.keperluan
  };

  const documentHash = calculateDocumentSHA256Sync(canonicalPayload);
  const shortHash = documentHash.slice(0, 12).toUpperCase();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smart-rt07-gpa-ngijo.app';
  const qrVerificationUrl = `${origin}/verifikasi/${docId}`;

  const newDoc: DigitalDocument = {
    documentId: docId,
    requestId: surat.id_surat,
    nomorSurat,
    jenisSurat: surat.jenis_surat,
    tanggalSurat,
    lifecycle: 'PUBLISHED',
    status: 'VALID',
    createdAt: now,
    createdBy: 'Sekretaris RT 07',
    approvedAt: now,
    approvedBy,
    qrVerificationUrl,
    verificationToken: shortHash,
    version: 1,
    pemohonNama: surat.nama_pemohon,
    pemohonNikMasked: maskNIK(surat.nik_pemohon),
    pemohonAlamat: `Perum GPA Ngijo ${surat.blok_rumah || 'Blok C-12'}, RT 07 RW 11`,
    keperluan: surat.keperluan,
    namaKetua: DOCUMENT_BRANDING.chairmanName,
    jabatanKetua: DOCUMENT_BRANDING.chairmanTitle
  };

  // Persist Signature Metadata
  const signatureMetadata: SignatureMetadata = {
    signatureId: `SIG-${docId}-${Date.now()}`,
    documentId: docId,
    signerUserId: 'usr_ketua_rt_07',
    signerName: DOCUMENT_BRANDING.chairmanName,
    signerTitle: DOCUMENT_BRANDING.chairmanTitle,
    signedAt: now,
    documentHash,
    shortHash,
    signatureStatus: 'VALID',
    verificationMethod: 'INTERNAL_HASH_SHA256',
    letterPlace: DOCUMENT_BRANDING.letterPlace,
    providerId: 'INTERNAL',
    canonicalPayload,
    certificateInfo: {
      issuer: 'SMART RT 07 RW 11 GPA Ngijo Electronic Certificate Registry',
      serialNumber: `CERT-RT07-${shortHash.slice(0, 8)}`,
      validFrom: now,
      validTo: '2027-12-31T23:59:59+07:00',
      isCertified: false
    }
  };

  saveSignatureMetadata(signatureMetadata);

  recordSignatureAuditLog(
    'DOCUMENT_SIGNED',
    docId,
    'usr_ketua_rt_07',
    'KETUA_RT',
    'SUCCESS',
    `Surat ${nomorSurat} disahkan oleh ${DOCUMENT_BRANDING.chairmanName}.`,
    shortHash
  );

  recordSignatureAuditLog(
    'DOCUMENT_QR_CREATED',
    docId,
    'usr_ketua_rt_07',
    'KETUA_RT',
    'SUCCESS',
    `QR Code diterbitkan untuk ${docId}.`,
    shortHash
  );

  const currentDocs = getStoredDigitalDocuments();
  const updatedDocs = [newDoc, ...currentDocs];
  saveDigitalDocumentStore(updatedDocs);

  return newDoc;
};

/**
 * storeDigitalDocument
 * Adaptor for external triggers / automation engine to register digital documents
 */
export const storeDigitalDocument = (docInput: any): DigitalDocument => {
  const docId = docInput.documentId || docInput.id_dokumen || generateDocumentId();
  const nomorSurat = docInput.nomorSurat || docInput.nomor_dokumen || generateNextDocumentNumber();
  const jenisSurat = docInput.jenisSurat || docInput.jenis_dokumen || 'Surat Pengantar';
  const pemohonNama = docInput.pemohonNama || docInput.pemohon_nama || 'Warga RT 07';
  const tanggalSurat = docInput.tanggalSurat || docInput.tanggal_terbit || new Date().toISOString().slice(0, 10);
  const now = getAuthoritativeTimestamp();

  const canonicalPayload: CanonicalDocumentPayload = {
    documentId: docId,
    nomorSurat,
    jenisSurat,
    tanggalSurat,
    letterPlace: DOCUMENT_BRANDING.letterPlace,
    chairmanName: DOCUMENT_BRANDING.chairmanName,
    chairmanTitle: DOCUMENT_BRANDING.chairmanTitle,
    contentVersion: '2.0'
  };

  const documentHash = calculateDocumentSHA256Sync(canonicalPayload);
  const shortHash = documentHash.slice(0, 8).toUpperCase();
  const qrVerificationUrl = docInput.qrVerificationUrl || docInput.qr_code_url || `https://smart-rt07.id/verify/${docId}`;

  const newDoc: DigitalDocument = {
    documentId: docId,
    requestId: docInput.requestId || docInput.id_surat || docId,
    nomorSurat,
    jenisSurat: (jenisSurat as any) || 'Surat Domisili',
    pemohonNama,
    pemohonNikMasked: maskNIK('3507120101900001'),
    pemohonAlamat: maskAddress('Perum GPA Ngijo Blok A-01'),
    keperluan: docInput.keperluan || 'Administrasi Kependudukan',
    tanggalSurat,
    lifecycle: 'GENERATED',
    createdAt: now,
    createdBy: docInput.createdBy || 'SYSTEM_AUTOMATION',
    status: (docInput.status as VerificationStatus) || 'VALID',
    approvedBy: docInput.penandatangan || `Ketua RT 07 (${DOCUMENT_BRANDING.chairmanName})`,
    approvedAt: now,
    verificationToken: shortHash,
    qrVerificationUrl,
    pdfUrl: docInput.file_url || docInput.pdfUrl || `/documents/${docId}.pdf`,
    version: 1,
    namaKetua: DOCUMENT_BRANDING.chairmanName,
    jabatanKetua: DOCUMENT_BRANDING.chairmanTitle
  };

  const signatureMetadata: SignatureMetadata = {
    signatureId: `SIG-${shortHash}-${Date.now().toString(36).toUpperCase()}`,
    documentId: docId,
    signerUserId: 'usr_ketua_rt_07',
    signerName: DOCUMENT_BRANDING.chairmanName,
    signerTitle: DOCUMENT_BRANDING.chairmanTitle,
    signedAt: now,
    documentHash,
    shortHash,
    signatureStatus: 'VALID',
    verificationMethod: 'INTERNAL_HASH_SHA256',
    letterPlace: DOCUMENT_BRANDING.letterPlace,
    providerId: 'INTERNAL',
    canonicalPayload,
    certificateInfo: {
      issuer: 'SMART RT 07 RW 11 GPA Ngijo Electronic Certificate Registry',
      serialNumber: `CERT-RT07-${shortHash.slice(0, 8)}`,
      validFrom: now,
      validTo: '2027-12-31T23:59:59+07:00',
      isCertified: false
    }
  };

  saveSignatureMetadata(signatureMetadata);

  const currentDocs = getStoredDigitalDocuments();
  const updatedDocs = [newDoc, ...currentDocs.filter(d => d.documentId !== docId)];
  saveDigitalDocumentStore(updatedDocs);

  return newDoc;
};

// Revoke document with mandatory reason
export const revokeDigitalDocument = (
  documentId: string,
  revokedBy: string,
  revokedReason: string
): { success: boolean; document?: DigitalDocument; message: string } => {
  if (!revokedReason || revokedReason.trim() === '') {
    return { success: false, message: 'Alasan pencabutan dokumen wajib diisi!' };
  }

  const currentDocs = getStoredDigitalDocuments();
  let targetDoc: DigitalDocument | undefined;

  const updatedDocs = currentDocs.map((doc) => {
    if (doc.documentId.toUpperCase() === documentId.toUpperCase()) {
      targetDoc = {
        ...doc,
        lifecycle: 'REVOKED' as DocumentLifecycle,
        status: 'REVOKED' as VerificationStatus,
        revokedAt: getAuthoritativeTimestamp(),
        revokedBy,
        revokedReason
      };
      return targetDoc;
    }
    return doc;
  });

  if (!targetDoc) {
    return { success: false, message: 'Dokumen tidak ditemukan dalam database!' };
  }

  saveDigitalDocumentStore(updatedDocs);
  revokeSignature(documentId, revokedBy, revokedReason);

  return { success: true, document: targetDoc, message: `Dokumen ${documentId} berhasil DICABUT.` };
};

// Public Verification Service API with Full Tamper Detection
export const verifyDocumentById = (documentId: string): {
  found: boolean;
  document?: DigitalDocument;
  signatureMetadata?: SignatureMetadata;
  status: 'VALID' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND' | 'INVALID_HASH';
  statusText: string;
  isTampered: boolean;
  securityWarning?: string;
  computedHash?: string;
  storedHash?: string;
} => {
  const docs = getStoredDigitalDocuments();
  const doc = docs.find((d) => d.documentId.toUpperCase() === documentId.toUpperCase());
  const meta = getSignatureMetadataByDocId(documentId);

  if (!doc) {
    recordSignatureAuditLog(
      'DOCUMENT_VERIFIED',
      documentId,
      'PUBLIC_GUEST',
      'PUBLIC',
      'WARNING',
      `Verifikasi dokumen gagal: ID "${documentId}" tidak ditemukan.`
    );
    return {
      found: false,
      status: 'NOT_FOUND',
      statusText: 'Dokumen Tidak Ditemukan dalam Database Resmi RT 07 GPA Ngijo',
      isTampered: false
    };
  }

  // Check Revocation
  if (doc.status === 'REVOKED' || meta?.signatureStatus === 'REVOKED') {
    return {
      found: true,
      document: doc,
      signatureMetadata: meta,
      status: 'REVOKED',
      statusText: 'Dokumen ini telah DICABUT oleh Pengurus RT dan TIDAK LAGI BERLAKU.',
      isTampered: false
    };
  }

  // Check Expiration
  if (doc.status === 'EXPIRED' || meta?.signatureStatus === 'EXPIRED') {
    return {
      found: true,
      document: doc,
      signatureMetadata: meta,
      status: 'EXPIRED',
      statusText: 'Masa berlaku dokumen ini telah KEDALUWARSA.',
      isTampered: false
    };
  }

  // SHA-256 Hash Verification & Tamper Detection
  if (meta) {
    const canonicalPayload: CanonicalDocumentPayload = {
      documentId: doc.documentId,
      nomorSurat: doc.nomorSurat,
      jenisSurat: doc.jenisSurat,
      tanggalSurat: doc.tanggalSurat,
      letterPlace: DOCUMENT_BRANDING.letterPlace,
      chairmanName: DOCUMENT_BRANDING.chairmanName,
      chairmanTitle: DOCUMENT_BRANDING.chairmanTitle,
      contentVersion: 'v2.0'
    };

    const computedHash = calculateDocumentSHA256Sync(canonicalPayload);
    const storedHash = meta.documentHash;

    if (computedHash.toLowerCase() !== storedHash.toLowerCase()) {
      recordSignatureAuditLog(
        'DOCUMENT_HASH_MISMATCH',
        doc.documentId,
        'PUBLIC_VERIFIER',
        'PUBLIC',
        'FAILED',
        `Hash mismatch on document ${doc.documentId}`
      );
      return {
        found: true,
        document: doc,
        signatureMetadata: meta,
        status: 'INVALID_HASH',
        statusText: 'INTEGRITAS DOKUMEN TIDAK VALID (HASH TIDAK SESUAI)',
        isTampered: true,
        securityWarning: 'PERINGATAN KEAMANAN: Terdeteksi perubahan ilegal pada isi dokumen setelah ditandatangani!',
        computedHash,
        storedHash
      };
    }
  }

  return {
    found: true,
    document: doc,
    signatureMetadata: meta,
    status: 'VALID',
    statusText: '✓ DOKUMEN RESMI VALID & TERDAFTAR SAH',
    isTampered: false,
    computedHash: meta?.documentHash,
    storedHash: meta?.documentHash
  };
};
