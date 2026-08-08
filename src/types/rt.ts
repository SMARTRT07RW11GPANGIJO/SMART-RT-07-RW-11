export type UserRole = 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';

export type StatusSurat = 'DIAJUKAN' | 'DIVERIFIKASI' | 'MENUNGGU PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';

export type DocumentLifecycle = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'GENERATED' | 'PUBLISHED' | 'REVOKED';

export type VerificationStatus = 'VALID' | 'CANCELLED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';

export interface DigitalDocument {
  documentId: string; // e.g. DOC-2026-000001
  requestId: string; // references id_surat
  nomorSurat: string; // e.g. 001/RT07-RW11/VIII/2026
  jenisSurat: 'Surat Pengantar KTP' | 'Surat Pengantar KK' | 'Surat Domisili' | 'Surat Keterangan Usaha' | 'Surat Pengantar SKCK' | 'Surat Keterangan Kematian' | 'Surat Keterangan Lainnya';
  tanggalSurat: string;
  lifecycle: DocumentLifecycle;
  status: VerificationStatus;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
  pdfUrl?: string;
  qrVerificationUrl: string;
  verificationToken: string;
  version: number;
  pemohonNama: string;
  pemohonNikMasked: string; // e.g., 350712******0004
  pemohonAlamat: string;
  keperluan: string;
  namaKetua: string;
  jabatanKetua: string;
}

export type StatusPengaduan = 'BARU' | 'DITERIMA' | 'DIPROSES' | 'SELESAI';

export type StatusIuran = 'LUNAS' | 'BELUM LUNAS' | 'SEBAGIAN';

export type KategoriPengaduan = 'Keamanan' | 'Kebersihan' | 'Lampu jalan' | 'Jalan' | 'Air' | 'Lingkungan' | 'Sosial' | 'Lainnya';

export type KategoriPengumuman = 'Pengumuman' | 'Kegiatan' | 'Keamanan' | 'Lingkungan' | 'Sosial' | 'Administrasi';

export interface Warga {
  id_warga: string;
  nik: string; // Masked for non-admins
  no_kk: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-Laki' | 'Perempuan';
  status_perkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  no_hp: string;
  email: string;
  alamat: string;
  blok: string;
  rt: string;
  rw: string;
  status_warga: 'Tetap' | 'Kontrak' | 'Kos';
  tanggal_masuk: string;
  keterangan?: string;
}

export interface Keluarga {
  id_kk: string;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  blok: string;
  jumlah_anggota: number;
  status_rumah: 'Milik Sendiri' | 'Sewa / Kontrak' | 'Rumah Dinas';
  no_hp: string;
  keterangan?: string;
}

export interface SuratPengantar {
  id_surat: string;
  nomor_surat: string;
  jenis_surat: 'Surat Pengantar KTP' | 'Surat Pengantar KK' | 'Surat Domisili' | 'Surat Keterangan Usaha' | 'Surat Pengantar SKCK' | 'Surat Keterangan Kematian' | 'Surat Keterangan Lainnya';
  id_warga: string;
  nama_pemohon: string;
  nik_pemohon: string;
  no_kk: string;
  blok_rumah: string;
  keperluan: string;
  tanggal_pengajuan: string;
  tanggal_disetujui?: string;
  status: StatusSurat;
  catatan_admin?: string;
  qr_code_hash: string;
  pdf_drive_url?: string;
}

export interface TransaksiKeuangan {
  id_transaksi: string;
  tanggal: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  kategori: 'Iuran Warga' | 'Sumbangan' | 'Kerja Bakti' | 'Keamanan' | 'Kebersihan & Sampah' | 'Perbaikan Infrastruktur' | 'Acara / Sosial' | 'Kas RT';
  keterangan: string;
  pemasukan: number;
  pengeluaran: number;
  saldo_berjalan: number;
  petugas: string;
  bukti_url?: string;
}

export interface TagihanIuran {
  id_iuran: string;
  bulan_tahun: string; // e.g., "Agustus 2026"
  id_kk: string;
  nama_kepala_keluarga: string;
  blok: string;
  nominal_tagihan: number;
  nominal_dibayar: number;
  tanggal_bayar?: string;
  status: StatusIuran;
  metode_bayar?: 'Transfer Bank' | 'Tunai / Petugas' | 'QRIS RT';
}

export interface Pengaduan {
  id_pengaduan: string;
  nomor_tiket: string; // e.g., "ADU-2026-0001"
  nama_pelapor: string;
  no_hp: string;
  kategori: KategoriPengaduan;
  lokasi: string;
  deskripsi: string;
  foto_url?: string;
  tanggal: string;
  status: StatusPengaduan;
  tanggapan_admin?: string;
}

export interface Pengumuman {
  id_pengumuman: string;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: KategoriPengumuman;
  foto_url?: string;
  status: 'DRAFT' | 'PUBLISHED';
  penulis: string;
}

export interface AgendaKegiatan {
  id_agenda: string;
  judul: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  deskripsi: string;
  penanggung_jawab: string;
  kategori: string;
}

export interface Pengurus {
  id_pengurus: string;
  nama: string;
  jabatan: string;
  no_hp: string;
  email: string;
  foto_url: string;
  periode: string;
  blok: string;
}

export interface AuditLog {
  id_log: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  record_id: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  description: string;
}
