import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { Bot, User, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { ChatSources } from './ChatSources';
import { ChatActions } from './ChatActions';
import { QuickActions } from './QuickActions';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectQuickAction?: (query: string) => void;
  onConfirmAction?: (prompt: NonNullable<ChatMessageType['confirmationPrompt']>) => void;
  onFeedback?: (msgId: string, type: 'HELPFUL' | 'UNHELPFUL') => void;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  onSelectQuickAction,
  onConfirmAction,
  onFeedback
}) => {
  const isUser = message.role === 'user';

  // Helper formatting bold markdown and bullet points
  const formatText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Process bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-[#0D2A4A]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {formattedLine}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`flex items-start gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
          isUser
            ? 'bg-[#0D2A4A] text-[#E9D8B4] border-[#C89A2B]'
            : 'bg-[#2E7D52] text-white border-[#C89A2B]'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-white" />}
      </div>

      {/* Message Body Box */}
      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-[#0D2A4A] text-white rounded-tr-none'
            : message.error
            ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-none'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
        }`}
      >
        {/* Header Title for Assistant */}
        {!isUser && (
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#0D2A4A]">
              <span>RITA AI Assistant</span>
              <span className="bg-[#2E7D52] text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                RT 07
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{message.timestamp}</span>
          </div>
        )}

        {/* Content text */}
        <div className={`text-xs leading-relaxed font-normal whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-800'}`}>
          {formatText(message.content)}
        </div>

        {/* High Risk Confirmation Prompt Card */}
        {message.confirmationPrompt && onConfirmAction && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{message.confirmationPrompt.title}</span>
              <span className="ml-auto bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                {message.confirmationPrompt.riskLevel} RISK
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              {message.confirmationPrompt.description}
            </p>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <p className="font-bold text-[#0D2A4A]">Detail Draf Perintah:</p>
              <pre className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto text-slate-700 font-mono">
                {JSON.stringify(message.confirmationPrompt.payload, null, 2)}
              </pre>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onConfirmAction(message.confirmationPrompt!)}
                className="bg-[#2E7D52] hover:bg-[#236340] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Konfirmasi & Jalankan Perintah
              </button>
            </div>
          </div>
        )}

        {/* Source Cards */}
        {message.sources && message.sources.length > 0 && (
          <ChatSources sources={message.sources} />
        )}

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && onSelectQuickAction && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 mb-1">Aksi Cepat Disarankan:</p>
            <QuickActions actions={message.quickActions} onSelectAction={onSelectQuickAction} />
          </div>
        )}

        {/* User Timestamp */}
        {isUser && (
          <div className="text-[9px] text-slate-300 text-right mt-1 font-medium">
            {message.timestamp}
          </div>
        )}

        {/* Assistant Feedback Bar */}
        {!isUser && onFeedback && (
          <ChatActions
            messageId={message.id}
            content={message.content}
            feedback={message.feedback}
            onFeedback={onFeedback}
          />
        )}

      </div>

    </div>
  );
};
