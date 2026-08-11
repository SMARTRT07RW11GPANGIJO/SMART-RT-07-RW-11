/**
 * WhatsAppRateLimit.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP RATE LIMIT & ANTI-SPAM
 * 
 * - Limits: 10 msg/min, 100 msg/hour per phone number
 * - Anti-Spam: Duplicate message window, cooldowns, blocklist
 */

var WA_RATE_LIMIT_STORE = {};
var WA_PROCESSED_MESSAGES = {};
var WA_BLOCKLIST = {};

function checkWARateLimit(phone) {
  var now = new Date().getTime();
  if (!WA_RATE_LIMIT_STORE[phone]) {
    WA_RATE_LIMIT_STORE[phone] = {
      minCount: 0,
      minReset: now + (60 * 1000),
      hourCount: 0,
      hourReset: now + (3600 * 1000)
    };
  }

  var record = WA_RATE_LIMIT_STORE[phone];

  // Reset 1 min window
  if (now > record.minReset) {
    record.minCount = 0;
    record.minReset = now + (60 * 1000);
  }

  // Reset 1 hour window
  if (now > record.hourReset) {
    record.hourCount = 0;
    record.hourReset = now + (3600 * 1000);
  }

  // Check limits
  if (record.minCount >= 10) {
    return {
      allowed: false,
      reason: "Batas frekuensi pesan melebihi 10 pesan/menit. Silakan tunggu sebentar.",
      retryAfterSeconds: Math.ceil((record.minReset - now) / 1000)
    };
  }

  if (record.hourCount >= 100) {
    return {
      allowed: false,
      reason: "Batas frekuensi pesan harian/jam (100 pesan/jam) tercapai. Silakan coba lagi nanti.",
      retryAfterSeconds: Math.ceil((record.hourReset - now) / 1000)
    };
  }

  record.minCount++;
  record.hourCount++;

  return { allowed: true };
}

/**
 * Idempotency & Duplicate Message Guard
 */
function isWAMessageDuplicate(messageId) {
  if (!messageId) return false;
  if (WA_PROCESSED_MESSAGES[messageId]) {
    return true;
  }
  WA_PROCESSED_MESSAGES[messageId] = new Date().getTime();
  return false;
}

/**
 * Anti-Spam & Blocklist Check
 */
function isWABlockedOrSpam(phone, message) {
  if (WA_BLOCKLIST[phone]) {
    return { blocked: true, reason: "Nomor WhatsApp Anda dalam daftar blokir sementara karena indikasi spam." };
  }
  return { blocked: false };
}
