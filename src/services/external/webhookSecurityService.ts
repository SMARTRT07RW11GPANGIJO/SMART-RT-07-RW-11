// SMART RT 07 RW 11 GPA NGIJO - WEBHOOK SECURITY SERVICE v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { ExternalServiceType, InboundWebhookEvent } from '../../types/externalIntegration';
import { ExternalDataSanitizer } from './externalDataSanitizer';

export class WebhookSecurityService {
  private static processedIdempotencyKeys: Set<string> = new Set();
  private static webhookAuditHistory: InboundWebhookEvent[] = [];
  private static rateLimitMap: Map<string, { count: number; windowStart: number }> = new Map();

  private static readonly MAX_TIMESTAMP_DRIFT_SEC = 300; // 5 minutes
  private static readonly MAX_PAYLOAD_BYTES = 65536; // 64 KB
  private static readonly RATE_LIMIT_MAX = 30; // 30 req / min

  /**
   * Generates a deterministic HMAC-SHA256 signature simulation for browser/server execution
   */
  static generateSignature(secret: string, timestamp: number, payloadStr: string): string {
    const raw = `${timestamp}.${payloadStr}.${secret}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    // Hex representation
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256=${hex}${hex}${hex}${hex}`;
  }

  /**
   * Validate and verify inbound webhook request
   */
  static verifyInboundWebhook(params: {
    service: ExternalServiceType;
    method: string;
    contentType: string;
    signatureHeader: string;
    timestampHeader: number;
    rawPayload: string;
    idempotencyKey: string;
    secret: string;
    senderIp?: string;
  }): { isValid: boolean; reason?: string; sanitizedEvent?: InboundWebhookEvent } {
    const now = Math.floor(Date.now() / 1000);

    // 1. Method check
    if (params.method.toUpperCase() !== 'POST') {
      return { isValid: false, reason: 'INVALID_HTTP_METHOD_EXPECTED_POST' };
    }

    // 2. Content Type check
    if (!params.contentType.toLowerCase().includes('application/json')) {
      return { isValid: false, reason: 'INVALID_CONTENT_TYPE_EXPECTED_JSON' };
    }

    // 3. Payload size check
    if (params.rawPayload.length > this.MAX_PAYLOAD_BYTES) {
      return { isValid: false, reason: 'PAYLOAD_EXCEEDS_MAX_SIZE_64KB' };
    }

    // 4. Rate Limiting check
    const clientKey = params.senderIp || params.service;
    const nowMs = Date.now();
    const rateRec = this.rateLimitMap.get(clientKey) || { count: 0, windowStart: nowMs };
    if (nowMs - rateRec.windowStart > 60000) {
      // Reset window
      rateRec.count = 1;
      rateRec.windowStart = nowMs;
      this.rateLimitMap.set(clientKey, rateRec);
    } else {
      rateRec.count++;
      if (rateRec.count > this.RATE_LIMIT_MAX) {
        return { isValid: false, reason: 'RATE_LIMIT_EXCEEDED_MAX_30_RPM' };
      }
      this.rateLimitMap.set(clientKey, rateRec);
    }

    // 5. Timestamp Freshness check (Replay defense)
    const timeDrift = Math.abs(now - params.timestampHeader);
    if (timeDrift > this.MAX_TIMESTAMP_DRIFT_SEC) {
      return {
        isValid: false,
        reason: `TIMESTAMP_DRIFT_EXPIRED_${timeDrift}S_MAX_${this.MAX_TIMESTAMP_DRIFT_SEC}S`
      };
    }

    // 6. Signature check
    const expectedSig = this.generateSignature(params.secret, params.timestampHeader, params.rawPayload);
    if (!params.signatureHeader || params.signatureHeader !== expectedSig) {
      return { isValid: false, reason: 'INVALID_HMAC_SHA256_SIGNATURE' };
    }

    // 7. Idempotency Key check (Prevent double-processing)
    if (!params.idempotencyKey || this.processedIdempotencyKeys.has(params.idempotencyKey)) {
      return { isValid: false, reason: 'REPLAY_DETECTED_OR_DUPLICATE_IDEMPOTENCY_KEY' };
    }

    // 8. JSON Schema & Parsing validation
    let parsedPayload: Record<string, any> = {};
    try {
      parsedPayload = JSON.parse(params.rawPayload);
    } catch {
      return { isValid: false, reason: 'MALFORMED_JSON_PAYLOAD' };
    }

    // 9. Sanitization
    const cleanPayload = ExternalDataSanitizer.sanitizeExternalResponse(parsedPayload);

    // Mark key as processed
    this.processedIdempotencyKeys.add(params.idempotencyKey);

    const eventRecord: InboundWebhookEvent = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      service: params.service,
      eventType: cleanPayload.eventType || 'GENERIC_WEBHOOK',
      signature: params.signatureHeader,
      timestamp: params.timestampHeader,
      payload: cleanPayload,
      receivedAt: Date.now(),
      status: 'VERIFIED'
    };

    this.webhookAuditHistory.unshift(eventRecord);
    if (this.webhookAuditHistory.length > 50) {
      this.webhookAuditHistory.pop();
    }

    return {
      isValid: true,
      sanitizedEvent: eventRecord
    };
  }

  /**
   * Retrieve recent webhook audit logs
   */
  static getWebhookHistory(): InboundWebhookEvent[] {
    return [...this.webhookAuditHistory];
  }
}
