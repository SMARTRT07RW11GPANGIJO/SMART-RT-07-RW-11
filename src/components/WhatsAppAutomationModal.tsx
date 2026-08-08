import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ShieldCheck, PhoneCall, Code, FileText, Bell } from 'lucide-react';
import { WAEvent, WAPayload, WhatsAppService, getWALogs, isValidPhoneNumber, formatPhoneInternational, WALogEntry } from '../services/whatsappService';

interface WhatsAppAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const WhatsAppAutomationModal: React.FC<WhatsAppAutomationModalProps> = ({
  isOpen,
  onClose,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'TESTER' | 'LOGS' | 'GAS_CODE' | 'SETUP'>('TESTER');
  
  // Tester State
  const [testEvent, setTestEvent] = useState<WAEvent>('SURAT_RECEIVED');
  const [testPhone, setTestPhone] = useState('081234567890');
  const [testName, setTestName] = useState('Ir. Budi Santoso');
  const [testIdRecord, setTestIdRecord] = useState('SRT-2026-0089');
  const [testJenis, setTestJenis] = useState('Surat Pengantar KTP');
  const [testDetails, setTestDetails] = useState('Perbaikan penerangan jalan umum Blok C-09');
  const [isSending, setIsSending] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<WALogEntry[]>(getWALogs());
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefreshLogs = () => {
    setLogs(getWALogs());
    addToast('info', 'Log Diperbarui', 'Daftar riwayat kirim WA berhasil diperbarui.');
  };

  const handleSendTest = async () => {
    if (!isValidPhoneNumber(testPhone)) {
      addToast('error', 'Nomor HP Tidak Valid', 'Format nomor WhatsApp harus diawali 08xx / 628xx (10-15 digit).');
      return;
    }

    setIsSending(true);
    addToast('loading', 'Mengirim WhatsApp via Abstraction Layer...', 'Melakukan retry backoff jika gagal.');

    const waService = new WhatsAppService('Fonnte Gateway (Production ScriptProperties)');
    
    const payload: WAPayload = {
      recipientPhone: testPhone,
      recipientName: testName,
      idRecord: testIdRecord,
      jenisLayanan: testJenis,
      details: testDetails,
      bulanTahun: 'Agustus 2026',
      nominal: '50.000'
    };

    const res = await waService.sendNotification(testEvent, testPhone, payload);
    setIsSending(false);
    setLogs(getWALogs());

    if (res.success) {
      addToast('success', 'WhatsApp Terkirim!', `Pesan notifikasi (${testEvent}) terkirim ke ${formatPhoneInternational(testPhone)}.`);
    } else {
      addToast('error', 'Gagal Mengirim WA', res.message);
    }
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const gasWaCode = `/**
 * WhatsAppService.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * Multi-Provider WhatsApp Gateway Abstraction Layer
 * Configuration loaded from PropertiesService (No Hardcoded Credentials)
 */

function getWAConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    API_TOKEN: props.getProperty("WA_API_TOKEN") || "FONNTE_TOKEN_PLACEHOLDER",
    ENDPOINT: props.getProperty("WA_ENDPOINT") || "https://api.fonnte.com/send",
    PROVIDER_NAME: props.getProperty("WA_PROVIDER_NAME") || "Fonnte Gateway",
    MAX_RETRIES: parseInt(props.getProperty("WA_MAX_RETRIES") || "3", 10)
  };
}

// 1. Phone Number Validator
function isValidIndonesianPhone(phone) {
  if (!phone) return false;
  var cleaned = String(phone).replace(/[^0-9]/g, "");
  return /^(08|628)\\d{8,12}$/.test(cleaned);
}

function formatPhoneInternational(phone) {
  var cleaned = String(phone).replace(/[^0-9]/g, "");
  if (cleaned.indexOf("0") === 0) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
}

// 2. Message Template Builder
function buildMessage(event, data) {
  var header = "Assalamu'alaikum warahmatullahi wabarakatuh.\\n\\n*RT 07 RW 11 Perum GPA Ngijo*\\nKarangploso, Kabupaten Malang\\n-----------------------------------------";
  var footer = "-----------------------------------------\\nSilakan cek melalui *Portal Warga SMART RT*:\\nhttps://smart-rt07-gpa-ngijo.app\\n\\n_Terima kasih._\\n*Bersama Melayani, Bersama Membangun.*";

  switch (event) {
    case "SURAT_RECEIVED":
      return header + "\\n\\n📨 *Pengajuan Surat Diterima*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Warga") + "*,\\nPengajuan surat Anda telah diterima di sistem.\\n\\n📌 *Nomor Pengajuan:* " + (data.id || "-") + "\\n📄 *Jenis Surat:* " + (data.jenis || "-") + "\\n⏳ *Status:* DIAJUKAN (Menunggu Verifikasi Sekretaris)\\n\\n" + footer;

    case "SURAT_VERIFIED":
      return header + "\\n\\n🔍 *Surat Berhasil Diverifikasi*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Warga") + "*,\\nBerkas permohonan surat Anda telah diverifikasi oleh Sekretaris RT.\\n\\n📌 *Nomor Surat:* " + (data.id || "-") + "\\n📄 *Jenis Surat:* " + (data.jenis || "-") + "\\n status: DIVERIFIKASI (Menunggu Tanda Tangan Ketua RT)\\n\\n" + footer;

    case "SURAT_APPROVED":
      return header + "\\n\\n✍️ *Surat Disetujui Ketua RT*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Warga") + "*,\\nPermohonan surat Anda telah disetujui dan ditandatangani secara digital.\\n\\n📌 *Nomor Surat:* " + (data.id || "-") + "\\n📄 *Jenis Surat:* " + (data.jenis || "-") + "\\n✅ *Status:* DISETUJUI / SELESAI\\n\\n" + footer;

    case "SURAT_COMPLETED":
      return header + "\\n\\n✅ *Surat Pengantar Ready / Selesai*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Warga") + "*,\\nDokumen Surat Pengantar Resmi Anda telah terbit dan siap diunduh (PDF + QR Code Hash).\\n\\n📌 *Nomor Surat:* " + (data.id || "-") + "\\n📄 *Jenis Surat:* " + (data.jenis || "-") + "\\n\\n" + footer;

    case "PENGADUAN_RECEIVED":
      return header + "\\n\\n🚨 *Laporan Pengaduan Diterima*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Pelapor") + "*,\\nLaporan pengaduan lingkungan Anda telah terdaftar.\\n\\n🎫 *Nomor Tiket:* " + (data.id || "-") + "\\n🏷️ *Kategori:* " + (data.jenis || "-") + "\\n📝 *Deskripsi:* " + (data.details || "-") + "\\n\\n" + footer;

    case "PENGADUAN_COMPLETED":
      return header + "\\n\\n🎉 *Laporan Pengaduan Selesai Ditangani*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Pelapor") + "*,\\nLaporan pengaduan tiket *" + (data.id || "-") + "* telah SELESAI ditindaklanjuti Pengurus RT.\\n\\n💬 *Catatan:* " + (data.details || "Sudah diselesaikan") + "\\n\\n" + footer;

    case "PENGUMUMAN_IMPORTANT":
      return header + "\\n\\n📢 *PENGUMUMAN PENTING RT 07*\\n\\nYth. Seluruh Warga RT 07 RW 11 GPA Ngijo,\\n\\n📌 *Judul:* " + (data.jenis || "Informasi") + "\\n\\n" + (data.details || "-") + "\\n\\n" + footer;

    case "IURAN_REMINDER":
      return header + "\\n\\n💳 *Pengingat Iuran Bulanan RT 07*\\n\\nYth. Bpk/Ibu *" + (data.nama || "Kepala Keluarga") + "*,\\nMengingatkan iuran bulanan kebersihan & keamanan RT 07.\\n\\n📅 *Periode:* " + (data.bulanTahun || "Bulan Ini") + "\\n💵 *Nominal:* Rp " + (data.nominal || "50.000") + "\\n\\n" + footer;

    default:
      return header + "\\n\\nNotifikasi SMART RT 07.\\n\\n" + footer;
  }
}

// 3. Core Send Function with Retry Mechanism
function sendWhatsApp(recipientPhone, message) {
  var config = getWAConfig();
  
  if (!isValidIndonesianPhone(recipientPhone)) {
    logMessage(recipientPhone, "INVALID_PHONE", message, "FAILED", 0, "Nomor HP tidak valid");
    return { success: false, error: "Nomor HP tidak valid" };
  }

  var formattedTarget = formatPhoneInternational(recipientPhone);
  var attempts = 0;
  var success = false;
  var lastError = "";

  var payload = {
    target: formattedTarget,
    message: message,
    countryCode: "62"
  };

  var options = {
    method: "post",
    headers: {
      "Authorization": config.API_TOKEN
    },
    payload: payload,
    muteHttpExceptions: true
  };

  while (attempts < config.MAX_RETRIES && !success) {
    attempts++;
    try {
      var response = UrlFetchApp.fetch(config.ENDPOINT, options);
      var code = response.getResponseCode();
      var responseText = response.getContentText();

      if (code === 200) {
        success = true;
        logMessage(formattedTarget, "WA_DISPATCH", message, "SUCCESS", attempts, "Response: " + responseText);
      } else {
        lastError = "HTTP " + code + ": " + responseText;
        logMessage(formattedTarget, "WA_DISPATCH", message, "RETRY", attempts, lastError);
        Utilities.sleep(1000 * attempts); // Retry backoff
      }
    } catch (e) {
      lastError = e.message;
      logMessage(formattedTarget, "WA_DISPATCH", message, "RETRY", attempts, lastError);
      Utilities.sleep(1000 * attempts);
    }
  }

  if (!success) {
    logMessage(formattedTarget, "WA_DISPATCH", message, "FAILED", attempts, lastError);
  }

  return { success: success, attempts: attempts, error: lastError };
}

// 4. Notification Abstraction Handler
function sendNotification(event, recipientPhone, data) {
  var message = buildMessage(event, data);
  return sendWhatsApp(recipientPhone, message);
}

// 5. Audit Logging for WA Messages
function logMessage(recipient, action, message, status, attempts, errorMsg) {
  try {
    var ss = SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
    var sheet = ss.getSheetByName("WA_LOGS") || ss.insertSheet("WA_LOGS");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["TIMESTAMP", "RECIPIENT", "ACTION", "STATUS", "ATTEMPTS", "ERROR_MSG", "MESSAGE_PREVIEW"]);
    }
    
    sheet.appendRow([
      Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss"),
      recipient,
      action,
      status,
      attempts,
      errorMsg || "-",
      message.substring(0, 100) + "..."
    ]);
  } catch(e) {
    Logger.log("WA Logging failed: " + e.message);
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A2338] text-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-[#123B5D] border-b border-[#2E7D52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C] shadow">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                WHATSAPP AUTOMATION SERVICE (TAHAP 4)
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400">
                  MULTI-PROVIDER
                </span>
              </h3>
              <p className="text-xs text-slate-300">Notifikasi Otomatis 8 Event Warga • Abstraction Layer & Retry Logic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#051320] text-xs">
          <button
            onClick={() => setActiveTab('TESTER')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'TESTER' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" /> Live Tester Notifikasi
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'LOGS' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Log Kirim WA ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('GAS_CODE')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'GAS_CODE' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> Kode Apps Script (WhatsAppService.gs)
          </button>

          <button
            onClick={() => setActiveTab('SETUP')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'SETUP' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Panduan & Config
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          
          {/* TAB 1: LIVE TESTER */}
          {activeTab === 'TESTER' && (
            <div className="space-y-5">
              <div className="bg-[#123B5D]/60 p-4 rounded-2xl border border-emerald-500/40 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Pengujian Live Notifikasi WhatsApp RT 07
                </span>
                <p className="text-[11px] text-slate-300">
                  Uji coba pengiriman 8 jenis event notifikasi secara real-time. Sistem menggunakan nomor validator, format template resmi, dan mekanisme retry otomatis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pilih Event Notifikasi *</label>
                  <select
                    value={testEvent}
                    onChange={(e) => setTestEvent(e.target.value as WAEvent)}
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white font-semibold focus:outline-none focus:border-[#D4A72C]"
                  >
                    <option value="SURAT_RECEIVED">1. Pengajuan Surat Diterima</option>
                    <option value="SURAT_VERIFIED">2. Surat Diverifikasi Sekretaris</option>
                    <option value="SURAT_APPROVED">3. Surat Disetujui Ketua RT</option>
                    <option value="SURAT_COMPLETED">4. Surat Selesai (Siap Unduh PDF)</option>
                    <option value="PENGADUAN_RECEIVED">5. Pengaduan Diterima</option>
                    <option value="PENGADUAN_COMPLETED">6. Pengaduan Selesai Ditangani</option>
                    <option value="PENGUMUMAN_IMPORTANT">7. Pengumuman Penting RT 07</option>
                    <option value="IURAN_REMINDER">8. Pengingat Iuran Bulanan Warga</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp Penerima *</label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 font-mono text-emerald-400 font-bold focus:outline-none focus:border-[#D4A72C]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 08xx / 628xx</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Warga / Pelapor</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white focus:outline-none focus:border-[#D4A72C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">ID Pengajuan / Nomor Tiket</label>
                  <input
                    type="text"
                    value={testIdRecord}
                    onChange={(e) => setTestIdRecord(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white font-mono focus:outline-none focus:border-[#D4A72C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jenis Surat / Kategori</label>
                  <input
                    type="text"
                    value={testJenis}
                    onChange={(e) => setTestJenis(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white focus:outline-none focus:border-[#D4A72C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Rincian / Catatan Tambahan</label>
                  <input
                    type="text"
                    value={testDetails}
                    onChange={(e) => setTestDetails(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white focus:outline-none focus:border-[#D4A72C]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSendTest}
                  disabled={isSending}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all text-xs"
                >
                  {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? 'Mengirim Notifikasi...' : 'Kirim Test WhatsApp Notifikasi'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOGS VIEW */}
          {activeTab === 'LOGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Riwayat Audit Kirim WA (Log Dispatch)</h4>
                <button
                  onClick={handleRefreshLogs}
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan Log
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="bg-[#051320] p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  Belum ada catatan pengiriman WhatsApp. Coba kirim pesan melalui tab Live Tester.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#123B5D] text-white font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Penerima</th>
                        <th className="p-3">Event</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Retry</th>
                        <th className="p-3">Provider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-[#051320]">
                      {logs.map((lg) => (
                        <tr key={lg.id} className="hover:bg-slate-800/50 text-slate-300">
                          <td className="p-3 font-mono text-[11px] text-slate-400">{lg.timestamp}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">{lg.recipientPhone}</td>
                          <td className="p-3 font-bold text-white">{lg.event}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lg.status === 'SUCCESS' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600' : 'bg-red-900/80 text-red-300 border border-red-600'
                            }`}>
                              {lg.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-center font-bold text-amber-300">{lg.attempts}x</td>
                          <td className="p-3 text-[11px] text-slate-400">{lg.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GAS CODE */}
          {activeTab === 'GAS_CODE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-[#D4A72C] font-bold">File: WhatsAppService.gs</span>
                <button
                  onClick={() => handleCopyCode('WhatsAppService.gs', gasWaCode)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  {copiedFile === 'WhatsAppService.gs' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedFile === 'WhatsAppService.gs' ? 'Berhasil Disalin!' : 'Salin Kode WhatsAppService.gs'}
                </button>
              </div>

              <pre className="bg-[#051320] p-4 rounded-2xl border border-slate-700 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
                {gasWaCode}
              </pre>
            </div>
          )}

          {/* TAB 4: SETUP & CONFIG */}
          {activeTab === 'SETUP' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-[#123B5D]/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
                  Petunjuk Konfigurasi Provider WA (Script Properties)
                </h4>
                <p>
                  1. Buka Google Apps Script Editor pada Google Sheets database RT 07.<br />
                  2. Buat file baru bernama <b>WhatsAppService.gs</b> dan tempelkan kode dari tab "Kode Apps Script".<br />
                  3. Buka <b>Project Settings</b> (ikon roda gigi di menu kiri) → Scroll ke <b>Script Properties</b>.<br />
                  4. Tambahkan properti rahasia tanpa hardcode:<br />
                  &nbsp;&nbsp;• <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">WA_API_TOKEN</code> = Token API dari Fonnte / Wablas / Nusagateway Anda.<br />
                  &nbsp;&nbsp;• <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">WA_ENDPOINT</code> = <code className="text-emerald-400">https://api.fonnte.com/send</code><br />
                  &nbsp;&nbsp;• <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">WA_MAX_RETRIES</code> = 3
                </p>
              </div>

              <div className="bg-[#051320] p-4 rounded-2xl border border-slate-800 space-y-1">
                <h5 className="font-bold text-emerald-400">Keunggulan Abstraction Layer:</h5>
                <p className="text-slate-400">
                  Provider WhatsApp gateway dapat diganti kapan saja (misal dari Fonnte ke Wablas atau Twilio) hanya dengan mengubah endpoint dan payload adapter di <code className="text-amber-300">WhatsAppService.gs</code> tanpa menyentuh logika utama aplikasi SMART RT.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> TAHAP 4 SELESAI — WHATSAPP AUTOMATION SIAP.
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
