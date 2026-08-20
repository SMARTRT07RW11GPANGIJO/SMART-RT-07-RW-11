// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP SESSION SERVICE v1.0
// Server-side Isolated Session Engine & 2-Step Mutation State Manager

import { WASession, WAPendingMutation } from '../../types/whatsapp';
import { AIActorContext, AIConfirmationPayload, AIIntent } from '../../types/aiAgent';
import { sha256Hex } from '../ai/aiAuditService';

export class WhatsAppSessionService {
  private static sessions: Map<string, WASession> = new Map();
  private static readonly SESSION_TTL_MS = 15 * 60 * 1000; // 15 Minutes
  private static readonly MUTATION_TTL_MS = 5 * 60 * 1000; // 5 Minutes for confirmation

  /**
   * Get or create isolated session for a WhatsApp sender
   */
  public static getOrCreateSession(actor: AIActorContext): WASession {
    const key = actor.phone || actor.sessionId || actor.userId;
    const now = Date.now();
    let session = this.sessions.get(key);

    if (!session || (now - session.lastActivityAt > this.SESSION_TTL_MS)) {
      session = {
        sessionId: `WA-SESS-${key}-${now}`,
        channel: 'WHATSAPP',
        senderPhone: actor.phone || '',
        authenticatedUserId: actor.userId,
        userName: actor.userName,
        role: actor.role,
        nik: actor.nik,
        familyId: actor.familyId,
        createdAt: now,
        lastActivityAt: now,
        securityState: actor.isAuthenticated ? 'AUTHENTICATED' : 'UNLINKED',
        pendingMutation: null,
        conversationHistory: []
      };
      this.sessions.set(key, session);
    } else {
      // Update session activity and sync authenticated role
      session.lastActivityAt = now;
      session.role = actor.role;
      session.authenticatedUserId = actor.userId;
    }

    return session;
  }

  /**
   * Record conversation turn in session history (isolated to this phone/session only)
   */
  public static appendHistory(phone: string, turn: { role: 'user' | 'assistant'; text: string; intent?: AIIntent }): void {
    const session = this.sessions.get(phone);
    if (session) {
      session.conversationHistory.push({
        ...turn,
        timestamp: Date.now()
      });
      // Cap at 20 turns for token minimization
      if (session.conversationHistory.length > 20) {
        session.conversationHistory.shift();
      }
      session.lastActivityAt = Date.now();
    }
  }

  /**
   * Register a pending 2-step mutation requiring user confirmation
   */
  public static setPendingMutation(
    phone: string,
    toolId: string,
    toolName: string,
    action: string,
    resource: string,
    parameters: Record<string, any>,
    actor: AIActorContext,
    confirmationPrompt: AIConfirmationPayload
  ): WAPendingMutation {
    const session = this.getOrCreateSession(actor);
    const now = Date.now();

    const previewString = `${toolId}:${action}:${resource}:${JSON.stringify(parameters)}:${actor.userId}`;
    const previewHash = sha256Hex(previewString);

    const pending: WAPendingMutation = {
      confirmationId: confirmationPrompt.confirmationId || `CONF-${now}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      toolId,
      toolName,
      action,
      resource,
      previewHash,
      parameters,
      expiresAt: now + this.MUTATION_TTL_MS,
      requestedBy: actor.userId,
      requiresRole: confirmationPrompt.requiresRole || [actor.role],
      payload: confirmationPrompt
    };

    session.pendingMutation = pending;
    return pending;
  }

  /**
   * Retrieve active pending mutation (returns null if expired or missing)
   */
  public static getPendingMutation(phone: string): WAPendingMutation | null {
    const session = this.sessions.get(phone);
    if (!session || !session.pendingMutation) {
      return null;
    }

    // Check expiration
    if (Date.now() > session.pendingMutation.expiresAt) {
      session.pendingMutation = null;
      return null;
    }

    return session.pendingMutation;
  }

  /**
   * Clear pending mutation upon execution or cancellation
   */
  public static clearPendingMutation(phone: string): void {
    const session = this.sessions.get(phone);
    if (session) {
      session.pendingMutation = null;
    }
  }

  /**
   * Reset session state (for test cleanup)
   */
  public static resetState(): void {
    this.sessions.clear();
  }
}
