// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8A AI DATA ACCESS LAYER (DAL)
// Enforces Zero Trust, Least Privilege, Sanitization, and Resource Ownership before querying data.

import { UserRole, Warga, StatusSurat, StatusPengaduan } from '../types/rt';
import { 
  requireAuthenticatedUser, 
  requirePermission, 
  requireResourceOwnership, 
  sanitizeDataForAI,
  logAIAuditEntry
} from './aiAuthorizationService';

export interface PublicInfoPayload {
  rtName: string;
  rwName: string;
  perumahan: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  pengurusContacts: { jabatan: string; nama: string; hpMasked: string }[];
  announcements: { id: string; judul: string; tanggal: string; isi: string }[];
}

// 1. PUBLIC_READ Tool
export async function getPublicInformation(): Promise<PublicInfoPayload> {
  logAIAuditEntry({
    userId: 'ANONYMOUS_PUBLIC',
    role: 'PUBLIC',
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getPublicInformation',
    tool: 'getPublicInformation',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    rtName: 'RT 07',
    rwName: 'RW 11',
    perumahan: 'Griya Permata Alam (GPA)',
    kelurahan: 'Ngijo',
    kecamatan: 'Karangploso',
    kabupaten: 'Malang',
    pengurusContacts: [
      { jabatan: 'Ketua RT 07', nama: 'Bpk. Heru Tri', hpMasked: '0812****8890' },
      { jabatan: 'Sekretaris RT', nama: 'Bpk. Ahmad Fauzi', hpMasked: '0813****1234' },
      { jabatan: 'Bendahara RT', nama: 'Ibu Ratna Dewi', hpMasked: '0815****5678' }
    ],
    announcements: [
      {
        id: 'ANN-001',
        judul: 'Kerja Bakti Masal Menyambut HUT RI ke-81',
        tanggal: '2026-08-10',
        isi: 'Diimbau kepada seluruh warga RT 07 RW 11 untuk hadir dalam kerja bakti pada hari Minggu pukul 06.30 WIB.'
      },
      {
        id: 'ANN-002',
        judul: 'Jadwal Ronda Malam & Pos Kamling Agustus 2026',
        tanggal: '2026-08-01',
        isi: 'Jadwal ronda malam telah diperbarui di papan pengumuman RT dan portal warga.'
      }
    ]
  };
}

// 2. READ_SELF Tools
export async function getMyProfile(role: UserRole, userId: string, activeWargaList: Warga[]) {
  const permCheck = requirePermission(role, 'PROFILE_SELF', userId, 'getMyProfile', 'getMyProfile');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const found = activeWargaList.find(w => w.id_warga === userId || w.nik === userId);
  if (!found) {
    return { success: false, error: 'Data profil warga tidak ditemukan.' };
  }

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getMyProfile',
    tool: 'getMyProfile',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  // Sanitized profile returned to AI
  return {
    success: true,
    data: sanitizeDataForAI(found)
  };
}

export async function getMyLetters(role: UserRole, userId: string, allLetters: any[]) {
  const permCheck = requirePermission(role, 'LETTER_READ_SELF', userId, 'getMyLetters', 'getMyLetters');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const userLetters = allLetters.filter(l => l.id_warga === userId || l.nama_pemohon?.toLowerCase().includes(userId.toLowerCase()));

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getMyLetters',
    tool: 'getMyLetters',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(userLetters)
  };
}

export async function getMyLetterStatus(role: UserRole, userId: string, letterId: string, allLetters: any[]) {
  const permCheck = requirePermission(role, 'LETTER_READ_SELF', userId, 'getMyLetterStatus', 'getMyLetterStatus');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const letter = allLetters.find(l => l.id_surat === letterId);
  if (!letter) {
    return { success: false, error: `Surat dengan ID ${letterId} tidak ditemukan.` };
  }

  // Ownership Guard
  const ownerCheck = requireResourceOwnership(role, userId, letter.id_warga, 'LETTER_READ_ALL');
  if (!ownerCheck.allowed) {
    return { success: false, error: ownerCheck.reason };
  }

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getMyLetterStatus',
    tool: 'getMyLetterStatus',
    resourceId: letterId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(letter)
  };
}

