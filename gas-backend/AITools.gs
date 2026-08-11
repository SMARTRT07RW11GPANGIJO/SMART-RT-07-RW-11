/**
 * AITools.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — CENTRALIZED AI TOOL REGISTRY
 * 
 * Tool definitions with required permissions, allowed roles, ownership, confirmation, and risk levels.
 */

var AI_TOOL_REGISTRY = {
  "getMyLetterStatus": {
    name: "getMyLetterStatus",
    requiredPermission: "LETTER_READ_SELF",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: false,
    riskLevel: "LOW"
  },
  "createLetterRequest": {
    name: "createLetterRequest",
    requiredPermission: "LETTER_CREATE",
    allowedRoles: ["WARGA", "PENGURUS", "KETUA_RT", "ADMIN"],
    requiresOwnership: true,
    requiresConfirmation: true,
    riskLevel: "MEDIUM"
  },
  "approveLetter": {
    name: "approveLetter",
    requiredPermission: "LETTER_APPROVE",
    allowedRoles: ["KETUA_RT", "ADMIN"],
    requiresOwnership: false,
    requiresConfirmation: true,
    riskLevel: "HIGH"
  },
  "restoreBackup": {
    name: "restoreBackup",
    requiredPermission: "BACKUP_RESTORE",
    allowedRoles: ["ADMIN"],
    requiresOwnership: false,
    requiresConfirmation: true,
    riskLevel: "CRITICAL"
  }
};

function getAIToolDefinition(toolName) {
  return AI_TOOL_REGISTRY[toolName] || null;
}
