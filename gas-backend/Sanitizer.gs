/**
 * Sanitizer.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — DATA SANITIZATION & MASKING SERVICE
 * 
 * Ensures no raw data rows or unmasked sensitive fields (NIK, KK, Phone) are returned to AI.
 */

function maskNIK(nik) {
  if (!nik) return "";
  var s = String(nik).trim();
  if (s.length <= 6) return "******";
  return s.substring(0, 6) + "******" + s.substring(s.length - 4);
}

function maskKK(kk) {
  if (!kk) return "";
  var s = String(kk).trim();
  if (s.length <= 6) return "******";
  return s.substring(0, 6) + "******" + s.substring(s.length - 4);
}

function maskPhone(phone) {
  if (!phone) return "";
  var s = String(phone).trim();
  if (s.length <= 4) return "****";
  return s.substring(0, 4) + "****" + s.substring(s.length - 2);
}

function sanitizeResidentDTO(raw, isOwn) {
  if (!raw) return null;
  return {
    id_warga: raw.id_warga,
    nama_lengkap: raw.nama_lengkap,
    blok: raw.blok,
    nomor_rumah: raw.nomor_rumah,
    status_keluarga: raw.status_keluarga,
    status_warga: raw.status_warga,
    nik_masked: maskNIK(raw.nik),
    no_kk_masked: maskKK(raw.no_kk),
    no_hp_masked: maskPhone(raw.no_hp)
  };
}

function sanitizeLetterDTO(raw) {
  if (!raw) return null;
  return {
    id_surat: raw.id_surat,
    jenis_surat: raw.jenis_surat,
    id_warga: raw.id_warga,
    nama_pemohon: raw.nama_pemohon,
    tanggal_pengajuan: raw.tanggal_pengajuan,
    status: raw.status,
    keterangan: raw.keterangan || ""
  };
}

function sanitizePaymentDTO(raw) {
  if (!raw) return null;
  return {
    id_iuran: raw.id_iuran,
    id_warga: raw.id_warga,
    periode: raw.periode,
    jumlah: raw.jumlah,
    tanggal_bayar: raw.tanggal_bayar,
    status: raw.status,
    metode: raw.metode || "TRANSFER"
  };
}

function sanitizeComplaintDTO(raw) {
  if (!raw) return null;
  return {
    id_pengaduan: raw.id_pengaduan,
    id_warga: raw.id_warga,
    kategori: raw.kategori,
    judul: raw.judul,
    status: raw.status,
    tanggal: raw.tanggal,
    tanggapan: raw.tanggapan || ""
  };
}

function sanitizeFinanceDTO(raw) {
  if (!raw) return null;
  return {
    bulan_tahun: raw.bulan_tahun,
    total_pemasukan: raw.total_pemasukan,
    total_pengeluaran: raw.total_pengeluaran,
    saldo_akhir: raw.saldo_akhir,
    status_audit: raw.status_audit || "AUDITED"
  };
}

function sanitizeDocumentDTO(raw) {
  if (!raw) return null;
  return {
    id_dokumen: raw.id_dokumen,
    id_warga: raw.id_warga,
    nama_dokumen: raw.nama_dokumen,
    kategori: raw.kategori,
    tanggal_upload: raw.tanggal_upload,
    status: raw.status
  };
}
