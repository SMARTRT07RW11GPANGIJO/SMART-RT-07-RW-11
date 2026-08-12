# 02 — DATABASE DOCUMENTATION

**SMART RT 07 RW 11 PERUM GPA NGIJO**  
Document ID: `DOC-02-DATABASE` | Status: `APPROVED` | Version: `DOC v1.0.0`

---

## 1. Primary Database Technology

- **Engine**: Google Sheets Spreadsheet Database
- **Interface**: Google Apps Script Execution Engine (`DataAccess.gs` & `ResourceAccess.gs`)
- **Total Worksheets**: 13 Primary Worksheets
- **Sanitization & Guard**: `Sanitizer.gs` strips leading `=`, `+`, `-`, `@` characters to prevent CSV/Formula Injection vulnerabilities.

---

## 2. Logical ERD / Relationship Diagram

```text
Warga (Primary: id_warga, Foreign: id_kk)
  │
  ├── Kartu Keluarga (Primary: id_kk, no_kk)
  │
  ├── Surat Pengantar (Foreign: id_warga, Primary: id_surat)
  │     └── Digital Document (Foreign: requestId / id_surat, Primary: documentId)
  │
  ├── Tagihan Iuran (Foreign: id_kk, Primary: id_iuran)
  │     └── Transaksi Keuangan (Foreign: id_transaksi)
  │
  ├── Pengaduan Warga (Foreign: id_warga, Primary: id_pengaduan)
  │
  └── Audit Log (Foreign: userId / actor)
```

---

## 3. Detailed Worksheet Schemas

### A. Worksheet: `Warga` (Resident Registry)
- **Primary Key**: `id_warga` (e.g. `WRG-2026-0001`)
- **Columns**: `id_warga`, `nik`, `no_kk`, `nama_lengkap`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `status_perkawinan`, `agama`, `pendidikan`, `pekerjaan`, `no_hp`, `email`, `alamat`, `blok`, `rt`, `rw`, `status_warga`, `tanggal_masuk`, `keterangan`
- **Masking Rules**: `nik` and `no_hp` are masked for non-admin viewers (e.g. `350712******0004`).

### B. Worksheet: `KartuKeluarga`
- **Primary Key**: `id_kk` (e.g. `KK-2026-0001`)
- **Columns**: `id_kk`, `no_kk`, `nama_kepala_keluarga`, `alamat`, `blok`, `jumlah_anggota`, `status_rumah`, `no_hp`, `keterangan`

### C. Worksheet: `SuratPengantar`
- **Primary Key**: `id_surat` (e.g. `SRT-2026-0001`)
- **Columns**: `id_surat`, `nomor_surat`, `jenis_surat`, `id_warga`, `nama_pemohon`, `nik_pemohon`, `no_kk`, `blok_rumah`, `keperluan`, `tanggal_pengajuan`, `tanggal_disetujui`, `status`, `catatan_admin`, `qr_code_hash`, `pdf_drive_url`

### D. Worksheet: `DigitalDocuments`
- **Primary Key**: `documentId` (e.g. `DOC-2026-000001`)
- **Columns**: `documentId`, `requestId`, `nomorSurat`, `jenisSurat`, `tanggalSurat`, `lifecycle`, `status`, `createdAt`, `createdBy`, `approvedAt`, `approvedBy`, `revokedAt`, `revokedBy`, `revokedReason`, `pdfUrl`, `qrVerificationUrl`, `verificationToken`, `version`, `pemohonNama`, `pemohonNikMasked`, `pemohonAlamat`, `keperluan`, `namaKetua`, `jabatanKetua`

### E. Worksheet: `TransaksiKeuangan`
- **Primary Key**: `id_transaksi` (e.g. `TRX-2026-0001`)
- **Columns**: `id_transaksi`, `tanggal`, `jenis`, `kategori`, `keterangan`, `pemasukan`, `pengeluaran`, `saldo_berjalan`, `petugas`, `bukti_url`

### F. Worksheet: `TagihanIuran`
- **Primary Key**: `id_iuran` (e.g. `IRN-2026-08-001`)
- **Columns**: `id_iuran`, `bulan_tahun`, `id_kk`, `nama_kepala_keluarga`, `blok`, `nominal_tagihan`, `nominal_dibayar`, `tanggal_bayar`, `status`, `metode_bayar`

### G. Worksheet: `Pengaduan`
- **Primary Key**: `id_pengaduan` (e.g. `ADU-2026-0001`)
- **Columns**: `id_pengaduan`, `nomor_tiket`, `nama_pelapor`, `no_hp`, `kategori`, `lokasi`, `deskripsi`, `foto_url`, `tanggal`, `status`, `tanggapan_admin`

### H. Worksheet: `AuditLog`
- **Primary Key**: `id_log` (e.g. `LOG-2026-0812-00001`)
- **Columns**: `id_log`, `timestamp`, `userId`, `role`, `action`, `module`, `targetId`, `status`, `severity`, `details`, `previousHash`, `currentHash`

---

## 4. Data Rules & Constraints

1. **ID Generation**: Standard prefixes (`WRG-`, `KK-`, `SRT-`, `DOC-`, `TRX-`, `ADU-`, `LOG-`) with year and 4-digit sequential padding.
2. **Timestamps**: Stored in ISO 8601 string format (`YYYY-MM-DDTHH:mm:ss.sssZ`) or WIB local time notation.
3. **Soft Delete**: Records are flagged with `status = 'INACTIVE'` or `status = 'REVOKED'` rather than hard deleted.
4. **Backup Schedule**: Automated daily snapshot to Google Drive Folder `06_BACKUP` at 06:00 WIB.
