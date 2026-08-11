/**
 * ResidentDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — RESIDENT DATA ACCESS LAYER
 */

function getMyProfileDAL(authContext) {
  // Authoritative identity check
  var userId = authContext.userId;
  
  // Simulated lookup from WARGA database sheet mapped to DTO
  // In real GAS environment: open sheet, find row by id_warga == userId
  var mockProfile = {
    id_warga: userId,
    nama_lengkap: "Warga GPA " + userId,
    blok: "A",
    nomor_rumah: "12",
    status_keluarga: "KEPALA_KELUARGA",
    status_warga: "TETAP",
    nik: "3507123456780001",
    no_kk: "3507123456780002",
    no_hp: "081234567890"
  };

  return sanitizeResidentDTO(mockProfile, true);
}

function getResidentStatisticsDAL(authContext) {
  // Authorization check: KETUA_RT, PENGURUS, or ADMIN only
  if (["KETUA_RT", "PENGURUS", "ADMIN"].indexOf(authContext.role) === -1) {
    throw { code: "PERMISSION_DENIED", message: "Hanya Pengurus/RT yang dapat melihat statistik warga" };
  }

  // Aggregated data minimization
  return {
    total_kk: 42,
    total_warga: 156,
    warga_tetap: 130,
    warga_kontrak: 26,
    lansia: 18,
    balita: 12
  };
}
