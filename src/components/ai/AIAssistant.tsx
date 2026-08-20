// SMART RT 07 RW 11 GPA NGIJO - AI ASSISTANT CHAT PANEL v1.0
// Official Intelligent Service Layer UI with Grounded RAG, Tool Dispatching & Privacy

import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../types/rt';
import { AIAgentResponse, AIActorContext, AIConfirmationPayload } from '../../types/aiAgent';
import { AIAgentGateway } from '../../services/ai/aiAgentGateway';
import { AIToolRegistry } from '../../services/ai/aiToolRegistry';
import { AIMessage, ChatMessageItem } from './AIMessage';
import { Bot, Send, Trash2, ShieldCheck, Sparkles, RefreshCw, AlertCircle, Info, Shield, Layers } from 'lucide-react';

interface AIAssistantProps {
  currentRole: UserRole;
  userName?: string;
  userNik?: string;
  userFamilyId?: string;
  onOpenLetterModal?: () => void;
  onOpenFacilityModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenSopModal?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentRole,
  userName = 'Warga RT 07',
  userNik = '3507120101850001',
  userFamilyId = 'KEL-001',
  onOpenLetterModal,
  onOpenFacilityModal,
  onOpenCalendarModal,
  onOpenSopModal
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'INIT-RITA-01',
      sender: 'assistant',
      text:
        `Assalamu'alaikum & Selamat Datang 👋\n\n` +
        `Saya **RITA** (*RT Intelligent & Trusted Assistant*), asisten digital resmi **SMART RT 07 RW 11 Perum Graha Permata Anugrah (GPA) Desa Ngijo**.\n\n` +
        `Saya siap membantu Bapak/Ibu mengenai:\n` +
        `• Syarat & Status Pelayanan **Surat Pengantar RT**\n` +
        `• Informasi Kondisi & Lokasi **Fasilitas Lingkungan** (GeoBase)\n` +
        `• Jadwal Agenda & **Kegiatan Warga**\n` +
        `• Ketentuan **Tata Tertib Lingkungan & SOP RT**\n\n` +
        `*Silakan ketik pertanyaan atau pilih topik di bawah ini:*`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Cek Status Surat', action: 'cek_surat' },
        { label: 'Jadwal Kerja Bakti', action: 'cek_kegiatan' },
        { label: 'Daftar Fasilitas RT', action: 'cek_fasilitas' },
        { label: 'Jam Tutup Portal', action: 'cek_portal' },
        { label: 'Info Iuran Kas', action: 'cek_iuran' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isProcessing) return;

    const userMessage: ChatMessageItem = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsProcessing(true);

    const actorContext: AIActorContext = {
      userId: `USR-${currentRole}`,
      userName,
      role: currentRole,
      nik: userNik,
      familyId: userFamilyId,
      channel: 'WEB_CHAT',
      isAuthenticated: currentRole !== 'PUBLIC',
      sessionId: `SESS-${currentRole}-${Date.now()}`,
      requestId: `REQ-${Date.now()}`
    };

    try {
      const response: AIAgentResponse = await AIAgentGateway.processRequest(query, actorContext);

      const assistantMessage: ChatMessageItem = {
        id: `AST-${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        responsePayload: response,
        confirmationPayload: response.confirmationPrompt,
        suggestedActions: response.suggestedActions,
        isError: !response.success
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: `ERR-${Date.now()}`,
        sender: 'assistant',
        text: `Maaf, terjadi kendala saat memproses permintaan Anda: ${err.message || 'Layanan tidak merespons'}.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'cek_surat':
        handleSendMessage('Bagaimana status pengajuan surat pengantar saya?');
        break;
      case 'cek_kegiatan':
        handleSendMessage('Apa saja agenda kegiatan warga RT 07 terdekat?');
        break;
      case 'cek_fasilitas':
        handleSendMessage('Tampilkan daftar fasilitas lingkungan dan status GeoBase RT 07');
        break;
      case 'cek_portal':
        handleSendMessage('Kapan jam portal malam ditutup dan apa aturan tamu menginap?');
        break;
      case 'cek_iuran':
        handleSendMessage('Berapa iuran kas warga dan bagaimana ketentuan pembayarannya?');
        break;
      case 'open_letter_modal':
        if (onOpenLetterModal) onOpenLetterModal();
        break;
      case 'open_facility_modal':
        if (onOpenFacilityModal) onOpenFacilityModal();
        break;
      case 'open_calendar_modal':
        if (onOpenCalendarModal) onOpenCalendarModal();
        break;
      case 'open_sop_modal':
        if (onOpenSopModal) onOpenSopModal();
        break;
      default:
        handleSendMessage(action);
    }
  };

