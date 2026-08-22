// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP NOTIFICATION GATEWAY ADAPTER v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { OutboundQueueItem, ExternalActorSession } from '../../../types/externalIntegration';
import { ExternalDataSanitizer } from '../externalDataSanitizer';
import { CircuitBreakerService } from '../circuitBreakerService';

export class WhatsappGatewayAdapter {
  private static queue: OutboundQueueItem[] = [];
  private static deliveryHistory: OutboundQueueItem[] = [];

  /**
   * Enqueue an outbound notification message (server-authoritative events only)
   */
  static enqueueMessage(
    actor: ExternalActorSession,
    templateId: string,
    recipientPhone: string,
    params: Record<string, any>,
    idempotencyKey: string
  ): { success: boolean; message: string; queueId?: string } {
    // 1. RBAC Check
    if (actor.role === 'PUBLIC') {
      return {
        success: false,
        message: '403 Forbidden: Public role tidak diizinkan mengirim notifikasi WhatsApp.'
      };
    }

    // 2. Idempotency check in queue
    const existing = this.queue.find(q => q.idempotencyKey === idempotencyKey);
    if (existing) {
      return {
        success: true,
        message: 'Pesan telah terdaftar sebelumnya (Idempotent Hit).',
        queueId: existing.id
      };
    }

    // 3. Strict payload sanitization
    const rawPayload = {
      template_id: templateId,
      recipient_phone: recipientPhone,
      params
    };

    const sanitized = ExternalDataSanitizer.sanitizeOutboundPayload('WHATSAPP_GATEWAY', rawPayload);
    if (!sanitized.isValid) {
      return {
        success: false,
        message: `Payload ditolak oleh Zero-PII Shield: ${sanitized.piiViolations.join(', ')}`
      };
    }

    const queueItem: OutboundQueueItem = {
      id: `wa_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      service: 'WHATSAPP_GATEWAY',
      action: 'SEND_TEMPLATE_NOTIFICATION',
      sanitizedPayload: sanitized.sanitizedData,
      status: 'QUEUED',
      retryCount: 0,
      maxRetries: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      idempotencyKey
    };

    this.queue.push(queueItem);
    return {
      success: true,
      message: 'Notifikasi WhatsApp berhasil masuk ke antrean pengiriman.',
      queueId: queueItem.id
    };
  }

  /**
   * Process all pending items in outbound queue
   */
  static async processQueue(): Promise<{ processed: number; delivered: number; failed: number }> {
    let delivered = 0;
    let failed = 0;
    const pendingItems = this.queue.filter(q => q.status === 'QUEUED' || q.status === 'RETRYING');

    for (const item of pendingItems) {
      item.status = 'PROCESSING';
      item.updatedAt = Date.now();

      const result = await CircuitBreakerService.executeWithResilience(
        'WHATSAPP_GATEWAY',
        async () => {
          // Simulated dispatch to Meta / WA Cloud API
          await new Promise(res => setTimeout(res, 40));
          return { status: 'DELIVERED_TO_GATEWAY', timestamp: Date.now() };
        },
        { status: 'FAILED_TO_DISPATCH', timestamp: Date.now() }
      );

      if (!result.isDegraded && result.data.status === 'DELIVERED_TO_GATEWAY') {
        item.status = 'DELIVERED';
        item.updatedAt = Date.now();
        delivered++;
      } else {
        item.retryCount++;
        if (item.retryCount <= item.maxRetries) {
          item.status = 'RETRYING';
        } else {
          item.status = 'FAILED';
          item.lastError = result.error || 'DISPATCH_TIMEOUT_EXHAUSTED';
        }
        item.updatedAt = Date.now();
        failed++;
      }

      this.deliveryHistory.unshift({ ...item });
      if (this.deliveryHistory.length > 50) this.deliveryHistory.pop();
    }

    // Remove finished items from active queue
    this.queue = this.queue.filter(q => q.status === 'QUEUED' || q.status === 'RETRYING');

    return {
      processed: pendingItems.length,
      delivered,
      failed
    };
  }

  /**
   * Retrieve queue depth and history for dashboard monitoring
   */
  static getQueueStatus(): { queueDepth: number; recentDispatches: OutboundQueueItem[] } {
    return {
      queueDepth: this.queue.length,
      recentDispatches: [...this.deliveryHistory]
    };
  }
}
