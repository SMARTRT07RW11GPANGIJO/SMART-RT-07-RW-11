// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Event Reminder & WhatsApp Messaging Service

import {
  EventReminder,
  KegiatanRT,
  ReminderTiming,
  ReminderChannel,
  WhatsAppDeliveryStatus,
  WhatsAppEventTrigger,
  ActorSession
} from '../types/activity';
import { activityCalendarService } from './activityCalendarService';

const STORAGE_KEY_REMINDERS = 'smart_rt_event_reminders_v1';

class EventReminderService {
  private reminders: EventReminder[] = [];
  private isWhatsAppGatewayActive: boolean = false; // Safe fallback: default NOT_CONFIGURED

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
      if (raw) {
        this.reminders = JSON.parse(raw);
      }
    } catch {
      this.reminders = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(this.reminders));
    } catch (e) {
      console.error('Failed to save reminders', e);
    }
  }

  public setGatewayStatus(active: boolean) {
    this.isWhatsAppGatewayActive = active;
  }

  public getGatewayStatus(): boolean {
    return this.isWhatsAppGatewayActive;
  }

  public getRemindersForEvent(kegiatanId: string): EventReminder[] {
    return this.reminders.filter((r) => r.kegiatanId === kegiatanId);
  }

  // Format Official WhatsApp Broadcast Message Template
  public formatWhatsAppMessage(trigger: WhatsAppEventTrigger, event: KegiatanRT, customNote?: string): string {
    const formattedDate = new Date(event.tanggalMulai).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let header = '📢 *PEMBERITAHUAN KEGIATAN RT 07 RW 11 GPA NGIJO*';
    switch (trigger) {
      case 'EVENT_CREATED':
        header = '📋 *AGENDA KEGIATAN BARU RT 07 RW 11*';
        break;
      case 'EVENT_APPROVED':
        header = '✅ *PENGUMUMAN RESMI KEGIATAN RT 07 RW 11*';
        break;
      case 'EVENT_POSTPONED':
        header = '⚠️ *PERUBAHAN JADWAL / PENUNDAAN KEGIATAN RT 07*';
        break;
      case 'EVENT_CANCELLED':
        header = '⛔ *PEMBERITAHUAN PEMBATALAN KEGIATAN RT 07*';
        break;
      case 'EVENT_REMINDER':
        header = '⏰ *PENGINGAT (REMINDER) KEGIATAN RT 07*';
        break;
      case 'EVENT_STARTED':
        header = '🔴 *KEGIATAN SEDANG BERLANGSUNG - RT 07*';
        break;
      case 'EVENT_COMPLETED':
        header = '🎉 *LAPORAN SELESAI KEGIATAN RT 07*';
        break;
    }

    let body = `${header}\n\n`;
    body += `📌 *Kegiatan:* ${event.judul}\n`;
    body += `🏷️ *Kategori:* ${event.kategori.replace(/_/g, ' ')}\n`;
    body += `📅 *Hari/Tgl:* ${formattedDate}\n`;
    body += `⏰ *Waktu:* ${event.waktuMulai} - ${event.waktuSelesai} WIB\n`;
    body += `📍 *Lokasi:* ${event.lokasi}\n`;
    body += `👤 *Penanggung Jawab:* ${event.penanggungJawabNama}\n`;
    body += `👥 *Sasaran Peserta:* ${event.targetPeserta}\n\n`;
    body += `📝 *Deskripsi:* ${event.deskripsi}\n`;

    if (trigger === 'EVENT_POSTPONED' && event.alasanPenundaan) {
      body += `\n⚠️ *Alasan Penundaan:* ${event.alasanPenundaan}\n`;
    }
    if (trigger === 'EVENT_CANCELLED' && event.alasanPembatalan) {
      body += `\n⛔ *Alasan Pembatalan:* ${event.alasanPembatalan}\n`;
    }
    if (customNote) {
      body += `\n💬 *Catatan Khusus:* ${customNote}\n`;
    }

    body += `\n_Pesan otomatis dari Sistem Informasi SMART RT 07 RW 11 Perum Graha Pelita Asri Ngijo._`;
    return body;
  }

  // Create WhatsApp Web direct link for manual broadcasting
  public generateWhatsAppShareUrl(event: KegiatanRT, phone?: string): string {
    const text = this.formatWhatsAppMessage('EVENT_APPROVED', event);
    const encodedText = encodeURIComponent(text);
    if (phone) {
      const cleanPhone = phone.replace(/^0/, '62').replace(/[^\d]/g, '');
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  // Schedule or Send Reminder
  public createReminder(
    actor: ActorSession,
    kegiatanId: string,
    timing: ReminderTiming,
    channel: ReminderChannel,
    targetPhone?: string
  ): EventReminder {
    const event = activityCalendarService.getKegiatanById(actor, kegiatanId);
    const message = event
      ? this.formatWhatsAppMessage('EVENT_REMINDER', event, `Pengingat jadwal pelaksanaan ${timing}`)
      : `Pengingat kegiatan ${kegiatanId} (${timing})`;

    let deliveryStatus: WhatsAppDeliveryStatus = 'NOT_CONFIGURED';
    if (channel === 'IN_APP') {
      deliveryStatus = 'SENT';
    } else if (channel === 'WHATSAPP') {
      deliveryStatus = this.isWhatsAppGatewayActive ? 'QUEUED' : 'NOT_CONFIGURED';
    }

    const reminder: EventReminder = {
      id: `REM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      kegiatanId,
      timing,
      channel,
      targetPhone,
      message,
      scheduledAt: new Date().toISOString(),
      status: deliveryStatus,
      sentAt: deliveryStatus === 'SENT' ? new Date().toISOString() : undefined,
      errorMessage:
        deliveryStatus === 'NOT_CONFIGURED' ? 'WhatsApp Gateway belum aktif (Gunakan fallback share link)' : undefined
    };

    this.reminders.unshift(reminder);
    this.saveToStorage();

    return reminder;
  }

  // Generate standard reminders for an approved event
  public generateStandardReminders(actor: ActorSession, kegiatanId: string) {
    const timings: ReminderTiming[] = ['H-7', 'H-3', 'H-1', 'H-0'];
    timings.forEach((t) => {
      this.createReminder(actor, kegiatanId, t, 'IN_APP');
      this.createReminder(actor, kegiatanId, t, 'WHATSAPP');
    });
  }
}

export const eventReminderService = new EventReminderService();
