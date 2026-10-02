/**
 * WargaChangeRequest.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * CR-DATA/20-SEP-001 — Lapisan Pengajuan Perubahan Data Warga
 * 
 * Scope:
 * 1. createWargaChangeRequest(payload)
 * 2. getMyWargaChangeRequests(payload)
 * 3. getWargaChangeRequest(payload)
 * 
 * Dependensi Existing (Global Scope GAS):
 * - sanitizeInput(val)        -> Warga.gs
 * - verifyWargaAuthToken(tok) -> Warga.gs
 */

// ============================================================================
// KONSTANTA & ATURAN VALIDASI
// ============================================================================

var WCR_SHEET_NAME = "PENGAJUAN_PERUBAHAN_WARGA";

var WCR_REQUIRED_HEADERS = [
  "ID_PENGAJUAN",
  "TIMESTAMP_AJUKAN",
  "ID_WARGA_PENGAJU",
  "JENIS_PENGAJUAN",
  "ID_WARGA_TARGET",
  "NO_KK_TARGET",
  "DATA_LAMA",
  "DATA_USULAN",
  "ALASAN",
  "BUKTI_REFERENSI",
  "STATUS",
  "CATATAN_VERIFIKASI",
  "DIVERIFIKASI_OLEH",
  "WAKTU_VERIFIKASI",
  "DISETUJUI_OLEH",
  "WAKTU_PERSETUJUAN",
  "WAKTU_APPLIED",
  "ERROR_APPLY"
];

var WCR_ALLOWED_JENIS = ["ADD", "EDIT", "COMPLETE", "REMOVE", "STATUS"];

var WCR_ALLOWLIST_FIELDS = [
  "NAMA_LENGKAP",
  "NAMA_PANGGILAN",
  "NIK", // ADD only; validated server-side
  "TEMPAT_LAHIR",
  "PENDIDIKAN",
  "PEKERJAAN",
  "NO_HP",
  "EMAIL",
  "JENIS_KELAMIN",
  "TANGGAL_LAHIR",
  "AGAMA",
  "STATUS_PERKAWINAN",
  "ALAMAT",
  "BLOK",
  "STATUS_TINGGAL",
  "HUBUNGAN_KELUARGA",
  "NAMA_PEMILIK_RUMAH",
  "TELEPON_PEMILIK_RUMAH",
  "KETERANGAN"
];

var WCR_FORBIDDEN_FIELDS = [
  "ID_WARGA",
  "NO_KK",
  "STATUS_WARGA",
  "TANGGAL_MASUK",
  "TOKEN",
  "PASSWORD",
  "AUTH_TOKEN"
];

var WCR_ACTIVE_STATUSES = ["SUBMITTED", "UNDER_REVIEW"];

// ============================================================================
// HELPER INTERNAL (PREFIX: wcr_)
// ============================================================================

/**
 * Mendapatkan instance Spreadsheet aktif atau via Script Properties.
 * Fail closed jika tidak ditemukan.
 */
function wcr_getSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Context web app standalone atau background trigger
  }
  if (!ss) {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty("SPREADSHEET_ID") || props.getProperty("DATABASE_ID");
    if (ssId) {
      ss = SpreadsheetApp.openById(ssId);
    }
  }
  return ss;
}

/**
 * Validasi repository sheet PENGAJUAN_PERUBAHAN_WARGA.
 * Syarat: EXACT 18 kolom (lastCol === 18) dengan urutan dan nama header exact.
 * Fail closed jika sheet tidak ada, kolom kurang/lebih, atau header tidak cocok.
 * TIDAK membuat sheet atau header otomatis.
 */
function wcr_getAndValidateRepositorySheet(ss) {
  if (!ss) return { error: "Spreadsheet database tidak dapat diakses.", sheet: null, headers: null };

  var sheet = ss.getSheetByName(WCR_SHEET_NAME);
  if (!sheet) {
    return {
      error: "Sheet repository '" + WCR_SHEET_NAME + "' tidak ditemukan pada database.",
      sheet: null,
      headers: null
    };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 1) {
    return {
      error: "Sheet repository '" + WCR_SHEET_NAME + "' kosong atau belum memiliki baris header.",
      sheet: null,
      headers: null
    };
  }

  if (lastCol !== WCR_REQUIRED_HEADERS.length) {
    return {
      error: "Jumlah kolom sheet repository '" + WCR_SHEET_NAME + "' tidak sesuai kontrak. Diharuskan tepat " + WCR_REQUIRED_HEADERS.length + " kolom, ditemukan " + lastCol + " kolom.",
      sheet: null,
      headers: null
    };
  }

  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  for (var i = 0; i < WCR_REQUIRED_HEADERS.length; i++) {
    var expected = WCR_REQUIRED_HEADERS[i];
    if (headerRow[i] !== expected) {
      return {
        error: "Header repository kolom ke-" + (i + 1) + " tidak sesuai kontrak. Diharapkan: '" + expected + "', Ditemukan: '" + headerRow[i] + "'.",
        sheet: null,
        headers: null
      };
    }
  }

  return { error: null, sheet: sheet, headers: headerRow };
}

/**
 * Membaca sheet WARGA sebagai SSoT dan memetakan indeks kolom header.
 */
function wcr_getWargaSheetContext(ss) {
  if (!ss) return { error: "Spreadsheet database tidak dapat diakses.", dataValues: null, colMap: null };

  var sheetWarga = ss.getSheetByName("WARGA");
  if (!sheetWarga) {
    return { error: "Sheet SSoT 'WARGA' tidak ditemukan.", dataValues: null, colMap: null };
  }

  var lastRow = sheetWarga.getLastRow();
  var lastCol = sheetWarga.getLastColumn();
  if (lastRow <= 1) {
    return { error: "Data sheet WARGA kosong.", dataValues: null, colMap: null };
  }

  var dataValues = sheetWarga.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = dataValues[0];
  var colMap = {};

  for (var c = 0; c < headers.length; c++) {
    var hName = String(headers[c] || "").trim().toUpperCase();
    colMap[hName] = c;
  }

  // Fallback index sesuai SSoT 23 Kolom
  if (colMap["ID_WARGA"] === undefined) colMap["ID_WARGA"] = 0;
  if (colMap["NIK"] === undefined) colMap["NIK"] = 1;
  if (colMap["NO_KK"] === undefined) colMap["NO_KK"] = 2;
  if (colMap["NAMA_LENGKAP"] === undefined) colMap["NAMA_LENGKAP"] = 3;
  if (colMap["NAMA_PANGGILAN"] === undefined) colMap["NAMA_PANGGILAN"] = 4;
  if (colMap["JENIS_KELAMIN"] === undefined) colMap["JENIS_KELAMIN"] = 5;
  if (colMap["TEMPAT_LAHIR"] === undefined) colMap["TEMPAT_LAHIR"] = 6;
  if (colMap["TANGGAL_LAHIR"] === undefined) colMap["TANGGAL_LAHIR"] = 7;
  if (colMap["AGAMA"] === undefined) colMap["AGAMA"] = 8;
  if (colMap["STATUS_PERKAWINAN"] === undefined) colMap["STATUS_PERKAWINAN"] = 9;
  if (colMap["PENDIDIKAN"] === undefined) colMap["PENDIDIKAN"] = 10;
  if (colMap["PEKERJAAN"] === undefined) colMap["PEKERJAAN"] = 11;
  if (colMap["NO_HP"] === undefined) colMap["NO_HP"] = 12;
  if (colMap["EMAIL"] === undefined) colMap["EMAIL"] = 13;
  if (colMap["ALAMAT"] === undefined) colMap["ALAMAT"] = 14;
  if (colMap["BLOK"] === undefined) colMap["BLOK"] = 15;
  if (colMap["STATUS_TINGGAL"] === undefined) colMap["STATUS_TINGGAL"] = 16;
  if (colMap["STATUS_WARGA"] === undefined) colMap["STATUS_WARGA"] = 17;
  if (colMap["TANGGAL_MASUK"] === undefined) colMap["TANGGAL_MASUK"] = 18;
  if (colMap["KETERANGAN"] === undefined) colMap["KETERANGAN"] = 19;
  if (colMap["NAMA_PEMILIK_RUMAH"] === undefined) colMap["NAMA_PEMILIK_RUMAH"] = 20;
  if (colMap["TELEPON_PEMILIK_RUMAH"] === undefined) colMap["TELEPON_PEMILIK_RUMAH"] = 21;
  if (colMap["HUBUNGAN_KELUARGA"] === undefined) colMap["HUBUNGAN_KELUARGA"] = 22;

  return { error: null, dataValues: dataValues, colMap: colMap };
}

