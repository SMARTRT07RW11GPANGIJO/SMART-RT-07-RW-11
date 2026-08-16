/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Service for MODUL TATA TERTIB WARGA v1.0 (STANDALONE PRODUCTION READY)
 */

import { UserRole } from '../types/rt';
import {
  TataTertibArticle,
  TataTertibCategory,
  TataTertibCategoryItem,
  TataTertibHistory,
  TataTertibAck,
  TataTertibFeedback,
  TataTertibSummaryStats,
  TataTertibConfig,
  TataTertibAuditLog,
  TataTertibStatus
} from '../types/tataTertib';
import { AuditLogService } from './auditLogService';
import { syncDataWithGAS } from './apiService';

// Storage Keys
const STORAGE_KEY_ARTICLES = 'SMART_RT_TATA_TERTIB_ARTICLES_V1';
const STORAGE_KEY_CATEGORIES = 'SMART_RT_TATA_TERTIB_CATEGORIES_V1';
const STORAGE_KEY_HISTORY = 'SMART_RT_TATA_TERTIB_HISTORY_V1';
const STORAGE_KEY_ACK = 'SMART_RT_TATA_TERTIB_ACK_V1';
const STORAGE_KEY_FEEDBACK = 'SMART_RT_TATA_TERTIB_FEEDBACK_V1';
const STORAGE_KEY_CONFIG = 'SMART_RT_TATA_TERTIB_CONFIG_V1';
const STORAGE_KEY_AUDIT = 'SMART_RT_TATA_TERTIB_AUDIT_V1';

// 12 Standard Categories for RT 07 RW 11
export const DEFAULT_TATA_TERTIB_CATEGORIES: TataTertibCategoryItem[] = [
  { id: 'CAT-01', code: 'KEBERSIHAN', name: 'Kebersihan', description: 'Aturan pembuangan sampah, kerja bakti, dan sanitasi perumahan.', icon: 'Trash2', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-02', code: 'KEAMANAN', name: 'Keamanan', description: 'Ketentuan portal malam, siskamling, ronda, dan tamu 1x24 jam.', icon: 'Shield', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-03', code: 'KETERTIBAN', name: 'Ketertiban', description: 'Norma hidup bertetangga, kerukunan, dan pencegahan perselisihan.', icon: 'CheckSquare', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-04', code: 'LINGKUNGAN', name: 'Lingkungan', description: 'Penghijauan, penataan fasum, pemeliharaan saluran air / drainase.', icon: 'Home', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-05', code: 'SOSIAL', name: 'Sosial', description: 'Kegiatan gotong royong, santunan duka cita, dan kebersamaan warga.', icon: 'Users', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-06', code: 'FASILITAS_UMUM', name: 'Fasilitas Umum', description: 'Penggunaan balai RT, poskamling, taman bermain, dan lampu jalan.', icon: 'Building2', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-07', code: 'PARKIR', name: 'Parkir', description: 'Tata cara memarkir kendaraan roda 2 dan roda 4 agar tidak memblokir jalan komplek.', icon: 'Car', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-08', code: 'HEWAN_PELIHARAAN', name: 'Hewan Peliharaan', description: 'Kewajiban menjaga hewan ternak/peliharaan agar tidak mengotori jalan & mengganggu.', icon: 'Dog', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-09', code: 'KEGIATAN_WARGA', name: 'Kegiatan Warga', description: 'Prosedur izin hajatan, pertemuan rutin RT, rapat warga, dan perayaan HUT RI.', icon: 'Calendar', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-10', code: 'JAM_ISTIRAHAT', name: 'Jam Istirahat', description: 'Batas toleransi kebisingan suara, musik keras, dan pekerjaan bertukang malam hari.', icon: 'Volume2', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-11', code: 'SAMPAH', name: 'Sampah', description: 'Pemilahan sampah organik/anorganik, jadwal truk pengangkut sampah.', icon: 'Trash2', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'CAT-12', code: 'LAINNYA', name: 'Lainnya', description: 'Ketentuan khusus, administrasi kependudukan, dan penutup.', icon: 'FileText', isSystem: true, createdAt: '2026-01-01T00:00:00.000Z' }
];

export const DEFAULT_TATA_TERTIB_CONFIG: TataTertibConfig = {
  documentNumberFormat: 'TT/RT07RW11/{CAT}/{NO}/{YEAR}',
  kopHeaderTitle: 'RUKUN TETANGGA 07 RUKUN WARGA 11',
  kopSubTitle: 'PERUMAHAN GRAHA PERMATA ANUGRAH (GPA) DESA NGIJO',
  kopLocation: 'Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152',
  signingOfficialName: 'Bapak Eko Sucahyono',
  signingOfficialTitle: 'Ketua RT 07 RW 11 GPA Ngijo',
  enableWhatsAppNotifications: true,
  enableRAGKnowledgeBase: true
};

