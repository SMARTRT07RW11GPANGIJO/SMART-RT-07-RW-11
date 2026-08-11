export type IntentType =
  | 'KNOWLEDGE_QUERY'
  | 'PERSONAL_PROFILE_QUERY'
  | 'PERSONAL_PAYMENT_QUERY'
  | 'PERSONAL_LETTER_QUERY'
  | 'PERSONAL_COMPLAINT_QUERY'
  | 'CREATE_COMPLAINT'
  | 'CREATE_LETTER'
  | 'ANNOUNCEMENT_QUERY'
  | 'GENERAL_CHAT';

export interface SourceCard {
  title: string;
  version: string;
  category: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'PUBLISHED';
  snippet?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon?: string;
  query: string;
  category: 'SURAT' | 'IURAN' | 'STATUS' | 'PENGADUAN' | 'INFO' | 'BANTUAN';
}

export interface ConfirmationPrompt {
  id: string;
  toolName: string;
  title: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  payload: Record<string, any>;
  confirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: SourceCard[];
  quickActions?: QuickActionItem[];
  confirmationPrompt?: ConfirmationPrompt;
  feedback?: 'HELPFUL' | 'UNHELPFUL';
  intent?: IntentType;
  toolCalled?: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  residentId: string;
}

export interface AuthContextPayload {
  userId: string;
  role: 'PUBLIC' | 'WARGA' | 'PENGURUS' | 'KETUA_RT' | 'ADMIN';
  userName: string;
  sessionId?: string;
}

export interface AIChatRequest {
  conversationId?: string;
  message: string;
  authContext?: AuthContextPayload;
  confirmedAction?: {
    confirmationId: string;
    toolName: string;
    payload: Record<string, any>;
  };
}

export interface AIChatResponse {
  success: boolean;
  conversationId: string;
  message?: {
    role: 'assistant';
    content: string;
    sources?: SourceCard[];
    quickActions?: QuickActionItem[];
    confirmationPrompt?: ConfirmationPrompt;
    intent?: IntentType;
    toolCalled?: string;
  };
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetInSeconds: number;
  };
}

export type AIAuditEventType =
  | 'AI_CHAT_STARTED'
  | 'AI_MESSAGE_SENT'
  | 'AI_RESPONSE_GENERATED'
  | 'AI_KNOWLEDGE_USED'
  | 'AI_TOOL_CALLED'
  | 'AI_TOOL_DENIED'
  | 'AI_ACTION_CONFIRMED'
  | 'AI_ACTION_CANCELLED'
  | 'AI_ERROR'
  | 'AI_RATE_LIMITED';

export interface AIAuditLogRecord {
  id: string;
  timestamp: string;
  event: AIAuditEventType;
  userId: string;
  role: string;
  conversationId?: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'WARNING' | 'ERROR';
}
