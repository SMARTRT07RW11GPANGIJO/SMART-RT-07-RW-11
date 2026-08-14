// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J AUDIT LOGGER SERVICE WITH HASH CHAINING

import { AIAuditLog, AIAuditEventType, AuditChannel, AuditErrorClassification } from '../types/aiAudit';
import { UserRole } from '../types/rt';
import { DataSanitizerService } from './dataSanitizerService';
import { SecurityAlertService } from './securityAlertService';

const STORAGE_AUDIT_V2_KEY = 'SMART_RT_AI_AUDIT_LOG_V2';
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// In-Memory Fallback Queue in case localStorage fails
const memoryFallbackQueue: AIAuditLog[] = [];

export interface LogEventParams {
  requestId?: string;
  sessionId?: string;
  userId: string;
  residentId?: string;
  role: UserRole;
  channel?: AuditChannel;
  intent?: string;
  toolName?: string;
  action: AIAuditEventType;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  authorization?: 'ALLOWED' | 'DENIED' | 'NOT_APPLICABLE';
  confirmation?: 'REQUIRED' | 'GIVEN' | 'CANCELLED' | 'NOT_APPLICABLE';
  status?: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'PENDING' | 'WARNING';
  durationMs?: number;
  errorCode?: AuditErrorClassification | string;
  details?: any;
}

