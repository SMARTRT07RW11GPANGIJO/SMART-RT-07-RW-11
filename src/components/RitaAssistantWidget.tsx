import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, ThumbsUp, ThumbsDown, CheckCircle, Sparkles, RefreshCw, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserRole, SuratPengantar, TagihanIuran, Pengaduan, Pengumuman, AgendaKegiatan } from '../types/rt';
import { RitaMessage, processRitaChatQuery } from '../services/aiAssistantService';

interface RitaAssistantWidgetProps {
  currentRole: UserRole;
  userName?: string;
  suratList: SuratPengantar[];
  iuranList: TagihanIuran[];
  pengaduanList: Pengaduan[];
  pengumumanList: Pengumuman[];
  agendaList: AgendaKegiatan[];
  openLetterModal: () => void;
  openComplaintModal: () => void;
  openArchiveModal: () => void;
  onPublishAnnouncement?: (newAnn: Pengumuman) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const RitaAssistantWidget: React.FC<RitaAssistantWidgetProps> = ({
  currentRole,
  userName = 'Warga RT 07',
  suratList,
  iuranList,
  pengaduanList,
  pengumumanList,
  agendaList,
  openLetterModal,
  openComplaintModal,
  openArchiveModal,
  onPublishAnnouncement,
  addToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<RitaMessage[]>([
    {
      id: 'INIT-1',
      sender: 'rita',
      text: `Assalamu'alaikum & Selamat Datang 👋\n\nSaya **RITA** (RT Intelligent & Trusted Assistant), Asisten Digital **RT 07 RW 11 Perum GPA Ngijo**.\n\nBagaimana saya dapat membantu Bapak/Ibu hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: 'Cek Status Surat', action: 'cek_surat' },
        { label: 'Ajukan Surat Pengantar', action: 'open_letter_modal' },
        { label: 'Info Iuran Kas', action: 'cek_iuran' },
        { label: 'SOP & FAQ RT', action: 'faq' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: RitaMessage = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await processRitaChatQuery(query, currentRole, userName, {
        suratList,
        iuranList,
        pengaduanList,
        pengumumanList,
        agendaList
      });

      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 500);
    } catch (e) {
      setIsTyping(false);
      addToast('error', 'Gangguan RITA Assistant', 'Terjadi kesalahan saat memproses pertanyaan Anda.');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'open_letter_modal') {
      openLetterModal();
      setIsOpen(false);
    } else if (action === 'open_complaint_modal') {
      openComplaintModal();
      setIsOpen(false);
    } else if (action === 'open_archive_modal') {
      openArchiveModal();
      setIsOpen(false);
    } else if (action === 'cek_surat') {
      handleSendMessage('Cek status pengajuan surat saya');
    } else if (action === 'cek_iuran') {
      handleSendMessage('Cek status iuran kas warga saya');
    } else if (action === 'faq') {
      handleSendMessage('Bagaimana SOP pelayanan surat di RT 07?');
    } else if (action === 'info') {
      handleSendMessage('Profil dan informasi pengurus RT 07');
    }
  };

  const handleConfirmAction = (prompt: NonNullable<RitaMessage['confirmationPrompt']>) => {
    if (prompt.type === 'DRAFT_ANNOUNCEMENT' && prompt.data) {
      if (onPublishAnnouncement) {
        const newAnn: Pengumuman = {
          id_pengumuman: `ANN-${Date.now()}`,
          judul: prompt.data.judul,
          isi: prompt.data.isi,
          tanggal: new Date().toISOString().slice(0, 10),
          kategori: prompt.data.kategori || 'Kegiatan',
          status: 'PUBLISHED',
          penulis: prompt.data.penulis
        };
        onPublishAnnouncement(newAnn);
        addToast('success', 'Pengumuman Diterbitkan!', 'Draft RITA berhasil dikonfirmasi & dipublikasi ke warga.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `CONF-${Date.now()}`,
          sender: 'rita',
          text: `✅ **SUKSES**: Pengumuman "${prompt.data.judul}" telah disetujui & dipublikasikan secara resmi ke papan pengumuman RT 07 RW 11!`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleFeedback = (msgId: string, type: 'HELPFUL' | 'UNHELPFUL') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    );
    addToast('info', 'Umpan Balik Diterima', 'Terima kasih atas penilaian Anda untuk RITA Assistant.');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 bg-[#123B5D] hover:bg-[#0A2338] text-white p-3.5 rounded-2xl shadow-2xl border-2 border-[#D4A72C] flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center text-white border border-[#D4A72C]">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#123B5D] rounded-full animate-pulse" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <span className="block text-xs font-black text-[#D4A72C] leading-none tracking-wide uppercase">RITA AI</span>
            <span className="text-[11px] font-semibold text-white leading-none">Asisten Digital RT 07</span>
          </div>
        </button>
      )}

      {/* Chat Window Modal / Sheet */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[420px] h-[92vh] sm:h-[620px] bg-white sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#123B5D] text-white px-4 py-3 flex items-center justify-between border-b border-[#2E7D52]/40 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D52] border border-[#D4A72C] flex items-center justify-center relative">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#123B5D] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-wide">RITA Assistant</h3>
                  <span className="bg-[#D4A72C] text-[#123B5D] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                    AI RT 07
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">RT Intelligent & Trusted Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: `RESET-${Date.now()}`,
                      sender: 'rita',
                      text: `Percakapan telah diperbarui. Silakan ajukan pertanyaan baru kepada RITA.`,
                      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Header Role Banner */}
          <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D52]" /> User: <strong className="text-[#123B5D]">{userName}</strong> ({currentRole})
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              Secure Guard Active
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-slate-800 ${
                    m.sender === 'user'
                      ? 'bg-[#123B5D] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed font-normal">
                    {m.text}
                  </div>

                  {/* Confirmation Prompt for Drafts */}
                  {m.confirmationPrompt && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        {m.confirmationPrompt.title}
                      </div>
                      <p className="text-[11px] text-slate-600">{m.confirmationPrompt.description}</p>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                        <p className="font-bold text-[#123B5D]">{m.confirmationPrompt.data.judul}</p>
                        <p className="text-slate-600 line-clamp-3">{m.confirmationPrompt.data.isi}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmAction(m.confirmationPrompt!)}
                          className="bg-[#2E7D52] hover:bg-[#236340] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi & Publikasi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(qa.action)}
                          className="bg-[#123B5D]/10 hover:bg-[#123B5D] text-[#123B5D] hover:text-white font-semibold text-[10px] px-2.5 py-1 rounded-full transition-all border border-[#123B5D]/20"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-1.5 flex items-center justify-between text-[9px] ${
                      m.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.sender === 'rita' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback(m.id, 'HELPFUL')}
                          className={`hover:text-emerald-600 ${m.feedback === 'HELPFUL' ? 'text-emerald-600 font-bold' : ''}`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(m.id, 'UNHELPFUL')}
                          className={`hover:text-rose-600 ${m.feedback === 'UNHELPFUL' ? 'text-rose-600 font-bold' : ''}`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-2">
                <Bot className="w-4 h-4 text-[#2E7D52] animate-bounce" />
                <span>RITA sedang mengetik & memproses data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
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
                placeholder="Tanyakan pelayanan surat, SOP, iuran, dll..."
                className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#123B5D] focus:bg-white outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="bg-[#2E7D52] hover:bg-[#236340] disabled:bg-slate-300 text-white p-2 rounded-xl transition-all shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-slate-400 text-center mt-1.5 font-medium">
              RITA AI RT 07 RW 11 GPA Ngijo — Asisten Digital & Privasi Terjaga
            </p>
          </div>

        </div>
      )}
    </>
  );
};
