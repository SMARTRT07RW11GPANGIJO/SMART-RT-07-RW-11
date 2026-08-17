import {
  Warga,
  Keluarga,
  PemilikRumah,
  StatusWarga,
  HubunganKeluarga,
  AuditLog
} from '../types/rt';
import { INITIAL_WARGA, INITIAL_KELUARGA, INITIAL_PEMILIK_RUMAH } from '../data/mockData';

export interface ResidentFilterCriteria {
  searchTerm?: string;
  blok?: string;
  statusWarga?: StatusWarga | 'ALL';
  keluargaId?: string;
}

export class ResidentFamilyService {
  private static wargaStore: Warga[] = [...INITIAL_WARGA];
  private static keluargaStore: Keluarga[] = [...INITIAL_KELUARGA];
  private static pemilikStore: PemilikRumah[] = [...INITIAL_PEMILIK_RUMAH];

  // Helper validation: 16 digits
  public static isValid16Digits(val: string): boolean {
    return /^\d{16}$/.test(val);
  }

  // Synchronize internal store
  public static syncInitialData(warga: Warga[], keluarga: Keluarga[], pemilik?: PemilikRumah[]) {
    this.wargaStore = [...warga];
    this.keluargaStore = [...keluarga];
    if (pemilik) {
      this.pemilikStore = [...pemilik];
    }
  }

  // Get all residents
  public static getWargaList(filter?: ResidentFilterCriteria): Warga[] {
    let result = [...this.wargaStore];

    if (filter?.searchTerm) {
      const q = filter.searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.nama_lengkap.toLowerCase().includes(q) ||
          w.nik.includes(q) ||
          w.no_kk.includes(q) ||
          w.blok.toLowerCase().includes(q) ||
          (w.namaPemilikRumah && w.namaPemilikRumah.toLowerCase().includes(q))
      );
    }

    if (filter?.blok) {
      result = result.filter((w) => w.blok === filter.blok);
    }

    if (filter?.statusWarga && filter.statusWarga !== 'ALL') {
      const target = filter.statusWarga;
      result = result.filter((w) => {
        if (w.statusWarga && w.statusWarga === target) return true;
        if (target === 'TETAP' && w.status_warga === 'Tetap') return true;
        if (target === 'KONTRAK_SEWA' && w.status_warga === 'Kontrak') return true;
        if (target === 'KOS' && w.status_warga === 'Kos') return true;
        return false;
      });
    }

    if (filter?.keluargaId) {
      result = result.filter((w) => w.keluargaId === filter.keluargaId);
    }

