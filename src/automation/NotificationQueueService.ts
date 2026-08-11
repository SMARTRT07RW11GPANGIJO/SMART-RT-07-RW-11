// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8I NOTIFICATION QUEUE SERVICE
import { NotificationQueueItem, AutomationEventType, NotificationPriority, NotificationChannel } from '../types/aiTools';
import { waServiceInstance } from '../services/whatsappService';

const NOTIFICATION_QUEUE_STORAGE_KEY = 'SMART_RT_NOTIFICATION_QUEUE_V1';

export class NotificationQueueService {
  private static getStoredQueue(): NotificationQueueItem[] {
    try {
      const raw = localStorage.getItem(NOTIFICATION_QUEUE_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse notification queue:', e);
      return [];
    }
  }

  private static saveQueue(items: NotificationQueueItem[]): void {
    try {
      localStorage.setItem(NOTIFICATION_QUEUE_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save notification queue:', e);
    }
  }

  public static enqueueNotification(
    recipient: string,
    event: AutomationEventType,
    message: string,
    priority: NotificationPriority = 'MEDIUM',
    channel: NotificationChannel = 'WHATSAPP',
    recipientName?: string,
    maxAttempts: number = 3
  ): NotificationQueueItem {
    const queue = this.getStoredQueue();
    const newItem: NotificationQueueItem = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipient,
      recipientName,
      channel,
      event,
      message,
      priority,
      status: 'PENDING',
      attempts: 0,
      maxAttempts,
      scheduledAt: new Date().toISOString()
    };

    queue.unshift(newItem);
    this.saveQueue(queue.slice(0, 300)); // Keep last 300 items
    return newItem;
  }

  public static getQueueItems(): NotificationQueueItem[] {
    return this.getStoredQueue();
  }

  public static async processNotificationQueue(): Promise<{ processed: number; successCount: number; failedCount: number }> {
    const queue = this.getStoredQueue();
    const pendingItems = queue.filter((item) => item.status === 'PENDING' || (item.status === 'FAILED' && item.attempts < item.maxAttempts));

    let successCount = 0;
    let failedCount = 0;

    for (const item of pendingItems) {
      item.status = 'PROCESSING';
      item.attempts += 1;
      this.saveQueue(queue);

      try {
        if (item.channel === 'WHATSAPP') {
          const waResult = await waServiceInstance.sendWhatsApp(item.recipient, item.message, 'SURAT_APPROVED', item.id);
          if (waResult.success) {
            item.status = 'SENT';
            item.sentAt = new Date().toISOString();
            item.error = undefined;
            successCount++;
          } else {
            item.error = waResult.error || 'WhatsApp Dispatch Failed';
            if (item.attempts >= item.maxAttempts) {
              item.status = 'FAILED';
              failedCount++;
            } else {
              item.status = 'PENDING'; // Ready for retry
            }
          }
        } else {
          // System / Email mock dispatch
          item.status = 'SENT';
          item.sentAt = new Date().toISOString();
          successCount++;
        }
      } catch (err: any) {
        item.error = err.message || 'System Dispatch Exception';
        if (item.attempts >= item.maxAttempts) {
          item.status = 'FAILED';
          failedCount++;
        } else {
          item.status = 'PENDING';
        }
      }

      this.saveQueue(queue);
    }

    return {
      processed: pendingItems.length,
      successCount,
      failedCount
    };
  }

  public static clearQueue(): void {
    localStorage.removeItem(NOTIFICATION_QUEUE_STORAGE_KEY);
  }
}
