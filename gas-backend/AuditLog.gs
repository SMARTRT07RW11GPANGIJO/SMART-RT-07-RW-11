/**
 * AuditLog.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — AUDIT LOGGING SERVICE
 * 
 * Records every AI execution and security decision without leaking sensitive secrets.
 */

function writeAuditLog(entry) {
  try {
    var ss = SpreadsheetApp.openById(getConfig().DATABASE_ID);
    var sheet = ss.getSheetByName("AI_AUDIT_LOG");
    
    if (!sheet) {
      sheet = ss.insertSheet("AI_AUDIT_LOG");
      sheet.appendRow(["Timestamp", "UserId", "Role", "SessionId", "Action", "Tool", "ResourceId", "Decision", "Reason"]);
    }

    // Mask secrets if inadvertently passed
    var cleanReason = String(entry.reason || "").replace(/password=([^&]+)/gi, "password=***");

    sheet.appendRow([
      entry.timestamp || new Date().toISOString(),
      entry.userId || "UNAUTHENTICATED",
      entry.role || "PUBLIC",
      entry.sessionId || "N/A",
      entry.action || "N/A",
      entry.tool || "N/A",
      entry.resourceId || "N/A",
      entry.decision || "DENIED",
      cleanReason
    ]);
  } catch (err) {
    Logger.log("Audit log failed: " + err.toString());
  }
}
