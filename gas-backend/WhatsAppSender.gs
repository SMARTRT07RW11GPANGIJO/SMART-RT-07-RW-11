/**
 * WhatsAppSender.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8H — WHATSAPP FORMATTED MESSAGE SENDER
 */

function formatWAMessage(content, headerText) {
  var header = headerText || "🤖 *SMART RT 07 RW 11 PERUM GPA NGIJO*";
  var footer = "\n\n_Ketik *MENU* untuk layanan RT atau *BATAL* untuk membatalkan._";
  return header + "\n\n" + content + footer;
}

function sendWAMessageFormatted(phone, content, headerText) {
  var formatted = formatWAMessage(content, headerText);
  return waProviderSendMessage(phone, formatted);
}

function sendWAErrorFormatted(phone, errorMessage) {
  var msg = "⚠️ *LAYANAN AI RT 07*\n\n" + (errorMessage || "Maaf, layanan AI sedang mengalami gangguan sementara.");
  return waProviderSendMessage(phone, msg);
}
