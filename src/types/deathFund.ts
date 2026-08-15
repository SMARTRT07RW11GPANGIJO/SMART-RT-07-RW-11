/**
 * deathFund.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * MODUL DANA KEMATIAN v1.0 — PRODUCTION READY
 *
 * Strict isolation types for FundType = DANA_KEMATIAN.
 */

import { FundType } from './finance';

export type StatusPesertaDK = 'AKTIF' | 'NONAKTIF' | 'KELUAR';
export type StatusIuranDK = 'BELUM_BAYAR' | 'MENUNGGAK' | 'SEBAGIAN' | 'LUNAS';
export type StatusKejadianDK = 'DILAPORKAN' | 'DIVERIFIKASI' | 'DIPROSES' | 'SELESAI';
export type StatusSantunanDK = 'DRAFT' | 'DIAJUKAN' | 'DISETUJUI' | 'DIBAYARKAN' | 'DITOLAK';
export type StatusRekonsiliasiDK = 'MATCH' | 'UNMATCHED' | 'REVIEW';

export type MetodePembayaranDK = 'TUNAI' | 'TRANSFER' | 'QRIS' | 'LAINNYA';

export type KategoriPemasukanDK = 
  | 'Iuran Peserta'
  | 'Donasi'
  | 'Bantuan'
  | 'Saldo Awal'
  | 'Pengembalian Dana'
  | 'Pemasukan Lainnya';

export type KategoriPengeluaranDK = 
  | 'Santunan'
  | 'Pemakaman'
  | 'Transportasi'
  | 'Konsumsi'
  | 'Administrasi'
  | 'Bantuan Keluarga'
  | 'Kebutuhan Duka'
  | 'Lainnya';

export type HubunganKeluargaDK = 'BAPAK' | 'IBU' | 'ANAK' | 'ANGGOTA' | 'KEPALA_KELUARGA' | 'LAINNYA' | string;

export interface AnggotaKeluargaDK {
  id: string;
  idPeserta: string;
  nama: string;
  hubungan: HubunganKeluargaDK;
  statusKepesertaan: 'AKTIF' | 'NONAKTIF';
  tanggalMulai: string;
  tanggalBerakhir?: string;
  tanggalLahir?: string;
  catatan?: string;
}

export interface PesertaDanaKematian {
  idPeserta: string;
  nomorKKInternal: string;
  namaKepalaKeluarga: string;
  jumlahAnggota: number;
  status: StatusPesertaDK;
  tanggalBergabung: string;
  tanggalKeluar?: string;
  keterangan?: string;
  noHp?: string;
  blokRumah?: string;
  nomorRumah?: string;
  anggotaKeluarga?: AnggotaKeluargaDK[];
  createdAt: string;
  updatedAt: string;
}

