/**
 * Warga.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * Service Data Warga & Keluarga
 */

function saveWarga(rowData) {
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

  // Minimal patch: Pastikan nilai NO_HP disimpan sebagai teks di Google Sheets
  // agar leading zero (e.g. 081234567890) tidak hilang akibat automatic type inference.
  if (Array.isArray(rowData)) {
    // Header sheet WARGA: no_hp berada di kolom ke-12 (indeks 11)
    if (rowData[11] !== undefined && rowData[11] !== null && rowData[11] !== "") {
      var hpVal = String(rowData[11]);
      if (hpVal.charAt(0) !== "'") {
        rowData[11] = "'" + hpVal;
      }
    }
  } else if (rowData && typeof rowData === "object") {
    if (rowData.NO_HP !== undefined && rowData.NO_HP !== null && rowData.NO_HP !== "") {
      var hpVal = String(rowData.NO_HP);
      if (hpVal.charAt(0) !== "'") {
        rowData.NO_HP = "'" + hpVal;
      }
    } else if (rowData.no_hp !== undefined && rowData.no_hp !== null && rowData.no_hp !== "") {
      var hpVal = String(rowData.no_hp);
      if (hpVal.charAt(0) !== "'") {
        rowData.no_hp = "'" + hpVal;
      }
    }
  }

  sheet.appendRow(rowData);

  return {
    success: true,
    message: "Data warga berhasil disimpan."
  };
}
