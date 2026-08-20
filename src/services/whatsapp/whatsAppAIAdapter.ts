// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP AI ADAPTER v1.0
// Official Single Channel Adapter Routing WhatsApp Requests to SMART RT AI Agent Core v1.1

import { InboundWAMessage, WAWebhookPayload } from '../../types/whatsapp';
import { WhatsAppWebhookValidator } from './whatsAppWebhookValidator';
import { WhatsAppIdempotencyService } from './whatsAppIdempotencyService';
import { WhatsAppIdentityService } from './whatsAppIdentityService';
import { WhatsAppSessionService } from './whatsAppSessionService';
import { WhatsAppResponseFormatter } from './whatsAppResponseFormatter';
import { WhatsAppProviderRegistry } from './whatsAppProvider';
import { AIAgentGateway } from '../ai/aiAgentGateway';
import { AIToolRegistry } from '../ai/aiToolRegistry';
import { AIAuditService } from '../ai/aiAuditService';

export interface WAProcessingResult {
  success: boolean;
  replyText: string;
  senderPhone: string;
  isDuplicate?: boolean;
  executionStatus?: string;
  mutationExecuted?: boolean;
  providerStatus?: string;
}

export class WhatsAppAIAdapter {
  /**
   * Main Webhook Gateway Ingress
   */
  public static async handleWebhook(payload: WAWebhookPayload): Promise<WAProcessingResult> {
    // 1. VALIDATE WEBHOOK (Signature, Size, Malformed, Replay, Rate Limit)
    const valResult = await WhatsAppWebhookValidator.validate(payload);
    if (!valResult.valid) {
      return {
        success: false,
        replyText: WhatsAppResponseFormatter.formatSafeError(valResult.reason),
        senderPhone: payload.body?.senderPhone || payload.body?.from || '',
        executionStatus: 'WEBHOOK_REJECTED'
      };
    }

    const inbound = valResult.inboundMessage || WhatsAppProviderRegistry.getProvider().parseInboundMessage(payload);
    return this.processInboundMessage(inbound);
  }

