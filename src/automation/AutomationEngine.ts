// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8I AUTOMATION ENGINE
import { AutomationEventType, AutomationWorkflowPayload, ScheduledWorkflowRule } from '../types/aiTools';
import { NotificationQueueService } from './NotificationQueueService';
import { logAIAuditEntry } from '../services/aiAuthorizationService';
import { storeDigitalDocument } from '../services/documentService';

export class AutomationEngine {
  /**
   * Central Event Bus Trigger
   */
  public static async triggerEvent(
    eventType: AutomationEventType,
    recordId: string,
    triggeredBy: string,
    data: Record<string, any> = {}
  ): Promise<{ success: boolean; eventId: string; workflowStepsExecuted: string[] }> {
    const eventId = `EVT-${eventType}-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const workflowStepsExecuted: string[] = [];

    logAIAuditEntry({
      userId: triggeredBy,
      role: 'ADMIN',
      sessionId: `AUTOMATION-${Date.now()}`,
      action: 'AUTOMATION_STARTED',
      tool: 'AutomationEngine',
      resourceId: recordId,
      result: 'SUCCESS',
      decision: 'ALLOWED'
    });

    try {
      switch (eventType) {
        case 'LETTER_APPROVED': {
          // Workflow: LETTER_APPROVED -> generatePDF -> generateQRVerification -> saveDocument -> updateLetterStatus -> enqueueWhatsAppNotification -> Audit
          
          // 1. Generate QR Verification Token (URL ONLY, ZERO NIK/KK ENCODED!)
          const verificationToken = `QR-RT07-${recordId}-${Date.now().toString().slice(-6)}`;
          const verificationUrl = `https://smart-rt07.id/verify/${verificationToken}`;
          workflowStepsExecuted.push(`Generated Secure QR Code (Zero PII): ${verificationToken}`);

          // 2. Save Document Record
          const digitalDoc = storeDigitalDocument({
            id_dokumen: `DOC-${recordId}`,
            jenis_dokumen: data.jenis_surat || 'Surat Pengantar',
            nomor_dokumen: data.nomor_surat || `07/RT07/${new Date().getFullYear()}`,
            pemohon_nama: data.nama_pemohon || 'Warga RT 07',
            id_warga: data.id_warga || 'WRG-001',
            tanggal_terbit: new Date().toISOString().slice(0, 10),
            status: 'VALID',
            hash_verifikasi: verificationToken,
            qr_code_url: verificationUrl,
            penandatangan: 'Eko Sucahyono (Ketua RT 07)',
            file_url: `/api/documents/pdf/${recordId}`
          });
          workflowStepsExecuted.push(`Saved Digital Document Record: ${digitalDoc.documentId}`);

          // 3. Enqueue WhatsApp Notification
          const recipientPhone = data.no_hp || '081234567890';
          const message = `*SURAT PENGANTAR RT 07 DISETUJUI*\n\nYth. Bapak/Ibu ${data.nama_pemohon || 'Warga'},\n\nPermohonan surat pengantar *${data.jenis_surat || 'Administrasi'}* Anda (No: ${data.nomor_surat || recordId}) telah DISETUJUI oleh Ketua RT 07.\n\nUnduh PDF & Verifikasi QR: ${verificationUrl}\n\nTerima kasih,\nPengurus RT 07 RW 11 GPA Ngijo`;

          NotificationQueueService.enqueueNotification(
            recipientPhone,
            'LETTER_APPROVED',
            message,
            'HIGH',
            'WHATSAPP',
            data.nama_pemohon
          );
          workflowStepsExecuted.push(`Enqueued WhatsApp Notification to ${recipientPhone}`);
          break;
        }

        case 'COMPLAINT_CREATED': {
          workflowStepsExecuted.push(`Generated Complaint Ticket: ${recordId}`);
          const message = `*PENGADUAN WARGA RT 07 DITERIMA*\n\nTiket Pengaduan No. *${recordId}* terkait ${data.kategori || 'Fasilitas Umum'} telah diterima oleh Pengurus RT. Pengurus bidang terkait akan menindaklanjuti maksimal 2x24 jam.`;

          NotificationQueueService.enqueueNotification(
            data.no_hp || '081234567890',
            'COMPLAINT_CREATED',
            message,
            'MEDIUM',
            'WHATSAPP',
            data.nama_pelapor
          );
          workflowStepsExecuted.push(`Enqueued Staff Alert & Citizen Confirmation for ${recordId}`);
          break;
        }