/**
 * Mencari record warga berdasarkan ID_WARGA pada tabel SSoT.
 */
function wcr_findWargaRowById(dataValues, colMap, targetWargaId) {
  if (!targetWargaId || !dataValues) return null;
  var idxId = colMap["ID_WARGA"];
  var cleanTargetId = String(targetWargaId).trim();

  for (var r = 1; r < dataValues.length; r++) {
    var row = dataValues[r];
    var cellId = String(row[idxId] || "").trim();
    if (cellId === cleanTargetId) {
      return row;
    }
  }
  return null;
}

/**
 * Membuat ID pengajuan perubahan data warga.
 * Format: CRW-YYYYMMDD-HHMMSS-XXXXXX
 */
function wcr_generateId() {
  var timestampStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd-HHmmss");
  var uuidPart = Utilities.getUuid().replace(/-/g, "").slice(0, 6).toUpperCase();
  return "CRW-" + timestampStr + "-" + uuidPart;
}

/**
 * Validasi allowlist, forbidden fields, dan tipe data primitif pada DATA_USULAN.
 * Strict: Hanya menerima string, number, boolean, null.
 * Menolak object, array, function, dan tipe kompleks lainnya.
 */
function wcr_validateDataUsulan(dataUsulanRaw, jenisPengajuan) {
  if (!dataUsulanRaw || typeof dataUsulanRaw !== "object" || Array.isArray(dataUsulanRaw)) {
    return { error: "DATA_USULAN wajib berupa objek data pasangan kunci-nilai." };
  }

  var keys = Object.keys(dataUsulanRaw);
  if (keys.length === 0) {
    return { error: "DATA_USULAN tidak boleh kosong." };
  }

  var sanitizedData = {};

  for (var i = 0; i < keys.length; i++) {
    var originalKey = keys[i];
    var upperKey = String(originalKey).trim().toUpperCase();

    if (upperKey === "NIK" && String(jenisPengajuan || "").toUpperCase() !== "ADD") {
      return {
        error: "Field 'NIK' hanya boleh diajukan untuk penambahan anggota baru (ADD)."
      };
    }

    // 1. Cek Forbidden Fields
    if (WCR_FORBIDDEN_FIELDS.indexOf(upperKey) !== -1) {
      return {
        error: "Field '" + originalKey + "' DILARANG diajukan perubahan secara mandiri demi integritas data & keamanan."
      };
    }

    // 2. Cek Allowlist Fields
    if (WCR_ALLOWLIST_FIELDS.indexOf(upperKey) === -1) {
      return {
        error: "Field '" + originalKey + "' tidak termasuk dalam daftar field yang diizinkan untuk diajukan perubahan."
      };
    }

    var val = dataUsulanRaw[originalKey];

    // 3. Strict Primitive Validation: Tolak object, array, function, dan tipe kompleks
    if (val !== null && typeof val === "object") {
      return {
        error: "Nilai field '" + originalKey + "' tidak valid. Tipe objek atau array kompleks tidak diizinkan."
      };
    }
    if (typeof val === "function") {
      return {
        error: "Nilai field '" + originalKey + "' tidak valid. Tipe fungsi tidak diizinkan."
      };
    }

    var cleanVal = "";
    if (val === null || val === undefined) {
      cleanVal = "";
    } else if (typeof val === "boolean") {
      cleanVal = val ? "YA" : "TIDAK";
    } else if (typeof val === "number") {
      cleanVal = String(val);
    } else if (typeof val === "string") {
      cleanVal = (typeof sanitizeInput === "function") ? sanitizeInput(val) : String(val).trim();
    } else {
      return {
        error: "Nilai field '" + originalKey + "' memiliki tipe data yang tidak didukung."
      };
    }

    sanitizedData[upperKey] = cleanVal;
  }

  return { error: null, data: sanitizedData };
}

/**
 * Membuat snapshot DATA_LAMA dari record SSoT hanya untuk field-field yang diizinkan.
 * Privasi ketat: tidak menyertakan NIK, token, dll.
 */
function wcr_createDataLamaSnapshot(row, colMap) {
  if (!row || !colMap) return "{}";

  var snapshot = {};
  for (var i = 0; i < WCR_ALLOWLIST_FIELDS.length; i++) {
    var field = WCR_ALLOWLIST_FIELDS[i];
    // NIK boleh berada di DATA_USULAN untuk ADD, tetapi tidak pernah
    // dimasukkan ke snapshot DATA_LAMA karena snapshot dapat dibaca pemohon.
    if (field === "NIK") continue;
    var colIdx = colMap[field];
    if (colIdx !== undefined && colIdx < row.length) {
      var cellVal = row[colIdx];
      snapshot[field] = (cellVal === null || cellVal === undefined) ? "" : String(cellVal).trim();
    }
  }

  return JSON.stringify(snapshot);
}

function wcr_getOfficerContext() {
  if (typeof getCurrentUser !== "function" || typeof hasPermission !== "function") {
    return {
      error: "Modul otorisasi officer tidak tersedia. Operasi ditolak.",
      user: null
    };
  }

  var currentUser = getCurrentUser();
  if (!currentUser || !currentUser.ID_USER || !currentUser.ROLE) {
    return {
      error: "Sesi Pengurus tidak ditemukan atau tidak valid.",
      user: null
    };
  }

  if (!hasPermission("PETUGAS")) {
    return {
      error: "Akses Ditolak: hanya Pengurus RT yang berwenang memproses pengajuan warga.",
      user: null
    };
  }

  return { error: null, user: currentUser };
}

