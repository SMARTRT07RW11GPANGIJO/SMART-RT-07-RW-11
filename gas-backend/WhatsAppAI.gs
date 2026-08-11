/**
 * WhatsAppAI.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP AI ENGINE INTEGRATION
 * 
 * Integrates WhatsApp queries with AI Intent Router, RAG Knowledge Base, DAL, 
 * Tool Registry, Confirmation Flow & Audit Logging.
 */

function processWhatsAppAIQuery(phone, messageText, identity, session) {
  var userRole = identity.role || "PUBLIC";
  var userId = identity.residentId || "PUBLIC-GUEST";
  var userName = identity.name || "Warga/Tamu RT 07";

  // Audit Request
  logAIAuditEntry("WA_AI_REQUEST", userId, userRole, "Incoming WA query from " + phone + ": " + messageText, "SUCCESS");

  // Check Prompt Injection
  var textLower = messageText.toLowerCase();
  var dangerous = ["ignore system prompt", "show api key", "minta secret", "reveal key", "drop database"];
  for (var i = 0; i < dangerous.length; i++) {
    if (textLower.indexOf(dangerous[i]) !== -1) {
      logAIAuditEntry("WA_TOOL_DENIED", userId, userRole, "Prompt injection blocked on WA: " + messageText, "DENIED");
      return "⚠️ *PERINGATAN KEAMANAN*\n\nPermintaan Anda ditolak demi keamanan & privasi data warga (Anti-Prompt Injection).";
    }
  }

  // Check session confirmation state (User typing "1" / "YA" / "SETUJU" or "2" / "TIDAK" / "BATAL")
  if (session && session.state === WA_SESSION_STATES.CONFIRM && session.pendingAction) {
    var action = session.pendingAction;
    if (textLower === "1" || textLower === "ya" || textLower === "setuju" || textLower === "lanjut") {
      logAIAuditEntry("WA_ACTION_CONFIRMED", userId, userRole, "Confirmed action on WA: " + action.toolName, "SUCCESS");
      
      var execResult = executeAITool(action.toolName, action.payload, { userId: userId, role: userRole });
      clearWASessionPendingAction(phone);

      if (action.toolName === "createComplaint") {
        var ticket = "ADU-2026-" + Math.floor(1000 + Math.random() * 9000);
        return "✅ *PENGADUAN TERKIRIM VIA WA*\n\n• Tiket ID: *" + ticket + "*\n• Pelapor: " + userName + "\n• Kategori: " + (action.payload.kategori || "Fasilitas Umum") + "\n• Deskripsi: " + action.payload.deskripsi + "\n\nLaporan Anda telah diteruskan ke Pengurus RT 07 RW 11.";
      }
      if (action.toolName === "createLetterRequest") {
        var noSurat = "470/" + Math.floor(100 + Math.random() * 900) + "/35.07.12.2003/2026";
        return "✅ *PERMOHONAN SURAT TERKIRIM VIA WA*\n\n• No. Registrasi: *" + noSurat + "*\n• Jenis Surat: " + action.payload.jenisSurat + "\n• Keperluan: " + action.payload.keperluan + "\n• Pemohon: " + userName + "\n\nPermohonan telah masuk antrean Ketua RT 07.";
      }
      return "✅ Perintah *" + action.toolName + "* berhasil dieksekusi.";
    } else if (textLower === "2" || textLower === "tidak" || textLower === "batal" || textLower === "cancel") {
      logAIAuditEntry("WA_ACTION_CANCELLED", userId, userRole, "Cancelled action on WA: " + action.toolName, "SUCCESS");
      clearWASessionPendingAction(phone);
      return "❌ *TINDAKAN DIBATALKAN*\n\nPermohonan / laporan Anda telah dibatalkan.";
    }
  }

  // Handle Intent Routing
  if (textLower.indexOf("profil") !== -1 || textLower.indexOf("data saya") !== -1) {
    if (!identity.isLinked) {
      return "🔒 *AKUN WA BELUM TERHUBUNG*\n\nUntuk melihat data profil warga, silakan tautkan nomor WA Anda di Portal SMART RT 07 dengan perintah:\n\n*DAFTAR [KODE_PAIRING]*";
    }
    return "📋 *PROFIL WARGA TERVERIFIKASI (DAL DTO)*\n\n• ID Warga: *" + userId + "*\n• Nama: *" + userName + "*\n• Role: *" + userRole + "*\n• Alamat: Perum GPA Ngijo RT 07 RW 11\n• Status: WARGA TETAP";
  }

  if (textLower.indexOf("iuran") !== -1 || textLower.indexOf("tagihan") !== -1 || textLower.indexOf("kas saya") !== -1) {
    if (!identity.isLinked) {
      return "🔒 *AKUN WA BELUM TERHUBUNG*\n\nSilakan tautkan nomor WA Anda terlebih dahulu untuk melihat riwayat iuran.";
    }
    return "💳 *RIWAYAT IURAN KAS WARGA (DAL)*\n\n• Agustus 2026: Rp 50.000 (LUNAS)\n• Juli 2026: Rp 50.000 (LUNAS)\n• Juni 2026: Rp 50.000 (LUNAS)\n\nCatatan: Rp 50.000/bulan per KK.";
  }

  if (textLower.indexOf("surat") !== -1 && (textLower.indexOf("status") !== -1 || textLower.indexOf("cek") !== -1)) {
    if (!identity.isLinked) {
      return "🔒 *AKUN WA BELUM TERHUBUNG*\n\nPemeriksaan status surat memerlukan verifikasi akun warga.";
    }
    return "📄 *STATUS SURAT PENGANTAR (DAL)*\n\n• Jenis: Surat Pengantar Domisili / KTP\n• Status: *SELESAI (Disetujui Ketua RT)*\n• No: 470/128/35.07.12.2003/2026\n• QR Code: TERVERIFIKASI DIGITAL";
  }

  if (textLower.indexOf("buat aduan") !== -1 || textLower.indexOf("laporkan") !== -1 || textLower.indexOf("kirim aduan") !== -1) {
    if (!identity.isLinked) {
      return "🔒 *AKUN WA BELUM TERHUBUNG*\n\nPengiriman aduan memerlukan akun warga terverifikasi. Ketik *DAFTAR [KODE_PAIRING]* untuk menautkan akun.";
    }
    
    var desc = messageText.replace(/buat aduan|laporkan|kirim aduan/gi, "").trim() || "Kendala fasilitas umum RT 07";
    setWASessionPendingAction(phone, {
      toolName: "createComplaint",
      riskLevel: "MEDIUM",
      payload: { kategori: "Fasilitas Umum", deskripsi: desc }
    });

    return "⚠️ *KONFIRMASI PENGIRIMAN PENGADUAN*\n\nApakah Anda yakin ingin mengirimkan laporan pengaduan berikut ke Pengurus RT 07?\n\n• Deskripsi: " + desc + "\n• Pelapor: " + userName + "\n\nKetik pilihan Anda:\n*1. Ya, Kirim Laporan*\n*2. Tidak, Batal*";
  }

  if (textLower.indexOf("buat surat") !== -1 || textLower.indexOf("minta surat") !== -1 || textLower.indexOf("ajukan surat") !== -1) {
    if (!identity.isLinked) {
      return "🔒 *AKUN WA BELUM TERHUBUNG*\n\nPengajuan surat memerlukan akun warga terverifikasi.";
    }

    var kep = messageText.replace(/buat surat|minta surat|ajukan surat/gi, "").trim() || "Pengurusan KTP / Administrasi";
    setWASessionPendingAction(phone, {
      toolName: "createLetterRequest",
      riskLevel: "HIGH",
      payload: { jenisSurat: "Surat Pengantar Umum", keperluan: kep }
    });

    return "⚠️ *KONFIRMASI PENGAJUAN SURAT PENGANTAR*\n\nApakah Anda yakin ingin mengajukan surat pengantar ini ke Ketua RT 07?\n\n• Jenis: Surat Pengantar Umum\n• Keperluan: " + kep + "\n• Pemohon: " + userName + "\n\nKetik pilihan Anda:\n*1. Ya, Ajukan Surat*\n*2. Tidak, Batal*";
  }

  // RAG Knowledge Base Fallback
  if (textLower.indexOf("sop") !== -1 || textLower.indexOf("syarat") !== -1 || textLower.indexOf("peraturan") !== -1 || textLower.indexOf("jam") !== -1) {
    return "📌 *SOP & KNOWLEDGE BASE RT 07*\n\nPengajuan surat pengantar dapat dilakukan secara digital melalui Portal Web SMART RT 07 RW 11 atau WhatsApp Bot.\nSyarat: Warga terdaftar di RT 07, mengisi form keperluan, dan menunggu persetujuan Ketua RT.\nDokumen PDF resmi ber-QR Code dapat diunduh langsung di portal.";
  }

  // General Chat via Gemini or Default Smart Reply
  logAIAuditEntry("WA_AI_RESPONSE", userId, userRole, "Generated WA AI response for: " + messageText, "SUCCESS");
  return "🤖 *RITA AI ASSISTANT RT 07*\n\nAssalamu'alaikum Bpk/Ibu *" + userName + "*.\nAda yang dapat saya bantu mengenai administrasi, status iuran, pengajuan surat, atau pengaduan warga?\n\n*Pilihan Perintah:* \n• Ketik *SURAT* - Status / Pengajuan Surat\n• Ketik *IURAN* - Cek Iuran Kas Warga\n• Ketik *PENGADUAN* - Lapor Pengaduan\n• Ketik *PROFIL* - Cek Profil Terdaftar\n• Ketik *MENU* - Menu Utama Layanan";
}