// Initial Data with Full Official Articles
export const INITIAL_TATA_TERTIB_ARTICLES: TataTertibArticle[] = [
  {
    id: 'TT-001',
    kode: 'TT-UMU-001',
    nomor: 'BAB I Pasal 1',
    judul: 'Ketentuan Umum & Keanggotaan Warga',
    kategori: 'UMUM',
    dasar: 'Hasil Musyawarah Warga RT 07 RW 11 GPA Ngijo & AD/ART RW 11.',
    tujuan: 'Mewujudkan lingkungan pemukiman yang berlandaskan asas gotong royong, transparansi, ketentraman, dan kekeluargaan.',
    ruangLingkup: 'Seluruh warga yang berdomisili di wilayah RT 07 RW 11 Perum GPA Ngijo, baik pemilik rumah, pengontrak, maupun warga kos.',
    kewajiban: [
      'Warga baru wajib melapor kepada Pengurus RT dalam waktu 2x24 jam dengan melampirkan fotokopi KTP dan KK.',
      'Warga yang pindah domisili keluar wilayah RT 07 wajib memberitahukan kepada Pengurus RT secara tertulis atau via Portal SMART RT.',
      'Menghormati hak-hak tetangga dan menjaga kerukunan antar warga.'
    ],
    larangan: [
      'Dilarang melakukan aktivitas terselubung yang bertentangan dengan hukum NKRI dan norma sosial perumahan.',
      'Dilarang mengabaikan panggilan musyawarah RT tanpa alasan yang sah.'
    ],
    sanksi: 'Teguran lisan oleh Pengurus RT dan penundaan layanan administrasi sementara.',
    isi: `Pasal 1: Pengertian & Asas
1. Rukun Tetangga 07 RW 11 Perumahan Graha Permata Anugrah (GPA) Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang berdiri berlandaskan asas gotong royong, transparansi, dan kekeluargaan.
2. Setiap warga yang berdomisili di wilayah RT 07 RW 11 (baik pemilik, penyewa/kontrak, maupun kos) merupakan bagian tak terpisahkan dari keluarga besar RT 07.

Pasal 2: Kewajiban Pelaporan Domisili
1. Warga baru yang menempati rumah di wilayah RT 07 wajib melaporkan diri kepada Pengurus RT (Sekretaris/Ketua RT) dalam waktu maksimal 2x24 jam dengan membawa FC KTP dan KK.
2. Warga yang berpindah tempat tinggal keluar dari wilayah RT 07 wajib memberitahukan kepada Pengurus RT secara tertulis atau melalui Portal SMART RT.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/UMU/001/2026',
    keywords: ['umum', 'asas', 'domisili', 'pendaftaran', 'warga baru', 'ngijo', 'pindah'],
    // legacy compatibility
    number: 'TT-001',
    category: 'UMUM',
    title: 'BAB I - Ketentuan Umum & Keanggotaan Warga',
    summary: 'Landasan hukum, asas kekeluargaan, dan pendaftaran warga RT 07 RW 11 Perum GPA Ngijo.',
    content: `Pasal 1: Pengertian & Asas\n1. Rukun Tetangga 07 RW 11 Perumahan GPA Ngijo...`
  },
  {
    id: 'TT-002',
    kode: 'TT-KEW-002',
    nomor: 'BAB II Pasal 2',
    judul: 'Hak dan Kewajiban Warga',
    kategori: 'KEWAJIBAN_WARGA',
    dasar: 'Kesepakatan bersama warga RT 07 RW 11.',
    tujuan: 'Menjamin keseimbangan hak pelayanan administrasi dan partisipasi aktif warga dalam memajukan lingkungan.',
    ruangLingkup: 'Seluruh warga yang tercatat dalam buku induk warga RT 07.',
    kewajiban: [
      'Menjaga kerukunan, ketertiban, dan kebersihan lingkungan RT 07.',
      'Membayar iuran rutin kas RT dan iuran kebersihan/keamanan tepat waktu.',
      'Berpartisipasi aktif dalam musyawarah warga, kerja bakti, dan perayaan hari besar.'
    ],
    larangan: [
      'Dilarang menolak kewajiban gotong royong tanpa pemberitahuan atau penggantian iuran kompensasi.',
      'Dilarang melakukan tindakan diskriminasi SARA di lingkungan RT 07.'
    ],
    sanksi: 'Peringatan tertulis dan pembatasan hak suara dalam pemilihan pengurus RT.',
    isi: `Pasal 3: Hak Warga RT 07
1. Berhak mendapatkan pelayanan administrasi surat pengantar RT secara digital maupun manual.
2. Berhak menggunakan fasilitas umum RT 07 sesuai dengan aturan yang berlaku.
3. Berhak menyampaikan saran, pendapat, aspirasi, atau pengaduan secara terhormat melalui rapat warga atau portal SMART RT.
4. Berhak mendapatkan transparansi informasi laporan keuangan dan kegiatan RT.

Pasal 4: Kewajiban Warga RT 07
1. Menjaga kerukunan, ketertiban, dan kebersihan lingkungan RT 07.
2. Membayar iuran rutin bulanan kas RT dan iuran kebersihan/keamanan tepat waktu.
3. Berpartisipasi aktif dalam musyawarah warga, kerja bakti lingkungan, dan peringatan hari besar.
4. Mematuhi norma kesusilaan dan hukum yang berlaku di NKRI.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/KEW/002/2026',
    keywords: ['hak', 'kewajiban', 'pelayanan', 'aspirasi', 'iuran', 'gotong royong'],
    number: 'TT-002',
    category: 'KEWAJIBAN_WARGA',
    title: 'BAB II - Hak dan Kewajiban Warga'
  },
  {
    id: 'TT-003',
    kode: 'TT-KEA-003',
    nomor: 'BAB III Pasal 3',
    judul: 'Keamanan & Ketertiban Lingkungan',
    kategori: 'KEAMANAN',
    dasar: 'SOP Keamanan dan Ketertiban Lingkungan Perumahan GPA.',
    tujuan: 'Menjaga keamanan fisik perumahan dari gangguan kejahatan, bahaya kebakaran, dan tamu asing yang tidak teridentifikasi.',
    ruangLingkup: 'Area portal utama, pos satpam, poskamling, dan seluruh ruas jalan komplek RT 07.',
    kewajiban: [
      'Warga atau tamu yang melintas saat portal ditutup wajib melapor / menyapa petugas siskamling.',
      'Mengunci pagar rumah dan mematikan kompor / instalasi listrik berlebih saat bepergian lama.',
      'Melaporkan tamu yang menginap lebih dari 1x24 jam kepada pengurus RT.'
    ],
    larangan: [
      'Dilarang membuka paksa portal malam tanpa izin petugas pos ronda.',
      'Dilarang membawa tamu asing ke dalam rumah di atas jam 23.00 WIB tanpa melapor.'
    ],
    sanksi: 'Pemeriksaan identitas oleh Seksi Keamanan dan penindakan berkoordinasi dengan Polsek Karangploso bila ada unsur pidana.',
    isi: `Pasal 5: Portal Keamanan & Jam Operasional
1. Portal utama Perumahan GPA RT 07 ditutup setiap pukul 23.00 WIB dan dibuka kembali pukul 05.00 WIB demi keamanan bersama.
2. Tamu atau warga yang keluar/masuk setelah pukul 23.00 WIB wajib melapor atau melambaikan tangan kepada petugas pos poskamling.

Pasal 6: Tanggap Darurat & Kontak Pengurus
1. Apabila terjadi tindak kejahatan, kecelakaan, kebocoran gas, atau musibah kebakaran, warga dapat mengklik tombol "🚨 LAPORKAN KEJADIAN" pada Portal SMART RT atau menghubungi Tim Keamanan RT.
2. Petugas ronda atau Pengurus Sie Keamanan berhak memeriksa identitas orang tak dikenal yang berada di area pemukiman pada jam malam.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/KEA/003/2026',
    keywords: ['keamanan', 'portal', 'pos ronda', 'jam malam', 'ronda', 'darurat', 'tutup portal'],
    number: 'TT-003',
    category: 'KEAMANAN',
    title: 'BAB III - Keamanan & Ketertiban Lingkungan'
  },
  {
    id: 'TT-004',
    kode: 'TT-KEB-004',
    nomor: 'BAB IV Pasal 4',
    judul: 'Kebersihan, Pengelolaan Sampah & Lingkungan',
    kategori: 'KEBERSIHAN',
    dasar: 'Perda Kab. Malang tentang Pengelolaan Sampah & Kesepakatan RT 07.',
    tujuan: 'Menciptakan lingkungan yang asri, bersih, bebas jentik nyamuk DBD, dan terbebas dari bau sampah tak sedap.',
    ruangLingkup: 'Pekarangan rumah, selokan depan rumah, tempat pembuangan sampah sementara, dan area hijau RT 07.',
    kewajiban: [
      'Menyediakan tempat sampah tertutup di depan rumah masing-masing.',
      'Membuang sampah terbungkus plastik rapi sesuai jadwal penarikan petugas.',
      'Membersihkan selokan / saluran air di depan rumah masing-masing secara berkala.',
      'Mengikuti kegiatan kerja bakti massal yang diagendakan pengurus RT.'
    ],
    larangan: [
      'Dilarang membuang sampah di lahan kosong, selokan, atau jalan fasum.',
      'Dilarang membakar sampah plastik atau dedaunan yang menimbulkan asap pekat dan mengganggu pernapasan warga.',
      'Dilarang membiarkan genangan air yang berpotensi menjadi sarang nyamuk Aedes Aegypti.'
    ],
    sanksi: 'Teguran lisan/tertulis dari Seksi Lingkungan Hidup dan denda sosial pembersihan area terdampak.',
    isi: `Pasal 7: Pemilahan & Jadwal Sampah
1. Warga wajib menempatkan sampah dalam wadah tertutup di depan rumah masing-masing agar tidak diacak-acak oleh hewan.
2. Penarikan sampah oleh petugas kebersihan dilakukan setiap hari Selasa, Kamis, dan Sabtu pagi.
3. Warga sangat dianjurkan memilah sampah organik dan anorganik untuk mendukung program Bank Sampah RT.

Pasal 8: Larangan Membakar Sampah & Menjaga Selokan
1. DILARANG KERAS membakar sampah di area pemukiman yang dapat menimbulkan asap pekat, polusi udara, dan bahaya kebakaran.
2. Setiap warga bertanggung jawab menjaga kebersihan saluran air (got) di depan rumahnya masing-masing agar tidak mampet dan tidak menjadi sarang nyamuk.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/KEB/004/2026',
    keywords: ['kebersihan', 'sampah', 'bakar sampah', 'selokan', 'jadwal sampah', 'kerja bakti'],
    number: 'TT-004',
    category: 'KEBERSIHAN',
    title: 'BAB IV - Kebersihan, Pengelolaan Sampah & Lingkungan'
  },
  {
    id: 'TT-005',
    kode: 'TT-PAR-005',
    nomor: 'BAB V Pasal 5',
    judul: 'Tata Tertib Parkir Kendaraan Warga & Tamu',
    kategori: 'PARKIR',
    dasar: 'Hasil Musyawarah Khusus Penataan Lalu Lintas Komplek RT 07 GPA.',
    tujuan: 'Menjaga kelancaran arus lalu lintas kendaraan, ambulans, dan mobil pemadam darurat di jalan komplek.',
    ruangLingkup: 'Seluruh jalan lingkungan, jalan paving, dan bahu jalan di kawasan RT 07 RW 11.',
    kewajiban: [
      'Warga yang memiliki kendaraan roda 4 wajib memarkirkan kendaraannya di dalam garasi/carport rumah masing-masing.',
      'Bila terpaksa parkir di bahu jalan, wajib menempelkan kendaraan sejajar dan memastikan sisa lebar jalan minimal 2,5 meter.',
      'Memasang nomor telepon di kaca depan kendaraan bila parkir sementara di depan rumah tetangga.'
    ],
    larangan: [
      'Dilarang memarkir kendaraan roda 4 di jalan sempit atau tikungan yang menghalangi akses tetangga.',
      'Dilarang memarkir kendaraan secara diagonal/serong di jalan utama komplek.',
      'Dilarang membangun kanopi permanen yang menjorok keluar melebihi batas jalan fasum tanpa izin.'
    ],
    sanksi: 'Teguran langsung oleh Seksi Ketertiban dan kewajiban memindahkan kendaraan dalam tempo 15 menit.',
    isi: `Pasal 9: Penataan Garasi & Bahu Jalan
1. Setiap warga yang memiliki kendaraan roda empat (mobil) wajib mengutamakan penggunaan garasi atau carport di dalam batas persil rumah.
2. Apabila memarkir mobil di tepi jalan perumahan, posisi kendaraan harus sejajar (tidak serong/melintang) dan tidak boleh menghalangi akses keluar masuk tetangga di depannya atau di sampingnya.
3. Dilarang memarkir kendaraan di tikungan jalan atau area sempit yang menghambat akses darurat seperti mobil pemadam kebakaran atau ambulans.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/PAR/005/2026',
    keywords: ['parkir', 'mobil', 'motor', 'garasi', 'jalan sempit', 'carport', 'ambulans'],
    number: 'TT-005',
    category: 'PARKIR',
    title: 'BAB V - Tata Tertib Parkir Kendaraan Warga & Tamu'
  },
  {
    id: 'TT-006',
    kode: 'TT-TAM-006',
    nomor: 'BAB VI Pasal 6',
    judul: 'Penerimaan Tamu & Aturan Menginap (1x24 Jam)',
    kategori: 'TAMU',
    dasar: 'Ketentuan Perundang-undangan RI tentang Wajib Lapor Tamu 1x24 Jam.',
    tujuan: 'Mencegah potensi kerawanan sosial, tindak kriminalitas, dan menjaga ketertiban lingkungan hunian.',
    ruangLingkup: 'Tamu keluarga, kerabat, mitra kerja, atau pekerja bangunan yang berkunjung/menginap di RT 07.',
    kewajiban: [
      'Tamu yang menginap lebih dari 1x24 jam wajib dilaporkan kepada Pengurus RT melalui formulir portal SMART RT atau WhatsApp RT.',
      'Tuan rumah bertanggung jawab penuh atas segala tindakan dan ketertiban tamunya selama berada di lingkungan RT 07.'
    ],
    larangan: [
      'Dilarang menerima tamu lawan jenis bukan muhrim pada jam larut malam dalam kondisi pintu tertutup rapat.',
      'Dilarang membiarkan tamu membuat keributan di jalan komplek di atas jam istirahat.'
    ],
    sanksi: 'Pemberitahuan kepada tuan rumah dan verifikasi oleh tim siskamling.',
    isi: `Pasal 10: Wajib Lapor Tamu Menginap
1. Tamu atau kerabat warga yang menginap lebih dari 1x24 jam wajib dilaporkan kepada Pengurus RT (Ketua/Sekretaris RT atau melalui fitur Lapor Tamu di Portal SMART RT).
2. Tuan rumah bertanggung jawab penuh atas ketertiban dan keselamatan tamunya selama berada di lingkungan RT 07 Perum GPA Ngijo.
3. Tamu yang berkunjung wajib mematuhi batas jam bertamu wajar hingga pukul 22.00 WIB pada hari kerja dan pukul 23.00 WIB pada malam libur/akhir pekan.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/TAM/006/2026',
    keywords: ['tamu', '1x24 jam', 'menginap', 'lapor tamu', 'jam bertamu', 'kerabat'],
    number: 'TT-006',
    category: 'TAMU',
    title: 'BAB VI - Penerimaan Tamu & Aturan Menginap (1x24 Jam)'
  },
  {
    id: 'TT-007',
    kode: 'TT-KEG-007',
    nomor: 'BAB VII Pasal 7',
    judul: 'Kegiatan Warga, Pertemuan Rutin & Gotong Royong',
    kategori: 'KEGIATAN_WARGA',
    dasar: 'Agenda Rutin Guyub Rukun RT 07 RW 11 GPA Ngijo.',
    tujuan: 'Menumbuhkan rasa kebersamaan, toleransi, dan kekeluargaan yang erat antar warga.',
    ruangLingkup: 'Musyawarah RT, arisan bapak/ibu, kegiatan kepemudaan, peringatan HUT RI, dan hari besar keagamaan.',
    kewajiban: [
      'Warga wajib menghadiri Pertemuan / Musyawarah Warga minimal diwakili 1 orang anggota keluarga.',
      'Menginformasikan kepada Pengurus RT minimal H-3 bila menyelenggarakan hajatan yang melibatkan pemasangan tenda di jalan umum.'
    ],
    larangan: [
      'Dilarang menutup total jalan umum komplek tanpa koordinasi jalur pengalihan dan izin tertulis dari Ketua RT.',
      'Dilarang menggunakan fasilitas umum untuk kepentingan komersial pribadi tanpa izin warga.'
    ],
    sanksi: 'Teguran lisan dan kewajiban membuka akses jalan darurat.',
    isi: `Pasal 11: Musyawarah Rutin & Arisan Warga
1. Pertemuan rutin bapak-bapak dan arisan ibu-ibu RT 07 diselenggarakan setiap 1 (satu) bulan sekali sesuai jadwal yang disepakati.
2. Setiap Kepala Keluarga (KK) wajib mengutus perwakilan untuk hadir dalam musyawarah RT demi menjaga transparansi dan kebersamaan.

Pasal 12: Izin Penyelenggaraan Acara / Hajatan
1. Warga yang akan menyelenggarakan acara/hajatan (pernikahan, khitanan, syukuran, dsb) yang menggunakan sebagian badan jalan atau fasum wajib memberitahukan kepada Pengurus RT minimal 3 (tiga) hari sebelumnya.
2. Penyelenggara acara wajib menyediakan ruang lalu lintas alternatif dan berkoordinasi dengan tetangga terdekat.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/KEG/007/2026',
    keywords: ['kegiatan', 'musyawarah', 'arisan', 'hajatan', 'tenda', 'rapat warga', 'gotong royong'],
    number: 'TT-007',
    category: 'KEGIATAN_WARGA',
    title: 'BAB VII - Kegiatan Warga, Pertemuan Rutin & Gotong Royong'
  },
  {
    id: 'TT-008',
    kode: 'TT-HEW-008',
    nomor: 'BAB VIII Pasal 8',
    judul: 'Pemeliharaan Hewan Peliharaan',
    kategori: 'HEWAN_PELIHARAAN',
    dasar: 'Ketentuan Sanitasi dan Ketertiban Pemeliharaan Hewan di Pemukiman.',
    tujuan: 'Menjaga kenyamanan, keselamatan anak-anak, dan kebersihan jalan lingkungan dari kotoran hewan.',
    ruangLingkup: 'Kucing, anjing, burung, dan hewan peliharaan lainnya milik warga RT 07.',
    kewajiban: [
      'Pemilik hewan peliharaan wajib memastikan hewan berada di dalam pekarangan rumah atau dalam pengawasan saat diajak keluar.',
      'Pemilik wajib segera membersihkan kotoran hewannya apabila buang kotoran di jalan atau area fasum komplek.',
      'Memastikan hewan peliharaan telah divaksinasi secara berkala (misal rabies untuk anjing/kucing).'
    ],
    larangan: [
      'Dilarang membiarkan anjing galak berkeliaran bebas di jalanan tanpa tali penuntun (leash).',
      'Dilarang memelihara hewan ternak besar (kambing, sapi) di area perumahan yang menimbulkan bau menyengat.'
    ],
    sanksi: 'Teguran lisan dari Pengurus RT dan ganti rugi pembersihan/pengobatan bila terjadi cedera.',
    isi: `Pasal 13: Kewajiban Pemilik Hewan Peliharaan
1. Pemilik hewan peliharaan (kucing, anjing, unggas, dsb) wajib menjaga agar hewannya tidak berkeliaran bebas di luar pekarangan rumah tanpa pengawasan.
2. Pemilik hewan WAJIB MEMBERSIHKAN kotoran hewannya yang mengotori jalan, selokan, atau halaman tetangga.
3. Hewan peliharaan yang berpotensi membahayakan (misal anjing penjaga) wajib diikat atau dimasukkan kandang, serta memakai tali penuntun (leash) saat dibawa keluar rumah.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/HEW/008/2026',
    keywords: ['hewan', 'peliharaan', 'anjing', 'kucing', 'kotoran', 'leash', 'unggas', 'vaksin'],
    number: 'TT-008',
    category: 'HEWAN_PELIHARAAN',
    title: 'BAB VIII - Pemeliharaan Hewan Peliharaan'
  },
  {
    id: 'TT-009',
    kode: 'TT-JAM-009',
    nomor: 'BAB IX Pasal 9',
    judul: 'Jam Istirahat, Kebisingan & Pekerjaan Bangunan',
    kategori: 'JAM_ISTIRAHAT',
    dasar: 'Ketentuan Hak Istirahat dan Batas Polusi Suara di Pemukiman.',
    tujuan: 'Menjamin hak istirahat warga, kenyamanan lansia, anak belajar, dan balita di lingkungan perumahan.',
    ruangLingkup: 'Aktivitas pertukangan, renovasi rumah, sound system, musik, dan knalpot brong kendaraan.',
    kewajiban: [
      'Pekerjaan renovasi rumah dengan suara keras hanya diizinkan pada hari Senin s/d Sabtu pukul 08.00 - 17.00 WIB.',
      'Mematuhi jam istirahat malam mulai pukul 22.00 WIB hingga 05.00 WIB.'
    ],
    larangan: [
      'Dilarang menyalakan sound system berdaya tinggi atau musik bervolume keras di atas pukul 22.00 WIB.',
      'Dilarang menggeber gas motor dengan knalpot bising / brong di jalan komplek.',
      'Dilarang melakukan pekerjaan bertukang berat pada hari Minggu tanpa persetujuan tetangga kiri-kanan.'
    ],
    sanksi: 'Teguran langsung oleh Tim Ronda malam dan permintaan penghentian aktivitas sumber suara.',
    isi: `Pasal 14: Batasan Kebisingan & Suara Keras
1. Demi menjaga ketenangan dan hak istirahat warga, aktivitas yang menimbulkan kebisingan (musik keras, sound system, knalpot brong) dibatasi maksimal hingga pukul 22.00 WIB.
2. Pekerjaan renovasi/pembangunan rumah yang menimbulkan suara bising pertukangan (palu, gerinda, bor) diizinkan beroperasi pada hari Senin - Sabtu pukul 08.00 - 17.00 WIB.
3. Pekerjaan renovasi pada hari Minggu harus mendapat persetujuan terlebih dahulu dari tetangga terdekat.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/JAM/009/2026',
    keywords: ['renovasi', 'jam istirahat', 'bising', 'musik', 'knalpot', 'suara keras', 'pertukangan'],
    number: 'TT-009',
    category: 'JAM_ISTIRAHAT',
    title: 'BAB IX - Jam Istirahat, Kebisingan & Pekerjaan Bangunan'
  },
  {
    id: 'TT-010',
    kode: 'TT-KEU-010',
    nomor: 'BAB X Pasal 10',
    judul: 'Iuran Kas RT, Dana Kematian & Transparansi Keuangan',
    kategori: 'KEUANGAN',
    dasar: 'Anggaran Dasar Kas RT 07 dan Program Jaminan Sosial Duka Cita.',
    tujuan: 'Menjamin ketersediaan dana operasional lingkungan, keamanan, penerangan fasum, dan santunan kematian warga.',
    ruangLingkup: 'Iuran kas wajib bulanan, omplongan hari besar, dan dana santunan duka cita.',
    kewajiban: [
      'Setiap Kepala Keluarga wajib membayar Iuran Wajib RT sebelum tanggal 10 setiap bulannya.',
      'Pembayaran dapat dilakukan secara tunai kepada Koordinator Blok atau via transfer QRIS kas RT.',
      'Pengurus RT wajib mempublikasikan laporan keuangan secara transparan setiap akhir bulan di SMART RT.'
    ],
    larangan: [
      'Dilarang menggunakan kas RT untuk kepentingan pribadi pengurus.',
      'Dilarang menunggak iuran lebih dari 3 bulan berturut-turut tanpa konfirmasi kondisi darurat.'
    ],
    sanksi: 'Klarifikasi oleh Bendahara RT dan penyesuaian status keaktifan layanan sosial.',
    isi: `Pasal 15: Nominal & Jadwal Pembayaran Iuran
1. Iuran Wajib Warga RT 07 RW 11 per bulan ditetapkan sebesar Rp 25.000 (Kas RT & Fasum) + Rp 15.000 (Kebersihan/Sampah) + Rp 10.000 (Dana Kematian).
2. Iuran dibayarkan paling lambat tanggal 10 setiap bulannya melalui Bendahara RT, Penarik Iuran Blok, atau Transfer Rekening Resmi RT.
3. Laporan pertanggungjawaban kas dipublikasikan secara real-time pada modul Keuangan SMART RT dan dibacakan pada pertemuan rutin warga.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/KEU/010/2026',
    keywords: ['iuran', 'kas rt', 'keuangan', 'dana kematian', 'bendahara', 'transparansi', 'qris'],
    number: 'TT-010',
    category: 'KEUANGAN',
    title: 'BAB X - Iuran Kas RT, Dana Kematian & Transparansi Keuangan'
  },
  {
    id: 'TT-011',
    kode: 'TT-FAS-011',
    nomor: 'BAB XI Pasal 11',
    judul: 'Penggunaan Fasilitas Umum & Inventaris RT',
    kategori: 'FASILITAS_UMUM',
    dasar: 'Pengelolaan Aset dan Inventaris Bersama RT 07 RW 11 GPA.',
    tujuan: 'Menjaga keutuhan, keawetan, dan ketersediaan barang inventaris milik warga.',
    ruangLingkup: 'Tenda RT, kursi lipat, sound system portable, genset, gerobak sampah, dan alat kerja bakti.',
    kewajiban: [
      'Peminjaman inventaris RT wajib dicatat dalam buku peminjaman Seksi Perlengkapan atau via SMART RT.',
      'Barang inventaris yang dipinjam wajib dikembalikan dalam keadaan bersih dan berfungsi baik.',
      'Warga wajib merawat fasilitas bersama seperti lampu jalan, taman bermain, dan pos satpam.'
    ],
    larangan: [
      'Dilarang merusak, memindahtangankan, atau menjual inventaris milik RT.',
      'Dilarang menguasai fasilitas umum untuk kepentingan pribadi secara permanen.'
    ],
    sanksi: 'Kewajiban mengganti biaya perbaikan atau penggantian barang yang rusak/hilang.',
    isi: `Pasal 16: Peminjaman Inventaris RT
1. Warga RT 07 berhak meminjam aset inventaris milik RT (tenda, kursi, sound portable, gerobak dorong, cangkul/sekop) untuk keperluan acara pribadi atau gotong royong.
2. Peminjaman harus tercatat melalui Seksi Perlengkapan / Inventaris RT pada sistem SMART RT.
3. Peminjam bertanggung jawab mengembalikan inventaris dalam keadaan utuh, bersih, dan tepat waktu. Segala kerusakan akibat kelalaian wajib diganti oleh peminjam.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/FAS/011/2026',
    keywords: ['fasilitas umum', 'inventaris', 'pinjam tenda', 'kursi', 'sound system', 'aset rt'],
    number: 'TT-011',
    category: 'FASILITAS_UMUM',
    title: 'BAB XI - Penggunaan Fasilitas Umum & Inventaris RT'
  },
  {
    id: 'TT-012',
    kode: 'TT-SAN-012',
    nomor: 'BAB XII Pasal 12',
    judul: 'Sanksi Pelanggaran & Prosedur Penyelesaian Perselisihan',
    kategori: 'PELANGGARAN',
    dasar: 'Asas Musyawarah Mufakat dan Pembinaan Warga Perumahan.',
    tujuan: 'Menyelesaikan permasalahan lingkungan secara damai, berkeadilan, dan bermartabat tanpa perlu eskalasi pidana bila dapat didamaikan.',
    ruangLingkup: 'Seluruh aduan pelanggaran tata tertib dan sengketa antar warga di RT 07.',
    kewajiban: [
      'Mengedepankan musyawarah kekeluargaan dengan difasilitasi oleh Pengurus RT dan Tokoh Masyarakat.',
      'Mematuhi keputusan damai yang telah ditandatangani bersama.'
    ],
    larangan: [
      'Dilarang melakukan tindakan main hakim sendiri (persekusi, pengancaman, pengerusakan).',
      'Dilarang menyebarkan fitnah atau kabar bohong di grup media sosial warga.'
    ],
    sanksi: 'Tahapan sanksi: 1) Teguran Lisan, 2) Teguran Tertulis, 3) Denda Sosial/Kerja Sosial, 4) Pelimpahan ke RW/Polsek Karangploso.',
    isi: `Pasal 17: Tahapan Penegakan Aturan
1. Pelanggaran terhadap tata tertib ini diselesaikan dengan tahapan:
   a. Tahap 1: Musyawarah dan teguran lisan secara kekeluargaan oleh Pengurus RT.
   b. Tahap 2: Surat Peringatan (Teguran Tertulis) resmi yang diterbitkan oleh Ketua RT.
   c. Tahap 3: Pemanggilan para pihak dalam musyawarah mediasi khusus tingkat RT/RW.
2. Apabila terdapat unsur tindak pidana murni atau perusakan berat yang tidak dapat dimediasi, Pengurus RT berhak meneruskan laporan kepada pihak berwajib (Polsek Karangploso / Babinsa / Bhabinkamtibmas Desa Ngijo).`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/SAN/012/2026',
    keywords: ['pelanggaran', 'sanksi', 'mediasi', 'musyawarah', 'polsek', 'babinsa', 'peringatan'],
    number: 'TT-012',
    category: 'PELANGGARAN',
    title: 'BAB XII - Sanksi Pelanggaran & Prosedur Penyelesaian Perselisihan'
  },
  {
    id: 'TT-013',
    kode: 'TT-SOS-013',
    nomor: 'BAB XIII Pasal 13',
    judul: 'Ketentuan Penutup & Pengesahan Versi',
    kategori: 'SOSIAL',
    dasar: 'Berita Acara Rapat Warga Tahunan RT 07 RW 11 GPA Ngijo.',
    tujuan: 'Menetapkan kekuatan hukum lingkungan dan legalitas aturan resmi yang berlaku.',
    ruangLingkup: 'Seluruh pasal dari Bab I sampai Bab XIII.',
    kewajiban: [
      'Setiap warga wajib membaca, memahami, dan mematuhi isi tata tertib ini.',
      'Pengurus RT wajib menyosialisasikan buku tata tertib baik dalam bentuk cetak maupun aplikasi digital SMART RT.'
    ],
    larangan: ['Dilarang mengubah isi tata tertib tanpa melalui mekanisme musyawarah resmi RT.'],
    sanksi: 'Penolakan atas revisi sepihak.',
    isi: `Pasal 18: Pengesahan & Pengubahan Rules
1. Tata Tertib Warga RT 07 RW 11 Versi 1.1 ini disahkan berdasarkan hasil keputusan Musyawarah Pengurus & Warga RT 07 pada bulan Agustus 2026.
2. Perubahan atau revisi tata tertib hanya dapat dilakukan melalui Musyawarah Warga resmi dan diterbitkan kembali dengan nomor versi baru (e.g. Versi 1.2 / 2.0) oleh Ketua RT 07.
3. Dokumen digital ini memiliki keabsahan hukum lingkungan yang sah dan dapat diverifikasi via QR Verification Code pada Portal SMART RT.`,
    status: 'AKTIF',
    versi: '1.1',
    tanggalBerlaku: '2026-08-17',
    dibuatOleh: 'admin_rt07',
    disetujuiOleh: 'Bapak Eko Sucahyono (Ketua RT 07)',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    documentNumber: 'TT/RT07RW11/SOS/013/2026',
    keywords: ['penutup', 'pengesahan', 'musyawarah', 'revisi', 'versi 1.1', 'keabsahan'],
    number: 'TT-013',
    category: 'SOSIAL',
    title: 'BAB XIII - Ketentuan Penutup & Pengesahan Versi'
  }
];

export const INITIAL_TATA_TERTIB_HISTORY: TataTertibHistory[] = [
  {
    id: 'HIST-001',
    tataTertibId: 'TT-GLOBAL',
    version: '1.0',
    changeSummary: 'Penerbitan awal Dokumen Resmi Tata Tertib Warga RT 07 RW 11 Perum GPA Ngijo tahun 2026.',
    previousVersion: '0.9-DRAFT',
    approvedBy: 'Bapak Eko Sucahyono (Ketua RT 07)',
    approvedAt: '2026-01-01T08:00:00.000Z',
    effectiveDate: '2026-01-01',
    reason: 'Penyusunan dasar hukum lingkungan perumahan GPA Ngijo.',
    changesList: [
      'Penetapan Bab I s/d Bab XII mengenai Ketertiban Umum, Iuran, Keamanan, dan Fasilitas.',
      'Sosialisasi portal SMART RT untuk layanan digital warga.'
    ],
    createdBy: 'Admin RT 07'
  },
  {
    id: 'HIST-002',
    tataTertibId: 'TT-GLOBAL',
    version: '1.1',
    changeSummary: 'Revisi ketentuan parkir bahu jalan, penegasan jam tutup portal 23.00 WIB, dan penyesuaian nominal iuran dana kematian.',
    previousVersion: '1.0',
    approvedBy: 'Bapak Eko Sucahyono (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z',
    effectiveDate: '2026-08-17',
    reason: 'Hasil evaluasi musyawarah warga semester I 2026 mengenai ketertiban parkir mobil dan keamanan komplek.',
    changesList: [
      'Penambahan aturan larangan parkir serong di jalan utama komplek (Bab V).',
      'Penetapan batas jam tutup portal malam pukul 23.00 WIB (Bab III).',
      'Integrasi buku dana kematian terpisah dan santunan duka cita (Bab X).'
    ],
    createdBy: 'Ketua RT & Pengurus'
  }
];

export class TataTertibService {
  // ==========================================
  // ARTICLES & RULES ENGINE
  // ==========================================
  static getArticles(): TataTertibArticle[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(INITIAL_TATA_TERTIB_ARTICLES));
        return INITIAL_TATA_TERTIB_ARTICLES;
      }
      const parsed: any[] = JSON.parse(raw);
      // Migration adapter: ensure new schema fields exist
      const migrated = parsed.map((item, idx) => {
        const fallback = INITIAL_TATA_TERTIB_ARTICLES[idx] || INITIAL_TATA_TERTIB_ARTICLES[0];
        return {
          id: item.id || `TT-${String(idx + 1).padStart(3, '0')}`,
          kode: item.kode || fallback.kode || `TT-UMU-${String(idx + 1).padStart(3, '0')}`,
          nomor: item.nomor || fallback.nomor || `BAB ${idx + 1}`,
          judul: item.judul || item.title || fallback.judul,
          kategori: item.kategori || item.category || fallback.kategori || 'UMUM',
          isi: item.isi || item.content || fallback.isi || '',
          dasar: item.dasar || fallback.dasar || 'Hasil Musyawarah Warga RT 07 RW 11 GPA Ngijo',
          tujuan: item.tujuan || fallback.tujuan || 'Menjaga ketertiban, kebersihan, dan kenyamanan lingkungan',
          ruangLingkup: item.ruangLingkup || fallback.ruangLingkup || 'Seluruh warga penghuni dan tamu RT 07',
          kewajiban: item.kewajiban || fallback.kewajiban || ['Mematuhi aturan bersama', 'Menjaga kerukunan'],
          larangan: item.larangan || fallback.larangan || ['Dilarang mengganggu ketentraman tetangga'],
          sanksi: item.sanksi || fallback.sanksi || 'Teguran lisan/tertulis dari Pengurus RT',
          catatan: item.catatan || '',
          status: (item.status === 'ACTIVE' ? 'AKTIF' : item.status === 'PENDING_APPROVAL' ? 'MENUNGGU_PERSETUJUAN' : item.status === 'ARCHIVED' ? 'DIARSIPKAN' : item.status === 'REVISED' ? 'DIREVISI' : item.status) || 'AKTIF',
          versi: item.versi || item.version || '1.1',
          tanggalBerlaku: item.tanggalBerlaku || item.effectiveDate || '2026-08-17',
          tanggalBerakhir: item.tanggalBerakhir,
          dibuatOleh: item.dibuatOleh || item.createdBy || 'Admin RT 07',
          disetujuiOleh: item.disetujuiOleh || item.approvedBy || 'Bapak Eko Sucahyono (Ketua RT 07)',
          createdAt: item.createdAt || '2026-01-01T08:00:00.000Z',
          updatedAt: item.updatedAt || new Date().toISOString(),
          documentNumber: item.documentNumber || `TT/RT07RW11/${String(item.kategori || 'UMU').slice(0, 3).toUpperCase()}/${String(idx + 1).padStart(3, '0')}/2026`,
          keywords: item.keywords || fallback.keywords || ['tata tertib', 'aturan', 'rt 07'],
          // legacy backwards compatibility
          number: item.id || `TT-${String(idx + 1).padStart(3, '0')}`,
          category: item.kategori || item.category || 'UMUM',
          title: item.judul || item.title,
          summary: item.summary || item.tujuan || item.judul,
          content: item.isi || item.content || fallback.isi,
          version: item.versi || item.version || '1.1',
          effectiveDate: item.tanggalBerlaku || item.effectiveDate || '2026-08-17',
          createdBy: item.dibuatOleh || item.createdBy || 'Admin RT 07',
          approvedBy: item.disetujuiOleh || item.approvedBy,
          approvedAt: item.approvedAt || item.updatedAt
        };
      });
      return migrated;
    } catch {
      return INITIAL_TATA_TERTIB_ARTICLES;
    }
  }

  static saveArticles(articles: TataTertibArticle[]): void {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    syncDataWithGAS('TATA_TERTIB', articles).catch(() => {});
  }

  static getActiveArticles(): TataTertibArticle[] {
    return this.getArticles().filter(a => a.status === 'AKTIF' || a.status === 'ACTIVE');
  }

  static getArticleById(id: string): TataTertibArticle | undefined {
    return this.getArticles().find(a => a.id === id || a.kode === id);
  }

  static getArticlesByCategory(category: string): TataTertibArticle[] {
    return this.getActiveArticles().filter(
      a => a.kategori.toLowerCase() === category.toLowerCase() || (a.category && a.category.toLowerCase() === category.toLowerCase())
    );
  }

  // ==========================================
  // CATEGORIES MANAGEMENT
  // ==========================================
  static getCategories(): TataTertibCategoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_TATA_TERTIB_CATEGORIES));
        return DEFAULT_TATA_TERTIB_CATEGORIES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TATA_TERTIB_CATEGORIES;
    }
  }

  static saveCategories(categories: TataTertibCategoryItem[]): void {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }

  static addCategory(
    payload: { code: string; name: string; description?: string; icon?: string },
    userRole: UserRole | string,
    userName: string
  ): { success: boolean; message: string; category?: TataTertibCategoryItem } {
    if (!['ADMIN', 'KETUA_RT', 'PENGURUS'].includes(userRole)) {
      this.logAudit({
        action: 'TATA_TERTIB_ACCESS_DENIED',
        userId: userName,
        userName,
        role: String(userRole),
        details: `Upaya penambahan kategori tanpa hak akses: ${payload.name}`,
        result: 'REJECTED'
      });
      return { success: false, message: 'Akses Ditolak: Hanya Pengurus atau Admin yang dapat menambah kategori.' };
    }

    const categories = this.getCategories();
    const cleanCode = payload.code.toUpperCase().replace(/\s+/g, '_');
    if (categories.some(c => c.code === cleanCode || c.name.toLowerCase() === payload.name.toLowerCase())) {
      return { success: false, message: `Kategori "${payload.name}" sudah ada dalam daftar.` };
    }

    const newCat: TataTertibCategoryItem = {
      id: `CAT-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      name: payload.name,
      description: payload.description || '',
      icon: payload.icon || 'FileText',
      isSystem: false,
      createdAt: new Date().toISOString()
    };

    categories.push(newCat);
    this.saveCategories(categories);

    this.logAudit({
      action: 'TATA_TERTIB_CATEGORY_ADDED',
      userId: userName,
      userName,
      role: String(userRole),
      targetId: newCat.id,
      details: `Menambahkan kategori tata tertib baru: ${newCat.name} (${newCat.code})`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Kategori "${newCat.name}" berhasil ditambahkan.`, category: newCat };
  }

  // ==========================================
  // CONFIGURATION MANAGEMENT
  // ==========================================
  static getConfig(): TataTertibConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_TATA_TERTIB_CONFIG));
        return DEFAULT_TATA_TERTIB_CONFIG;
      }
      return { ...DEFAULT_TATA_TERTIB_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_TATA_TERTIB_CONFIG;
    }
  }

  static updateConfig(config: Partial<TataTertibConfig>, userRole: UserRole | string, userName: string): { success: boolean; message: string } {
    if (!['ADMIN', 'KETUA_RT'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Hanya Admin atau Ketua RT yang dapat mengubah konfigurasi modul.' };
    }
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    return { success: true, message: 'Pengaturan modul Tata Tertib berhasil disimpan.' };
  }

  // ==========================================
  // VERSIONING & HISTORY
  // ==========================================
  static getHistoryList(): TataTertibHistory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_TATA_TERTIB_HISTORY));
        return INITIAL_TATA_TERTIB_HISTORY;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_TATA_TERTIB_HISTORY;
    }
  }

  static saveHistory(hist: TataTertibHistory[]): void {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(hist));
  }

  // ==========================================
  // CITIZEN ACKNOWLEDGEMENT & FEEDBACK
  // ==========================================
  static getAcks(): TataTertibAck[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACK);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static isUserAcknowledged(userId: string, version: string = '1.1'): boolean {
    const acks = this.getAcks();
    return acks.some(a => a.userId === userId && a.version === version);
  }

  static acknowledge(userId: string, userName: string, version: string = '1.1', blokRumah?: string): { success: boolean; message: string } {
    const acks = this.getAcks();
    const existing = acks.find(a => a.userId === userId && a.version === version);

    if (existing) {
      return { success: true, message: 'Anda sudah mengonfirmasi pemahaman tata tertib versi ini.' };
    }

    const newAck: TataTertibAck = {
      id: `ACK-${Date.now()}`,
      tataTertibId: 'TT-GLOBAL',
      version,
      userId,
      userName,
      acknowledgedAt: new Date().toISOString(),
      blokRumah
    };

    acks.push(newAck);
    localStorage.setItem(STORAGE_KEY_ACK, JSON.stringify(acks));

    this.logAudit({
      action: 'TATA_TERTIB_ACKNOWLEDGED',
      userId,
      userName,
      role: 'WARGA',
      targetId: `ACK-${version}`,
      details: `Warga ${userName} (${blokRumah || 'RT 07'}) telah membaca & menyetujui Tata Tertib v${version}`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Terima kasih, konfirmasi pemahaman Tata Tertib v${version} berhasil dicatat!` };
  }

  static getFeedbackList(): TataTertibFeedback[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static submitFeedback(tataTertibId: string, isHelpful: boolean, comment?: string, userId: string = 'warga_user', userName: string = 'Warga'): { success: boolean; message: string } {
    const feedbackList = this.getFeedbackList();
    const newFb: TataTertibFeedback = {
      id: `FB-${Date.now()}`,
      tataTertibId,
      isHelpful,
      comment,
      userId,
      userName,
      createdAt: new Date().toISOString()
    };

    feedbackList.push(newFb);
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(feedbackList));

    return { success: true, message: 'Terima kasih atas masukan aspirasi Bapak/Ibu demi kenyamanan RT 07.' };
  }

  // ==========================================
  // ADMIN & PENGURUS WORKFLOWS
  // ==========================================
  static createDraft(
    payload: {
      judul: string;
      kategori: string;
      isi: string;
      dasar?: string;
      tujuan?: string;
      ruangLingkup?: string;
      kewajiban?: string[];
      larangan?: string[];
      sanksi?: string;
      catatan?: string;
      tanggalBerlaku?: string;
      keywords?: string[];
    },
    creatorRole: UserRole | string,
    creatorName: string
  ): { success: boolean; message: string; article?: TataTertibArticle } {
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(creatorRole)) {
      this.logAudit({
        action: 'TATA_TERTIB_ACCESS_DENIED',
        userId: creatorName,
        userName: creatorName,
        role: String(creatorRole),
        details: `Mencoba membuat draft tanpa wewenang: ${payload.judul}`,
        result: 'REJECTED'
      });
      return { success: false, message: 'Akses Ditolak: Hanya Pengurus, Ketua RT, atau Admin yang dapat membuat draft aturan baru.' };
    }

    const articles = this.getArticles();
    const nextIdx = articles.length + 1;
    const catCode = payload.kategori.slice(0, 3).toUpperCase();
    const codeStr = `TT-${catCode}-${String(nextIdx).padStart(3, '0')}`;
    const year = new Date().getFullYear();
    const docNo = `TT/RT07RW11/${catCode}/${String(nextIdx).padStart(3, '0')}/${year}`;

    const newArticle: TataTertibArticle = {
      id: `TT-${String(nextIdx).padStart(3, '0')}`,
      kode: codeStr,
      nomor: `BAB ${nextIdx}`,
      judul: payload.judul,
      kategori: payload.kategori,
      isi: payload.isi,
      dasar: payload.dasar || 'Hasil Musyawarah Pengurus & Warga RT 07',
      tujuan: payload.tujuan || 'Menjaga ketertiban lingkungan perumahan',
      ruangLingkup: payload.ruangLingkup || 'Seluruh warga dan tamu di lingkungan RT 07 RW 11',
      kewajiban: payload.kewajiban || ['Mematuhi aturan bersama'],
      larangan: payload.larangan || ['Dilarang mengganggu ketentraman umum'],
      sanksi: payload.sanksi || 'Teguran lisan dan mediasi musyawarah RT',
      catatan: payload.catatan || '',
      status: 'DRAFT',
      versi: '1.2-DRAFT',
      tanggalBerlaku: payload.tanggalBerlaku || new Date().toISOString().split('T')[0],
      dibuatOleh: creatorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentNumber: docNo,
      keywords: payload.keywords || [payload.judul.toLowerCase(), payload.kategori.toLowerCase()]
    };

    articles.push(newArticle);
    this.saveArticles(articles);

    this.logAudit({
      action: 'TATA_TERTIB_CREATED',
      userId: creatorName,
      userName: creatorName,
      role: String(creatorRole),
      targetId: newArticle.kode,
      details: `Membuat draft Tata Tertib baru #${newArticle.kode}: ${newArticle.judul}`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Draft Tata Tertib #${newArticle.kode} berhasil dibuat (Status: DRAFT).`, article: newArticle };
  }

  static updateDraft(
    articleId: string,
    payload: Partial<TataTertibArticle>,
    userRole: UserRole | string,
    userName: string
  ): { success: boolean; message: string; article?: TataTertibArticle } {
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Hanya Pengurus atau Admin yang dapat mengubah draft.' };
    }

    const articles = this.getArticles();
    const target = articles.find(a => a.id === articleId || a.kode === articleId);
    if (!target) return { success: false, message: 'Tata Tertib tidak ditemukan.' };

    if (target.status === 'AKTIF' && !['KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Aturan AKTIF tidak dapat diedit langsung. Buat revisi versi baru melalui Ketua RT.' };
    }

    if (payload.judul) target.judul = payload.judul;
    if (payload.kategori) target.kategori = payload.kategori;
    if (payload.isi) target.isi = payload.isi;
    if (payload.dasar) target.dasar = payload.dasar;
    if (payload.tujuan) target.tujuan = payload.tujuan;
    if (payload.ruangLingkup) target.ruangLingkup = payload.ruangLingkup;
    if (payload.kewajiban) target.kewajiban = payload.kewajiban;
    if (payload.larangan) target.larangan = payload.larangan;
    if (payload.sanksi) target.sanksi = payload.sanksi;
    if (payload.catatan !== undefined) target.catatan = payload.catatan;
    if (payload.tanggalBerlaku) target.tanggalBerlaku = payload.tanggalBerlaku;
    if (payload.keywords) target.keywords = payload.keywords;

    target.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    this.logAudit({
      action: 'TATA_TERTIB_UPDATED',
      userId: userName,
      userName,
      role: String(userRole),
      targetId: target.kode,
      details: `Memperbarui draft Tata Tertib #${target.kode}: ${target.judul}`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Draft Tata Tertib #${target.kode} berhasil diperbarui.`, article: target };
  }

  static submitForApproval(articleId: string, userRole: UserRole | string, userName: string): { success: boolean; message: string } {
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Wewenang terbatas pada Pengurus RT.' };
    }

    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId || a.kode === articleId);

    if (!article) return { success: false, message: 'Artikel Tata Tertib tidak ditemukan.' };
    if (article.status !== 'DRAFT' && article.status !== 'DITINJAU') {
      return { success: false, message: `Status saat ini (${article.status}) tidak valid untuk pengajuan persetujuan.` };
    }

    article.status = 'MENUNGGU_PERSETUJUAN';
    article.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    this.logAudit({
      action: 'TATA_TERTIB_SUBMITTED',
      userId: userName,
      userName,
      role: String(userRole),
      targetId: article.kode,
      details: `Mengajukan review persetujuan Tata Tertib #${article.kode} (${article.judul}) ke Ketua RT`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Tata Tertib #${article.kode} telah diajukan ke Ketua RT untuk disetujui (MENUNGGU_PERSETUJUAN).` };
  }

  static approveAndPublish(
    articleId: string,
    newVersion: string,
    effectiveDate: string,
    changeSummary: string,
    reason: string,
    approverRole: UserRole | string,
    approverName: string
  ): { success: boolean; message: string; article?: TataTertibArticle } {
    if (!['KETUA_RT', 'ADMIN'].includes(approverRole)) {
      this.logAudit({
        action: 'TATA_TERTIB_ACCESS_DENIED',
        userId: approverName,
        userName: approverName,
        role: String(approverRole),
        targetId: articleId,
        details: `Upaya publish aturan tanpa hak akses Ketua RT: ${articleId}`,
        result: 'REJECTED'
      });
      return { success: false, message: 'Akses Ditolak: Hanya Ketua RT atau Admin yang berwenang mengesahkan & mempublikasikan Tata Tertib resmi.' };
    }

    const articles = this.getArticles();
    const target = articles.find(a => a.id === articleId || a.kode === articleId);

    if (!target) return { success: false, message: 'Artikel Tata Tertib tidak ditemukan.' };

    const prevVer = target.versi || '1.1';
    target.status = 'AKTIF';
    target.versi = newVersion || '1.2';
    target.tanggalBerlaku = effectiveDate || new Date().toISOString().split('T')[0];
    target.disetujuiOleh = `${approverName} (${approverRole})`;
    target.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    // Save Version History
    const history = this.getHistoryList();
    const newHist: TataTertibHistory = {
      id: `HIST-${Date.now()}`,
      tataTertibId: target.kode || target.id,
      version: target.versi,
      changeSummary: changeSummary || `Pengesahan revisi ${target.judul} Versi ${target.versi}`,
      previousVersion: prevVer,
      approvedBy: target.disetujuiOleh,
      approvedAt: new Date().toISOString(),
      effectiveDate: target.tanggalBerlaku,
      reason: reason || 'Pembaruan aturan lingkungan berkala',
      createdBy: approverName
    };
    history.unshift(newHist);
    this.saveHistory(history);

    this.logAudit({
      action: 'TATA_TERTIB_APPROVED',
      userId: approverName,
      userName: approverName,
      role: String(approverRole),
      targetId: target.kode,
      details: `Menyetujui Tata Tertib #${target.kode} (${target.judul})`,
      result: 'SUCCESS'
    });

    this.logAudit({
      action: 'TATA_TERTIB_PUBLISHED',
      userId: approverName,
      userName: approverName,
      role: String(approverRole),
      targetId: target.kode,
      details: `Mengesahkan & mempublikasikan Tata Tertib #${target.kode} Versi ${target.versi} (Berlaku: ${target.tanggalBerlaku})`,
      result: 'SUCCESS'
    });

    return {
      success: true,
      message: `Selamat! Tata Tertib #${target.kode} Versi ${target.versi} resmi DISAHKAN dan BERLAKU untuk seluruh warga RT 07.`,
      article: target
    };
  }

  static archiveArticle(articleId: string, userRole: UserRole | string, userName: string, reason?: string): { success: boolean; message: string } {
    if (!['KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Wewenang Ketua RT atau Admin diperlukan untuk mengarsipkan aturan.' };
    }

    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId || a.kode === articleId);

    if (!article) return { success: false, message: 'Artikel tidak ditemukan.' };

    article.status = 'DIARSIPKAN';
    article.updatedAt = new Date().toISOString();
    if (reason) article.catatan = `Diarsipkan: ${reason} (oleh ${userName})`;

    this.saveArticles(articles);

    this.logAudit({
      action: 'TATA_TERTIB_ARCHIVED',
      userId: userName,
      userName,
      role: String(userRole),
      targetId: article.kode,
      details: `Mengarsipkan aturan Tata Tertib #${article.kode} (${article.judul}). Alasan: ${reason || '-'}`,
      result: 'SUCCESS'
    });

    return { success: true, message: `Aturan Tata Tertib #${article.kode} berhasil diarsipkan.` };
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  static getSummaryStats(): TataTertibSummaryStats {
    const articles = this.getArticles();
    const categories = this.getCategories();
    const acks = this.getAcks();

    const activeArticles = articles.filter(a => a.status === 'AKTIF' || a.status === 'ACTIVE');
    const activeVersion = activeArticles.length > 0 ? activeArticles[0].versi : '1.1';
    const effectiveDate = activeArticles.length > 0 ? activeArticles[0].tanggalBerlaku : '2026-08-17';

    const totalWargaKK = 70; // 70 KK di RT 07 RW 11 GPA Ngijo
    const ackCount = acks.filter(a => a.version === activeVersion).length;
    const ackPercentage = Math.round((ackCount / totalWargaKK) * 100);

    const latestUpdated = articles.reduce((latest, a) => {
      return a.updatedAt > latest ? a.updatedAt : latest;
    }, '2026-08-10T10:00:00.000Z');

    return {
      activeVersion,
      effectiveDate,
      totalTataTertib: articles.length,
      activeCount: activeArticles.length,
      draftCount: articles.filter(a => a.status === 'DRAFT' || a.status === 'DITINJAU').length,
      pendingCount: articles.filter(a => a.status === 'MENUNGGU_PERSETUJUAN' || a.status === 'PENDING_APPROVAL').length,
      archivedCount: articles.filter(a => a.status === 'DIARSIPKAN' || a.status === 'ARCHIVED').length,
      revisedCount: articles.filter(a => a.status === 'DIREVISI' || a.status === 'REVISED').length,
      totalCategories: categories.length,
      totalWarga: totalWargaKK,
      ackCount,
      ackPercentage,
      lastUpdatedDate: latestUpdated
    };
  }

  // ==========================================
  // AI & RAG KNOWLEDGE BASE INTEGRATION
  // ==========================================
  /**
   * Only returns ACTIVE rules with latest approved version for AI Knowledge Base
   */
  static getActiveRulesForRAG(): Array<{
    documentId: string;
    ruleCode: string;
    category: string;
    title: string;
    summary: string;
    content: string;
    dos: string[];
    donts: string[];
    sanction: string;
    version: string;
    status: string;
    effectiveDate: string;
    source: string;
    updatedAt: string;
  }> {
    const active = this.getActiveArticles();
    return active.map(rule => ({
      documentId: rule.documentNumber || rule.id,
      ruleCode: rule.kode || rule.id,
      category: rule.kategori,
      title: rule.judul,
      summary: rule.tujuan || rule.summary || rule.judul,
      content: rule.isi || rule.content || '',
      dos: rule.kewajiban || [],
      donts: rule.larangan || [],
      sanction: rule.sanksi || '',
      version: rule.versi,
      status: rule.status,
      effectiveDate: rule.tanggalBerlaku,
      source: `Tata Tertib Resmi RT 07 RW 11 GPA Ngijo Versi ${rule.versi}`,
      updatedAt: rule.updatedAt
    }));
  }

  // ==========================================
  // AUDIT LOG
  // ==========================================
  static getAuditLogs(): TataTertibAuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static logAudit(entry: Omit<TataTertibAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: TataTertibAuditLog = {
      id: `TT-LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    const trimmed = logs.slice(0, 300);
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(trimmed));

    // Also bridge to system central audit log
    try {
      AuditLogService.logEvent({
        action: entry.action,
        role: entry.role as any,
        userId: entry.userId,
        userName: entry.userName,
        module: 'TATA_TERTIB',
        targetType: 'TataTertibArticle',
        targetId: entry.targetId || 'TT-SYSTEM',
        details: entry.details,
        severity: entry.result === 'REJECTED' ? 'WARNING' : 'INFO'
      });
    } catch {
      // safe fallback
    }
  }
}