function wcr_getOfficerActor(user) {
  if (!user) return "-";
  return String(user.USERNAME || user.ID_USER || "OFFICER").trim();
}

function wcr_parseJsonObject(rawValue) {
  if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
    return rawValue;
  }
  try {
    var parsed = JSON.parse(String(rawValue || "{}"));
    return (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      ? parsed
      : {};
  } catch (e) {
    return {};
  }
}

function wcr_normalizeDigits(value) {
  return String(value === undefined || value === null ? "" : value).replace(/\D/g, "");
}

function wcr_findWargaRowByNik(dataValues, colMap, nik) {
  if (!dataValues || !colMap || !nik) return null;
  var idxNik = colMap["NIK"];
  if (idxNik === undefined) return null;
  var cleanNik = wcr_normalizeDigits(nik);

  for (var r = 1; r < dataValues.length; r++) {
    var rowNik = wcr_normalizeDigits(dataValues[r][idxNik]);
    if (rowNik && rowNik === cleanNik) return dataValues[r];
  }
  return null;
}

function wcr_generateWargaId() {
  var timestampStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd-HHmmss");
  var uuidPart = Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  return "WGR-" + timestampStr + "-" + uuidPart;
}

function wcr_buildWargaRowFromAdd(dataUsulan, authoritativeKk, generatedWargaId, applicantRow, colMap, timestampNow) {
  var u = dataUsulan || {};
  var get = function(field) {
    var key = String(field).toUpperCase();
    return u[key] === undefined || u[key] === null ? "" : String(u[key]).trim();
  };

  // Field yang berasal dari otoritas sistem tidak boleh berasal dari DATA_USULAN.
  var row = new Array(23).fill("");
  row[0]  = generatedWargaId;          // ID_WARGA
  row[1]  = get("NIK");                // NIK
  row[2]  = authoritativeKk;            // NO_KK — authoritative dari WCR
  row[3]  = get("NAMA_LENGKAP");
  row[4]  = get("NAMA_PANGGILAN");
  row[5]  = get("JENIS_KELAMIN");
  row[6]  = get("TEMPAT_LAHIR");
  row[7]  = get("TANGGAL_LAHIR");
  row[8]  = get("AGAMA");
  row[9]  = get("STATUS_PERKAWINAN");
  row[10] = get("PENDIDIKAN");
  row[11] = get("PEKERJAAN");
  row[12] = get("NO_HP") ? "'" + get("NO_HP") : "";
  row[13] = get("EMAIL");
  row[14] = get("ALAMAT");
  row[15] = get("BLOK");
  row[16] = get("STATUS_TINGGAL");
  row[17] = "AKTIF";                   // system-controlled
  row[18] = timestampNow;               // system-controlled
  row[19] = get("KETERANGAN");
  row[20] = get("NAMA_PEMILIK_RUMAH");
  row[21] = get("TELEPON_PEMILIK_RUMAH")
    ? "'" + get("TELEPON_PEMILIK_RUMAH")
    : "";
  row[22] = get("HUBUNGAN_KELUARGA");

  // Untuk ADD anggota keluarga, alamat/blok dapat diwariskan dari kepala KK
  // hanya bila usulan tidak menyertakannya. Ini menjaga satu rumah tetap konsisten.
  if (!row[14] && applicantRow && colMap["ALAMAT"] !== undefined) {
    row[14] = String(applicantRow[colMap["ALAMAT"]] || "").trim();
  }
  if (!row[15] && applicantRow && colMap["BLOK"] !== undefined) {
    row[15] = String(applicantRow[colMap["BLOK"]] || "").trim();
  }
  if (!row[20] && applicantRow && colMap["NAMA_PEMILIK_RUMAH"] !== undefined) {
    row[20] = String(applicantRow[colMap["NAMA_PEMILIK_RUMAH"]] || "").trim();
  }
  if (!row[21] && applicantRow && colMap["TELEPON_PEMILIK_RUMAH"] !== undefined) {
    var ownerPhone = String(applicantRow[colMap["TELEPON_PEMILIK_RUMAH"]] || "").trim();
    row[21] = ownerPhone ? "'" + ownerPhone.replace(/^'/, "") : "";
  }

  return row;
}

function wcr_rowToOfficerDto(row) {
  var dataLama = wcr_parseJsonObject(row[6]);
  var dataUsulan = wcr_parseJsonObject(row[7]);

  return {
    idPengajuan: String(row[0] || ""),
    timestampAjukan: String(row[1] || ""),
    idWargaPengaju: String(row[2] || ""),
    jenisPengajuan: String(row[3] || ""),
    idWargaTarget: String(row[4] || ""),
    noKkTarget: String(row[5] || ""),
    dataLama: dataLama,
    dataUsulan: dataUsulan,
    alasan: String(row[8] || ""),
    buktiReferensi: String(row[9] || ""),
    status: String(row[10] || "SUBMITTED"),
    catatanVerifikasi: String(row[11] || ""),
    diverifikasiOleh: String(row[12] || ""),
    waktuVerifikasi: String(row[13] || ""),
    disetujuiOleh: String(row[14] || ""),
    waktuPersetujuan: String(row[15] || ""),
    waktuApplied: String(row[16] || ""),
    errorApply: String(row[17] || "")
  };
}

function wcr_findRepositoryRowById(repoSheet, targetId) {
  var lastRow = repoSheet.getLastRow();
  if (lastRow <= 1) return null;
  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || "").trim() === String(targetId || "").trim()) {
      return { rowNumber: i + 2, values: rows[i] };
    }
  }
  return null;
}

function wcr_setRepositoryReview(repoSheet, rowNumber, values) {
  // values = 18-element row; only columns 11-18 are changed by this helper.
  repoSheet.getRange(rowNumber, 11, 1, 8).setValues([[
    values.status,
    values.catatanVerifikasi,
    values.diverifikasiOleh,
    values.waktuVerifikasi,
    values.disetujuiOleh,
    values.waktuPersetujuan,
    values.waktuApplied,
    values.errorApply
  ]]);
}

function wcr_verifyAppliedAdd(wargaSheet, rowNumber, expectedId, expectedNik, expectedKk, expectedName) {
  var values = wargaSheet.getRange(rowNumber, 1, 1, 23).getValues()[0];
  return String(values[0] || "").trim() === String(expectedId || "").trim() &&
    wcr_normalizeDigits(values[1]) === wcr_normalizeDigits(expectedNik) &&
    wcr_normalizeDigits(values[2]) === wcr_normalizeDigits(expectedKk) &&
    String(values[3] || "").trim() === String(expectedName || "").trim();
}

// ============================================================================
// FUNGSI UTAMA CR-DATA/20-SEP-001 (PUBLIC INTERFACE)
// ============================================================================

/**
 * 1. createWargaChangeRequest
 * Mengajukan permohonan penambahan, pembaruan, atau koreksi data kependudukan.
 * Identitas pemohon diotentikasi via verifyWargaAuthToken(payload.token).sub.
 * NO_KK_TARGET disimpan di repository tetapi TIDAK dikembalikan ke frontend DTO.
 */
