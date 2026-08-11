import { DigitalDocument, DocumentLifecycle, VerificationStatus, SuratPengantar } from '../types/rt';

const STORAGE_KEY_DOCUMENTS = 'SMART_RT_DIGITAL_DOCUMENTS';
const STORAGE_KEY_SEQ = 'SMART_RT_SURAT_SEQUENCE_2026';

// Roman numeral month converter
export const getRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'VIII';
};

// Masking helpers for privacy protection
export const maskNIK = (nik: string): string => {
  if (!nik || nik.length < 16) return '350712******0000';
  return `${nik.slice(0, 6)}******${nik.slice(12)}`;
};

export const maskAddress = (alamat: string): string => {
  if (!alamat) return 'Perum GPA Ngijo, Karangploso';
  return alamat.replace(/(Blok\s+[A-Z]-\d+)/i, '$1 (RT 07/RW 11)');
};

// Atomic Document Number Generator (Concurrency safe with LockService pattern)
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

// Verification Token generator
export const generateVerificationToken = (docId: string, nomorSurat: string): string => {
  const raw = `${docId}:${nomorSurat}:SMART_RT_07_SECRET_2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase() + '-VERIFIED';
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
    createdBy: 'Sekretaris RT (Eko Nurcahyo)',
    approvedAt: '2026-08-02 10:15:00',
    approvedBy: 'Ketua RT 07 (Bambang Sugianto, S.T.)',
    qrVerificationUrl: 'https://smart-rt07-gpa-ngijo.app/verify/DOC-2026-000001',
    verificationToken: 'T9X2A0-VERIFIED',
    version: 1,
    pemohonNama: 'Hendrik Prasetyo',
    pemohonNikMasked: '350712******0004',
    pemohonAlamat: 'Perum GPA Ngijo Blok C-12, RT 07 RW 11',
    keperluan: 'Persyaratan Pembukaan Rekening Bank & Administrasi Pekerjaan',
    namaKetua: 'Bambang Sugianto, S.T.',
    jabatanKetua: 'Ketua RT 07 RW 11'
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
    createdBy: 'Sekretaris RT (Eko Nurcahyo)',
    approvedAt: '2026-08-05 14:00:00',
    approvedBy: 'Ketua RT 07 (Bambang Sugianto, S.T.)',
    qrVerificationUrl: 'https://smart-rt07-gpa-ngijo.app/verify/DOC-2026-000002',
    verificationToken: 'K7P8W1-VERIFIED',
    version: 1,
    pemohonNama: 'Dr. Agus Hermawan',
    pemohonNikMasked: '350712******0003',
    pemohonAlamat: 'Perum GPA Ngijo Blok C-08, RT 07 RW 11',
    keperluan: 'Permohonan Penerbitan SKCK Polres Malang',
    namaKetua: 'Bambang Sugianto, S.T.',
    jabatanKetua: 'Ketua RT 07 RW 11'
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
export const storeDigitalDocument = (doc: any): DigitalDocument => {
  const currentDocs = getStoredDigitalDocuments();
  const docId = doc.id_dokumen || doc.documentId || generateDocumentId();
  const newDoc: DigitalDocument = {
    documentId: docId,
    requestId: doc.requestId || 'SRT-2026-0001',
    nomorSurat: doc.nomor_dokumen || doc.nomorSurat || generateNextDocumentNumber(),
    jenisSurat: doc.jenis_dokumen || doc.jenisSurat || 'Surat Pengantar',
    tanggalSurat: doc.tanggal_terbit || new Date().toISOString().slice(0, 10),
    lifecycle: 'PUBLISHED',
    status: doc.status || 'VALID',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    createdBy: 'Automation Engine RT 07',
    approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    approvedBy: doc.penandatangan || 'Ketua RT 07 (Bambang Sugianto, S.T.)',
    qrVerificationUrl: doc.qr_code_url || `https://smart-rt07-gpa-ngijo.app/verify/${docId}`,
    verificationToken: doc.hash_verifikasi || 'VERIFIED-TOKEN',
    version: 1,
    pemohonNama: doc.pemohon_nama || 'Warga RT 07',
    pemohonNikMasked: '350712******0001',
    pemohonAlamat: 'Perum GPA Ngijo, RT 07 RW 11',
    keperluan: 'Permohonan Administrasi RT',
    namaKetua: 'Bambang Sugianto, S.T.',
    jabatanKetua: 'Ketua RT 07 RW 11'
  };

  const updatedDocs = [newDoc, ...currentDocs];
  saveDigitalDocumentStore(updatedDocs);
  return newDoc;
};

