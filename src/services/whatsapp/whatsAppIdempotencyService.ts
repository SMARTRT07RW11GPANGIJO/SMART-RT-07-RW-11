// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP IDEMPOTENCY SERVICE v1.0
// Webhook Resend & Duplicate Message Deduplication Engine

import { WAIdempotencyRecord } from '../../types/whatsapp';
import { AIAuditService } from '../ai/aiAuditService';

export class WhatsAppIdempotencyService {
  private static processedMessages: Map<string, WAIdempotencyRecord> = new Map();
  private static readonly RETENTION_TIME_MS = 24 * 60 * 60 * 1000; // 24 Hours

  /**
   * Check if a message has already been processed
   */
  public static checkIdempotency(messageId: string, senderPhone: string): { isDuplicate: boolean; cachedRecord?: WAIdempotencyRecord } {
    if (!messageId) {
      return { isDuplicate: false };
    }

    const existing = this.processedMessages.get(messageId);
    if (existing) {
      // Log duplicate event
      AIAuditService.logEvent({
        requestId: `IDEMP-${messageId}`,
        userId: senderPhone,
        role: 'PUBLIC',
        channel: 'WHATSAPP',
        event: 'WHATSAPP_DUPLICATE_MESSAGE',
        intent: 'UNKNOWN',
        status: 'WARNING',
        details: `Duplicate inbound messageId intercepted: ${messageId}. Re-execution skipped.`
      });

      return {
        isDuplicate: true,
        cachedRecord: existing
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Record processed message for future deduplication
   */
  public static recordProcessedMessage(record: {
    messageId: string;
    senderPhone: string;
    responsePayload: string;
    mutationExecuted: boolean;
    executionHash?: string;
  }): void {
    if (!record.messageId) return;

    this.processedMessages.set(record.messageId, {
      messageId: record.messageId,
      senderPhone: record.senderPhone,
      processedAt: Date.now(),
      responsePayload: record.responsePayload,
      mutationExecuted: record.mutationExecuted,
      executionHash: record.executionHash || `HASH-${Date.now()}`
    });

    // Cleanup old records if over 5000 entries
    if (this.processedMessages.size > 5000) {
      const now = Date.now();
      for (const [key, val] of this.processedMessages.entries()) {
        if (now - val.processedAt > this.RETENTION_TIME_MS) {
          this.processedMessages.delete(key);
        }
      }
    }
  }

  public static resetState(): void {
    this.processedMessages.clear();
  }
}