function createWargaChangeRequest(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload pengajuan tidak valid.",
      data: null,
      errorCode: "INVALID_PAYLOAD"
    };
  }

  // A. Verifikasi Token Autentikasi Pemohon (Fail Closed)
  var token = payload.token;
  if (!token || typeof token !== "string") {
    return {
      success: false,
      message: "Sesi otorisasi warga diperlukan. Silakan login kembali.",
      data: null,
      errorCode: "UNAUTHORIZED"
    };
  }

  var authResult = verifyWargaAuthToken(token);
  if (!authResult || !authResult.sub) {
    return {
      success: false,
      message: "Sesi otorisasi tidak valid atau telah kedaluwarsa.",
      data: null,
      errorCode: "INVALID_AUTH_TOKEN"
    };
  }

  var applicantWargaId = String(authResult.sub).trim();
  if (!applicantWargaId) {
    return {
      success: false,
      message: "Identitas pemohon tidak valid pada token otorisasi.",
      data: null,
      errorCode: "INVALID_APPLICANT_ID"
    };
  }

  // B. Akses Database Spreadsheet
  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  // C. Validasi Sheet SSoT WARGA & Identitas Pemohon
  var wargaCtx = wcr_getWargaSheetContext(ss);
  if (wargaCtx.error) {
    return {
      success: false,
      message: wargaCtx.error,
      data: null,
      errorCode: "SSOT_WARGA_UNAVAILABLE"
    };
  }

  var applicantRow = wcr_findWargaRowById(wargaCtx.dataValues, wargaCtx.colMap, applicantWargaId);
  if (!applicantRow) {
    return {
      success: false,
      message: "Data pemohon tidak ditemukan pada basis data resmi warga.",
      data: null,
      errorCode: "APPLICANT_NOT_FOUND"
    };
  }

  var idxKk = wargaCtx.colMap["NO_KK"];
  var authoritativeApplicantKk = String(applicantRow[idxKk] || "").replace(/\D/g, "");
  if (authoritativeApplicantKk.length !== 16) {
    return {
      success: false,
      message: "Nomor Kartu Keluarga pemohon pada database tidak valid (harus 16 digit).",
      data: null,
      errorCode: "INVALID_AUTHORITATIVE_KK"
    };
  }

  // D. Validasi Jenis Pengajuan
  var rawJenis = String(payload.jenisPengajuan || payload.JENIS_PENGAJUAN || "").trim().toUpperCase();
  if (WCR_ALLOWED_JENIS.indexOf(rawJenis) === -1) {
    return {
      success: false,
      message: "Jenis pengajuan tidak valid. Pilihan yang diizinkan: " + WCR_ALLOWED_JENIS.join(", ") + ".",
      data: null,
      errorCode: "INVALID_JENIS_PENGAJUAN"
    };
  }

  // E. Validasi Target Warga & Relasi Kartu Keluarga
  var targetWargaId = "";
  var dataLamaJson = "{}";

  if (rawJenis === "ADD") {
    // Untuk ADD (anggota baru), ID belum ada. Target KK wajib KK pemohon.
    targetWargaId = "";
    dataLamaJson = "{}";
  } else {
    // Untuk EDIT, COMPLETE, REMOVE, STATUS: ID_WARGA_TARGET wajib diisi dan harus anggota KK yang sama
    var rawTargetId = (typeof sanitizeInput === "function") 
      ? sanitizeInput(payload.idWargaTarget || payload.ID_WARGA_TARGET || "")
      : String(payload.idWargaTarget || payload.ID_WARGA_TARGET || "").trim();

    if (!rawTargetId) {
      return {
        success: false,
        message: "ID warga target wajib diisi untuk pengajuan jenis " + rawJenis + ".",
        data: null,
        errorCode: "TARGET_ID_REQUIRED"
      };
    }

    var targetRow = wcr_findWargaRowById(wargaCtx.dataValues, wargaCtx.colMap, rawTargetId);
    if (!targetRow) {
      return {
        success: false,
        message: "Data warga target (" + rawTargetId + ") tidak ditemukan pada database.",
        data: null,
        errorCode: "TARGET_WARGA_NOT_FOUND"
      };
    }

    var targetKk = String(targetRow[idxKk] || "").replace(/\D/g, "");
    if (targetKk !== authoritativeApplicantKk) {
      return {
        success: false,
        message: "Akses Ditolak: Anda hanya dapat mengajukan perubahan data untuk anggota dalam satu Kartu Keluarga.",
        data: null,
        errorCode: "CROSS_FAMILY_REJECTED"
      };
    }

    targetWargaId = rawTargetId;
    dataLamaJson = wcr_createDataLamaSnapshot(targetRow, wargaCtx.colMap);
  }

  // F. Validasi Allowlist, Forbidden Fields, & Primitive Types pada DATA_USULAN
  var rawDataUsulan = payload.dataUsulan || payload.DATA_USULAN;
  var validationUsulan = wcr_validateDataUsulan(rawDataUsulan, rawJenis);
  if (validationUsulan.error) {
    return {
      success: false,
      message: validationUsulan.error,
      data: null,
      errorCode: "INVALID_DATA_USULAN"
    };
  }

  var dataUsulanJson = JSON.stringify(validationUsulan.data);

  // G. Validasi Alasan & Bukti Referensi
  var cleanAlasan = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.alasan || payload.ALASAN || "")
    : String(payload.alasan || payload.ALASAN || "").trim();

  if (!cleanAlasan) {
    return {
      success: false,
      message: "Alasan pengajuan perubahan data wajib diisi.",
      data: null,
      errorCode: "ALASAN_REQUIRED"
    };
  }

  var cleanBukti = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.buktiReferensi || payload.BUKTI_REFERENSI || "")
    : String(payload.buktiReferensi || payload.BUKTI_REFERENSI || "").trim();

  // H. Validasi Sheet Repository PENGAJUAN_PERUBAHAN_WARGA (Exact 18 Kolom)
  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: null,
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var repoSheet = repoCtx.sheet;

  // I. Duplicate Protection
  var repoLastRow = repoSheet.getLastRow();
  if (repoLastRow > 1) {
    var repoData = repoSheet.getRange(2, 1, repoLastRow - 1, 11).getValues();
    for (var d = 0; d < repoData.length; d++) {
      var rowD = repoData[d];
      var dPemohon = String(rowD[2] || "").trim();
      var dJenis = String(rowD[3] || "").trim().toUpperCase();
      var dTarget = String(rowD[4] || "").trim();
      var dUsulan = String(rowD[7] || "").trim();
      var dStatus = String(rowD[10] || "").trim().toUpperCase();

      if (dPemohon === applicantWargaId &&
          dJenis === rawJenis &&
          dTarget === targetWargaId &&
          dUsulan === dataUsulanJson &&
          WCR_ACTIVE_STATUSES.indexOf(dStatus) !== -1) {
        return {
          success: false,
          message: "Pengajuan serupa masih dalam proses verifikasi (Status: " + dStatus + "). Tidak dapat membuat pengajuan ganda.",
          data: { existingStatus: dStatus },
          errorCode: "DUPLICATE_CHANGE_REQUEST"
        };
      }
    }
  }

  // J. Penyimpanan Permohonan Baru
  var changeRequestId = wcr_generateId();
  // Timestamp konsisten Asia/Jakarta tanpa Z palsu
  var timestampNow = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  var initialStatus = "SUBMITTED";

  var rowToAppend = [
    changeRequestId,           // 1. ID_PENGAJUAN
    timestampNow,              // 2. TIMESTAMP_AJUKAN
    applicantWargaId,          // 3. ID_WARGA_PENGAJU
    rawJenis,                  // 4. JENIS_PENGAJUAN
    targetWargaId,             // 5. ID_WARGA_TARGET
    authoritativeApplicantKk,  // 6. NO_KK_TARGET (Disimpan di repository)
    dataLamaJson,              // 7. DATA_LAMA
    dataUsulanJson,            // 8. DATA_USULAN
    cleanAlasan,               // 9. ALASAN
    cleanBukti,                // 10. BUKTI_REFERENSI
    initialStatus,             // 11. STATUS
    "",                        // 12. CATATAN_VERIFIKASI
    "",                        // 13. DIVERIFIKASI_OLEH
    "",                        // 14. WAKTU_VERIFIKASI
    "",                        // 15. DISETUJUI_OLEH
    "",                        // 16. WAKTU_PERSETUJUAN
    "",                        // 17. WAKTU_APPLIED
    ""                         // 18. ERROR_APPLY
  ];

  repoSheet.appendRow(rowToAppend);

  Logger.log("WCR_SUBMITTED: " + changeRequestId + " by " + applicantWargaId + " type " + rawJenis);

  // Response DTO ke frontend: TIDAK mengembalikan NO_KK_TARGET
  return {
    success: true,
    message: "Pengajuan perubahan data berhasil dikirim dan menunggu verifikasi pengurus RT.",
    data: {
      idPengajuan: changeRequestId,
      timestampAjukan: timestampNow,
      status: initialStatus,
      jenisPengajuan: rawJenis,
      idWargaTarget: targetWargaId
    },
    errorCode: null
  };
}

