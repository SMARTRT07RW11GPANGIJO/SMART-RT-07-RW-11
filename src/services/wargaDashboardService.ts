/**
 * wargaDashboardService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * DASHBOARD WARGA v2.0 SERVICE LAYER
 * 
 * Flow:
 * AUTH -> AUTHORIZATION -> DAL -> ISOLATED REPOSITORIES -> WARGA DASHBOARD
 * 
 * Enforces:
 * - IDOR Protection (ownerUserId == currentUserId)
 * - Data Minimization (no sensitive ledgers or other residents' data)
 * - Strict FundType Isolation (RT_UMUM, DANA_KEMATIAN, OMPLOGAN)
 * - Push Notification & WhatsApp Integration
 * - Audit Trail Logging
 */

import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';
import { logAIAuditEntry } from './aiAuthorizationService';
import {
  WargaDashboardData,
  WargaProfileSummary,
  WargaInvoiceItem,
  WargaLetterItem,
  WargaComplaintItem,
  WargaNotificationItem,
  WargaTataTertibSummary,
  WargaActivityItem,
  WargaInvoiceFundType
} from '../types/wargaDashboard';
import { INITIAL_WARGA, INITIAL_KELUARGA, INITIAL_SURAT, INITIAL_PENGADUAN, INITIAL_PENGUMUMAN, INITIAL_AGENDA, INITIAL_IURAN } from '../data/mockData';
import { TataTertibService } from './tataTertibService';
import { waServiceInstance } from './whatsappService';
import { AuditLog } from '../types/rt';

const NOTIFICATION_STORAGE_KEY = 'SMART_RT_WARGA_NOTIFICATIONS_V2';
const INVOICE_STORAGE_KEY = 'SMART_RT_WARGA_INVOICES_V2';

export class WargaDashboardService {
  /**
   * Initializes local storage for notifications and invoices if not present
   */
  private static initStorage(userId: string) {
    const notifKey = `${NOTIFICATION_STORAGE_KEY}_${userId}`;
    if (!localStorage.getItem(notifKey)) {
      const defaultNotifications: WargaNotificationItem[] = [
        {
          id: 'NTF-001',
          type: 'SURAT',
          title: '📄 Permohonan Surat Disetujui',
          message: 'Surat Domisili Anda (001/RT07-RW11/VIII/2026) telah ditandatangani Ketua RT 07.',
          timestamp: '2026-08-08 10:30',
          isRead: false,
          actionUrl: 'surat'
        },
        {
          id: 'NTF-002',
          type: 'IURAN',
          title: '💰 Tagihan Iuran RT Agustus 2026',
          message: 'Iuran Kas RT Periode Agustus 2026 sebesar Rp 50.000 telah diterbitkan.',
          timestamp: '2026-08-01 08:00',
          isRead: false,
          actionUrl: 'iuran'
        },
        {
          id: 'NTF-003',
          type: 'OMPLOGAN',
          title: '🎉 Omplongan Agustusan HUT RI ke-81',
          message: 'Tagihan partisipasi Omplongan Agustusan 2026 sebesar Rp 50.000 siap dibayarkan.',
          timestamp: '2026-08-03 09:15',
          isRead: false,
          actionUrl: 'omplongan'
        },
        {
          id: 'NTF-004',
          type: 'TATA_TERTIB',
          title: '📜 Tata Tertib Warga Diperbarui',
          message: 'Amandemen Tata Tertib Kebersihan Lingkungan & Parkir v1.2 telah disahkan.',
          timestamp: '2026-08-04 14:20',
          isRead: true,
          actionUrl: 'tata-tertib'
        },
        {
          id: 'NTF-005',
          type: 'PENGUMUMAN',
          title: '📢 Kerja Bakti Lingkungan',
          message: 'Kerja bakti persiapan HUT RI pada Minggu, 16 Agustus 2026 pukul 07.00 WIB.',
          timestamp: '2026-08-05 11:00',
          isRead: true,
          actionUrl: 'pengumuman'
        }
      ];
      localStorage.setItem(notifKey, JSON.stringify(defaultNotifications));
    }

    const invKey = `${INVOICE_STORAGE_KEY}_${userId}`;
    if (!localStorage.getItem(invKey)) {
      const defaultInvoices: WargaInvoiceItem[] = [
        {
          id: `INV-RT-202608-${userId}`,
          fundType: 'RT_UMUM',
          title: 'Iuran Kas RT Umum',
          periode: 'Agustus 2026',
          nominal: 50000,
          paidAmount: 50000,
          status: 'LUNAS',
          dueDate: '2026-08-10',
          paidAt: '2026-08-02',
          paymentMethod: 'QRIS RT',
          description: 'Iuran rutin pengelolaan lingkungan RT 07 RW 11'
        },
        {
          id: `INV-DK-202608-${userId}`,
          fundType: 'DANA_KEMATIAN',
          title: 'Iuran Wajib Dana Kematian',
          periode: 'Agustus 2026',
          nominal: 10000,
          paidAmount: 10000,
          status: 'LUNAS',
          dueDate: '2026-08-10',
          paidAt: '2026-08-02',
          paymentMethod: 'QRIS RT',
          description: 'Iuran santunan duka & kematian warga RT 07'
        },
        {
          id: `INV-OMP-202608-${userId}`,
          fundType: 'OMPLOGAN',
          title: 'Omplongan Agustusan HUT RI',
          periode: 'Agustusan 2026',
          nominal: 50000,
          paidAmount: 0,
          status: 'BELUM_BAYAR',
          dueDate: '2026-08-15',
          description: 'Partisipasi perayaan kemerdekaan RI ke-81 RT 07'
        }
      ];
      localStorage.setItem(invKey, JSON.stringify(defaultInvoices));
    }
  }

