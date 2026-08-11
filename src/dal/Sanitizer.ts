/**
 * Sanitizer.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — DATA SANITIZATION & FIELD-LEVEL MASKING
 */

import { ResidentDTO, LetterDTO, PaymentDTO, ComplaintDTO, FinanceDTO, DocumentDTO } from './DataDTOs';

export function maskNIK(nik?: string | null): string {
  if (!nik) return '******';
  const s = String(nik).trim();
  if (s.length <= 6) return '******';
  return `${s.substring(0, 6)}******${s.substring(s.length - 4)}`;
}

export function maskKK(kk?: string | null): string {
  if (!kk) return '******';
  const s = String(kk).trim();
  if (s.length <= 6) return '******';
  return `${s.substring(0, 6)}******${s.substring(s.length - 4)}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '****';
  const s = String(phone).trim();
  if (s.length <= 4) return '****';
  return `${s.substring(0, 4)}****${s.substring(s.length - 2)}`;
}

export function sanitizeResidentDTO(raw: any): ResidentDTO {
  return {
    id_warga: String(raw.id_warga || ''),
    nama_lengkap: String(raw.nama_lengkap || ''),
    blok: String(raw.blok || ''),
    nomor_rumah: String(raw.nomor_rumah || ''),
    status_keluarga: String(raw.status_keluarga || ''),
    status_warga: String(raw.status_warga || ''),
    nik_masked: maskNIK(raw.nik),
    no_kk_masked: maskKK(raw.no_kk),
    no_hp_masked: maskPhone(raw.no_hp)
  };
}

export function sanitizeLetterDTO(raw: any): LetterDTO {
  return {
    id_surat: String(raw.id_surat || ''),
    jenis_surat: String(raw.jenis_surat || ''),
    id_warga: String(raw.id_warga || ''),
    nama_pemohon: String(raw.nama_pemohon || ''),
    tanggal_pengajuan: String(raw.tanggal_pengajuan || ''),
    status: String(raw.status || ''),
    keterangan: String(raw.keterangan || '')
  };
}

export function sanitizePaymentDTO(raw: any): PaymentDTO {
  return {
    id_iuran: String(raw.id_iuran || ''),
    id_warga: String(raw.id_warga || ''),
    periode: String(raw.periode || ''),
    jumlah: Number(raw.jumlah || 0),
    tanggal_bayar: String(raw.tanggal_bayar || ''),
    status: String(raw.status || ''),
    metode: String(raw.metode || 'TRANSFER')
  };
}

export function sanitizeComplaintDTO(raw: any): ComplaintDTO {
  return {
    id_pengaduan: String(raw.id_pengaduan || ''),
    id_warga: String(raw.id_warga || ''),
    kategori: String(raw.kategori || ''),
    judul: String(raw.judul || ''),
    status: String(raw.status || ''),
    tanggal: String(raw.tanggal || ''),
    tanggapan: String(raw.tanggapan || '')
  };
}

export function sanitizeFinanceDTO(raw: any): FinanceDTO {
  return {
    bulan_tahun: String(raw.bulan_tahun || ''),
    total_pemasukan: Number(raw.total_pemasukan || 0),
    total_pengeluaran: Number(raw.total_pengeluaran || 0),
    saldo_akhir: Number(raw.saldo_akhir || 0),
    status_audit: String(raw.status_audit || 'AUDITED')
  };
}

export function sanitizeDocumentDTO(raw: any): DocumentDTO {
  return {
    id_dokumen: String(raw.id_dokumen || ''),
    id_warga: String(raw.id_warga || ''),
    nama_dokumen: String(raw.nama_dokumen || ''),
    kategori: String(raw.kategori || ''),
    tanggal_upload: String(raw.tanggal_upload || ''),
    status: String(raw.status || '')
  };
}

/**
 * Data Minimization Helper: Filter object to only requested keys to avoid leakage.
 */
export function applyDataMinimization<T extends Record<string, any>>(data: T, allowedFields: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {};
  for (const field of allowedFields) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}
