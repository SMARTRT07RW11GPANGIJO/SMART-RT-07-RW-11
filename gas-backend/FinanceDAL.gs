/**
 * FinanceDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — FINANCE DATA ACCESS LAYER
 */

function getFinanceSummaryDAL(authContext) {
  // Authorization check: KETUA_RT, PENGURUS, ADMIN
  if (["KETUA_RT", "PENGURUS", "ADMIN"].indexOf(authContext.role) === -1) {
    throw { code: "PERMISSION_DENIED", message: "Akses ringkasan keuangan hanya untuk Pengurus RT" };
  }

  var rawFinance = {
    bulan_tahun: "Agustus 2026",
    total_pemasukan: 12500000,
    total_pengeluaran: 4200000,
    saldo_akhir: 8300000,
    status_audit: "AUDITED_OK"
  };

  return sanitizeFinanceDTO(rawFinance);
}
