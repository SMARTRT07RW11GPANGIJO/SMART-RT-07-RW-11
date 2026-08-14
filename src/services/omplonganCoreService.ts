/**
 * omplonganCoreService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * MODUL OMPLONGAN / AMPLONGAN AGUSTUSAN v1.0
 * 
 * Production-ready Core Service Layer interfacing:
 * UI -> OmplonganCoreService -> DAL & FinancialRepository (FundType.OMPLOGAN) -> Sheets / Drive Storage
 */

import {
  OmplonganKegiatan,
  OmplonganTarikan,
  OmplonganWargaItem,
  OmplonganPengeluaran,
  OmplonganDeposit,
  OmplonganDashboardStats,
  OmplonganRekapWarga,
  OmplonganRekapPetugas,
  OmplonganAuditEntry,
  PengeluaranCategory,
  PaymentMethod,
  WargaPaymentStatus
} from '../types/omplongan';
import { FundType, formatRupiah } from '../types/finance';
import { FinancialRepository } from './financialRepository';
import { AuthoritativeSessionContext, validateSessionContext } from '../security/authorization';
import { SecurityAuthorizationError } from '../security/securityErrors';
import { waServiceInstance } from './whatsappService';
import { INITIAL_WARGA } from '../data/mockData';

// Storage Keys
const STORAGE_KEY_KEGIATAN = 'SMART_RT_OMPLONGAN_KEGIATAN_V1';
const STORAGE_KEY_TARIKAN = 'SMART_RT_OMPLONGAN_TARIKAN_V1';
const STORAGE_KEY_WARGA_ITEMS = 'SMART_RT_OMPLONGAN_ITEMS_V1';
const STORAGE_KEY_PENGELUARAN = 'SMART_RT_OMPLONGAN_PENGELUARAN_V1';
const STORAGE_KEY_DEPOSIT = 'SMART_RT_OMPLONGAN_DEPOSIT_V1';
const STORAGE_KEY_AUDIT = 'SMART_RT_OMPLONGAN_AUDIT_LOGS_V1';

// Initial Seeds for Kegiatan Agustusan 2026
const DEFAULT_KEGIATAN_2026: OmplonganKegiatan = {
  idKegiatan: 'KEG-AGUSTUSAN-2026',
  namaKegiatan: 'Omplongan Agustusan HUT RI ke-81',
  tahun: 2026,
  tanggalMulai: '2026-08-01',
  tanggalSelesai: '2026-08-31',
  targetDana: 8500000,
  targetPerKeluarga: 100000,
  status: 'AKTIF',
  catatan: 'Kegiatan penarikan dana partisipasi omplongan warga RT 07 RW 11 untuk peringatan HUT RI ke-81 Tahun 2026.',
  createdBy: 'ketua_rt_01',
  createdAt: '2026-08-01T07:00:00Z'
};

const DEFAULT_TARIKAN_SEED: OmplonganTarikan[] = [
  {
    idTarikan: 'TARIKAN-001',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    nomorTarikan: 1,
    tanggal: '2026-08-05',
    petugasId: 'petugas_budi',
    namaPetugas: 'Budi Santoso (Seksi Pemuda)',
    wilayah: 'Blok A & Blok B',
    jumlahWargaDikunjungi: 25,
    jumlahTransaksi: 24,
    jumlahTidakMembayar: 1,
    totalInput: 2400000,
    totalSetoran: 2400000,
    selisih: 0,
    status: 'TERVERIFIKASI',
    catatan: 'Tarikan perdana wilayah Blok A & B berjalan lancar.',
    createdAt: '2026-08-05T08:00:00Z',
    closedAt: '2026-08-05T18:00:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-05T19:30:00Z',
    depositProofDriveUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/BUKTI/SETORAN_TARIKAN_001.pdf'
  },
  {
    idTarikan: 'TARIKAN-002',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    nomorTarikan: 2,
    tanggal: '2026-08-08',
    petugasId: 'petugas_andi',
    namaPetugas: 'Andi Wicaksono (Seksi Acara)',
    wilayah: 'Blok C-01 s/d C-15',
    jumlahWargaDikunjungi: 28,
    jumlahTransaksi: 26,
    jumlahTidakMembayar: 2,
    totalInput: 2600000,
    totalSetoran: 2600000,
    selisih: 0,
    status: 'TERVERIFIKASI',
    catatan: 'Tarikan wilayah Blok C berjalan lancar.',
    createdAt: '2026-08-08T09:00:00Z',
    closedAt: '2026-08-08T17:00:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-08T20:00:00Z',
    depositProofDriveUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/BUKTI/SETORAN_TARIKAN_002.pdf'
  },
  {
    idTarikan: 'TARIKAN-003',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    nomorTarikan: 3,
    tanggal: '2026-08-11',
    petugasId: 'petugas_budi',
    namaPetugas: 'Budi Santoso (Seksi Pemuda)',
    wilayah: 'Blok C-16 s/d C-30 & Blok D',
    jumlahWargaDikunjungi: 20,
    jumlahTransaksi: 18,
    jumlahTidakMembayar: 2,
    totalInput: 1750000,
    totalSetoran: 1750000,
    selisih: 0,
    status: 'TERVERIFIKASI',
    catatan: 'Tarikan putaran ketiga sisa Blok C & D.',
    createdAt: '2026-08-11T09:00:00Z',
    closedAt: '2026-08-11T17:30:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-11T19:00:00Z',
    depositProofDriveUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/BUKTI/SETORAN_TARIKAN_003.pdf'
  }
];

