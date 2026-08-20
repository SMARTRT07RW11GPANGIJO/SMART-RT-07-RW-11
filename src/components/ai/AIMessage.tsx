// SMART RT 07 RW 11 GPA NGIJO - AI MESSAGE COMPONENT
// Polished Chat Bubble with Source Indicators, Confirmation Gates, and Action Triggers

import React, { useState } from 'react';
import { AIAgentResponse, AIConfirmationPayload } from '../../types/aiAgent';
import { AISourceIndicator } from './AISourceIndicator';
import { Bot, User, Copy, Check, ShieldAlert, Sparkles, HelpCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responsePayload?: AIAgentResponse;
  confirmationPayload?: AIConfirmationPayload;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  isError?: boolean;
}

interface AIMessageProps {
  message: ChatMessageItem;
  onActionClick?: (action: string, payload?: any) => void;
  onConfirmAction?: (payload: AIConfirmationPayload, confirmed: boolean) => void;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message, onActionClick, onConfirmAction }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.sender === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper formatting for bold, lists, and code spans
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          // Render bullet list
          if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#2E7D52] font-black text-base leading-none">•</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
              </div>
            );
          }

          // Render numbered list
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#0D2A4A] font-bold text-xs bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
              </div>
            );
          }

          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-[#0D2A4A] px-1.5 py-0.5 rounded-md font-mono text-xs font-semibold">$1</code>');
  };

  return (
    <div className={`flex gap-3 my-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {/* Avatar for Assistant */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D2A4A] to-[#2E7D52] border border-[#C89A2B]/40 text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
          <Bot className="w-4 h-4 text-[#E9D8B4]" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all shadow-xs relative ${
          isAssistant
            ? message.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-white border border-slate-200 text-slate-800'
            : 'bg-[#0D2A4A] text-white border border-[#0D2A4A]'
        }`}
      >
        {/* Header line for Assistant message */}
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="text-[#0D2A4A] font-bold">RITA Assistant</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                INTELLIGENT LAYER v1.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">{message.timestamp}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
                title="Salin Pesan"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Message Body */}
        {renderFormattedText(message.text)}

        {/* Source Citations */}
        {isAssistant && message.responsePayload?.sources && (
          <AISourceIndicator sources={message.responsePayload.sources} />
        )}

        {/* Two-Step Mutation Confirmation Prompt (Section 8 & 21) */}
        {message.confirmationPayload && onConfirmAction && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{message.confirmationPayload.title}</span>
            </div>
            <p className="mt-1 text-xs text-amber-900 leading-relaxed font-normal">
              {message.confirmationPayload.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onConfirmAction(message.confirmationPayload!, true)}
                className="bg-[#2E7D52] hover:bg-[#256843] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Setujui & Proses
              </button>
              <button
                onClick={() => onConfirmAction(message.confirmationPayload!, false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        )}

        {/* Suggested Quick Actions */}
        {isAssistant && message.suggestedActions && message.suggestedActions.length > 0 && onActionClick && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
            {message.suggestedActions.map((act, i) => (
              <button
                key={i}
                onClick={() => onActionClick(act.action, act.payload)}
                className="bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp for User message */}
        {!isAssistant && (
          <div className="mt-1.5 text-right text-[10px] text-slate-300 font-mono">
            {message.timestamp}
          </div>
        )}
      </div>

      {/* Avatar for User */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
          <User className="w-4 h-4 text-slate-200" />
        </div>
      )}
    </div>
  );
};