/**
 * 2. getMyWargaChangeRequests
 * Mengambil seluruh riwayat pengajuan perubahan data milik pemohon yang terotentikasi.
 * NO_KK_TARGET TIDAK dikembalikan dalam response frontend.
 */
function getMyWargaChangeRequests(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload permintaan tidak valid.",
      data: null,
      errorCode: "INVALID_PAYLOAD"
    };
  }

  var token = payload.token;
  var authResult = verifyWargaAuthToken(token);
  if (!authResult || !authResult.sub) {
    return {
      success: false,
      message: "Sesi otorisasi warga tidak valid atau telah kedaluwarsa.",
      data: null,
      errorCode: "UNAUTHORIZED"
    };
  }

  var applicantWargaId = String(authResult.sub).trim();

  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: null,
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var repoSheet = repoCtx.sheet;
  var lastRow = repoSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: true,
      message: "Belum ada riwayat pengajuan perubahan data.",
      data: [],
      errorCode: null
    };
  }

  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  var resultList = [];

  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i];
    var rowApplicantId = String(r[2] || "").trim();

    if (rowApplicantId === applicantWargaId) {
      var dataLamaObj = null;
      var dataUsulanObj = null;

      try { dataLamaObj = JSON.parse(r[6] || "{}"); } catch (e) { dataLamaObj = {}; }
      try { dataUsulanObj = JSON.parse(r[7] || "{}"); } catch (e) { dataUsulanObj = {}; }

      // Item DTO: NO_KK_TARGET dihapus dari response frontend
      resultList.push({
        idPengajuan: String(r[0] || ""),
        timestampAjukan: String(r[1] || ""),
        idWargaPengaju: rowApplicantId,
        jenisPengajuan: String(r[3] || ""),
        idWargaTarget: String(r[4] || ""),
        dataLama: dataLamaObj,
        dataUsulan: dataUsulanObj,
        alasan: String(r[8] || ""),
        buktiReferensi: String(r[9] || ""),
        status: String(r[10] || "SUBMITTED"),
        catatanVerifikasi: String(r[11] || ""),
        diverifikasiOleh: String(r[12] || ""),
        waktuVerifikasi: String(r[13] || ""),
        disetujuiOleh: String(r[14] || ""),
        waktuPersetujuan: String(r[15] || ""),
        waktuApplied: String(r[16] || ""),
        errorApply: String(r[17] || "")
      });
    }
  }

  return {
    success: true,
    message: "Daftar pengajuan berhasil dimuat.",
    data: resultList,
    errorCode: null
  };
}

/**
 * 3. getWargaChangeRequest
 * Mengambil detail satu pengajuan perubahan data warga.
 * Strict: HANYA pemohon (token.sub === ID_WARGA_PENGAJU) yang diizinkan melihat.
 * NO_KK_TARGET TIDAK dikembalikan dalam response frontend.
 */
function getWargaChangeRequest(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload permintaan tidak valid.",
      data: null,
      errorCode: "INVALID_PAYLOAD"
    };
  }

  var token = payload.token;
  var authResult = verifyWargaAuthToken(token);
  if (!authResult || !authResult.sub) {
    return {
      success: false,
      message: "Sesi otorisasi warga tidak valid atau telah kedaluwarsa.",
      data: null,
      errorCode: "UNAUTHORIZED"
    };
  }

  var applicantWargaId = String(authResult.sub).trim();
  var targetChangeRequestId = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.idPengajuan || payload.ID_PENGAJUAN || "")
    : String(payload.idPengajuan || payload.ID_PENGAJUAN || "").trim();

  if (!targetChangeRequestId) {
    return {
      success: false,
      message: "ID pengajuan wajib disertakan.",
      data: null,
      errorCode: "ID_PENGAJUAN_REQUIRED"
    };
  }

  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: null,
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var repoSheet = repoCtx.sheet;
  var lastRow = repoSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: false,
      message: "Pengajuan dengan ID tersebut tidak ditemukan.",
      data: null,
      errorCode: "NOT_FOUND"
    };
  }

  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  var matchedRow = null;

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[0] || "").trim() === targetChangeRequestId) {
      matchedRow = r;
      break;
    }
  }

  if (!matchedRow) {
    return {
      success: false,
      message: "Pengajuan dengan ID " + targetChangeRequestId + " tidak ditemukan.",
      data: null,
      errorCode: "NOT_FOUND"
    };
  }

  // Owner-Only Access: HANYA pemohon pengajuan (ID_WARGA_PENGAJU) yang berhak melihat
  var rowApplicantId = String(matchedRow[2] || "").trim();
  if (rowApplicantId !== applicantWargaId) {
    return {
      success: false,
      message: "Akses Ditolak: Anda tidak memiliki wewenang untuk melihat pengajuan ini.",
      data: null,
      errorCode: "FORBIDDEN"
    };
  }

  var dataLamaObj = null;
  var dataUsulanObj = null;
  try { dataLamaObj = JSON.parse(matchedRow[6] || "{}"); } catch (e) { dataLamaObj = {}; }
  try { dataUsulanObj = JSON.parse(matchedRow[7] || "{}"); } catch (e) { dataUsulanObj = {}; }

  // Response DTO: NO_KK_TARGET dihapus dari response frontend
  return {
    success: true,
    message: "Detail pengajuan berhasil dimuat.",
    data: {
      idPengajuan: String(matchedRow[0] || ""),
      timestampAjukan: String(matchedRow[1] || ""),
      idWargaPengaju: rowApplicantId,
      jenisPengajuan: String(matchedRow[3] || ""),
      idWargaTarget: String(matchedRow[4] || ""),
      dataLama: dataLamaObj,
      dataUsulan: dataUsulanObj,
      alasan: String(matchedRow[8] || ""),
      buktiReferensi: String(matchedRow[9] || ""),
      status: String(matchedRow[10] || "SUBMITTED"),
      catatanVerifikasi: String(matchedRow[11] || ""),
      diverifikasiOleh: String(matchedRow[12] || ""),
      waktuVerifikasi: String(matchedRow[13] || ""),
      disetujuiOleh: String(matchedRow[14] || ""),
      waktuPersetujuan: String(matchedRow[15] || ""),
      waktuApplied: String(matchedRow[16] || ""),
      errorApply: String(matchedRow[17] || "")
    },
    errorCode: null
  };
}