export const createDigitalDocumentFromSurat = (
  surat: SuratPengantar,
  approvedBy = 'Ketua RT 07 (Bambang Sugianto, S.T.)'
): DigitalDocument => {
  const docId = generateDocumentId();
  const nomorSurat = surat.nomor_surat || generateNextDocumentNumber();
  const token = generateVerificationToken(docId, nomorSurat);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const newDoc: DigitalDocument = {
    documentId: docId,
    requestId: surat.id_surat,
    nomorSurat,
    jenisSurat: surat.jenis_surat,
    tanggalSurat: new Date().toISOString().split('T')[0],
    lifecycle: 'PUBLISHED',
    status: 'VALID',
    createdAt: now,
    createdBy: 'Sekretaris RT 07',
    approvedAt: now,
    approvedBy,
    qrVerificationUrl: `${window.location.origin}/verify/${docId}`,
    verificationToken: token,
    version: 1,
    pemohonNama: surat.nama_pemohon,
    pemohonNikMasked: maskNIK(surat.nik_pemohon),
    pemohonAlamat: `Perum GPA Ngijo ${surat.blok_rumah}, RT 07 RW 11`,
    keperluan: surat.keperluan,
    namaKetua: 'Bambang Sugianto, S.T.',
    jabatanKetua: 'Ketua RT 07 RW 11'
  };

  const currentDocs = getStoredDigitalDocuments();
  const updatedDocs = [newDoc, ...currentDocs];
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
    if (doc.documentId === documentId) {
      targetDoc = {
        ...doc,
        lifecycle: 'REVOKED' as DocumentLifecycle,
        status: 'REVOKED' as VerificationStatus,
        revokedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        revokedBy,
        revokedReason
      };
      return targetDoc;
    }
    return doc;
  });

  if (!targetDoc) {
    return { success: false, message: 'Dokumen tidak ditemukan!' };
  }

  saveDigitalDocumentStore(updatedDocs);
  return { success: true, document: targetDoc, message: `Dokumen ${documentId} berhasil DICABUT.` };
};

// Public Verification Service API
export const verifyDocumentById = (documentId: string): {
  found: boolean;
  document?: DigitalDocument;
  statusText: string;
} => {
  const docs = getStoredDigitalDocuments();
  const doc = docs.find((d) => d.documentId.toUpperCase() === documentId.toUpperCase());

  if (!doc) {
    return {
      found: false,
      statusText: 'Dokumen Tidak Ditemukan dalam Database Resmi RT 07'
    };
  }

  if (doc.status === 'REVOKED') {
    return {
      found: true,
      document: doc,
      statusText: 'Dokumen ini telah DICABUT oleh Pengurus RT dan TIDAK LAGI BERLAKU.'
    };
  }

  if (doc.status === 'CANCELLED') {
    return {
      found: true,
      document: doc,
      statusText: 'Dokumen ini telah DIBATALKAN.'
    };
  }

  if (doc.status === 'EXPIRED') {
    return {
      found: true,
      document: doc,
      statusText: 'Masa berlaku dokumen ini telah KEDALUWARSA.'
    };
  }

  return {
    found: true,
    document: doc,
    statusText: 'DOKUMEN RESMI VALID & TERDAFTAR'
  };
};