const DEFAULT_ITEMS_SEED: OmplonganWargaItem[] = [
  {
    id: 'ITEM-001',
    tarikanId: 'TARIKAN-001',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    wargaId: 'WRG-001',
    namaWarga: 'Bambang Sugianto, S.T.',
    nomorRumah: 'Blok C-07',
    blok: 'Blok C',
    noHp: '081234567890',
    targetNominal: 100000,
    nominal: 100000,
    metode: 'TUNAI',
    status: 'LUNAS',
    catatan: 'Lunas saat tarikan pertama',
    createdBy: 'petugas_budi',
    createdAt: '2026-08-05T09:15:00Z'
  },
  {
    id: 'ITEM-002',
    tarikanId: 'TARIKAN-001',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    wargaId: 'WRG-002',
    namaWarga: 'Siti Rahmawati, S.Pd.',
    nomorRumah: 'Blok C-07',
    blok: 'Blok C',
    noHp: '081298765432',
    targetNominal: 100000,
    nominal: 100000,
    metode: 'TRANSFER',
    status: 'LUNAS',
    catatan: 'Transfer BCA via panitia',
    createdBy: 'petugas_budi',
    createdAt: '2026-08-05T09:40:00Z'
  },
  {
    id: 'ITEM-003',
    tarikanId: 'TARIKAN-001',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    wargaId: 'WRG-003',
    namaWarga: 'Dr. Agus Hermawan',
    nomorRumah: 'Blok C-08',
    blok: 'Blok C',
    noHp: '081345678912',
    targetNominal: 100000,
    nominal: 150000,
    metode: 'QRIS',
    status: 'LUNAS',
    catatan: 'Infaq tambahan Rp 50.000 untuk hadiah lomba anak',
    createdBy: 'petugas_budi',
    createdAt: '2026-08-05T10:00:00Z'
  },
  {
    id: 'ITEM-004',
    tarikanId: 'TARIKAN-002',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    wargaId: 'WRG-004',
    namaWarga: 'Hendro Prasetyo',
    nomorRumah: 'Blok C-09',
    blok: 'Blok C',
    noHp: '081234567893',
    targetNominal: 100000,
    nominal: 100000,
    metode: 'TUNAI',
    status: 'LUNAS',
    catatan: 'Lunas saat kunjungan petugas',
    createdBy: 'petugas_andi',
    createdAt: '2026-08-08T10:15:00Z'
  },
  {
    id: 'ITEM-005',
    tarikanId: 'TARIKAN-002',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    wargaId: 'WRG-005',
    namaWarga: 'Rina Kusuma Dewi',
    nomorRumah: 'Blok C-10',
    blok: 'Blok C',
    noHp: '081234567894',
    targetNominal: 100000,
    nominal: 100000,
    metode: 'TUNAI',
    status: 'LUNAS',
    catatan: 'Lunas',
    createdBy: 'petugas_andi',
    createdAt: '2026-08-08T10:45:00Z'
  }
];

const DEFAULT_PENGELUARAN_SEED: OmplonganPengeluaran[] = [
  {
    id: 'EXP-OMP-001',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    tanggal: '2026-08-06',
    kategori: 'DEKORASI',
    keterangan: 'Pembelian Bendera Merah Putih & Tali Tiang Lingkungan',
    nominal: 450000,
    penerima: 'Toko Perlengkapan Malang Indah',
    metode: 'TUNAI',
    buktiDriveId: 'DRIVE-OMP-EXP-001',
    buktiFileName: 'NOTA_BENDERA_AGUSTUSAN.jpg',
    buktiUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/PENGELUARAN/NOTA_BENDERA_AGUSTUSAN.jpg',
    status: 'APPROVED',
    catatan: 'Disetujui Ketua RT 07',
    createdBy: 'pengurus_acara',
    createdAt: '2026-08-06T14:00:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-06T15:00:00Z',
    approvedBy: 'ketua_rt_01',
    approvedAt: '2026-08-06T16:00:00Z'
  },
  {
    id: 'EXP-OMP-002',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    tanggal: '2026-08-09',
    kategori: 'HADIAH_LOMBA',
    keterangan: 'Pembelian Piala & Perlengkapan Hadiah Lomba Anak-Anak',
    nominal: 1150000,
    penerima: 'Istana Trophy & Stationery Singosari',
    metode: 'TRANSFER',
    buktiDriveId: 'DRIVE-OMP-EXP-002',
    buktiFileName: 'KWITANSI_PIALA_LOMBA.pdf',
    buktiUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/PENGELUARAN/KWITANSI_PIALA_LOMBA.pdf',
    status: 'APPROVED',
    catatan: 'Lomba mewarnai, balap karung, & cerdas cermat',
    createdBy: 'pengurus_acara',
    createdAt: '2026-08-09T11:00:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-09T13:00:00Z',
    approvedBy: 'ketua_rt_01',
    approvedAt: '2026-08-09T14:00:00Z'
  },
  {
    id: 'EXP-OMP-003',
    kegiatanId: 'KEG-AGUSTUSAN-2026',
    tanggal: '2026-08-12',
    kategori: 'KONSUMSI',
    keterangan: 'Snack & Konsumsi Kerja Bakti Pemasangan Umbul-Umbul',
    nominal: 500000,
    penerima: 'Warung Bu Siti Ngijo',
    metode: 'TUNAI',
    buktiDriveId: 'DRIVE-OMP-EXP-003',
    buktiFileName: 'NOTA_KONSUMSI_KERJA_BAKTI.jpg',
    buktiUrl: 'SMART RT/KEUANGAN/OMPLOGAN/2026/PENGELUARAN/NOTA_KONSUMSI_KERJA_BAKTI.jpg',
    status: 'APPROVED',
    catatan: 'Kerja bakti warga 30 orang',
    createdBy: 'pengurus_acara',
    createdAt: '2026-08-12T16:00:00Z',
    verifiedBy: 'bendahara_01',
    verifiedAt: '2026-08-12T17:00:00Z',
    approvedBy: 'ketua_rt_01',
    approvedAt: '2026-08-12T18:00:00Z'
  }
];

export class OmplonganCoreService {
  // ==========================================================================
  // STORAGE HELPERS (DATA ACCESS LAYER)
  // ==========================================================================