/**
 * 4. getAllWargaChangeRequests
 * Queue operasional untuk Pengurus/Ketua/Admin.
 * Otorisasi menggunakan sesi server Auth.gs, BUKAN payload.userRole.
 * Default hanya mengembalikan SUBMITTED/UNDER_REVIEW.
 */
function getAllWargaChangeRequests(payload) {
  var officerCtx = wcr_getOfficerContext();
  if (officerCtx.error) {
    return {
      success: false,
      message: officerCtx.error,
      data: null,
      errorCode: "FORBIDDEN"
    };
  }

  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: null,
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var repoSheet = repoCtx.sheet;
  var lastRow = repoSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: true,
      message: "Belum ada pengajuan perubahan data yang menunggu verifikasi.",
      data: [],
      errorCode: null
    };
  }

  var requestedStatus = String((payload || {}).status || "PENDING").trim().toUpperCase();
  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  var resultList = [];

  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    var status = String(row[10] || "SUBMITTED").trim().toUpperCase();

    var include = false;
    if (requestedStatus === "ALL") {
      include = true;
    } else if (requestedStatus === "SUBMITTED" || requestedStatus === "UNDER_REVIEW") {
      include = status === requestedStatus;
    } else {
      // PENDING = SUBMITTED + UNDER_REVIEW
      include = WCR_ACTIVE_STATUSES.indexOf(status) !== -1;
    }

    if (include) resultList.push(wcr_rowToOfficerDto(row));
  }

  return {
    success: true,
    message: "Daftar pengajuan perubahan data berhasil dimuat.",
    data: resultList,
    errorCode: null
  };
}

/**
 * 5. reviewWargaChangeRequest
 * Decision APPROVE/REJECT oleh Pengurus.
 *
 * CR-WCR/PROD-003 scope implementasi write: ADD.
 * EDIT/COMPLETE/REMOVE/STATUS belum diberi writer approval agar tidak
 * memperluas mutasi SSoT di luar scope CR ini.
 */
