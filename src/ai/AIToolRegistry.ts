// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8I AI TOOLS REGISTRY
import { AIToolDefinition } from '../types/aiTools';

export type { AIToolDefinition };

export const AI_TOOL_REGISTRY: Record<string, AIToolDefinition> = {
  // ==========================================
  // 1. READ TOOLS
  // ==========================================
  getMyProfile: {
    toolId: 'getMyProfile',
    name: 'getMyProfile',
    category: 'READ',
    description: 'Membaca profil warga terautentikasi (nama, alamat, no hp masked). Tidak memerlukan ID.',
    permission: 'PROFILE_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        id_warga: { type: 'string', description: 'ID Warga' },
        nama_lengkap: { type: 'string', description: 'Nama Warga' },
        alamat: { type: 'string', description: 'Alamat' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_READ_PROFILE',
    rateLimit: 30
  },

  getMyPayments: {
    toolId: 'getMyPayments',
    name: 'getMyPayments',
    category: 'READ',
    description: 'Membaca riwayat pembayaran iuran kas warga sendiri.',
    permission: 'PAYMENT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        payments: { type: 'array', description: 'Daftar riwayat pembayaran' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_READ_PAYMENTS',
    rateLimit: 30
  },

  getMyLetters: {
    toolId: 'getMyLetters',
    name: 'getMyLetters',
    category: 'READ',
    description: 'Mendapatkan daftar pengajuan surat milik warga terautentikasi.',
    permission: 'LETTER_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        letters: { type: 'array', description: 'Daftar permohonan surat' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_READ_LETTERS',
    rateLimit: 30
  },

  getMyComplaints: {
    toolId: 'getMyComplaints',
    name: 'getMyComplaints',
    category: 'READ',
    description: 'Melihat status pengaduan/tiket yang diajukan warga sendiri.',
    permission: 'COMPLAINT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        complaints: { type: 'array', description: 'Daftar tiket pengaduan' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_READ_COMPLAINTS',
    rateLimit: 30
  },

  getLetterStatus: {
    toolId: 'getLetterStatus',
    name: 'getLetterStatus',
    category: 'READ',
    description: 'Mengecek status spesifik permohonan surat berdasarkan ID.',
    permission: 'LETTER_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: {
      type: 'object',
      properties: {
        letterId: { type: 'string', description: 'ID / Nomor Surat Pengantar', required: true }
      },
      required: ['letterId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        id_surat: { type: 'string', description: 'ID Surat' },
        status: { type: 'string', description: 'Status Surat' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_READ_LETTER_STATUS',
    rateLimit: 30
  },

  getRTAnnouncement: {
    toolId: 'getRTAnnouncement',
    name: 'getRTAnnouncement',
    category: 'READ',
    description: 'Mendapatkan pengumuman dan berita resmi RT 07 RW 11.',
    permission: 'PUBLIC_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        announcements: { type: 'array', description: 'Daftar pengumuman aktif' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: false,
    auditEvent: 'TOOL_READ_ANNOUNCEMENT',
    rateLimit: 60
  },

  getServiceRequirements: {
    toolId: 'getServiceRequirements',
    name: 'getServiceRequirements',
    category: 'READ',
    description: 'Mendapatkan informasi persyaratan dokumen dan SOP pelayanan administrasi RT.',
    permission: 'PUBLIC_READ',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: {
      type: 'object',
      properties: {
        jenisSurat: { type: 'string', description: 'Jenis Surat (KTP/KK/Domisili/Suket)', required: false }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        requirements: { type: 'array', description: 'Persyaratan layanan' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: false,
    auditEvent: 'TOOL_READ_REQUIREMENTS',
    rateLimit: 60
  },

  getFinancialSummary: {
    toolId: 'getFinancialSummary',
    name: 'getFinancialSummary',
    category: 'READ',
    description: 'Membaca ringkasan laporan kas dan rekapitulasi iuran warga RT 07.',
    permission: 'FINANCE_READ',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: { type: 'object', properties: {} },
    outputSchema: {
      type: 'object',
      properties: {
        saldo_kas: { type: 'number', description: 'Total Saldo Kas RT' },
        rekap_iuran: { type: 'object', description: 'Statistik Iuran' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: false,
    auditEvent: 'TOOL_READ_FINANCIAL_SUMMARY',
    rateLimit: 20
  },

  // ==========================================
  // 2. TRANSACTION TOOLS
  // ==========================================
  createLetterRequest: {
    toolId: 'createLetterRequest',
    name: 'createLetterRequest',
    category: 'TRANSACTION',
    description: 'Mengajukan surat pengantar baru (KTP, KK, Domisili, Keterangan).',
    permission: 'LETTER_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: {
      type: 'object',
      properties: {
        jenisSurat: { type: 'string', description: 'Jenis surat pengantar', required: true },
        keperluan: { type: 'string', description: 'Alasan / keperluan surat', required: true },
        keterangan: { type: 'string', description: 'Catatan tambahan', required: false }
      },
      required: ['jenisSurat', 'keperluan']
    },
    outputSchema: {
      type: 'object',
      properties: {
        id_surat: { type: 'string', description: 'ID Surat baru' },
        status: { type: 'string', description: 'Status permohonan' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: true,
    auditEvent: 'TOOL_CREATE_LETTER',
    rateLimit: 10
  },

  createComplaint: {
    toolId: 'createComplaint',
    name: 'createComplaint',
    category: 'TRANSACTION',
    description: 'Membuat tiket pengaduan atau aspirasi warga baru.',
    permission: 'COMPLAINT_CREATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: {
      type: 'object',
      properties: {
        kategori: { type: 'string', description: 'Kebersihan/Keamanan/Fasilitas/Lainnya', required: true },
        judul: { type: 'string', description: 'Judul pengaduan', required: true },
        deskripsi: { type: 'string', description: 'Detail pengaduan', required: true },
        lokasi: { type: 'string', description: 'Lokasi kejadian', required: false }
      },
      required: ['kategori', 'judul', 'deskripsi']
    },
    outputSchema: {
      type: 'object',
      properties: {
        id_pengaduan: { type: 'string', description: 'Nomor Tiket Pengaduan' },
        status: { type: 'string', description: 'Status awal (RECEIVED)' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: true,
    auditEvent: 'TOOL_CREATE_COMPLAINT',
    rateLimit: 10
  },

  submitPaymentConfirmation: {
    toolId: 'submitPaymentConfirmation',
    name: 'submitPaymentConfirmation',
    category: 'TRANSACTION',
    description: 'Mengonfirmasi dan mengirimkan bukti pembayaran iuran bulanan.',
    permission: 'PAYMENT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: {
      type: 'object',
      properties: {
        bulanTahun: { type: 'string', description: 'Periode Bulan/Tahun (e.g. Agustus 2026)', required: true },
        nominal: { type: 'number', description: 'Nominal yang dibayarkan', required: true },
        metodeBayar: { type: 'string', description: 'TRANSFER / QRIS / TUNAI', required: true }
      },
      required: ['bulanTahun', 'nominal', 'metodeBayar']
    },
    outputSchema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', description: 'ID Konfirmasi Pembayaran' },
        status: { type: 'string', description: 'Status pembayaran (VERIFYING)' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: true,
    auditEvent: 'TOOL_SUBMIT_PAYMENT',
    rateLimit: 10
  },

  // ==========================================
  // 3. DOCUMENT TOOLS
  // ==========================================
  generateLetterPDF: {
    toolId: 'generateLetterPDF',
    name: 'generateLetterPDF',
    category: 'DOCUMENT',
    description: 'Mencetak berkas PDF resmi A4 Surat Pengantar ber-QR Code.',
    permission: 'PDF_GENERATE',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: {
      type: 'object',
      properties: {
        letterId: { type: 'string', description: 'ID Surat Pengantar', required: true }
      },
      required: ['letterId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        pdfUrl: { type: 'string', description: 'URL atau data Base64 PDF' },
        documentHash: { type: 'string', description: 'SHA-256 Checksum Dokumen' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_GENERATE_PDF',
    rateLimit: 20
  },

  generatePaymentReceipt: {
    toolId: 'generatePaymentReceipt',
    name: 'generatePaymentReceipt',
    category: 'DOCUMENT',
    description: 'Membuat kuitansi / bukti pembayaran resmi kas RT 07.',
    permission: 'PAYMENT_READ_SELF',
    allowedRoles: ['WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', description: 'ID Tagihan / Transaksi Iuran', required: true }
      },
      required: ['paymentId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        receiptNumber: { type: 'string', description: 'Nomor Kuitansi' },
        downloadUrl: { type: 'string', description: 'URL Unduh Kuitansi PDF' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: true,
    auditEvent: 'TOOL_GENERATE_RECEIPT',
    rateLimit: 20
  },

  verifyDocumentQR: {
    toolId: 'verifyDocumentQR',
    name: 'verifyDocumentQR',
    category: 'DOCUMENT',
    description: 'Memverifikasi keabsahan dokumen ber-QR Code publik tanpa mengungkap NIK/KK.',
    permission: 'QR_VERIFY',
    allowedRoles: ['PUBLIC', 'WARGA', 'PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'LOW',
    inputSchema: {
      type: 'object',
      properties: {
        verificationCode: { type: 'string', description: 'Kode / Token Hash QR', required: true }
      },
      required: ['verificationCode']
    },
    outputSchema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: 'Keabsahan dokumen' },
        documentDetails: { type: 'object', description: 'Atribut publik dokumen' }
      }
    },
    confirmationRequired: false,
    requiresOwnership: false,
    auditEvent: 'TOOL_VERIFY_QR',
    rateLimit: 60
  },

  // ==========================================
  // 4. COMMUNICATION TOOLS
  // ==========================================
  sendWhatsAppMessage: {
    toolId: 'sendWhatsAppMessage',
    name: 'sendWhatsAppMessage',
    category: 'COMMUNICATION',
    description: 'Mengirimkan pesan WhatsApp ke nomor spesifik via Provider Adapter.',
    permission: 'AI_CHAT',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'HIGH',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Nomor HP tujuan', required: true },
        message: { type: 'string', description: 'Isi Pesan WhatsApp', required: true }
      },
      required: ['phone', 'message']
    },
    outputSchema: {
      type: 'object',
      properties: {
        queuedId: { type: 'string', description: 'ID Antrean Notifikasi' },
        status: { type: 'string', description: 'Status Pengiriman' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_SEND_WHATSAPP',
    rateLimit: 10
  },

  sendLetterNotification: {
    toolId: 'sendLetterNotification',
    name: 'sendLetterNotification',
    category: 'COMMUNICATION',
    description: 'Mengirim notifikasi otomatis pembaruan status surat pengantar ke pemohon.',
    permission: 'LETTER_VERIFY',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: {
      type: 'object',
      properties: {
        letterId: { type: 'string', description: 'ID Surat Pengantar', required: true },
        status: { type: 'string', description: 'Status Baru Surat', required: true }
      },
      required: ['letterId', 'status']
    },
    outputSchema: {
      type: 'object',
      properties: {
        sent: { type: 'boolean', description: 'Status Terkirim' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_NOTIFY_LETTER',
    rateLimit: 15
  },

  sendPaymentReminder: {
    toolId: 'sendPaymentReminder',
    name: 'sendPaymentReminder',
    category: 'COMMUNICATION',
    description: 'Mengirimkan pengingat iuran bulanan warga via WhatsApp.',
    permission: 'FINANCE_MANAGE',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'HIGH',
    inputSchema: {
      type: 'object',
      properties: {
        residentId: { type: 'string', description: 'ID / Nama Warga Tujuan', required: true },
        periode: { type: 'string', description: 'Bulan / Periode Iuran', required: true }
      },
      required: ['residentId', 'periode']
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Status Pengiriman Reminder' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_NOTIFY_PAYMENT',
    rateLimit: 10
  },

  sendComplaintUpdate: {
    toolId: 'sendComplaintUpdate',
    name: 'sendComplaintUpdate',
    category: 'COMMUNICATION',
    description: 'Mengirim notifikasi penanganan pengaduan kepada pelapor.',
    permission: 'COMPLAINT_MANAGE',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'MEDIUM',
    inputSchema: {
      type: 'object',
      properties: {
        complaintId: { type: 'string', description: 'ID Tiket Pengaduan', required: true },
        updateNote: { type: 'string', description: 'Progres / Tanggapan Pengurus', required: true }
      },
      required: ['complaintId', 'updateNote']
    },
    outputSchema: {
      type: 'object',
      properties: {
        sent: { type: 'boolean', description: 'Status Terkirim' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_NOTIFY_COMPLAINT',
    rateLimit: 15
  },

  // ==========================================
  // 5. ADMIN TOOLS
  // ==========================================
  createAnnouncement: {
    toolId: 'createAnnouncement',
    name: 'createAnnouncement',
    category: 'ADMIN',
    description: 'Membuat draf dan menyiarkan pengumuman resmi ke seluruh warga RT 07.',
    permission: 'ANNOUNCEMENT_PUBLISH',
    allowedRoles: ['KETUA_RT', 'ADMIN'],
    riskLevel: 'HIGH',
    inputSchema: {
      type: 'object',
      properties: {
        judul: { type: 'string', description: 'Judul Pengumuman', required: true },
        isi: { type: 'string', description: 'Isi Pesan Pengumuman', required: true },
        kategori: { type: 'string', description: 'Kegiatan / Imbauan / Keuangan', required: true },
        broadcastWA: { type: 'boolean', description: 'Siarkan via WhatsApp Broadcast', required: false }
      },
      required: ['judul', 'isi', 'kategori']
    },
    outputSchema: {
      type: 'object',
      properties: {
        id_pengumuman: { type: 'string', description: 'ID Pengumuman Baru' },
        status: { type: 'string', description: 'Status Publikasi' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_CREATE_ANNOUNCEMENT',
    rateLimit: 5
  },

  approveLetter: {
    toolId: 'approveLetter',
    name: 'approveLetter',
    category: 'ADMIN',
    description: 'Menyetujui permohonan surat pengantar warga dan menerbitkan tanda tangan digital.',
    permission: 'LETTER_APPROVE',
    allowedRoles: ['KETUA_RT', 'ADMIN'],
    riskLevel: 'HIGH',
    inputSchema: {
      type: 'object',
      properties: {
        letterId: { type: 'string', description: 'ID Surat yang Disetujui', required: true },
        catatan: { type: 'string', description: 'Catatan Persetujuan', required: false }
      },
      required: ['letterId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        id_surat: { type: 'string', description: 'ID Surat' },
        status: { type: 'string', description: 'DISETUJUI' },
        verificationHash: { type: 'string', description: 'Hash Tanda Tangan Digital' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_APPROVE_LETTER',
    rateLimit: 10
  },

  updateComplaintStatus: {
    toolId: 'updateComplaintStatus',
    name: 'updateComplaintStatus',
    category: 'ADMIN',
    description: 'Memperbarui status tiket pengaduan (RECEIVED -> IN_PROGRESS -> COMPLETED -> CANCELLED).',
    permission: 'COMPLAINT_MANAGE',
    allowedRoles: ['PENGURUS', 'KETUA_RT', 'ADMIN'],
    riskLevel: 'HIGH',
    inputSchema: {
      type: 'object',
      properties: {
        complaintId: { type: 'string', description: 'ID Tiket Pengaduan', required: true },
        newStatus: { type: 'string', description: 'RECEIVED / IN_PROGRESS / COMPLETED / CANCELLED', required: true },
        resolutionNote: { type: 'string', description: 'Catatan Solusi / Penanganan', required: true }
      },
      required: ['complaintId', 'newStatus', 'resolutionNote']
    },
    outputSchema: {
      type: 'object',
      properties: {
        complaintId: { type: 'string', description: 'ID Tiket' },
        status: { type: 'string', description: 'Status Baru Tiket' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_UPDATE_COMPLAINT',
    rateLimit: 15
  },

  generateFinancialReport: {
    toolId: 'generateFinancialReport',
    name: 'generateFinancialReport',
    category: 'ADMIN',
    description: 'Mengompilasi dan menggenerasi Laporan Keuangan Bulanan/Tahunan Kas RT 07.',
    permission: 'FINANCE_MANAGE',
    allowedRoles: ['KETUA_RT', 'ADMIN'],
    riskLevel: 'CRITICAL',
    inputSchema: {
      type: 'object',
      properties: {
        periode: { type: 'string', description: 'Bulan & Tahun Laporan (e.g. Agustus 2026)', required: true }
      },
      required: ['periode']
    },
    outputSchema: {
      type: 'object',
      properties: {
        reportId: { type: 'string', description: 'ID Laporan Keuangan' },
        totalPemasukan: { type: 'number', description: 'Total Pemasukan' },
        totalPengeluaran: { type: 'number', description: 'Total Pengeluaran' },
        saldoAkhir: { type: 'number', description: 'Saldo Akhir Kas' }
      }
    },
    confirmationRequired: true,
    requiresOwnership: false,
    auditEvent: 'TOOL_GENERATE_FINANCIAL_REPORT',
    rateLimit: 5
  }
};

function enrichToolDefinition(def: any): AIToolDefinition {
  return {
    ...def,
    requiredPermission: def.requiredPermission || def.permission,
    requiresConfirmation: def.requiresConfirmation !== undefined ? def.requiresConfirmation : def.confirmationRequired
  };
}

export function getAIToolDefinition(toolId: string): AIToolDefinition | undefined {
  const raw = AI_TOOL_REGISTRY[toolId];
  return raw ? enrichToolDefinition(raw) : undefined;
}

export function getAllAITools(): AIToolDefinition[] {
  return Object.values(AI_TOOL_REGISTRY).map(enrichToolDefinition);
}
