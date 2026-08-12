import { UserRole } from '../types/rt';

export interface TrainingRecord {
  trainingId: string;
  userId: string;
  nama: string;
  role: UserRole;
  moduleLevel: 'LEVEL_1_WARGA' | 'LEVEL_2_PENGURUS' | 'LEVEL_3_KETUA_RT' | 'LEVEL_4_ADMIN';
  theoryScore: number;     // max 100 (weight 30%)
  practicalScore: number;  // max 100 (weight 50%)
  securityScore: number;   // max 100 (weight 20%)
  finalScore: number;      // weighted average
  securityPass: boolean;   // Must be true
  status: 'CERTIFIED' | 'REMEDIAL' | 'BELUM_TRAINING' | 'EXPIRED';
  trainer: string;
  tanggal: string;
  version: string;
  certificateId?: string;
  remedialAttempts?: number;
}

export interface QuizQuestion {
  id: string;
  category: 'TEORI' | 'PRAKTIK' | 'SECURITY';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PracticalLabScenario {
  id: string;
  title: string;
  description: string;
  category: 'REGULAR' | 'DISASTER_RECOVERY';
  steps: string[];
  expectedOutcome: string;
}

export interface TrainingKPI {
  totalParticipants: number;
  totalCertified: number;
  totalRemedial: number;
  totalBelumTraining: number;
  completionRate: number; // percentage
  passRate: number;       // percentage
  securityPassRate: number; // percentage
  certifiedByRole: Record<UserRole, { total: number; certified: number; rate: number }>;
  version: string;
}

const STORAGE_KEY_RECORDS = 'smart_rt_training_records_v1';
const STORAGE_KEY_MODE = 'smart_rt_training_mode_active';

export class TrainingService {
  private static version = 'Training v1.0';

  // Toggle Training Mode (Demo Data Environment)
  public static isTrainingModeActive(): boolean {
    return localStorage.getItem(STORAGE_KEY_MODE) === 'true';
  }

  public static setTrainingMode(active: boolean): void {
    localStorage.setItem(STORAGE_KEY_MODE, active ? 'true' : 'false');
  }