export async function getMyPayments(role: UserRole, userId: string, allPayments: any[]) {
  const permCheck = requirePermission(role, 'PAYMENT_READ_SELF', userId, 'getMyPayments', 'getMyPayments');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const userPayments = allPayments.filter(p => p.id_warga === userId);

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getMyPayments',
    tool: 'getMyPayments',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(userPayments)
  };
}

export async function getMyComplaints(role: UserRole, userId: string, allComplaints: any[]) {
  const permCheck = requirePermission(role, 'COMPLAINT_READ_SELF', userId, 'getMyComplaints', 'getMyComplaints');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const userComplaints = allComplaints.filter(c => c.id_warga === userId || c.nama_pelapor?.toLowerCase().includes(userId.toLowerCase()));

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getMyComplaints',
    tool: 'getMyComplaints',
    resourceId: userId,
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(userComplaints)
  };
}

// 3. MUTATION Tools
export async function createLetterRequest(role: UserRole, userId: string, letterData: any, onSubmitCallback: (data: any) => Promise<any>) {
  const permCheck = requirePermission(role, 'LETTER_CREATE', userId, 'createLetterRequest', 'createLetterRequest');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  try {
    const result = await onSubmitCallback(letterData);
    logAIAuditEntry({
      userId,
      role,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: 'createLetterRequest',
      tool: 'createLetterRequest',
      resourceId: result.id_surat || 'NEW',
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });
    return { success: true, data: result };
  } catch (err: any) {
    logAIAuditEntry({
      userId,
      role,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: 'createLetterRequest',
      tool: 'createLetterRequest',
      result: 'ERROR',
      decision: 'ALLOWED',
      deniedReason: err.message
    });
    return { success: false, error: err.message };
  }
}

export async function createComplaint(role: UserRole, userId: string, complaintData: any, onSubmitCallback: (data: any) => Promise<any>) {
  const permCheck = requirePermission(role, 'COMPLAINT_CREATE', userId, 'createComplaint', 'createComplaint');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  try {
    const result = await onSubmitCallback(complaintData);
    logAIAuditEntry({
      userId,
      role,
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      action: 'createComplaint',
      tool: 'createComplaint',
      resourceId: result.id_pengaduan || 'NEW',
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. STAFF / PENGURUS / KETUA_RT Tools
export async function getAssignedLetters(role: UserRole, userId: string, allLetters: any[]) {
  const permCheck = requirePermission(role, 'LETTER_READ_ALL', userId, 'getAssignedLetters', 'getAssignedLetters');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getAssignedLetters',
    tool: 'getAssignedLetters',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(allLetters)
  };
}

export async function getFinanceSummary(role: UserRole, userId: string, financeData: any) {
  const permCheck = requirePermission(role, 'FINANCE_READ', userId, 'getFinanceSummary', 'getFinanceSummary');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'getFinanceSummary',
    tool: 'getFinanceSummary',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(financeData)
  };
}

// 5. ADMIN Tools
export async function searchResidents(role: UserRole, userId: string, query: string, allWarga: Warga[]) {
  const permCheck = requirePermission(role, 'RESIDENT_MANAGE', userId, 'searchResidents', 'searchResidents');
  if (!permCheck.allowed) {
    return { success: false, error: permCheck.reason };
  }

  const filtered = allWarga.filter(w => 
    w.nama_lengkap.toLowerCase().includes(query.toLowerCase()) ||
    w.alamat.toLowerCase().includes(query.toLowerCase())
  );

  logAIAuditEntry({
    userId,
    role,
    sessionId: `SESS-${Date.now().toString().slice(-6)}`,
    action: 'searchResidents',
    tool: 'searchResidents',
    result: 'SUCCESS',
    decision: 'ALLOWED'
  });

  return {
    success: true,
    data: sanitizeDataForAI(filtered)
  };
}
