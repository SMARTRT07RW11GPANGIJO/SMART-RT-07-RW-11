import {
  Conversation,
  ChatMessage,
  AuthContextPayload,
  AIChatRequest,
  AIChatResponse,
  QuickActionItem
} from '../types/ai';
import { UserRole } from '../types/rt';

const STORAGE_KEY = 'SMART_RT_AI_CONVERSATIONS_V1';

export const INITIAL_QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'QA-1', label: '📄 Pengajuan Surat', query: 'Bagaimana cara pengajuan surat pengantar RT 07?', category: 'SURAT' },
  { id: 'QA-2', label: '💳 Iuran Saya', query: 'Cek status iuran kas warga saya', category: 'IURAN' },
  { id: 'QA-3', label: '📋 Status Pengajuan', query: 'Cek status pengajuan surat saya', category: 'STATUS' },
  { id: 'QA-4', label: '🚨 Pengaduan', query: 'Saya ingin melaporkan pengaduan fasilitas umum', category: 'PENGADUAN' },
  { id: 'QA-5', label: '📢 Informasi RT', query: 'Tampilkan informasi dan pengumuman RT 07', category: 'INFO' },
  { id: 'QA-6', label: '❓ Bantuan', query: 'Bantuan penggunaan AI Chat Assistant RT 07', category: 'BANTUAN' }
];

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

export function createNewConversation(residentId: string, initialTitle?: string): Conversation {
  const newConv: Conversation = {
    id: `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: initialTitle || 'Percakapan Baru',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    residentId,
    messages: [
      {
        id: `MSG-INIT-${Date.now()}`,
        conversationId: '',
        role: 'assistant',
        content: `Assalamu'alaikum & Selamat Datang 👋\n\nSaya **RITA** (RT Intelligent & Trusted Assistant), Asisten AI Resmi **SMART RT 07 RW 11 Perum GPA Ngijo**.\n\nAda yang dapat saya bantu mengenai administrasi, iuran, atau pengaduan warga hari ini?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        quickActions: INITIAL_QUICK_ACTIONS
      }
    ]
  };

  newConv.messages[0].conversationId = newConv.id;
  const conversations = getStoredConversations();
  conversations.unshift(newConv);
  saveConversations(conversations);
  return newConv;
}

export function deleteConversation(conversationId: string): Conversation[] {
  const conversations = getStoredConversations().filter((c) => c.id !== conversationId);
  saveConversations(conversations);
  return conversations;
}

export async function sendChatMessage(
  conversationId: string,
  userMessage: string,
  authContext: AuthContextPayload,
  confirmedAction?: {
    confirmationId: string;
    toolName: string;
    payload: Record<string, any>;
  }
): Promise<AIChatResponse> {
  const payload: AIChatRequest = {
    conversationId,
    message: userMessage,
    authContext,
    confirmedAction
  };

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        conversationId,
        error: errData.error || 'Maaf, Asisten SMART RT sedang mengalami gangguan sementara. Silakan coba kembali.'
      };
    }

    const data: AIChatResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('Network or API Error, using fallback response handler:', error);
    return {
      success: false,
      conversationId,
      error: 'Maaf, Asisten SMART RT sedang mengalami gangguan sementara. Silakan coba kembali.'
    };
  }
}
