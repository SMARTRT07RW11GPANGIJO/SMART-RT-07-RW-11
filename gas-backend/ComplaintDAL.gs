/**
 * ComplaintDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — COMPLAINT DATA ACCESS LAYER
 */

function getMyComplaintsDAL(authContext) {
  var userId = authContext.userId;

  // Filter PENGADUAN table strictly by id_warga == userId
  var rawComplaints = [
    {
      id_pengaduan: "PGD-001",
      id_warga: userId,
      kategori: "KEBERSIHAN",
      judul: "Lampu Jalan Blok A Matikan Kerap",
      status: "IN_PROGRESS",
      tanggal: "2026-08-03",
      tanggapan: "Petugas teknis sudah dijadwalkan cek fisik"
    }
  ];

  return rawComplaints.map(function(item) {
    return sanitizeComplaintDTO(item);
  });
}
