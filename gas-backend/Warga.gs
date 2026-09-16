/**
 * Warga.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * Service Data Warga & Keluarga
 */

function sanitizeInput(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

function saveWarga(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty("SPREADSHEET_ID") || props.getProperty("DATABASE_ID");
    if (ssId) {
      ss = SpreadsheetApp.openById(ssId);
    }
  }

  var sheet = ss ? ss.getSheetByName("WARGA") : null;
  if (!sheet) {
    throw new Error("Sheet WARGA tidak ditemukan.");
  }

  var rowData = [
    sanitizeInput(data.ID_WARGA || ''),
    sanitizeInput(data.NIK || ''),
    sanitizeInput(data.NO_KK || ''),
    sanitizeInput(data.NAMA_LENGKAP || ''),
    sanitizeInput(data.NAMA_PANGGILAN || ''),
    sanitizeInput(data.JENIS_KELAMIN || ''),
    sanitizeInput(data.TEMPAT_LAHIR || ''),
    sanitizeInput(data.TANGGAL_LAHIR || ''),
    sanitizeInput(data.AGAMA || ''),
    sanitizeInput(data.STATUS_PERKAWINAN || ''),
    sanitizeInput(data.PENDIDIKAN || ''),
    sanitizeInput(data.PEKERJAAN || ''),
    "'" + sanitizeInput(data.NO_HP || ''),
    sanitizeInput(data.EMAIL || ''),
    sanitizeInput(data.ALAMAT || ''),
    sanitizeInput(data.BLOK || ''),
    sanitizeInput(data.STATUS_TINGGAL || ''),
    sanitizeInput(data.STATUS_WARGA || ''),
    sanitizeInput(data.TANGGAL_MASUK || ''),
    sanitizeInput(data.KETERANGAN || ''),
    // Kolom 21 - DATA CONTRACT v1.1
    sanitizeInput(data.NAMA_PEMILIK_RUMAH || ''),
    // Kolom 22 - DATA CONTRACT v1.1
    // Text qualifier untuk mempertahankan leading zero 08...
    "'" + sanitizeInput(data.TELEPON_PEMILIK_RUMAH || ''),
    // Kolom 23 - HUBUNGAN_KELUARGA
    sanitizeInput(data.HUBUNGAN_KELUARGA || '')
  ];

  sheet.appendRow(rowData);

  return {
    success: true,
    message: "Data warga berhasil disimpan."
  };
}

/**
 * Verifikasi Kredensial Warga (NO_KK + TANGGAL_LAHIR Kepala Keluarga)
 * Membaca sheet WARGA sebagai SSoT.
 * Fail closed, generic response on invalid credential.
 */