export class AuditLogger {
  /**
   * Calculate SHA-256 hash representation for record integrity
   */
  private static async computeRecordHash(prevHash: string, recordData: string): Promise<string> {
    const raw = `${prevHash}|${recordData}`;
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(raw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // Fallback pseudo-hash algorithm if crypto.subtle is unavailable
    }

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  /**
   * Retrieve all audit logs from storage
   */
  static getLogs(): AIAuditLog[] {
    try {
      if (typeof localStorage === 'undefined') return this.getSeedAuditLogs().concat(memoryFallbackQueue);
      const raw = localStorage.getItem(STORAGE_AUDIT_V2_KEY);
      if (!raw) return this.getSeedAuditLogs();
      const stored: AIAuditLog[] = JSON.parse(raw);
      return stored.concat(memoryFallbackQueue);
    } catch (e) {
      return this.getSeedAuditLogs().concat(memoryFallbackQueue);
    }
  }

  /**
   * Primary entry point: Asynchronous non-blocking log writer
   */
  static log(params: LogEventParams): AIAuditLog {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reqId = params.requestId || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const sessId = params.sessionId || `SESS-${params.userId}-${dateStr}`;

    // Sanitize any details object
    const sanitizedDetailsStr = params.details
      ? typeof params.details === 'string'
        ? DataSanitizerService.sanitizeString(params.details)
        : JSON.stringify(DataSanitizerService.sanitizePayload(params.details))
      : undefined;

    const currentLogs = this.getLogs();
    const lastRecord = currentLogs[0]; // Most recent record
    const previousHash = lastRecord?.currentHash || GENESIS_HASH;

    const recordId = `AUD-${dateStr}-${(currentLogs.length + 1).toString().padStart(5, '0')}`;
    const timestamp = new Date().toISOString();

    const partialRecord: AIAuditLog = {
      id: recordId,
      timestamp,
      requestId: reqId,
      sessionId: sessId,
      userId: params.userId,
      residentId: params.residentId || params.userId,
      role: params.role,
      channel: params.channel || 'WEB_CHAT',
      intent: params.intent,
      toolName: params.toolName,
      action: params.action,
      riskLevel: params.riskLevel || 'LOW',
      authorization: params.authorization || 'ALLOWED',
      confirmation: params.confirmation || 'NOT_APPLICABLE',
      status: params.status || 'SUCCESS',
      durationMs: params.durationMs || 15,
      errorCode: params.errorCode,
      details: sanitizedDetailsStr,
      previousHash,
      createdAt: timestamp
    };

    // Execute hash computation and storage asynchronously (non-blocking)
    queueMicrotask(async () => {
      try {
        const payloadForHash = `${recordId}:${timestamp}:${reqId}:${params.userId}:${params.action}:${params.status}`;
        const currentHash = await this.computeRecordHash(previousHash, payloadForHash);
        const fullRecord: AIAuditLog = { ...partialRecord, currentHash };

        const allLogs = this.getLogs();
        const updatedLogs = [fullRecord, ...allLogs];

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_AUDIT_V2_KEY, JSON.stringify(updatedLogs.slice(0, 500)));
          } else {
            memoryFallbackQueue.push(fullRecord);
          }
        } catch (storageErr) {
          memoryFallbackQueue.push(fullRecord);
        }

        // Run anomaly check asynchronously
        SecurityAlertService.checkAnomalies(updatedLogs.slice(0, 50));
      } catch (err) {
        console.error('[AuditLogger] Async logging microtask error:', err);
      }
    });

    return partialRecord;
  }

  /**
   * Seed Audit Logs for Demonstration & Initial Analytics
   */
  private static getSeedAuditLogs(): AIAuditLog[] {
    const now = Date.now();
    return [
      {
        id: 'AUD-20260809-00020',
        timestamp: new Date(now - 2 * 60 * 1000).toISOString(),
        requestId: 'REQ-20260809-0891',
        sessionId: 'SESS-WRG-001-20260809',
        userId: 'WRG-001',
        residentId: 'WRG-001',
        role: 'WARGA',
        channel: 'WEB_CHAT',
        intent: 'CREATE_LETTER',
        toolName: 'createLetterRequest',
        action: 'AI_TOOL_EXECUTED',
        riskLevel: 'MEDIUM',
        authorization: 'ALLOWED',
        confirmation: 'GIVEN',
        status: 'SUCCESS',
        durationMs: 420,
        details: 'Surat Pengantar KTP berhasil dibuat untuk warga Ahmad Subagyo.',
        previousHash: '8f12a3b019c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2',
        currentHash: '9a23b4c120d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3',
        createdAt: new Date(now - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'AUD-20260809-00019',
        timestamp: new Date(now - 5 * 60 * 1000).toISOString(),
        requestId: 'REQ-20260809-0890',
        sessionId: 'SESS-WRG-001-20260809',
        userId: 'WRG-001',
        residentId: 'WRG-001',
        role: 'WARGA',
        channel: 'WEB_CHAT',
        intent: 'CREATE_LETTER',
        toolName: 'createLetterRequest',
        action: 'AI_TOOL_CONFIRMATION_REQUIRED',
        riskLevel: 'MEDIUM',
        authorization: 'ALLOWED',
        confirmation: 'REQUIRED',
        status: 'PENDING',
        durationMs: 45,
        details: 'Interception konfirmasi manusia dipicu untuk pembuatan Surat Pengantar KTP.',
        previousHash: '7e01f2a908b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1',
        currentHash: '8f12a3b019c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2',
        createdAt: new Date(now - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'AUD-20260809-00018',
        timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
        requestId: 'REQ-20260809-0888',
        sessionId: 'SESS-WRG-099-20260809',
        userId: 'WRG-099',
        residentId: 'WRG-099',
        role: 'WARGA',
        channel: 'WHATSAPP',
        intent: 'FINANCE_QUERY',
        toolName: 'getFinancialSummary',
        action: 'AI_TOOL_DENIED',
        riskLevel: 'HIGH',
        authorization: 'DENIED',
        confirmation: 'NOT_APPLICABLE',
        status: 'DENIED',
        durationMs: 18,
        errorCode: 'PERMISSION_DENIED',
        details: 'Akses laporan keuangan umum ditolak untuk role WARGA.',
        previousHash: '6d90e1f807a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0',
        currentHash: '7e01f2a908b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1',
        createdAt: new Date(now - 12 * 60 * 1000).toISOString()
      },
      {
        id: 'AUD-20260809-00017',
        timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
        requestId: 'REQ-20260809-0885',
        sessionId: 'SESS-ADMIN-001-20260809',
        userId: 'ADMIN-001',
        residentId: 'ADMIN-001',
        role: 'ADMIN',
        channel: 'SYSTEM',
        intent: 'AUTOMATION_TRIGGER',
        toolName: 'AutomationEngine',
        action: 'AI_AUTOMATION_COMPLETED',
        riskLevel: 'MEDIUM',
        authorization: 'ALLOWED',
        confirmation: 'NOT_APPLICABLE',
        status: 'SUCCESS',
        durationMs: 850,
        details: 'Workflow persetujuan surat berhasil mengeksekusi pembuatan dokumen digital & antrean WA.',
        previousHash: '5c89d0e706f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9',
        currentHash: '6d90e1f807a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0',
        createdAt: new Date(now - 25 * 60 * 1000).toISOString()
      }
    ];
  }
}