  // Get All Training Records
  public static getRecords(): TrainingRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse training records:', e);
      }
    }

    // Default Seeded Records
    const defaultRecords: TrainingRecord[] = [
      {
        trainingId: 'TRN-2026-001',
        userId: 'USR-ADM-01',
        nama: 'Safari (Administrator Utama)',
        role: 'ADMIN',
        moduleLevel: 'LEVEL_4_ADMIN',
        theoryScore: 95,
        practicalScore: 94,
        securityScore: 100,
        finalScore: 95.5,
        securityPass: true,
        status: 'CERTIFIED',
        trainer: 'Tim Pengembang IT GPA',
        tanggal: '2026-08-01',
        version: 'Training v1.0',
        certificateId: 'CERT-SMART-ADMIN-99A821',
      },
      {
        trainingId: 'TRN-2026-002',
        userId: 'USR-KRT-01',
        nama: 'H. Supriyanto (Ketua RT 07)',
        role: 'KETUA_RT',
        moduleLevel: 'LEVEL_3_KETUA_RT',
        theoryScore: 92,
        practicalScore: 96,
        securityScore: 100,
        finalScore: 95.6,
        securityPass: true,
        status: 'CERTIFIED',
        trainer: 'Safari (Admin)',
        tanggal: '2026-08-02',
        version: 'Training v1.0',
        certificateId: 'CERT-SMART-KETUA-77F102',
      },
      {
        trainingId: 'TRN-2026-003',
        userId: 'USR-PNG-01',
        nama: 'Siti Rahmawati (Sekretaris RT)',
        role: 'PENGURUS',
        moduleLevel: 'LEVEL_2_PENGURUS',
        theoryScore: 90,
        practicalScore: 92,
        securityScore: 100,
        finalScore: 93.0,
        securityPass: true,
        status: 'CERTIFIED',
        trainer: 'Safari (Admin)',
        tanggal: '2026-08-03',
        version: 'Training v1.0',
        certificateId: 'CERT-SMART-PENGURUS-44E891',
      },
      {
        trainingId: 'TRN-2026-004',
        userId: 'USR-WRG-01',
        nama: 'Bambang Utomo (Warga Blok A)',
        role: 'WARGA',
        moduleLevel: 'LEVEL_1_WARGA',
        theoryScore: 88,
        practicalScore: 90,
        securityScore: 100,
        finalScore: 91.4,
        securityPass: true,
        status: 'CERTIFIED',
        trainer: 'Siti Rahmawati (Pengurus)',
        tanggal: '2026-08-05',
        version: 'Training v1.0',
        certificateId: 'CERT-SMART-WARGA-11B402',
      },
      {
        trainingId: 'TRN-2026-005',
        userId: 'USR-WRG-02',
        nama: 'Joko Susilo (Warga Blok C)',
        role: 'WARGA',
        moduleLevel: 'LEVEL_1_WARGA',
        theoryScore: 65,
        practicalScore: 70,
        securityScore: 80, // Failed security requirement (must be 100%)
        finalScore: 70.5,
        securityPass: false,
        status: 'REMEDIAL',
        trainer: 'Siti Rahmawati (Pengurus)',
        tanggal: '2026-08-06',
        version: 'Training v1.0',
        remedialAttempts: 1,
      },
      {
        trainingId: 'TRN-2026-006',
        userId: 'USR-WRG-03',
        nama: 'Dewi Lestari (Warga Baru)',
        role: 'WARGA',
        moduleLevel: 'LEVEL_1_WARGA',
        theoryScore: 0,
        practicalScore: 0,
        securityScore: 0,
        finalScore: 0,
        securityPass: false,
        status: 'BELUM_TRAINING',
        trainer: '-',
        tanggal: '-',
        version: 'Training v1.0',
      }
    ];

    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(defaultRecords));
    return defaultRecords;
  }

  // Save Records
  public static saveRecords(records: TrainingRecord[]): void {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }

  // Compute KPI Statistics
  public static getKPI(): TrainingKPI {
    const records = this.getRecords();
    const totalParticipants = records.length;
    const totalCertified = records.filter(r => r.status === 'CERTIFIED').length;
    const totalRemedial = records.filter(r => r.status === 'REMEDIAL').length;
    const totalBelumTraining = records.filter(r => r.status === 'BELUM_TRAINING').length;

    const completionRate = totalParticipants > 0 
      ? Math.round(((totalCertified + totalRemedial) / totalParticipants) * 100) 
      : 0;
    
    const passRate = (totalCertified + totalRemedial) > 0 
      ? Math.round((totalCertified / (totalCertified + totalRemedial)) * 100) 
      : 0;

    const securityPassCount = records.filter(r => r.securityPass).length;
    const securityPassRate = totalParticipants > 0 
      ? Math.round((securityPassCount / totalParticipants) * 100) 
      : 0;

    const roles: UserRole[] = ['ADMIN', 'KETUA_RT', 'PENGURUS', 'WARGA', 'PUBLIC'];
    const certifiedByRole = {} as Record<UserRole, { total: number; certified: number; rate: number }>;

    roles.forEach(role => {
      const roleRecords = records.filter(r => r.role === role);
      const roleTotal = roleRecords.length;
      const roleCert = roleRecords.filter(r => r.status === 'CERTIFIED').length;
      certifiedByRole[role] = {
        total: roleTotal,
        certified: roleCert,
        rate: roleTotal > 0 ? Math.round((roleCert / roleTotal) * 100) : 100, // Default 100 if no members
      };
    });

    return {
      totalParticipants,
      totalCertified,
      totalRemedial,
      totalBelumTraining,
      completionRate,
      passRate,
      securityPassRate,
      certifiedByRole,
      version: this.version,
    };
  }

  // Submit Exam Answers & Evaluate Result
  public static evaluateExam(
    userId: string,
    nama: string,
    role: UserRole,
    theoryAnswers: Record<string, number>,
    practicalAnswers: Record<string, number>,
    securityAnswers: Record<string, number>,
    questions: { theory: QuizQuestion[]; practical: QuizQuestion[]; security: QuizQuestion[] },
    trainerName: string = 'System Evaluator'
  ): TrainingRecord {
    let theoryCorrect = 0;
    questions.theory.forEach(q => {
      if (theoryAnswers[q.id] === q.correctAnswerIndex) theoryCorrect++;
    });
    const theoryScore = questions.theory.length > 0 ? Math.round((theoryCorrect / questions.theory.length) * 100) : 100;

    let practicalCorrect = 0;
    questions.practical.forEach(q => {
      if (practicalAnswers[q.id] === q.correctAnswerIndex) practicalCorrect++;
    });
    const practicalScore = questions.practical.length > 0 ? Math.round((practicalCorrect / questions.practical.length) * 100) : 100;

    let securityCorrect = 0;
    questions.security.forEach(q => {
      if (securityAnswers[q.id] === q.correctAnswerIndex) securityCorrect++;
    });
    const securityScore = questions.security.length > 0 ? Math.round((securityCorrect / questions.security.length) * 100) : 100;

    // Weighted Score: 30% Theory, 50% Practical, 20% Security
    const finalScore = Number(((theoryScore * 0.3) + (practicalScore * 0.5) + (securityScore * 0.2)).toFixed(1));

    // Security Test is COMPULSORY: MUST BE 100%
    const securityPass = securityScore === 100;
    const isPass = finalScore >= 80 && securityPass;

    const levelMap: Record<UserRole, 'LEVEL_1_WARGA' | 'LEVEL_2_PENGURUS' | 'LEVEL_3_KETUA_RT' | 'LEVEL_4_ADMIN'> = {
      WARGA: 'LEVEL_1_WARGA',
      PENGURUS: 'LEVEL_2_PENGURUS',
      KETUA_RT: 'LEVEL_3_KETUA_RT',
      ADMIN: 'LEVEL_4_ADMIN',
      PUBLIC: 'LEVEL_1_WARGA',
    };

    const certId = isPass ? `CERT-SMART-${role}-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;

    const newRecord: TrainingRecord = {
      trainingId: `TRN-2026-${Math.floor(100 + Math.random() * 900)}`,
      userId,
      nama,
      role,
      moduleLevel: levelMap[role],
      theoryScore,
      practicalScore,
      securityScore,
      finalScore,
      securityPass,
      status: isPass ? 'CERTIFIED' : 'REMEDIAL',
      trainer: trainerName,
      tanggal: new Date().toISOString().split('T')[0],
      version: this.version,
      certificateId: certId,
      remedialAttempts: isPass ? 0 : 1,
    };

    // Save to local storage records
    const records = this.getRecords();
    const existingIndex = records.findIndex(r => r.userId === userId || r.nama === nama);
    if (existingIndex >= 0) {
      records[existingIndex] = newRecord;
    } else {
      records.push(newRecord);
    }
    this.saveRecords(records);

    return newRecord;
  }

  // Get Questions Bank for Each Level
  public static getQuizBank(role: UserRole): { theory: QuizQuestion[]; practical: QuizQuestion[]; security: QuizQuestion[] } {
    switch (role) {
      case 'WARGA':
        return {
          theory: [
            {
              id: 'W-T1',
              category: 'TEORI',
              question: 'Apa fungsi utama dari portal SMART RT 07 RW 11?',
              options: ['Aplikasi belanja online warga', 'Portal layanan administrasi & informasi warga terpadu', 'Aplikasi chatting bebas', 'Game online warga'],
              correctAnswerIndex: 1,
              explanation: 'SMART RT dibangun sebagai sistem pelayanan administrasi dan transparansi warga RT 07 RW 11 Perum GPA Ngijo.'
            },
            {
              id: 'W-T2',
              category: 'TEORI',
              question: 'Kredensial apa yang digunakan oleh warga untuk melakukan login?',
              options: ['Nomor HP dan Alamat Rumah', 'NIK dan Password terdaftar', 'Email saja', 'Nama Lengkap'],
              correctAnswerIndex: 1,
              explanation: 'Authentication warga menggunakan NIK terverifikasi dan Password aman.'
            },
            {
              id: 'W-T3',
              category: 'TEORI',
              question: 'Siapakah yang berwenang menyetujui (approve) pengajuan Surat Pengantar RT?',
              options: ['Warga pemohon', 'Pengurus RT (Verifikasi) lalu Ketua RT (Final Approval)', 'Vendor Vercel', 'Google Apps Script'],
              correctAnswerIndex: 1,
              explanation: 'Alur surat melewati verifikasi Pengurus RT terlebih dahulu sebelum keputusan approval dari Ketua RT.'
            }
          ],
          practical: [
            {
              id: 'W-P1',
              category: 'PRAKTIK',
              question: 'Bagaimana cara melakukan pengajuan Surat Pengantar KTP secara mandiri?',
              options: ['Mengirim SMS biasa', 'Buka menu Pengajuan Surat, isi formulir & unggah lampiran, lalu kirim', 'Mendatangi rumah Ketua RT malam hari', 'Menulis komentar di grup WA'],
              correctAnswerIndex: 1,
              explanation: 'Pengajuan resmi dilakukan via menu Pengajuan Surat di portal SMART RT.'
            },
            {
              id: 'W-P2',
              category: 'PRAKTIK',
              question: 'Di mana warga dapat memantau proses verifikasi surat yang diajukan?',
              options: ['Menu Tracking Surat', 'Menu Audit Log', 'Menu Configuration', 'Menu System Monitoring'],
              correctAnswerIndex: 0,
              explanation: 'Menu Tracking Surat menampilkan status realtime (Pending -> Verified -> Approved).'
            }
          ],
          security: [
            {
              id: 'W-S1',
              category: 'SECURITY',
              question: 'Tetangga Anda meminta password akun SMART RT Anda dengan alasan ingin membantu membuatkan surat. Apa tindakan Anda?',
              options: ['Memberikan password karena tetangga dekat', 'Menolak tegas karena password bersifat rahasia dan membimbingnya mengajukan sendiri', 'Menuliskan password di grup WhatsApp RT', 'Mengabaikan saja'],
              correctAnswerIndex: 1,
              explanation: 'Password bersifat rahasia. Akun tidak boleh dipindahtangankan untuk mencegah penyalahgunaan identitas.'
            },
            {
              id: 'W-S2',
              category: 'SECURITY',
              question: 'Apakah warga diperbolehkan mengakses data NIK, KK, atau iuran warga tetangga lain?',
              options: ['Boleh jika penasaran', 'TIDAK BOLEH, warga hanya berhak melihat data pribadi keluarga sendiri', 'Boleh jika sudah berteman', 'Boleh jika meminta izin lisan'],
              correctAnswerIndex: 1,
              explanation: 'Batas kewenangan Warga melarang tegas melihat atau memodifikasi data warga lain demi perlindungan data pribadi.'
            }
          ]
        };

      case 'PENGURUS':
        return {
          theory: [
            {
              id: 'P-T1',
              category: 'TEORI',
              question: 'Apa tugas utama Pengurus RT dalam alur pengajuan Surat Pengantar?',
              options: ['Menerbitkan tanda tangan digital Ketua RT', 'Memeriksa keabsahan NIK/KK, syarat dokumen, dan memberikan catatan verifikasi', 'Menghapus database warga', 'Membeli domain Vercel'],
              correctAnswerIndex: 1,
              explanation: 'Pengurus bertanggung jawab pada tahap Verifikasi Dokumen sebelum diteruskan ke Ketua RT.'
            },
            {
              id: 'P-T2',
              category: 'TEORI',
              question: 'Bolehkah Pengurus RT mengubah role akun pengguna lain sesuka hati?',
              options: ['Boleh kapan saja', 'TIDAK BOLEH, pengaturan role adalah kewenangan Administrator Utama', 'Boleh jika diminta tetangga', 'Boleh untuk uji coba'],
              correctAnswerIndex: 1,
              explanation: 'Pengurus dilarang mengubah role tanpa otorisasi formal dari Admin.'
            }
          ],
          practical: [
            {
              id: 'P-P1',
              category: 'PRAKTIK',
              question: 'Langkah apa yang dilakukan Pengurus saat menemukan pengaduan warga tentang fasilitas rusak?',
              options: ['Abaikan saja', 'Buka menu Pengaduan, lakukan verifikasi, ubah status ke "DIPROSES", dan assign ke Seksi terkait', 'Langsung menghapus pengaduan', 'Membalas dengan kalimat tidak sopan'],
              correctAnswerIndex: 1,
              explanation: 'SOP Penanganan Pengaduan mengharuskan Pengurus melakukan verifikasi, assign penanggung jawab, dan update status.'
            }
          ],
          security: [
            {
              id: 'P-S1',
              category: 'SECURITY',
              question: 'Seseorang yang mengaku kerabat warga meminta file Excel berisi daftar seluruh NIK & No HP warga RT 07. Apa tindakan Anda?',
              options: ['Langsung memberikan file tersebut', 'Menolak tegas karena NIK & HP adalah data CONFIDENTIAL & HIGHLY CONFIDENTIAL', 'Menjual file tersebut', 'Mengunggah file ke Google Drive publik'],
              correctAnswerIndex: 1,
              explanation: 'Sesuai Kebijakan Perlindungan Data, NIK dan KK dilindungi ketat dan dilarang disebarluaskan.'
            }
          ]
        };

      case 'KETUA_RT':
        return {
          theory: [
            {
              id: 'K-T1',
              category: 'TEORI',
              question: 'Apa keunggulan utama dari Tanda Tangan Digital & QR Code pada Surat Pengantar yang diterbitkan Ketua RT?',
              options: ['Hanya sebagai hiasan', 'Mencegah pemalsuan dan memungkinkan verifikasi keaslian dokumen secara online', 'Membuat ukuran PDF menjadi mahal', 'Menggantikan stempel basah tanpa legalitas'],
              correctAnswerIndex: 1,
              explanation: 'QR Code terintegrasi dengan endpoint verifikasi publik untuk membuktikan keaslian dokumen sah.'
            }
          ],
          practical: [
            {
              id: 'K-P1',
              category: 'PRAKTIK',
              question: 'Sebelum menyetujui Broadcast Pengumuman Resmi ke seluruh WhatsApp warga, apa yang harus dilakukan Ketua RT?',
              options: ['Langsung klik broadcast tanpa membaca', 'Memeriksa akurasi informasi, kerapian bahasa, dan memastikan tidak ada data pribadi sensitif yang bocor', 'Menyerahkan HP ke orang asing', 'Mematikan internet'],
              correctAnswerIndex: 1,
              explanation: 'Ketua RT harus melakukan peninjauan akhir agar pesan broadcast tidak menimbulkan kepanikan atau kebocoran data.'
            }
          ],
          security: [
            {
              id: 'K-S1',
              category: 'SECURITY',
              question: 'Anda menerima pesan WhatsApp yang menyamar sebagai Tim IT meminta kredensial akun Ketua RT Anda. Apa tindakan Anda?',
              options: ['Langsung memberikan password', 'Waspadai Phishing, jangan berikan kredensial, dan laporkan ke Administrator Utama', 'Membalas dengan kemarahan', 'Membagikan pesan ke warga'],
              correctAnswerIndex: 1,
              explanation: 'Account Takeover Ketua RT sangat berbahaya karena dapat memicu approval palsu. Selalu verifikasi lewat jalur resmi.'
            }
          ]
        };

      case 'ADMIN':
      default:
        return {
          theory: [
            {
              id: 'A-T1',
              category: 'TEORI',
              question: 'Apa fungsi dari SHA-256 Checksum pada file snapshot backup database?',
              options: ['Kompresi ukuran file', 'Memastikan integritas file backup tidak mengalami korupsi atau manipulasi saat proses restore', 'Mempercepat kecepatan internet', 'Mencegah login warga'],
              correctAnswerIndex: 1,
              explanation: 'Verification SHA-256 Checksum menjamin integritas data 100% cocok dengan snapshot awal.'
            },
            {
              id: 'A-T2',
              category: 'TEORI',
              question: 'Berapakah target Recovery Time Objective (RTO) dan Recovery Point Objective (RPO) pada Disaster Recovery Plan SMART RT?',
              options: ['RTO 24 jam, RPO 1 minggu', 'RTO < 30 menit, RPO < 24 jam (Daily Snapshot)', 'RTO 1 bulan, RPO 0', 'RTO & RPO tidak ditentukan'],
              correctAnswerIndex: 1,
              explanation: 'Sistem dirancang dengan RTO < 30 menit dan RPO < 24 jam untuk menjamin keberlanjutan operasional.'
            }
          ],
          practical: [
            {
              id: 'A-P1',
              category: 'PRAKTIK',
              question: 'Saat Google Apps Script WebApp mengalami error quota limit (CASE D DR), tindakan mitigasi cepat Admin adalah?',
              options: ['Membiarkan aplikasi mati', 'Mengalihkan traffic ke Secondary Mirror WebApp Deployment & mengaktifkan Fallback Queue', 'Menghapus source code', 'Mengganti password akun Google'],
              correctAnswerIndex: 1,
              explanation: 'DR Case D mengatur pengalihan otomatis ke mirror endpoint Apps Script yang telah disediakan.'
            }
          ],
          security: [
            {
              id: 'A-S1',
              category: 'SECURITY',
              question: 'Bagaimana cara memastikan Audit Log tidak dapat dimanipulasi oleh pihak tak bertanggung jawab?',
              options: ['Menyimpan log di Word biasa', 'Menggunakan Cryptographic SHA-256 Hash Chaining di mana setiap record terikat dengan hash record sebelumnya', 'Menghapus log setiap hari', 'Mematikan fitur audit log'],
              correctAnswerIndex: 1,
              explanation: 'Cryptographic Hash-Chaining menjamin sifat tamper-evident pada seluruh riwayat transaksi audit.'
            }
          ]
        };
    }
  }

  // Get Practical Labs Catalog for Admin / Pengurus / Ketua RT
  public static getPracticalLabs(): PracticalLabScenario[] {
    return [
      {
        id: 'LAB-01',
        title: 'LAB-01: Create & Onboard User',
        description: 'Simulasi pendaftaran warga baru dengan verifikasi NIK & Alamat.',
        category: 'REGULAR',
        steps: [
          'Akses Menu User Management',
          'Isi NIK, Nama, No HP, Alamat Blok',
          'Set Default Role: WARGA',
          'Generate Temporary Password',
          'Verifikasi di Audit Log'
        ],
        expectedOutcome: 'User warga baru terdaftar dengan status "BELUM_TRAINING".'
      },
      {
        id: 'LAB-06',
        title: 'LAB-06: Daily Snapshot Backup Execution',
        description: 'Eksekusi manual pencadangan snapshot database 13 worksheets.',
        category: 'REGULAR',
        steps: [
          'Buka Admin Backup & Restore Center',
          'Klik "Execute Daily Snapshot"',
          'Tunggu kompresi JSON & hashing SHA-256',
          'Periksa file di Google Drive Archive'
        ],
        expectedOutcome: 'File snapshot terkompresi dengan checksum valid dihasilkan.'
      },
      {
        id: 'LAB-08',
        title: 'LAB-08: Sandbox Disaster Recovery Test',
        description: 'Simulasi restore snapshot ke lingkungan sandbox terisolasi.',
        category: 'REGULAR',
        steps: [
          'Pilih Snapshot Backup Terakhir',
          'Klik "Test Restore to Sandbox"',
          'Sistem mensimulasikan pemulihan tabel',
          'Verifikasi kecocokan jumlah baris data'
        ],
        expectedOutcome: 'Restoration berhasil 100% tanpa mempengaruhi database production.'
      },
      {
        id: 'DR-CASE-A',
        title: 'CASE A: Google Sheet Database Offline',
        description: 'Simulasi kegagalan koneksi utama ke Google Sheets API.',
        category: 'DISASTER_RECOVERY',
        steps: [
          'Deteksi Endpoint Google Sheets Timeout',
          'Sistem mengaktifkan In-Memory Cache (Read-Only Mode)',
          'Aktifkan Secondary Mirror Spreadsheet',
          'Sinkronkan ulang delta transaksi setelah online'
        ],
        expectedOutcome: 'Layanan tetap dapat diakses warga secara read-only tanpa crash.'
      },
      {
        id: 'DR-CASE-E',
        title: 'CASE E: WhatsApp Gateway Outage',
        description: 'Simulasi penyedia gateway WhatsApp mengalami downtime.',
        category: 'DISASTER_RECOVERY',
        steps: [
          'Deteksi Gagal Dispatch > 3x',
          'Alihkan pesan ke Outbox Queue Buffer',
          'Kirim alert ke Administrator',
          'Jalankan retry exponential backoff saat gateway pulih'
        ],
        expectedOutcome: 'Pesan tidak hilang dan akan terkirim otomatis setelah gateway online.'
      }
    ];
  }
}