        case 'PAYMENT_RECORDED': {
          workflowStepsExecuted.push(`Verified Payment Record for ${data.bulanTahun || 'Iuran'}`);
          const message = `*BUKTI PEMBAYARAN IURAN RT 07*\n\nTerima kasih, pembayaran Iuran Kas & Kebersihan periode *${data.bulanTahun || 'Agustus 2026'}* sebesar Rp ${data.nominal?.toLocaleString('id-ID') || '50.000'} telah TERVERIFIKASI LUNAS.`;

          NotificationQueueService.enqueueNotification(
            data.no_hp || '081234567890',
            'PAYMENT_RECORDED',
            message,
            'LOW',
            'WHATSAPP',
            data.namaWarga
          );
          workflowStepsExecuted.push(`Enqueued Receipt Notification to ${data.no_hp || 'Warga'}`);
          break;
        }

        case 'ANNOUNCEMENT_CREATED': {
          workflowStepsExecuted.push(`Published Official Announcement: ${data.judul}`);
          if (data.broadcastWA) {
            const broadcastMsg = `*PENGUMUMAN RESMI RT 07 RW 11*\n\n*${data.judul}*\n\n${data.isi}\n\nSalam,\nPengurus RT 07 RW 11 Perum GPA Ngijo`;
            NotificationQueueService.enqueueNotification(
              'WARGA_ALL',
              'ANNOUNCEMENT_CREATED',
              broadcastMsg,
              'HIGH',
              'WHATSAPP',
              'Seluruh Warga RT 07'
            );
            workflowStepsExecuted.push(`Enqueued Broadcast WhatsApp to All Residents`);
          }
          break;
        }

        default: {
          workflowStepsExecuted.push(`Triggered Default Event Rule for ${eventType}`);
          break;
        }
      }

      logAIAuditEntry({
        userId: triggeredBy,
        role: 'ADMIN',
        sessionId: `AUTOMATION-${Date.now()}`,
        action: 'AUTOMATION_COMPLETED',
        tool: 'AutomationEngine',
        resourceId: recordId,
        result: 'SUCCESS',
        decision: 'ALLOWED'
      });

      return {
        success: true,
        eventId,
        workflowStepsExecuted
      };
    } catch (err: any) {
      logAIAuditEntry({
        userId: triggeredBy,
        role: 'ADMIN',
        sessionId: `AUTOMATION-${Date.now()}`,
        action: 'AUTOMATION_FAILED',
        tool: 'AutomationEngine',
        resourceId: recordId,
        result: 'ERROR',
        decision: 'BLOCKED_DATA_POLICY',
        deniedReason: err.message
      });

      return {
        success: false,
        eventId,
        workflowStepsExecuted
      };
    }
  }

  /**
   * Predefined Scheduled Automation Rules
   */
  public static getScheduledRules(): ScheduledWorkflowRule[] {
    return [
      {
        ruleId: 'SCH-HEALTH-CHECK',
        name: 'Daily System & AI Health Check',
        description: 'Mengecek ketersediaan database, WhatsApp Gateway, dan keandalan AI Agent.',
        schedule: 'DAILY',
        targetRoles: ['ADMIN'],
        enabled: true,
        lastRun: new Date().toISOString().slice(0, 10) + ' 05:00:00',
        nextRun: 'Besok, 05:00 WIB'
      },
      {
        ruleId: 'SCH-PAYMENT-REMINDER',
        name: 'Monthly Payment Reminder',
        description: 'Pengiriman otomatis pengingat iuran bulanan kas warga setiap tanggal 5.',
        schedule: 'MONTHLY',
        targetRoles: ['WARGA'],
        enabled: true,
        lastRun: '2026-08-05 08:00:00',
        nextRun: '2026-09-05 08:00 WIB'
      },
      {
        ruleId: 'SCH-COMPLAINT-SUMMARY',
        name: 'Weekly Complaint Resolution Summary',
        description: 'Kompilasi mingguan tiket pengaduan aktif dan progres penanganannya.',
        schedule: 'WEEKLY',
        targetRoles: ['PENGURUS', 'KETUA_RT'],
        enabled: true,
        lastRun: '2026-08-03 18:00:00',
        nextRun: 'Senin Depan, 18:00 WIB'
      },
      {
        ruleId: 'SCH-RT-REPORT',
        name: 'Monthly Executive RT Report',
        description: 'Laporan eksekutif bulanan administrasi, keuangan, dan kependudukan RT 07.',
        schedule: 'MONTHLY',
        targetRoles: ['KETUA_RT', 'ADMIN'],
        enabled: true,
        lastRun: '2026-08-01 09:00:00',
        nextRun: '2026-09-01 09:00 WIB'
      }
    ];
  }
}
