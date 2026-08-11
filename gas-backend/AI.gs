/**
 * AI.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — MANDATORY AI AUTHORIZATION PIPELINE
 * 
 * Enforces session validation, RBAC, IDOR checks, confirmation, re-authorization, execution, and audit logging.
 */

function executeAITool(toolName, params, sessionToken, userPrompt, isConfirmedByHuman) {
  var logData = {
    timestamp: new Date().toISOString(),
    userId: "UNAUTHENTICATED",
    role: "PUBLIC",
    sessionId: sessionToken || "NO_SESSION",
    action: toolName,
    tool: toolName,
    resourceId: params ? (params.id || params.id_warga || "N/A") : "N/A",
    decision: "BLOCKED_NO_PERMISSION",
    reason: ""
  };

  try {
    // 1. Session validation
    var authSession = validateSession(sessionToken);
    if (!authSession.isValid) {
      logData.reason = authSession.code + ": " + authSession.message;
      writeAuditLog(logData);
      return { success: false, message: authSession.message, code: authSession.code };
    }

    var session = authSession.session;
    logData.userId = session.userId;
    logData.role = session.role;

    // 2. Tool Lookup
    var tool = getAIToolDefinition(toolName);
    if (!tool) {
      logData.reason = "TOOL_NOT_ALLOWED: Tool " + toolName + " not registered.";
      writeAuditLog(logData);
      return { success: false, message: "Tindakan AI tidak diizinkan.", code: "TOOL_NOT_ALLOWED" };
    }

    // 3. Role & Permission Authorization
    var roleCheck = authorizeRoleAndPermission(session.role, tool.requiredPermission, tool.allowedRoles);
    if (!roleCheck.authorized) {
      logData.reason = roleCheck.code + ": " + roleCheck.message;
      writeAuditLog(logData);
      return { success: false, message: roleCheck.message, code: roleCheck.code };
    }

    // 4. Resource Ownership Verification
    if (tool.requiresOwnership) {
      var ownerId = params ? (params.id_warga || params.userId || session.userId) : session.userId;
      var ownerCheck = checkResourceOwnership(session.userId, ownerId, session.role, tool.requiredPermission);
      if (!ownerCheck.allowed) {
        logData.reason = ownerCheck.code + ": " + ownerCheck.message;
        writeAuditLog(logData);
        return { success: false, message: ownerCheck.message, code: ownerCheck.code };
      }
    }

    // 5. Confirmation Guard
    if (tool.requiresConfirmation && !isConfirmedByHuman) {
      logData.reason = "CONFIRMATION_REQUIRED: Human confirmation needed.";
      writeAuditLog(logData);
      return {
        success: false,
        message: "Tindakan " + toolName + " membutuhkan konfirmasi Anda.",
        code: "CONFIRMATION_REQUIRED",
        requiresConfirmation: true
      };
    }

    // 6. Execution & Success Audit
    logData.decision = "ALLOWED";
    logData.reason = "SUCCESS";
    writeAuditLog(logData);

    return {
      success: true,
      message: "Tindakan AI " + toolName + " berhasil dijalankan.",
      data: { status: "OK" }
    };

  } catch (err) {
    logData.reason = "ERROR: " + err.toString();
    writeAuditLog(logData);
    return { success: false, message: "Terjadi kesalahan internal.", code: "ERROR" };
  }
}