  /**
   * Process Inbound WhatsApp Message through Authoritative AI Core
   */
  public static async processInboundMessage(inbound: InboundWAMessage): Promise<WAProcessingResult> {
    const { providerMessageId, senderPhone, text } = inbound;
    const cleanText = text.trim();

    // 2. IDEMPOTENCY CHECK
    const idempCheck = WhatsAppIdempotencyService.checkIdempotency(providerMessageId, senderPhone);
    if (idempCheck.isDuplicate && idempCheck.cachedRecord) {
      return {
        success: true,
        replyText: idempCheck.cachedRecord.responsePayload,
        senderPhone,
        isDuplicate: true,
        mutationExecuted: idempCheck.cachedRecord.mutationExecuted,
        executionStatus: 'DUPLICATE_CACHED'
      };
    }

    // 3. SERVER-SIDE IDENTITY RESOLUTION
    const identity = WhatsAppIdentityService.resolveIdentity(senderPhone);
    const actor = identity.actor;

    // 4. SESSION RESOLVER
    const session = WhatsAppSessionService.getOrCreateSession(actor);
    const lowerText = cleanText.toLowerCase();

    // 5. CHECK 2-STEP CONFIRMATION FLOW
    const pending = WhatsAppSessionService.getPendingMutation(senderPhone);

    if (pending) {
      // User Cancels Mutation
      if (['batal', 'cancel', 'tidak', 'batalkan'].includes(lowerText)) {
        WhatsAppSessionService.clearPendingMutation(senderPhone);

        AIAuditService.logEvent({
          requestId: actor.requestId,
          userId: actor.userId,
          role: actor.role,
          channel: 'WHATSAPP',
          event: 'AI_RESPONSE',
          intent: 'UNKNOWN',
          status: 'SUCCESS',
          details: `WhatsApp pending mutation cancelled: ${pending.toolName}`
        });

        const cancelReply = WhatsAppResponseFormatter.formatMutationCancelled(`Tindakan ${pending.toolName} telah dibatalkan.`);
        
        WhatsAppIdempotencyService.recordProcessedMessage({
          messageId: providerMessageId,
          senderPhone,
          responsePayload: cancelReply,
          mutationExecuted: false
        });

        await WhatsAppProviderRegistry.getProvider().sendTextMessage(senderPhone, cancelReply);

        return {
          success: true,
          replyText: cancelReply,
          senderPhone,
          mutationExecuted: false,
          executionStatus: 'MUTATION_CANCELLED'
        };
      }

      // User Confirms Mutation
      if (['setuju', 'ya', 'konfirmasi', 'proses', 'lanjutkan'].includes(lowerText)) {
        // Re-authorize role
        if (pending.requiresRole && !pending.requiresRole.includes(actor.role)) {
          AIAuditService.logEvent({
            requestId: actor.requestId,
            userId: actor.userId,
            role: actor.role,
            channel: 'WHATSAPP',
            event: 'WHATSAPP_TOOL_DENIED',
            intent: 'UNKNOWN',
            status: 'DENIED',
            details: `WhatsApp mutation confirmation denied. Required role: ${pending.requiresRole.join(', ')}`
          });

          const deniedReply = WhatsAppResponseFormatter.formatSafeError('Wewenang Anda tidak mencukupi untuk mengonfirmasi tindakan ini.');
          WhatsAppSessionService.clearPendingMutation(senderPhone);
          await WhatsAppProviderRegistry.getProvider().sendTextMessage(senderPhone, deniedReply);

          return {
            success: false,
            replyText: deniedReply,
            senderPhone,
            mutationExecuted: false,
            executionStatus: 'DENIED'
          };
        }

        // Execute Tool via Authoritative Tool Registry with _confirmed: true flag
        const toolResult = await AIToolRegistry.executeTool(pending.toolId, { ...(pending.parameters || {}), _confirmed: true }, actor);

        AIAuditService.logEvent({
          requestId: actor.requestId,
          userId: actor.userId,
          role: actor.role,
          channel: 'WHATSAPP',
          event: 'WHATSAPP_MUTATION_CONFIRMED',
          intent: 'UNKNOWN',
          status: toolResult.success ? 'SUCCESS' : 'ERROR',
          details: `[WHATSAPP MUTATION] ${pending.toolName} executed. Result: ${toolResult.success}`
        });

        WhatsAppSessionService.clearPendingMutation(senderPhone);

        let finalReply = '';
        if (toolResult.success) {
          const trackingId = toolResult.data?.trackingId || toolResult.data?.id_surat || toolResult.data?.ticketId;
          finalReply = WhatsAppResponseFormatter.formatMutationSuccess(pending.toolName, toolResult.data?.message || 'Tindakan berhasil diproses.', trackingId);
        } else {
          finalReply = WhatsAppResponseFormatter.formatSafeError(toolResult.error || 'Gagal mengeksekusi tindakan.');
        }

        WhatsAppIdempotencyService.recordProcessedMessage({
          messageId: providerMessageId,
          senderPhone,
          responsePayload: finalReply,
          mutationExecuted: toolResult.success
        });

        await WhatsAppProviderRegistry.getProvider().sendTextMessage(senderPhone, finalReply);

        return {
          success: toolResult.success,
          replyText: finalReply,
          senderPhone,
          mutationExecuted: toolResult.success,
          executionStatus: toolResult.success ? 'SUCCESS' : 'FAILED'
        };
      }
    }

    // 6. PROCESS QUERY THROUGH SMART RT AI AGENT CORE v1.1
    const aiResponse = await AIAgentGateway.processRequest(cleanText, actor);

    // 7. HANDLE MUTATION PREVIEWS (2-STEP GATE)
    if (aiResponse.confirmationPrompt) {
      WhatsAppSessionService.setPendingMutation(
        senderPhone,
        aiResponse.confirmationPrompt.toolId,
        aiResponse.confirmationPrompt.toolName,
        'EXECUTE',
        aiResponse.confirmationPrompt.toolId,
        aiResponse.confirmationPrompt.parameters,
        actor,
        aiResponse.confirmationPrompt
      );

      AIAuditService.logEvent({
        requestId: actor.requestId,
        userId: actor.userId,
        role: actor.role,
        channel: 'WHATSAPP',
        event: 'WHATSAPP_MUTATION_PREVIEW',
        intent: aiResponse.intent,
        status: 'WARNING',
        details: `WhatsApp mutation preview generated: ${aiResponse.confirmationPrompt.toolName}`
      });
    }

    // 8. FORMAT RESPONSE (with Privacy Masking & GeoBase Layer 3 Tag)
    const formattedReply = WhatsAppResponseFormatter.formatResponse(aiResponse, !identity.isLinked);

    // 9. LOG IN CONVERSATION HISTORY & IDEMPOTENCY
    WhatsAppSessionService.appendHistory(senderPhone, {
      role: 'user',
      text: cleanText,
      intent: aiResponse.intent
    });
    WhatsAppSessionService.appendHistory(senderPhone, {
      role: 'assistant',
      text: formattedReply,
      intent: aiResponse.intent
    });

    WhatsAppIdempotencyService.recordProcessedMessage({
      messageId: providerMessageId,
      senderPhone,
      responsePayload: formattedReply,
      mutationExecuted: false
    });

    // 10. SEND OUTBOUND MESSAGE VIA ACTIVE PROVIDER
    await WhatsAppProviderRegistry.getProvider().sendTextMessage(senderPhone, formattedReply);

    return {
      success: aiResponse.success,
      replyText: formattedReply,
      senderPhone,
      mutationExecuted: false,
      executionStatus: aiResponse.metadata.executionStatus,
      providerStatus: WhatsAppProviderRegistry.getProviderStatus()
    };
  }
}
