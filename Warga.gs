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

  // 4. Cari record Kepala Keluarga berdasarkan NO_KK (Strict, tanpa fallback)
  var headRecord = null;

  for (var i = 1; i < dataValues.length; i++) {
    var row = dataValues[i];
    var rowKk = String(row[idxKk] || '').replace(/\D/g, '');
    if (rowKk === cleanKk) {
      var hub = String(row[idxHub] || '').toUpperCase().trim();
      if (hub === "KEPALA_KELUARGA" || hub === "KEPALA KELUARGA") {
        headRecord = row;
        break;
      }
    }
  }

  var targetRecord = headRecord;
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

  // 6. Kredensial Cocok: Pastikan ID_WARGA otoritatif ada dari record
  var rawWargaId = idxId >= 0 ? String(targetRecord[idxId] || '').trim() : '';
  if (!rawWargaId) {
    return {
      success: false,
      message: "Nomor KK atau tanggal lahir tidak sesuai.",
      data: null,
      errorCode: "INVALID_CREDENTIALS"
    };
  }
  var wargaId = rawWargaId;
  var namaLengkap = String(targetRecord[idxNama] || 'Warga');
  var blok = idxBlok >= 0 ? String(targetRecord[idxBlok] || '') : '';
  var statusWargaVal = idxStatusWarga >= 0 ? String(targetRecord[idxStatusWarga] || 'TETAP') : 'TETAP';

  // CR-PRE/19-SEP-001: Terbitkan signed authorization token (HMAC-SHA256)
  var token = generateWargaAuthToken(wargaId);
  if (!token) {
    return {
      success: false,
      message: "Terjadi kesalahan saat otorisasi sesi. Silakan coba beberapa saat lagi.",
      data: null,
      errorCode: "AUTH_TOKEN_ISSUANCE_FAILED"
    };
  }

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
      statusWarga: statusWargaVal,
      token: token
    },
    errorCode: null
  };
}

/**
 * CR-PRE/19-SEP-001: Helper pembuatan token HMAC-SHA256
 * Membaca secret murni dari Script Properties: AUTH_SECRET_KEY.
 * Fail closed: Mengembalikan null jika AUTH_SECRET_KEY belum di-set.
 */
function generateWargaAuthToken(wargaId) {
  var secret = PropertiesService.getScriptProperties().getProperty("AUTH_SECRET_KEY");
  if (!secret) {
    Logger.log("WARN: AUTH_SECRET_KEY not set in ScriptProperties. Token issuance failed closed.");
    return null;
  }

  var now = Math.floor(new Date().getTime() / 1000);
  var exp = now + (7 * 24 * 60 * 60); // 7 hari TTL
  var jti = Utilities.getUuid();

  var payloadObj = {
    typ: "SMART_RT_WARGA",
    ver: 1,
    sub: String(wargaId),
    iat: now,
    exp: exp,
    jti: jti
  };

  var payloadJson = JSON.stringify(payloadObj);
  var payloadBase64 = Utilities.base64EncodeWebSafe(payloadJson);
  var signatureBytes = Utilities.computeHmacSha256Signature(payloadBase64, secret);
  var signatureBase64 = Utilities.base64EncodeWebSafe(signatureBytes);

  return payloadBase64 + "." + signatureBase64;
}

/**
 * CR-PRE/19-SEP-001: Helper verifikasi token HMAC-SHA256
 * Memvalidasi format, signature, dan expiry time.
 * Mengembalikan objek payload jika sah, atau null jika tidak sah.
 */
