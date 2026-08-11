// SMART RT 07 RW 11 GPA NGIJO - WhatsApp Automation Service
// Production Gateway Adapter via Google Apps Script Backend (TAHAP 6D Architecture)
// Zero secrets, tokens, or direct gateway URLs in client code

import { syncDataWithGAS } from './apiService';

export type WAEvent =
  | 'SURAT_RECEIVED'
  | 'SURAT_VERIFIED'
  | 'SURAT_APPROVED'
  | 'SURAT_COMPLETED'
  | 'PENGADUAN_RECEIVED'
  | 'PENGADUAN_COMPLETED'
  | 'PENGUMUMAN_IMPORTANT'
  | 'IURAN_REMINDER';

export interface WALogEntry {
  id: string;
  timestamp: string;
  recipientPhone: string;
  event: WAEvent;
  message: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRY';
  attempts: number;
  provider: string;
  errorMessage?: string;
}

export interface WAPayload {
  recipientPhone: string;
  recipientName?: string;
  idRecord?: string;
  jenisLayanan?: string;
  statusText?: string;
  details?: string;
  bulanTahun?: string;
  nominal?: string;
}

const STORAGE_KEY_WA_LOGS = 'SMART_RT_WA_LOGS';

// Validate Indonesian Phone Number
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Must start with 08 or 628 and be between 10 to 15 digits
  return /^(08|628)\d{8,12}$/.test(cleaned);
};

// Format phone number to international 628xxx format
export const formatPhoneInternational = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

// Message Builder Engine
export const buildMessage = (event: WAEvent, payload: WAPayload): string => {
  const header = `Assalamu'alaikum warahmatullahi wabarakatuh.\n\n*RT 07 RW 11 Perum GPA Ngijo*\nKarangploso, Kabupaten Malang\n-----------------------------------------`;
  const footer = `-----------------------------------------\nSilakan cek melalui *Portal Warga SMART RT*:\nhttps://smart-rt07-gpa-ngijo.app\n\n_Terima kasih._\n*Bersama Melayani, Bersama Membangun.*`;

  switch (event) {
    case 'SURAT_RECEIVED':
      return `${header}\n\n📨 *Pengajuan Surat Diterima*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Warga'}*,\nPengajuan surat Anda telah kami terima di sistem.\n\n📌 *Nomor Pengajuan:* ${payload.idRecord || '-'}\n📄 *Jenis Surat:* ${payload.jenisLayanan || '-'}\n⏳ *Status:* DIAJUKAN (Menunggu Verifikasi Sekretaris)\n\n${footer}`;

    case 'SURAT_VERIFIED':
      return `${header}\n\n🔍 *Surat Berhasil Diverifikasi*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Warga'}*,\nBerkas permohonan surat Anda telah diverifikasi oleh Sekretaris RT.\n\n📌 *Nomor Surat:* ${payload.idRecord || '-'}\n📄 *Jenis Surat:* ${payload.jenisLayanan || '-'}\n status: DIVERIFIKASI (Menunggu Tanda Tangan Ketua RT)\n\n${footer}`;

    case 'SURAT_APPROVED':
      return `${header}\n\n✍️ *Surat Disetujui Ketua RT*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Warga'}*,\nPermohonan surat Anda telah disetujui dan ditandatangani secara digital.\n\n📌 *Nomor Surat:* ${payload.idRecord || '-'}\n📄 *Jenis Surat:* ${payload.jenisLayanan || '-'}\n✅ *Status:* DISETUJUI / SELESAI\n\n${footer}`;

    case 'SURAT_COMPLETED':
      return `${header}\n\n✅ *Surat Pengantar Ready / Selesai*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Warga'}*,\nDokumen Surat Pengantar Resmi Anda telah terbit dan siap diunduh (Format PDF) beserta QR Code Hash Verifikasi Valid.\n\n📌 *Nomor Surat:* ${payload.idRecord || '-'}\n📄 *Jenis Surat:* ${payload.jenisLayanan || '-'}\n\n${footer}`;

    case 'PENGADUAN_RECEIVED':
      return `${header}\n\n🚨 *Laporan Pengaduan Diterima*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Pelapor'}*,\nLaporan pengaduan lingkungan Anda telah terdaftar di sistem kami.\n\n🎫 *Nomor Tiket:* ${payload.idRecord || '-'}\n🏷️ *Kategori:* ${payload.jenisLayanan || 'Pengaduan Lingkungan'}\n📝 *Deskripsi:* ${payload.details || '-'}\n\nPengurus RT 07 sedang menindaklanjuti laporan Anda.\n\n${footer}`;

    case 'PENGADUAN_COMPLETED':
      return `${header}\n\n🎉 *Laporan Pengaduan Selesai Ditangani*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Pelapor'}*,\nLaporan pengaduan Anda dengan nomor tiket *${payload.idRecord || '-'}* telah SELESAI ditindaklanjuti oleh Pengurus RT 07.\n\n💬 *Catatan Penanganan:* ${payload.details || 'Penanganan lokasi telah diselesaikan.'}\n\n${footer}`;

    case 'PENGUMUMAN_IMPORTANT':
      return `${header}\n\n📢 *PENGUMUMAN PENTING RT 07*\n\nYth. Seluruh Warga RT 07 RW 11 Perum GPA Ngijo,\n\n📌 *Judul:* ${payload.jenisLayanan || 'Informasi Warga'}\n\n${payload.details || '-'}\n\n${footer}`;

    case 'IURAN_REMINDER':
      return `${header}\n\n💳 *Pengingat Iuran Bulanan RT 07*\n\nYth. Bpk/Ibu *${payload.recipientName || 'Kepala Keluarga'}*,\nMengingatkan pembayaran Iuran Bulanan Kebersihan & Keamanan RT 07.\n\n📅 *Periode:* ${payload.bulanTahun || 'Bulan Ini'}\n💵 *Nominal:* Rp ${payload.nominal || '50.000'}\n💳 *Metode:* QRIS RT / Transfer / Tunai via Petugas Kas\n\n${footer}`;

    default:
      return `${header}\n\nNotifikasi SMART RT 07.\n\n${footer}`;
  }
};

