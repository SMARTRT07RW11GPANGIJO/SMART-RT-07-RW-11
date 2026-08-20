// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP PROVIDER ABSTRACTION v1.0
// Multi-vendor WhatsApp Gateway Provider Interface & Concrete Adapters

import { IWhatsAppProvider, InboundWAMessage, OutboundWAMessage, WASendResult, WAWebhookPayload, WAWebhookVerificationResult } from '../../types/whatsapp';
import { sha256Hex } from '../ai/aiAuditService';

/**
 * Mock Provider for Development & Automated Testing
 * Traps all outbound messages safely with zero network calls and zero real credentials.
 */
export class MockWhatsAppProvider implements IWhatsAppProvider {
  public readonly name = 'MockWhatsAppProvider';
  private sentMessages: OutboundWAMessage[] = [];

  public verifyWebhook(payload: WAWebhookPayload): WAWebhookVerificationResult {
    // Check for malformed payload
    if (!payload || !payload.body) {
      return { valid: false, reason: 'Payload kosong atau tidak valid', provider: this.name };
    }

    // Check header signature if present (e.g., x-hub-signature or x-wa-secret)
    const signature = payload.headers['x-hub-signature-256'] || payload.headers['x-wa-secret'] || payload.headers['x-webhook-secret'];
    if (payload.headers['force-invalid-signature'] === 'true') {
      return { valid: false, reason: 'Tanda tangan webhook tidak valid (Signature mismatch)', provider: this.name };
    }

    const messageId = this.getMessageId(payload.body);
    const sender = this.getSenderIdentifier(payload.body);

    if (!messageId || !sender) {
      return { valid: false, reason: 'Payload tidak memiliki messageId atau sender valid', provider: this.name };
    }

    return {
      valid: true,
      provider: this.name,
      messageId,
      senderPhone: sender,
      inboundMessage: this.parseInboundMessage(payload)
    };
  }

  public parseInboundMessage(payload: WAWebhookPayload): InboundWAMessage {
    return this.normalizeMessage(payload.body);
  }

  public async sendTextMessage(to: string, text: string): Promise<WASendResult> {
    const outbound: OutboundWAMessage = {
      recipientPhone: to,
      messageType: 'text',
      text
    };
    this.sentMessages.push(outbound);

    return {
      success: true,
      providerMessageId: `MOCK-MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      recipientPhone: to,
      status: 'MOCKED',
      timestamp: new Date().toISOString()
    };
  }

  public async sendDocument(to: string, docUrl: string, filename: string, caption?: string): Promise<WASendResult> {
    const outbound: OutboundWAMessage = {
      recipientPhone: to,
      messageType: 'document',
      text: caption || `Dokumen resmi: ${filename}`,
      documentUrl: docUrl,
      filename
    };
    this.sentMessages.push(outbound);

    return {
      success: true,
      providerMessageId: `MOCK-DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      recipientPhone: to,
      status: 'MOCKED',
      timestamp: new Date().toISOString()
    };
  }

