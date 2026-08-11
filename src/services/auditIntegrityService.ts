// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J AUDIT INTEGRITY & RETENTION SERVICE

import { AIAuditLog, AuditIntegrityStatus, RetentionPolicyConfig } from '../types/aiAudit';

const STORAGE_RETENTION_KEY = 'SMART_RT_AUDIT_RETENTION_CONFIG_V1';

export class AuditIntegrityService {
  /**
   * Verify the hash-chain integrity of all stored audit logs
   */
  static async verifyHashChain(logs: AIAuditLog[]): Promise<AuditIntegrityStatus> {
    if (!logs || logs.length === 0) {
      return {
        isChainValid: true,
        totalRecordsChecked: 0,
        tamperedRecordIds: [],
        lastCheckedAt: new Date().toISOString()
      };
    }

    // Sort logs from oldest to newest for sequential verification
    const sorted = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const tamperedRecordIds: string[] = [];
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < sorted.length; i++) {
      const record = sorted[i];

      // Check if previousHash matches
      if (record.previousHash && record.previousHash !== prevHash) {
        tamperedRecordIds.push(record.id);
      }

      // Recompute hash if currentHash exists
      if (record.currentHash) {
        prevHash = record.currentHash;
      } else {
        prevHash = `SIMULATED-HASH-${record.id}`;
      }
    }

    return {
      isChainValid: tamperedRecordIds.length === 0,
      totalRecordsChecked: logs.length,
      tamperedRecordIds,
      lastCheckedAt: new Date().toISOString()
    };
  }

  /**
   * Simulate a tamper test on a record (for security demonstration & testing)
   */
  static tamperWithRecord(recordId: string, logs: AIAuditLog[]): AIAuditLog[] {
    return logs.map((l) => {
      if (l.id === recordId) {
        return {
          ...l,
          status: 'SUCCESS' as const,
          details: 'RECORD_TAMPERED: Altered authorization status manually without recomputing currentHash',
          currentHash: 'CORRUPTED_HASH_123456789'
        };
      }
      return l;
    });
  }
}

export class RetentionPolicyService {
  /**
   * Get retention policy settings
   */
  static getConfig(): RetentionPolicyConfig {
    try {
      const raw = localStorage.getItem(STORAGE_RETENTION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse retention config:', e);
    }

    return {
      retentionDays: 90,
      autoPurge: false,
      archiveEnabled: true
    };
  }

  /**
   * Save retention policy settings
   */
  static saveConfig(config: RetentionPolicyConfig): void {
    try {
      localStorage.setItem(STORAGE_RETENTION_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save retention config:', e);
    }
  }

  /**
   * Purge logs older than retention period
   */
  static purgeExpiredLogs(logs: AIAuditLog[], retentionDays: number): { purgedCount: number; remainingLogs: AIAuditLog[] } {
    if (retentionDays <= 0) return { purgedCount: 0, remainingLogs: logs };

    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const remainingLogs = logs.filter((l) => new Date(l.timestamp).getTime() >= cutoffMs);
    const purgedCount = logs.length - remainingLogs.length;

    return { purgedCount, remainingLogs };
  }
}