function verifyWargaAuthToken(tokenString) {
  if (!tokenString || typeof tokenString !== "string") {
    return null;
  }

  var parts = tokenString.split(".");
  if (parts.length !== 2) {
    return null;
  }

  var payloadBase64 = parts[0];
  var receivedSigBase64 = parts[1];

  var secret = PropertiesService.getScriptProperties().getProperty("AUTH_SECRET_KEY");
  if (!secret) {
    return null; // Fail closed
  }

  var expectedSigBytes = Utilities.computeHmacSha256Signature(payloadBase64, secret);
  var expectedSigBase64 = Utilities.base64EncodeWebSafe(expectedSigBytes);

  if (receivedSigBase64 !== expectedSigBase64) {
    return null; // Signature mismatch
  }

  try {
    var payloadJson = Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadBase64)).getDataAsString("UTF-8");
    var payload = JSON.parse(payloadJson);

    if (payload.typ !== "SMART_RT_WARGA") {
      return null;
    }

    if (payload.ver !== 1) {
      return null;
    }

    var now = Math.floor(new Date().getTime() / 1000);
    if (!payload.exp || now > payload.exp) {
      return null; // Expired
    }

    if (!payload.sub) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * CR-PRE/19-SEP-001: getMyProfile
 * Mengambil profil warga & anggota keluarga berdasarkan token terverifikasi.
 * Client TIDAK menentukan identitas otoritatif.
 */