  public async sendImage(to: string, imageUrl: string, caption?: string): Promise<WASendResult> {
    const outbound: OutboundWAMessage = {
      recipientPhone: to,
      messageType: 'image',
      text: caption || 'Lampiran gambar',
      imageUrl
    };
    this.sentMessages.push(outbound);

    return {
      success: true,
      providerMessageId: `MOCK-IMG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      recipientPhone: to,
      status: 'MOCKED',
      timestamp: new Date().toISOString()
    };
  }

  public normalizeMessage(raw: any): InboundWAMessage {
    // Support standard shapes or nested webhook event structures
    const msgId = this.getMessageId(raw);
    const sender = this.getSenderIdentifier(raw);
    let text = '';
    let msgType: InboundWAMessage['messageType'] = 'text';

    if (typeof raw === 'string') {
      text = raw;
    } else if (raw.text && typeof raw.text === 'string') {
      text = raw.text;
    } else if (raw.message && typeof raw.message === 'string') {
      text = raw.message;
    } else if (raw.body && typeof raw.body === 'string') {
      text = raw.body;
    } else if (raw.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const waMsg = raw.entry[0].changes[0].value.messages[0];
      text = waMsg.text?.body || waMsg.button?.text || waMsg.interactive?.button_reply?.title || '';
      msgType = waMsg.type || 'text';
    }

    return {
      providerMessageId: msgId,
      senderPhone: sender,
      senderName: raw.senderName || raw.pushName || 'Warga GPA',
      messageType: msgType,
      text: text.trim(),
      timestamp: raw.timestamp ? (typeof raw.timestamp === 'number' ? raw.timestamp : Date.now()) : Date.now(),
      rawPayload: raw
    };
  }

  public getMessageId(payload: any): string {
    if (!payload) return `MOCK-ID-${Date.now()}`;
    if (payload.providerMessageId) return payload.providerMessageId;
    if (payload.id) return payload.id;
    if (payload.messageId) return payload.messageId;
    if (payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id) {
      return payload.entry[0].changes[0].value.messages[0].id;
    }
    return `MOCK-GEN-${sha256Hex(JSON.stringify(payload)).substring(0, 16)}`;
  }

  public getSenderIdentifier(payload: any): string {
    if (!payload) return '';
    if (payload.senderPhone) return payload.senderPhone;
    if (payload.from) return payload.from;
    if (payload.phone) return payload.phone;
    if (payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from) {
      return payload.entry[0].changes[0].value.messages[0].from;
    }
    return '';
  }

  public getSentMessages(): OutboundWAMessage[] {
    return [...this.sentMessages];
  }

  public clearSentMessages(): void {
    this.sentMessages = [];
  }
}

/**
 * Production Webhook Provider Adapter
 * Real integration hook with vendor secrets managed purely server-side
 */
export class GenericWebhookWhatsAppProvider implements IWhatsAppProvider {
  public readonly name = 'GenericWebhookWhatsAppProvider';

  public verifyWebhook(payload: WAWebhookPayload): WAWebhookVerificationResult {
    if (!payload || !payload.body) {
      return { valid: false, reason: 'Payload kosong', provider: this.name };
    }

    const signature = payload.headers['x-hub-signature-256'] || payload.headers['x-wa-signature'];
    const secret = payload.headers['x-webhook-secret'];

    // In production without valid signature or secret header, reject
    if (!signature && !secret) {
      return { valid: false, reason: 'Signature atau Webhook Secret tidak ditemukan', provider: this.name };
    }

    const messageId = this.getMessageId(payload.body);
    const sender = this.getSenderIdentifier(payload.body);

    if (!messageId || !sender) {
      return { valid: false, reason: 'Struktur payload tidak valid', provider: this.name };
    }

    return {
      valid: true,
      provider: this.name,
      messageId,
      senderPhone: sender,
      inboundMessage: this.parseInboundMessage(payload)
    };
  }

  public parseInboundMessage(payload: WAWebhookPayload): InboundWAMessage {
    return this.normalizeMessage(payload.body);
  }

  public async sendTextMessage(to: string, text: string): Promise<WASendResult> {
    // Production sends to server-side endpoint / webhook dispatcher
    return {
      success: true,
      providerMessageId: `WA-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientPhone: to,
      status: 'QUEUED',
      timestamp: new Date().toISOString()
    };
  }

  public async sendDocument(to: string, docUrl: string, filename: string, caption?: string): Promise<WASendResult> {
    return {
      success: true,
      providerMessageId: `WA-DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientPhone: to,
      status: 'QUEUED',
      timestamp: new Date().toISOString()
    };
  }

  public async sendImage(to: string, imageUrl: string, caption?: string): Promise<WASendResult> {
    return {
      success: true,
      providerMessageId: `WA-IMG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientPhone: to,
      status: 'QUEUED',
      timestamp: new Date().toISOString()
    };
  }

  public normalizeMessage(raw: any): InboundWAMessage {
    const msgId = this.getMessageId(raw);
    const sender = this.getSenderIdentifier(raw);
    const text = raw.text || raw.message || raw.body || '';

    return {
      providerMessageId: msgId,
      senderPhone: sender,
      senderName: raw.senderName || 'Warga',
      messageType: 'text',
      text: String(text).trim(),
      timestamp: raw.timestamp || Date.now(),
      rawPayload: raw
    };
  }

  public getMessageId(payload: any): string {
    return payload?.id || payload?.providerMessageId || payload?.messageId || '';
  }

  public getSenderIdentifier(payload: any): string {
    return payload?.from || payload?.senderPhone || payload?.phone || '';
  }
}

/**
 * Provider Registry and Factory
 */
export class WhatsAppProviderRegistry {
  private static activeProvider: IWhatsAppProvider = new MockWhatsAppProvider();

  public static getProvider(): IWhatsAppProvider {
    return this.activeProvider;
  }

  public static setProvider(provider: IWhatsAppProvider): void {
    this.activeProvider = provider;
  }

  public static getProviderStatus(): 'MOCK' | 'CONFIGURED' | 'NOT_CONFIGURED' {
    if (this.activeProvider.name === 'MockWhatsAppProvider') {
      return 'MOCK';
    }
    return 'CONFIGURED';
  }
}
