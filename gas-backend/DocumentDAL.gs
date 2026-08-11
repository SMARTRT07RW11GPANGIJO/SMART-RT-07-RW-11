/**
 * DocumentDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — DOCUMENT DATA ACCESS LAYER (GOOGLE DRIVE ISOLATION)
 * 
 * Prevents direct Drive access by AI.
 * Validates document ownership, permission, and status before returning metadata/DTO.
 */

function getMyDocumentDAL(authContext, documentId) {
  if (!documentId) {
    throw { code: "DATA_NOT_FOUND", message: "ID Dokumen tidak ditentukan" };
  }

  // Simulated query to DOKUMEN table
  var docDatabase = [
    {
      id_dokumen: "DOC-001",
      id_warga: authContext.userId,
      nama_dokumen: "KTP_Resmi.pdf",
      kategori: "IDENTITAS",
      tanggal_upload: "2026-07-20",
      status: "VERIFIED"
    },
    {
      id_dokumen: "DOC-002",
      id_warga: "WRG-999", // Other user's document
      nama_dokumen: "KK_Rahasia.pdf",
      kategori: "IDENTITAS",
      tanggal_upload: "2026-07-21",
      status: "VERIFIED"
    }
  ];

  var doc = null;
  for (var i = 0; i < docDatabase.length; i++) {
    if (docDatabase[i].id_dokumen === documentId) {
      doc = docDatabase[i];
      break;
    }
  }

  if (!doc) {
    throw { code: "DATA_NOT_FOUND", message: "Dokumen tidak ditemukan" };
  }

  // Ownership Check: WARGA can only access their own document unless PENGURUS/ADMIN
  if (doc.id_warga !== authContext.userId && ["PENGURUS", "KETUA_RT", "ADMIN"].indexOf(authContext.role) === -1) {
    throw { code: "OWNERSHIP_REQUIRED", message: "Akses dokumen ditolak: Bukan pemilik sah dokumen" };
  }

  return sanitizeDocumentDTO(doc);
}
