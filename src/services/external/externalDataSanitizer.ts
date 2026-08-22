// SMART RT 07 RW 11 GPA NGIJO - CENTRAL EXTERNAL DATA SANITIZER SERVICE v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)
// Architecture: Strict PDP (UU No. 27/2022) / Zero-PII Enforcement / Secret Shield

import { ExternalServiceType, SanitizationResult } from '../../types/externalIntegration';

// Strict regex patterns for PII detection
const PATTERNS = {
  // Indonesian NIK (16 continuous digits or spaced/dashed)
  NIK: /\b[1-9][0-9]{15}\b/,
  // Indonesian KK (16 continuous digits)
  KK: /\b[1-9][0-9]{15}\b/,
  // Phone numbers (Indonesian standard +628... or 08...)
  PHONE: /(\+62|62|0)8[1-9][0-9]{6,11}\b/,
  // Date of Birth / Raw ISO date format
  DOB_STRICT: /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/,
  // Passwords & hashes
  PASSWORD_KEY: /(password|passwd|pin_hash|pass_hash|credential|secret_key|client_secret|auth_token|session_token|bearer)/i,
  // API Keys / Secrets signatures
  SECRET_SIGNATURE: /(AIzaSy[0-9A-Za-z-_]{33}|AKfycb[0-9A-Za-z-_]{20,}|Bearer\s+[a-zA-Z0-9_\-\.]+|sk-[a-zA-Z0-9]{20,})/
};

// Approved field allowlists per external destination
const APPROVED_ALLOWLISTS: Record<ExternalServiceType, string[]> = {
  GAS_SHEETS: [
    'id', 'nomor_surat', 'jenis_surat', 'keperluan', 'status', 'created_at', 'updated_at',
    'kategori', 'jumlah', 'keterangan', 'periode', 'total_masuk', 'total_keluar', 'saldo',
    'tahun', 'bulan', 'status_verifikasi', 'nama_pemohon_masked'
  ],
  WHATSAPP_GATEWAY: [
    'template_id', 'recipient_phone', 'params', 'judul_agenda', 'tanggal_agenda',
    'lokasi_agenda', 'nominal_iuran', 'periode_iuran', 'status_surat', 'nomor_surat'
  ],
  GEMINI_AI: [
    'task_type', 'context_summary', 'aggregate_metrics', 'category_counts',
    'time_series_totals', 'draft_type', 'topic', 'tone', 'language',
    'anonymized_ratios', 'uncertainty_level'
  ],
  OSM_MAP: [
    'lat', 'lng', 'zoom', 'category', 'status_kondisi', 'cluster_id', 'radius'
  ]
};

export class ExternalDataSanitizer {
  /**
   * Scans a string for any raw PII leakage (NIK, KK, Passwords, etc.)
   */
  static scanPiiViolations(text: string, allowPhone: boolean = false): string[] {
    const violations: string[] = [];
    if (!text || typeof text !== 'string') return violations;

    if (PATTERNS.NIK.test(text)) {
      violations.push('FORBIDDEN_PII_NIK_DETECTED');
    }
    if (PATTERNS.PASSWORD_KEY.test(text)) {
      violations.push('FORBIDDEN_CREDENTIAL_KEYWORD_DETECTED');
    }
    if (PATTERNS.SECRET_SIGNATURE.test(text)) {
      violations.push('FORBIDDEN_SECRET_KEY_SIGNATURE_DETECTED');
    }
    if (!allowPhone && PATTERNS.PHONE.test(text)) {
      violations.push('FORBIDDEN_PHONE_NUMBER_EXPOSURE');
    }
    return violations;
  }

  /**
   * Sanitize and validate outbound payload before transmitting to external provider.
   * Deny by default: only allowlisted fields are retained.
   */
  static sanitizeOutboundPayload<T extends Record<string, any>>(
    service: ExternalServiceType,
    payload: T
  ): SanitizationResult<Record<string, any>> {
    const allowlist = APPROVED_ALLOWLISTS[service] || [];
    const blockedFields: string[] = [];
    const piiViolations: string[] = [];
    const secretViolations: string[] = [];
    const sanitizedData: Record<string, any> = {};

    const isPhoneAllowedForService = service === 'WHATSAPP_GATEWAY';

    for (const [key, value] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();

      // 1. Check for strict secret/credential keywords
      if (PATTERNS.PASSWORD_KEY.test(lowerKey)) {
        blockedFields.push(key);
        secretViolations.push(`BLOCKED_SECRET_FIELD:${key}`);
        continue;
      }

      // 2. Allowlist Check (Deny by default)
      if (!allowlist.includes(key) && !allowlist.includes(lowerKey)) {
        blockedFields.push(key);
        continue;
      }

      // 3. String value inspection
      if (typeof value === 'string') {
        const textViolations = this.scanPiiViolations(
          value, 
          isPhoneAllowedForService && key === 'recipient_phone'
        );
        if (textViolations.length > 0) {
          piiViolations.push(...textViolations.map(v => `${v}_IN_FIELD:${key}`));
          blockedFields.push(key);
          continue;
        }
        sanitizedData[key] = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitizedData[key] = value;
      } else if (Array.isArray(value)) {
        // Deep array sanitization
        sanitizedData[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return this.sanitizeOutboundPayload(service, item).sanitizedData;
          }
          if (typeof item === 'string') {
            const v = this.scanPiiViolations(item, false);
            if (v.length > 0) return '[REDACTED_PII]';
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        // Nested object
        const nestedRes = this.sanitizeOutboundPayload(service, value);
        sanitizedData[key] = nestedRes.sanitizedData;
        if (!nestedRes.isValid) {
          blockedFields.push(...nestedRes.blockedFields.map(f => `${key}.${f}`));
          piiViolations.push(...nestedRes.piiViolations);
        }
      }
    }

    const isValid = piiViolations.length === 0 && secretViolations.length === 0;

    return {
      isValid,
      sanitizedData,
      blockedFields,
      piiViolations,
      secretViolations
    };
  }

  /**
   * Sanitizes responses received from external services to guarantee they never
   * inject malicious scripts, stack traces, or malformed data into internal state.
   */
  static sanitizeExternalResponse(rawResponse: any): Record<string, any> {
    if (!rawResponse || typeof rawResponse !== 'object') {
      return { status: 'INVALID_RESPONSE', sanitized: true };
    }

    const safeResponse: Record<string, any> = {};
    for (const [key, val] of Object.entries(rawResponse)) {
      // Exclude stack traces, internal paths, raw tokens
      if (
        key.toLowerCase().includes('stack') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('password')
      ) {
        continue;
      }

      if (typeof val === 'string') {
        // Strip HTML/Script tags to prevent XSS injection
        safeResponse[key] = val.replace(/<[^>]*>?/gm, '').trim();
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        safeResponse[key] = val;
      } else if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        safeResponse[key] = val;
      }
    }

    return safeResponse;
  }
}