function verifyWargaCredentials(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  // 1. Sanitasi No KK (hanya digit, harus 16 digit)
  var rawKk = sanitizeInput(payload.noKK || payload.nomorKK || payload.no_kk || '');
  var cleanKk = rawKk.replace(/\D/g, '');
  if (cleanKk.length !== 16) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  // 2. Normalisasi tanggal lahir input ke format YYYY-MM-DD
  var rawDob = sanitizeInput(payload.tanggalLahir || payload.tanggal_lahir || '');
  if (!rawDob) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  function normalizeDateStr(dStr) {
    if (!dStr) return "";
    var s = String(dStr).trim();
    // YYYY-MM-DD
    var isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      var y = isoMatch[1];
      var m = ("0" + isoMatch[2]).slice(-2);
      var d = ("0" + isoMatch[3]).slice(-2);
      return y + "-" + m + "-" + d;
    }
    // DD-MM-YYYY
    var idMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (idMatch) {
      var d2 = ("0" + idMatch[1]).slice(-2);
      var m2 = ("0" + idMatch[2]).slice(-2);
      var y2 = idMatch[3];
      return y2 + "-" + m2 + "-" + d2;
    }
    // Jika format Date object / string JS
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      var yr = parsed.getFullYear();
      var mo = ("0" + (parsed.getMonth() + 1)).slice(-2);
      var dy = ("0" + parsed.getDate()).slice(-2);
      return yr + "-" + mo + "-" + dy;
    }
    return s;
  }

  var normInputDob = normalizeDateStr(rawDob);
  if (!normInputDob) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  // 3. Cari Spreadsheet & Sheet WARGA
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty("SPREADSHEET_ID") || props.getProperty("DATABASE_ID");
    if (ssId) {
      ss = SpreadsheetApp.openById(ssId);
    }
  }

  if (!ss) {
    return {
      success: false,
      message: "Spreadsheet database tidak ditemukan atau belum terhubung.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var sheet = ss.getSheetByName("WARGA");
  if (!sheet) {
    return {
      success: false,
      message: "Tab Sheet WARGA tidak ditemukan pada spreadsheet.",
      data: null,
      errorCode: "SHEET_NOT_FOUND"
    };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  var dataValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = dataValues[0];

  // Cari index kolom berbasis header
  var idxKk = -1;
  var idxDob = -1;
  var idxHub = -1;
  var idxId = -1;
  var idxNama = -1;
  var idxBlok = -1;
  var idxStatusWarga = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c]).toUpperCase().trim();
    if (h === "NO_KK" || h === "NO. KK" || h === "NOMORKK") idxKk = c;
    else if (h === "TANGGAL_LAHIR" || h === "TANGGAL LAHIR") idxDob = c;
    else if (h === "HUBUNGAN_KELUARGA" || h === "HUBUNGAN KELUARGA" || h === "STATUS_KELUARGA") idxHub = c;
    else if (h === "ID_WARGA" || h === "ID WARGA") idxId = c;
    else if (h === "NAMA_LENGKAP" || h === "NAMA LENGKAP") idxNama = c;
    else if (h === "BLOK" || h === "BLOK / NO") idxBlok = c;
    else if (h === "STATUS_WARGA" || h === "STATUS WARGA") idxStatusWarga = c;
  }

  // Fallback ke urutan kolom default jika header tidak bernama persis
  if (idxId === -1) idxId = 0;
  if (idxKk === -1) idxKk = 2;
  if (idxNama === -1) idxNama = 3;
  if (idxDob === -1) idxDob = 7;
  if (idxBlok === -1) idxBlok = 15;
  if (idxHub === -1) idxHub = 22;

  // 4. Cari record Kepala Keluarga berdasarkan NO_KK
  var headRecord = null;
  var fallbackRecord = null;

  for (var i = 1; i < dataValues.length; i++) {
    var row = dataValues[i];
    var rowKk = String(row[idxKk] || '').replace(/\D/g, '');
    if (rowKk === cleanKk) {
      if (!fallbackRecord) {
        fallbackRecord = row;
      }
      var hub = String(row[idxHub] || '').toUpperCase().trim();
      if (hub === "KEPALA_KELUARGA" || hub === "KEPALA KELUARGA") {
        headRecord = row;
        break;
      }
    }
  }

  // Gunakan headRecord, atau fallbackRecord jika tidak ada penanda eksplisit KEPALA_KELUARGA
  var targetRecord = headRecord || fallbackRecord;
  if (!targetRecord) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  // 5. Bandingkan tanggal lahir
  var rawRecordDob = targetRecord[idxDob];
  var normRecordDob = normalizeDateStr(rawRecordDob);

  if (!normRecordDob || normRecordDob !== normInputDob) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }

  // 6. Kredensial Cocok: Kembalikan data minimum tanpa informasi rahasia
  var wargaId = String(targetRecord[idxId] || ('WRG-' + cleanKk.slice(-4)));
  var namaLengkap = String(targetRecord[idxNama] || 'Warga');
  var blok = idxBlok >= 0 ? String(targetRecord[idxBlok] || '') : '';
  var statusWargaVal = idxStatusWarga >= 0 ? String(targetRecord[idxStatusWarga] || 'TETAP') : 'TETAP';

  return {
    success: true,
    message: "Kredensial warga valid.",
    data: {
      isValid: true,
      wargaId: wargaId,
      keluargaId: 'KK-' + cleanKk.slice(-4),
      displayName: namaLengkap,
      nomorKK: cleanKk,
      blok: blok,
      hubunganKeluarga: "KEPALA_KELUARGA",
      statusWarga: statusWargaVal
    },
    errorCode: null
  };
}