    return result;
  }

  // Get all families
  public static getKeluargaList(searchTerm?: string): Keluarga[] {
    let result = [...this.keluargaStore];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (k) =>
          (k.nama_kepala_keluarga && k.nama_kepala_keluarga.toLowerCase().includes(q)) ||
          k.no_kk.includes(q) ||
          k.nomorKK?.includes(q) ||
          k.blok.toLowerCase().includes(q) ||
          (k.keluargaId && k.keluargaId.toLowerCase().includes(q))
      );
    }
    return result;
  }

  // Get specific family by ID
  public static getKeluargaById(keluargaId: string): Keluarga | undefined {
    return this.keluargaStore.find((k) => k.keluargaId === keluargaId || k.id_kk === keluargaId);
  }

  // Get family by Nomor KK
  public static getKeluargaByKK(nomorKK: string): Keluarga | undefined {
    return this.keluargaStore.find((k) => k.nomorKK === nomorKK || k.no_kk === nomorKK);
  }

  // Get members of a family
  public static getAnggotaKeluarga(keluargaId: string, nomorKK?: string): Warga[] {
    return this.wargaStore.filter((w) => {
      if (w.keluargaId && w.keluargaId === keluargaId) return true;
      if (nomorKK && (w.nomorKK === nomorKK || w.no_kk === nomorKK)) return true;
      return false;
    });
  }

  // Get all property owners
  public static getPemilikRumahList(): PemilikRumah[] {
    return [...this.pemilikStore];
  }

  // Validate Warga Data with Conditional Housing Status Logic
  public static validateWarga(warga: Partial<Warga>): { valid: boolean; error?: string } {
    if (!warga.nama_lengkap || warga.nama_lengkap.trim() === '') {
      return { valid: false, error: 'Nama lengkap wajib diisi.' };
    }

    if (!warga.nik || !this.isValid16Digits(warga.nik)) {
      return { valid: false, error: 'NIK wajib terdiri dari 16 digit angka valid.' };
    }

    if (warga.no_kk && !this.isValid16Digits(warga.no_kk) && warga.no_kk.length > 0) {
      return { valid: false, error: 'Nomor Kartu Keluarga (KK) harus 16 digit angka.' };
    }

    if (!warga.blok || warga.blok.trim() === '') {
      return { valid: false, error: 'Blok rumah wajib diisi.' };
    }

    const status = warga.statusWarga || (warga.status_warga === 'Kontrak' ? 'KONTRAK_SEWA' : warga.status_warga === 'Kos' ? 'KOS' : 'TETAP');

    // CONDITIONAL VALIDATION: KONTRAK_SEWA & KOS require owner details
    if (status === 'KONTRAK_SEWA' || status === 'KOS') {
      if (!warga.namaPemilikRumah || warga.namaPemilikRumah.trim() === '') {
        return { valid: false, error: 'Nama pemilik rumah wajib diisi untuk status Kontrak/Sewa atau Kos.' };
      }
      if (!warga.teleponPemilikRumah || warga.teleponPemilikRumah.trim() === '') {
        return { valid: false, error: 'Nomor telepon pemilik rumah wajib diisi untuk status Kontrak/Sewa atau Kos.' };
      }
    }

    return { valid: true };
  }

  // Validate Keluarga Data
  public static validateKeluarga(keluarga: Partial<Keluarga>): { valid: boolean; error?: string } {
    const kkNum = keluarga.nomorKK || keluarga.no_kk || '';
    if (!this.isValid16Digits(kkNum)) {
      return { valid: false, error: 'Nomor Kartu Keluarga (KK) wajib 16 digit angka.' };
    }

    if (!keluarga.nama_kepala_keluarga || keluarga.nama_kepala_keluarga.trim() === '') {
      return { valid: false, error: 'Nama Kepala Keluarga wajib diisi.' };
    }

    if (!keluarga.blok || keluarga.blok.trim() === '') {
      return { valid: false, error: 'Blok rumah keluarga wajib diisi.' };
    }

    return { valid: true };
  }

  // Create or Update Warga
  public static createWarga(
    wargaData: Omit<Warga, 'id_warga'> & { id_warga?: string },
    actor: { userId: string; role: string }
  ): { success: boolean; data?: Warga; error?: string; auditLog?: AuditLog } {
    const validation = this.validateWarga(wargaData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check unique NIK for active residents
    const existingNik = this.wargaStore.find(
      (w) => w.nik === wargaData.nik && (!wargaData.id_warga || w.id_warga !== wargaData.id_warga)
    );
    if (existingNik) {
      return { success: false, error: `NIK ${wargaData.nik} sudah terdaftar atas nama ${existingNik.nama_lengkap}.` };
    }

    // Normalize statusWarga
    const statusEnum: StatusWarga = wargaData.statusWarga
      ? wargaData.statusWarga
      : wargaData.status_warga === 'Kontrak'
      ? 'KONTRAK_SEWA'
      : wargaData.status_warga === 'Kos'
      ? 'KOS'
      : 'TETAP';

    // Auto-link to existing Keluarga or create new family reference
    let targetKeluargaId = wargaData.keluargaId;
    const kkNum = wargaData.nomorKK || wargaData.no_kk;
    if (kkNum && !targetKeluargaId) {
      const existingKk = this.getKeluargaByKK(kkNum);
      if (existingKk) {
        targetKeluargaId = existingKk.keluargaId || existingKk.id_kk;
      }
    }

    const newWargaId = wargaData.id_warga || `WRG-${Date.now().toString().slice(-4)}`;
    const newWarga: Warga = {
      ...wargaData,
      id_warga: newWargaId,
      wargaId: newWargaId,
      nomorKK: kkNum || '',
      no_kk: kkNum || '',
      keluargaId: targetKeluargaId,
      statusWarga: statusEnum,
      status_warga: statusEnum === 'KONTRAK_SEWA' ? 'Kontrak' : statusEnum === 'KOS' ? 'Kos' : 'Tetap',
      hubunganKeluarga: wargaData.hubunganKeluarga || 'KEPALA_KELUARGA',
      namaPemilikRumah: statusEnum === 'TETAP' ? undefined : wargaData.namaPemilikRumah,
      teleponPemilikRumah: statusEnum === 'TETAP' ? undefined : wargaData.teleponPemilikRumah,
      createdAt: wargaData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.wargaStore.unshift(newWarga);

    // If property owner data provided, record in pemilikStore
    if ((statusEnum === 'KONTRAK_SEWA' || statusEnum === 'KOS') && newWarga.namaPemilikRumah && newWarga.teleponPemilikRumah) {
      this.recordPemilikRumah({
        namaPemilik: newWarga.namaPemilikRumah,
        nomorTelepon: newWarga.teleponPemilikRumah,
        blokRumah: newWarga.blok,
        statusKepemilikan: statusEnum === 'KONTRAK_SEWA' ? 'KONTRAKAN' : 'KOS'
      });
    }

    const auditLog: AuditLog = {
      id_log: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: actor.userId,
      role: actor.role as any,
      action: 'CREATE_WARGA',
      module: 'USER',
      targetId: newWarga.id_warga,
      status: 'SUCCESS',
      details: `Menambahkan warga baru: ${newWarga.nama_lengkap} (${newWarga.nik}) di ${newWarga.blok}`
    };

    return { success: true, data: newWarga, auditLog };
  }

  // Create Family / KK
  public static createKeluarga(
    keluargaData: Omit<Keluarga, 'id_kk'> & { id_kk?: string },
    actor: { userId: string; role: string }
  ): { success: boolean; data?: Keluarga; error?: string; auditLog?: AuditLog } {
    const validation = this.validateKeluarga(keluargaData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const kkNum = keluargaData.nomorKK || keluargaData.no_kk || '';
    const existingKk = this.getKeluargaByKK(kkNum);
    if (existingKk) {
      return { success: false, error: `Nomor KK ${kkNum} sudah terdaftar an. ${existingKk.nama_kepala_keluarga}.` };
    }

    const newKkId = keluargaData.id_kk || `KK-${Date.now().toString().slice(-4)}`;
    const newKeluargaId = keluargaData.keluargaId || `KEL-2026-${(this.keluargaStore.length + 1).toString().padStart(6, '0')}`;

    const newKk: Keluarga = {
      ...keluargaData,
      id_kk: newKkId,
      keluargaId: newKeluargaId,
      no_kk: kkNum,
      nomorKK: kkNum,
      alamat: keluargaData.alamat || `Perum GPA Ngijo ${keluargaData.blok}`,
      jumlah_anggota: keluargaData.jumlah_anggota || 1,
      status_rumah: keluargaData.status_rumah || 'Milik Sendiri',
      statusKeluarga: 'AKTIF',
      createdAt: keluargaData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.keluargaStore.unshift(newKk);

    const auditLog: AuditLog = {
      id_log: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: actor.userId,
      role: actor.role as any,
      action: 'CREATE_KELUARGA',
      module: 'USER',
      targetId: newKk.keluargaId,
      status: 'SUCCESS',
      details: `Pendaftaran Kartu Keluarga baru an. ${newKk.nama_kepala_keluarga} (KK: ${kkNum}) di ${newKk.blok}`
    };

    return { success: true, data: newKk, auditLog };
  }

  // Assign Warga to Family
  public static assignWargaToKeluarga(
    wargaId: string,
    keluargaId: string,
    hubungan: HubunganKeluarga,
    actor: { userId: string; role: string }
  ): { success: boolean; data?: Warga; error?: string; auditLog?: AuditLog } {
    const warga = this.wargaStore.find((w) => w.id_warga === wargaId);
    if (!warga) {
      return { success: false, error: 'Data warga tidak ditemukan.' };
    }

    const keluarga = this.getKeluargaById(keluargaId);
    if (!keluarga) {
      return { success: false, error: 'Data Kartu Keluarga tidak ditemukan.' };
    }

    warga.keluargaId = keluargaId;
    warga.no_kk = keluarga.no_kk;
    warga.nomorKK = keluarga.no_kk;
    warga.hubunganKeluarga = hubungan;
    warga.updatedAt = new Date().toISOString();

    const auditLog: AuditLog = {
      id_log: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: actor.userId,
      role: actor.role as any,
      action: 'ASSIGN_WARGA_TO_KELUARGA',
      module: 'USER',
      targetId: warga.id_warga,
      status: 'SUCCESS',
      details: `Menghubungkan ${warga.nama_lengkap} ke KK ${keluarga.no_kk} sebagai ${hubungan}`
    };

    return { success: true, data: warga, auditLog };
  }

  // Record Property Owner
  public static recordPemilikRumah(pemilik: Omit<PemilikRumah, 'pemilikRumahId' | 'createdAt' | 'updatedAt'>): PemilikRumah {
    const existing = this.pemilikStore.find(
      (p) => p.namaPemilik.toLowerCase() === pemilik.namaPemilik.toLowerCase() && p.blokRumah === pemilik.blokRumah
    );

    if (existing) {
      existing.nomorTelepon = pemilik.nomorTelepon;
      existing.statusKepemilikan = pemilik.statusKepemilikan;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const newPemilik: PemilikRumah = {
      pemilikRumahId: `OWN-${Date.now().toString().slice(-4)}`,
      namaPemilik: pemilik.namaPemilik,
      nomorTelepon: pemilik.nomorTelepon,
      blokRumah: pemilik.blokRumah,
      statusKepemilikan: pemilik.statusKepemilikan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.pemilikStore.unshift(newPemilik);
    return newPemilik;
  }

  // Privacy Masking Helpers
  public static maskNik(nik: string, isPrivileged: boolean = false): string {
    if (!nik) return '-';
    if (isPrivileged) return nik;
    if (nik.length < 10) return `${nik.slice(0, 2)}******`;
    return `${nik.slice(0, 6)}******${nik.slice(-4)}`;
  }

  public static maskKK(noKk: string, isPrivileged: boolean = false): string {
    if (!noKk) return '-';
    if (isPrivileged) return noKk;
    if (noKk.length < 10) return `${noKk.slice(0, 2)}******`;
    return `${noKk.slice(0, 6)}******${noKk.slice(-4)}`;
  }
}
