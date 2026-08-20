// SMART RT 07 RW 11 GPA NGIJO - AI RESPONSE GUARD & OUTPUT SANITIZER v1.0
// Output Safety, Privacy Masking, Hallucination Prevention, and Response Contract

import { AIAgentResponse, AIResponseMetadata, AISourceCitation, AIIntent, AIActorContext, AIDataClassification, AIConfirmationPayload } from '../../types/aiAgent';
import { AIPolicyService } from './aiPolicyService';
import { AI_CONFIG } from '../../config/ai/aiConfig';

export class AIResponseGuard {
  public static sanitizeAndSeal(params: {
    rawMessage: string;
    intent: AIIntent;
    actor: AIActorContext;
    sources: AISourceCitation[];
    toolsUsed: string[];
    sensitivityLevel: AIDataClassification;
    referenceDataIncluded: boolean;
    confirmationPayload?: AIConfirmationPayload;
    suggestedActions?: { label: string; action: string; payload?: any }[];
    error?: AIAgentResponse['error'];
    latencyMs: number;
  }): AIAgentResponse {
    let sanitizedText = params.rawMessage;

    // 1. HALLUCINATION & EMPTY DATA GUARD (SECTION 12 & 3)
    if (!sanitizedText || sanitizedText.trim().length === 0) {
      sanitizedText = 'Data tersebut belum tersedia dalam sistem SMART RT 07 RW 11 GPA Ngijo.';
    }

    // 2. PRIVACY & SENSITIVE CREDENTIAL LEAKAGE DEFENSE (SECTION 9 & 25)
    // Mask any 16-digit sequences if found in generated text for non-privileged users
    if (!['SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN'].includes(params.actor.role)) {
      sanitizedText = sanitizedText.replace(/\b\d{16}\b/g, (match) => AIPolicyService.maskNIK(match));
    }

    // Remove any accidental secret keys or token leaks
    sanitizedText = sanitizedText
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
      .replace(/sk-[0-9a-zA-Z]{32,}/g, '[REDACTED_TOKEN]')
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED_TOKEN]');

    // 3. GEOBASE REFERENCE DATA NOTICE INJECTION (SECTION 5 & 28)
    if (params.referenceDataIncluded && !sanitizedText.includes(AI_CONFIG.disclaimer.unverifiedGeoWarning)) {
      sanitizedText += `\n\n📌 *Catatan Verifikasi:* ${AI_CONFIG.disclaimer.unverifiedGeoWarning}`;
    }

    // 4. GENERATE METADATA RESPONSE CONTRACT (SECTION 13)
    const metadata: AIResponseMetadata = {
      requestId: params.actor.requestId,
      userId: params.actor.userId,
      sessionId: params.actor.sessionId,
      channel: params.actor.channel,
      intent: params.intent,
      confidence: params.error ? 0.0 : 0.95,
      dataSources: params.sources,
      permissionChecked: true,
      sensitivityLevel: params.sensitivityLevel,
      toolsUsed: params.toolsUsed,
      knowledgeLayersUsed: Array.from(new Set(params.sources.map((s) => s.layer))),
      referenceDataIncluded: params.referenceDataIncluded,
      timestamp: new Date().toISOString(),
      latencyMs: params.latencyMs,
      auditEvent: params.confirmationPayload
        ? 'AI_MUTATION_REQUESTED'
        : params.error
        ? (params.error.code === 'SECURITY_BLOCKED' ? 'AI_PROMPT_INJECTION_BLOCK' : 'AI_PERMISSION_DENIED')
        : 'AI_RESPONSE',
      executionStatus: params.confirmationPayload
        ? 'REQUIRES_CONFIRMATION'
        : params.error
        ? (params.error.code === 'SECURITY_BLOCKED' ? 'BLOCKED' : 'DENIED')
        : 'SUCCESS'
    };

    return {
      success: !params.error,
      message: sanitizedText,
      role: 'assistant',
      intent: params.intent,
      metadata,
      sources: params.sources,
      confirmationPrompt: params.confirmationPayload,
      suggestedActions: params.suggestedActions,
      error: params.error
    };
  }
}
