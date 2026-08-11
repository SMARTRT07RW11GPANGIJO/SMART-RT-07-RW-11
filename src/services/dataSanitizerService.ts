// SMART RT 07 RW 11 GPA NGIJO - TAHAP 8J DATA SANITIZER SERVICE

export class DataSanitizerService {
  /**
   * Mask NIK (16 digits) -> ************1234
   */
  static maskNIK(nik: string): string {
    if (!nik) return '';
    const clean = nik.replace(/\D/g, '');
    if (clean.length < 4) return '************';
    const last4 = clean.slice(-4);
    return `************${last4}`;
  }

  /**
   * Mask KK (16 digits) -> ************5678
   */
  static maskKK(kk: string): string {
    if (!kk) return '';
    const clean = kk.replace(/\D/g, '');
    if (clean.length < 4) return '************';
    const last4 = clean.slice(-4);
    return `************${last4}`;
  }

  /**
   * Mask Phone Number -> 62812******789
   */
  static maskPhone(phone: string): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 6) return '628**********';
    const prefix = clean.slice(0, 5);
    const suffix = clean.slice(-3);
    return `${prefix}******${suffix}`;
  }

  /**
   * Mask Token / Password / Secret
   */
  static maskSecret(value: string): string {
    if (!value) return '[REDACTED]';
    return '[REDACTED_SECRET]';
  }

  /**
   * Recursively sanitize any object, string, or payload before storing in audit logs
   */
  static sanitizePayload<T>(payload: T): T {
    if (payload === null || payload === undefined) return payload;

    if (typeof payload === 'string') {
      return this.sanitizeString(payload) as unknown as T;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item)) as unknown as T;
    }

    if (typeof payload === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, val] of Object.entries(payload as Record<string, any>)) {
        const lowerKey = key.toLowerCase();

        // Check for sensitive keys
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('otp') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token') ||
          lowerKey.includes('api_key') ||
          lowerKey.includes('private_key')
        ) {
          sanitizedObj[key] = '[MASKED_SECRET]';
        } else if (lowerKey === 'nik' || lowerKey.includes('id_warga_nik')) {
          sanitizedObj[key] = typeof val === 'string' ? this.maskNIK(val) : val;
        } else if (lowerKey === 'no_kk' || lowerKey === 'kk' || lowerKey.includes('no_kartu_keluarga')) {
          sanitizedObj[key] = typeof val === 'string' ? this.maskKK(val) : val;
        } else if (lowerKey === 'no_hp' || lowerKey === 'phone' || lowerKey === 'telepon' || lowerKey === 'whatsapp') {
          sanitizedObj[key] = typeof val === 'string' ? this.maskPhone(val) : val;
        } else if (lowerKey.includes('private_content') || lowerKey.includes('doc_binary') || lowerKey.includes('raw_document')) {
          sanitizedObj[key] = '[PRIVATE_DOCUMENT_CONTENT_OMITTED]';
        } else {
          sanitizedObj[key] = this.sanitizePayload(val);
        }
      }
      return sanitizedObj as T;
    }

    return payload;
  }

  /**
   * Sanitize text string for embedded secrets, NIKs, KKs, or phones
   */
  static sanitizeString(text: string): string {
    if (!text) return '';
    let result = text;

    // Mask NIK pattern (16 digits)
    result = result.replace(/\b\d{12}(\d{4})\b/g, '************$1');

    // Mask Phone pattern (+628 / 08 / 628)
    result = result.replace(/(\+?62|0)8[1-9]\d{7,10}/g, (m) => {
      return this.maskPhone(m);
    });

    // Mask Authorization Headers or Tokens
    result = result.replace(/(Bearer\s+)[A-Za-z0-9-_=\.]+/gi, '$1[MASKED_TOKEN]');
    result = result.replace(/(password|otp|secret|token)\s*=\s*[^\s&]+/gi, '$1=[MASKED_SECRET]');

    return result;
  }
}
