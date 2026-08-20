// SMART RT 07 RW 11 GPA NGIJO - WHATSAPP IDENTITY BINDING SERVICE v1.0
// Authoritative Server-side Phone-to-Resident Resolution & Role Mapping

import { AIActorContext } from '../../types/aiAgent';
import { WAIdentityBindingResult } from '../../types/whatsapp';
import { ResidentFamilyService } from '../residentFamilyService';
import { UserRole } from '../../types/rt';
import { AIAuditService } from '../ai/aiAuditService';

export class WhatsAppIdentityService {
  /**
   * Normalize Indonesian phone number formats (08xxx, 628xxx, +628xxx)
   */
  public static normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('62')) {
      cleaned = '0' + cleaned.slice(2);
    }
    return cleaned;
  }

  /**
   * Authoritative Server-side Resolution of WhatsApp Sender
   * Rejects client-supplied claims and binds strictly to verified database records.
   */
  public static resolveIdentity(senderPhone: string, requestId?: string): WAIdentityBindingResult {
    const normalizedPhone = this.normalizePhoneNumber(senderPhone);
    const reqId = requestId || `REQ-WA-${Date.now()}`;

    // 1. Check if phone exists in authoritative Warga repository
    const allWarga = ResidentFamilyService.getWargaList();
    const matchedResident = allWarga.find((w) => {
      const wPhone = this.normalizePhoneNumber(w.no_hp || '');
      return wPhone && wPhone === normalizedPhone;
    });

    if (matchedResident) {
      // Determine Authoritative Role
      let role: UserRole = 'WARGA';

      // Official Role assignments based on verified community roles
      if (matchedResident.nama_lengkap.toLowerCase().includes('eko sucahyono') || matchedResident.nik === '3507120101850001') {
        role = 'KETUA_RT';
      } else if (
        matchedResident.nama_lengkap.toLowerCase().includes('ahmad subagyo') ||
        matchedResident.nama_lengkap.toLowerCase().includes('budi santoso')
      ) {
        role = 'PENGURUS';
      }

      const actor: AIActorContext = {
        userId: matchedResident.id_warga || matchedResident.wargaId || `WRG-${matchedResident.nik.substring(10)}`,
        userName: matchedResident.nama_lengkap,
        role: role,
        nik: matchedResident.nik,
        familyId: matchedResident.keluargaId,
        phone: senderPhone,
        channel: 'WHATSAPP',
        isAuthenticated: true,
        sessionId: `WA-SESS-${normalizedPhone}`,
        requestId: reqId
      };

      return {
        isLinked: true,
        actor,
        houseBlock: matchedResident.blok,
        residentName: matchedResident.nama_lengkap
      };
    }

    // 2. Unregistered / Unlinked Phone Number Handling
    AIAuditService.logEvent({
      requestId: reqId,
      userId: normalizedPhone || 'UNREGISTERED_WA',
      role: 'PUBLIC',
      channel: 'WHATSAPP',
      event: 'WHATSAPP_UNREGISTERED_IDENTITY',
      intent: 'UNKNOWN',
      status: 'WARNING',
      details: `Inbound WhatsApp request from unregistered phone number: ${senderPhone}. Bound to PUBLIC guest role.`
    });

    const publicActor: AIActorContext = {
      userId: `WA-GUEST-${normalizedPhone.substring(normalizedPhone.length - 4) || 'ANON'}`,
      userName: 'Tamu / Warga Belum Terdaftar',
      role: 'PUBLIC',
      phone: senderPhone,
      channel: 'WHATSAPP',
      isAuthenticated: false,
      sessionId: `WA-SESS-GUEST-${normalizedPhone}`,
      requestId: reqId
    };

    return {
      isLinked: false,
      actor: publicActor,
      reason: 'Nomor WhatsApp belum terdaftar di database SMART RT 07 GPA Ngijo'
    };
  }
}
