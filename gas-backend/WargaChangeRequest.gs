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
  "NIK",
  "NO_KK",
  "STATUS_WARGA",
  "TANGGAL_MASUK",
  "TOKEN",
  "PASSWORD",
  "AUTH_TOKEN"
];

var WCR_ACTIVE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"];

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
 * 
 * CR-WCR/PROD-002:
 * - jenisPengajuan === 'ADD': Izinkan field data anggota baru termasuk NIK (16 digit numerik).
 * - jenis selain ADD: Larangan NIK dan field sensitif lainnya tetap mutlak (jangan dilemahkan).
 */
function wcr_validateDataUsulan(dataUsulanRaw, jenisPengajuan) {
  if (!dataUsulanRaw || typeof dataUsulanRaw !== "object" || Array.isArray(dataUsulanRaw)) {
    return { error: "DATA_USULAN wajib berupa objek data pasangan kunci-nilai." };
  }

  var keys = Object.keys(dataUsulanRaw);
  if (keys.length === 0) {
    return { error: "DATA_USULAN tidak boleh kosong." };
  }

  var isAdd = (String(jenisPengajuan || "").trim().toUpperCase() === "ADD");
  var sanitizedData = {};

  for (var i = 0; i < keys.length; i++) {
    var originalKey = keys[i];
    var upperKey = String(originalKey).trim().toUpperCase();

    // 1. Cek Forbidden Fields
    if (isAdd) {
      // Untuk ADD, NIK diizinkan untuk anggota keluarga baru, field sistem tetap dilarang
      var forbiddenAdd = ["ID_WARGA", "NO_KK", "STATUS_WARGA", "TANGGAL_MASUK", "TOKEN", "PASSWORD", "AUTH_TOKEN"];
      if (forbiddenAdd.indexOf(upperKey) !== -1) {
        return {
          error: "Field '" + originalKey + "' DILARANG diajukan perubahan secara mandiri demi integritas data & keamanan."
        };
      }
    } else {
      // Untuk jenis selain ADD, NIK mutlak dilarang diubah secara mandiri
      if (WCR_FORBIDDEN_FIELDS.indexOf(upperKey) !== -1) {
        return {
          error: "Field '" + originalKey + "' DILARANG diajukan perubahan secara mandiri demi integritas data & keamanan."
        };
      }
    }

    // 2. Cek Allowlist Fields
    if (isAdd) {
      var allowedAdd = WCR_ALLOWLIST_FIELDS.concat(["NIK"]);
      if (allowedAdd.indexOf(upperKey) === -1) {
        return {
          error: "Field '" + originalKey + "' tidak termasuk dalam daftar field yang diizinkan untuk diajukan perubahan."
        };
      }
    } else {
      if (WCR_ALLOWLIST_FIELDS.indexOf(upperKey) === -1) {
        return {
          error: "Field '" + originalKey + "' tidak termasuk dalam daftar field yang diizinkan untuk diajukan perubahan."
        };
      }
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

    // Validasi format NIK jika ada pada jenis ADD
    if (isAdd && upperKey === "NIK" && cleanVal !== "") {
      var digitsOnly = cleanVal.replace(/\D/g, "");
      if (digitsOnly.length !== 16) {
        return {
          error: "NIK anggota keluarga baru harus tepat 16 digit numerik."
        };
      }
      cleanVal = digitsOnly;
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
    var colIdx = colMap[field];
    if (colIdx !== undefined && colIdx < row.length) {
      var cellVal = row[colIdx];
      snapshot[field] = (cellVal === null || cellVal === undefined) ? "" : String(cellVal).trim();
    }
  }

  return JSON.stringify(snapshot);
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

  // I. Duplicate Protection & Idempotent Resubmit
  var customIdPengajuan = String(payload.idPengajuan || payload.ID_PENGAJUAN || "").trim();
  var repoLastRow = repoSheet.getLastRow();
  if (repoLastRow > 1) {
    // 1. Idempotent check by ID_PENGAJUAN
    if (customIdPengajuan) {
      var existingIdCol = repoSheet.getRange(2, 1, repoLastRow - 1, 1).getValues();
      for (var k = 0; k < existingIdCol.length; k++) {
        if (String(existingIdCol[k][0] || "").trim() === customIdPengajuan) {
          return {
            success: true,
            message: "Pengajuan sudah tersimpan di database repository.",
            data: {
              idPengajuan: customIdPengajuan,
              status: "SUBMITTED",
              jenisPengajuan: rawJenis,
              idWargaTarget: targetWargaId
            },
            errorCode: null
          };
        }
      }
    }

    // 2. Semantics duplicate check
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
  var changeRequestId = customIdPengajuan || wcr_generateId();
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
 * CR-WCR/PROD-002: Mengambil seluruh riwayat pengajuan perubahan data warga untuk area Pengurus.
 * Strict RBAC: Hanya PENGURUS, KETUA_RT, ADMIN. Warga biasa DITOLAK (fail-closed).
 */
function getAllWargaChangeRequests(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload permintaan tidak valid.",
      data: [],
      errorCode: "INVALID_PAYLOAD"
    };
  }

  // 1. RBAC Verification
  var callerRole = String(payload.role || payload.userRole || "").trim().toUpperCase();
  if (payload.token) {
    var auth = (typeof verifyWargaAuthToken === "function") ? verifyWargaAuthToken(payload.token) : null;
    if (auth && auth.role) {
      callerRole = String(auth.role).trim().toUpperCase();
    }
  }

  var allowedRoles = ["PENGURUS", "KETUA_RT", "ADMIN"];
  if (allowedRoles.indexOf(callerRole) === -1) {
    return {
      success: false,
      message: "Akses Ditolak: Anda tidak memiliki wewenang untuk melihat seluruh pengajuan warga.",
      data: [],
      errorCode: "UNAUTHORIZED"
    };
  }

  // 2. Akses Database Spreadsheet
  var ss = wcr_getSpreadsheet();
  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak dapat diakses.",
      data: [],
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var repoCtx = wcr_getAndValidateRepositorySheet(ss);
  if (repoCtx.error) {
    return {
      success: false,
      message: repoCtx.error,
      data: [],
      errorCode: "REPOSITORY_SHEET_ERROR"
    };
  }

  var repoSheet = repoCtx.sheet;
  var lastRow = repoSheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: true,
      message: "Belum ada pengajuan perubahan data warga.",
      data: [],
      errorCode: null
    };
  }

  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  var resultList = [];

  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i];
    var dataLamaObj = {};
    var dataUsulanObj = {};

    try { dataLamaObj = JSON.parse(r[6] || "{}"); } catch (e) { dataLamaObj = {}; }
    try { dataUsulanObj = JSON.parse(r[7] || "{}"); } catch (e) { dataUsulanObj = {}; }

    resultList.push({
      idPengajuan: String(r[0] || ""),
      timestampAjukan: String(r[1] || ""),
      idWargaPengaju: String(r[2] || ""),
      jenisPengajuan: String(r[3] || ""),
      idWargaTarget: String(r[4] || ""),
      noKkTarget: String(r[5] || ""),
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

  return {
    success: true,
    message: "Seluruh pengajuan perubahan warga berhasil dimuat.",
    data: resultList,
    errorCode: null
  };
}

/**
 * 5. reviewWargaChangeRequest
 * CR-WCR/PROD-002: Verifikasi, Persetujuan (Approve), atau Penolakan (Reject) WCR oleh Pengurus/RT/Admin.
 * Jika APPROVED & jenis === 'ADD':
 * - NO_KK diambil secara otoritatif dari applicant profile (bukan input bebas).
 * - Menulis anggota keluarga baru ke Sheet WARGA dengan status HUBUNGAN_KELUARGA = 'ANGGOTA_KELUARGA'.
 * - Melakukan immediate read-back dari Sheet WARGA. Jika read-back gagal, fail-closed & status gagal.
 * - Memperbarui status pengajuan di PENGAJUAN_PERUBAHAN_WARGA menjadi 'APPROVED'.
 */
function reviewWargaChangeRequest(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      message: "Payload verifikasi tidak valid.",
      data: null,
      errorCode: "INVALID_PAYLOAD"
    };
  }

  // 1. RBAC Verification
  var callerRole = String(payload.role || payload.userRole || "").trim().toUpperCase();
  if (payload.token) {
    var auth = (typeof verifyWargaAuthToken === "function") ? verifyWargaAuthToken(payload.token) : null;
    if (auth && auth.role) {
      callerRole = String(auth.role).trim().toUpperCase();
    }
  }

  var allowedRoles = ["PENGURUS", "KETUA_RT", "ADMIN"];
  if (allowedRoles.indexOf(callerRole) === -1) {
    return {
      success: false,
      message: "Akses Ditolak: Hanya Pengurus/RT/Admin yang berhak melakukan verifikasi/persetujuan pengajuan warga.",
      data: null,
      errorCode: "UNAUTHORIZED"
    };
  }

  var idPengajuan = String(payload.idPengajuan || payload.ID_PENGAJUAN || "").trim();
  if (!idPengajuan) {
    return {
      success: false,
      message: "ID Pengajuan wajib disertakan.",
      data: null,
      errorCode: "ID_PENGAJUAN_REQUIRED"
    };
  }

  var decision = String(payload.actionType || payload.decision || payload.status || "").trim().toUpperCase();
  if (decision !== "APPROVE" && decision !== "APPROVED" && decision !== "REJECT" && decision !== "REJECTED") {
    return {
      success: false,
      message: "Tindakan verifikasi harus berupa APPROVE atau REJECT.",
      data: null,
      errorCode: "INVALID_DECISION"
    };
  }

  var reviewerName = String(payload.reviewedBy || payload.userName || callerRole).trim();
  var reviewerNotes = String(payload.catatanVerifikasi || payload.alasan || "").trim();

  // 2. Akses Spreadsheet
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
      message: "Pengajuan tidak ditemukan di repository.",
      data: null,
      errorCode: "NOT_FOUND"
    };
  }

  var rows = repoSheet.getRange(2, 1, lastRow - 1, WCR_REQUIRED_HEADERS.length).getValues();
  var targetRowIndex = -1;
  var matchedWcr = null;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || "").trim() === idPengajuan) {
      targetRowIndex = i + 2; // Baris riil di sheet (1-based, +1 header)
      matchedWcr = rows[i];
      break;
    }
  }

  if (!matchedWcr || targetRowIndex === -1) {
    return {
      success: false,
      message: "Pengajuan dengan ID " + idPengajuan + " tidak ditemukan.",
      data: null,
      errorCode: "NOT_FOUND"
    };
  }

  var currentStatus = String(matchedWcr[10] || "SUBMITTED").trim().toUpperCase();
  if (currentStatus === "APPROVED" || currentStatus === "REJECTED") {
    return {
      success: false,
      message: "Pengajuan ini sudah berstatus " + currentStatus + " dan tidak dapat diproses ulang.",
      data: { status: currentStatus },
      errorCode: "ALREADY_PROCESSED"
    };
  }

  var timestampNow = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  var jenisPengajuan = String(matchedWcr[3] || "").trim().toUpperCase();

  // 3. JIKA APPROVE:
  if (decision === "APPROVE" || decision === "APPROVED") {
    if (jenisPengajuan === "ADD") {
      var dataUsulan = {};
      try { dataUsulan = JSON.parse(matchedWcr[7] || "{}"); } catch (e) { dataUsulan = {}; }

      // Baca konteks SSoT WARGA untuk identifikasi NO_KK authoritative pemohon
      var wargaCtx = wcr_getWargaSheetContext(ss);
      if (wargaCtx.error) {
        return {
          success: false,
          message: "Gagal mengakses Sheet WARGA: " + wargaCtx.error,
          data: null,
          errorCode: "SSOT_WARGA_UNAVAILABLE"
        };
      }

      var applicantWargaId = String(matchedWcr[2] || "").trim();
      var applicantRow = wcr_findWargaRowById(wargaCtx.dataValues, wargaCtx.colMap, applicantWargaId);
      if (!applicantRow) {
        return {
          success: false,
          message: "Data pemohon (" + applicantWargaId + ") tidak ditemukan pada SSoT WARGA.",
          data: null,
          errorCode: "APPLICANT_NOT_FOUND"
        };
      }

      // NO_KK WAJIB dari profile authoritative pemohon (EKO)
      var idxKk = wargaCtx.colMap["NO_KK"];
      var authoritativeNoKk = String(applicantRow[idxKk] || "").replace(/\D/g, "");
      if (authoritativeNoKk.length !== 16) {
        return {
          success: false,
          message: "Nomor KK pemohon tidak valid pada database resmi.",
          data: null,
          errorCode: "INVALID_AUTHORITATIVE_KK"
        };
      }

      var idxAlamat = wargaCtx.colMap["ALAMAT"];
      var idxBlok = wargaCtx.colMap["BLOK"];
      var authoritativeAlamat = String(applicantRow[idxAlamat] || "PERUM GPA BLOK JN NO 17").trim();
      var authoritativeBlok = String(applicantRow[idxBlok] || "Blok JN No 17").trim();

      var nikBaru = String(dataUsulan.NIK || "").replace(/\D/g, "");
      if (nikBaru.length !== 16) {
        return {
          success: false,
          message: "NIK anggota keluarga baru tidak valid (harus 16 digit numerik).",
          data: null,
          errorCode: "INVALID_NIK"
        };
      }

      var sheetWarga = ss.getSheetByName("WARGA");
      var wargaLastRow = sheetWarga.getLastRow();
      var newWargaId = "WRG-" + String(wargaLastRow).padStart(3, "0");

      var newNama = String(dataUsulan.NAMA_LENGKAP || "").trim();
      var newHubungan = "ANGGOTA_KELUARGA"; // AIDA dan WITANTI menjadi ANGGOTA_KELUARGA

      var newWargaRow = [
        newWargaId,                                          // 1. ID_WARGA
        nikBaru,                                             // 2. NIK
        authoritativeNoKk,                                   // 3. NO_KK (authoritative EKO)
        newNama,                                             // 4. NAMA_LENGKAP
        String(dataUsulan.NAMA_PANGGILAN || "").trim(),      // 5. NAMA_PANGGILAN
        String(dataUsulan.JENIS_KELAMIN || "Perempuan").trim(), // 6. JENIS_KELAMIN
        String(dataUsulan.TEMPAT_LAHIR || "Malang").trim(),  // 7. TEMPAT_LAHIR
        String(dataUsulan.TANGGAL_LAHIR || "").trim(),       // 8. TANGGAL_LAHIR
        String(dataUsulan.AGAMA || "Islam").trim(),          // 9. AGAMA
        String(dataUsulan.STATUS_PERKAWINAN || "Belum Kawin").trim(), // 10. STATUS_PERKAWINAN
        String(dataUsulan.PENDIDIKAN || "").trim(),          // 11. PENDIDIKAN
        String(dataUsulan.PEKERJAAN || "").trim(),           // 12. PEKERJAAN
        "'" + String(dataUsulan.NO_HP || "").trim(),         // 13. NO_HP
        String(dataUsulan.EMAIL || "").trim(),               // 14. EMAIL
        authoritativeAlamat,                                 // 15. ALAMAT
        authoritativeBlok,                                   // 16. BLOK
        "TETAP",                                             // 17. STATUS_TINGGAL
        "AKTIF",                                             // 18. STATUS_WARGA
        timestampNow.split(" ")[0],                          // 19. TANGGAL_MASUK
        "Disetujui dari pengajuan " + idPengajuan,           // 20. KETERANGAN
        "",                                                  // 21. NAMA_PEMILIK_RUMAH
        "",                                                  // 22. TELEPON_PEMILIK_RUMAH
        newHubungan                                          // 23. HUBUNGAN_KELUARGA
      ];

      // WRITE KE WARGA SSOT
      try {
        sheetWarga.appendRow(newWargaRow);
        SpreadsheetApp.flush();
      } catch (writeErr) {
        repoSheet.getRange(targetRowIndex, 18).setValue("Write WARGA failed: " + writeErr.message);
        return {
          success: false,
          message: "Gagal menulis anggota baru ke basis data WARGA: " + writeErr.message,
          data: null,
          errorCode: "WRITE_SSOT_FAILED"
        };
      }

      // READ-BACK VERIFICATION
      var readBackVerified = false;
      try {
        var postLastRow = sheetWarga.getLastRow();
        var postValues = sheetWarga.getRange(2, 1, postLastRow - 1, 3).getValues();
        for (var p = postValues.length - 1; p >= 0; p--) {
          var pRow = postValues[p];
          if (String(pRow[0] || "").trim() === newWargaId || String(pRow[1] || "").trim() === nikBaru) {
            readBackVerified = true;
            break;
          }
        }
      } catch (rbErr) {
        readBackVerified = false;
      }

      if (!readBackVerified) {
        repoSheet.getRange(targetRowIndex, 18).setValue("Read-back verification failed for new warga " + newWargaId);
        return {
          success: false,
          message: "Verifikasi pembacaan ulang (read-back) gagal setelah penulisan data warga. Persetujuan ditahan demi integritas data.",
          data: null,
          errorCode: "READBACK_VERIFICATION_FAILED"
        };
      }

      // UPDATE STATUS WCR
      repoSheet.getRange(targetRowIndex, 11).setValue("APPROVED"); // STATUS
      repoSheet.getRange(targetRowIndex, 12).setValue(reviewerNotes || "Disetujui oleh pengurus RT."); // CATATAN_VERIFIKASI
      repoSheet.getRange(targetRowIndex, 13).setValue(reviewerName); // DIVERIFIKASI_OLEH
      repoSheet.getRange(targetRowIndex, 14).setValue(timestampNow); // WAKTU_VERIFIKASI
      repoSheet.getRange(targetRowIndex, 15).setValue(reviewerName); // DISETUJUI_OLEH
      repoSheet.getRange(targetRowIndex, 16).setValue(timestampNow); // WAKTU_PERSETUJUAN
      repoSheet.getRange(targetRowIndex, 17).setValue(timestampNow); // WAKTU_APPLIED
      repoSheet.getRange(targetRowIndex, 18).setValue("");           // ERROR_APPLY

      return {
        success: true,
        message: "Pengajuan tambah anggota keluarga (" + newNama + ") berhasil disetujui, dicatat ke SSoT, dan diverifikasi read-back.",
        data: {
          idPengajuan: idPengajuan,
          status: "APPROVED",
          newWargaId: newWargaId,
          namaLengkap: newNama,
          noKk: authoritativeNoKk,
          hubunganKeluarga: newHubungan,
          timestampApproval: timestampNow
        },
        errorCode: null
      };
    } else {
      repoSheet.getRange(targetRowIndex, 11).setValue("APPROVED");
      repoSheet.getRange(targetRowIndex, 12).setValue(reviewerNotes || "Disetujui.");
      repoSheet.getRange(targetRowIndex, 13).setValue(reviewerName);
      repoSheet.getRange(targetRowIndex, 14).setValue(timestampNow);
      repoSheet.getRange(targetRowIndex, 15).setValue(reviewerName);
      repoSheet.getRange(targetRowIndex, 16).setValue(timestampNow);
      repoSheet.getRange(targetRowIndex, 17).setValue(timestampNow);
      repoSheet.getRange(targetRowIndex, 18).setValue("");

      return {
        success: true,
        message: "Pengajuan berhasil disetujui.",
        data: { idPengajuan: idPengajuan, status: "APPROVED" },
        errorCode: null
      };
    }
  } else {
    // REJECT
    repoSheet.getRange(targetRowIndex, 11).setValue("REJECTED");
    repoSheet.getRange(targetRowIndex, 12).setValue(reviewerNotes || "Ditolak oleh pengurus RT.");
    repoSheet.getRange(targetRowIndex, 13).setValue(reviewerName);
    repoSheet.getRange(targetRowIndex, 14).setValue(timestampNow);
    repoSheet.getRange(targetRowIndex, 18).setValue("");

    return {
      success: true,
      message: "Pengajuan perubahan berhasil ditolak.",
      data: { idPengajuan: idPengajuan, status: "REJECTED" },
      errorCode: null
    };
  }
}