function reviewWargaChangeRequest(payload) {
  var officerCtx = wcr_getOfficerContext();
  if (officerCtx.error) {
    return {
      success: false,
      message: officerCtx.error,
      data: null,
      errorCode: "FORBIDDEN"
    };
  }

  payload = payload || {};

  var targetId = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.idPengajuan || payload.ID_PENGAJUAN || "")
    : String(payload.idPengajuan || payload.ID_PENGAJUAN || "").trim();

  var decision = String(payload.decision || payload.keputusan || payload.status || "")
    .trim().toUpperCase();

  if (!targetId) {
    return {
      success: false,
      message: "ID pengajuan wajib disertakan.",
      data: null,
      errorCode: "ID_PENGAJUAN_REQUIRED"
    };
  }

  if (["APPROVE", "APPROVED", "REJECT", "REJECTED"].indexOf(decision) === -1) {
    return {
      success: false,
      message: "Keputusan review harus APPROVE atau REJECT.",
      data: null,
      errorCode: "INVALID_REVIEW_DECISION"
    };
  }

  if (decision === "APPROVED") decision = "APPROVE";
  if (decision === "REJECTED") decision = "REJECT";

  var note = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.catatanVerifikasi || payload.catatan || payload.CATATAN_VERIFIKASI || "")
    : String(payload.catatanVerifikasi || payload.catatan || payload.CATATAN_VERIFIKASI || "").trim();

  if (decision === "REJECT" && !note) {
    return {
      success: false,
      message: "Catatan verifikasi wajib diisi saat menolak pengajuan.",
      data: null,
      errorCode: "REJECTION_NOTE_REQUIRED"
    };
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    return {
      success: false,
      message: "Sistem sedang memproses pengajuan lain. Silakan ulangi beberapa saat lagi.",
      data: null,
      errorCode: "REVIEW_LOCK_TIMEOUT"
    };
  }

  try {
    var ss = wcr_getSpreadsheet();
    if (!ss) {
      return {
        success: false,
        message: "Spreadsheet database tidak dapat diakses.",
        data: null,
        errorCode: "SPREADSHEET_NOT_FOUND"
      };
    }

    var repoCtx = wcr_getAndValidateRepositorySheet(ss);
    if (repoCtx.error) {
      return {
        success: false,
        message: repoCtx.error,
        data: null,
        errorCode: "REPOSITORY_SHEET_ERROR"
      };
    }

    var repoSheet = repoCtx.sheet;
    var matched = wcr_findRepositoryRowById(repoSheet, targetId);
    if (!matched) {
      return {
        success: false,
        message: "Pengajuan dengan ID " + targetId + " tidak ditemukan.",
        data: null,
        errorCode: "NOT_FOUND"
      };
    }

    var row = matched.values;
    var currentStatus = String(row[10] || "SUBMITTED").trim().toUpperCase();

    // Idempotency: approval yang sudah benar-benar applied tidak boleh menulis ulang.
    var appliedAt = String(row[16] || "").trim();
    if (currentStatus === "APPROVED" && appliedAt) {
      return {
        success: true,
        message: "Pengajuan sudah disetujui dan diterapkan sebelumnya.",
        data: wcr_rowToOfficerDto(row),
        errorCode: null
      };
    }

    // Legacy recovery: beberapa WCR lama berstatus APPROVED tetapi WAKTU_APPLIED kosong.
    // Kondisi ini boleh diproses ulang hanya untuk menyelesaikan write + read-back SSoT.
    var legacyApprovedWithoutApply =
      currentStatus === "APPROVED" && !appliedAt;

    if (WCR_ACTIVE_STATUSES.indexOf(currentStatus) === -1 && !legacyApprovedWithoutApply) {
      return {
        success: false,
        message: "Pengajuan tidak dapat diproses pada status saat ini: " + currentStatus + ".",
        data: wcr_rowToOfficerDto(row),
        errorCode: "INVALID_WCR_STATUS"
      };
    }

    var actor = wcr_getOfficerActor(officerCtx.user);
    var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    if (decision === "REJECT") {
      wcr_setRepositoryReview(repoSheet, matched.rowNumber, {
        status: "REJECTED",
        catatanVerifikasi: note,
        diverifikasiOleh: actor,
        waktuVerifikasi: now,
        disetujuiOleh: "",
        waktuPersetujuan: "",
        waktuApplied: "",
        errorApply: ""
      });

      if (typeof writeLog === "function") {
        try {
          writeLog(actor, "WCR_REJECT", "WARGA_CHANGE_REQUEST", targetId, note || "Pengajuan ditolak.");
        } catch (logErr) {
          Logger.log("WCR_REJECT_LOG_FAILED: " + logErr.message);
        }
      }

      var rejected = wcr_findRepositoryRowById(repoSheet, targetId);
      return {
        success: true,
        message: "Pengajuan berhasil ditolak. Tidak ada perubahan pada WARGA SSoT.",
        data: rejected ? wcr_rowToOfficerDto(rejected.values) : null,
        errorCode: null
      };
    }

    // CR-WCR/PROD-003 hanya membuka writer approval untuk ADD.
    var jenis = String(row[3] || "").trim().toUpperCase();
    if (jenis !== "ADD") {
      return {
        success: false,
        message: "Approval writer untuk jenis pengajuan " + jenis + " belum termasuk scope CR-WCR/PROD-003.",
        data: null,
        errorCode: "WCR_TYPE_NOT_SUPPORTED_FOR_APPROVAL"
      };
    }

    var applicantId = String(row[2] || "").trim();
    var authoritativeKk = wcr_normalizeDigits(row[5]);
    var dataUsulan = wcr_parseJsonObject(row[7]);

    if (!/^\d{16}$/.test(authoritativeKk)) {
      return {
        success: false,
        message: "NO_KK_TARGET pada pengajuan tidak valid. Approval dihentikan.",
        data: null,
        errorCode: "INVALID_AUTHORITATIVE_KK"
      };
    }

    var validationUsulan = wcr_validateDataUsulan(dataUsulan, jenis);
    if (validationUsulan.error) {
      return {
        success: false,
        message: validationUsulan.error,
        data: null,
        errorCode: "INVALID_DATA_USULAN"
      };
    }
    dataUsulan = validationUsulan.data;

    var nik = wcr_normalizeDigits(dataUsulan.NIK);
    var nama = String(dataUsulan.NAMA_LENGKAP || "").trim();
    var tanggalLahir = String(dataUsulan.TANGGAL_LAHIR || "").trim();
    var hubungan = String(dataUsulan.HUBUNGAN_KELUARGA || "").trim().toUpperCase();

    if (!/^\d{16}$/.test(nik)) {
      return {
        success: false,
        message: "NIK anggota baru wajib 16 digit.",
        data: null,
        errorCode: "INVALID_NIK"
      };
    }
    if (!nama) {
      return {
        success: false,
        message: "NAMA_LENGKAP anggota baru wajib diisi.",
        data: null,
        errorCode: "NAMA_REQUIRED"
      };
    }
    if (!tanggalLahir) {
      return {
        success: false,
        message: "TANGGAL_LAHIR anggota baru wajib diisi.",
        data: null,
        errorCode: "DOB_REQUIRED"
      };
    }
    if (!hubungan) {
      return {
        success: false,
        message: "HUBUNGAN_KELUARGA anggota baru wajib diisi.",
        data: null,
        errorCode: "RELATION_REQUIRED"
      };
    }
    if (hubungan === "KEPALA_KELUARGA" || hubungan === "KEPALA KELUARGA") {
      return {
        success: false,
        message: "ADD anggota baru tidak boleh membuat Kepala Keluarga kedua pada NO_KK yang sama.",
        data: null,
        errorCode: "DUPLICATE_HEAD_OF_FAMILY"
      };
    }

    var wargaCtx = wcr_getWargaSheetContext(ss);
    if (wargaCtx.error) {
      return {
        success: false,
        message: wargaCtx.error,
        data: null,
        errorCode: "WARGA_SSOT_ERROR"
      };
    }

    var wargaSheet = ss.getSheetByName("WARGA");
    if (!wargaSheet || wargaSheet.getLastColumn() < 23) {
      return {
        success: false,
        message: "Schema WARGA tidak memenuhi kontrak 23 kolom. Approval dihentikan.",
        data: null,
        errorCode: "WARGA_SCHEMA_ERROR"
      };
    }

    var applicantRow = wcr_findWargaRowById(wargaCtx.dataValues, wargaCtx.colMap, applicantId);
    if (!applicantRow) {
      return {
        success: false,
        message: "Data pemohon tidak ditemukan pada WARGA SSoT.",
        data: null,
        errorCode: "APPLICANT_NOT_FOUND"
      };
    }

    var applicantKk = wcr_normalizeDigits(applicantRow[wargaCtx.colMap["NO_KK"]]);
    if (applicantKk !== authoritativeKk) {
      return {
        success: false,
        message: "NO_KK pengajuan tidak sama dengan NO_KK pemohon pada WARGA SSoT.",
        data: null,
        errorCode: "KK_SSOT_MISMATCH"
      };
    }

    // Pastikan KK pemohon memang memiliki Kepala Keluarga.
    var idxHub = wargaCtx.colMap["HUBUNGAN_KELUARGA"];
    var hasHead = false;
    for (var h = 1; h < wargaCtx.dataValues.length; h++) {
      var familyRow = wargaCtx.dataValues[h];
      if (wcr_normalizeDigits(familyRow[wargaCtx.colMap["NO_KK"]]) === authoritativeKk) {
        var familyHub = String(familyRow[idxHub] || "").trim().toUpperCase();
        if (familyHub === "KEPALA_KELUARGA" || familyHub === "KEPALA KELUARGA") {
          hasHead = true;
          break;
        }
      }
    }
    if (!hasHead) {
      return {
        success: false,
        message: "Kepala Keluarga untuk NO_KK tersebut tidak ditemukan pada WARGA SSoT.",
        data: null,
        errorCode: "HEAD_OF_FAMILY_NOT_FOUND"
      };
    }

    // NIK harus unik. Jika retry terjadi setelah append berhasil tetapi update WCR gagal,
    // record yang sama dikenali sebagai already-applied dan tidak diduplikasi.
    var existingNikRow = wcr_findWargaRowByNik(wargaCtx.dataValues, wargaCtx.colMap, nik);
    if (existingNikRow) {
      var existingKk = wcr_normalizeDigits(existingNikRow[wargaCtx.colMap["NO_KK"]]);
      var existingName = String(existingNikRow[wargaCtx.colMap["NAMA_LENGKAP"]] || "").trim();
      var existingDob = String(existingNikRow[wargaCtx.colMap["TANGGAL_LAHIR"]] || "").trim();

      if (existingKk === authoritativeKk && existingName === nama && existingDob === tanggalLahir) {
        var existingId = String(existingNikRow[wargaCtx.colMap["ID_WARGA"]] || "").trim();
        wcr_setRepositoryReview(repoSheet, matched.rowNumber, {
          status: "APPROVED",
          catatanVerifikasi: note || "Disetujui; record WARGA sudah terdeteksi sebelumnya.",
          diverifikasiOleh: actor,
          waktuVerifikasi: now,
          disetujuiOleh: actor,
          waktuPersetujuan: now,
          waktuApplied: now,
          errorApply: ""
        });

        return {
          success: true,
          message: "Pengajuan sudah memiliki record WARGA yang sesuai; tidak dibuat duplikasi.",
          data: {
            idPengajuan: targetId,
            idWarga: existingId,
            noKk: authoritativeKk,
            status: "APPROVED",
            waktuApplied: now
          },
          errorCode: null
        };
      }

      return {
        success: false,
        message: "NIK sudah terdaftar pada WARGA SSoT dengan data yang berbeda. Approval dihentikan.",
        data: null,
        errorCode: "DUPLICATE_NIK"
      };
    }

    var generatedWargaId = wcr_generateWargaId();
    var wargaRow = wcr_buildWargaRowFromAdd(
      dataUsulan,
      authoritativeKk,
      generatedWargaId,
      applicantRow,
      wargaCtx.colMap,
      now
    );

    wargaSheet.appendRow(wargaRow);
    SpreadsheetApp.flush();

    var newWargaRowNumber = wargaSheet.getLastRow();
    var readBackOk = wcr_verifyAppliedAdd(
      wargaSheet,
      newWargaRowNumber,
      generatedWargaId,
      nik,
      authoritativeKk,
      nama
    );

    if (!readBackOk) {
      // Rollback hanya jika row terakhir masih merupakan row yang kita tulis.
      try {
        var rollbackValues = wargaSheet.getRange(newWargaRowNumber, 1, 1, 23).getValues()[0];
        if (String(rollbackValues[0] || "").trim() === generatedWargaId) {
          wargaSheet.deleteRow(newWargaRowNumber);
        }
      } catch (rollbackErr) {
        Logger.log("WCR_APPROVAL_ROLLBACK_FAILED: " + rollbackErr.message);
      }

      wcr_setRepositoryReview(repoSheet, matched.rowNumber, {
        status: "UNDER_REVIEW",
        catatanVerifikasi: note,
        diverifikasiOleh: actor,
        waktuVerifikasi: now,
        disetujuiOleh: "",
        waktuPersetujuan: "",
        waktuApplied: "",
        errorApply: "READ_BACK_FAILED"
      });

      return {
        success: false,
        message: "Penambahan warga gagal diverifikasi melalui read-back. WCR tetap menunggu review.",
        data: null,
        errorCode: "READ_BACK_FAILED"
      };
    }

    // Hanya setelah write + read-back sukses, WCR ditandai APPROVED/APPLIED.
    wcr_setRepositoryReview(repoSheet, matched.rowNumber, {
      status: "APPROVED",
      catatanVerifikasi: note,
      diverifikasiOleh: actor,
      waktuVerifikasi: now,
      disetujuiOleh: actor,
      waktuPersetujuan: now,
      waktuApplied: now,
      errorApply: ""
    });

    if (typeof writeLog === "function") {
      try {
        writeLog(actor, "WCR_APPROVE", "WARGA_CHANGE_REQUEST", targetId,
          "ADD applied ke WARGA: " + generatedWargaId);
      } catch (logErr2) {
        Logger.log("WCR_APPROVE_LOG_FAILED: " + logErr2.message);
      }
    }

    var finalRepo = wcr_findRepositoryRowById(repoSheet, targetId);

    return {
      success: true,
      message: "Pengajuan disetujui dan data warga berhasil ditambahkan ke WARGA SSoT.",
      data: {
        idPengajuan: targetId,
        idWarga: generatedWargaId,
        noKk: authoritativeKk,
        status: "APPROVED",
        waktuApplied: now,
        wcr: finalRepo ? wcr_rowToOfficerDto(finalRepo.values) : null
      },
      errorCode: null
    };

  } catch (err) {
    Logger.log("WCR_REVIEW_FAILED: " + (err && err.stack ? err.stack : err));
    return {
      success: false,
      message: "Gagal memproses review pengajuan: " + (err && err.message ? err.message : "Error"),
      data: null,
      errorCode: "REVIEW_WCR_FAILED"
    };
  } finally {
    try { lock.releaseLock(); } catch (releaseErr) {}
  }
}

