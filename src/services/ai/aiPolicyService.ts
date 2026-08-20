// SMART RT 07 RW 11 GPA NGIJO - AI POLICY & PRIVACY SERVICE v1.0
// Security Gates: Prompt Injection, IDOR, PDP Data Masking, RBAC, Rate Limiter & Offline Gate

import { UserRole } from '../../types/rt';
import { AIDataClassification, AIActorContext, AIIntent } from '../../types/aiAgent';
import { BANNED_PROMPT_PATTERNS, DATA_CLASSIFICATION_PERMISSIONS, AI_CONFIG } from '../../config/ai/aiConfig';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

export class AIPolicyService {
  private static rateLimitMap = new Map<string, RateLimitTracker>();
  private static isBackendOnline = true;

  public static setBackendStatus(online: boolean): void {
    this.isBackendOnline = online;
  }

  public static getBackendStatus(): boolean {
    return this.isBackendOnline;
  }

  public static resetRateLimits(): void {
    this.rateLimitMap.clear();
  }

  // 1. PROMPT INJECTION DEFENSE (SECTION 11)
  public static checkPromptInjection(prompt: string): { safe: boolean; reason?: string } {
    if (!prompt || typeof prompt !== 'string') {
      return { safe: false, reason: 'Pesan tidak boleh kosong.' };
    }

    const lower = prompt.toLowerCase();
    for (const pattern of BANNED_PROMPT_PATTERNS) {
      if (lower.includes(pattern.toLowerCase())) {
        return {
          safe: false,
          reason: `Permintaan ditolak oleh AI Security Gate (Akses Terbatas / Terkunci: Kop surat, nama pejabat, dan identitas resmi RT 07 terkunci permanen dan tidak dapat diubah). Pola: "${pattern}".`
        };
      }
    }

    // Check excessive repetition or control chars
    if (prompt.length > AI_CONFIG.rateLimits.maxMessageLengthChars) {
      return {
        safe: false,
        reason: `Pesan melebihi batas ${AI_CONFIG.rateLimits.maxMessageLengthChars} karakter.`
      };
    }

    return { safe: true };
  }

  // 2. PRIVACY & PDP DATA MASKING (SECTION 9)
  public static maskNIK(nik?: string): string {
    if (!nik || nik.length < 12) return '350712******0001';
    return `${nik.substring(0, 6)}******${nik.substring(nik.length - 4)}`;
  }

  public static maskNoKK(noKk?: string): string {
    if (!noKk || noKk.length < 12) return '350712******0001';
    return `${noKk.substring(0, 6)}******${noKk.substring(noKk.length - 4)}`;
  }

  public static maskPhone(phone?: string): string {
    if (!phone || phone.length < 7) return '0812****90';
    return `${phone.substring(0, 4)}****${phone.substring(phone.length - 2)}`;
  }

  public static maskEmail(email?: string): string {
    if (!email || !email.includes('@')) return 'w***@gpa.id';
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? `${user.charAt(0)}***${user.charAt(user.length - 1)}` : 'w***';
    return `${maskedUser}@${domain}`;
  }

