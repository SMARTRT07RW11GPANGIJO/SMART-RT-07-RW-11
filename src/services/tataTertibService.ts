/**
 * SMART RT 07 RW 11 GPA NGIJO
 * Service for MODUL TATA TERTIB WARGA v1.0
 */

import { UserRole } from '../types/rt';
import {
  TataTertibArticle,
  TataTertibCategory,
  TataTertibHistory,
  TataTertibAck,
  TataTertibFeedback,
  TataTertibSummaryStats
} from '../types/tataTertib';
import { AuditLogService, generateCorrelationId } from './auditLogService';
import { syncDataWithGAS } from './apiService';

const STORAGE_KEY_ARTICLES = 'SMART_RT_TATA_TERTIB_ARTICLES_V1';
const STORAGE_KEY_HISTORY = 'SMART_RT_TATA_TERTIB_HISTORY_V1';
const STORAGE_KEY_ACK = 'SMART_RT_TATA_TERTIB_ACK_V1';
const STORAGE_KEY_FEEDBACK = 'SMART_RT_TATA_TERTIB_FEEDBACK_V1';

// Initial Official Data for RT 07 RW 11 Perum GPA Ngijo
export const INITIAL_TATA_TERTIB_ARTICLES: TataTertibArticle[] = [
  {
    id: 'TT-001',
    number: 'TT-001',
    category: 'UMUM',
    title: 'BAB I - Ketentuan Umum & Keanggotaan Warga',
    summary: 'Landasan hukum, asas kekeluargaan, dan pendaftaran warga RT 07 RW 11 Perum GPA Ngijo.',
    content: `Pasal 1: Pengertian & Asas
1. Rukun Tetangga 07 RW 11 Perumahan Graha Permata Anugrah (GPA) Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang berdiri berlandaskan asas gotong royong, transparansi, dan kekeluargaan.
2. Setiap warga yang berdomisili di wilayah RT 07 RW 11 (baik pemilik, penyewa/kontrak, maupun kos) merupakan bagian tak terpisahkan dari keluarga besar RT 07.

Pasal 2: Kewajiban Pelaporan Domisili
1. Warga baru yang menempati rumah di wilayah RT 07 wajib melaporkan diri kepada Pengurus RT (Sekretaris/Ketua RT) dalam waktu maksimal 2x24 jam dengan membawa FC KTP dan KK.
2. Warga yang berpindah tempat tinggal keluar dari wilayah RT 07 wajib memberitahukan kepada Pengurus RT secara tertulis atau melalui Portal SMART RT.`,
    keywords: ['umum', 'asas', 'domisili', 'pendaftaran', 'warga baru', 'ngijo', 'pindah'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-002',
    number: 'TT-002',
    category: 'KEWAJIBAN_WARGA',
    title: 'BAB II - Hak dan Kewajiban Warga',
    summary: 'Rincian hak pelayanan administrasi, penyampaian aspirasi, serta kewajiban kebersamaan warga.',
    content: `Pasal 3: Hak Warga RT 07
1. Berhak mendapatkan pelayanan administrasi surat pengantar RT secara digital maupun manual.
2. Berhak menggunakan fasilitas umum RT 07 sesuai dengan aturan yang berlaku.
3. Berhak menyampaikan saran, pendapat, aspirasi, atau pengaduan secara terhormat melalui rapat warga atau portal SMART RT.
4. Berhak mendapatkan transparansi informasi laporan keuangan dan kegiatan RT.

Pasal 4: Kewajiban Warga RT 07
1. Menjaga kerukunan, ketertiban, dan kebersihan lingkungan RT 07.
2. Membayar iuran rutin bulanan kas RT dan iuran kebersihan/keamanan tepat waktu.
3. Berpartisipasi aktif dalam musyawarah warga, kerja bakti lingkungan, dan peringatan hari besar.
4. Mematuhi norma kesusilaan dan hukum yang berlaku di NKRI.`,
    keywords: ['hak', 'kewajiban', 'pelayanan', 'aspirasi', 'iuran', 'gotong royong'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-003',
    number: 'TT-003',
    category: 'KEAMANAN',
    title: 'BAB III - Keamanan & Ketertiban Lingkungan',
    summary: 'Sistem keamanan portal, jam tutup portal perumahan, pos ronda, dan prosedur tanggap darurat.',
    content: `Pasal 5: Portal Keamanan & Jam Operasional
1. Portal utama Perumahan GPA RT 07 ditutup setiap pukul 23.00 WIB dan dibuka kembali pukul 05.00 WIB demi keamanan bersama.
2. Tamu atau warga yang keluar/masuk setelah pukul 23.00 WIB wajib melapor atau melambaikan tangan kepada petugas pos poskamling.

Pasal 6: Tanggap Darurat & Kontak Pengurus
1. Apabila terjadi tindak kejahatan, kecelakaan, kebocoran gas, atau musibah kebakaran, warga dapat mengklik tombol "🚨 LAPORKAN KEJADIAN" pada Portal SMART RT atau menghubungi Tim Keamanan RT.
2. Petugas ronda atau Pengurus Sie Keamanan berhak memeriksa identitas orang tak dikenal yang berada di area pemukiman pada jam malam.`,
    keywords: ['keamanan', 'portal', 'pos ronda', 'jam malam', 'ronda', 'darurat', 'tutup portal'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-004',
    number: 'TT-004',
    category: 'KEBERSIHAN',
    title: 'BAB IV - Kebersihan Lingkungan & Pengelolaan Sampah',
    summary: 'Jadwal pengambilan sampah rumah tangga, tempat sampah terpilah, dan larangan membuang sampah di selokan.',
    content: `Pasal 7: Sampah Rumah Tangga
1. Setiap rumah wajib menyediakan tempat sampah bertutup di depan rumah masing-masing.
2. Sampah basah/organik hendaknya dibungkus kantong plastik rapi sebelum ditaruh di tong sampah untuk memudahkan petugas kebersihan.
3. Pengambilan sampah oleh petugas dilakukan setiap hari Selasa, Kamis, dan Sabtu pagi.

Pasal 8: Kebersihan Selokan & Kerja Bakti
1. Dilarang keras membuang sampah, puing bangunan, atau limbah berbahaya ke dalam selokan/drainase jalan.
2. Kerja bakti masal pembersihan lingkungan dilaksanakan setiap bulan sekali pada hari Minggu pagi minggu ke-2.`,
    keywords: ['kebersihan', 'sampah', 'selokan', 'drainase', 'kerja bakti', 'tong sampah'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-005',
    number: 'TT-005',
    category: 'PARKIR',
    title: 'BAB V - Parkir & Penggunaan Jalan Lingkungan',
    summary: 'Ketentuan parkir kendaraan roda 4 dan 2 di garasi/jalan serta larangan menutup akses pemadam/ambulan.',
    content: `Pasal 9: Parkir Mobil & Garasi
1. Setiap pemilik kendaraan roda empat (mobil) diimbau mengutamakan memarkir kendaraan di dalam garasi/carport rumah sendiri.
2. Apabila memarkir mobil di pinggir jalan lingkungan, wajib tidak memakan bahu jalan hingga mengganggu akses lalu lintas kendaraan warga lain, pemadam kebakaran, atau ambulans.
3. Dilarang memarkir kendaraan tepat di depan pintu garasi/pagar rumah tetangga tanpa izin lisan/tertulis.

Pasal 10: Kecepatan Kendaraan
1. Kecepatan maksimal kendaraan di jalan komplek RT 07 adalah 15 km/jam untuk mengutamakan keselamatan anak-anak dan pejalan kaki.`,
    keywords: ['parkir', 'mobil', 'garasi', 'carport', 'jalan', 'kecepatan', 'ambulans'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-006',
    number: 'TT-006',
    category: 'TAMU',
    title: 'BAB VI - Ketentuan Tamu & Pendatang Menginap',
    summary: 'Aturan wajib lapor 1x24 jam bagi tamu menginap, identitas pendatang, dan ketertiban.',
    content: `Pasal 11: Wajib Lapor 1x24 Jam
1. Tamu atau kerabat yang menginap lebih dari 1x24 jam wajib dilaporkan oleh tuan rumah kepada Pengurus RT atau Seksi Keamanan melalui Portal SMART RT / WhatsApp.
2. Penjual keliling, petugas servis, atau pekerja konstruksi luar yang berada di komplek wajib melapor ke pos keamanan perumahan.`,
    keywords: ['tamu', 'menginap', '1x24 jam', 'pendatang', 'pos keamanan', 'lapor'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-007',
    number: 'TT-007',
    category: 'KEGIATAN',
    title: 'BAB VII - Ketentuan Acara Warga & Keramaian',
    summary: 'Batas waktu suara/musik, penggunaan jalan umum untuk acara pribadi, pemberitahuan tetangga.',
    content: `Pasal 12: Izin Keramaian & Batas Waktu Musik
1. Warga yang hendak mengadakan hajatan, pernikahan, atau keramaian pribadi wajib memberitahukan kepada Ketua RT sekurang-kurangnya 3 hari sebelum acara.
2. Penggunaan sound system/pengeras suara untuk acara pribadi dibatasi maksimal pukul 22.00 WIB agar tidak mengganggu istirahat tetangga sekitar.
3. Penutupan atau pemblokiran sementara jalan lingkungan untuk hajatan wajib menyediakan jalur alternatif bagi warga.`,
    keywords: ['kegiatan', 'hajatan', 'musik', 'sound system', 'keramaian', 'ijin jalan', '22.00'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-008',
    number: 'TT-008',
    category: 'HEWAN',
    title: 'BAB VIII - Ketentuan Hewan Peliharaan',
    summary: 'Tanggung jawab pemilik hewan peliharaan (kucing, anjing, burung), kebersihan kotoran, dan keamanan.',
    content: `Pasal 13: Tanggung Jawab Pemilik Hewan
1. Pemilik hewan peliharaan (kucing, anjing, dsb) wajib menjaga agar hewannya tidak berkeliaran liar yang merusak fasilitas/tanaman tetangga.
2. Apabila hewan peliharaan membuang kotoran di jalan umum atau halaman tetangga, pemilik wajib langsung membersihkannya.
3. Anjing peliharaan wajib diikat atau dikandangkan dan diikat saat diajak berjalan-jalan di jalan lingkungan.`,
    keywords: ['hewan', 'peliharaan', 'anjing', 'kucing', 'kotoran', 'tanggung jawab'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-009',
    number: 'TT-009',
    category: 'RENOVASI',
    title: 'BAB IX - Renovasi & Pembangunan Rumah',
    summary: 'Pemberitahuan renovasi, jam kerja tukang, penyimpanan material pasir/batu, dan kebersihan sisa material.',
    content: `Pasal 14: Pemberitahuan & Jam Kerja Tukang
1. Warga yang hendak melakukan renovasi bangunan fisik wajib melapor kepada Pengurus RT dan memberitahu tetangga kanan-kiri.
2. Pekerjaan pembongkaran atau konstruksi berbising hanya diperbolehkan pada hari Senin-Sabtu pukul 08.00 - 17.00 WIB. Hari Minggu/Libur Nasional dilarang melakukan pekerjaan bising.
3. Material bangunan (pasir, batu, semen) tidak boleh menutupi saluran air selokan dan wajib diselesaikan pembersihannya setelah renovasi selesai.`,
    keywords: ['renovasi', 'pembangunan', 'tukang', 'material', 'pasir', 'bising', 'jam kerja'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-010',
    number: 'TT-010',
    category: 'KEUANGAN',
    title: 'BAB X - Iuran & Kewajiban Keuangan Warga',
    summary: 'Rincian iuran rutin bulanan Kas RT, Dana Kematian, dan iuran insidental Agustusan.',
    content: `Pasal 15: Nominal & Jadwal Pembayaran Iuran
1. Iuran Rutin Bulanan Kas RT & Kebersihan/Keamanan ditetapkan sebesar Rp 50.000 / KK / bulan.
2. Iuran Dana Kematian & Sosial ditetapkan sebesar Rp 20.000 / KK / bulan.
3. Pembayaran iuran dapat disetorkan melalui Bendahara RT, Transfer Bank/QRIS RT, atau Portal SMART RT paling lambat tanggal 10 setiap bulannya.
4. Informasi pembayaran warga dapat dipantau secara mandiri pada menu Keuangan RT.`,
    keywords: ['iuran', 'keuangan', 'kas', 'dana kematian', 'agustusan', 'pembayaran', '50000'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-011',
    number: 'TT-011',
    category: 'FASILITAS',
    title: 'BAB XI - Penggunaan Fasilitas Umum & Lapangan',
    summary: 'Penggunaan pos ronda, balai balai umum, taman, dan kewajiban merawat barang inventaris RT.',
    content: `Pasal 16: Pemeliharaan Inventaris RT
1. Fasilitas umum seperti Pos Kamling, Balai Pertemuan, Tenda RT, Sound System, dan Meja Kursi Inventaris RT adalah milik bersama yang wajib dijaga kebersihannya.
2. Warga yang meminjam inventaris RT wajib mengembalikan dalam keadaan bersih dan utuh. Apabila terjadi kerusakan/kehilangan karena kelalaian, peminjam wajib mengganti.
3. Kerusakan pada fasilitas umum jalan/penerangan dapat dilaporkan melalui menu Pengaduan Warga.`,
    keywords: ['fasilitas', 'pos kamling', 'inventaris', 'tenda', 'balai', 'kerusakan'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-012',
    number: 'TT-012',
    category: 'PELANGGARAN',
    title: 'BAB XII - Pelanggaran, Pembinaan & Tahapan Sanksi',
    summary: 'Prosedur bertahap: Teguran Lisan -> Musyawarah Pengurus -> Pembinaan Kekeluargaan.',
    content: `Pasal 17: Maksud & Sistem Pembinaan
1. Tata tertib ini disusun bukan untuk menghukum, melainkan untuk menjaga kenyamanan, keamanan, dan kerukunan bersama seluruh keluarga RT 07.
2. Setiap dugaan pelanggaran akan diselesaikan melalui pendekatan kekeluargaan dan musyawarah mufakat.

Pasal 18: Tahapan Pembinaan
1. Tahap 1: Teguran Lisan / Pengingatan secara sopan oleh Pengurus.
2. Tahap 2: Musyawarah Klarifikasi bersama Pengurus RT & Ketua RT.
3. Tahap 3: Pembinaan Tertulis & Kesepakatan Bersama untuk tidak mengulangi pelanggaran.`,
    keywords: ['pelanggaran', 'sanksi', 'pembinaan', 'teguran', 'musyawarah', 'kekeluargaan'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'TT-013',
    number: 'TT-013',
    category: 'SOSIAL',
    title: 'BAB XIII - Ketentuan Penutup & Pengesahan Versi',
    summary: 'Masa berlaku versi 1.1, mekanisme revisi melalui Musyawarah RT, dan keabsahan dokumen digital.',
    content: `Pasal 19: Pengesahan & Pengubahan Rules
1. Tata Tertib Warga RT 07 RW 11 Versi 1.1 ini disahkan berdasarkan hasil keputusan Musyawarah Pengurus & Warga RT 07 pada bulan Agustus 2026.
2. Perubahan atau revisi tata tertib hanya dapat dilakukan melalui Musyawarah Warga resmi dan diterbitkan kembali dengan nomor versi baru (e.g. Versi 1.2 / 2.0) oleh Ketua RT 07.
3. Dokumen digital ini memiliki keabsahan hukum lingkungan yang sah dan dapat diverifikasi via QR Verification Code pada Portal SMART RT.`,
    keywords: ['penutup', 'pengesahan', 'musyawarah', 'revisi', 'versi 1.1', 'keabsahan'],
    status: 'ACTIVE',
    version: '1.1',
    effectiveDate: '2026-08-17',
    createdBy: 'admin_rt07',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedBy: 'ketua_rt07',
    updatedAt: '2026-08-10T10:00:00.000Z',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z'
  }
];

export const INITIAL_TATA_TERTIB_HISTORY: TataTertibHistory[] = [
  {
    id: 'HIST-001',
    tataTertibId: 'TT-GLOBAL',
    version: '1.0',
    changeSummary: 'Penerbitan awal Tata Tertib Warga RT 07 RW 11 Perum GPA Ngijo tahun 2026.',
    previousVersion: '0.9-DRAFT',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-01-01T08:00:00.000Z',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'HIST-002',
    tataTertibId: 'TT-GLOBAL',
    version: '1.1',
    changeSummary: 'Revisi ketentuan parkir jalan komplek, jam operasional penutupan portal (23.00 WIB), dan penyesuaian nominal iuran kas.',
    previousVersion: '1.0',
    approvedBy: 'Bapak Sutrisno, M.P. (Ketua RT 07)',
    approvedAt: '2026-08-10T10:00:00.000Z',
    effectiveDate: '2026-08-17'
  }
];

export class TataTertibService {
  // Articles
  static getArticles(): TataTertibArticle[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(INITIAL_TATA_TERTIB_ARTICLES));
        return INITIAL_TATA_TERTIB_ARTICLES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_TATA_TERTIB_ARTICLES;
    }
  }

  static saveArticles(articles: TataTertibArticle[]): void {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    syncDataWithGAS('TATA_TERTIB', articles).catch(() => {});
  }

  static getActiveArticles(): TataTertibArticle[] {
    return this.getArticles().filter(a => a.status === 'ACTIVE');
  }

  static getArticleById(id: string): TataTertibArticle | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  static getArticlesByCategory(cat: TataTertibCategory): TataTertibArticle[] {
    return this.getArticles().filter(a => a.category === cat && a.status === 'ACTIVE');
  }

  // Version History
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

  // Acknowledgement
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

  static acknowledge(userId: string, userName: string, version: string = '1.1'): { success: boolean; message: string } {
    const acks = this.getAcks();
    const existing = acks.find(a => a.userId === userId && a.version === version);

    if (existing) {
      return { success: true, message: 'Anda sudah membaca dan mengonfirmasi tata tertib versi ini sebelumnya.' };
    }

    const newAck: TataTertibAck = {
      id: `ACK-${Date.now()}`,
      tataTertibId: 'TT-GLOBAL',
      version,
      userId,
      userName,
      acknowledgedAt: new Date().toISOString()
    };

    acks.push(newAck);
    localStorage.setItem(STORAGE_KEY_ACK, JSON.stringify(acks));

    // Audit Log
    AuditLogService.logEvent({
      action: 'TATA_TERTIB_ACKNOWLEDGED',
      role: 'WARGA',
      userId: userId,
      userName: userName,
      module: 'TATA_TERTIB',
      targetType: 'TataTertibAck',
      targetId: `ACK-${version}`,
      details: `Warga ${userName} telah membaca & mengonfirmasi Tata Tertib v${version}`,
      severity: 'INFO'
    });

    return { success: true, message: `Terima kasih! Konfirmasi membaca Tata Tertib v${version} berhasil disimpan.` };
  }

  // Feedback
  static getFeedbackList(): TataTertibFeedback[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static submitFeedback(tataTertibId: string, isHelpful: boolean, comment?: string, userId: string = 'warga_user'): { success: boolean; message: string } {
    const feedbackList = this.getFeedbackList();
    const newFb: TataTertibFeedback = {
      id: `FB-${Date.now()}`,
      tataTertibId,
      isHelpful,
      comment,
      userId,
      createdAt: new Date().toISOString()
    };

    feedbackList.push(newFb);
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(feedbackList));

    return { success: true, message: 'Terima kasih atas masukan Bapak/Ibu untuk peningkatan tata tertib.' };
  }

  // Admin Workflows
  static createDraft(
    data: {
      category: TataTertibCategory;
      title: string;
      summary: string;
      content: string;
      keywords: string[];
      effectiveDate: string;
    },
    creatorRole: UserRole,
    creatorName: string
  ): { success: boolean; message: string; article?: TataTertibArticle } {
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(creatorRole)) {
      return { success: false, message: 'Akses Ditolak: Hanya Pengurus, Ketua RT, atau Admin yang dapat membuat draft tata tertib.' };
    }

    const articles = this.getArticles();
    const nextNum = articles.length + 1;
    const numberStr = `TT-${String(nextNum).padStart(3, '0')}`;

    const newArticle: TataTertibArticle = {
      id: numberStr,
      number: numberStr,
      category: data.category,
      title: data.title,
      summary: data.summary,
      content: data.content,
      keywords: data.keywords,
      status: 'DRAFT',
      version: '1.2-DRAFT',
      effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
      createdBy: creatorName,
      createdAt: new Date().toISOString(),
      updatedBy: creatorName,
      updatedAt: new Date().toISOString()
    };

    articles.push(newArticle);
    this.saveArticles(articles);

    AuditLogService.logEvent({
      action: 'TATA_TERTIB_CREATED',
      role: creatorRole,
      userName: creatorName,
      module: 'TATA_TERTIB',
      targetType: 'TataTertibArticle',
      targetId: numberStr,
      details: `Membuat draft Tata Tertib baru #${numberStr}: ${data.title}`,
      severity: 'INFO'
    });

    return { success: true, message: `Draft Tata Tertib #${numberStr} berhasil dibuat dalam status DRAFT.`, article: newArticle };
  }

  static submitForApproval(articleId: string, userRole: UserRole, userName: string): { success: boolean; message: string } {
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Wewenang terbatas pada Pengurus RT.' };
    }

    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId);

    if (!article) return { success: false, message: 'Artikel Tata Tertib tidak ditemukan.' };
    if (article.status !== 'DRAFT') return { success: false, message: `Status transaksi tidak valid (${article.status}). Hanya DRAFT yang dapat diajukan.` };

    article.status = 'PENDING_APPROVAL';
    article.updatedBy = userName;
    article.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    AuditLogService.logEvent({
      action: 'TATA_TERTIB_SUBMITTED',
      role: userRole,
      userName: userName,
      module: 'TATA_TERTIB',
      targetType: 'TataTertibArticle',
      targetId: articleId,
      details: `Mengajukan review persetujuan Tata Tertib #${articleId} (${article.title})`,
      severity: 'INFO'
    });

    return { success: true, message: `Tata Tertib #${articleId} telah diajukan ke Ketua RT untuk disetujui (PENDING_APPROVAL).` };
  }

  static approveAndPublish(
    articleId: string,
    newVersion: string,
    effectiveDate: string,
    changeSummary: string,
    approverRole: UserRole,
    approverName: string
  ): { success: boolean; message: string } {
    if (!['KETUA_RT', 'ADMIN'].includes(approverRole)) {
      return { success: false, message: 'Akses Ditolak: Hanya Ketua RT atau Admin yang berwenang mengesahkan & mempublikasikan Tata Tertib baru.' };
    }

    const articles = this.getArticles();
    const target = articles.find(a => a.id === articleId);

    if (!target) return { success: false, message: 'Artikel Tata Tertib tidak ditemukan.' };

    // Set old active articles in same category to REVISED/ARCHIVED if needed
    articles.forEach(a => {
      if (a.category === target.category && a.status === 'ACTIVE' && a.id !== target.id) {
        a.status = 'REVISED';
      }
    });

    target.status = 'ACTIVE';
    target.version = newVersion || '1.2';
    target.effectiveDate = effectiveDate || new Date().toISOString().split('T')[0];
    target.approvedBy = `${approverName} (${approverRole})`;
    target.approvedAt = new Date().toISOString();
    target.updatedBy = approverName;
    target.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    // Save History Record
    const history = this.getHistoryList();
    history.push({
      id: `HIST-${Date.now()}`,
      tataTertibId: articleId,
      version: target.version,
      changeSummary: changeSummary || `Pengesahan revisi ${target.title} versi ${target.version}`,
      previousVersion: '1.1',
      approvedBy: target.approvedBy,
      approvedAt: target.approvedAt,
      effectiveDate: target.effectiveDate
    });
    this.saveHistory(history);

    AuditLogService.logEvent({
      action: 'TATA_TERTIB_PUBLISHED',
      role: approverRole,
      userName: approverName,
      module: 'TATA_TERTIB',
      targetType: 'TataTertibArticle',
      targetId: articleId,
      details: `Mengesahkan & mempublikasikan Tata Tertib #${articleId} Versi ${target.version} (Berlaku: ${target.effectiveDate})`,
      severity: 'WARNING'
    });

    return { success: true, message: `Selamat! Tata Tertib #${articleId} Versi ${target.version} resmi DISAHKAN dan BERLAKU untuk seluruh warga RT 07.` };
  }

  static archiveArticle(articleId: string, userRole: UserRole, userName: string): { success: boolean; message: string } {
    if (!['KETUA_RT', 'ADMIN'].includes(userRole)) {
      return { success: false, message: 'Akses Ditolak: Wewenang Ketua RT atau Admin required.' };
    }

    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId);

    if (!article) return { success: false, message: 'Artikel tidak ditemukan.' };

    article.status = 'ARCHIVED';
    article.updatedBy = userName;
    article.updatedAt = new Date().toISOString();

    this.saveArticles(articles);

    AuditLogService.logEvent({
      action: 'TATA_TERTIB_ARCHIVED',
      role: userRole,
      userName: userName,
      module: 'TATA_TERTIB',
      targetType: 'TataTertibArticle',
      targetId: articleId,
      details: `Mengarsipkan aturan Tata Tertib #${articleId}`,
      severity: 'INFO'
    });

    return { success: true, message: `Aturan Tata Tertib #${articleId} berhasil diarsipkan.` };
  }

  // Dashboard Stats
  static getSummaryStats(): TataTertibSummaryStats {
    const articles = this.getArticles();
    const acks = this.getAcks();

    const activeArticles = articles.filter(a => a.status === 'ACTIVE');
    const activeVersion = activeArticles.length > 0 ? activeArticles[0].version : '1.1';
    const effectiveDate = activeArticles.length > 0 ? activeArticles[0].effectiveDate : '2026-08-17';

    const totalWargaKK = 70; // 70 KK registered in RT 07
    const ackCount = acks.filter(a => a.version === activeVersion).length;
    const ackPercentage = Math.round((ackCount / totalWargaKK) * 100);

    return {
      activeVersion,
      effectiveDate,
      activeCount: activeArticles.length,
      draftCount: articles.filter(a => a.status === 'DRAFT').length,
      pendingCount: articles.filter(a => a.status === 'PENDING_APPROVAL').length,
      archivedCount: articles.filter(a => a.status === 'ARCHIVED' || a.status === 'REVISED').length,
      totalWarga: totalWargaKK,
      ackCount,
      ackPercentage
    };
  }
}
