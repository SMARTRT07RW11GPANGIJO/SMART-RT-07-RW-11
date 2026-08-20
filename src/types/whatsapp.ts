// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP CONVERSATIONAL SERVICE v1.0
// Type Definitions for WhatsApp Provider, Webhook, Identity, Session, Mutation & Formatter

import { UserRole } from './rt';
import { AIActorContext, AIConfirmationPayload, AISourceCitation, AIIntent, AISecurityEvent } from './aiAgent';

export interface InboundWAMessage {
  providerMessageId: string;
  senderPhone: string;
  senderName?: string;
  messageType: 'text' | 'document' | 'image' | 'button_reply' | 'interactive';
  text: string;
  timestamp: number; // Unix timestamp in ms
  rawPayload?: any;
}

export interface OutboundWAMessage {
  recipientPhone: string;
  messageType: 'text' | 'document' | 'image';
  text: string;
  documentUrl?: string;
  filename?: string;
  imageUrl?: string;
  previewHash?: string;
}

export interface WASendResult {
  success: boolean;
  providerMessageId?: string;
  recipientPhone: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED' | 'MOCKED';
  error?: string;
  timestamp: string;
}

export interface WAWebhookPayload {
  headers: Record<string, string>;
  body: any;
  rawBody?: string;
  timestamp?: number;
  clientIp?: string;
}

export interface WAWebhookVerificationResult {
  valid: boolean;
  reason?: string;
  provider?: string;
  messageId?: string;
  senderPhone?: string;
  inboundMessage?: InboundWAMessage;
}

export interface WAPendingMutation {
  confirmationId: string;
  toolId: string;
  toolName: string;
  action: string;
  resource: string;
  previewHash: string;
  parameters: Record<string, any>;
  expiresAt: number; // Unix timestamp in ms
  requestedBy: string;
  requiresRole: UserRole[];
  payload: AIConfirmationPayload;
}

export interface WASession {
  sessionId: string;
  channel: 'WHATSAPP';
  senderPhone: string;
  authenticatedUserId: string;
  userName: string;
  role: UserRole;
  nik?: string;
  familyId?: string;
  houseBlock?: string;
  createdAt: number;
  lastActivityAt: number;
  securityState: 'AUTHENTICATED' | 'UNLINKED' | 'LOCKED' | 'THROTTLED';
  pendingMutation?: WAPendingMutation | null;
  conversationHistory: {
    role: 'user' | 'assistant';
    text: string;
    timestamp: number;
    intent?: AIIntent;
  }[];
}

export interface WAIdentityBindingResult {
  isLinked: boolean;
  actor: AIActorContext;
  houseBlock?: string;
  residentName?: string;
  reason?: string;
}

export interface WAIdempotencyRecord {
  messageId: string;
  senderPhone: string;
  processedAt: number;
  responsePayload: string;
  mutationExecuted: boolean;
  executionHash: string;
}

export interface IWhatsAppProvider {
  name: string;
  verifyWebhook(payload: WAWebhookPayload): WAWebhookVerificationResult | Promise<WAWebhookVerificationResult>;
  parseInboundMessage(payload: WAWebhookPayload): InboundWAMessage;
  sendTextMessage(to: string, text: string): Promise<WASendResult>;
  sendDocument(to: string, docUrl: string, filename: string, caption?: string): Promise<WASendResult>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<WASendResult>;
  normalizeMessage(raw: any): InboundWAMessage;
  getMessageId(payload: any): string;
  getSenderIdentifier(payload: any): string;
}

export interface WATestCaseResult {
  testId: string;
  name: string;
  category: 'GATEWAY' | 'IDENTITY' | 'SECURITY' | 'MUTATION' | 'RAG' | 'CONVERSATION' | 'AUDIT';
  status: 'PASS' | 'FAIL';
  durationMs: number;
  message: string;
  expected: string;
  actual: string;
}
