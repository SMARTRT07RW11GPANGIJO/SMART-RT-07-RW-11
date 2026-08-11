/**
 * WhatsAppRouter.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP COMMAND & AI ROUTER
 * 
 * Routes incoming WhatsApp messages:
 * - Commands: MENU, BANTUAN, STATUS, SURAT, IURAN, PENGADUAN, INFO, AI, DAFTAR
 * - Natural language queries via processWhatsAppAIQuery
 */

function routeWhatsAppMessage(phone, messageText, rawPayload) {
  var cleanPhone = phone.replace(/[^0-9]/g, "");
  var text = messageText ? messageText.trim() : "";
  var textUpper = text.toUpperCase();

  // 1. Identity & Session Retrieval
  var identity = getWAIdentityByPhone(cleanPhone);
  var session = getOrCreateWASession(cleanPhone, identity.residentId);

  // 2. Command Route Handling
  if (textUpper === "MENU" || textUpper === "BANTUAN") {
    return "🤖 *MENU UTAMA BOT SMART RT 07*\n\nSelamat datang di Bot Whatsapp Resmi RT 07 RW 11 Perum GPA Ngijo.\n\n*Perintah Utama:*\n• *SURAT* : Status & Pengajuan Surat\n• *IURAN* : Cek Pembayaran Iuran Kas Warga\n• *PENGADUAN* : Laporkan Pengaduan Lingkungan\n• *INFO* : Pengumuman & Agenda RT 07\n• *PROFIL* : Cek Profil & Tautan Akun\n• *DAFTAR [KODE]* : Tautkan Nomor WA dengan Akun Portal\n• *BATAL* : Membatalkan Sesi Konfirmasi\n\n_Atau ketik langsung pertanyaan Anda dengan bahasa bebas._";
  }

  if (textUpper === "BATAL" || textUpper === "CANCEL") {
    clearWASessionPendingAction(cleanPhone);
    return "❌ *SESI DIBATALKAN*\n\nSesi konfirmasi atau perintah aktif telah dibatalkan.";
  }

  if (textUpper.indexOf("DAFTAR") === 0) {
    var parts = text.split(" ");
    if (parts.length < 2) {
      return "⚠️ *KODE PAIRING DIPERLUKAN*\n\nFormat pendaftaran: *DAFTAR [KODE_PAIRING]*\nContoh: *DAFTAR RT07-482931*\n\nAmbil kode pairing Anda di menu Pengaturan Profil Portal SMART RT.";
    }
    var code = parts[1].trim();
    var pairResult = processWAPairing(cleanPhone, code);
    return pairResult.message;
  }

  if (textUpper === "STATUS") {
    return "📊 *STATUS SIKERJA SMART RT 07*\n\n• Nomor WA: " + cleanPhone + "\n• Akun Terhubung: " + (identity.isLinked ? "✅ YA (" + identity.name + " - " + identity.role + ")" : "❌ BELUM TERHUBUNG") + "\n• Sesi Aktif: " + session.sessionId + "\n• Server: ONLINE (Google Apps Script Gateway)";
  }

  if (textUpper === "INFO") {
    return "📢 *PENGUMUMAN RT 07 RW 11 GPA NGIJO*\n\n1. *Kerja Bakti Masal*: Minggu, 17 Agustus 2026 pukul 06.30 WIB.\n2. *Pos Ronda Night Guard*: Ditutup jam 23.00 WIB setiap malam.\n3. *Pembayaran Iuran*: Dapat dilakukan via QRIS RT di Portal Warga.";
  }

  // 3. Delegate to AI Engine with RAG, DAL, Tools & Confirmation
  return processWhatsAppAIQuery(cleanPhone, text, identity, session);
}
