import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Smartphone,
  Bot,
  CheckCheck,
  RefreshCw,
  Play,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Lock,
  Layers,
  Activity,
  Award
} from 'lucide-react';
import {
  SIMULATED_RESIDENTS,
  SimulatedResident,
  ExecutionTrace,
  processWhatsAppSimulation,
  runAutomatedTestCases,
  TestCaseScenario
} from '../services/whatsappSimulatorService';

interface ChatMsg {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  trace?: ExecutionTrace;
}

export const WhatsAppBotSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INTERACTIVE' | 'TEST_SUITE'>('INTERACTIVE');

  // Interactive Simulator State
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('WARGA');
  const [currentResident, setCurrentResident] = useState<SimulatedResident>(SIMULATED_RESIDENTS.WARGA);
  const [customPhone, setCustomPhone] = useState(SIMULATED_RESIDENTS.WARGA.phone);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: "Wa'alaikumussalam... 🤖 *SMART RT 07 WA BOT SIMULATOR*\n\nSelamat datang di Layanan Interactive Simulator WhatsApp RT 07 RW 11 Perum GPA Ngijo.\n\nKetik *MENU* untuk daftar perintah atau pilih simulasi pengguna di atas.",
      time: new Date().toLocaleTimeString().slice(0, 5)
    }
  ]);

  const [latestTrace, setLatestTrace] = useState<ExecutionTrace | null>(null);

  // Test Suite State
  const [testResults, setTestResults] = useState<
    Array<TestCaseScenario & { actualResult: any; testPassed: boolean }>
  >([]);
  const [testSummary, setTestSummary] = useState<{ total: number; passed: number; failed: number; rate: number } | null>(
    null
  );
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Sync resident when preset changes
  useEffect(() => {
    const resident = SIMULATED_RESIDENTS[selectedPresetKey] || SIMULATED_RESIDENTS.WARGA;
    setCurrentResident(resident);
    setCustomPhone(resident.phone);
  }, [selectedPresetKey]);

  const getTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (isProcessing) return;

    const userMsg: ChatMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: msgText,
      time: getTimeStr()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsProcessing(true);

    // Process simulation
    const residentPayload: SimulatedResident = {
      ...currentResident,
      phone: customPhone
    };

    const simResult = await processWhatsAppSimulation(customPhone, msgText, residentPayload);

    setIsProcessing(false);
    setLatestTrace(simResult.trace);

    const botMsg: ChatMsg = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: simResult.reply,
      time: getTimeStr(),
      trace: simResult.trace
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    const suiteResult = await runAutomatedTestCases();
    setTestResults(suiteResult.scenarios);
    setTestSummary(suiteResult.summary);
    setIsRunningTests(false);
  };

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white w-full max-w-4xl mx-auto my-3">
      {/* Simulation Indicator Top Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#0B253C] to-[#2E7D52] p-4 border-b border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] p-2 flex items-center justify-center border border-[#D4A72C] shadow-md">
            <Bot className="w-6 h-6 text-[#D4A72C] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm md:text-base text-white">SMART RT 07 WhatsApp Bot Simulator</h3>
              <span className="bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/50 flex items-center gap-1">
                🧪 SIMULATION MODE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pengujian End-to-End Bot WhatsApp tanpa Pengiriman Pesan Nyata • Mock Provider Trapped
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('INTERACTIVE')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'INTERACTIVE' ? 'bg-[#2E7D52] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Interactive Chat
          </button>
          <button
            onClick={() => setActiveTab('TEST_SUITE')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'TEST_SUITE' ? 'bg-[#2E7D52] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300" /> Automated Test Suite (16 TC)
          </button>
        </div>
      </div>

      {activeTab === 'INTERACTIVE' && (
        <div className="p-4 md:p-5 space-y-4">
          {/* Simulated Identity Selector Box */}
          <div className="bg-[#051320] p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Preset Simulasi Warga
              </label>
              <select
                value={selectedPresetKey}
                onChange={(e) => setSelectedPresetKey(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-[#2E7D52]"
              >
                <option value="WARGA">1. Warga Terdaftar (Bambang Susilo)</option>
                <option value="PENGURUS">2. Pengurus Sekr (Ahmad Subagyo)</option>
                <option value="KETUA_RT">3. Ketua RT 07 (Eko Sucahyono)</option>
                <option value="BENDAHARA">4. Bendahara (Ibu Hj. Anisa)</option>
                <option value="ADMIN">5. Admin Sistem (Admin RT)</option>
                <option value="UNKNOWN">6. Nomor Tidak Terdaftar (Tamu)</option>
                <option value="INACTIVE">7. Warga Non-Aktif (Joko Widodo)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp & Role</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-2/3 p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-xs focus:outline-none"
                />
                <span className="w-1/3 bg-[#123B5D] px-2 py-2 rounded-xl border border-slate-700 text-amber-300 font-bold text-[11px] text-center flex items-center justify-center">
                  {currentResident.role}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Nama & Rumah:</span>
                <span className="font-bold text-white truncate max-w-[150px]">{currentResident.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-slate-400">Status Warga:</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentResident.status === 'ACTIVE'
                      ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                      : currentResident.status === 'INACTIVE'
                      ? 'bg-red-900/80 text-red-300 border border-red-600'
                      : 'bg-amber-900/80 text-amber-300 border border-amber-600'
                  }`}
                >
                  {currentResident.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Scenario Command Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-[#051320] p-2.5 rounded-2xl border border-slate-800 text-[10px]">
            <span className="font-bold text-slate-400 py-1 px-1">Quick Test:</span>
            {[
              'MENU',
              'PROFIL',
              'SURAT',
              'IURAN',
              'KEUANGAN',
              'PENGADUAN',
              'DANA KEMATIAN',
              'AGUSTUSAN',
              'TATA TERTIB',
              'STATUS',
              'DAFTAR RT07-991100'
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSendMessage(cmd)}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition-all hover:border-emerald-500"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Main Grid: Interactive Chat + Execution Trace */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Chat Window (3 cols) */}
            <div className="lg:col-span-3 bg-[#0b141a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[380px]">
              {/* Chat Top Status */}
              <div className="bg-[#123B5D] p-2.5 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2E7D52] flex items-center justify-center font-bold text-white text-xs">
                    RT07
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Bot Official SMART RT 07</h5>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> MockWhatsAppProvider
                      (Simulation)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'msg-reset',
                        sender: 'bot',
                        text: "Wa'alaikumussalam... Ketik MENU untuk melihat daftar layanan.",
                        time: getTimeStr()
                      }
                    ])
                  }
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                  title="Reset Sesi Chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 font-sans">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl p-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow ${
                        m.sender === 'user'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      {m.text}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                        <span>{m.time}</span>
                        {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-2 rounded-xl w-max">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                    Memproses via Router & Auth Engine...
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="p-2 bg-[#123B5D] border-t border-slate-700 flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan atau angka menu (misal: MENU, PROFIL, SURAT)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-[#051320] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2E7D52]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !input.trim()}
                  className="bg-[#2E7D52] hover:bg-[#236340] text-white px-3 py-2 rounded-xl font-bold flex items-center justify-center shadow disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Execution Trace Box (2 cols) */}
            <div className="lg:col-span-2 bg-[#051320] border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Execution Trace Log
                  </h4>
                  {latestTrace && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        latestTrace.status === 'PASS'
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                          : latestTrace.status === 'FAIL'
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-600'
                          : 'bg-red-900/80 text-red-300 border border-red-600'
                      }`}
                    >
                      {latestTrace.status}
                    </span>
                  )}
                </div>

                {!latestTrace ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Kirim pesan di simulator untuk melihat jejak eksekusi (Resident ID, Router, Otorisasi, Provider
                    Trapping & Audit).
                  </div>
                ) : (
                  <div className="space-y-2 mt-2 text-[11px] leading-relaxed">
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">1. Identifikasi Warga:</span>
                      <span className="font-bold text-white">
                        {latestTrace.identity.identified ? '✓ Verified Resident' : '⚠️ Unlinked Guest'} (
                        {latestTrace.identity.name})
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">2. Otorisasi Guard:</span>
                      <span
                        className={`font-bold ${
                          latestTrace.authorization.allowed ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {latestTrace.authorization.allowed ? '✓ ALLOWED' : '⛔ DENIED'}
                      </span>
                      <p className="text-[10px] text-slate-400">{latestTrace.authorization.reason}</p>
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">3. Router & Intent:</span>
                      <span className="font-bold text-amber-300">
                        {latestTrace.router.intent} ({latestTrace.router.handler})
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">4. Provider Adapter:</span>
                      <span className="font-bold text-emerald-300">
                        ✓ {latestTrace.provider.name} (Trapped In Simulator)
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">5. Audit Event Recorded:</span>
                      <span className="font-mono text-cyan-300 text-[10px]">{latestTrace.audit.logId}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero real WhatsApp network calls made during simulation mode.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATED TEST SUITE TAB */}
      {activeTab === 'TEST_SUITE' && (
        <div className="p-4 md:p-5 space-y-4 text-xs">
          <div className="bg-[#051320] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-300" /> Suite Pengujian Otomatis 16 Scenario (TC-001 - TC-016)
              </h4>
              <p className="text-slate-400 text-xs">
                Menguji alur lengkap WhatsApp Bot secara paralel termasuk otorisasi, state machine, dan audit logging.
              </p>
            </div>

            <button
              onClick={handleRunAllTests}
              disabled={isRunningTests}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
            >
              {isRunningTests ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              {isRunningTests ? 'Jalankan 16 Tests...' : 'Jalankan Seluruh Test Cases'}
            </button>
          </div>

          {/* Test Summary Banner */}
          {testSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#123B5D]/60 p-3 rounded-2xl border border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px]">Total Test Cases</span>
                <span className="font-extrabold text-lg text-white">{testSummary.total} SCENARIOS</span>
              </div>
              <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-700 text-center">
                <span className="text-emerald-300 block text-[10px]">Lulus (Passed)</span>
                <span className="font-extrabold text-lg text-emerald-400">{testSummary.passed} PASS</span>
              </div>
              <div className="bg-red-950/60 p-3 rounded-2xl border border-red-700 text-center">
                <span className="text-red-300 block text-[10px]">Gagal (Failed)</span>
                <span className="font-extrabold text-lg text-red-400">{testSummary.failed} FAIL</span>
              </div>
              <div className="bg-amber-950/60 p-3 rounded-2xl border border-amber-700 text-center">
                <span className="text-amber-300 block text-[10px]">Tingkat Kelulusan</span>
                <span className="font-extrabold text-lg text-amber-300">{testSummary.rate}%</span>
              </div>
            </div>
          )}

          {/* Test Case Matrix Table */}
          {testResults.length > 0 ? (
            <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#123B5D] text-white font-bold text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="p-3">ID Test</th>
                    <th className="p-3">Skenario</th>
                    <th className="p-3">Preset</th>
                    <th className="p-3">Input</th>
                    <th className="p-3">Otorisasi</th>
                    <th className="p-3">Expected / Actual</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#051320]">
                  {testResults.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-amber-300">{tc.id}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{tc.name}</span>
                        <span className="text-[10px] text-slate-400">{tc.description}</span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{tc.presetResident}</td>
                      <td className="p-3 font-mono text-slate-200">"{tc.inputMessage || '(KOSONG)'}"</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tc.actualResult.trace.authorization.allowed
                              ? 'bg-emerald-900/80 text-emerald-300'
                              : 'bg-red-900/80 text-red-300'
                          }`}
                        >
                          {tc.actualResult.trace.authorization.allowed ? 'ALLOWED' : 'DENIED'}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-mono">
                        <span className="text-slate-400">Exp: {tc.expectedStatus}</span>
                        <br />
                        <span className="text-white">Act: {tc.actualResult.trace.status}</span>
                      </td>
                      <td className="p-3">
                        {tc.testPassed ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold border border-emerald-600 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-red-950 text-red-400 font-bold border border-red-600 flex items-center gap-1 w-max">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#051320] p-10 rounded-2xl border border-slate-800 text-center text-slate-400">
              Klik tombol <strong className="text-white">"Jalankan Seluruh Test Cases"</strong> untuk menguji 16
              skenario simulasi WhatsApp Bot secara otomatis.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
