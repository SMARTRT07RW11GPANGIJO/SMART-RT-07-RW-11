/**
 * DataDTOs.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — DATA TRANSFER OBJECTS & CLASSIFICATION
 */

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'PRIVATE' | 'SENSITIVE' | 'RESTRICTED';

export interface ResidentDTO {
  id_warga: string;
  nama_lengkap: string;
  blok: string;
  nomor_rumah: string;
  status_keluarga: string;
  status_warga: string;
  nik_masked: string;
  no_kk_masked: string;
  no_hp_masked: string;
}

export interface LetterDTO {
  id_surat: string;
  jenis_surat: string;
  id_warga: string;
  nama_pemohon: string;
  tanggal_pengajuan: string;
  status: string;
  keterangan: string;
}

export interface PaymentDTO {
  id_iuran: string;
  id_warga: string;
  periode: string;
  jumlah: number;
  tanggal_bayar: string;
  status: string;
  metode: string;
}

export interface ComplaintDTO {
  id_pengaduan: string;
  id_warga: string;
  kategori: string;
  judul: string;
  status: string;
  tanggal: string;
  tanggapan: string;
}

export interface FinanceDTO {
  bulan_tahun: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  status_audit: string;
}

export interface DocumentDTO {
  id_dokumen: string;
  id_warga: string;
  nama_dokumen: string;
  kategori: string;
  tanggal_upload: string;
  status: string;
}

export interface ResidentStatsDTO {
  total_kk: number;
  total_warga: number;
  warga_tetap: number;
  warga_kontrak: number;
  lansia: number;
  balita: number;
}

export interface DataToolResult<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
}