/**
 * 6. recoverLegacyWargaChangeRequest
 *
 * Recovery terkontrol untuk WCR legacy yang sudah berstatus APPROVED tetapi
 * belum memiliki WAKTU_APPLIED. Fungsi TIDAK menerima role dari payload sebagai
 * sumber otorisasi; officer wajib lolos wcr_getOfficerContext().
 *
 * Scope recovery: memanggil writer ADD yang sama dengan reviewWargaChangeRequest()
 * sehingga tetap melewati validasi KK, NIK, duplicate protection, write, read-back,
 * dan idempotency. Tidak ada reset dan tidak ada write langsung dari fungsi ini.
 */
function recoverLegacyWargaChangeRequest(payload) {
  var officerCtx = wcr_getOfficerContext();
  if (officerCtx.error) {
    return {
      success: false,
      message: officerCtx.error,
      data: null,
      errorCode: "FORBIDDEN"
    };
  }

  payload = payload || {};

  var targetId = (typeof sanitizeInput === "function")
    ? sanitizeInput(payload.idPengajuan || payload.ID_PENGAJUAN || "")
    : String(payload.idPengajuan || payload.ID_PENGAJUAN || "").trim();

  if (!targetId) {
    return {
      success: false,
      message: "ID pengajuan wajib disertakan untuk recovery legacy.",
      data: null,
      errorCode: "ID_PENGAJUAN_REQUIRED"
    };
  }

  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: null,
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var matched = wcr_findRepositoryRowById(repoCtx.sheet, targetId);
  if (!matched) {
    return {
      success: false,
      message: "Pengajuan dengan ID " + targetId + " tidak ditemukan.",
      data: null,
      errorCode: "NOT_FOUND"
    };
  }

  var row = matched.values;
  var status = String(row[10] || "").trim().toUpperCase();
  var appliedAt = String(row[16] || "").trim();

  if (status !== "APPROVED" || appliedAt) {
    return {
      success: false,
      message: "Recovery hanya berlaku untuk WCR berstatus APPROVED dengan WAKTU_APPLIED kosong.",
      data: wcr_rowToOfficerDto(row),
      errorCode: "NOT_LEGACY_APPROVED"
    };
  }

  // Recovery menggunakan writer approval yang sama; tidak ada jalur mutasi kedua.
  return reviewWargaChangeRequest({
    idPengajuan: targetId,
    decision: "APPROVE",
    catatanVerifikasi: String(row[11] || "").trim() ||
      "Legacy recovery: sinkronisasi approval ke WARGA SSoT.",
    // role hanya untuk kompatibilitas payload lama; review tetap melakukan
    // otorisasi melalui wcr_getOfficerContext().
    role: String(officerCtx.user.ROLE || "").trim().toUpperCase()
  });
}

