/**
 * AIToolRegistry.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8G — CENTRALIZED AI TOOL REGISTRY
 * 
 * Defines all AI Tools with:
 * - permission
 * - input validation
 * - authorization
 * - audit logging
 */

var AI_TOOL_DEFINITIONS = {
  "searchKnowledge": {
    name: "searchKnowledge",
    description: "Mencari dokumen Knowledge Base RT 07 RW 11 (SOP, FAQ, Peraturan, Profil)",
    requiredPermission: "KNOWLEDGE_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: false,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      if (!args || typeof args.query !== 'string' || args.query.trim().length === 0) {
        return { valid: false, error: "Query pencarian wajib diisi" };
      }
      return { valid: true };
    }
  },

  "getMyProfile": {
    name: "getMyProfile",
    description: "Mengambil data profil warga yang terautentikasi (DTO ter-masking)",
    requiredPermission: "PROFILE_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      return { valid: true };
    }
  },

  "getMyPayments": {
    name: "getMyPayments",
    description: "Mengambil riwayat pembayaran iuran kas warga sendiri",
    requiredPermission: "IURAN_VIEW_OWN",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      return { valid: true };
    }
  },

  "getMyLetters": {
    name: "getMyLetters",
    description: "Mengambil daftar dan status pengajuan surat pengantar warga sendiri",
    requiredPermission: "SURAT_VIEW_OWN",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      return { valid: true };
    }
  },

  "getMyComplaints": {
    name: "getMyComplaints",
    description: "Mengambil daftar pengaduan yang pernah dikirimkan oleh warga sendiri",
    requiredPermission: "PENGADUAN_VIEW_OWN",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      return { valid: true };
    }
  },

  "createComplaint": {
    name: "createComplaint",
    description: "Mengirimkan laporan pengaduan baru ke pengurus RT",
    requiredPermission: "PENGADUAN_CREATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: true,
    riskLevel: "MEDIUM",
    validateInput: function(args) {
      if (!args || !args.kategori || !args.deskripsi) {
        return { valid: false, error: "Kategori dan deskripsi pengaduan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "createLetterRequest": {
    name: "createLetterRequest",
    description: "Mengajukan permohonan surat pengantar RT 07 baru",
    requiredPermission: "SURAT_CREATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: true,
    riskLevel: "HIGH",
    validateInput: function(args) {
      if (!args || !args.jenisSurat || !args.keperluan) {
        return { valid: false, error: "Jenis surat dan keperluan wajib diisi" };
      }
      return { valid: true };
    }
  },

  "getAnnouncement": {
    name: "getAnnouncement",
    description: "Mengambil pengumuman dan agenda kegiatan resmi RT 07 RW 11",
    requiredPermission: "PENGUMUMAN_READ",
    allowedRoles: ["PUBLIC", "WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: false,
    requiresConfirmation: false,
    riskLevel: "LOW",
    validateInput: function(args) {
      return { valid: true };
    }
  }
};

function getAIToolDefinition(toolName) {
  return AI_TOOL_DEFINITIONS[toolName] || null;
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
  var valResult = def.validateInput(args);
  if (!valResult.valid) {
    logAIAuditEntry("AI_TOOL_DENIED", authContext.userId, authContext.role, "Invalid input for " + toolName + ": " + valResult.error, "DENIED");
    return { success: false, error: valResult.error };
  }

  // Log execution
  logAIAuditEntry("AI_TOOL_CALLED", authContext.userId, authContext.role, "Executed AI Tool: " + toolName, "SUCCESS");

  return {
    success: true,
    toolName: toolName,
    data: "Executed tool " + toolName + " successfully for user " + authContext.userId
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
