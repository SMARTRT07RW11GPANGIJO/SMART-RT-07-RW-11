// SMART RT 07 RW 11 GPA NGIJO - AI AUDIT SERVICE v1.0
// Tamper-evident, Append-only Audit Logger for All AI Agent Events

import { AIAuditRecord, AISecurityEvent, AIIntent } from '../../types/aiAgent';
import { UserRole } from '../../types/rt';

const AI_AUDIT_STORAGE_KEY = 'SMART_RT_AI_AUDIT_LOGS_V1';

export function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClear = ascii + '\x80';
  while (compositeClear[lengthProperty] % 64 - 56) compositeClear += '\x00';

  for (i = 0; i < compositeClear[lengthProperty]; i++) {
    j = compositeClear.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export class AIAuditService {
  private static logs: AIAuditRecord[] = [];

  static {
    this.loadLogs();
  }

  private static loadLogs(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(AI_AUDIT_STORAGE_KEY);
        if (raw) {
          this.logs = JSON.parse(raw);
        }
      }
    } catch {
      this.logs = [];
    }
  }

  private static persistLogs(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AI_AUDIT_STORAGE_KEY, JSON.stringify(this.logs));
      }
    } catch {
      // Storage full or unavailable
    }
  }

  public static logEvent(params: {
    requestId: string;
    userId: string;
    role: UserRole;
    channel: string;
    event: AISecurityEvent;
    intent: AIIntent;
    toolUsed?: string;
    status: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'WARNING' | 'ERROR';
    details: string;
    clientIp?: string;
    durationMs: number;
  }): AIAuditRecord {
    const record: AIAuditRecord = {
      logId: `AILOG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      requestId: params.requestId,
      userId: params.userId || 'ANONYMOUS',
      role: params.role,
      channel: params.channel,
      event: params.event,
      intent: params.intent,
      toolUsed: params.toolUsed,
      status: params.status,
      details: params.details,
      clientIp: params.clientIp || '127.0.0.1',
      durationMs: params.durationMs
    };

    this.logs.unshift(record);
    if (this.logs.length > 2000) {
      this.logs.pop();
    }
    this.persistLogs();

    return record;
  }

  public static getLogs(limit: number = 100): AIAuditRecord[] {
    return this.logs.slice(0, limit);
  }

  public static getSecurityIncidents(limit: number = 50): AIAuditRecord[] {
    return this.logs
      .filter((l) => ['DENIED', 'BLOCKED', 'WARNING', 'ERROR'].includes(l.status))
      .slice(0, limit);
  }

  public static clearLogs(): void {
    this.logs = [];
    this.persistLogs();
  }

  public static computeAuditFingerprint(): string {
    const serialized = JSON.stringify(this.logs.map((l) => `${l.logId}:${l.timestamp}:${l.event}:${l.status}`));
    return sha256Hex(serialized);
  }
}
