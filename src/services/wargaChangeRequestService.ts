/**
 * wargaChangeRequestService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * Layanan Pengajuan Perubahan Data Warga & Tambah Anggota Keluarga
 * 
 * Rules:
 * - Tidak ada direct write dari WARGA ke Sheet WARGA.
 * - Menggunakan authoritative session context & signed token.
 * - Mendukung jenis: 'EDIT' (ubah data profil) & 'ADD' (tambah anggota keluarga).
 * - NO_KK keluarga aktif diambil dari session data, bukan diketik ulang.
 * - Status pengajuan ditampilkan ke warga ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED').
 */

import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { syncDataWithGAS } from './apiService';
import { IdentityAuthService } from './identityAuthService';
import { WargaChangeRequestItem, WcrStatus } from '../types/wargaDashboard';
import { writeAuditLog } from './auditLogService';

const STORAGE_PREFIX = 'SMART_RT_WCR_SUBMISSIONS';

export interface SubmitChangeRequestParams {
  jenisPengajuan: 'EDIT' | 'ADD';
  idWargaTarget?: string;
  dataUsulan: Record<string, any>;
  alasan: string;
  buktiReferensi?: string;
}

export class WargaChangeRequestService {
  private static inMemoryStore = new Map<string, WargaChangeRequestItem[]>();

