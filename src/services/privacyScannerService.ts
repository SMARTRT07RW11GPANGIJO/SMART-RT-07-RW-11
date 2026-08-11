// SMART RT 07 RW 11 GPA NGIJO - TAHAP 9F DETERMINISTIC PRIVACY SCANNER SERVICE

export interface PrivacyScanResult {
  hasLeakage: boolean;
  leakedTypes: ('NIK' | 'KK' | 'PHONE' | 'EMAIL' | 'API_TOKEN' | 'SECRET_KEY' | 'SYSTEM_PROMPT')[];
  matches: string[];
  maskedOutput: string;
}

export class PrivacyScannerService {
  private static NIK_REGEX = /\b(3[0-9]{15}|1[0-9]{15}|5[0-9]{15}|7[0-9]{15})\b/g;
  private static KK_REGEX = /\b(35[0-9]{14}|31[0-9]{14}|32[0-9]{14})\b/g;
  private static PHONE_REGEX = /\b(\+?62|0)8[1-9][0-9]{7,10}\b/g;
  private static EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private static API_TOKEN_REGEX = /(AIzaSy[A-Za-z0-9_-]{33}|sk-[A-Za-z0-9]{32,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/g;
  private static SECRET_KEY_REGEX = /(POSTGRES_PASSWORD|GEMINI_API_KEY|WA_API_TOKEN|FIREBASE_ADMIN_KEY|STRIPE_SECRET_KEY|DB_PASSWORD|DATABASE_URL=postgres:\/\/[^\s]+)/gi;
  private static SYSTEM_PROMPT_REGEX = /(You are RITA|System Instructions:|Antigravity agent|ROLE MATRIX FOR RT07|8D Authorization Enforcement)/gi;

  /**
   * Scans text for any PII or secret/credential leakage
   */
  public static scan(text: string): PrivacyScanResult {
    if (!text) {
      return {
        hasLeakage: false,
        leakedTypes: [],
        matches: [],
        maskedOutput: ''
      };
    }

    const leakedTypes: ('NIK' | 'KK' | 'PHONE' | 'EMAIL' | 'API_TOKEN' | 'SECRET_KEY' | 'SYSTEM_PROMPT')[] = [];
    const matches: string[] = [];
    let masked = text;

    // 1. Scan NIK
    const nikMatches = text.match(this.NIK_REGEX);
    if (nikMatches && nikMatches.length > 0) {
      leakedTypes.push('NIK');
      nikMatches.forEach((m) => {
        matches.push(`NIK:${m}`);
        masked = masked.replace(m, this.maskNIK(m));
      });
    }

    // 2. Scan KK
    const kkMatches = text.match(this.KK_REGEX);
    if (kkMatches && kkMatches.length > 0) {
      if (!leakedTypes.includes('KK')) leakedTypes.push('KK');
      kkMatches.forEach((m) => {
        matches.push(`KK:${m}`);
        masked = masked.replace(m, this.maskKK(m));
      });
    }

    // 3. Scan Phone
    const phoneMatches = text.match(this.PHONE_REGEX);
    if (phoneMatches && phoneMatches.length > 0) {
      leakedTypes.push('PHONE');
      phoneMatches.forEach((m) => {
        matches.push(`PHONE:${m}`);
        masked = masked.replace(m, this.maskPhone(m));
      });
    }

    // 4. Scan Email
    const emailMatches = text.match(this.EMAIL_REGEX);
    if (emailMatches && emailMatches.length > 0) {
      leakedTypes.push('EMAIL');
      emailMatches.forEach((m) => {
        matches.push(`EMAIL:${m}`);
        masked = masked.replace(m, this.maskEmail(m));
      });
    }

    // 5. Scan API Tokens
    const tokenMatches = text.match(this.API_TOKEN_REGEX);
    if (tokenMatches && tokenMatches.length > 0) {
      leakedTypes.push('API_TOKEN');
      tokenMatches.forEach((m) => {
        matches.push(`API_TOKEN:${m.substring(0, 8)}...`);
        masked = masked.replace(m, '[REDACTED_API_TOKEN]');
      });
    }

    // 6. Scan Secret Key / Config
    const secretMatches = text.match(this.SECRET_KEY_REGEX);
    if (secretMatches && secretMatches.length > 0) {
      leakedTypes.push('SECRET_KEY');
      secretMatches.forEach((m) => {
        matches.push(`SECRET:${m}`);
        masked = masked.replace(m, '[REDACTED_SECRET]');
      });
    }

    // 7. Scan System Prompt leakage
    const promptMatches = text.match(this.SYSTEM_PROMPT_REGEX);
    if (promptMatches && promptMatches.length > 0) {
      leakedTypes.push('SYSTEM_PROMPT');
      promptMatches.forEach((m) => {
        matches.push(`PROMPT_LEAK:${m}`);
      });
    }

    return {
      hasLeakage: leakedTypes.length > 0,
      leakedTypes,
      matches,
      maskedOutput: masked
    };
  }

  public static maskNIK(nik: string): string {
    if (nik.length < 16) return '3507************';
    return `${nik.slice(0, 4)}************${nik.slice(14)}`;
  }

  public static maskKK(kk: string): string {
    if (kk.length < 16) return '3507************';
    return `${kk.slice(0, 4)}************${kk.slice(14)}`;
  }

  public static maskPhone(phone: string): string {
    if (phone.length <= 4) return '08********';
    return `${phone.slice(0, 3)}********${phone.slice(-2)}`;
  }

  public static maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length < 2) return '***@***.com';
    const user = parts[0];
    const domain = parts[1];
    return `${user.slice(0, 2)}***@${domain}`;
  }
}
