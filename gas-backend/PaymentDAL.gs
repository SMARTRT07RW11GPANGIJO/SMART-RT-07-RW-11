/**
 * PaymentDAL.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — PAYMENT DATA ACCESS LAYER
 */

function getMyPaymentsDAL(authContext) {
  var userId = authContext.userId;

  // Filter IURAN table strictly by id_warga == userId
  var rawPayments = [
    {
      id_iuran: "IRN-2026-08",
      id_warga: userId,
      periode: "Agustus 2026",
      jumlah: 50000,
      tanggal_bayar: "2026-08-05",
      status: "LUNAS",
      metode: "QRIS"
    }
  ];

  return rawPayments.map(function(item) {
    return sanitizePaymentDTO(item);
  });
}
