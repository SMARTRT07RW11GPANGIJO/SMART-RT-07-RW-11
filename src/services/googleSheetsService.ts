/**
 * googleSheetsService.ts
 * SMART RT 07 RW 11 GPA NGIJO
 * GOOGLE SHEETS & GOOGLE DRIVE INTEGRATION ENGINE
 * 
 * Provides production-ready synchronization, batch export, live spreadsheet viewing,
 * and smart 2-way import between RT 07 local repository and Google Sheets.
 */

import { getAccessToken } from './googleAuthService';
import { Warga, SuratPengantar, TransaksiKeuangan } from '../types/rt';
import { IsolatedFinanceTransaction, FundType, formatRupiah } from '../types/finance';
import { FinancialRepository } from './financialRepository';
import { OmplonganCoreService } from './omplonganCoreService';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: SheetTabInfo[];
}

export interface WargaImportPreview {
  totalRows: number;
  validRecords: Warga[];
  invalidRows: Array<{ rowNumber: number; data: any; reason: string }>;
  duplicateNikCount: number;
}

export interface SyncResult {
  success: boolean;
  sheetName: string;
  rowsWritten: number;
  timestamp: string;
  spreadsheetUrl: string;
  error?: string;
}

export const OFFICIAL_MASTER_SHEET_TITLE = 'SMART RT 07 RW 11 GPA NGIJO - MASTER DATA';
export const DEFAULT_TABS = [
  'Data_Warga',
  'Buku_Kas_RT',
  'Dana_Kematian',
  'Omplongan_Agustusan',
  'Surat_Pengantar',
  'Inventaris_RT',
  'Jadwal_Ronda',
  'Tata_Tertib'
];

export class GoogleSheetsService {
  private static readonly SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
  private static readonly DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

  // Active connected spreadsheet ID stored in memory / local persistence
  private static activeSpreadsheetId: string | null = null;
  private static activeSpreadsheetName: string | null = null;

  public static getActiveSpreadsheetId(): string | null {
    if (!this.activeSpreadsheetId) {
      this.activeSpreadsheetId = localStorage.getItem('SMART_RT_ACTIVE_SHEET_ID') || null;
      this.activeSpreadsheetName = localStorage.getItem('SMART_RT_ACTIVE_SHEET_NAME') || null;
    }
    return this.activeSpreadsheetId;
  }

  public static setActiveSpreadsheet(id: string, name: string) {
    this.activeSpreadsheetId = id;
    this.activeSpreadsheetName = name;
    localStorage.setItem('SMART_RT_ACTIVE_SHEET_ID', id);
    localStorage.setItem('SMART_RT_ACTIVE_SHEET_NAME', name);
  }

  public static getActiveSpreadsheetName(): string | null {
    if (!this.activeSpreadsheetName) {
      this.activeSpreadsheetName = localStorage.getItem('SMART_RT_ACTIVE_SHEET_NAME') || null;
    }
    return this.activeSpreadsheetName;
  }