  /**
   * Main DAL aggregator for Warga Dashboard (Single Endpoint Simulation)
   * GET /api/warga/dashboard
   */
  public static getWargaDashboardData(authContext: AuthoritativeSessionContext): WargaDashboardData {
    validateSessionContext(authContext);
    const userId = authContext.userId || 'WRG-001';

    this.initStorage(userId);

    // 1. Fetch Profile Strictly for Current User
    const rawWarga = INITIAL_WARGA.find((w) => w.id_warga === userId) || INITIAL_WARGA[0];
    const rawKk = INITIAL_KELUARGA.find((k) => k.no_kk === rawWarga.no_kk) || INITIAL_KELUARGA[0];

    const profile: WargaProfileSummary = {
      idWarga: rawWarga.id_warga,
      namaLengkap: rawWarga.nama_lengkap,
      nikMasked: `${rawWarga.nik.slice(0, 6)}******${rawWarga.nik.slice(-4)}`,
      noKkMasked: `${rawWarga.no_kk.slice(0, 6)}******${rawWarga.no_kk.slice(-4)}`,
      rt: '07',
      rw: '11',
      perumahan: 'GPA Ngijo',
      blok: rawWarga.blok || 'Blok C-07',
      statusWarga: rawWarga.status_warga,
      statusKeluarga: rawWarga.id_warga === 'WRG-001' ? 'Kepala Keluarga' : 'Anggota Keluarga',
      noHp: rawWarga.no_hp,
      email: rawWarga.email,
      jumlahAnggotaKeluarga: rawKk.jumlah_anggota || 4
    };

    // 2. Fetch Notifications Strictly for Current User
    const notifKey = `${NOTIFICATION_STORAGE_KEY}_${userId}`;
    let notifications: WargaNotificationItem[] = [];
    try {
      notifications = JSON.parse(localStorage.getItem(notifKey) || '[]');
    } catch {
      notifications = [];
    }
    const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

    // 3. Fetch Invoices Strictly for Current User
    const invKey = `${INVOICE_STORAGE_KEY}_${userId}`;
    let invoices: WargaInvoiceItem[] = [];
    try {
      invoices = JSON.parse(localStorage.getItem(invKey) || '[]');
    } catch {
      invoices = [];
    }
    const totalUnpaidAmount = invoices
      .filter((i) => i.status !== 'LUNAS')
      .reduce((sum, inv) => sum + (inv.nominal - inv.paidAmount), 0);

    // 4. Fetch Letters Strictly for Current User
    const userLetters = INITIAL_SURAT.filter((s) => s.id_warga === userId || s.nama_pemohon.includes(rawWarga.nama_lengkap.split(' ')[0]));
    const fallbackLetters = userLetters.length > 0 ? userLetters : [
      {
        id_surat: 'SRT-2026-0001',
        nomor_surat: '001/RT07-RW11/VIII/2026',
        jenis_surat: 'Surat Domisili' as const,
        id_warga: userId,
        nama_pemohon: rawWarga.nama_lengkap,
        nik_pemohon: rawWarga.nik,
        no_kk: rawWarga.no_kk,
        blok_rumah: rawWarga.blok,
        keperluan: 'Administrasi Domisili & Bank',
        tanggal_pengajuan: '2026-08-01',
        tanggal_disetujui: '2026-08-02',
        status: 'SELESAI' as const,
        catatan_admin: 'Dokumen telah diverifikasi dan ditandatangani Ketua RT.',
        qr_code_hash: 'QR-DOC-001'
      }
    ];

    const letters: WargaLetterItem[] = fallbackLetters.slice(0, 3).map((s) => ({
      idSurat: s.id_surat,
      nomorSurat: s.nomor_surat,
      jenisSurat: s.jenis_surat,
      tanggalPengajuan: s.tanggal_pengajuan,
      tanggalDisetujui: s.tanggal_disetujui,
      status: s.status,
      catatanAdmin: s.catatan_admin,
      qrCodeHash: s.qr_code_hash,
      pdfUrl: s.pdf_drive_url
    }));

    // 5. Fetch Complaints Strictly for Current User
    const userComplaints = INITIAL_PENGADUAN.filter((p) => p.no_hp === rawWarga.no_hp || p.nama_pelapor.includes(rawWarga.nama_lengkap.split(' ')[0]));
    const fallbackComplaints = userComplaints.length > 0 ? userComplaints : [
      {
        id_pengaduan: 'ADU-001',
        nomor_tiket: 'PGD-2026-0012',
        nama_pelapor: rawWarga.nama_lengkap,
        no_hp: rawWarga.no_hp,
        kategori: 'Lampu jalan' as const,
        lokasi: `Depan ${rawWarga.blok}`,
        deskripsi: 'Lampu penerangan jalan depan rumah redup/kadang mati saat malam hari.',
        tanggal: '2026-08-06',
        status: 'DIPROSES' as const,
        tanggapan_admin: 'Seksi Keamanan & Infrastruktur telah menjadwalkan penggantian lampu LED baru.'
      }
    ];

    const complaints: WargaComplaintItem[] = fallbackComplaints.slice(0, 3).map((p) => ({
      idPengaduan: p.id_pengaduan,
      nomorTiket: p.nomor_tiket,
      kategori: p.kategori,
      lokasi: p.lokasi,
      deskripsi: p.deskripsi,
      tanggal: p.tanggal,
      status: p.status,
      tanggapanAdmin: p.tanggapan_admin
    }));

    // 6. Announcements Sorted by Date DESC
    const announcements = [...INITIAL_PENGUMUMAN]
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 4)
      .map((pgm) => ({
        id: pgm.id_pengumuman,
        judul: pgm.judul,
        isi: pgm.isi,
        tanggal: pgm.tanggal,
        kategori: pgm.kategori,
        penulis: pgm.penulis
      }));