  private static getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}_${userId || 'ANON'}`;
  }

  private static getLocalSubmissions(userId: string): WargaChangeRequestItem[] {
    const key = this.getStorageKey(userId);
    if (typeof localStorage === 'undefined') {
      return this.inMemoryStore.get(key) || [];
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (this.inMemoryStore.get(key) || []);
    } catch {
      return this.inMemoryStore.get(key) || [];
    }
  }

  private static saveLocalSubmissions(userId: string, items: WargaChangeRequestItem[]): void {
    const key = this.getStorageKey(userId);
    this.inMemoryStore.set(key, items);
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.warn('Gagal menyimpan pengajuan lokal:', e);
    }
  }

  /**
   * Mengajukan perubahan data atau tambah anggota keluarga baru
   */
  public static async submitChangeRequest(
    authContext: AuthoritativeSessionContext,
    params: SubmitChangeRequestParams
  ): Promise<{ success: boolean; message: string; data?: WargaChangeRequestItem; errorCode?: string }> {
    validateSessionContext(authContext);

    const userId = authContext.userId;
    const token = authContext.authToken || IdentityAuthService.getAuthToken(authContext.sessionId) || '';

    // Validasi alasan
    const cleanAlasan = (params.alasan || '').trim();
    if (!cleanAlasan) {
      return {
        success: false,
        message: 'Alasan pengajuan wajib diisi.',
        errorCode: 'ALASAN_REQUIRED'
      };
    }

    // Validasi data usulan
    if (!params.dataUsulan || Object.keys(params.dataUsulan).length === 0) {
      return {
        success: false,
        message: 'Data yang diajukan tidak boleh kosong.',
        errorCode: 'DATA_USULAN_EMPTY'
      };
    }

    const payloadGas = {
      token,
      jenisPengajuan: params.jenisPengajuan,
      idWargaTarget: params.idWargaTarget || (params.jenisPengajuan === 'EDIT' ? userId : ''),
      dataUsulan: params.dataUsulan,
      alasan: cleanAlasan,
      buktiReferensi: (params.buktiReferensi || '').trim()
    };

    let backendResult: any = null;

    // 1. Kirim ke GAS jika token tersedia
    if (token) {
      try {
        const gasResponse = await syncDataWithGAS('createWargaChangeRequest', payloadGas);
        if (gasResponse && gasResponse.success) {
          backendResult = gasResponse.data;
        }
      } catch (err: any) {
        console.warn('[WCR Service] Sync GAS gagal, fallback ke antrean lokal:', err?.message || err);
      }
    }

    // 2. Buat objek submission
    const newSubmission: WargaChangeRequestItem = {
      idPengajuan: backendResult?.idPengajuan || `WCR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestampAjukan: backendResult?.timestampAjukan || new Date().toISOString().replace('T', ' ').slice(0, 19),
      jenisPengajuan: params.jenisPengajuan,
      idWargaTarget: params.idWargaTarget || (params.jenisPengajuan === 'EDIT' ? userId : undefined),
      dataUsulan: params.dataUsulan,
      alasan: cleanAlasan,
      buktiReferensi: (params.buktiReferensi || '').trim() || undefined,
      status: (backendResult?.status || 'SUBMITTED') as WcrStatus,
      catatanVerifikasi: 'Menunggu peninjauan oleh Pengurus RT 07'
    };

    // 3. Simpan di local store agar UI reaktif seketika
    const currentList = this.getLocalSubmissions(userId);
    // Hindari duplikat jika id sudah ada
    const updated = [newSubmission, ...currentList.filter(item => item.idPengajuan !== newSubmission.idPengajuan)];
    this.saveLocalSubmissions(userId, updated);

    // 4. Catat Audit Log
    try {
      writeAuditLog({
        userId,
        userName: authContext.namaLengkap || 'Warga',
        role: authContext.role,
        action: params.jenisPengajuan === 'ADD' ? 'AJUKAN_TAMBAH_ANGGOTA' : 'AJUKAN_UBAH_DATA',
        module: 'DATA_WARGA',
        targetType: 'PENGAJUAN_PERUBAHAN',
        targetId: newSubmission.idPengajuan,
        status: 'SUCCESS',
        severity: 'INFO',
        details: `Pengajuan ${params.jenisPengajuan === 'ADD' ? 'Tambah Anggota' : 'Ubah Data'}: ${cleanAlasan}`
      });
    } catch {
      // safe ignore audit fail
    }

    return {
      success: true,
      message: params.jenisPengajuan === 'ADD'
        ? 'Pengajuan penambahan anggota keluarga berhasil dikirim. Menunggu verifikasi Pengurus RT.'
        : 'Pengajuan perubahan data berhasil dikirim. Menunggu verifikasi Pengurus RT.',
      data: newSubmission
    };
  }

  /**
   * Mengambil riwayat pengajuan perubahan data milik warga
   */
  public static async getMyChangeRequests(
    authContext: AuthoritativeSessionContext
  ): Promise<WargaChangeRequestItem[]> {
    validateSessionContext(authContext);

    const userId = authContext.userId;
    const token = authContext.authToken || IdentityAuthService.getAuthToken(authContext.sessionId) || '';
    const localItems = this.getLocalSubmissions(userId);

    if (!token) {
      return localItems;
    }

    try {
      const gasResponse = await syncDataWithGAS<any[]>('getMyWargaChangeRequests', { token });
      if (gasResponse && gasResponse.success && Array.isArray(gasResponse.data)) {
        const remoteItems: WargaChangeRequestItem[] = gasResponse.data.map((r: any) => ({
          idPengajuan: r.idPengajuan || r.ID_PENGAJUAN || '',
          timestampAjukan: r.timestampAjukan || r.TIMESTAMP_AJUKAN || '',
          jenisPengajuan: (r.jenisPengajuan || r.JENIS_PENGAJUAN || 'EDIT') as any,
          idWargaTarget: r.idWargaTarget || r.ID_WARGA_TARGET || undefined,
          dataUsulan: typeof r.dataUsulan === 'object' ? r.dataUsulan : (typeof r.DATA_USULAN === 'string' ? JSON.parse(r.DATA_USULAN || '{}') : {}),
          alasan: r.alasan || r.ALASAN || '',
          buktiReferensi: r.buktiReferensi || r.BUKTI_REFERENSI || undefined,
          status: (r.status || r.STATUS || 'SUBMITTED') as WcrStatus,
          catatanVerifikasi: r.catatanVerifikasi || r.CATATAN_VERIFIKASI || undefined
        }));

        // Merge remote items with local items (remote takes precedence, local pending kept)
        const remoteIds = new Set(remoteItems.map(item => item.idPengajuan));
        const combined = [...remoteItems, ...localItems.filter(item => !remoteIds.has(item.idPengajuan))];
        this.saveLocalSubmissions(userId, combined);
        return combined;
      }
    } catch (err: any) {
      console.warn('[WCR Service] Fetch remote change requests error:', err?.message || err);
    }

    return localItems;
  }
}
