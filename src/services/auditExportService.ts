// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J AUDIT EXPORT SERVICE

import { AIAuditLog, AuditExportOptions } from '../types/aiAudit';
import { DataSanitizerService } from './dataSanitizerService';
import { AuditLogger } from './auditLoggerService';
import { UserRole } from '../types/rt';

export class AuditExportService {
  /**
   * Export audit logs as CSV or formatted PDF text blob
   */
  static exportAuditLogs(
    logs: AIAuditLog[],
    options: AuditExportOptions,
    requestedBy: { userId: string; role: UserRole }
  ): { filename: string; content: string; mimeType: string } {
    // 1. Audit log the export request
    AuditLogger.log({
      userId: requestedBy.userId,
      role: requestedBy.role,
      action: 'AI_DATA_ACCESS',
      channel: 'SYSTEM',
      status: 'SUCCESS',
      details: `Export AI Audit Log executed in format ${options.format}. Total records: ${logs.length}. PII Masked: ${options.maskPII}`
    });

    // 2. Filter logs by options
    let filtered = [...logs];
    if (options.roleFilter) {
      filtered = filtered.filter((l) => l.role === options.roleFilter);
    }
    if (options.channelFilter) {
      filtered = filtered.filter((l) => l.channel === options.channelFilter);
    }
    if (options.startDate) {
      const startMs = new Date(options.startDate).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() >= startMs);
    }
    if (options.endDate) {
      const endMs = new Date(options.endDate).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() <= endMs);
    }

    // 3. Mask PII in details
    if (options.maskPII) {
      filtered = filtered.map((l) => ({
        ...l,
        userId: l.userId.startsWith('WRG') || l.userId.startsWith('ADM') ? l.userId : DataSanitizerService.maskNIK(l.userId),
        details: l.details ? DataSanitizerService.sanitizeString(l.details) : ''
      }));
    }

    const timestampStr = new Date().toISOString().slice(0, 10);

    if (options.format === 'CSV') {
      const headers = [
        'ID',
        'Timestamp',
        'Request ID',
        'Session ID',
        'User ID',
        'Role',
        'Channel',
        'Intent',
        'Tool Name',
        'Action',
        'Authorization',
        'Status',
        'Duration (ms)',
        'Error Code',
        'Details'
      ];

      const rows = filtered.map((l) => [
        l.id,
        l.timestamp,
        l.requestId,
        l.sessionId,
        l.userId,
        l.role,
        l.channel,
        l.intent || '',
        l.toolName || '',
        l.action,
        l.authorization,
        l.status,
        l.durationMs,
        l.errorCode || '',
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return {
        filename: `AI_Audit_Log_RT07_${timestampStr}.csv`,
        content: csvContent,
        mimeType: 'text/csv;charset=utf-8;'
      };
    } else {
      // PDF formatted text report
      let reportText = `====================================================\n`;
      reportText += `LAPORAN AUDIT & ANALISTIK AI - SMART RT 07 RW 11 PERUM GPA\n`;
      reportText += `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}\n`;
      reportText += `Dinegosisiasi Oleh: ${requestedBy.userId} (${requestedBy.role})\n`;
      reportText += `Total Catatan Audit: ${filtered.length}\n`;
      reportText += `Format: PDF Report (Masked PII: ${options.maskPII})\n`;
      reportText += `====================================================\n\n`;

      filtered.forEach((l, idx) => {
        reportText += `[${idx + 1}] ID: ${l.id} | ${l.timestamp}\n`;
        reportText += `     Request: ${l.requestId} | Session: ${l.sessionId}\n`;
        reportText += `     Actor: ${l.userId} (${l.role}) via ${l.channel}\n`;
        reportText += `     Action: ${l.action} | Tool: ${l.toolName || '-'} | Risk: ${l.riskLevel || 'LOW'}\n`;
        reportText += `     Auth: ${l.authorization} | Status: ${l.status} (${l.durationMs}ms)\n`;
        if (l.details) reportText += `     Details: ${l.details}\n`;
        reportText += `----------------------------------------------------\n`;
      });

      return {
        filename: `AI_Audit_Report_RT07_${timestampStr}.pdf`,
        content: reportText,
        mimeType: 'application/pdf'
      };
    }
  }
}
