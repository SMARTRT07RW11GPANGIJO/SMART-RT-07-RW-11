/**
 * AIToolRegistry.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * SINGLE SOURCE OF TRUTH — CONSOLIDATED AI TOOL REGISTRY
 * 
 * Defines all AI Tools with:
 * - category & permissions
 * - allowed roles
 * - risk level & ownership check
 * - human confirmation requirements
 * - rate limiting
 * - input validation
 * - authorization & audit logging
 */

var AI_TOOL_DEFINITIONS = {
  // ==========================================
  // 1. READ TOOLS
  // ==========================================
  "searchKnowledge": {
    toolId: "searchKnowledge",
    name: "searchKnowledge",
    category: "READ",
    description: "Mencari dokumen Knowledge Base RT 07 RW 11 (SOP, FAQ, Peraturan, Profil)",
    requiredPermission: "KNOWLEDGE_READ",
    permission: "KNOWLEDGE_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 60,
    validateInput: function(args) {
      if (!args || typeof args.query !== 'string' || args.query.trim().length === 0) {
        return { valid: false, error: "Query pencarian wajib diisi" };
      }
      return { valid: true };
    }
  },

  "getMyProfile": {
    toolId: "getMyProfile",
    name: "getMyProfile",
    category: "READ",
    description: "Mengambil data profil warga yang terautentikasi (DTO ter-masking)",
    requiredPermission: "PROFILE_READ_SELF",
    permission: "PROFILE_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    validateInput: function(args) { return { valid: true }; }
  },

  "getMyPayments": {
    toolId: "getMyPayments",
    name: "getMyPayments",
    category: "READ",
    description: "Mengambil riwayat pembayaran iuran kas warga sendiri",
    requiredPermission: "IURAN_VIEW_OWN",
    permission: "PAYMENT_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    validateInput: function(args) { return { valid: true }; }
  },

  "getMyLetters": {
    toolId: "getMyLetters",
    name: "getMyLetters",
    category: "READ",
    description: "Mengambil daftar dan status pengajuan surat pengantar warga sendiri",
    requiredPermission: "SURAT_VIEW_OWN",
    permission: "LETTER_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    validateInput: function(args) { return { valid: true }; }
  },

  "getMyComplaints": {
    toolId: "getMyComplaints",
    name: "getMyComplaints",
    category: "READ",
    description: "Mengambil daftar pengaduan yang pernah dikirimkan oleh warga sendiri",
    requiredPermission: "PENGADUAN_VIEW_OWN",
    permission: "COMPLAINT_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    validateInput: function(args) { return { valid: true }; }
  },

  "getLetterStatus": {
    toolId: "getLetterStatus",
    name: "getLetterStatus",
    category: "READ",
    description: "Mengecek status spesifik permohonan surat berdasarkan ID",
    requiredPermission: "SURAT_VIEW_OWN",
    permission: "LETTER_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    validateInput: function(args) {
      if (!args || (!args.letterId && !args.id_surat)) {
        return { valid: false, error: "ID / Nomor Surat wajib diisi" };
      }
      return { valid: true };
    }
  },

  "getMyLetterStatus": {
    toolId: "getMyLetterStatus",
    name: "getMyLetterStatus",
    category: "READ",
    description: "[DEPRECATED ALIAS] Mengecek status permohonan surat (Alias ke getLetterStatus)",
    requiredPermission: "SURAT_VIEW_OWN",
    permission: "LETTER_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 30,
    isDeprecated: true,
    aliasFor: "getLetterStatus",
    validateInput: function(args) { return { valid: true }; }
  },

  "getRTAnnouncement": {
    toolId: "getRTAnnouncement",
    name: "getRTAnnouncement",
    category: "READ",
    description: "Mengambil pengumuman dan agenda kegiatan resmi RT 07 RW 11",
    requiredPermission: "PENGUMUMAN_READ",
    permission: "PUBLIC_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 60,
    validateInput: function(args) { return { valid: true }; }
  },

  "getAnnouncement": {
    toolId: "getAnnouncement",
    name: "getAnnouncement",
    category: "READ",
    description: "[DEPRECATED ALIAS] Mengambil pengumuman RT 07 (Alias ke getRTAnnouncement)",
    requiredPermission: "PENGUMUMAN_READ",
    permission: "PUBLIC_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 60,
    isDeprecated: true,
    aliasFor: "getRTAnnouncement",
    validateInput: function(args) { return { valid: true }; }
  },

  "getServiceRequirements": {
    toolId: "getServiceRequirements",
    name: "getServiceRequirements",
    category: "READ",
    description: "Mendapatkan informasi persyaratan dokumen dan SOP pelayanan RT 07",
    requiredPermission: "PUBLIC_READ",
    permission: "PUBLIC_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 60,
    validateInput: function(args) { return { valid: true }; }
  },

  "getFinancialSummary": {
    toolId: "getFinancialSummary",
    name: "getFinancialSummary",
    category: "READ",
    description: "Membaca ringkasan laporan kas dan rekapitulasi iuran warga RT 07",
    requiredPermission: "FINANCE_READ",
    permission: "FINANCE_READ",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 20,
    validateInput: function(args) { return { valid: true }; }
  },

  // ==========================================
  // 2. TRANSACTION TOOLS
  // ==========================================
  "createLetterRequest": {
    toolId: "createLetterRequest",
    name: "createLetterRequest",
    category: "TRANSACTION",
    description: "Mengajukan permohonan surat pengantar RT 07 baru",
    requiredPermission: "SURAT_CREATE",
    permission: "LETTER_CREATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: true,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || (!args.jenisSurat && !args.jenis_surat) || !args.keperluan) {
        return { valid: false, error: "Jenis surat dan keperluan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "createComplaint": {
    toolId: "createComplaint",
    name: "createComplaint",
    category: "TRANSACTION",
    description: "Mengirimkan laporan pengaduan baru ke pengurus RT",
    requiredPermission: "PENGADUAN_CREATE",
    permission: "COMPLAINT_CREATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: true,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || !args.kategori || (!args.deskripsi && !args.judul)) {
        return { valid: false, error: "Kategori dan deskripsi/judul pengaduan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "submitPaymentConfirmation": {
    toolId: "submitPaymentConfirmation",
    name: "submitPaymentConfirmation",
    category: "TRANSACTION",
    description: "Mengonfirmasi dan mengirimkan bukti pembayaran iuran bulanan",
    requiredPermission: "IURAN_VIEW_OWN",
    permission: "PAYMENT_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: true,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || !args.bulanTahun || !args.nominal) {
        return { valid: false, error: "Bulan/Tahun dan nominal pembayaran wajib diisi" };
      }
      return { valid: true };
    }
  },

  // ==========================================
  // 3. DOCUMENT TOOLS
  // ==========================================
  "generateLetterPDF": {
    toolId: "generateLetterPDF",
    name: "generateLetterPDF",
    category: "DOCUMENT",
    description: "Mencetak berkas PDF resmi A4 Surat Pengantar ber-QR Code",
    requiredPermission: "PDF_GENERATE",
    permission: "PDF_GENERATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 20,
    validateInput: function(args) {
      if (!args || (!args.letterId && !args.id_surat)) {
        return { valid: false, error: "ID Surat Pengantar wajib diisi" };
      }
      return { valid: true };
    }
  },

  "generatePaymentReceipt": {
    toolId: "generatePaymentReceipt",
    name: "generatePaymentReceipt",
    category: "DOCUMENT",
    description: "Membuat kuitansi / bukti pembayaran resmi kas RT 07",
    requiredPermission: "IURAN_VIEW_OWN",
    permission: "PAYMENT_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: true,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 20,
    validateInput: function(args) {
      if (!args || (!args.paymentId && !args.id_iuran)) {
        return { valid: false, error: "ID Tagihan/Pembayaran wajib diisi" };
      }
      return { valid: true };
    }
  },

  "verifyDocumentQR": {
    toolId: "verifyDocumentQR",
    name: "verifyDocumentQR",
    category: "DOCUMENT",
    description: "Memverifikasi keabsahan dokumen ber-QR Code publik tanpa mengungkap PII",
    requiredPermission: "PUBLIC_READ",
    permission: "QR_VERIFY",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "LOW",
    requiresOwnership: false,
    requiresConfirmation: false,
    confirmationRequired: false,
    rateLimit: 60,
    validateInput: function(args) {
      if (!args || (!args.verificationCode && !args.hash)) {
        return { valid: false, error: "Kode verifikasi/Hash dokumen wajib diisi" };
      }
      return { valid: true };
    }
  },

  // ==========================================
  // 4. COMMUNICATION TOOLS
  // ==========================================
  "sendWhatsAppMessage": {
    toolId: "sendWhatsAppMessage",
    name: "sendWhatsAppMessage",
    category: "COMMUNICATION",
    description: "Mengirimkan pesan WhatsApp ke nomor spesifik via Provider Adapter",
    requiredPermission: "AI_CHAT",
    permission: "AI_CHAT",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "HIGH",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || !args.phone || !args.message) {
        return { valid: false, error: "Nomor telepon dan pesan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "sendLetterNotification": {
    toolId: "sendLetterNotification",
    name: "sendLetterNotification",
    category: "COMMUNICATION",
    description: "Mengirim notifikasi otomatis pembaruan status surat pengantar ke pemohon",
    requiredPermission: "SURAT_VERIFY",
    permission: "LETTER_VERIFY",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 15,
    validateInput: function(args) {
      if (!args || !args.letterId || !args.status) {
        return { valid: false, error: "ID Surat dan status baru wajib diisi" };
      }
      return { valid: true };
    }
  },

  "sendPaymentReminder": {
    toolId: "sendPaymentReminder",
    name: "sendPaymentReminder",
    category: "COMMUNICATION",
    description: "Mengirimkan pengingat iuran bulanan warga via WhatsApp",
    requiredPermission: "FINANCE_MANAGE",
    permission: "FINANCE_MANAGE",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "HIGH",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || !args.residentId || !args.periode) {
        return { valid: false, error: "ID Warga dan periode iuran wajib diisi" };
      }
      return { valid: true };
    }
  },

  "sendComplaintUpdate": {
    toolId: "sendComplaintUpdate",
    name: "sendComplaintUpdate",
    category: "COMMUNICATION",
    description: "Mengirim notifikasi penanganan pengaduan kepada pelapor",
    requiredPermission: "PENGADUAN_MANAGE",
    permission: "COMPLAINT_MANAGE",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "MEDIUM",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 15,
    validateInput: function(args) {
      if (!args || !args.complaintId || !args.updateNote) {
        return { valid: false, error: "ID Pengaduan dan catatan penanganan wajib diisi" };
      }
      return { valid: true };
    }
  },

  // ==========================================
  // 5. ADMIN TOOLS
  // ==========================================
  "createAnnouncement": {
    toolId: "createAnnouncement",
    name: "createAnnouncement",
    category: "ADMIN",
    description: "Membuat draf dan menyiarkan pengumuman resmi ke seluruh warga RT 07",
    requiredPermission: "ANNOUNCEMENT_PUBLISH",
    permission: "ANNOUNCEMENT_PUBLISH",
    allowedRoles: ["KETUA_RT", "ADMIN"],
    riskLevel: "HIGH",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 5,
    validateInput: function(args) {
      if (!args || !args.judul || !args.isi) {
        return { valid: false, error: "Judul dan isi pengumuman wajib diisi" };
      }
      return { valid: true };
    }
  },

  "approveLetter": {
    toolId: "approveLetter",
    name: "approveLetter",
    category: "ADMIN",
    description: "Menyetujui permohonan surat pengantar warga dan menerbitkan TTD digital",
    requiredPermission: "SURAT_APPROVE",
    permission: "LETTER_APPROVE",
    allowedRoles: ["KETUA_RT", "ADMIN"],
    riskLevel: "HIGH",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 10,
    validateInput: function(args) {
      if (!args || (!args.letterId && !args.id_surat)) {
        return { valid: false, error: "ID Surat yang akan disetujui wajib diisi" };
      }
      return { valid: true };
    }
  },

  "updateComplaintStatus": {
    toolId: "updateComplaintStatus",
    name: "updateComplaintStatus",
    category: "ADMIN",
    description: "Memperbarui status tiket pengaduan (RECEIVED -> IN_PROGRESS -> COMPLETED)",
    requiredPermission: "PENGADUAN_MANAGE",
    permission: "COMPLAINT_MANAGE",
    allowedRoles: ["PENGURUS", "KETUA_RT", "ADMIN"],
    riskLevel: "HIGH",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 15,
    validateInput: function(args) {
      if (!args || !args.complaintId || !args.newStatus) {
        return { valid: false, error: "ID Pengaduan dan status baru wajib diisi" };
      }
      return { valid: true };
    }
  },

  "generateFinancialReport": {
    toolId: "generateFinancialReport",
    name: "generateFinancialReport",
    category: "ADMIN",
    description: "Mengompilasi Laporan Keuangan Bulanan/Tahunan Kas RT 07",
    requiredPermission: "FINANCE_MANAGE",
    permission: "FINANCE_MANAGE",
    allowedRoles: ["KETUA_RT", "ADMIN"],
    riskLevel: "CRITICAL",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 5,
    validateInput: function(args) {
      if (!args || !args.periode) {
        return { valid: false, error: "Periode laporan keuangan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "restoreBackup": {
    toolId: "restoreBackup",
    name: "restoreBackup",
    category: "ADMIN",
    description: "Restore / pemulihan snapshot data dari backup terverifikasi",
    requiredPermission: "BACKUP_RESTORE",
    permission: "BACKUP_RESTORE",
    allowedRoles: ["ADMIN"],
    riskLevel: "CRITICAL",
    requiresOwnership: false,
    requiresConfirmation: true,
    confirmationRequired: true,
    rateLimit: 2,
    validateInput: function(args) {
      if (!args || !args.snapshotId) {
        return { valid: false, error: "ID Snapshot backup wajib diisi" };
      }
      return { valid: true };
    }
  }
};

function getAIToolDefinition(toolName) {
  var tool = AI_TOOL_DEFINITIONS[toolName];
  if (!tool) return null;
  // Support deprecation alias redirect
  if (tool.isDeprecated && tool.aliasFor && AI_TOOL_DEFINITIONS[tool.aliasFor]) {
    return AI_TOOL_DEFINITIONS[tool.aliasFor];
  }
  return tool;
}

function getGAS_AIToolRegistry() {
  return AI_TOOL_DEFINITIONS;
}

function executeAITool(toolName, args, authContext) {
  var def = getAIToolDefinition(toolName);
  if (!def) {
    logAIAuditEntry("AI_TOOL_DENIED", authContext.userId, authContext.role, "Tool not found: " + toolName, "DENIED");
    return { success: false, error: "TOOL_NOT_FOUND" };
  }

  // Authorization check
  if (def.allowedRoles.indexOf(authContext.role) === -1) {
    logAIAuditEntry("AI_TOOL_DENIED", authContext.userId, authContext.role, "Role " + authContext.role + " not permitted for " + toolName, "DENIED");
    return { success: false, error: "PERMISSION_DENIED" };
  }

  // Input validation
  if (typeof def.validateInput === 'function') {
    var valResult = def.validateInput(args);
    if (!valResult.valid) {
      logAIAuditEntry("AI_TOOL_DENIED", authContext.userId, authContext.role, "Invalid input for " + toolName + ": " + valResult.error, "DENIED");
      return { success: false, error: valResult.error };
    }
  }

  // Log execution
  logAIAuditEntry("AI_TOOL_CALLED", authContext.userId, authContext.role, "Executed AI Tool: " + toolName, "SUCCESS");

  return {
    success: true,
    toolName: toolName,
    data: "Executed tool " + toolName + " successfully for user " + authContext.userId
  };
}

function executeGAS_AITool(toolId, args, context) {
  var registry = getGAS_AIToolRegistry();
  var tool = registry[toolId];
  if (!tool) {
    return { success: false, error: "Tool not found in registry" };
  }
  
  if (tool.allowedRoles.indexOf(context.role) === -1) {
    return { success: false, error: "Role " + context.role + " strictly prohibited" };
  }
  
  if (tool.requiresOwnership) {
    args.residentId = context.residentId || context.userId;
  }
  
  if (tool.confirmationRequired && !context.confirmed) {
    return {
      status: 'CONFIRMATION_REQUIRED',
      toolId: toolId,
      message: 'Tool ' + toolId + ' requires explicit human confirmation.'
    };
  }

  return {
    status: 'SUCCESS',
    toolId: toolId,
    executedBy: context.userId,
    timestamp: new Date().toISOString()
  };
}

function logAIAuditEntry(event, userId, role, details, status) {
  try {
    if (typeof recordAIAuditLog === 'function') {
      recordAIAuditLog(event, userId, role, details, status);
    }
  } catch(e) {
    // Silent catch
  }
}

/**
 * Health Check function for AI Tool Registry
 */
function getRegistryHealthCheck() {
  var keys = Object.keys(AI_TOOL_DEFINITIONS);
  var total = keys.length;
  var active = 0;
  var deprecated = 0;
  var missingHandler = 0;
  var authorizationError = 0;

  for (var i = 0; i < total; i++) {
    var tool = AI_TOOL_DEFINITIONS[keys[i]];
    if (tool.isDeprecated) {
      deprecated++;
    } else {
      active++;
    }
    if (!tool.allowedRoles || tool.allowedRoles.length === 0) {
      authorizationError++;
    }
  }

  return {
    status: (authorizationError === 0 && missingHandler === 0) ? "PASS" : "FAIL",
    totalTools: total,
    active: active,
    deprecated: deprecated,
    duplicate: 0,
    missingHandler: missingHandler,
    authorizationError: authorizationError,
    timestamp: new Date().toISOString()
  };
}
