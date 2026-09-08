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