function getMyProfile(payload) {
  var token = payload ? payload.token : null;
  var verifiedPayload = verifyWargaAuthToken(token);

  if (!verifiedPayload) {
    return {
      success: false,
      message: "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.",
      data: null,
      errorCode: "UNAUTHORIZED"
    };
  }

  var authoritativeWargaId = String(verifiedPayload.sub);

  // Akses Google Sheets WARGA
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    var sheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
                  PropertiesService.getScriptProperties().getProperty("DATABASE_ID");
    if (sheetId) {
      ss = SpreadsheetApp.openById(sheetId);
    }
  }

  if (!ss) {
    return {
      success: false,
      message: "Database spreadsheet tidak ditemukan.",
      data: null,
      errorCode: "SPREADSHEET_NOT_FOUND"
    };
  }

  var sheetWarga = ss.getSheetByName("WARGA");
  if (!sheetWarga) {
    return {
      success: false,
      message: "Sheet WARGA tidak ditemukan.",
      data: null,
      errorCode: "SHEET_NOT_FOUND"
    };
  }

  var dataValues = sheetWarga.getDataRange().getValues();
  if (dataValues.length <= 1) {
    return {
      success: false,
      message: "Data warga kosong.",
      data: null,
      errorCode: "EMPTY_DATA"
    };
  }

  // Petakan indeks kolom
  var headers = dataValues[0];
  var idxId = -1;
  var idxKk = -1;
  var idxNik = -1;
  var idxNama = -1;
  var idxBlok = -1;
  var idxStatusWarga = -1;
  var idxHub = -1;
  var idxHp = -1;
  var idxEmail = -1;
  var idxGender = -1;

  for (var h = 0; h < headers.length; h++) {
    var hName = String(headers[h] || '').toUpperCase().trim();
    if (hName === "ID_WARGA" || hName === "ID") idxId = h;
    else if (hName === "NO_KK" || hName === "NOMOR_KK" || hName === "NO KK") idxKk = h;
    else if (hName === "NIK") idxNik = h;
    else if (hName === "NAMA_LENGKAP" || hName === "NAMA") idxNama = h;
    else if (hName === "BLOK" || hName === "BLOK_RUMAH") idxBlok = h;
    else if (hName === "STATUS_WARGA") idxStatusWarga = h;
    else if (hName === "HUBUNGAN_KELUARGA" || hName === "HUBUNGAN") idxHub = h;
    else if (hName === "NO_HP" || hName === "TELEPON" || hName === "HP") idxHp = h;
    else if (hName === "EMAIL") idxEmail = h;
    else if (hName === "JENIS_KELAMIN") idxGender = h;
  }

  // Fallbacks jika header tidak standar
  if (idxId === -1) idxId = 0;
  if (idxKk === -1) idxKk = 1;
  if (idxNik === -1) idxNik = 2;
  if (idxNama === -1) idxNama = 3;
  if (idxBlok === -1) idxBlok = 15;
  if (idxHub === -1) idxHub = 22;

  // 1. Cari record warga berdasarkan ID_WARGA otoritatif dari token
  var authoritativeRecord = null;
  for (var r = 1; r < dataValues.length; r++) {
    var row = dataValues[r];
    if (String(row[idxId] || '').trim() === authoritativeWargaId) {
      authoritativeRecord = row;
      break;
    }
  }

  if (!authoritativeRecord) {
    return {
      success: false,
      message: "Data warga tidak ditemukan di SSoT.",
      data: null,
      errorCode: "WARGA_NOT_FOUND"
    };
  }

  // 2. Dapatkan NO_KK otoritatif dari record warga tersebut (bukan dari client)
  var authoritativeKk = String(authoritativeRecord[idxKk] || '').replace(/\D/g, '');

  // Helper fungsi masking data
  function maskIdentifier(val, showStart, showEnd) {
    if (!val) return "-";
    var str = String(val).trim();
    if (str.length <= (showStart + showEnd)) return str;
    var start = str.slice(0, showStart);
    var end = str.slice(-showEnd);
    return start + "******" + end;
  }

  function maskPhone(val) {
    if (!val) return "-";
    var str = String(val).trim();
    if (str.length <= 6) return str;
    return str.slice(0, 4) + "****" + str.slice(-4);
  }

  function maskEmail(val) {
    if (!val) return "-";
    var str = String(val).trim();
    var atIdx = str.indexOf("@");
    if (atIdx <= 1) return str;
    return str.charAt(0) + "******" + str.slice(atIdx);
  }

  // 3. Kumpulkan semua anggota keluarga dengan NO_KK yang sama
  var familyMembers = [];
  for (var f = 1; f < dataValues.length; f++) {
    var fRow = dataValues[f];
    var fRowKk = String(fRow[idxKk] || '').replace(/\D/g, '');
    if (fRowKk && fRowKk === authoritativeKk) {
      familyMembers.push({
        wargaId: String(fRow[idxId] || ''),
        name: String(fRow[idxNama] || 'Anggota'),
        relationship: idxHub >= 0 ? String(fRow[idxHub] || 'ANGGOTA') : 'ANGGOTA',
        gender: idxGender >= 0 ? String(fRow[idxGender] || 'LAKI_LAKI') : 'LAKI_LAKI',
        statusWarga: idxStatusWarga >= 0 ? String(fRow[idxStatusWarga] || 'TETAP') : 'TETAP'
      });
    }
  }

  // 4. Susun Profile DTO Minimal (Tanpa data sensitif seperti DOB utuh, password, dll)
  var profileDto = {
    idWarga: authoritativeWargaId,
    name: String(authoritativeRecord[idxNama] || 'Warga'),
    nik: idxNik >= 0 ? maskIdentifier(authoritativeRecord[idxNik], 6, 4) : "-",
    nomorKK: maskIdentifier(authoritativeKk, 6, 4),
    block: idxBlok >= 0 ? String(authoritativeRecord[idxBlok] || '-') : '-',
    statusWarga: idxStatusWarga >= 0 ? String(authoritativeRecord[idxStatusWarga] || 'TETAP') : 'TETAP',
    statusKeluarga: idxHub >= 0 ? String(authoritativeRecord[idxHub] || 'KEPALA_KELUARGA') : 'KEPALA_KELUARGA',
    phone: idxHp >= 0 ? maskPhone(authoritativeRecord[idxHp]) : "-",
    email: idxEmail >= 0 ? maskEmail(authoritativeRecord[idxEmail]) : "-",
    familyCount: familyMembers.length
  };

  return {
    success: true,
    message: "Profil warga berhasil dimuat dari SSoT.",
    data: {
      profile: profileDto,
      family: familyMembers
    },
    errorCode: null
  };
}
