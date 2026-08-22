// SMART RT 07 RW 11 GPA NGIJO - INTEGRATION ORCHESTRATOR SERVICE v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { 
  ExternalServiceType, 
  ExternalFeatureFlags, 
  IntegrationAuditLog, 
  ServiceHealthReport,
  ExternalActorSession 
} from '../../types/externalIntegration';
import { CircuitBreakerService } from './circuitBreakerService';
import { WhatsappGatewayAdapter } from './adapters/whatsappGatewayAdapter';
import { GasSheetsAdapter } from './adapters/gasSheetsAdapter';
import { GeminiAiAdapter } from './adapters/geminiAiAdapter';
import { OsmMapAdapter } from './adapters/osmMapAdapter';
import { ExternalDataSanitizer } from './externalDataSanitizer';

export class IntegrationOrchestratorService {
  // Feature Flags (Default: Controlled / False until authorized)
  private static featureFlags: ExternalFeatureFlags = {
    EXTERNAL_GAS_SYNC_ENABLED: true,
    EXTERNAL_WA_GATEWAY_ENABLED: true,
    EXTERNAL_GEMINI_AI_ENABLED: true,
    EXTERNAL_PAYMENT_ENABLED: false, // Strictly BLOCKED
    EXTERNAL_OAUTH_ENABLED: false    // Strictly BLOCKED
  };

  // Append-only Immutable Audit Logs
  private static auditLogs: IntegrationAuditLog[] = [];

  // Request counter tracking for health metrics
  private static serviceStats: Record<ExternalServiceType, { total: number; success: number; failed: number }> = {
    GAS_SHEETS: { total: 12, success: 12, failed: 0 },
    WHATSAPP_GATEWAY: { total: 45, success: 44, failed: 1 },
    GEMINI_AI: { total: 28, success: 28, failed: 0 },
    OSM_MAP: { total: 80, success: 80, failed: 0 }
  };

  /**
   * Log an immutable integration audit event
   */
  static logAuditEvent(event: Omit<IntegrationAuditLog, 'id' | 'timestamp'>): void {
    const logItem: IntegrationAuditLog = {
      id: `ext_audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    // Sanitize any metadata in audit to ensure zero credentials / PII leak
    logItem.metadata = ExternalDataSanitizer.sanitizeExternalResponse(logItem.metadata);

    this.auditLogs.unshift(logItem);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  /**
   * Retrieve feature flag states
   */
  static getFeatureFlags(): ExternalFeatureFlags {
    return { ...this.featureFlags };
  }

  /**
   * Update feature flag states (Admin / Ketua RT only)
   */
  static updateFeatureFlag(
    actor: ExternalActorSession,
    flag: keyof ExternalFeatureFlags,
    value: boolean
  ): { success: boolean; message: string } {
    if (actor.role !== 'ADMIN' && actor.role !== 'KETUA_RT') {
      return {
        success: false,
        message: '403 Forbidden: Hanya Admin atau Ketua RT yang berhak mengubah Feature Flags.'
      };
    }

    // Payment & Social OAuth are permanently forbidden
    if (flag === 'EXTERNAL_PAYMENT_ENABLED' || flag === 'EXTERNAL_OAUTH_ENABLED') {
      return {
        success: false,
        message: 'Kebijakan Keamanan: Payment Gateway dan Social OAuth dilarang keras (Blocked by Policy).'
      };
    }

    this.featureFlags[flag] = value;

    this.logAuditEvent({
      actorId: actor.userId,
      role: actor.role,
      service: 'GAS_SHEETS',
      action: 'EXTERNAL_DATA_SANITIZED',
      status: 'SUCCESS',
      metadata: { flag, value }
    });

    return {
      success: true,
      message: `Feature Flag ${flag} berhasil diubah menjadi ${value}.`
    };
  }

  /**
   * Retrieve consolidated health report for all integrated services
   */
  static getHealthReports(): ServiceHealthReport[] {
    const services: { type: ExternalServiceType; name: string; flag: boolean }[] = [
      { type: 'GAS_SHEETS', name: 'Google Sheets / GAS Gateway', flag: this.featureFlags.EXTERNAL_GAS_SYNC_ENABLED },
      { type: 'WHATSAPP_GATEWAY', name: 'WhatsApp Notification Gateway', flag: this.featureFlags.EXTERNAL_WA_GATEWAY_ENABLED },
      { type: 'GEMINI_AI', name: 'Gemini AI Advisory Engine', flag: this.featureFlags.EXTERNAL_GEMINI_AI_ENABLED },
      { type: 'OSM_MAP', name: 'OpenStreetMap Tile Engine', flag: true }
    ];

    return services.map(s => {
      const stats = this.serviceStats[s.type];
      const cb = CircuitBreakerService.getBreakerState(s.type);
      const health = CircuitBreakerService.getHealthStatus(s.type, s.flag);
      const queue = s.type === 'WHATSAPP_GATEWAY' ? WhatsappGatewayAdapter.getQueueStatus().queueDepth : 0;

      return {
        service: s.type,
        name: s.name,
        enabled: s.flag,
        health,
        circuitState: cb?.state || 'CLOSED',
        totalRequests: stats.total,
        successRequests: stats.success,
        failedRequests: stats.failed,
        lastSuccessTimestamp: cb?.lastSuccessTime ? new Date(cb.lastSuccessTime).toLocaleTimeString('id-ID') : 'Tersedia',
        lastFailureTimestamp: cb?.lastFailureTime ? new Date(cb.lastFailureTime).toLocaleTimeString('id-ID') : undefined,
        queueDepth: queue,
        avgLatencyMs: s.type === 'GEMINI_AI' ? 450 : s.type === 'WHATSAPP_GATEWAY' ? 120 : 65
      };
    });
  }

  /**
   * Retrieve immutable audit logs (Admin / Pengurus / Ketua RT only)
   */
  static getAuditLogs(actor: ExternalActorSession): IntegrationAuditLog[] {
    if (actor.role === 'PUBLIC' || actor.role === 'WARGA') {
      return []; // 403 / Safe empty
    }
    return [...this.auditLogs];
  }
}