  /**
   * Helper to execute authenticated fetch requests with OAuth Bearer Token
   */
  private static async authFetch(url: string, options: RequestInit = {}): Promise<any> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('AUTH_REQUIRED: Belum masuk dengan Google. Silakan klik "Sign in with Google" terlebih dahulu.');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.error && errJson.error.message) {
          errorMessage = errJson.error.message;
        }
      } catch (_) {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * List all Google Spreadsheets accessible in user's Google Drive
   */
  public static async listSpreadsheets(): Promise<DriveSpreadsheetFile[]> {
    const q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    const url = `${this.DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime,webViewLink,owners)&orderBy=modifiedTime desc&pageSize=25`;
    const data = await this.authFetch(url);
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      owners: file.owners
    }));
  }

  /**
   * Fetch complete metadata and sheet tabs for a given Spreadsheet ID
   */
  public static async getSpreadsheetMetadata(spreadsheetId: string): Promise<SpreadsheetMetadata> {
    const url = `${this.SHEETS_API_BASE}/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties(sheetId,title,index,gridProperties)`;
    const data = await this.authFetch(url);

    const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
      rowCount: s.properties.gridProperties?.rowCount || 0,
      columnCount: s.properties.gridProperties?.columnCount || 0
    }));

    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title || 'Untitled Spreadsheet',
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      sheets
    };
  }

  /**
   * Create a new SMART RT Master Spreadsheet in the user's Google Drive
   */
  public static async createMasterSpreadsheet(customTitle?: string): Promise<SpreadsheetMetadata> {
    const title = customTitle || `${OFFICIAL_MASTER_SHEET_TITLE} (${new Date().toLocaleDateString('id-ID')})`;
    const url = this.SHEETS_API_BASE;

    const requestBody = {
      properties: {
        title
      },
      sheets: DEFAULT_TABS.map((tabTitle) => ({
        properties: {
          title: tabTitle,
          gridProperties: {
            rowCount: 100,
            columnCount: 20
          }
        }
      }))
    };

    const createdData = await this.authFetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const metadata: SpreadsheetMetadata = {
      spreadsheetId: createdData.spreadsheetId,
      title: createdData.properties?.title || title,
      spreadsheetUrl: createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${createdData.spreadsheetId}/edit`,
      sheets: (createdData.sheets || []).map((s: any) => ({
        sheetId: s.properties.sheetId,
        title: s.properties.title,
        index: s.properties.index,
        rowCount: s.properties.gridProperties?.rowCount || 0,
        columnCount: s.properties.gridProperties?.columnCount || 0
      }))
    };

    this.setActiveSpreadsheet(metadata.spreadsheetId, metadata.title);
    return metadata;
  }

  /**
   * Ensure a specific sheet/tab exists within a spreadsheet (creates tab if missing)
   */
  public static async ensureSheetTabExists(spreadsheetId: string, tabTitle: string): Promise<number> {
    const meta = await this.getSpreadsheetMetadata(spreadsheetId);
    const existing = meta.sheets.find(s => s.title.toLowerCase() === tabTitle.toLowerCase());
    if (existing) {
      return existing.sheetId;
    }

    // Add tab via batchUpdate
    const addSheetUrl = `${this.SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`;
    const response = await this.authFetch(addSheetUrl, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: tabTitle,
                gridProperties: { rowCount: 100, columnCount: 20 }
              }
            }
          }
        ]
      })
    });

    const newSheetId = response.replies?.[0]?.addSheet?.properties?.sheetId || 0;
    return newSheetId;
  }

  /**
   * Read raw values from a spreadsheet range (e.g. "Data_Warga!A1:Z100")
   */
  public static async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    const url = `${this.SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const data = await this.authFetch(url);
    return data.values || [];
  }

  /**
   * Overwrite values in a spreadsheet range
   */
  public static async writeRange(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const url = `${this.SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    return await this.authFetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values
      })
    });
  }

  /**
   * Clear all contents in a range
   */
  public static async clearRange(spreadsheetId: string, range: string): Promise<any> {
    const url = `${this.SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
    return await this.authFetch(url, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  /**
   * Apply official RT 07 header styling (Dark Blue theme #123B5D, White bold text, Frozen Top Row)
   */
  public static async applyHeaderStyle(spreadsheetId: string, sheetId: number, colCount: number = 10) {
    try {
      const url = `${this.SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`;
      await this.authFetch(url, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            // Freeze top row
            {
              updateSheetProperties: {
                properties: {
                  sheetId,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            },
            // Format header cells
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: colCount
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 18 / 255,
                      green: 59 / 255,
                      blue: 93 / 255 // #123B5D RT Brand Dark Blue
                    },
                    horizontalAlignment: 'CENTER',
                    textFormat: {
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                      fontSize: 10,
                      bold: true
                    },
                    padding: { top: 6, bottom: 6, left: 8, right: 8 }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,padding)'
              }
            }
          ]
        })
      });
    } catch (e) {
      console.warn('Non-fatal: Header formatting styling skipped:', e);
    }
  }

  // =========================================================================
  // DOMAIN-SPECIFIC EXPORTERS
  // =========================================================================

  /**
   * 1. Export Data Warga to Google Sheet "Data_Warga"
   */
  public static async syncDataWarga(spreadsheetId: string, wargaList: Warga[]): Promise<SyncResult> {
    const tabName = 'Data_Warga';
    const sheetId = await this.ensureSheetTabExists(spreadsheetId, tabName);

    const headers = [
      'ID Warga',
      'NIK',
      'No. KK',
      'Nama Lengkap',
      'Blok / No',
      'No. HP / WhatsApp',
      'Email',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Status Kawin',
      'Agama',
      'Pekerjaan',
      'Pendidikan',
      'Status Tinggal',
      'Tanggal Masuk',
      'Keterangan',
      'Terakhir Disinkronkan'
    ];

    const now = new Date().toLocaleString('id-ID');
    const rows = wargaList.map(w => [
      w.id_warga,
      w.nik,
      w.no_kk,
      w.nama_lengkap,
      w.blok,
      w.no_hp,
      w.email || '-',
      w.jenis_kelamin,
      w.tempat_lahir,
      w.tanggal_lahir,
      w.status_perkawinan,
      w.agama,
      w.pekerjaan,
      w.pendidikan,
      w.status_warga,
      w.tanggal_masuk,
      w.keterangan || '-',
      now
    ]);

    const values = [headers, ...rows];

    // Clear old data and write fresh
    await this.clearRange(spreadsheetId, `${tabName}!A1:R500`);
    await this.writeRange(spreadsheetId, `${tabName}!A1:R${values.length}`, values);
    await this.applyHeaderStyle(spreadsheetId, sheetId, headers.length);

    return {
      success: true,
      sheetName: tabName,
      rowsWritten: wargaList.length,
      timestamp: now,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
    };
  }

  /**
   * 2. Export Buku Kas RT (RT_UMUM) to Google Sheet "Buku_Kas_RT"
   */
  public static async syncKasRT(spreadsheetId: string): Promise<SyncResult> {
    const tabName = 'Buku_Kas_RT';
    const sheetId = await this.ensureSheetTabExists(spreadsheetId, tabName);

    const transactions = FinancialRepository.getFundLedger(FundType.RT_UMUM);
    const balance = FinancialRepository.calculateBalance(FundType.RT_UMUM);

    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Tipe (Pemasukan/Pengeluaran)',
      'Kategori Pos',
      'Deskripsi / Uraian',
      'Pihak / Pembayar / Penerima',
      'Jumlah (Rp)',
      'Status',
      'Metode / Sumber',
      'Disetujui Oleh',
      'Waktu Input'
    ];

    const rows = transactions.map(t => [
      t.transactionId,
      t.date,
      t.transactionType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.description,
      t.payerOrRecipient || '-',
      t.amount,
      t.status,
      t.source,
      t.approvedBy || '-',
      t.createdAt
    ]);

    // Add Summary Rows at the bottom
    const summaryRows = [
      [],
      ['--- RINGKASAN SALDO KAS RT 07 ---', '', '', '', '', '', '', '', '', '', ''],
      ['Saldo Awal', '', '', '', '', '', balance.openingBalance, '', '', '', ''],
      ['Total Pemasukan', '', '', '', '', '', balance.income, '', '', '', ''],
      ['Total Pengeluaran', '', '', '', '', '', balance.expense, '', '', '', ''],
      ['SALDO AKHIR BERJALAN', '', '', '', '', '', balance.closingBalance, '', '', '', '']
    ];

    const values = [headers, ...rows, ...summaryRows];

    await this.clearRange(spreadsheetId, `${tabName}!A1:K500`);
    await this.writeRange(spreadsheetId, `${tabName}!A1:K${values.length}`, values);
    await this.applyHeaderStyle(spreadsheetId, sheetId, headers.length);

    return {
      success: true,
      sheetName: tabName,
      rowsWritten: transactions.length,
      timestamp: new Date().toLocaleString('id-ID'),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
    };
  }

  /**
   * 3. Export Dana Kematian (DANA_KEMATIAN) to Google Sheet "Dana_Kematian"
   */
  public static async syncDanaKematian(spreadsheetId: string): Promise<SyncResult> {
    const tabName = 'Dana_Kematian';
    const sheetId = await this.ensureSheetTabExists(spreadsheetId, tabName);

    const transactions = FinancialRepository.getFundLedger(FundType.DANA_KEMATIAN);
    const balance = FinancialRepository.calculateBalance(FundType.DANA_KEMATIAN);

    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Jenis Mutasi',
      'Kategori Pos',
      'Keterangan / Ahli Waris / Warga',
      'Nominal (Rp)',
      'Status Verifikasi',
      'Metode Bayar',
      'Verifikator',
      'Waktu Pencatatan'
    ];

    const rows = transactions.map(t => [
      t.transactionId,
      t.date,
      t.transactionType === 'INCOME' ? 'Pemasukan (Iuran)' : 'Pengeluaran (Santunan)',
      t.category,
      t.description,
      t.amount,
      t.status,
      t.source,
      t.verifiedBy || t.approvedBy || '-',
      t.createdAt
    ]);

    const summaryRows = [
      [],
      ['--- RINGKASAN SALDO DANA KEMATIAN ---', '', '', '', '', '', '', '', '', ''],
      ['Saldo Kas Awal', '', '', '', '', balance.openingBalance, '', '', '', ''],
      ['Total Iuran Terkumpul', '', '', '', '', balance.income, '', '', '', ''],
      ['Total Santunan Duka', '', '', '', '', balance.expense, '', '', '', ''],
      ['SISA SALDO KAS KEMATIAN', '', '', '', '', balance.closingBalance, '', '', '', '']
    ];

    const values = [headers, ...rows, ...summaryRows];

    await this.clearRange(spreadsheetId, `${tabName}!A1:J500`);
    await this.writeRange(spreadsheetId, `${tabName}!A1:J${values.length}`, values);
    await this.applyHeaderStyle(spreadsheetId, sheetId, headers.length);

    return {
      success: true,
      sheetName: tabName,
      rowsWritten: transactions.length,
      timestamp: new Date().toLocaleString('id-ID'),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
    };
  }

  /**
   * 4. Export Omplongan Agustusan to Google Sheet "Omplongan_Agustusan"
   */
  public static async syncOmplongan(spreadsheetId: string): Promise<SyncResult> {
    const tabName = 'Omplongan_Agustusan';
    const sheetId = await this.ensureSheetTabExists(spreadsheetId, tabName);

    const stats = OmplonganCoreService.getDashboardStats();
    const tarikanList = OmplonganCoreService.getStoredTarikan();
    const wargaItems = OmplonganCoreService.getStoredItems();
    const pengeluaranList = OmplonganCoreService.getStoredPengeluaran();

    const values: any[][] = [];

    // Section 1: Dashboard Overview
    values.push(['🇮🇩 LAPORAN OMPLONGAN AGUSTUSAN HUT RI RT 07 RW 11 GPA NGIJO']);
    values.push(['Target Total Dana', stats.totalTarget, 'Total Terkumpul', stats.totalTerkumpul, 'Realisasi Belanja', stats.totalPengeluaran, 'Sisa Saldo Kas', stats.saldo]);
    values.push(['Progress Partisipasi', `${stats.persentasePencapaian}%`, 'Total Warga Terdata', stats.totalWarga, 'Total Tarikan Selesai', stats.totalTarikan]);
    values.push([]);

    // Section 2: Rekap Donasi Per Warga
    values.push(['--- REKAP DONASI & SETORAN PER WARGA / BLOK ---']);
    values.push([
      'ID Item',
      'Nama Warga / KK',
      'Blok / Alamat',
      'Status Pembayaran',
      'Target Donasi (Rp)',
      'Total Terbayar (Rp)',
      'Metode Bayar',
      'Tanggal Bayar',
      'No. WA',
      'Catatan'
    ]);

    wargaItems.forEach(w => {
      values.push([
        w.id,
        w.namaWarga,
        `${w.blok} (${w.nomorRumah})`,
        w.status,
        w.targetNominal,
        w.nominal,
        w.metode,
        w.createdAt ? w.createdAt.slice(0, 10) : '-',
        w.noHp || '-',
        w.catatan || '-'
      ]);
    });

    values.push([]);
    // Section 3: Rincian Pengeluaran Kegiatan
    values.push(['--- RINCIAN BELANJA & PENGELUARAN KEGIATAN AGUSTUSAN ---']);
    values.push([
      'ID Pengeluaran',
      'Kategori Pos',
      'Uraian Pembelian',
      'Nominal (Rp)',
      'Tanggal Transaksi',
      'Penerima / Toko',
      'Status Verifikasi',
      'Link Bukti Nota'
    ]);

    pengeluaranList.forEach(p => {
      values.push([
        p.id,
        p.kategori,
        p.keterangan,
        p.nominal,
        p.tanggal,
        p.penerima || '-',
        p.status,
        p.buktiUrl || '-'
      ]);
    });

    values.push([]);
    // Section 4: Sesi Tarikan Petugas
    values.push(['--- SESI TARIKAN & SETORAN PETUGAS ---']);
    values.push([
      'ID Tarikan',
      'Tarikan Ke-',
      'Tanggal Sesi',
      'Nama Petugas',
      'Wilayah / Blok',
      'Total Terkumpul (Input)',
      'Total Fisik Disetor',
      'Selisih',
      'Catatan'
    ]);

    tarikanList.forEach(t => {
      values.push([
        t.idTarikan,
        `Tarikan #${t.nomorTarikan}`,
        t.tanggal,
        t.namaPetugas,
        t.wilayah,
        t.totalInput,
        t.totalSetoran,
        t.selisih,
        t.catatan || '-'
      ]);
    });

    await this.clearRange(spreadsheetId, `${tabName}!A1:J1000`);
    await this.writeRange(spreadsheetId, `${tabName}!A1:J${values.length}`, values);
    await this.applyHeaderStyle(spreadsheetId, sheetId, 10);

    return {
      success: true,
      sheetName: tabName,
      rowsWritten: values.length,
      timestamp: new Date().toLocaleString('id-ID'),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
    };
  }

  /**
   * 5. Export Surat Pengantar & Dokumen Digital to "Surat_Pengantar"
   */
  public static async syncSuratPengantar(spreadsheetId: string, suratList: SuratPengantar[]): Promise<SyncResult> {
    const tabName = 'Surat_Pengantar';
    const sheetId = await this.ensureSheetTabExists(spreadsheetId, tabName);

    const headers = [
      'ID Surat',
      'Nomor Surat Resmi',
      'Jenis Surat',
      'Nama Pemohon',
      'NIK Pemohon',
      'Blok Rumah',
      'Keperluan',
      'Tanggal Pengajuan',
      'Tanggal Disetujui',
      'Status Surat',
      'QR Verification Hash'
    ];

    const rows = suratList.map(s => [
      s.id_surat,
      s.nomor_surat,
      s.jenis_surat,
      s.nama_pemohon,
      s.nik_pemohon,
      s.blok_rumah,
      s.keperluan,
      s.tanggal_pengajuan,
      s.tanggal_disetujui || '-',
      s.status,
      s.qr_code_hash
    ]);

    const values = [headers, ...rows];

    await this.clearRange(spreadsheetId, `${tabName}!A1:K500`);
    await this.writeRange(spreadsheetId, `${tabName}!A1:K${values.length}`, values);
    await this.applyHeaderStyle(spreadsheetId, sheetId, headers.length);

    return {
      success: true,
      sheetName: tabName,
      rowsWritten: suratList.length,
      timestamp: new Date().toLocaleString('id-ID'),
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`
    };
  }

  /**
   * Master 1-Click Sync: Exports all RT 07 datasets into their respective tabs
   */
  public static async syncAllMasterData(
    spreadsheetId: string,
    wargaList: Warga[],
    suratList: SuratPengantar[]
  ): Promise<{ results: SyncResult[]; totalWritten: number }> {
    const results: SyncResult[] = [];

    // Run sequentially with clear logging
    const r1 = await this.syncDataWarga(spreadsheetId, wargaList);
    results.push(r1);

    const r2 = await this.syncKasRT(spreadsheetId);
    results.push(r2);

    const r3 = await this.syncDanaKematian(spreadsheetId);
    results.push(r3);

    const r4 = await this.syncOmplongan(spreadsheetId);
    results.push(r4);

    const r5 = await this.syncSuratPengantar(spreadsheetId, suratList);
    results.push(r5);

    const totalWritten = results.reduce((acc, r) => acc + r.rowsWritten, 0);

    return { results, totalWritten };
  }

  // =========================================================================
  // DOMAIN-SPECIFIC IMPORTER & PARSER
  // =========================================================================

  /**
   * Preview & Parse Warga data from Google Sheets before importing
   */
  public static async previewImportWargaFromSheet(
    spreadsheetId: string,
    sheetName: string = 'Data_Warga'
  ): Promise<WargaImportPreview> {
    const rawRows = await this.readRange(spreadsheetId, `${sheetName}!A1:Z500`);

    if (!rawRows || rawRows.length < 2) {
      throw new Error(`Tab "${sheetName}" kosong atau tidak memiliki baris data.`);
    }

    const headerRow = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());
    
    // Dynamic column index resolution
    const colIdx = {
      id_warga: headerRow.findIndex((h: string) => h.includes('id warga') || h === 'id'),
      nik: headerRow.findIndex((h: string) => h.includes('nik')),
      no_kk: headerRow.findIndex((h: string) => h.includes('no. kk') || h.includes('kk') || h.includes('no_kk')),
      nama: headerRow.findIndex((h: string) => h.includes('nama lengkap') || h.includes('nama')),
      blok: headerRow.findIndex((h: string) => h.includes('blok') || h.includes('alamat')),
      no_hp: headerRow.findIndex((h: string) => h.includes('hp') || h.includes('wa') || h.includes('telepon') || h.includes('no_hp')),
      email: headerRow.findIndex((h: string) => h.includes('email')),
      jk: headerRow.findIndex((h: string) => h.includes('jenis kelamin') || h.includes('kelamin') || h === 'jk'),
      tempat_lahir: headerRow.findIndex((h: string) => h.includes('tempat lahir')),
      tanggal_lahir: headerRow.findIndex((h: string) => h.includes('tanggal lahir') || h.includes('tgl lahir')),
      status_kawin: headerRow.findIndex((h: string) => h.includes('status kawin') || h.includes('perkawinan')),
      agama: headerRow.findIndex((h: string) => h.includes('agama')),
      pekerjaan: headerRow.findIndex((h: string) => h.includes('pekerjaan')),
      pendidikan: headerRow.findIndex((h: string) => h.includes('pendidikan')),
      status_warga: headerRow.findIndex((h: string) => h.includes('status warga') || h.includes('status tinggal')),
      tanggal_masuk: headerRow.findIndex((h: string) => h.includes('tanggal masuk') || h.includes('tgl masuk')),
      keterangan: headerRow.findIndex((h: string) => h.includes('keterangan') || h.includes('catatan'))
    };

    if (colIdx.nama === -1) {
      throw new Error('Kolom "Nama Lengkap" atau "Nama" tidak ditemukan dalam header sheet.');
    }

    const validRecords: Warga[] = [];
    const invalidRows: Array<{ rowNumber: number; data: any; reason: string }> = [];
    const seenNiks = new Set<string>();
    let duplicateNikCount = 0;

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0 || row.every((c: any) => !c || String(c).trim() === '')) {
        continue; // Skip empty rows
      }

      const nama = colIdx.nama >= 0 && row[colIdx.nama] ? String(row[colIdx.nama]).trim() : '';
      if (!nama) {
        invalidRows.push({ rowNumber: i + 1, data: row, reason: 'Nama warga kosong' });
        continue;
      }

      let nik = colIdx.nik >= 0 && row[colIdx.nik] ? String(row[colIdx.nik]).replace(/[^0-9]/g, '').trim() : '';
      if (!nik || nik.length < 6) {
        nik = `350712${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }

      if (seenNiks.has(nik)) {
        duplicateNikCount++;
        nik = `${nik}_DUP_${i}`;
      }
      seenNiks.add(nik);

      let no_kk = colIdx.no_kk >= 0 && row[colIdx.no_kk] ? String(row[colIdx.no_kk]).replace(/[^0-9]/g, '').trim() : '';
      if (!no_kk || no_kk.length < 6) {
        no_kk = nik;
      }

      const blok = colIdx.blok >= 0 && row[colIdx.blok] ? String(row[colIdx.blok]).trim() : 'Blok C-07';
      const no_hp = colIdx.no_hp >= 0 && row[colIdx.no_hp] ? String(row[colIdx.no_hp]).trim() : '08123456789';
      const email = colIdx.email >= 0 && row[colIdx.email] ? String(row[colIdx.email]).trim() : `${nama.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`;

      const rawJk = colIdx.jk >= 0 && row[colIdx.jk] ? String(row[colIdx.jk]).trim().toLowerCase() : '';
      const jenis_kelamin: 'Laki-Laki' | 'Perempuan' = rawJk.includes('perempuan') || rawJk === 'p' ? 'Perempuan' : 'Laki-Laki';

      const tempat_lahir = colIdx.tempat_lahir >= 0 && row[colIdx.tempat_lahir] ? String(row[colIdx.tempat_lahir]).trim() : 'Malang';
      const tanggal_lahir = colIdx.tanggal_lahir >= 0 && row[colIdx.tanggal_lahir] ? String(row[colIdx.tanggal_lahir]).trim() : '1990-01-01';

      const rawStatusKawin = colIdx.status_kawin >= 0 && row[colIdx.status_kawin] ? String(row[colIdx.status_kawin]).trim() : 'Kawin';
      const status_perkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati' = 
        rawStatusKawin.includes('Belum') ? 'Belum Kawin' :
        rawStatusKawin.includes('Mati') ? 'Cerai Mati' :
        rawStatusKawin.includes('Hidup') ? 'Cerai Hidup' : 'Kawin';

      const agama = colIdx.agama >= 0 && row[colIdx.agama] ? String(row[colIdx.agama]).trim() : 'Islam';
      const pekerjaan = colIdx.pekerjaan >= 0 && row[colIdx.pekerjaan] ? String(row[colIdx.pekerjaan]).trim() : 'Wiraswasta';
      const pendidikan = colIdx.pendidikan >= 0 && row[colIdx.pendidikan] ? String(row[colIdx.pendidikan]).trim() : 'S1';

      const rawStatusWarga = colIdx.status_warga >= 0 && row[colIdx.status_warga] ? String(row[colIdx.status_warga]).trim().toLowerCase() : 'tetap';
      const status_warga: 'Tetap' | 'Kontrak' | 'Kos' = rawStatusWarga.includes('kontrak') ? 'Kontrak' : rawStatusWarga.includes('kos') ? 'Kos' : 'Tetap';

      const tanggal_masuk = colIdx.tanggal_masuk >= 0 && row[colIdx.tanggal_masuk] ? String(row[colIdx.tanggal_masuk]).trim() : '2020-01-01';
      const keterangan = colIdx.keterangan >= 0 && row[colIdx.keterangan] ? String(row[colIdx.keterangan]).trim() : 'Diimpor dari Google Sheets';

      const id_warga = colIdx.id_warga >= 0 && row[colIdx.id_warga] && String(row[colIdx.id_warga]).trim() !== ''
        ? String(row[colIdx.id_warga]).trim()
        : `WRG-${Date.now().toString().slice(-4)}${i}`;

      validRecords.push({
        id_warga,
        nik,
        no_kk,
        nama_lengkap: nama,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        status_perkawinan,
        agama,
        pendidikan,
        pekerjaan,
        no_hp,
        email,
        alamat: `Perum GPA Ngijo ${blok}`,
        blok,
        rt: '07',
        rw: '11',
        status_warga,
        tanggal_masuk,
        keterangan
      });
    }

    return {
      totalRows: rawRows.length - 1,
      validRecords,
      invalidRows,
      duplicateNikCount
    };
  }
}