// Local storage logger helper
export const getWALogs = (): WALogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WA_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveWALog = (log: WALogEntry): void => {
  const current = getWALogs();
  const updated = [log, ...current].slice(0, 100); // keep last 100 logs
  localStorage.setItem(STORAGE_KEY_WA_LOGS, JSON.stringify(updated));
};

// WhatsApp Service Abstraction Class (Server-Routed, Fail-Closed, Zero Client Secrets)
export class WhatsAppService {
  private providerName: string;

  constructor(providerName = 'WhatsApp Gateway (GAS ScriptProperties Adapter)') {
    this.providerName = providerName;
  }

  // Validate phone number before sending
  public validate(phone: string): { valid: boolean; reason?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: false, reason: 'Nomor HP/WA kosong' };
    }
    if (!isValidPhoneNumber(phone)) {
      return { valid: false, reason: 'Format nomor HP tidak valid (Harus 08xx / 628xx 10-15 digit)' };
    }
    return { valid: true };
  }

  // Send WA message via Google Apps Script Backend Gateway Adapter
  public async sendWhatsApp(
    phone: string,
    message: string,
    event: WAEvent = 'SURAT_RECEIVED',
    idRecord?: string,
    recipientName?: string
  ): Promise<{ success: boolean; attempts: number; error?: string; messageId?: string }> {
    const formattedPhone = formatPhoneInternational(phone);

    try {
      // Direct call to Google Apps Script backend. GAS will read WHATSAPP_API_URL and WHATSAPP_API_TOKEN from ScriptProperties.
      const res = await syncDataWithGAS('sendWhatsApp', {
        recipientPhone: formattedPhone,
        recipientName: recipientName || 'Warga RT 07',
        message,
        event,
        idRecord
      });

      if (res && res.success) {
        return {
          success: true,
          attempts: res.data?.attempts || 1,
          messageId: res.data?.messageId || `MSG-${Date.now()}`
        };
      } else {
        return {
          success: false,
          attempts: res?.data?.attempts || 1,
          error: res?.message || res?.errorCode || 'WHATSAPP_SEND_FAILED'
        };
      }
    } catch (err: any) {
      // Fail closed on error - never fake success
      return {
        success: false,
        attempts: 1,
        error: err.message || 'Gagal terhubung ke WhatsApp Gateway Backend'
      };
    }
  }

  // High-level notification trigger
  public async sendNotification(
    event: WAEvent,
    recipientPhone: string,
    payload: WAPayload
  ): Promise<{ success: boolean; message: string; log: WALogEntry }> {
    const val = this.validate(recipientPhone);
    if (!val.valid) {
      const failedLog: WALogEntry = {
        id: `WALOG-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        recipientPhone: recipientPhone || 'N/A',
        event,
        message: 'Gagal Validasi: ' + (val.reason || ''),
        status: 'FAILED',
        attempts: 0,
        provider: this.providerName,
        errorMessage: val.reason
      };
      saveWALog(failedLog);
      return { success: false, message: `Nomor WA tidak valid: ${val.reason}`, log: failedLog };
    }

    const messageText = buildMessage(event, payload);
    const sendResult = await this.sendWhatsApp(
      recipientPhone,
      messageText,
      event,
      payload.idRecord,
      payload.recipientName
    );

    const logEntry: WALogEntry = {
      id: `WALOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      recipientPhone: formatPhoneInternational(recipientPhone),
      event,
      message: messageText,
      status: sendResult.success ? 'SUCCESS' : 'FAILED',
      attempts: sendResult.attempts,
      provider: this.providerName,
      errorMessage: sendResult.error
    };

    saveWALog(logEntry);

    return {
      success: sendResult.success,
      message: sendResult.success
        ? `Notifikasi WA (${event}) berhasil dikirim via WhatsApp Gateway ke ${formatPhoneInternational(recipientPhone)}!`
        : `Gagal mengirim WA: ${sendResult.error || 'Terjadi kesalahan pada gateway'}`,
      log: logEntry
    };
  }
}

export const waServiceInstance = new WhatsAppService();

