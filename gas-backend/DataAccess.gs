/**
 * DataAccess.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8E — CENTRAL DATA ACCESS LAYER ROUTER
 * 
 * Central Router for AI Tool Data Requests.
 * Validates session, identity, authorization, ownership, data minimization, sanitization, and audit logging.
 */

function executeDataTool(toolName, authContext, params) {
  params = params || {};
  
  // 1. Authoritative Session & Identity Checks
  if (!authContext || !authContext.userId) {
    writeAuditLog({
      userId: "UNAUTHENTICATED",
      role: "PUBLIC",
      action: toolName,
      tool: toolName,
      decision: "DENIED",
      reason: "Missing authContext or userId"
    });
    return { success: false, code: "AUTH_REQUIRED", message: "Otensifikasi diperlukan" };
  }

  if (authContext.isExpired) {
    writeAuditLog({
      userId: authContext.userId,
      role: authContext.role,
      action: toolName,
      tool: toolName,
      decision: "DENIED",
      reason: "Session expired"
    });
    return { success: false, code: "SESSION_EXPIRED", message: "Sesi telah kadaluwarsa" };
  }

  if (authContext.isRevoked || authContext.isValid === false) {
    writeAuditLog({
      userId: authContext.userId,
      role: authContext.role,
      action: toolName,
      tool: toolName,
      decision: "DENIED",
      reason: "Invalid or revoked session"
    });
    return { success: false, code: "INVALID_SESSION", message: "Sesi tidak valid" };
  }

  if (authContext.status === "SUSPENDED" || authContext.status === "INACTIVE") {
    writeAuditLog({
      userId: authContext.userId,
      role: authContext.role,
      action: toolName,
      tool: toolName,
      decision: "DENIED",
      reason: "Account suspended or inactive"
    });
    return { success: false, code: "ACCOUNT_INACTIVE", message: "Akun tidak aktif" };
  }

  // Route to specific DAL handler
  try {
    var result = null;
    switch (toolName) {
      case "getMyProfile":
        result = getMyProfileDAL(authContext);
        break;
      case "getMyLetters":
        result = getMyLettersDAL(authContext);
        break;
      case "getMyPayments":
        result = getMyPaymentsDAL(authContext);
        break;
      case "getMyComplaints":
        result = getMyComplaintsDAL(authContext);
        break;
      case "getAssignedCases":
        result = getAssignedCasesDAL(authContext);
        break;
      case "getFinanceSummary":
        result = getFinanceSummaryDAL(authContext);
        break;
      case "getResidentStatistics":
        result = getResidentStatisticsDAL(authContext);
        break;
      case "getMyDocument":
        result = getMyDocumentDAL(authContext, params.documentId);
        break;
      default:
        writeAuditLog({
          userId: authContext.userId,
          role: authContext.role,
          action: toolName,
          tool: toolName,
          decision: "DENIED",
          reason: "Unknown or unauthorized data tool"
        });
        return { success: false, code: "TOOL_NOT_ALLOWED", message: "Tool tidak diizinkan" };
    }

    // Write audit log for successful access
    writeAuditLog({
      userId: authContext.userId,
      role: authContext.role,
      action: toolName,
      tool: toolName,
      resourceId: params.documentId || authContext.userId,
      decision: "ALLOWED",
      reason: "Successful DAL execution"
    });

    return { success: true, data: result };

  } catch (err) {
    var errCode = err.code || "PERMISSION_DENIED";
    var errMsg = err.message || "Akses data ditolak";

    writeAuditLog({
      userId: authContext.userId,
      role: authContext.role,
      action: toolName,
      tool: toolName,
      resourceId: params.documentId || authContext.userId,
      decision: "DENIED",
      reason: errCode + ": " + errMsg
    });

    return { success: false, code: errCode, message: errMsg };
  }
}