  const handleConfirmAction = async (payload: AIConfirmationPayload, confirmed: boolean) => {
    if (!confirmed) {
      setMessages((prev) => [
        ...prev,
        {
          id: `CANCEL-${Date.now()}`,
          sender: 'assistant',
          text: `Operasi **${payload.toolName}** telah dibatalkan atas permintaan Anda. Tidak ada data yang diubah.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    setIsProcessing(true);
    const actorContext: AIActorContext = {
      userId: `USR-${currentRole}`,
      userName,
      role: currentRole,
      nik: userNik,
      familyId: userFamilyId,
      channel: 'WEB_CHAT',
      isAuthenticated: currentRole !== 'PUBLIC',
      sessionId: `SESS-${currentRole}-${Date.now()}`,
      requestId: `REQ-${Date.now()}`
    };

    const execResult = await AIToolRegistry.executeTool(
      payload.toolId,
      { ...payload.parameters, _confirmed: true },
      actorContext
    );

    if (execResult.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: `EXEC-OK-${Date.now()}`,
          sender: 'assistant',
          text: `✅ **${payload.toolName} Berhasil Dikonfirmasi.**\n\nPermintaan telah dicatat dalam Audit Trail resmi SMART RT 07.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `EXEC-ERR-${Date.now()}`,
          sender: 'assistant',
          text: `❌ Gagal memproses ${payload.toolName}: ${execResult.error}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    }
    setIsProcessing(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'INIT-RITA-02',
        sender: 'assistant',
        text: 'Riwayat percakapan telah dibersihkan. Bagaimana saya dapat membantu Bapak/Ibu selanjutnya?',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Cek Status Surat', action: 'cek_surat' },
          { label: 'Jadwal Kegiatan RT', action: 'cek_kegiatan' },
          { label: 'Fasilitas & Peta RT', action: 'cek_fasilitas' }
        ]
      }
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#0D2A4A] via-[#123B5D] to-[#2E7D52] p-4 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-[#C89A2B]/40 flex items-center justify-center text-white">
            <Bot className="w-6 h-6 text-[#E9D8B4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">RITA AI Assistant</h2>
              <span className="bg-[#C89A2B] text-[#0D2A4A] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                v1.0 OFFICIAL
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Service Layer
              </span>
              <span>•</span>
              <span className="font-medium text-[#E9D8B4]">{userName} ({currentRole})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
            title="Bersihkan Percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security & Data Scope Notice Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>PDP Masking & Zero-Direct-DB Access Active.</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Fail-Closed & Rate-Limited
        </span>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]/50 space-y-2">
        {messages.map((msg) => (
          <AIMessage
            key={msg.id}
            message={msg}
            onActionClick={handleActionClick}
            onConfirmAction={handleConfirmAction}
          />
        ))}

        {isProcessing && (
          <div className="flex gap-3 my-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D2A4A] to-[#2E7D52] text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
              <Bot className="w-4 h-4 text-[#E9D8B4]" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3 text-slate-600 text-sm">
              <RefreshCw className="w-4 h-4 text-[#2E7D52] animate-spin" />
              <span>RITA sedang memeriksa sumber data terverifikasi...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tanyakan status surat, fasilitas, jadwal kegiatan, atau SOP RT..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D52] focus:border-transparent text-sm text-slate-800 placeholder-slate-400"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="bg-[#2E7D52] hover:bg-[#256843] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
