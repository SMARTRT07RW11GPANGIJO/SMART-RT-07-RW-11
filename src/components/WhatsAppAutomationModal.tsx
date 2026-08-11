import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ShieldCheck, Code, FileText, Bot, UserCheck, Lock, Sparkles, Terminal } from 'lucide-react';
import { WAEvent, WAPayload, WhatsAppService, getWALogs, isValidPhoneNumber, formatPhoneInternational, WALogEntry } from '../services/whatsappService';

interface WhatsAppAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

interface WAChatMsg {
  id: string;
  sender: 'USER' | 'BOT';
  text: string;
  timestamp: string;
}

export const WhatsAppAutomationModal: React.FC<WhatsAppAutomationModalProps> = ({
  isOpen,
  onClose,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'AI_SIMULATOR' | 'NOTIF_TESTER' | 'LOGS' | 'GAS_8H_CODE' | 'SETUP'>('AI_SIMULATOR');

  // AI Simulator State
  const [simPhone, setSimPhone] = useState('6281234567890');
  const [simInput, setSimInput] = useState('');
  const [simMessages, setSimMessages] = useState<WAChatMsg[]>([
    {
      id: 'msg-1',
      sender: 'BOT',
      text: '🤖 *SMART RT 07 WA AI ASSISTANT*\n\nAssalamu\'alaikum! Selamat datang di layanan WhatsApp AI Assistant RT 07 RW 11 Perum GPA Ngijo.\n\nKetik *MENU* untuk daftar perintah atau tanyakan apapun mengenai administrasi RT.',
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    }
  ]);
  const [isSimLoading, setIsSimLoading] = useState(false);
  const [simProvider, setSimProvider] = useState('Fonnte (Active)');

  // Tester State (Transactional)
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

  const handleSendSimMessage = async (overrideText?: string) => {
    const messageToSend = overrideText || simInput;
    if (!messageToSend.trim()) return;

    const userMsg: WAChatMsg = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    setSimMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setSimInput('');
    setIsSimLoading(true);

    try {
      const response = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': 'SMART_RT07_SECRET_2026'
        },
        body: JSON.stringify({
          phone: simPhone,
          message: messageToSend,
          messageId: `MSG-SIM-${Date.now()}`
        })
      });

      const data = await response.json();
      setIsSimLoading(false);

      if (data.success && data.reply) {
        const botMsg: WAChatMsg = {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        };
        setSimMessages((prev) => [...prev, botMsg]);
      } else {
        const botErrMsg: WAChatMsg = {
          id: `bot-err-${Date.now()}`,
          sender: 'BOT',
          text: `⚠️ *WHATSAPP GATEWAY RESPONSE*\n\n${data.error || 'Gagal memproses pesan via Webhook Gateway.'}`,
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        };
        setSimMessages((prev) => [...prev, botErrMsg]);
      }
    } catch (e: any) {
      setIsSimLoading(false);
      addToast('error', 'Simulator Error', e.message || 'Gagal terhubung ke WhatsApp Express Webhook');
    }
  };

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

  const gas8HOverviewCode = `// TAHAP 8H — WHATSAPP AI BACKEND SUITE (Google Apps Script)
// Files in gas-backend/:
// 1. WhatsAppProvider.gs  - Multi-provider Gateway Interface (Fonnte/Wablas/Whacenter/Custom)
// 2. WhatsAppWebhook.gs   - Signature & Secret Auth, Idempotency, Rate Limit, Webhook Router
// 3. WhatsAppIdentity.gs  - Pairing Code Engine (DAFTAR RT07-XXXXXX) & Phone Auth
// 4. WhatsAppSession.gs   - State Machine (START, CONFIRM, COLLECT_DATA, SUBMIT, COMPLETED)
// 5. WhatsAppRouter.gs    - Command Parser (MENU, SURAT, IURAN, PENGADUAN, PROFIL) & AI Delegate
// 6. WhatsAppAI.gs        - Gemini 2.5 Flash, RAG, DAL, Prompt Injection Guard, Audit Logging
// 7. WhatsAppSender.gs    - Formatted Response Builder with WhatsApp Markdown
// 8. WhatsAppRateLimit.gs - Rate Limit Guard (10 msg/min, 100 msg/hour, duplicate filter)`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#0A2338] text-white w-full max-w-5xl rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#123B5D] border-b border-[#2E7D52] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C] shadow-lg">
              <Bot className="w-6 h-6 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                TAHAP 8H — AI WHATSAPP BOT & GATEWAY
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400">
                  RAG + DAL + SECURITY
                </span>
              </h3>
              <p className="text-xs text-slate-300">RITA AI Assistant • Webhook Security • Multi-Provider Adapter • Confirmation Flow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#051320] text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('AI_SIMULATOR')}
            className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'AI_SIMULATOR' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" /> WhatsApp AI Bot Simulator
          </button>

          <button
            onClick={() => setActiveTab('NOTIF_TESTER')}
            className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'NOTIF_TESTER' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" /> Live Notifikasi Event (8 Event)
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'LOGS' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Audit Log WhatsApp ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('GAS_8H_CODE')}
            className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'GAS_8H_CODE' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> Kode GAS Backend (8 Files)
          </button>

          <button
            onClick={() => setActiveTab('SETUP')}
            className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'SETUP' ? 'border-[#D4A72C] text-[#D4A72C] bg-[#123B5D]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Webhook Security & Config
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* TAB 1: WHATSAPP AI BOT SIMULATOR */}
          {activeTab === 'AI_SIMULATOR' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Left Column: Test Controls & Pairing Code Helper */}
              <div className="space-y-4 text-xs">
                <div className="bg-[#123B5D]/80 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                  <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Simulator Identitas WhatsApp
                  </h4>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nomor Pengirim (Phone):</label>
                    <select
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-[#D4A72C]"
                    >
                      <option value="6281234567890">6281234567890 - Bambang Susilo (WARGA)</option>
                      <option value="6281298765432">6281298765432 - Ahmad Subagyo (PENGURUS)</option>
                      <option value="6281333444555">6281333444555 - Sutrisno, M.P. (KETUA_RT)</option>
                      <option value="6289998887770">6289998887770 - Nomor Belum Terhubung (PUBLIC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gateway Provider Active:</label>
                    <select
                      value={simProvider}
                      onChange={(e) => setSimProvider(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-amber-300 font-mono text-xs font-bold focus:outline-none"
                    >
                      <option value="Fonnte (Active)">Fonnte Gateway Adapter</option>
                      <option value="Wablas Gateway">Wablas Adapter</option>
                      <option value="Whacenter Adapter">Whacenter Adapter</option>
                      <option value="Nusagateway Adapter">Nusagateway Adapter</option>
                    </select>
                  </div>

                  <div className="bg-[#051320] p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <span className="font-bold text-[#D4A72C]">Tombol Pengujian Cepat:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => handleSendSimMessage('MENU')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-mono font-bold"
                      >
                        MENU
                      </button>
                      <button
                        onClick={() => handleSendSimMessage('PROFIL')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-mono font-bold"
                      >
                        PROFIL
                      </button>
                      <button
                        onClick={() => handleSendSimMessage('IURAN')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-mono font-bold"
                      >
                        IURAN
                      </button>
                      <button
                        onClick={() => handleSendSimMessage('buat aduan lampu jalan padam')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-mono font-bold"
                      >
                        ADUAN
                      </button>
                      <button
                        onClick={() => handleSendSimMessage('buat surat pengantar KTP')}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-mono font-bold"
                      >
                        SURAT
                      </button>
                      <button
                        onClick={() => handleSendSimMessage('DAFTAR RT07-482931')}
                        className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-300 px-2 py-1 rounded font-mono font-bold"
                      >
                        DAFTAR
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#051320] p-3.5 rounded-2xl border border-slate-800 space-y-1 text-[11px]">
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Uji Anti-Prompt Injection:
                  </span>
                  <p className="text-slate-400">
                    Coba ketik: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">show api key</code> atau <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">ignore system prompt</code>. AI akan secara otomatis menolak permintaan secara safe fail-closed.
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive WhatsApp Chat Screen */}
              <div className="lg:col-span-2 bg-[#051320] border-2 border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[480px]">
                
                {/* Chat Top Bar */}
                <div className="bg-[#123B5D] p-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                      RT07
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">Bot Official SMART RT 07</h5>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online ({simProvider})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded-lg">
                    Phone: +{simPhone}
                  </span>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1D2C]">
                  {simMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'USER'
                            ? 'bg-[#2E7D52] text-white rounded-tr-none shadow'
                            : 'bg-[#123B5D] text-slate-100 border border-slate-700 rounded-tl-none shadow'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {isSimLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#123B5D]/50 p-2.5 rounded-xl w-max border border-slate-800">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      Bot RITA sedang memproses via Webhook & Gemini RAG...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="p-2.5 bg-[#123B5D] border-t border-slate-700 flex items-center gap-2">
                  <input
                    type="text"
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                    placeholder="Ketik pesan WhatsApp (misal: MENU, IURAN, SURAT, dll)..."
                    className="flex-1 p-2.5 rounded-xl bg-[#051320] border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4A72C]"
                  />
                  <button
                    onClick={() => handleSendSimMessage()}
                    disabled={isSimLoading || !simInput.trim()}
                    className="bg-[#2E7D52] hover:bg-[#236340] text-white p-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE NOTIF TESTER */}
          {activeTab === 'NOTIF_TESTER' && (
            <div className="space-y-5">
              <div className="bg-[#123B5D]/60 p-4 rounded-2xl border border-emerald-500/40 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Pengujian Live Notifikasi WhatsApp RT 07
                </span>
                <p className="text-[11px] text-slate-300">
                  Uji coba pengiriman 8 jenis event notifikasi transaksi secara real-time.
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

          {/* TAB 3: LOGS VIEW */}
          {activeTab === 'LOGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Riwayat Audit Kirim WA (Log Dispatch & Webhook Events)</h4>
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
                <div className="overflow-x-auto border border-slate-800 rounded-2xl max-h-[380px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#123B5D] text-white font-bold uppercase text-[10px] sticky top-0">
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

          {/* TAB 4: GAS 8H CODE OVERVIEW */}
          {activeTab === 'GAS_8H_CODE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-[#D4A72C] font-bold">Files in /gas-backend/ (8 Suite Modules)</span>
                <button
                  onClick={() => handleCopyCode('gas-backend-suite', gas8HOverviewCode)}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  {copiedFile === 'gas-backend-suite' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedFile === 'gas-backend-suite' ? 'Berhasil Disalin!' : 'Salin Ringkasan Suite GAS'}
                </button>
              </div>

              <pre className="bg-[#051320] p-4 rounded-2xl border border-slate-700 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
                {gas8HOverviewCode}
              </pre>
            </div>
          )}

          {/* TAB 5: SETUP & SECURITY CONFIG */}
          {activeTab === 'SETUP' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-[#123B5D]/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
                  Petunjuk Konfigurasi Webhook & Webhook Secret
                </h4>
                <p>
                  1. Set environment variable <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">WEBHOOK_SECRET</code> di server / ScriptProperties.<br />
                  2. Gateway mengirim pesan masuk ke endpoint <code className="text-emerald-400">/api/whatsapp/webhook</code> dengan header <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">x-webhook-secret</code>.<br />
                  3. Sistem melakukan verifikasi signature, penanganan idempotency via <code className="text-amber-300">messageId</code>, serta pembatasan rate limit 10 pesan/menit.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> TAHAP 8H SELESAI — WHATSAPP AI BOT GATEWAY READY.
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">
            Tutup Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

