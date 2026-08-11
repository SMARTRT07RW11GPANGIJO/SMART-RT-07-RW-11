/**
 * LetterDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — LETTER DATA ACCESS LAYER
 */

function getMyLettersDAL(authContext) {
  var userId = authContext.userId;

  // Query SURAT table filtered by id_warga == userId (IDOR Prevention)
  var rawLetters = [
    {
      id_surat: "SRT-001",
      jenis_surat: "Surat Pengantar KTP",
      id_warga: userId,
      nama_pemohon: "Warga " + userId,
      tanggal_pengajuan: "2026-08-01",
      status: "APPROVED",
      keterangan: "Selesai ditandatangani Ketua RT"
    }
  ];

  return rawLetters.map(function(item) {
    return sanitizeLetterDTO(item);
  });
}

function getAssignedCasesDAL(authContext) {
  // Authorization check: PENGURUS, KETUA_RT, ADMIN
  if (["PENGURUS", "KETUA_RT", "ADMIN"].indexOf(authContext.role) === -1) {
    throw { code: "PERMISSION_DENIED", message: "Hanya Pengurus/RT yang berhak mengakses berkas tugas" };
  }

  var rawCases = [
    {
      id_surat: "SRT-002",
      jenis_surat: "Surat Keterangan Domisili",
      id_warga: "WRG-002",
      nama_pemohon: "Ahmad Resident",
      tanggal_pengajuan: "2026-08-08",
      status: "PENDING_APPROVAL",
      keterangan: "Menunggu verifikasi lapangan"
    }
  ];

  return rawCases.map(function(item) {
    return sanitizeLetterDTO(item);
  });
}
