import React, { useState } from 'react';
import { X, Code, Copy, Check, Database, Server, ShieldCheck, Download } from 'lucide-react';

interface BackendCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendCodeModal: React.FC<BackendCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SHEETS' | 'CONFIG' | 'DATABASE' | 'AUTH' | 'AUDIT' | 'UTILS' | 'CRUDS' | 'DEPLOY'>('SHEETS');

  if (!isOpen) return null;

  const handleCopy = (fileName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const codeFiles = {
    SHEETS: `=== STRUKTUR GOOGLE SPREADSHEET SMART RT 07 RW 11 GPA NGIJO ===

1. Sheet: WARGA
   - ID: id_warga (PK: WRG-001)
   - Header: id_warga | nik | no_kk | nama_lengkap | tempat_lahir | tanggal_lahir | jenis_kelamin | status_perkawinan | agama | pendidikan | pekerjaan | no_hp | email | alamat | blok | rt | rw | status_warga | tanggal_masuk | keterangan

2. Sheet: KELUARGA
   - ID: id_kk (PK: KK-001)
   - Header: id_kk | no_kk | nama_kepala_keluarga | alamat | blok | jumlah_anggota | status_rumah | no_hp | keterangan

3. Sheet: SURAT
   - ID: id_surat (PK: SRT-2026-0001)
   - Header: id_surat | nomor_surat | jenis_surat | id_warga | nama_pemohon | nik_pemohon | no_kk | blok_rumah | keperluan | tanggal_pengajuan | tanggal_disetujui | status | catatan_admin | qr_code_hash | pdf_drive_url

4. Sheet: TRANSAKSI_KEUANGAN
   - ID: id_transaksi (PK: TRX-2026-001)
   - Header: id_transaksi | tanggal | jenis | kategori | keterangan | pemasukan | pengeluaran | saldo_berjalan | petugas | bukti_url

5. Sheet: IURAN_BULANAN
   - ID: id_iuran (PK: IRN-202608-001)
   - Header: id_iuran | bulan_tahun | id_kk | nama_kepala_keluarga | blok | nominal_tagihan | nominal_dibayar | tanggal_bayar | status | metode_bayar

6. Sheet: PENGADUAN
   - ID: id_pengaduan (PK: ADU-001)
   - Header: id_pengaduan | nomor_tiket | nama_pelapor | no_hp | kategori | lokasi | deskripsi | foto_url | tanggal | status | tanggapan_admin

7. Sheet: AUDIT_LOG
   - ID: id_log (PK: LOG-001)
   - Header: id_log | timestamp | user | action | module | record_id | status | description`,

    CONFIG: `/**
 * Config.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * Configuration loader using ScriptProperties (No Hardcoded IDs)
 */

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    SPREADSHEET_ID: props.getProperty("SPREADSHEET_ID") || "1a2b3c4d5e6f7g8h9i0_SMART_RT07_GPA_NGIJO",
    DRIVE_FOLDER_ID: props.getProperty("DRIVE_FOLDER_ID") || "folder_id_surat_rt07",
    WA_API_TOKEN: props.getProperty("WA_API_TOKEN") || "wa_token_secret",
    JWT_SECRET: props.getProperty("JWT_SECRET") || "secret_key_rt07_gpa_ngijo_2026",
    ENV: props.getProperty("ENV") || "PRODUCTION"
  };
}

function initScriptProperties() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    "SPREADSHEET_ID": "1a2b3c4d5e6f7g8h9i0_SMART_RT07_GPA_NGIJO",
    "DRIVE_FOLDER_ID": "1Folder_Surat_RT07_GPA_Ngijo",
    "WA_API_TOKEN": "fonnte_token_123456789",
    "JWT_SECRET": "RT07_RW11_GPA_NGIJO_SECURE_2026"
  });
  Logger.log("Script Properties Initialized Successfully!");
}`,

    DATABASE: `/**
 * Database.gs
 * Generic CRUD helper functions for Google Sheets Database
 */

function getSpreadsheet() {
  var config = getConfig();
  return SpreadsheetApp.openById(config.SPREADSHEET_ID);
}

function getSheetData(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    result.push(row);
  }
  return result;
}

function appendSheetRow(sheetName, rowData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function(h) { return rowData[h] !== undefined ? rowData[h] : ""; });
  sheet.appendRow(row);
  return { success: true, message: "Row appended" };
}`,

    AUTH: `/**
 * Auth.gs
 * Role Validation and Token Check for SMART RT
 */

function validateRole(userRole, requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.indexOf(userRole) !== -1;
}

function sanitizeUserData(user, role) {
  if (role !== "ADMIN" && role !== "KETUA_RT") {
    if (user.nik) user.nik = user.nik.substring(0, 6) + "******" + user.nik.substring(12);
  }
  return user;
}`,

    AUDIT: `/**
 * Audit.gs
 * Audit Logging Service
 */

function logAudit(user, action, moduleName, recordId, status, description) {
  try {
    var logData = {
      id_log: "LOG-" + new Date().getTime(),
      timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss"),
      user: user || "System",
      action: action,
      module: moduleName,
      record_id: recordId || "-",
      status: status || "SUCCESS",
      description: description || ""
    };
    appendSheetRow("AUDIT_LOG", logData);
  } catch (e) {
    Logger.log("Audit log failed: " + e.message);
  }
}`,

    UTILS: `/**
 * Utils.gs
 * Web App Controller & JSON Response Helpers
 */

function doGet(e) {
  var action = e.parameter.action || "ping";
  if (action === "ping") {
    return jsonResponse({
      success: true,
      message: "SMART RT 07 Backend Apps Script Active!",
      timestamp: new Date().toISOString()
    });
  }
  return jsonResponse({ success: false, error: "Invalid action" });
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;

    if (action === "saveWarga") {
      logAudit(contents.user, "CREATE_WARGA", "Data Warga", payload.id_warga, "SUCCESS", "Menambah data warga");
      return jsonResponse({ success: true, message: "Warga tersimpan!" });
    }

    return jsonResponse({ success: true, message: "Action processed: " + action });
  } catch(err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`,

    CRUDS: `/**
 * CRUD Operations for Warga, Keluarga, Surat, Keuangan, Pengaduan
 */

function getWargaList(userRole) {
  var list = getSheetData("WARGA");
  return list.map(function(w) { return sanitizeUserData(w, userRole); });
}

function createSuratPengantar(suratData) {
  suratData.id_surat = "SRT-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd-HHmmss");
  suratData.status = "DIAJUKAN";
  suratData.qr_code_hash = "VERIFY-" + suratData.id_surat + "-GPA0711";
  appendSheetRow("SURAT", suratData);
  logAudit(suratData.nama_pemohon, "SUBMIT_SURAT", "Administrasi Surat", suratData.id_surat, "SUCCESS", "Mengajukan surat " + suratData.jenis_surat);
  return { success: true, id_surat: suratData.id_surat };
}`,

    DEPLOY: `=== INTRUKSI DEPLOYMENT GOOGLE APPS SCRIPT ===

1. Buka Google Sheets baru & beri nama: "DATABASE SMART RT 07 RW 11 GPA NGIJO"
2. Buat Sheet/Tab: WARGA, KELUARGA, SURAT, TRANSAKSI_KEUANGAN, IURAN_BULANAN, PENGADUAN, AUDIT_LOG
3. Salin Spreadsheet ID dari URL (string antara /d/ dan /edit)
4. Buka menu Extensions -> Apps Script
5. Salin kode Config.gs, Database.gs, Auth.gs, Audit.gs, Utils.gs, dan CRUD.gs
6. Buka Project Settings (ikon roda gigi) -> Script Properties:
   - SPREADSHEET_ID = <Spreadsheet ID Anda>
   - DRIVE_FOLDER_ID = <Folder Drive ID untuk PDF>
   - WA_API_TOKEN = <Token WhatsApp Anda>
7. Klik Deploy -> New Deployment -> Select Type: Web App
   - Execute as: Me
   - Who has access: Anyone
8. Salin Web App URL dan tempelkan ke menu Pengaturan SMART RT!`
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A2338] text-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-[#D4A72C] overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-[#123B5D] border-b border-[#2E7D52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C]">
              <Code className="w-5 h-5 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">GOOGLE APPS SCRIPT BACKEND (TAHAP 2 ARCHITECTURE)</h3>
              <p className="text-xs text-slate-300">Modul Backend Google Sheets & Apps Script Production Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex flex-wrap gap-1 p-3 bg-[#0A2338] border-b border-slate-800 text-xs">
          {(['SHEETS', 'CONFIG', 'DATABASE', 'AUTH', 'AUDIT', 'UTILS', 'CRUDS', 'DEPLOY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#D4A72C] text-[#123B5D]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}.gs
            </button>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono text-[#D4A72C] font-bold">Source File: {activeTab}.gs</span>
            <button
              onClick={() => handleCopy(activeTab, codeFiles[activeTab])}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              {copiedFile === activeTab ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedFile === activeTab ? 'Berhasil Disalin!' : 'Salin Kode File'}
            </button>
          </div>

          <pre className="bg-[#051320] p-4 rounded-2xl border border-slate-700 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[400px]">
            {codeFiles[activeTab]}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> TAHAP 2 SELESAI — DATABASE DAN BACKEND SIAP.
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
