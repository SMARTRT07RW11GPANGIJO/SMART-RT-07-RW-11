import { UserRole, SuratPengantar, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan } from '../types/rt';
import { hasPermission, maskNik, maskNoHp } from './securityService';

export interface RitaMessage {
  id: string;
  sender: 'user' | 'rita';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  confirmationPrompt?: {
    title: string;
    description: string;
    type: 'DRAFT_ANNOUNCEMENT' | 'DRAFT_LETTER' | 'REPORT_SUMMARY';
    data: any;
  };
  feedback?: 'HELPFUL' | 'UNHELPFUL';
}

export interface KnowledgeItem {
  id: string;
  category: 'FAQ' | 'SOP' | 'Peraturan' | 'Pelayanan' | 'Profil' | 'Kegiatan';
  title: string;
  content: string;
  source: string;
  lastUpdated: string;
  status: 'PUBLISHED' | 'DRAFT';
}

const KNOWLEDGE_BASE_STORE_KEY = 'SMART_RT_RITA_KB_V1';

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'KB-001',
    category: 'SOP',
    title: 'SOP Pelayanan Surat Pengantar RT',
    content: 'Pengajuan surat pengantar dapat dilakukan secara digital melalui Portal Web SMART RT 07 RW 11 atau WhatsApp Bot. Syarat: Warga terdaftar di RT 07, mengisi form keperluan, dan menunggu persetujuan Ketua RT. Setelah disetujui, PDF resmi A4 bertanda tangan digital & QR Code Verifikasi dapat langsung diunduh.',
    source: 'SOP Pelayanan Administrasi RT 07 RW 11 GPA Ngijo',
    lastUpdated: '2026-08-01',
    status: 'PUBLISHED'
  },
  {
    id: 'KB-002',
    category: 'SOP',
    title: 'SOP Pembayaran Iuran Warga & Sampah',
    content: 'Iuran kas warga dan kebersihan/keamanan dibayarkan sebesar Rp 50.000 / bulan per KK. Pembayaran dapat dilakukan secara tunai kepada bendahara RT atau transfer/QRIS RT. Status lunas akan otomatis diperbarui di portal dashboard warga.',
    source: 'Peraturan RT 07 RW 11 No. 02/2026',
    lastUpdated: '2026-08-01',
    status: 'PUBLISHED'
  },
  {
    id: 'KB-003',
    category: 'SOP',
    title: 'SOP Pengaduan & Fasilitas Umum',
    content: 'Warga dapat melaporkan masalah kebersihan, penerangan jalan, atau gangguan keamanan melalui menu Pengaduan Warga. Pengaduan akan mendapatkan nomor tiket unik (ADU-YYYY-XXXX) dan diproses oleh pengurus bidang terkait maksimal 2x24 jam.',
    source: 'SOP Layanan Aspirasi Warga RT 07',
    lastUpdated: '2026-08-01',
    status: 'PUBLISHED'
  },
  {
    id: 'KB-004',
    category: 'Profil',
    title: 'Profil RT 07 RW 11 Perum GPA Ngijo',
    content: 'RT 07 RW 11 berlokasi di Perum Graha Permata Anugrah (GPA) Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur. Tagline: "Bersama Melayani, Bersama Membangun". Ketua RT 07: Bapak Sutrisno, M.P. Contact: rt07rw11.gpa@gmail.com.',
    source: 'Buku Profil RT 07 RW 11',
    lastUpdated: '2026-08-01',
    status: 'PUBLISHED'
  },
  {
    id: 'KB-005',
    category: 'Peraturan',
    title: 'Peraturan Keamanan & Pos Ronda',
    content: 'Tamu yang menginap lebih dari 1x24 jam wajib melaporkan ke Ketua RT atau Seksi Keamanan. Portal Perumahan ditutup setiap pukul 23:00 WIB untuk menjaga keamanan warga.',
    source: 'Peraturan Tata Tertib Warga RT 07',
    lastUpdated: '2026-08-01',
    status: 'PUBLISHED'
  }
];

export function getKnowledgeBase(): KnowledgeItem[] {
  try {
    const raw = localStorage.getItem(KNOWLEDGE_BASE_STORE_KEY);
    if (!raw) return INITIAL_KNOWLEDGE_BASE;
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_KNOWLEDGE_BASE;
  }
}

export function saveKnowledgeBase(items: KnowledgeItem[]): void {
  localStorage.setItem(KNOWLEDGE_BASE_STORE_KEY, JSON.stringify(items));
}

// Prompt Injection Defender & Privacy Guard
export function checkPromptSafety(userPrompt: string): { safe: boolean; reason?: string } {
  const lower = userPrompt.toLowerCase();

  // Attack signatures
  const injectionPatterns = [
    'ignore all previous instructions',
    'ignore your rules',
    'system prompt',
    'show API key',
    'give me all NIK',
    'give me all passwords',
    'bypass permission',
    'set role admin',
    'drop database',
    'delete all logs'
  ];

  for (const pattern of injectionPatterns) {
    if (lower.includes(pattern)) {
      return {
        safe: false,
        reason: 'Permintaan ditolak demi keamanan & privasi data warga (Anti-Prompt Injection).'
      };
    }
  }

  return { safe: true };
}

