import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  ChatMessage,
  AuthContextPayload,
  QuickActionItem
} from '../../types/ai';
import {
  getStoredConversations,
  createNewConversation,
  deleteConversation,
  sendChatMessage,
  INITIAL_QUICK_ACTIONS,
  saveConversations
} from '../../services/aiService';
import { AIFeedbackService } from '../../services/aiFeedbackService';
import { ReasonCode } from '../../types/aiFeedback';
import { FeedbackModal } from './FeedbackModal';
import { ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { ConversationList } from './ConversationList';
import { UserRole } from '../../types/rt';
import { Bot, RefreshCw, PanelLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AIChatProps {
  currentRole: UserRole;
  userName?: string;
  userId?: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  currentRole,
  userName = 'Warga RT 07',
  userId = 'WRG-001',
  addToast
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeFeedbackTarget, setActiveFeedbackTarget] = useState<{
    msgId: string;
    question: string;
    answer: string;
    sources: string[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversations
  useEffect(() => {
    let stored = getStoredConversations();
    if (stored.length === 0) {
      const firstConv = createNewConversation(userId, 'SOP & Layanan RT');
      stored = [firstConv];
    }
    setConversations(stored);
    setActiveConvId(stored[0].id);
  }, [userId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const authContext: AuthContextPayload = {
    userId,
    role: currentRole,
    userName
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setSidebarOpen(false);
  };

  const handleNewConversation = () => {
    const newConv = createNewConversation(userId, `Percakapan ${conversations.length + 1}`);
    setConversations(getStoredConversations());
    setActiveConvId(newConv.id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    const updated = deleteConversation(id);
    setConversations(updated);
    if (updated.length > 0) {
      setActiveConvId(updated[0].id);
    } else {
      const brandNew = createNewConversation(userId, 'Percakapan Baru');
      setConversations([brandNew]);
      setActiveConvId(brandNew.id);
    }
  };

  const updateActiveConversationMessages = (newMsg: ChatMessage) => {
    setConversations((prevConvs) => {
      const updated = prevConvs.map((conv) => {
        if (conv.id === activeConvId) {
          // Keep title updated based on first user message
          let title = conv.title;
          if (conv.messages.length <= 1 && newMsg.role === 'user') {
            title = newMsg.content.substring(0, 30) + (newMsg.content.length > 30 ? '...' : '');
          }
          return {
            ...conv,
            title,
            updatedAt: new Date().toISOString(),
            messages: [...conv.messages, newMsg]
          };
        }
        return conv;
      });
      saveConversations(updated);
      return updated;
    });
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isTyping) return;
    setRateLimitError(null);

    const userMsg: ChatMessage = {
      id: `USR-${Date.now()}`,
      conversationId: activeConvId,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    updateActiveConversationMessages(userMsg);
    setIsTyping(true);

    try {
      const res = await sendChatMessage(activeConvId, userText, authContext);
      setIsTyping(false);

      if (!res.success && res.error) {
        if (res.error.includes('Batas penggunaan AI Chat')) {
          setRateLimitError(res.error);
        }

        const errMsg: ChatMessage = {
          id: `ERR-${Date.now()}`,
          conversationId: activeConvId,
          role: 'assistant',
          content: res.error || 'Maaf, Asisten SMART RT sedang mengalami gangguan sementara. Silakan coba kembali.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          error: true
        };
        updateActiveConversationMessages(errMsg);
        return;
      }

      if (res.message) {
        const assistantMsg: ChatMessage = {
          id: `AST-${Date.now()}`,
          conversationId: activeConvId,
          role: 'assistant',
          content: res.message.content,
          sources: res.message.sources,
          quickActions: res.message.quickActions || INITIAL_QUICK_ACTIONS,
          confirmationPrompt: res.message.confirmationPrompt,
          intent: res.message.intent,
          toolCalled: res.message.toolCalled,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        updateActiveConversationMessages(assistantMsg);
      }
    } catch (e) {
      setIsTyping(false);
      const fallbackMsg: ChatMessage = {
        id: `ERR-${Date.now()}`,
        conversationId: activeConvId,
        role: 'assistant',
        content: 'Maaf, Asisten SMART RT sedang mengalami gangguan sementara. Silakan coba kembali.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        error: true
      };
      updateActiveConversationMessages(fallbackMsg);
    }
  };

  const handleConfirmAction = async (prompt: NonNullable<ChatMessage['confirmationPrompt']>) => {
    setIsTyping(true);
    try {
      const res = await sendChatMessage(
        activeConvId,
        `Konfirmasi: ${prompt.title}`,
        authContext,
        {
          confirmationId: prompt.id,
          toolName: prompt.toolName,
          payload: prompt.payload
        }
      );
      setIsTyping(false);

      if (res.message) {
        const assistantMsg: ChatMessage = {
          id: `AST-CONF-${Date.now()}`,
          conversationId: activeConvId,
          role: 'assistant',
          content: res.message.content,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        updateActiveConversationMessages(assistantMsg);
        if (addToast) {
          addToast('success', 'Perintah Dikonfirmasi', 'Tindakan berhasil dieksekusi oleh RITA AI.');
        }
      }
    } catch (e) {
      setIsTyping(false);
      if (addToast) {
        addToast('error', 'Gagal Eksekusi Perintah', 'Terjadi kesalahan saat memproses konfirmasi.');
      }
    }
  };

  const handleFeedback = (msgId: string, type: 'HELPFUL' | 'UNHELPFUL') => {
    const currentConv = conversations.find((c) => c.id === activeConvId);
    if (!currentConv) return;

    const msgIdx = currentConv.messages.findIndex((m) => m.id === msgId);
    const targetMsg = currentConv.messages[msgIdx];
    let prevQuestion = 'Pertanyaan umum warga';
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (currentConv.messages[i].role === 'user') {
        prevQuestion = currentConv.messages[i].content;
        break;
      }
    }

    const sourcesList = targetMsg?.sources?.map((s) => `${s.title} (${s.version})`) || [];

    if (type === 'HELPFUL') {
      try {
        AIFeedbackService.submitFeedback({
          conversationId: activeConvId,
          messageId: msgId,
          userId,
          userRole: currentRole,
          feedbackType: 'POSITIVE',
          question: prevQuestion,
          answer: targetMsg?.content || '',
          knowledgeSources: sourcesList
        });

        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === activeConvId) {
              return {
                ...conv,
                messages: conv.messages.map((m) => (m.id === msgId ? { ...m, feedback: 'HELPFUL' } : m))
              };
            }
            return conv;
          });
          saveConversations(updated);
          return updated;
        });

        if (addToast) {
          addToast('success', 'Umpan Balik Positif', 'Terima kasih atas feedback Anda.');
        }
      } catch (e: any) {
        if (addToast) addToast('error', 'Gagal Feedback', e.message);
      }
    } else {
      setActiveFeedbackTarget({
        msgId,
        question: prevQuestion,
        answer: targetMsg?.content || '',
        sources: sourcesList
      });
      setFeedbackModalOpen(true);
    }
  };

  const handleNegativeFeedbackSubmit = (reasonCode: ReasonCode, comment: string) => {
    if (!activeFeedbackTarget) return;

    try {
      const res = AIFeedbackService.submitFeedback({
        conversationId: activeConvId,
        messageId: activeFeedbackTarget.msgId,
        userId,
        userRole: currentRole,
        feedbackType: 'NEGATIVE',
        reasonCode,
        comment,
        question: activeFeedbackTarget.question,
        answer: activeFeedbackTarget.answer,
        knowledgeSources: activeFeedbackTarget.sources
      });

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === activeConvId) {
            return {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === activeFeedbackTarget.msgId ? { ...m, feedback: 'UNHELPFUL' } : m
              )
            };
          }
          return conv;
        });
        saveConversations(updated);
        return updated;
      });

      if (addToast) {
        if (res.warningMessage) {
          addToast('info', 'Umpan Balik Disimpan', res.warningMessage);
        } else {
          addToast('info', 'Umpan Balik Disimpan', 'Terima kasih. Masukan Anda telah disimpan ke pipeline evaluasi.');
        }
      }
    } catch (e: any) {
      if (addToast) addToast('error', 'Gagal Simpan Feedback', e.message);
    }
  };

  return (
    <div className="flex h-[82vh] max-w-7xl mx-auto w-full bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      
      {/* Sidebar Desktop */}
      <div className="hidden lg:block w-72 shrink-0">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConvId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-xs"
        />
      )}

      {/* Mobile Drawer Content */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0D2A4A] shadow-2xl">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConvId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      )}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        
        {/* Header Bar */}
        <div className="bg-[#0D2A4A] text-white px-4 py-3 flex items-center justify-between border-b border-[#C89A2B]/40 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 text-slate-200 hover:bg-white/10 rounded-lg transition-colors"
              title="Buka Riwayat Percakapan"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#C89A2B] shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white tracking-wide">
                  RITA AI Web Chat
                </h2>
                <span className="bg-[#C89A2B] text-[#0D2A4A] text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  TAHAP 8G
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pengguna: <strong>{userName}</strong> ({currentRole})</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Atur ulang percakapan aktif saat ini?')) {
                handleNewConversation();
              }
            }}
            className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Sesi Baru"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Rate Limit Warning Bar */}
        {rateLimitError && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{rateLimitError}</span>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#F8FAFC]">
          {activeConversation?.messages.map((msg) => (
            <ChatMessageComponent
              key={msg.id}
              message={msg}
              onSelectQuickAction={handleSendMessage}
              onConfirmAction={handleConfirmAction}
              onFeedback={handleFeedback}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 bg-slate-100/80 border-t border-slate-200/80">
          <QuickActions actions={INITIAL_QUICK_ACTIONS} onSelectAction={handleSendMessage} disabled={isTyping} />
        </div>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

      </div>

    </div>
  );
};