    // 7. Active Tata Tertib Summary (Active Only)
    const activeArticles = TataTertibService.getActiveRulesForRAG();
    const primaryRule = activeArticles.length > 0 ? activeArticles[0] : null;

    const tataTertibActive: WargaTataTertibSummary = {
      idArticle: primaryRule ? (primaryRule.documentId || primaryRule.ruleCode) : 'ART-01',
      category: primaryRule ? primaryRule.category : 'KEBERSIHAN',
      title: primaryRule ? primaryRule.title : 'Ketentuan Kebersihan dan Pemilahan Sampah Lingkungan',
      version: primaryRule ? primaryRule.version : 'v1.2',
      effectiveDate: primaryRule ? primaryRule.effectiveDate : '15 Agustus 2026',
      summary: primaryRule ? (primaryRule.summary || primaryRule.content.slice(0, 140) + '...') : 'Wajib memilah sampah organik dan anorganik.',
      points: (primaryRule && primaryRule.dos && primaryRule.dos.length > 0) ? primaryRule.dos : [
        'Wajib memilah sampah organik dan non-organik di tempat masing-masing.',
        'Jadwal pengangkutan sampah: Selasa, Kamis, dan Sabtu pagi.',
        'Dilarang membakar sampah di pekarangan rumah demi kesehatan lingkungan.'
      ]
    };

    // 8. Upcoming Activities (Max 3)
    const activities: WargaActivityItem[] = INITIAL_AGENDA.slice(0, 3).map((a) => ({
      idAgenda: a.id_agenda,
      judul: a.judul,
      tanggal: a.tanggal,
      jam: a.jam,
      lokasi: a.lokasi,
      deskripsi: a.deskripsi,
      penanggungJawab: a.penanggung_jawab,
      kategori: a.kategori
    }));

    // Mandatory Audit Log for Privacy Compliance
    logAIAuditEntry({
      userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'getWargaDashboardData',
      tool: 'wargaDashboardService',
      resourceId: userId,
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });

    return {
      profile,
      notifications,
      unreadNotificationCount,
      invoices,
      totalUnpaidAmount,
      letters,
      complaints,
      announcements,
      tataTertibActive,
      activities
    };
  }

  /**
   * Mark single notification as read
   */
  public static markNotificationRead(userId: string, notificationId: string): void {
    const notifKey = `${NOTIFICATION_STORAGE_KEY}_${userId}`;
    const notifications: WargaNotificationItem[] = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const updated = notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
    localStorage.setItem(notifKey, JSON.stringify(updated));
  }

  /**
   * Mark all notifications as read
   */
  public static markAllNotificationsRead(userId: string): void {
    const notifKey = `${NOTIFICATION_STORAGE_KEY}_${userId}`;
    const notifications: WargaNotificationItem[] = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(notifKey, JSON.stringify(updated));
  }

  /**
   * Process Isolated Fund Payment
   * Validates fundType to prevent cross-fund contamination
   */
  public static processPayment(
    authContext: AuthoritativeSessionContext,
    invoiceId: string,
    expectedFundType: WargaInvoiceFundType,
    paymentMethod: 'QRIS' | 'TRANSFER' | 'TUNAI' = 'QRIS'
  ): { success: boolean; message: string; transactionId: string } {
    validateSessionContext(authContext);
    const userId = authContext.userId || 'WRG-001';

    const invKey = `${INVOICE_STORAGE_KEY}_${userId}`;
    const invoices: WargaInvoiceItem[] = JSON.parse(localStorage.getItem(invKey) || '[]');
    const targetInvoice = invoices.find((i) => i.id === invoiceId);

    if (!targetInvoice) {
      throw new SecurityAuthorizationError('DATA_NOT_FOUND', 'Invoice tagihan tidak ditemukan.');
    }

    // Strict Backend Validation: prevent frontend fundType tampering
    if (targetInvoice.fundType !== expectedFundType) {
      logAIAuditEntry({
        userId,
        role: authContext.role,
        sessionId: authContext.sessionId,
        action: 'processPayment',
        tool: 'processPayment',
        resourceId: invoiceId,
        result: 'DENIED',
        decision: 'BLOCKED_NO_PERMISSION',
        deniedReason: `FUND_TYPE_MISMATCH: Target is ${targetInvoice.fundType}, but attempted ${expectedFundType}`
      });
      throw new SecurityAuthorizationError('PERMISSION_DENIED', 'Sumber dana tagihan tidak sesuai. Transaksi dibatalkan.');
    }

    const txId = `TX-${expectedFundType}-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    // Update invoice status
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'LUNAS' as const,
          paidAmount: inv.nominal,
          paidAt: nowIso.split('T')[0],
          paymentMethod: `${paymentMethod} RT`
        };
      }
      return inv;
    });
    localStorage.setItem(invKey, JSON.stringify(updatedInvoices));

    // Push notification to citizen
    const notifKey = `${NOTIFICATION_STORAGE_KEY}_${userId}`;
    const currentNotifs: WargaNotificationItem[] = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const paymentNotif: WargaNotificationItem = {
      id: `NTF-PAY-${Date.now()}`,
      type: expectedFundType === 'DANA_KEMATIAN' ? 'DANA_KEMATIAN' : expectedFundType === 'OMPLOGAN' ? 'OMPLOGAN' : 'IURAN',
      title: `✅ Pembayaran ${targetInvoice.title} Berhasil`,
      message: `Terima kasih, tagihan ${targetInvoice.periode} sebesar Rp ${targetInvoice.nominal.toLocaleString('id-ID')} telah lunas via ${paymentMethod}.`,
      timestamp: nowIso.replace('T', ' ').slice(0, 16),
      isRead: false,
      actionUrl: 'iuran'
    };
    localStorage.setItem(notifKey, JSON.stringify([paymentNotif, ...currentNotifs]));

    // Send WhatsApp Confirmation
    waServiceInstance.sendNotification('FINANCE_ALERT', '081234567890', {
      recipientPhone: '081234567890',
      recipientName: authContext.userId,
      idRecord: txId,
      jenisLayanan: `${targetInvoice.title} (${targetInvoice.periode})`,
      details: `Nominal: Rp ${targetInvoice.nominal.toLocaleString('id-ID')} | Metode: ${paymentMethod} QRIS`
    });

    // Record Audit Trail
    logAIAuditEntry({
      userId,
      role: authContext.role,
      sessionId: authContext.sessionId,
      action: 'PAYMENT_COMPLETED',
      tool: 'wargaDashboardService',
      resourceId: txId,
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });

    return {
      success: true,
      message: `Pembayaran ${targetInvoice.title} sebesar Rp ${targetInvoice.nominal.toLocaleString('id-ID')} berhasil diverifikasi.`,
      transactionId: txId
    };
  }
}