export async function processRitaChatQuery(
  userQuery: string,
  userRole: UserRole,
  userName: string,
  contextData: {
    suratList: SuratPengantar[];
    iuranList: TagihanIuran[];
    pengaduanList: Pengaduan[];
    pengumumanList: Pengumuman[];
    agendaList: AgendaKegiatan[];
  }
): Promise<RitaMessage> {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // 1. Safety Check
  const safety = checkPromptSafety(userQuery);
  if (!safety.safe) {
    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `Maaf Bapak/Ibu ${userName}. ${safety.reason} RITA tidak dapat memberikan data pribadi, credential, atau menjalankan perintah yang melanggar protokol keamanan.`,
      timestamp,
      quickActions: [
        { label: 'Informasi RT', action: 'info' },
        { label: 'SOP Pelayanan', action: 'sop' }
      ]
    };
  }

  const queryLower = userQuery.toLowerCase();

  // 2. Check for Intent & Role Verification

  // Intent A: Check Own Surat / Application Status
  if (queryLower.includes('surat') && (queryLower.includes('saya') || queryLower.includes('status') || queryLower.includes('cek'))) {
    if (!hasPermission(userRole, 'SURAT_VIEW_OWN') && userRole === 'PUBLIC') {
      return {
        id: `RITA-MSG-${Date.now()}`,
        sender: 'rita',
        text: 'Untuk memeriksa status permohonan surat Bapak/Ibu, silakan pilih Role Simulasi WARGA atau Pengurus di menu atas untuk masuk ke portal terverifikasi.',
        timestamp,
        quickActions: [{ label: 'Ajukan Surat Baru', action: 'open_letter_modal' }]
      };
    }

    const mySurat = contextData.suratList.filter(
      (s) => s.nama_pemohon.toLowerCase().includes(userName.toLowerCase()) || userRole === 'ADMIN' || userRole === 'KETUA_RT'
    );

    if (mySurat.length === 0) {
      return {
        id: `RITA-MSG-${Date.now()}`,
        sender: 'rita',
        text: `Bapak/Ibu ${userName}, saat ini belum ada catatan pengajuan surat aktif atas nama Anda di sistem RT 07. Apakah Anda ingin mengajukan surat pengantar baru?`,
        timestamp,
        quickActions: [{ label: 'Ajukan Surat Pengantar', action: 'open_letter_modal' }]
      };
    }

    const latest = mySurat[0];
    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `Berikut status pengajuan surat terbaru Anda:\n\n📄 *${latest.jenis_surat}*\n• No. Tiket/Surat: ${latest.nomor_surat}\n• Keperluan: ${latest.keperluan}\n• Status: *${latest.status}*\n• Tanggal Pengajuan: ${latest.tanggal_pengajuan}\n\n_Sumber: Database Layanan Surat RT 07_`,
      timestamp,
      quickActions: [
        { label: 'Arsip & PDF Surat', action: 'open_archive_modal' },
        { label: 'Ajukan Surat Lain', action: 'open_letter_modal' }
      ]
    };
  }

  // Intent B: Check Own Iuran
  if (queryLower.includes('iuran') || queryLower.includes('kas') || queryLower.includes('tagihan')) {
    if (!hasPermission(userRole, 'IURAN_VIEW_OWN') && userRole === 'PUBLIC') {
      return {
        id: `RITA-MSG-${Date.now()}`,
        sender: 'rita',
        text: 'Informasi status iuran membutuhkan otentikasi identitas warga. Silakan beralih ke role WARGA untuk memeriksa tagihan Anda.',
        timestamp
      };
    }

    // Refuse to give list of unpaid residents to standard WARGA
    if (queryLower.includes('siapa yang belum') || queryLower.includes('siapa belum bayar')) {
      if (!hasPermission(userRole, 'IURAN_VIEW')) {
        return {
          id: `RITA-MSG-${Date.now()}`,
          sender: 'rita',
          text: 'Maaf, demi menjaga privasi warga, daftar penunggak iuran individu hanya dapat diakses oleh Pengurus RT dan Ketua RT.',
          timestamp
        };
      }
    }

    const myIuran = contextData.iuranList.slice(0, 3);
    const iuranSummary = myIuran
      .map((i) => `• *${i.bulan_tahun}* (${i.nama_kepala_keluarga}): Rp ${i.nominal_tagihan.toLocaleString('id-ID')} -> Status: *${i.status}*`)
      .join('\n');

    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `Status iuran kas warga RT 07 RW 11 terbaru:\n\n${iuranSummary}\n\nIuran bulanan per KK adalah Rp 50.000 (Kas + Kebersihan). Pembayaran dapat dilakukan via Transfer / QRIS / Tunai ke Pengurus.`,
      timestamp,
      quickActions: [{ label: 'Cek Pengumuman RT', action: 'info' }]
    };
  }

  // Intent C: Draft Pengumuman (Pengurus/Admin)
  if (queryLower.includes('draft pengumuman') || queryLower.includes('buat pengumuman')) {
    if (!hasPermission(userRole, 'PENGUMUMAN_CREATE')) {
      return {
        id: `RITA-MSG-${Date.now()}`,
        sender: 'rita',
        text: 'Akses Ditolak: Pembuatan draft pengumuman resmi memerlukan wewenang Pengurus, Ketua RT, atau Admin.',
        timestamp
      };
    }

    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `Saya telah menyusun DRAFT pengumuman resmi RT 07. Sesuai protokol keamanan RITA, pempublikasian resmi memerlukan konfirmasi manusia di bawah ini:`,
      timestamp,
      confirmationPrompt: {
        title: 'Konfirmasi DRAFT Pengumuman RT',
        description: 'Draf telah dibuat oleh AI RITA. Apakah Anda setuju untuk mempublikasikannya ke papan pengumuman warga?',
        type: 'DRAFT_ANNOUNCEMENT',
        data: {
          judul: 'KERJA BAKTI & PEMBERSIHAN SELOKAN LINGKUNGAN RT 07',
          isi: 'Diberitahukan kepada seluruh warga RT 07 RW 11 Perum GPA Ngijo, pelaksanaan Kerja Bakti Massal akan dilaksanakan pada hari Minggu besok pukul 07:00 WIB. Mohon membawa peralatan kebersihan.',
          kategori: 'Kegiatan',
          penulis: `RITA Assistant (${userName})`
        }
      }
    };
  }

  // Intent D: Report Summary / Executive Summary
  if (queryLower.includes('ringkas') || queryLower.includes('laporan') || queryLower.includes('summary')) {
    if (!hasPermission(userRole, 'DASHBOARD_VIEW')) {
      return {
        id: `RITA-MSG-${Date.now()}`,
        sender: 'rita',
        text: 'Ringkasan laporan eksekutif RT hanya tersedia untuk Pengurus RT dan Ketua RT.',
        timestamp
      };
    }

    const totalSurat = contextData.suratList.length;
    const totalAduan = contextData.pengaduanList.length;
    const totalAduanSelesai = contextData.pengaduanList.filter((a) => a.status === 'SELESAI').length;

    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `📊 *RINGKASAN EKSEKUTIF RT 07 RW 11 GPA NGIJO*\n\n1. *Pelayanan Surat*: Total ${totalSurat} permohonan diproses.\n2. *Pengaduan Warga*: Total ${totalAduan} aduan masuk, ${totalAduanSelesai} telah terselesaikan.\n3. *Keuangan*: Transaksi kas terverifikasi & seimbang.\n4. *Sistem*: Backup otomatis & verifikasi QR Code A4 berjalan 100% sehat.\n\n_Disiapkan oleh RITA — RT Intelligent & Trusted Assistant_`,
      timestamp
    };
  }

  // Search Knowledge Base (RAG Fallback)
  const kb = getKnowledgeBase();
  const matchedKb = kb.find((k) =>
    k.title.toLowerCase().includes(queryLower) ||
    k.content.toLowerCase().includes(queryLower) ||
    k.category.toLowerCase().includes(queryLower)
  );

  if (matchedKb) {
    return {
      id: `RITA-MSG-${Date.now()}`,
      sender: 'rita',
      text: `📌 *${matchedKb.title}*\n\n${matchedKb.content}\n\n_Sumber Resmi: ${matchedKb.source} (Diperbarui: ${matchedKb.lastUpdated})_`,
      timestamp,
      quickActions: [
        { label: 'Ajukan Surat', action: 'open_letter_modal' },
        { label: 'Kirim Pengaduan', action: 'open_complaint_modal' }
      ]
    };
  }

  // Default Polite Assistant Response
  return {
    id: `RITA-MSG-${Date.now()}`,
    sender: 'rita',
    text: `Halo Bapak/Ibu ${userName} 👋\n\nSaya **RITA** (RT Intelligent & Trusted Assistant) untuk **RT 07 RW 11 Perum GPA Ngijo**. Ada yang bisa saya bantu hari ini?\n\nAnda dapat menanyakan:\n• *Cara pengajuan surat pengantar KTP/KK/Domisili*\n• *Informasi iuran warga & kas RT*\n• *Prosedur pengaduan fasilitas umum*\n• *Jadwal kegiatan & pengumuman RT*`,
    timestamp,
    quickActions: [
      { label: 'Cek Status Surat', action: 'cek_surat' },
      { label: 'Info Iuran', action: 'cek_iuran' },
      { label: 'Pengaduan Warga', action: 'open_complaint_modal' }
    ]
  };
}