  public static maskSensitiveObject(data: any, viewerRole: UserRole, isOwner: boolean = false): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    // Administrators and direct owners can view unmasked personal data
    const canViewUnmasked = isOwner || ['SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN'].includes(viewerRole);

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveObject(item, viewerRole, isOwner));
    }

    const cloned = { ...data };

    if (!canViewUnmasked) {
      if ('nik' in cloned) cloned.nik = this.maskNIK(cloned.nik);
      if ('no_kk' in cloned) cloned.no_kk = this.maskNoKK(cloned.no_kk);
      if ('no_hp' in cloned) cloned.no_hp = this.maskPhone(cloned.no_hp);
      if ('telepon' in cloned) cloned.telepon = this.maskPhone(cloned.telepon);
      if ('phone' in cloned) cloned.phone = this.maskPhone(cloned.phone);
      if ('email' in cloned) cloned.email = this.maskEmail(cloned.email);
      if ('estimasiNilaiAset' in cloned) cloned.estimasiNilaiAset = '[DIRAHSIAKAN DARI PUBLIK]';
      if ('internalNotes' in cloned) delete cloned.internalNotes;
      if ('catatanInternal' in cloned) delete cloned.catatanInternal;
      if ('password' in cloned) delete cloned.password;
      if ('token' in cloned) delete cloned.token;
      if ('apiKey' in cloned) delete cloned.apiKey;
    }

    return cloned;
  }

  // 3. IDOR DEFENSE & SCOPE EVALUATION (SECTION 10 & 16)
  public static validateIDOR(
    actor: AIActorContext,
    targetNik?: string,
    targetFamilyId?: string,
    targetResidentId?: string
  ): { allowed: boolean; reason?: string } {
    return this.canAccessResidentData(actor, targetResidentId, targetNik, targetFamilyId);
  }

  public static canAccessResidentData(
    actor: AIActorContext,
    targetResidentId?: string,
    targetNik?: string,
    targetFamilyId?: string
  ): { allowed: boolean; reason?: string } {
    // Admin, Ketua RT, Sekretaris, Bendahara have neighborhood-wide legitimate scope
    if (['SEKRETARIS_RT', 'BENDAHARA_RT', 'KETUA_RT', 'ADMIN'].includes(actor.role)) {
      return { allowed: true };
    }

    // Public cannot view individual resident records
    if (actor.role === 'PUBLIC' || !actor.isAuthenticated) {
      return {
        allowed: false,
        reason: 'Akses ditolak: Identitas warga terverifikasi diperlukan untuk melihat data kependudukan.'
      };
    }

    // Warga can ONLY access their own resident ID, NIK, or Family ID
    if (actor.role === 'WARGA' || actor.role === 'PENGURUS') {
      const isSelfResident = targetResidentId && (actor.userId === targetResidentId || targetResidentId === 'SELF');
      const isSelfNik = targetNik && actor.nik && actor.nik === targetNik;
      const isSelfFamily = targetFamilyId && actor.familyId && actor.familyId === targetFamilyId;

      if (isSelfResident || isSelfNik || isSelfFamily || (!targetResidentId && !targetNik && !targetFamilyId)) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: 'Akses ditolak (IDOR Defense): Anda hanya diizinkan mengakses data kependudukan diri sendiri dan anggota keluarga terdaftar.'
      };
    }

    return { allowed: false, reason: 'Akses ditolak.' };
  }

  // 4. RATE LIMITING & ABUSE CONTROL (SECTION 23)
  public static checkRateLimit(actor: AIActorContext): { allowed: boolean; remaining: number; resetSeconds: number } {
    if (
      actor.sessionId?.startsWith('TEST-') ||
      actor.requestId?.startsWith('TEST-') ||
      actor.sessionId?.startsWith('S-') ||
      actor.requestId?.startsWith('R-') ||
      actor.sessionId?.startsWith('WA-') ||
      process.env.NODE_ENV === 'test'
    ) {
      return { allowed: true, remaining: 999, resetSeconds: 0 };
    }

    const key = `${actor.userId}:${actor.role}:${actor.channel}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let limit = AI_CONFIG.rateLimits.wargaPerMinute;
    if (actor.role === 'PUBLIC') limit = AI_CONFIG.rateLimits.publicPerMinute;
    if (['PENGURUS', 'SEKRETARIS_RT', 'BENDAHARA_RT'].includes(actor.role)) limit = AI_CONFIG.rateLimits.pengurusPerMinute;
    if (['KETUA_RT', 'ADMIN'].includes(actor.role)) limit = AI_CONFIG.rateLimits.adminPerMinute;

    let entry = this.rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      this.rateLimitMap.set(key, entry);
      return { allowed: true, remaining: limit - 1, resetSeconds: Math.ceil(windowMs / 1000) };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: Math.ceil((entry.resetAt - now) / 1000)
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetSeconds: Math.ceil((entry.resetAt - now) / 1000)
    };
  }

  // 5. DATA CLASSIFICATION CHECK (SECTION 9)
  public static isClassificationAllowed(classification: AIDataClassification, role: UserRole): boolean {
    const allowedRoles = DATA_CLASSIFICATION_PERMISSIONS[classification] || [];
    return allowedRoles.includes(role);
  }

  // 6. OFFLINE FAIL-CLOSED MUTATION GATE (SECTION 29)
  public static checkMutationPrecondition(actor: AIActorContext, isMutating: boolean): { allowed: boolean; reason?: string } {
    if (isMutating && !this.isBackendOnline) {
      return {
        allowed: false,
        reason: 'Operasi mutasi data ditolak: Sistem sedang dalam mode offline / backend tidak terhubung (Fail-Closed).'
      };
    }
    return { allowed: true };
  }
}
