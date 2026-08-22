// SMART RT 07 RW 11 GPA NGIJO - GOOGLE APPS SCRIPT / SHEETS ADAPTER v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { ExternalDataSanitizer } from '../externalDataSanitizer';
import { CircuitBreakerService } from '../circuitBreakerService';
import { ExternalActorSession } from '../../../types/externalIntegration';
import { isPlaceholderGasUrl, getGasWebappUrl } from '../../apiService';

export class GasSheetsAdapter {
  /**
   * Controlled export of financial summaries or surat logs to Google Sheets
   */
  static async exportData(
    actor: ExternalActorSession,
    sheetType: 'KAS' | 'SURAT' | 'AGENDA',
    dataRows: Record<string, any>[]
  ): Promise<{ success: boolean; message: string; rowsExported: number; isDegraded: boolean }> {
    // 1. RBAC authorization check (Server-Authoritative)
    if (actor.role !== 'ADMIN' && actor.role !== 'KETUA_RT' && actor.role !== 'PENGURUS') {
      return {
        success: false,
        message: '403 Forbidden: Hanya Pengurus/Ketua RT yang berwenang mengekspor ke Google Sheets.',
        rowsExported: 0,
        isDegraded: false
      };
    }

    // 2. Strict sanitization of all rows (Zero-PII & Field Allowlist)
    const sanitizedRows: Record<string, any>[] = [];
    for (const row of dataRows) {
      const sanitized = ExternalDataSanitizer.sanitizeOutboundPayload('GAS_SHEETS', row);
      if (sanitized.isValid) {
        sanitizedRows.push(sanitized.sanitizedData);
      }
    }

    // 3. Execution through Circuit Breaker & Resilience Guard
    const result = await CircuitBreakerService.executeWithResilience(
      'GAS_SHEETS',
      async () => {
        const gasUrl = getGasWebappUrl();
        if (isPlaceholderGasUrl(gasUrl)) {
          // Graceful simulated offline mode when placeholder is detected
          return {
            success: true,
            message: 'Sinkronisasi Sheets berhasil dicatat (Mode Sandbox GAS).',
            rowsExported: sanitizedRows.length
          };
        }

        const response = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_RECAP',
            sheetType,
            rows: sanitizedRows,
            exportedAt: new Date().toISOString(),
            actorRole: actor.role
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP_${response.status}_GAS_ERROR`);
        }

        const json = await response.json();
        return {
          success: json.success ?? true,
          message: json.message || 'Sinkronisasi Google Sheets sukses.',
          rowsExported: sanitizedRows.length
        };
      },
      {
        success: false,
        message: 'Layanan Google Sheets sementara tidak tersedia (Fallback Degraded).',
        rowsExported: 0
      }
    );

    return {
      success: result.data.success,
      message: result.data.message,
      rowsExported: result.data.rowsExported,
      isDegraded: result.isDegraded
    };
  }
}