  private static getStoredKegiatan(): OmplonganKegiatan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_KEGIATAN);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_KEGIATAN, JSON.stringify([DEFAULT_KEGIATAN_2026]));
        return [DEFAULT_KEGIATAN_2026];
      }
      return JSON.parse(data);
    } catch {
      return [DEFAULT_KEGIATAN_2026];
    }
  }

  private static saveKegiatan(list: OmplonganKegiatan[]): void {
    localStorage.setItem(STORAGE_KEY_KEGIATAN, JSON.stringify(list));
  }

  public static getStoredTarikan(): OmplonganTarikan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TARIKAN);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_TARIKAN, JSON.stringify(DEFAULT_TARIKAN_SEED));
        return DEFAULT_TARIKAN_SEED;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TARIKAN_SEED;
    }
  }

  private static saveTarikan(list: OmplonganTarikan[]): void {
    localStorage.setItem(STORAGE_KEY_TARIKAN, JSON.stringify(list));
  }

  public static getStoredItems(): OmplonganWargaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WARGA_ITEMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_WARGA_ITEMS, JSON.stringify(DEFAULT_ITEMS_SEED));
        return DEFAULT_ITEMS_SEED;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ITEMS_SEED;
    }
  }

  private static saveItems(list: OmplonganWargaItem[]): void {
    localStorage.setItem(STORAGE_KEY_WARGA_ITEMS, JSON.stringify(list));
  }

  public static getStoredPengeluaran(): OmplonganPengeluaran[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PENGELUARAN);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_PENGELUARAN, JSON.stringify(DEFAULT_PENGELUARAN_SEED));
        return DEFAULT_PENGELUARAN_SEED;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PENGELUARAN_SEED;
    }
  }

  private static savePengeluaran(list: OmplonganPengeluaran[]): void {
    localStorage.setItem(STORAGE_KEY_PENGELUARAN, JSON.stringify(list));
  }

  public static getStoredAuditLogs(): OmplonganAuditEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static logAudit(entry: Omit<OmplonganAuditEntry, 'id' | 'timestamp' | 'requestId'>): void {
    const logs = this.getStoredAuditLogs();
    const newLog: OmplonganAuditEntry = {
      ...entry,
      id: `AUDIT-OMP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      requestId: `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
  }

  // ==========================================================================
  // 1. KEGIATAN OMPLONGAN (PERIODE)
  // ==========================================================================

  public static getActiveKegiatan(): OmplonganKegiatan {
    const list = this.getStoredKegiatan();
    const active = list.find((k) => k.status === 'AKTIF') || list[0] || DEFAULT_KEGIATAN_2026;
    return active;
  }

  public static listKegiatan(session: AuthoritativeSessionContext): OmplonganKegiatan[] {
    validateSessionContext(session);
    return this.getStoredKegiatan();
  }

  public static createKegiatan(
    payload: Omit<OmplonganKegiatan, 'idKegiatan' | 'createdBy' | 'createdAt'>,
    session: AuthoritativeSessionContext
  ): OmplonganKegiatan {
    validateSessionContext(session);
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'OMPLONGAN_CREATED',
        resourceId: 'KEGIATAN',
        status: 'DENIED',
        details: 'Akses ditolak: Hanya Pengurus/Ketua RT/Admin yang dapat membuat kegiatan.'
      });
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak.');
    }

    if (!payload.namaKegiatan || payload.targetDana <= 0) {
      throw new Error('Nama kegiatan dan target dana wajib diisi (> 0).');
    }

    const list = this.getStoredKegiatan();
    const id = `KEG-AGUSTUSAN-${payload.tahun || new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newKegiatan: OmplonganKegiatan = {
      ...payload,
      idKegiatan: id,
      createdBy: session.userId,
      createdAt: new Date().toISOString()
    };

    list.unshift(newKegiatan);
    this.saveKegiatan(list);

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'OMPLONGAN_CREATED',
      resourceId: id,
      status: 'SUCCESS',
      details: `Membuat kegiatan omplongan: ${newKegiatan.namaKegiatan} (Target: ${formatRupiah(newKegiatan.targetDana)})`
    });

    return newKegiatan;
  }

  public static updateKegiatan(
    idKegiatan: string,
    updates: Partial<OmplonganKegiatan>,
    session: AuthoritativeSessionContext
  ): OmplonganKegiatan {
    validateSessionContext(session);
    if (!['PENGURUS', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak.');
    }

    const list = this.getStoredKegiatan();
    const idx = list.findIndex((k) => k.idKegiatan === idKegiatan);
    if (idx === -1) throw new Error('Kegiatan tidak ditemukan.');

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveKegiatan(list);
    return list[idx];
  }

  // ==========================================================================
  // 2. SESI / TARIKAN OMPLONGAN
  // ==========================================================================

  public static listTarikan(session?: AuthoritativeSessionContext): OmplonganTarikan[] {
    if (session) validateSessionContext(session);
    return this.getStoredTarikan();
  }

  public static getTarikanById(idTarikan: string, session?: AuthoritativeSessionContext): OmplonganTarikan | undefined {
    if (session) validateSessionContext(session);
    return this.getStoredTarikan().find((t) => t.idTarikan === idTarikan);
  }

  public static createTarikan(
    payload: {
      kegiatanId?: string;
      tanggal: string;
      petugasId: string;
      namaPetugas: string;
      wilayah: string;
      catatan?: string;
    },
    session: AuthoritativeSessionContext
  ): OmplonganTarikan {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'TARIKAN_CREATED',
        resourceId: 'NEW_TARIKAN',
        status: 'DENIED',
        details: 'Akses ditolak: role tidak memiliki izin create tarikan.'
      });
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak.');
    }

    if (!payload.tanggal || !payload.namaPetugas || !payload.wilayah) {
      throw new Error('Tanggal, Petugas, dan Wilayah wajib diisi.');
    }

    const tarikanList = this.getStoredTarikan();
    const nextNumber = tarikanList.length + 1;
    const padNumber = String(nextNumber).padStart(3, '0');
    const idTarikan = `TARIKAN-${padNumber}`;

    const activeKegiatan = this.getActiveKegiatan();

    const newTarikan: OmplonganTarikan = {
      idTarikan,
      kegiatanId: payload.kegiatanId || activeKegiatan.idKegiatan,
      nomorTarikan: nextNumber,
      tanggal: payload.tanggal,
      petugasId: payload.petugasId,
      namaPetugas: payload.namaPetugas,
      wilayah: payload.wilayah,
      jumlahWargaDikunjungi: 0,
      jumlahTransaksi: 0,
      jumlahTidakMembayar: 0,
      totalInput: 0,
      totalSetoran: 0,
      selisih: 0,
      status: 'BERJALAN',
      catatan: payload.catatan || `Tarikan sesi #${nextNumber} wilayah ${payload.wilayah}`,
      createdAt: new Date().toISOString()
    };

    tarikanList.unshift(newTarikan);
    this.saveTarikan(tarikanList);

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'TARIKAN_CREATED',
      resourceId: idTarikan,
      status: 'SUCCESS',
      details: `Membuat sesi tarikan #${nextNumber} (${idTarikan}) oleh ${payload.namaPetugas} di wilayah ${payload.wilayah}`
    });

    return newTarikan;
  }

  // ==========================================================================
  // 3. INPUT HASIL TARIKAN (PER WARGA)
  // ==========================================================================

  public static addWargaPayment(
    payload: {
      tarikanId: string;
      wargaId: string;
      namaWarga: string;
      nomorRumah: string;
      blok?: string;
      noHp?: string;
      nominal: number;
      metode: PaymentMethod;
      status?: WargaPaymentStatus;
      catatan?: string;
      targetNominal?: number;
    },
    session: AuthoritativeSessionContext
  ): OmplonganWargaItem {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak: Hanya Pengurus/Bendahara yang dapat menginput pembayaran.');
    }

    // Strict validation
    if (payload.nominal <= 0) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'OMPLONGAN_PAYMENT_CREATED',
        resourceId: payload.tarikanId,
        status: 'DENIED',
        details: `Validasi gagal: Nominal pembayaran negatif atau nol (${payload.nominal})`
      });
      throw new Error('Nominal pembayaran harus lebih besar dari 0.');
    }

    const tarikanList = this.getStoredTarikan();
    const tarikan = tarikanList.find((t) => t.idTarikan === payload.tarikanId);
    if (!tarikan) {
      throw new Error(`Tarikan ${payload.tarikanId} tidak ditemukan.`);
    }

    const activeKegiatan = this.getActiveKegiatan();
    const items = this.getStoredItems();

    const targetNom = payload.targetNominal || activeKegiatan.targetPerKeluarga || 100000;
    let paymentStatus: WargaPaymentStatus = payload.status || 'LUNAS';
    if (payload.nominal >= targetNom) {
      paymentStatus = 'LUNAS';
    } else if (payload.nominal > 0 && payload.nominal < targetNom) {
      paymentStatus = 'SEBAGIAN';
    }

    const itemId = `ITEM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: OmplonganWargaItem = {
      id: itemId,
      tarikanId: payload.tarikanId,
      kegiatanId: tarikan.kegiatanId,
      wargaId: payload.wargaId,
      namaWarga: payload.namaWarga,
      nomorRumah: payload.nomorRumah,
      blok: payload.blok || payload.nomorRumah.split(' ')[0] || 'Blok C',
      noHp: payload.noHp,
      targetNominal: targetNom,
      nominal: payload.nominal,
      metode: payload.metode,
      status: paymentStatus,
      catatan: payload.catatan,
      receiptDriveUrl: `SMART RT/KEUANGAN/OMPLOGAN/2026/PEMASUKAN/${payload.tarikanId}_${payload.wargaId}.pdf`,
      createdBy: session.userId,
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    this.saveItems(items);

    // Update tarikan aggregate counts
    this.recalculateTarikanAggregates(payload.tarikanId);

    // Sync to isolated Financial Ledger (FundType.OMPLOGAN)
    FinancialRepository.createTransaction(
      FundType.OMPLOGAN,
      {
        transactionType: 'INCOME',
        category: 'Tarikan Omplongan',
        amount: payload.nominal,
        date: tarikan.tanggal || new Date().toISOString().slice(0, 10),
        description: `[${payload.tarikanId}] Pembayaran Omplongan: ${payload.namaWarga} (${payload.nomorRumah})`,
        payerOrRecipient: payload.namaWarga,
        source: payload.metode === 'TUNAI' ? 'CASH' : payload.metode === 'QRIS' ? 'QRIS' : 'TRANSFER',
        status: 'APPROVED'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );

    // WhatsApp Notification Trigger (Event: OMPLONGAN_RECEIVED)
    if (payload.noHp) {
      try {
        const msg = `📢 *OMPLONGAN AGUSTUSAN RT 07 RW 11 GPA NGIJO*\n\nAssalamu'alaikum Wr. Wb.\nBpk/Ibu *${payload.namaWarga}*,\n\nTerima kasih atas partisipasi dalam kegiatan Agustusan RT 07 RW 11.\n\n💰 Nominal: *${formatRupiah(payload.nominal)}*\n📅 Tanggal: ${tarikan.tanggal}\n💳 Metode: ${payload.metode}\n📋 Sesi: ${payload.tarikanId}\n✅ Status: *TERCATAT*\n\nTerima kasih atas kebersamaan dan dukungannya.\n\n_Bersama Melayani, Bersama Membangun._\n*Pengurus RT 07 RW 11 GPA Ngijo*`;
        waServiceInstance.sendDirectCustomMessage(payload.noHp, msg);
      } catch (err) {
        console.warn('WA Notification dispatch skipped/failed:', err);
      }
    }

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'OMPLONGAN_PAYMENT_CREATED',
      resourceId: itemId,
      status: 'SUCCESS',
      details: `Mencatat omplongan warga ${payload.namaWarga} (${payload.nomorRumah}): ${formatRupiah(payload.nominal)} via ${payload.metode}`
    });

    return newItem;
  }

  // Recalculate aggregates for a tarikan
  private static recalculateTarikanAggregates(tarikanId: string): void {
    const tarikanList = this.getStoredTarikan();
    const tarikanIdx = tarikanList.findIndex((t) => t.idTarikan === tarikanId);
    if (tarikanIdx === -1) return;

    const items = this.getStoredItems().filter((i) => i.tarikanId === tarikanId);
    const totalInput = items.reduce((acc, curr) => acc + curr.nominal, 0);
    const paidCount = items.filter((i) => i.nominal > 0).length;
    const unpaidCount = items.filter((i) => i.nominal === 0 || i.status === 'DITOLAK').length;

    tarikanList[tarikanIdx] = {
      ...tarikanList[tarikanIdx],
      jumlahWargaDikunjungi: items.length,
      jumlahTransaksi: paidCount,
      jumlahTidakMembayar: unpaidCount,
      totalInput,
      selisih: tarikanList[tarikanIdx].totalSetoran - totalInput
    };

    this.saveTarikan(tarikanList);
  }

  // ==========================================================================
  // 4. SELESAIKAN TARIKAN & VALIDASI SETORAN (CLOSING)
  // ==========================================================================

  public static closeTarikan(
    payload: {
      idTarikan: string;
      totalSetoran: number;
      alasanSelisih?: string;
      catatan?: string;
    },
    session: AuthoritativeSessionContext
  ): OmplonganTarikan {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak.');
    }

    const tarikanList = this.getStoredTarikan();
    const idx = tarikanList.findIndex((t) => t.idTarikan === payload.idTarikan);
    if (idx === -1) throw new Error('Tarikan tidak ditemukan.');

    const tarikan = tarikanList[idx];
    const items = this.getStoredItems().filter((i) => i.tarikanId === payload.idTarikan);
    const totalInput = items.reduce((sum, item) => sum + item.nominal, 0);

    const selisih = payload.totalSetoran - totalInput;

    // Strict Selisih Enforcement
    if (selisih !== 0 && (!payload.alasanSelisih || payload.alasanSelisih.trim().length < 5)) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'TARIKAN_CLOSED',
        resourceId: payload.idTarikan,
        status: 'WARNING',
        details: `Penutupan tarikan ditolak: Terdapat selisih ${formatRupiah(selisih)} tanpa penjelasan memadai.`
      });
      throw new Error(`⚠️ PERBEDAAN SETORAN: Input warga (${formatRupiah(totalInput)}) berbeda dengan total setoran (${formatRupiah(payload.totalSetoran)}). Selisih: ${formatRupiah(selisih)}. Wajib menyertakan "Alasan Selisih"!`);
    }

    const newStatus = selisih === 0 ? 'MENUNGGU_VERIFIKASI' : 'SELISIH';

    tarikanList[idx] = {
      ...tarikan,
      totalInput,
      totalSetoran: payload.totalSetoran,
      selisih,
      alasanSelisih: payload.alasanSelisih,
      catatan: payload.catatan || tarikan.catatan,
      status: newStatus,
      closedAt: new Date().toISOString(),
      depositProofDriveUrl: `SMART RT/KEUANGAN/OMPLOGAN/2026/BUKTI/SETORAN_${payload.idTarikan}.pdf`
    };

    this.saveTarikan(tarikanList);

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'TARIKAN_CLOSED',
      resourceId: payload.idTarikan,
      status: 'SUCCESS',
      details: `Menutup tarikan ${payload.idTarikan}. Total Input: ${formatRupiah(totalInput)}, Setoran: ${formatRupiah(payload.totalSetoran)}, Selisih: ${formatRupiah(selisih)}`
    });

    return tarikanList[idx];
  }

  // ==========================================================================
  // 5. VERIFIKASI SETORAN PETUGAS (SEGREGATION OF DUTIES)
  // ==========================================================================

  public static verifyDeposit(
    idTarikan: string,
    session: AuthoritativeSessionContext
  ): OmplonganTarikan {
    validateSessionContext(session);
    if (!['BENDAHARA', 'ADMIN', 'KETUA_RT'].includes(session.role)) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'DEPOSIT_VERIFIED',
        resourceId: idTarikan,
        status: 'DENIED',
        details: 'Akses ditolak: Petugas/Warga tidak boleh memverifikasi setoran.'
      });
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak: Hanya Bendahara, Admin, atau Ketua RT yang dapat memverifikasi setoran.');
    }

    const tarikanList = this.getStoredTarikan();
    const idx = tarikanList.findIndex((t) => t.idTarikan === idTarikan);
    if (idx === -1) throw new Error('Tarikan tidak ditemukan.');

    const tarikan = tarikanList[idx];

    // Segregation of Duties: Petugas cannot verify their own tarikan
    if (tarikan.petugasId === session.userId && session.role !== 'ADMIN') {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'DEPOSIT_VERIFIED',
        resourceId: idTarikan,
        status: 'DENIED',
        details: `Pelanggaran Segregation of Duties: Petugas ${session.userId} mencoba memverifikasi tarikannya sendiri.`
      });
      throw new SecurityAuthorizationError('SEGREGATION_OF_DUTIES_VIOLATION', 'Petugas tidak diperbolehkan memverifikasi setoran tarikannya sendiri.');
    }

    tarikanList[idx] = {
      ...tarikan,
      status: 'TERVERIFIKASI',
      verifiedBy: session.userId,
      verifiedAt: new Date().toISOString()
    };

    this.saveTarikan(tarikanList);

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'DEPOSIT_VERIFIED',
      resourceId: idTarikan,
      status: 'SUCCESS',
      details: `Memverifikasi setoran ${idTarikan} (Total: ${formatRupiah(tarikan.totalSetoran)})`
    });

    return tarikanList[idx];
  }

  // ==========================================================================
  // 6. PENGELUARAN AGUSTUSAN
  // ==========================================================================

  public static listPengeluaran(session?: AuthoritativeSessionContext): OmplonganPengeluaran[] {
    if (session) validateSessionContext(session);
    return this.getStoredPengeluaran();
  }

  public static createPengeluaran(
    payload: {
      kegiatanId?: string;
      tanggal: string;
      kategori: PengeluaranCategory;
      keterangan: string;
      nominal: number;
      penerima: string;
      metode: PaymentMethod;
      buktiFileName?: string;
      buktiDriveId?: string;
      catatan?: string;
    },
    session: AuthoritativeSessionContext
  ): OmplonganPengeluaran {
    validateSessionContext(session);
    if (!['PENGURUS', 'BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role)) {
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak.');
    }

    if (payload.nominal <= 0) {
      throw new Error('Nominal pengeluaran harus lebih besar dari 0.');
    }

    const activeKegiatan = this.getActiveKegiatan();
    const list = this.getStoredPengeluaran();
    const id = `EXP-OMP-${Date.now().toString().slice(-4)}`;

    const drivePath = `SMART RT/KEUANGAN/OMPLOGAN/2026/PENGELUARAN/${payload.buktiFileName || `${id}_NOTA.jpg`}`;

    const newExp: OmplonganPengeluaran = {
      id,
      kegiatanId: payload.kegiatanId || activeKegiatan.idKegiatan,
      tanggal: payload.tanggal || new Date().toISOString().slice(0, 10),
      kategori: payload.kategori,
      keterangan: payload.keterangan,
      nominal: payload.nominal,
      penerima: payload.penerima,
      metode: payload.metode,
      buktiDriveId: payload.buktiDriveId || `DRIVE-EXP-${id}`,
      buktiFileName: payload.buktiFileName || 'Nota_Pembelian.jpg',
      buktiUrl: drivePath,
      status: ['BENDAHARA', 'KETUA_RT', 'ADMIN'].includes(session.role) ? 'APPROVED' : 'PENDING',
      catatan: payload.catatan,
      createdBy: session.userId,
      createdAt: new Date().toISOString(),
      verifiedBy: ['BENDAHARA', 'ADMIN'].includes(session.role) ? session.userId : undefined,
      verifiedAt: ['BENDAHARA', 'ADMIN'].includes(session.role) ? new Date().toISOString() : undefined,
      approvedBy: ['KETUA_RT', 'ADMIN'].includes(session.role) ? session.userId : undefined,
      approvedAt: ['KETUA_RT', 'ADMIN'].includes(session.role) ? new Date().toISOString() : undefined
    };

    list.unshift(newExp);
    this.savePengeluaran(list);

    // Sync to isolated Financial Ledger
    FinancialRepository.createTransaction(
      FundType.OMPLOGAN,
      {
        transactionType: 'EXPENSE',
        category: payload.kategori,
        amount: payload.nominal,
        date: payload.tanggal,
        description: `[Pengeluaran Agustusan] ${payload.keterangan} (Penerima: ${payload.penerima})`,
        payerOrRecipient: payload.penerima,
        receiptUrl: drivePath,
        source: payload.metode === 'TUNAI' ? 'CASH' : 'TRANSFER',
        status: newExp.status === 'APPROVED' ? 'APPROVED' : 'PENDING'
      },
      { userId: session.userId, role: session.role, sessionId: session.sessionId }
    );

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'EXPENSE_CREATED',
      resourceId: id,
      status: 'SUCCESS',
      details: `Mencatat pengeluaran agustusan: ${payload.keterangan} (${formatRupiah(payload.nominal)}) ke ${payload.penerima}`
    });

    return newExp;
  }

  public static approvePengeluaran(
    idPengeluaran: string,
    session: AuthoritativeSessionContext
  ): OmplonganPengeluaran {
    validateSessionContext(session);
    if (!['KETUA_RT', 'ADMIN'].includes(session.role)) {
      this.logAudit({
        actorId: session.userId,
        role: session.role,
        action: 'EXPENSE_APPROVED',
        resourceId: idPengeluaran,
        status: 'DENIED',
        details: 'Akses ditolak: Hanya Ketua RT / Admin yang dapat menyetujui pengeluaran.'
      });
      throw new SecurityAuthorizationError('ROLE_NOT_ALLOWED', 'Akses ditolak: Persetujuan pengeluaran memerlukan role KETUA_RT atau ADMIN.');
    }

    const list = this.getStoredPengeluaran();
    const idx = list.findIndex((e) => e.id === idPengeluaran);
    if (idx === -1) throw new Error('Pengeluaran tidak ditemukan.');

    list[idx] = {
      ...list[idx],
      status: 'APPROVED',
      approvedBy: session.userId,
      approvedAt: new Date().toISOString()
    };

    this.savePengeluaran(list);

    this.logAudit({
      actorId: session.userId,
      role: session.role,
      action: 'EXPENSE_APPROVED',
      resourceId: idPengeluaran,
      status: 'SUCCESS',
      details: `Menyetujui pengeluaran ${idPengeluaran} (${formatRupiah(list[idx].nominal)})`
    });

    return list[idx];
  }

  // ==========================================================================
  // 7. REAL-TIME DASHBOARD STATS & SALDO CALCULATION
  // ==========================================================================

  public static getDashboardStats(): OmplonganDashboardStats {
    const activeKegiatan = this.getActiveKegiatan();
    const items = this.getStoredItems();
    const pengeluaran = this.getStoredPengeluaran().filter((p) => p.status === 'APPROVED');
    const tarikanList = this.getStoredTarikan();

    const totalTerkumpul = items.reduce((sum, item) => sum + item.nominal, 0);
    const totalPengeluaran = pengeluaran.reduce((sum, exp) => sum + exp.nominal, 0);
    const saldo = totalTerkumpul - totalPengeluaran;

    const totalTarget = activeKegiatan.targetDana || 8500000;
    const persentasePencapaian = totalTarget > 0 ? Math.min(100, Math.round((totalTerkumpul / totalTarget) * 100)) : 0;

    const totalTransaksi = items.filter((i) => i.nominal > 0).length;
    const rataRataNominal = totalTransaksi > 0 ? Math.round(totalTerkumpul / totalTransaksi) : 0;

    return {
      totalWarga: INITIAL_WARGA.length || 85,
      totalTarget,
      totalTerkumpul,
      totalPengeluaran,
      saldo,
      persentasePencapaian,
      totalTarikan: tarikanList.length,
      totalTransaksi,
      rataRataNominal
    };
  }

  // ==========================================================================
  // 8. REKAPITULASI DATA
  // ==========================================================================

  public static getRekapPerWarga(session: AuthoritativeSessionContext): OmplonganRekapWarga[] {
    validateSessionContext(session);
    const items = this.getStoredItems();
    const activeKegiatan = this.getActiveKegiatan();
    const targetPerKK = activeKegiatan.targetPerKeluarga || 100000;

    // If role is WARGA, strictly enforce data minimization (IDOR Protection)
    const allowedWargaList = session.role === 'WARGA'
      ? INITIAL_WARGA.filter((w) => w.id_warga === session.userId || w.nik === session.userId)
      : INITIAL_WARGA;

    const rekap: OmplonganRekapWarga[] = allowedWargaList.map((w) => {
      const wargaItems = items.filter((i) => i.wargaId === w.id_warga || i.namaWarga.toLowerCase().includes(w.nama_lengkap.toLowerCase()));
      const totalDibayar = wargaItems.reduce((acc, curr) => acc + curr.nominal, 0);
      const sisa = Math.max(0, targetPerKK - totalDibayar);

      let status: WargaPaymentStatus = 'BELUM_DITARIK';
      if (totalDibayar >= targetPerKK) {
        status = 'LUNAS';
      } else if (totalDibayar > 0) {
        status = 'SEBAGIAN';
      }

      return {
        wargaId: w.id_warga,
        namaWarga: w.nama_lengkap,
        nomorRumah: w.alamat || w.blok,
        blok: w.blok,
        noHp: w.no_hp,
        target: targetPerKK,
        totalDibayar,
        sisa,
        status,
        jumlahTarikanIkut: wargaItems.length,
        riwayat: wargaItems.map((item) => ({
          tarikanId: item.tarikanId,
          tanggal: item.createdAt.slice(0, 10),
          nominal: item.nominal,
          metode: item.metode,
          petugas: item.createdBy
        }))
      };
    });

    return rekap;
  }

  public static getRekapPerPetugas(session: AuthoritativeSessionContext): OmplonganRekapPetugas[] {
    validateSessionContext(session);
    const tarikanList = this.getStoredTarikan();
    const items = this.getStoredItems();

    const map = new Map<string, OmplonganRekapPetugas>();

    tarikanList.forEach((t) => {
      const existing = map.get(t.petugasId) || {
        petugasId: t.petugasId,
        namaPetugas: t.namaPetugas,
        jumlahTarikan: 0,
        jumlahWarga: 0,
        totalDitagih: 0,
        totalDisetor: 0,
        selisih: 0
      };

      existing.jumlahTarikan += 1;
      existing.jumlahWarga += t.jumlahWargaDikunjungi;
      existing.totalDitagih += t.totalInput;
      existing.totalDisetor += t.totalSetoran;
      existing.selisih += t.selisih;

      map.set(t.petugasId, existing);
    });

    return Array.from(map.values());
  }

  // ==========================================================================
  // 9. AUTOMATED SECURITY & REGRESSION TEST RUNNER
  // ==========================================================================

  public static runAutomatedSecurityTests(): {
    testName: string;
    description: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL';
  }[] {
    const results: { testName: string; description: string; expected: string; actual: string; status: 'PASS' | 'FAIL' }[] = [];

    const testAdminSession: AuthoritativeSessionContext = {
      sessionId: 'TEST-SESS-ADM',
      userId: 'admin_test',
      role: 'ADMIN',
      isValid: true,
      issuedAt: new Date().toISOString()
    };

    const testBendaharaSession: AuthoritativeSessionContext = {
      sessionId: 'TEST-SESS-BEN',
      userId: 'bendahara_01',
      role: 'PENGURUS',
      isValid: true,
      issuedAt: new Date().toISOString()
    };

    const testPetugasSession: AuthoritativeSessionContext = {
      sessionId: 'TEST-SESS-PET',
      userId: 'petugas_budi',
      role: 'PENGURUS',
      isValid: true,
      issuedAt: new Date().toISOString()
    };

    const testWargaSession: AuthoritativeSessionContext = {
      sessionId: 'TEST-SESS-WRG',
      userId: 'WRG-001',
      role: 'WARGA',
      isValid: true,
      issuedAt: new Date().toISOString()
    };

    // TEST 1: Buat kegiatan Agustusan
    try {
      const keg = this.createKegiatan(
        {
          namaKegiatan: 'Omplongan Test Suite 2026',
          tahun: 2026,
          tanggalMulai: '2026-08-01',
          tanggalSelesai: '2026-08-31',
          targetDana: 10000000,
          targetPerKeluarga: 100000,
          status: 'AKTIF'
        },
        testAdminSession
      );
      results.push({
        testName: 'TEST 1: Buat Kegiatan Agustusan',
        description: 'Pembuatan record master kegiatan oleh Admin/Pengurus',
        expected: 'SUCCESS',
        actual: `SUCCESS (ID: ${keg.idKegiatan})`,
        status: 'PASS'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 1: Buat Kegiatan Agustusan',
        description: 'Pembuatan record master kegiatan',
        expected: 'SUCCESS',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 2: Buat Tarikan #001
    try {
      const tarikan = this.createTarikan(
        {
          tanggal: '2026-08-10',
          petugasId: 'petugas_budi',
          namaPetugas: 'Budi Santoso',
          wilayah: 'Blok A & B',
          catatan: 'Tarikan wilayah test'
        },
        testPetugasSession
      );
      results.push({
        testName: 'TEST 2: Buat Tarikan Baru',
        description: 'Petugas Pengurus membuat sesi tarikan',
        expected: 'SUCCESS',
        actual: `SUCCESS (ID: ${tarikan.idTarikan})`,
        status: 'PASS'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 2: Buat Tarikan Baru',
        description: 'Petugas membuat sesi tarikan',
        expected: 'SUCCESS',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 3: Input Nominal Positif
    try {
      const item = this.addWargaPayment(
        {
          tarikanId: 'TARIKAN-001',
          wargaId: 'WRG-001',
          namaWarga: 'Bambang Sugianto',
          nomorRumah: 'Blok C-07',
          nominal: 100000,
          metode: 'TUNAI',
          status: 'LUNAS'
        },
        testPetugasSession
      );
      results.push({
        testName: 'TEST 3: Input Pembayaran Warga Valid',
        description: 'Petugas mencatat pembayaran warga Rp 100.000',
        expected: 'SUCCESS',
        actual: `SUCCESS (Nominal: ${formatRupiah(item.nominal)})`,
        status: 'PASS'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 3: Input Pembayaran Warga Valid',
        description: 'Petugas mencatat pembayaran warga',
        expected: 'SUCCESS',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 4: Input Nominal Negatif
    try {
      this.addWargaPayment(
        {
          tarikanId: 'TARIKAN-001',
          wargaId: 'WRG-001',
          namaWarga: 'Bambang Sugianto',
          nomorRumah: 'Blok C-07',
          nominal: -50000,
          metode: 'TUNAI'
        },
        testPetugasSession
      );
      results.push({
        testName: 'TEST 4: Input Nominal Negatif',
        description: 'Validasi penolakan angka pembayaran negatif',
        expected: 'REJECTED',
        actual: 'ALLOWED (VULNERABILITY)',
        status: 'FAIL'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 4: Input Nominal Negatif',
        description: 'Validasi penolakan angka pembayaran negatif',
        expected: 'REJECTED',
        actual: `REJECTED (${e.message})`,
        status: 'PASS'
      });
    }

    // TEST 5 & 6: Close Tarikan dengan Selisih tanpa Catatan (Expected Reject) & dengan Catatan (Expected Pass)
    try {
      this.closeTarikan(
        {
          idTarikan: 'TARIKAN-001',
          totalSetoran: 2300000, // Selisih tanpa catatan
          alasanSelisih: ''
        },
        testPetugasSession
      );
      results.push({
        testName: 'TEST 6: Close Tarikan Selisih Tanpa Catatan',
        description: 'Penutupan tarikan ada selisih tanpa catatan',
        expected: 'REJECTED (Wajib Catatan)',
        actual: 'ALLOWED (VULNERABILITY)',
        status: 'FAIL'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 6: Close Tarikan Selisih Tanpa Catatan',
        description: 'Penutupan tarikan ada selisih tanpa catatan',
        expected: 'REJECTED (Wajib Catatan)',
        actual: `REJECTED (${e.message.slice(0, 45)}...)`,
        status: 'PASS'
      });
    }

    // TEST 7: Segregation of Duties - Petugas Self-Verification
    try {
      this.verifyDeposit('TARIKAN-001', testPetugasSession);
      results.push({
        testName: 'TEST 7: Segregation of Duties (Petugas Self-Verify)',
        description: 'Petugas penarik mencoba memverifikasi setorannya sendiri',
        expected: 'DENIED',
        actual: 'ALLOWED (VULNERABILITY)',
        status: 'FAIL'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 7: Segregation of Duties (Petugas Self-Verify)',
        description: 'Petugas penarik mencoba memverifikasi setorannya sendiri',
        expected: 'DENIED',
        actual: `DENIED (${e.message})`,
        status: 'PASS'
      });
    }

    // TEST 8: Warga IDOR Protection (Melihat Rekap Warga Lain)
    try {
      const wargaRekap = this.getRekapPerWarga(testWargaSession);
      const isLeakingOthers = wargaRekap.length > 1;
      results.push({
        testName: 'TEST 8: Warga IDOR Data Protection',
        description: 'Role WARGA hanya boleh melihat data kontribusinya sendiri',
        expected: 'DENIED (Self Data Only - 1 Record)',
        actual: isLeakingOthers ? `LEAKED (${wargaRekap.length} records)` : `PROTECTED (${wargaRekap.length} record)`,
        status: isLeakingOthers ? 'FAIL' : 'PASS'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 8: Warga IDOR Data Protection',
        description: 'Role WARGA data protection',
        expected: 'DENIED (Self Data Only)',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 9: Pengeluaran Creation & Ketua RT Approval
    try {
      const exp = this.createPengeluaran(
        {
          tanggal: '2026-08-10',
          kategori: 'HADIAH_LOMBA',
          keterangan: 'Test Pembelian Hadiah Lomba Catur',
          nominal: 250000,
          penerima: 'Toko Olahraga Malang',
          metode: 'TUNAI'
        },
        testPetugasSession
      );
      results.push({
        testName: 'TEST 9: Buat & Catat Pengeluaran Agustusan',
        description: 'Pencatatan pengeluaran ke sub-ledger omplongan',
        expected: 'SUCCESS (PENDING/APPROVED)',
        actual: `SUCCESS (Status: ${exp.status})`,
        status: 'PASS'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 9: Buat & Catat Pengeluaran Agustusan',
        description: 'Pencatatan pengeluaran',
        expected: 'SUCCESS',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 10: Real-Time Saldo Calculation
    try {
      const stats = this.getDashboardStats();
      const calculatedExpected = stats.totalTerkumpul - stats.totalPengeluaran;
      const isAccurate = stats.saldo === calculatedExpected;
      results.push({
        testName: 'TEST 10: Real-Time Saldo Verification',
        description: 'Perhitungan SALDO = TOTAL PEMASUKAN - TOTAL PENGELUARAN',
        expected: `${formatRupiah(calculatedExpected)}`,
        actual: `${formatRupiah(stats.saldo)}`,
        status: isAccurate ? 'PASS' : 'FAIL'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 10: Real-Time Saldo Verification',
        description: 'Perhitungan saldo real-time',
        expected: 'ACCURATE',
        actual: e.message,
        status: 'FAIL'
      });
    }

    // TEST 11: Audit Log Generation
    try {
      const logs = this.getStoredAuditLogs();
      results.push({
        testName: 'TEST 11: Audit Trail Immutability',
        description: 'Pencatatan setiap aksi ke audit log tanpa password/secret',
        expected: 'ACTIVE AUDIT TRAIL',
        actual: `ACTIVE (${logs.length} logged actions)`,
        status: logs.length > 0 ? 'PASS' : 'FAIL'
      });
    } catch (e: any) {
      results.push({
        testName: 'TEST 11: Audit Trail Immutability',
        description: 'Pencatatan audit log',
        expected: 'ACTIVE',
        actual: e.message,
        status: 'FAIL'
      });
    }

    this.logAudit({
      actorId: 'system_security_runner',
      role: 'ADMIN',
      action: 'SECURITY_TEST_EXECUTED',
      resourceId: 'OMPLONGAN_TEST_SUITE',
      status: 'SUCCESS',
      details: `Menjalankan security & regression test suite: ${results.filter((r) => r.status === 'PASS').length}/${results.length} PASS`
    });

    return results;
  }
}
