/**
 * WhatsAppWebhook.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — SECURE WHATSAPP WEBHOOK HANDLER
 * 
 * Entry point for incoming WhatsApp Webhook HTTP POST requests.
 * Performs:
 * - Signature & Secret Verification
 * - Message Idempotency Check
 * - Rate Limiting & Anti-Spam Check
 * - Identity Lookup & Routing
 * - Outbound Response via Provider
 * - Audit Logging
 */

function handleWhatsAppWebhook(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "MISSING_POST_DATA" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var bodyText = e.postData.contents;
    var reqData = JSON.parse(bodyText);

    // 1. Webhook Signature Validation
    var headers = e.parameter || {};
    var isValidSecret = waProviderValidateWebhook(headers, reqData, e.parameter.secret);
    if (!isValidSecret) {
      logAIAuditEntry("WA_AUTH_FAILED", "UNAUTHORIZED", "PUBLIC", "Webhook signature or secret invalid", "DENIED");
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "INVALID_WEBHOOK_SECRET" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Parse Incoming Gateway Format
    var msgObj = waProviderParseIncomingMessage(reqData);
    if (!msgObj || !msgObj.phone || !msgObj.message) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, status: "IGNORED_EMPTY" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Idempotency Check (Duplicate message protection)
    if (isWAMessageDuplicate(msgObj.messageId)) {
      logAIAuditEntry("WA_MESSAGE_DUPLICATE", msgObj.phone, "GUEST", "Duplicate message ID ignored: " + msgObj.messageId, "WARNING");
      return ContentService.createTextOutput(JSON.stringify({ success: true, status: "DUPLICATE_IGNORED" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    logAIAuditEntry("WA_MESSAGE_RECEIVED", msgObj.phone, "GUEST", "Received WA message: " + msgObj.message.substring(0, 50), "SUCCESS");

    // 4. Rate Limiting Check
    var rl = checkWARateLimit(msgObj.phone);
    if (!rl.allowed) {
      logAIAuditEntry("WA_RATE_LIMITED", msgObj.phone, "GUEST", "Rate limit exceeded: " + rl.reason, "DENIED");
      waProviderSendMessage(msgObj.phone, "⚠️ *LIMIT PESAN TERLAMPUI*\n\n" + rl.reason);
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "RATE_LIMITED" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. Anti-Spam Check
    var spam = isWABlockedOrSpam(msgObj.phone, msgObj.message);
    if (spam.blocked) {
      logAIAuditEntry("WA_MESSAGE_FAILED", msgObj.phone, "GUEST", "Blocked user attempted message: " + spam.reason, "DENIED");
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "BLOCKED" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 6. Route Message
    var replyText = routeWhatsAppMessage(msgObj.phone, msgObj.message, reqData);

    // 7. Send Response Back via Gateway Provider
    var sendRes = waProviderSendMessage(msgObj.phone, replyText);

    if (sendRes.success) {
      logAIAuditEntry("WA_MESSAGE_SENT", msgObj.phone, "GUEST", "Sent WA AI reply successfully", "SUCCESS");
    } else {
      logAIAuditEntry("WA_MESSAGE_FAILED", msgObj.phone, "GUEST", "Failed to send WA reply via gateway: " + (sendRes.error || ""), "ERROR");
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      phone: msgObj.phone,
      replySent: sendRes.success
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    logAIAuditEntry("WA_MESSAGE_FAILED", "SYSTEM", "SYSTEM", "Webhook error: " + err.toString(), "ERROR");
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "INTERNAL_WEBHOOK_ERROR",
      details: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