export interface IuranTagihanDK {
  invoiceId: string;
  pesertaId: string;
  namaKepalaKeluarga: string;
  blokRumah?: string;
  nomorRumah?: string;
  periode: string; // e.g. "Agustus 2026"
  bulan: number; // 1 - 12
  tahun: number; // e.g. 2026
  amount: number; // Tagihan
  paidAmount: number; // Jumlah yang sudah terbayar
  status: StatusIuranDK;
  paidAt?: string;
  paymentMethod?: MetodePembayaranDK;
  transactionId?: string;
  verifiedBy?: string;
  qrisPayload?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PemasukanDK {
  id: string;
  tanggal: string;
  nomorTransaksi: string;
  sumber: string;
  kategori: KategoriPemasukanDK;
  keterangan: string;
  nominal: number;
  metode: MetodePembayaranDK;
  buktiUrl?: string;
  petugas: string;
  fundType: FundType.DANA_KEMATIAN;
  idPeserta?: string;
  invoiceId?: string;
  createdAt: string;
}

export interface PengeluaranDK {
  id: string;
  tanggal: string;
  nomorTransaksi: string;
  kejadianId?: string;
  penerima: string;
  kategori: KategoriPengeluaranDK;
  keterangan: string;
  nominal: number;
  metode: MetodePembayaranDK;
  buktiUrl?: string;
  petugas: string;
  fundType: FundType.DANA_KEMATIAN;
  overrideApprovedBy?: string;
  overrideReason?: string;
  createdAt: string;
}

export interface KejadianKematianDK {
  idKejadian: string;
  tanggalKejadian: string;
  idPeserta: string;
  nomorKKInternal?: string;
  namaKepalaKeluarga: string;
  namaAlmarhum: string;
  hubungan: HubunganKeluargaDK;
  tanggalMeninggal: string;
  tempatMeninggal?: string;
  keterangan?: string;
  status: StatusKejadianDK;
  petugasPelapor: string;
  verifiedBy?: string;
  verifiedAt?: string;
  dokumenSuratKematianUrl?: string;
  santunanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SantunanDK {
  idSantunan: string;
  idKejadian: string;
  idPeserta: string;
  namaPenerima: string;
  hubunganPenerima: string;
  tanggal: string;
  jenisBantuan: string; // e.g. "Santunan Duka Utama", "Bantuan Pemakaman"
  nominal: number;
  keterangan: string;
  status: StatusSantunanDK;
  disetujuiOleh?: string;
  disetujuiPada?: string;
  dibayarkanOleh?: string;
  dibayarkanPada?: string;
  metodeBayar?: MetodePembayaranDK;
  buktiBayarUrl?: string;
  alasanPenolakan?: string;
  fundType: FundType.DANA_KEMATIAN;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransactionDK {
  transactionId: string;
  fundType: FundType.DANA_KEMATIAN;
  transactionType: 'INCOME' | 'EXPENSE' | 'REVERSAL';
  category: string;
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  payerOrRecipient: string;
  createdBy: string;
  createdAt: string;
  status: 'APPROVED' | 'VERIFIED' | 'PENDING' | 'VOID';
  source?: MetodePembayaranDK | 'SYSTEM';
}

export interface RekonsiliasiDKRecord {
  id: string;
  tanggal: string;
  periode: string;
  totalLedger: number;
  totalPembayaranIuran: number;
  totalKasFisikBank: number;
  selisih: number;
  status: StatusRekonsiliasiDK;
  catatan?: string;
  petugas: string;
  verifiedAt: string;
}

export interface ConfigDanaKematian {
  iuranBulananNominal: number; // e.g. 10000
  santunanStandarNominal: number; // e.g. 2000000
  santunanAnggotaNominal: number; // e.g. 1000000
  bantuanPemakamanNominal: number; // e.g. 500000
  targetKasCadangan: number; // e.g. 10000000
  namaBank: string;
  nomorRekening: string;
  atasNamaRekening: string;
  qrisImageUrl?: string;
  updatedAt: string;
  updatedBy: string;
}

export type AuditEventTypeDK =
  | 'DK_PARTICIPANT_CREATED'
  | 'DK_PARTICIPANT_UPDATED'
  | 'DK_INVOICE_CREATED'
  | 'DK_PAYMENT_RECEIVED'
  | 'DK_INCOME_CREATED'
  | 'DK_EXPENSE_CREATED'
  | 'DK_DEATH_REPORTED'
  | 'DK_DEATH_VERIFIED'
  | 'DK_SANTUNAN_CREATED'
  | 'DK_SANTUNAN_APPROVED'
  | 'DK_SANTUNAN_PAID'
  | 'DK_SANTUNAN_REJECTED'
  | 'DK_REPORT_GENERATED'
  | 'DK_REPORT_PRINTED'
  | 'DK_REPORT_EXPORTED'
  | 'DK_RECONCILIATION'
  | 'DK_CONFIG_UPDATED'
  | 'DK_BACKUP_CREATED'
  | 'DK_RESTORE_PERFORMED'
  | 'DK_ACCESS_DENIED';

export type TagihanIuranDK = IuranTagihanDK;
export type RekonsiliasiDK = RekonsiliasiDKRecord;
export type DeathFundTabType = 
  | 'DASHBOARD' 
  | 'PESERTA' 
  | 'IURAN' 
  | 'PEMASUKAN' 
  | 'PENGELUARAN' 
  | 'KEJADIAN' 
  | 'SANTUNAN' 
  | 'TRANSAKSI' 
  | 'LAPORAN' 
  | 'REKONSILIASI';

export interface AuditLogDK {
  id: string;
  eventType?: AuditEventTypeDK;
  action?: string;
  actor?: string;
  details: string;
  userId?: string;
  role: string;
  timestamp: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStatsDK {
  saldoTotal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  totalPesertaKK: number;
  totalPesertaAktif: number;
  iuranBulanIniTerkumpul: number;
  iuranBulanIniTarget: number;
  jumlahSudahBayarBulanIni: number;
  jumlahBelumBayarBulanIni: number;
  totalSantunanTersalurkan: number;
  jumlahKejadianTahunIni: number;
}
