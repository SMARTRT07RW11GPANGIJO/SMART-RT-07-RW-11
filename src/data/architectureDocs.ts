export interface ArchSection {
  id: string;
  code: string;
  title: string;
  summary: string;
  contentMarkdown: string;
}

export const ARCHITECTURE_SECTIONS: ArchSection[] = [
  {
    id: 'executive-summary',
    code: 'A',
    title: 'Executive Summary',
    summary: 'Visi, identitas, dan gambaran umum ekosistem SMART RT 07 RW 11 Perum GPA Ngijo.',
    contentMarkdown: `
# A. EXECUTIVE SUMMARY

**Nama Platform:** SMART RT 07 RW 11 GPA NGIJO
**Organisasi:** RT 07 RW 11 Perum GPA Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur.
**Tagline:** "Bersama Melayani, Bersama Membangun"
**Email Admin:** rt07rw11.gpa@gmail.com

## 1. Latar Belakang & Visi
Sistem SMART RT 07 RW 11 didesain sebagai ekosistem tata kelola lingkungan berbasis digital yang modern, efisien, murah, transparan, dan inklusif. Bertujuan untuk mentransformasi pelayanan administratif dan komunikasi antar pengurus dengan warga Perum GPA Ngijo dari metode konvensional menjadi serba digital yang dapat diakses 24/7 melalui smartphone maupun komputer.

## 2. Sasaran Utama Platform
1. **Digitalisasi Administrasi Surat:** Mengeliminasi birokrasi manual dengan generator surat otomatis, approval bertingkat, QR-code verification, serta integrasi arsip Google Drive.
2. **Transparansi Keuangan & Iuran:** Menampilkan laporan kas dan status pembayaran iuran warga secara real-time tanpa mengekspos identitas finansial pribadi secara terbuka.
3. **Pengaduan & Aspirasi Warga:** Sistem pendaftaran keluhan ber-tiket (e.g. ADU-2026-0001) dengan pelacakan status penanganan yang transparan.
4. **Sentral Informasi & Agenda:** Publikasi pengumuman, agenda gotong-royong, galeri dokumentasi kegiatan, dan direktori kontak pengurus.
5. **Integrasi WhatsApp Bot & Notifikasi:** Bot interaktif untuk melayani instruksi mandiri warga dan notifikasi status pengajuan via WhatsApp API.
`
  },
  {
    id: 'system-architecture',
    code: 'B',
    title: 'System Architecture',
    summary: 'Alur arsitektur serverless, integrasi Google Workspace, dan pipa data.',
    contentMarkdown: `
# B. SYSTEM ARCHITECTURE

## 1. Topologi Arsitektur
Sistem ini mengadopsi pola **Serverless & Lightweight Cloud Architecture** berbasis ekosistem Google Workspace untuk meminimalkan biaya operasional (Zero Monthly Server Cost) namun menjamin ketersediaan tinggi dan kemudahan backup.

\`\`\`
                                  [ USER / WARGA ]
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
          [ Mobile Browser ]     [ Desktop Browser ]      [ WhatsApp Bot ]
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                               [ SMART RT WEB APP ]
                          (React + Tailwind PWA Engine)
                                         │
                             ┌───────────┴───────────┐
                             │ HTTPS / JSON RPC API  │
                             ▼                       ▼
                    [ EXPRESS API GATEWAY ]   [ GOOGLE APPS SCRIPT ]
                    (Server-side Proxy/PDF)    (GAS Web App Endpoint)
                             │                       │
                 ┌───────────┴───────────┬───────────┴───────────┐
                 ▼                       ▼                       ▼
         [ GOOGLE SHEETS ]        [ GOOGLE DRIVE ]       [ WHATSAPP API ]
       (Spreadsheet Database)   (PDF & Media Repository)   (Fonnte / Wablas)
\`\`\`

## 2. Alur Pipa Data
- **Frontend Layer:** PWA UI dibangun dengan React, Tailwind CSS, Lucide Icons, dan Motion Animation. Menghasilkan antarmuka responsif mobile-first.
- **Service Layer (Google Apps Script):** Bertindak sebagai backend REST/JSON API endpoint (\`doGet\` & \`doPost\`) dengan otentikasi role-based.
- **Database Layer (Google Sheets):** Berfungsi sebagai tempat penyimpanan tabel terstruktur dengan ID unik (UUID/Timestamp Code).
- **Storage Layer (Google Drive):** Penyimpanan arsip PDF surat resmi, foto pengaduan, dan galeri dokumentasi kegiatan.
- **Communication Layer (WhatsApp Engine):** Webhook pengirim pesan notifikasi otomatis dan bot interaktif.
`
  },
  {
    id: 'sitemap',
    code: 'C',
    title: 'Sitemap',
    summary: 'Struktur navigasi halaman untuk Warga Publik, Warga Terverifikasi, dan Pengurus Admin.',
    contentMarkdown: `
# C. SITEMAP PLATFORM

## 1. Publik / Landing Page (Tanpa Login)
- **Home:** Hero section, Quick Services, Running Text Pengumuman, Banner Utama.
- **Profil RT:** Sejarah, Visi Misi, Wilayah RT 07 RW 11 GPA Ngijo.
- **Pelayanan Warga:** Katalog jenis surat & form pengaduan umum.
- **Informasi & Pengumuman:** Berita kegiatan, agenda gotong royong, bulletin RT.
- **Transparansi Keuangan:** Grafis ringkasan kas bulanan (Total Pemasukan, Pengeluaran, Saldo).
- **Verifikasi Surat (\`/verify\`):** Form input nomor surat atau scan QR code untuk validasi keaslian dokumen.
- **Kontak & Lokasi:** Map, Kontak Pengurus, Social Media RT.

## 2. Portal Warga Terverifikasi
- **Dashboard Warga:** Resume status pengajuan surat, riwayat tagihan iuran keluarga, dan tiket pengaduan aktif.
- **Layanan Surat Mandiri:** Form pengajuan Surat KTP, KK, Domisili, SKU, SKCK, Kematian.
- **Iuran Keluarga:** Detail riwayat pembayaran iuran RT per bulan dan tombol konfirmasi pembayaran QRIS/Transfer.
- **Pengaduan Warga:** Form upload foto keluhan & pelacakan progress respon pengurus.

## 3. Dashboard Admin & Ketua RT
- **Overview Stat:** Total KK, Total Warga, Pengajuan Pending, Kas RT, Pengaduan Aktif.
- **Manajemen Data Warga & Keluarga:** CRUD Warga, Import/Export, status kependudukan (Tetap/Kontrak).
- **Modul Administrasi Surat:** Approval workflow (Verifikasi Sekretaris -> Persetujuan Ketua RT -> Cetak PDF / Kirim WA).
- **Modul Keuangan & Iuran:** Pencatatan Transaksi Kas, Rekapitulasi Pembayaran Iuran per KK, Ekspor Laporan Bulanan.
- **Modul Pengaduan:** Ticket Board (Baru -> Diterima -> Diproses -> Selesai) + Form Balasan Tanggapan.
- **CMS Pengumuman & Agenda:** Management konten publik.
- **Direktori Pengurus & ID Card Generator:** Profil pengurus & cetak digital ID card.
- **Audit Log & System Config:** Log aktivitas sistem, Google Script Properties configuration, WA Token Manager.
`
  },
  {
    id: 'user-flow',
    code: 'D',
    title: 'User Flow',
    summary: 'Alur proses pengajuan surat, penanganan pengaduan, dan pencatatan keuangan.',
    contentMarkdown: `
# D. USER FLOW

## 1. Alur Pengajuan Surat Pengantar Warga
\`\`\`
[WARGA] Buka Web / Pilih Menu "Ajukan Surat"
  │
  ├─► Pilih Jenis Surat (KTP, KK, Domisili, SKU, SKCK)
  ├─► Isi Data Pemohon (NIK, Nama, Blok, Keperluan)
  ├─► Submit Form
  │
  ▼
[SISTEM] Generasi ID Pengajuan (e.g. SRT-2026-0002) + Set Status: "DIAJUKAN"
  │
  ├─► Notifikasi WA Otomatis ke Sekretaris RT
  │
  ▼
[SEKRETARIS RT] Verifikasi Kelengkapan Data Data
  │
  ├─► Valid / Lengkap? ───[TIDAK]──► Set Status "DITOLAK" + Catatan Alasan ──► WA Notification ke Warga
  │        │
  │      [YA]
  ▼
Set Status "DIVERIFIKASI" / "MENUNGGU PERSETUJUAN"
  │
  ▼
[KETUA RT] Review & Klik "Setujui"
  │
  ▼
[SISTEM] Generasi Nomor Surat Resmi (001/RT07-RW11/VIII/2026)
  ├─► Render Kop, Stempel Digital, QR Code Verifikasi
  ├─► Convert to PDF & Upload ke Google Drive
  ├─► Set Status "SELESAI"
  │
  ▼
[WARGA] Terima Link PDF via WA & Web Portal (Dapat Diunduh / Dicetak)
\`\`\`

## 2. Alur Pengaduan Warga
1. Warga mengisi form Pengaduan (Nama, No HP, Kategori, Lokasi, Deskripsi, Upload Foto).
2. Sistem mengeluarkan Nomor Tiket Otomatis (e.g., **ADU-2026-0001**).
3. Notifikasi terkirim ke Seksi Terkait (Keamanan / Kebersihan / Infrastruktur).
4. Pengurus memperbarui status: **BARU** → **DITERIMA** → **DIPROSES** → **SELESAI** beserta foto hasil perbaikan.
5. Warga menerima pembaruan status secara transparan melalui portal atau WhatsApp Bot.
`
  },
  {
    id: 'database-schema',
    code: 'E',
    title: 'Database Schema',
    summary: 'Rancangan struktur 13 sheet terintegrasi pada Google Sheets.',
    contentMarkdown: `
# E. DATABASE SCHEMA (GOOGLE SHEETS)

Database disimpan pada 1 Google Spreadsheet utama dengan 13 Sheet terpisah:

### 1. Sheet \`01_CONFIG\`
- \`KEY\` (STRING, PK): Nama parameter (e.g. RT_NAME, KETUA_RT_NAME, WA_API_KEY, DRIVE_FOLDER_ID)
- \`VALUE\` (STRING): Nilai konfigurasi
- \`DESCRIPTION\` (STRING): Deskripsi parameter

### 2. Sheet \`02_WARGA\`
- \`ID_WARGA\` (STRING, PK): Format \`WRG-001\`
- \`NIK\` (STRING): 16 Digit NIK (Encrypted/Restricted)
- \`NO_KK\` (STRING, FK): 16 Digit No KK
- \`NAMA_LENGKAP\` (STRING)
- \`TEMPAT_LAHIR\` (STRING)
- \`TANGGAL_LAHIR\` (DATE): \`YYYY-MM-DD\`
- \`JENIS_KELAMIN\` (STRING): Laki-Laki / Perempuan
- \`STATUS_PERKAWINAN\` (STRING): Belum Kawin / Kawin / Cerai
- \`AGAMA\` (STRING)
- \`PENDIDIKAN\` (STRING)
- \`PEKERJAAN\` (STRING)
- \`NO_HP\` (STRING): Format \`08xxxxxxxxxx\`
- \`EMAIL\` (STRING)
- \`ALAMAT\` (STRING)
- \`BLOK\` (STRING): \`Blok C-07\`
- \`RT\` (STRING): \`07\`
- \`RW\` (STRING): \`11\`
- \`STATUS_WARGA\` (STRING): Tetap / Kontrak / Kos
- \`TANGGAL_MASUK\` (DATE)
- \`KETERANGAN\` (STRING)

### 3. Sheet \`03_KELUARGA\`
- \`ID_KK\` (STRING, PK): Format \`KK-001\`
- \`NO_KK\` (STRING): Unique No KK
- \`NAMA_KEPALA_KELUARGA\` (STRING)
- \`ALAMAT\` (STRING)
- \`BLOK\` (STRING)
- \`JUMLAH_ANGGOTA\` (NUMBER)
- \`STATUS_RUMAH\` (STRING): Milik Sendiri / Sewa / Dinas
- \`NO_HP\` (STRING)
- \`KETERANGAN\` (STRING)

### 4. Sheet \`04_PENGURUS\`
- \`ID_PENGURUS\` (STRING, PK)
- \`NAMA\` (STRING)
- \`JABATAN\` (STRING): Ketua RT / Sekretaris / Bendahara / Seksi
- \`NO_HP\` (STRING)
- \`EMAIL\` (STRING)
- \`FOTO_URL\` (STRING)
- \`PERIODE\` (STRING): \`2025 - 2028\`
- \`BLOK\` (STRING)

### 5. Sheet \`05_SURAT\`
- \`ID_SURAT\` (STRING, PK): Format \`SRT-2026-0001\`
- \`NOMOR_SURAT\` (STRING): \`001/RT07-RW11/VIII/2026\`
- \`JENIS_SURAT\` (STRING)
- \`ID_WARGA\` (STRING, FK)
- \`NAMA_PEMOHON\` (STRING)
- \`NIK_PEMOHON\` (STRING)
- \`NO_KK\` (STRING)
- \`BLOK_RUMAH\` (STRING)
- \`KEPERLUAN\` (STRING)
- \`TANGGAL_PENGAJUAN\` (DATETIME)
- \`TANGGAL_DISETUJUI\` (DATETIME)
- \`STATUS\` (STRING): DIAJUKAN / DIVERIFIKASI / MENUNGGU PERSETUJUAN / DISETUJUI / DITOLAK / SELESAI
- \`CATATAN_ADMIN\` (STRING)
- \`QR_CODE_HASH\` (STRING)
- \`PDF_DRIVE_URL\` (STRING)

### 6. Sheet \`06_PENGADUAN\`
- \`ID_PENGADUAN\` (STRING, PK)
- \`NOMOR_TIKET\` (STRING): \`ADU-2026-0001\`
- \`NAMA_PELAPOR\` (STRING)
- \`NO_HP\` (STRING)
- \`KATEGOI\` (STRING)
- \`LOKASI\` (STRING)
- \`DESKRIPSI\` (STRING)
- \`FOTO_URL\` (STRING)
- \`TANGGAL\` (DATETIME)
- \`STATUS\` (STRING): BARU / DITERIMA / DIPROSES / SELESAI
- \`TANGGAPAN_ADMIN\` (STRING)

### 7. Sheet \`07_IURAN\`
- \`ID_IURAN\` (STRING, PK)
- \`BULAN_TAHUN\` (STRING): \`Agustus 2026\`
- \`ID_KK\` (STRING, FK)
- \`NAMA_KEPALA_KELUARGA\` (STRING)
- \`BLOK\` (STRING)
- \`NOMINAL_TAGIHAN\` (NUMBER)
- \`NOMINAL_DIBAYAR\` (NUMBER)
- \`TANGGAL_BAYAR\` (DATE)
- \`STATUS\` (STRING): LUNAS / BELUM LUNAS / SEBAGIAN
- \`METODE_BAYAR\` (STRING)

### 8. Sheet \`08_TRANSAKSI\`
- \`ID_TRANSAKSI\` (STRING, PK)
- \`TANGGAL\` (DATE)
- \`JENIS\` (STRING): Pemasukan / Pengeluaran
- \`KATEGORI\` (STRING)
- \`KETERANGAN\` (STRING)
- \`PEMASUKAN\` (NUMBER)
- \`PENGELUARAN\` (NUMBER)
- \`SALDO_BERJALAN\` (NUMBER)
- \`PETUGAS\` (STRING)
- \`BUKTI_URL\` (STRING)

### 9. Sheet \`09_PENGUMUMAN\`, \`10_AGENDA\`, \`11_DOKUMENTASI\`, \`12_AUDIT_LOG\`, \`13_USERS\`
- Menyimpan konten CMS, event kalender, galeri foto Drive, log jejak audit, dan kredensial user role.
`
  },
  {
    id: 'role-matrix',
    code: 'F',
    title: 'Role & Permission Matrix',
    summary: 'Matriks hak akses berdasarkan prinsip Least Privilege.',
    contentMarkdown: `
# F. ROLE & PERMISSION MATRIX

| Modul / Fitur | PUBLIC | WARGA | PENGURUS | SEKRETARIS | BENDAHARA | KETUA RT | ADMIN RT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Lihat Landing Page & Profile** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lihat Ringkasan Kas Publik** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Verifikasi Surat (\`/verify\`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Submit Pengaduan** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Ajukan Surat Pengantar** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lihat Riwayat Surat Sendiri** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lihat Data NIK Warga Detail** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Verifikasi Pengajuan Surat** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Persetujuan (Approve) Surat** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Input & Edit Transaksi Kas** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Kelola Rekap Iuran Warga** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Update Status Pengaduan** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CRUD CMS Pengumuman & Agenda**| ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Akses Audit Log & Config** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
`
  },
  {
    id: 'design-system',
    code: 'G',
    title: 'UI/UX Design System',
    summary: 'Panduan visual, palet warna resmi, tipografi, dan komponen antarmuka.',
    contentMarkdown: `
# G. UI/UX DESIGN SYSTEM

## 1. Palet Warna Resmi RT 07 RW 11 GPA Ngijo
- **Navy Primary (\`#123B5D\`):** Digunakan untuk Header Navbar, Judul Utama, Button Aksi Utama, dan Elemen Wibawa Organisasi.
- **Green Secondary (\`#2E7D52\`):** Digunakan untuk Button Pengajuan, Status Lunas/Selesai, Indikator Keuangan Positif, dan Elemen Lingkungan Asri.
- **Red Warning (\`#C62828\`):** Digunakan untuk Penolakan, Status Belum Lunas, Alert Penting, dan Elemen Merah Putih.
- **Gold Accent (\`#D4A72C\`):** Digunakan untuk Badge Penghargaan, Highlight Agenda Puncak, Accent Border, dan Logo RT.
- **Warm White & Slate BG (\`#F8FAFC\`):** Canvas bersih, segar, dan tidak menyilaukan mata.

## 2. Tipografi
- **Font Utama:** System Sans-Serif (Inter / Plus Jakarta Sans / Segoe UI) dengan kontras tinggi.
- **Heading Scale:**
  - H1: Display 32px (Bold) - Landing Hero
  - H2: Section 24px (SemiBold) - Judul Modul
  - H3: Subhead 18px (Medium) - Card Title
  - Body: 15px - 16px (Regular) - Line height 1.6

## 3. Prinsip Layout & Ergonomi Mobile
- **Mobile-First Paradigm:** Touch targets minimal 44px x 44px.
- **Bottom Bar Navigation:** Untuk kemudahan navigasi jempol di smartphone.
- **Nested Border Radius Rule:** Container outer radius (16px) -> Inner card radius (12px).
- **Anti-Slop Cleanliness:** Tanpa gradient berlebihan, tanpa glassmorphism kabur, kontras teks WCAG AA min 4.5:1.
`
  },
  {
    id: 'security-architecture',
    code: 'H',
    title: 'Security Architecture',
    summary: 'Perlindungan NIK, enkripsi data sensitif, sanitasi server-side, dan audit log.',
    contentMarkdown: `
# H. SECURITY ARCHITECTURE

## 1. Perlindungan Data Pribadi (NIK & KK)
- **Masking at Rest & Display:** NIK dan No KK warga ditutupi secara otomatis pada antarmuka non-admin (e.g. \`350712******0001\`).
- **Zero Public Exposure:** Data pribadi sensitif tidak pernah ditransmisikan dalam respon API publik.
- **Server-Side Validation:** Seluruh validasi form (panjang NIK, format HP, batas upload) dilakukan di backend Google Apps Script.

## 2. Sistem Autentikasi & Otorisasi
- **Script Properties Secret Storage:** API Token WhatsApp, Google Drive ID, dan Spreadsheet Key disimpan di \`PropertiesService.getScriptProperties()\`, tidak pernah di-hardcode.
- **Session Token Verification:** Login Admin & Pengurus menggunakan HMAC Token bertanda tangan waktu.

## 3. Jejak Audit (Audit Logging)
- Setiap tindakan mutasi data (Tambah Warga, Persetujuan Surat, Hapus Transaksi, Akses Konfigurasi) dicatat otomatis pada sheet \`12_AUDIT_LOG\` dengan menyertakan timestamp, ID User, Modul, dan IP.
`
  },
  {
    id: 'gas-structure',
    code: 'I',
    title: 'Google Apps Script Structure',
    summary: 'Struktur kode backend modular Google Apps Script & Google Drive PDF Generator.',
    contentMarkdown: `
# I. GOOGLE APPS SCRIPT PROJECT STRUCTURE

Proyek backend Apps Script disusun secara modular dalam file \`.gs\`:

\`\`\`
gas-backend/
├── Code.gs             // Web App Entry Point (doGet, doPost, Router)
├── Config.gs           // Environment & Script Properties Manager
├── Database.gs         // ORM Google Sheets (CRUD Abstraction, ID Generator)
├── Auth.gs             // Session Token Validation & Role Permission Check
├── Warga.gs            // Service Data Warga & Keluarga
├── Surat.gs            // Workflow Pengajuan, Verifikasi & Approval Surat
├── Keuangan.gs         // Ledger Transaksi & Iuran Bulanan
├── Pengaduan.gs        // Ticket Management System
├── Pengumuman.gs       // CMS Content Service
├── WhatsApp.gs         // WhatsApp API Gateway (Fonnte/Wablas Integration)
├── PDF.gs              // HTML Template to PDF Engine (Google Docs / Drive)
├── Audit.gs            // Audit Logger Engine
└── Utils.gs            // Helper String, Date, Masking, & Response Standard
\`\`\`

### Contoh Standard API Response Format:
\`\`\`json
{
  "success": true,
  "message": "Pengajuan surat berhasil diverifikasi",
  "data": {
    "id_surat": "SRT-2026-0001",
    "nomor_surat": "001/RT07-RW11/VIII/2026",
    "status": "SELESAI"
  },
  "error": null
}
\`\`\`
`
  },
  {
    id: 'roadmap',
    code: 'J',
    title: 'Development Roadmap',
    summary: 'Rencana eksekusi bertahap dari Tahap 1 hingga Tahap 6.',
    contentMarkdown: `
# J. DEVELOPMENT ROADMAP

- **TAHAP 1 (SELESAI):** Perancangan Arsitektur Sistem, Schema Database, User Flow, Sitemap, Role Matrix, Design System, & Security Specification.
- **TAHAP 2 (BERIKUTNYA):** Pembuatan Master Spreadsheet Database, Google Apps Script Backend Modules (\`Code.gs\`, \`Database.gs\`, \`Surat.gs\`, \`PDF.gs\`).
- **TAHAP 3:** Penguatan Frontend Web App (Portal Warga & Dashboard Admin Interactive).
- **TAHAP 4:** Integrasi Engine WhatsApp Gateway & Generator PDF Surat Resmi Google Drive.
- **TAHAP 5:** Integrasi PWA (Progressive Web App), Halaman Verifikasi QR Code, dan Audit Logger.
- **TAHAP 6:** Comprehensive End-to-End Testing, Security Auditing, dan Panduan Deployment Mandiri.
`
  }
];
