// SMART RT 07 RW 11 GPA NGIJO - GEMINI AI INFERENCE ADAPTER v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { ExternalDataSanitizer } from '../externalDataSanitizer';
import { CircuitBreakerService } from '../circuitBreakerService';
import { ExternalActorSession } from '../../../types/externalIntegration';

// Prompt Injection & Jailbreak Detection Signatures
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /you are now an admin/i,
  /delete from/i,
  /drop table/i,
  /bypass security/i,
  /override role/i,
  /reveal api key/i,
  /reveal secret/i
];

export class GeminiAiAdapter {
  /**
   * Scans input text for prompt injection attempts
   */
  static detectPromptInjection(prompt: string): boolean {
    if (!prompt) return false;
    return INJECTION_PATTERNS.some(pattern => pattern.test(prompt));
  }

  /**
   * Request an advisory draft or analytical summary from Gemini AI
   */
  static async requestAdvisoryInsight(
    actor: ExternalActorSession,
    topic: string,
    contextSummary: string,
    aggregateMetrics: Record<string, number>
  ): Promise<{
    success: boolean;
    isAdvisory: true;
    insight: string;
    isDegraded: boolean;
    blockedReason?: string;
  }> {
    // 1. RBAC check (Warga & Public get scoped/advisory queries only)
    if (actor.role === 'PUBLIC') {
      return {
        success: false,
        isAdvisory: true,
        insight: '',
        isDegraded: false,
        blockedReason: '403 Forbidden: Public role tidak memiliki akses AI advisory.'
      };
    }

    // 2. Prompt Injection Defense
    if (this.detectPromptInjection(topic) || this.detectPromptInjection(contextSummary)) {
      return {
        success: false,
        isAdvisory: true,
        insight: '',
        isDegraded: false,
        blockedReason: 'PROMPT_INJECTION_DETECTED: Permintaan diblokir oleh AI Safety Guard.'
      };
    }

    // 3. Strict Input Sanitization (Zero-PII & Field Allowlist)
    const rawPayload = {
      task_type: 'ADVISORY_SUMMARY',
      topic,
      context_summary: contextSummary,
      aggregate_metrics: aggregateMetrics
    };

    const sanitized = ExternalDataSanitizer.sanitizeOutboundPayload('GEMINI_AI', rawPayload);
    if (!sanitized.isValid) {
      return {
        success: false,
        isAdvisory: true,
        insight: '',
        isDegraded: false,
        blockedReason: `ZERO_PII_VIOLATION: ${sanitized.piiViolations.join(', ')}`
      };
    }

    // 4. Resilience Guard execution
    const result = await CircuitBreakerService.executeWithResilience(
      'GEMINI_AI',
      async () => {
        // Simulated deterministic AI Advisory generation with safety boundaries
        await new Promise(res => setTimeout(res, 60));
        return {
          insightText: `[ADVISORY RECOMMENDATION v1.0] Berdasarkan analisis data agregat (${Object.keys(aggregateMetrics).length} metrik), disarankan: 1) Penjadwalan pemeliharaan preventif, 2) Sosialisasi agenda melalui pengumuman resmi RT. Catatan: Rekomendasi ini bersifat pendukung keputusan dan memerlukan persetujuan manual Pengurus RT.`
        };
      },
      {
        insightText: '[DEGRADED FALLBACK] Layanan AI sementara tidak tersedia. Keputusan tetap sepenuhnya di tangan Pengurus RT.'
      }
    );

    return {
      success: !result.isDegraded,
      isAdvisory: true,
      insight: result.data.insightText,
      isDegraded: result.isDegraded,
      blockedReason: result.error
    };
  }
}
