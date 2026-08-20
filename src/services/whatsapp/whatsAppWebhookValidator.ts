// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP WEBHOOK VALIDATOR v1.0
// Webhook Security Engine: Signature, Anti-Replay, Payload Size, Malformed Rejection & Rate Limiting

import { WAWebhookPayload, WAWebhookVerificationResult } from '../../types/whatsapp';
import { WhatsAppProviderRegistry } from './whatsAppProvider';
import { AIAuditService } from '../ai/aiAuditService';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

export class WhatsAppWebhookValidator {
  private static readonly MAX_PAYLOAD_BYTES = 128 * 1024; // 128 KB
  private static readonly MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 Minutes
  private static rateLimits: Map<string, RateLimitTracker> = new Map();
  private static processedReplayNonces: Set<string> = new Set();

  /**
   * Comprehensive Webhook Validation Pipeline
   */
  public static async validate(payload: WAWebhookPayload): Promise<WAWebhookVerificationResult> {
    // 1. REQUEST SIZE PROTECTION
    const payloadStr = payload.rawBody || JSON.stringify(payload.body || '');
    if (new TextEncoder().encode(payloadStr).length > this.MAX_PAYLOAD_BYTES) {
      this.logSecurityRejection('WHATSAPP_WEBHOOK_REJECTED', 'PAYLOAD_OVERSIZED', 'Payload size exceeds 128KB maximum limit', payload);
      return {
        valid: false,
        reason: 'Ukuran payload webhook melebihi batas maksimum (128 KB)'
      };
    }

    // 2. MALFORMED PAYLOAD REJECTION
    if (!payload.body || typeof payload.body !== 'object' || Object.keys(payload.body).length === 0) {
      this.logSecurityRejection('WHATSAPP_WEBHOOK_REJECTED', 'MALFORMED_PAYLOAD', 'Malformed or empty webhook JSON body', payload);
      return {
        valid: false,
        reason: 'Payload webhook tidak berformat JSON valid atau kosong'
      };
    }

    // 3. RATE LIMITING (Max 30 webhook requests/min per IP/sender)
    const rateLimitKey = payload.clientIp || payload.body.senderPhone || payload.body.from || 'anonymous-ip';
    const rateCheck = this.checkRateLimit(rateLimitKey, 30, 60);
    if (!rateCheck.allowed) {
      this.logSecurityRejection('WHATSAPP_RATE_LIMITED', 'RATE_LIMITED', `Rate limit exceeded. Reset in ${rateCheck.resetSeconds}s`, payload);
      return {
        valid: false,
        reason: `Rate limit webhook terlampaui. Coba lagi dalam ${rateCheck.resetSeconds} detik.`
      };
    }

    // 4. TIMESTAMP & REPLAY PROTECTION
    const now = Date.now();
    const reqTimestamp = payload.timestamp || payload.body.timestamp;
    if (reqTimestamp) {
      const timeDiff = Math.abs(now - (typeof reqTimestamp === 'number' ? reqTimestamp : new Date(reqTimestamp).getTime()));
      if (timeDiff > this.MAX_TIMESTAMP_DRIFT_MS) {
        this.logSecurityRejection('WHATSAPP_WEBHOOK_REJECTED', 'TIMESTAMP_EXPIRED', `Webhook timestamp drift (${Math.round(timeDiff / 1000)}s) exceeds allowed window`, payload);
        return {
          valid: false,
          reason: 'Timestamp webhook kadaluarsa (Anti-replay protection violation)'
        };
      }
    }

    // 5. PROVIDER-SPECIFIC SIGNATURE & PAYLOAD VERIFICATION
    const provider = WhatsAppProviderRegistry.getProvider();
    const providerResult = await Promise.resolve(provider.verifyWebhook(payload));

    if (!providerResult.valid) {
      this.logSecurityRejection('WHATSAPP_WEBHOOK_REJECTED', 'SIGNATURE_INVALID', providerResult.reason || 'Provider signature verification failed', payload);
      return providerResult;
    }

    return providerResult;
  }

  private static checkRateLimit(key: string, maxRequests: number, windowSeconds: number): { allowed: boolean; resetSeconds: number } {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + windowSeconds * 1000
      });
      return { allowed: true, resetSeconds: windowSeconds };
    }

    if (entry.count >= maxRequests) {
      const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, resetSeconds };
    }

    entry.count += 1;
    return { allowed: true, resetSeconds: Math.ceil((entry.resetTime - now) / 1000) };
  }

  private static logSecurityRejection(event: any, code: string, reason: string, payload: WAWebhookPayload): void {
    AIAuditService.logEvent({
      requestId: `WA-REJ-${Date.now()}`,
      userId: payload.body?.from || payload.body?.senderPhone || 'ANONYMOUS',
      role: 'PUBLIC',
      channel: 'WHATSAPP',
      event: event || 'WHATSAPP_WEBHOOK_REJECTED',
      intent: 'UNKNOWN',
      status: 'BLOCKED',
      details: `[SECURITY_GATEWAY] ${code}: ${reason}`,
      clientIp: payload.clientIp || '127.0.0.1'
    });
  }

  public static resetState(): void {
    this.rateLimits.clear();
    this.processedReplayNonces.clear();
  }
}
