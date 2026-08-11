import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none max-w-xs shadow-sm">
      <div className="w-7 h-7 rounded-lg bg-[#2E7D52] flex items-center justify-center text-white shrink-0 border border-[#C89A2B]">
        <Bot className="w-4 h-4 text-white animate-bounce" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-[#0D2A4A]">RITA AI Assistant</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-slate-500 italic">Sedang mengetik & memproses data</span>
          <span className="flex gap-0.5 ml-1">
            <span className="w-1.5 h-1.5 bg-[#2E7D52] rounded-full animate-ping" />
            <span className="w-1.5 h-1.5 bg-[#C89A2B] rounded-full animate-ping delay-100" />
            <span className="w-1.5 h-1.5 bg-[#0D2A4A] rounded-full animate-ping delay-200" />
          </span>
        </div>
      </div>
    </div>
  );
};
